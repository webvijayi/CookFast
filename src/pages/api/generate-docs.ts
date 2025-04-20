/* eslint-disable */
// Timestamp: ${new Date().toISOString()} - Improved API implementation with error handling and response processing
// Timestamp: ${new Date().toISOString()} - Updated Anthropic model to 3.7 Sonnet and adjusted token limit
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages'; // Import MessageStreamEvent

// For environments that have issues with the native fetch implementation
import fetch from 'cross-fetch';
global.fetch = fetch;

// Add custom type for Gemini response part
type GeminiPart = string | { text?: string; [key: string]: any };

// Default timeout for API requests (30 seconds)
const API_TIMEOUT_MS = 120000; // 2 minutes

// Interfaces
interface ProjectDetails {
  projectName: string;
  projectType: string;
  projectGoal: string;
  features: string;
  techStack: string;
}

interface DocumentSelection {
  requirements: boolean;
  frontendGuidelines: boolean;
  backendStructure: boolean;
  appFlow: boolean;
  techStackDoc: boolean;
  systemPrompts: boolean;
  fileStructure: boolean;
}

interface DocumentSection {
  title: string;
  content: string;
}

interface GenerateDocsRequestBody {
  projectDetails: ProjectDetails;
  selectedDocs: DocumentSelection;
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
}

interface SuccessResponse {
  message: string;
  content: string;
  sections?: DocumentSection[];
  debug?: {
    provider: string;
    model: string;
    timestamp: string;
    contentLength: number;
    processingTimeMs: number;
    sectionsCount?: number;
    tokensUsed?: {
      input: number;
      output: number;
    };
  };
}

interface ErrorResponse {
  message: string;
  content: string;
  error: string;
}

// Constants - Updated with current model versions
const GEMINI_MODELS = {
  PRIMARY: "gemini-2.5-pro-exp-03-25",
  FALLBACK: "gemini-2.5-pro-preview-03-25"
};
const OPENAI_MODEL = "gpt-4.1"; // Updated from gpt-4o to gpt-4.1
const ANTHROPIC_MODEL = "claude-3-7-sonnet-20250219"; // Claude 3.7 Sonnet

// Safety settings for Gemini
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Token limits per provider - Updated with latest specifications
const TOKEN_LIMITS = {
  gemini: 65536, // Gemini 2.5 Pro output token limit (input limit: 1,048,576)
  openai: 16384, // GPT-4.1 output token limit (input limit: 1,047,576)
  anthropic: 64000 // Claude 3.7 Sonnet output token limit (input limit: 200,000)
};

// Helper function to create a timeout promise
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Create a simple rate limiter
const rateLimiter = {
  // Store for tracking request counts
  store: new Map<string, { count: number, resetTime: number }>(),
  
  // Limit function to check and update rate limits
  limit: async (key: string, maxRequests: number = 5, windowMs: number = 60000): Promise<{ success: boolean }> => {
    const now = Date.now();
    const record = rateLimiter.store.get(key) || { count: 0, resetTime: now + windowMs };
    
    // Reset count if window has expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }
    
    // Check if limit is reached
    if (record.count >= maxRequests) {
      return { success: false };
    }
    
    // Increment count and update store
    record.count++;
    rateLimiter.store.set(key, record);
    
    return { success: true };
  }
};

// Helper function to parse markdown content into sections
function parseContentToSections(content: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  if (!content || !content.trim()) return sections;

  // Split the content by lines for processing
  const lines = content.split('\n');
  let currentSection: DocumentSection | null = null;
  let parsingSubsection = false;
  
  // First pass: identify all major sections (level 1 and 2 headings)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; // Keep original spacing for content
    const trimmedLine = line.trim();
    
    // Match headings of any level (# Heading, ## Heading, etc.)
    const headingMatch = trimmedLine.match(/^(#+)\s+(.*)/);
    
    if (headingMatch && headingMatch[1] && headingMatch[2]) {
      const level = headingMatch[1].length; // # -> 1, ## -> 2, etc.
      const title = headingMatch[2].trim();
      
      // For level 1 and 2 headings, create new sections
      if (level <= 2) {
        // If we have a current section, save it before starting a new one
        if (currentSection && currentSection.title && currentSection.content.trim()) {
          sections.push({
            title: currentSection.title,
            content: currentSection.content.trim()
          });
        }
        
        // Start a new section with this heading
        currentSection = {
          title: title,
          content: '' // Will be populated with subsequent content
        };
        
        parsingSubsection = false;
      } else if (currentSection) {
        // For level 3+ headings, include them in the content of the current section
        currentSection.content += line + '\n';
        parsingSubsection = true;
      }
    } else if (currentSection) {
      // Add non-heading lines to the current section content
      currentSection.content += line + '\n';
    } else if (trimmedLine && !headingMatch) {
      // Content appears before any heading - create a default section
      currentSection = {
        title: "Introduction",
        content: line + '\n'
      };
    }
  }
  
  // Don't forget to add the last section if it exists
  if (currentSection && currentSection.title && currentSection.content.trim()) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.trim()
    });
  }
  
  // Second pass: look for document type markers in the parsed sections
  // This helps identify sections that might be specific document types 
  const documentTypeKeywords = {
    'requirements': ['requirements', 'functional requirements', 'non-functional requirements'],
    'frontend': ['frontend', 'ui/ux', 'component', 'style guide'],
    'backend': ['backend', 'api', 'server', 'database'],
    'flow': ['flow', 'sequence', 'journey', 'process'],
    'tech stack': ['tech stack', 'technology', 'stack', 'infrastructure'],
    'system prompts': ['system prompt', 'ai feature', 'prompt engineering'],
    'file structure': ['file structure', 'project organization', 'folder structure']
  };
  
  // If we found no sections with headings but have content, create a single section
  if (sections.length === 0 && content.trim()) {
    // Try to determine what type of content this is based on keywords
    let bestTitle = "Generated Documentation";
    let bestMatchCount = 0;
    
    for (const [docType, keywords] of Object.entries(documentTypeKeywords)) {
      const matchCount = keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = content.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestTitle = docType.charAt(0).toUpperCase() + docType.slice(1);
      }
    }
    
    sections.push({
      title: bestTitle,
      content: content.trim()
    });
  }
  
  return sections;
}

// Build prompt function
function buildPrompt(projectDetails: ProjectDetails, selectedDocs: DocumentSelection): string {
  // Selected document types
  const selectedDocTypes = Object.entries(selectedDocs)
    .filter(([_, isSelected]) => isSelected)
    .map(([docType, _]) => docType);
  
  // Log selected document types for debugging
  console.log('Building prompt with selected document types:', selectedDocTypes);
  
  // Format the project details for the prompt
  const projectName = projectDetails.projectName?.trim() || 'Unnamed Project';
  const projectType = projectDetails.projectType?.trim() || 'Web Application';
  const projectGoal = projectDetails.projectGoal?.trim() || 'No goal specified';
  const features = projectDetails.features?.trim() || 'No specific features provided';
  const techStack = projectDetails.techStack?.trim() || 'No specific tech stack provided';
  
  // Count the number of document types requested to better guide the model
  const requestedDocCount = selectedDocTypes.length;
  
  // If no documents selected, use requirements as default
  if (requestedDocCount === 0) {
    console.warn('No document types selected, defaulting to requirements');
    selectedDocTypes.push('requirements');
  }
  
  // Build a comprehensive prompt
  const prompt = `
You are a senior software architect specializing in creating detailed documentation.

# PROJECT DETAILS
- Project Name: ${projectName}
- Project Type: ${projectType}
- Project Goal: ${projectGoal}
- Key Features: ${features}
- Tech Stack: ${techStack}

# INSTRUCTIONS
Create comprehensive, professional documentation for the project described above.
**IMPORTANT:** I need documentation for **ALL ${requestedDocCount} document types listed below**. DO NOT skip any of them, and make sure each is FULLY DEVELOPED with substantial content.

⚠️ **CRITICAL REQUIREMENTS:**
1. Generate COMPLETE documentation with detailed content for EACH section
2. Cover ALL ${requestedDocCount} requested document types with EQUAL depth and detail
3. Use proper markdown formatting with headings (# for main sections, ## for subsections)
4. Include detailed explanations, code examples, and specific guidance where applicable
5. DO NOT provide outline-only content or section skeletons
6. Make EVERY requested document type EQUALLY comprehensive and detailed

Focus on creating detailed Markdown documents for **ALL** of the following sections:

${selectedDocTypes.includes('requirements') ? `
# Requirements Document

## Functional Requirements
Detail each requirement with explanations. E.g., For User Authentication, describe the login process, password requirements, session handling, etc.

## Non-Functional Requirements
Elaborate on performance goals (e.g., target load times, concurrent users), security measures (e.g., specific vulnerability protections, data encryption), and scalability considerations (e.g., potential bottlenecks, scaling strategies).

## Prioritization
Briefly justify the prioritization (Must-Have, Should-Have, Nice-to-Have).

## Acceptance Criteria
Write specific, measurable criteria for key features.
` : ''}

${selectedDocTypes.includes('frontendGuidelines') ? `
# Frontend Guidelines

## UI/UX Principles & Style Guide
Describe the design philosophy, target audience considerations, and key style elements (color palette usage, typography hierarchy, spacing rules, iconography style).

## Component Architecture
Explain the chosen component pattern (e.g., Atomic Design, simple functional components), folder structure for components, and conventions for component props and state.

## State Management
Detail the chosen approach (e.g., Context API, Redux, Zustand), explain why it was chosen, and provide examples of typical usage patterns.

## Responsive Design
Explain the breakpoints and how layouts adapt. Provide examples if necessary.

## Accessibility (A11y)
List key WCAG guidelines being followed and provide specific examples (e.g., ARIA attributes usage, keyboard navigation focus management).

## Testing Strategy
Describe the types of tests (unit, integration, E2E), tools used, and target coverage.
` : ''}

${selectedDocTypes.includes('backendStructure') ? `
# Backend Structure

## API Design
Describe the API style (e.g., REST, GraphQL). Detail key resource endpoints with HTTP methods, request/response formats (provide JSON examples), and authentication requirements.

## Database Schema
Explain the collections/tables, fields, data types, relationships, and indexing strategies. Provide schema definition snippets if possible.

## Authentication/Authorization
Detail the mechanism (e.g., JWT, OAuth), token handling, password hashing, and role/permission implementation.

## Data Models
Explain the core data structures used within the application logic.

## Middleware
Describe the purpose and order of key middleware (logging, error handling, auth, validation).

## Server Architecture
Explain the deployment model (e.g., Monolith, Microservices), hosting environment considerations, and key infrastructure components.
` : ''}

${selectedDocTypes.includes('appFlow') ? `
# Application Flow

## User Journeys
Describe primary user paths step-by-step in narrative form (e.g., "A new user visits the site, navigates to services, selects 'Web Development', reads the details, and clicks 'Contact Us'...").

## Sequence Diagrams
Provide key interaction flows using Mermaid syntax (\`\`\`mermaid\\nsequenceDiagram...\\n\`\`\`).

## Integration Points
Detail how major components (frontend, backend, database, external services) interact for key features.

## Error Handling
Describe common error scenarios and how they are handled and communicated to the user/system.

## Data Flow
Explain how data moves through the system for critical operations (e.g., user registration, order processing).
` : ''}

${selectedDocTypes.includes('techStackDoc') ? `
# Technology Stack Documentation

## Technology Explanations
Provide a paragraph or two for each major technology (frameworks, libraries, databases, services) explaining *why* it was chosen and its role in the project.

## Justification
Summarize the overall rationale for the stack choices.

## Infrastructure
Detail hosting, database, CDN, CI/CD pipeline requirements and setup.

## Dev Environment
Explain how to set up the local development environment (dependencies, commands, configurations).

## External Services
List integrations, their purpose, and configuration points.
` : ''}

${selectedDocTypes.includes('systemPrompts') ? `
# System Prompts

## AI Feature Prompts
List the exact system prompts used for AI features.

## Edge Case Handling
Describe how the AI handles unclear input, errors, or unexpected scenarios.

## Prompt Engineering Guidelines
Provide best practices used for crafting effective prompts for this project.

## AI Integration
Detail how the AI service is called and how its responses are processed.
` : ''}

${selectedDocTypes.includes('fileStructure') ? `
# File Structure

## Project Organization
Explain the reasoning behind the top-level directory structure.

## Folder Structure
Detail the purpose of key subdirectories within frontend and backend.

## Key Files
Describe the role of critical files (e.g., entry points, main configuration, routing).

## Naming Conventions
List specific naming conventions for files, variables, functions, classes, components, etc.

## Configuration
Explain key configuration files and their settings.
` : ''}

# FORMAT REQUIREMENTS
- Create a well-structured Markdown document with clear section headings
- Use proper heading hierarchy (# for main sections, ## for subsections, etc.)
- **Write detailed paragraphs.** Avoid overly simplistic bullet points where narrative explanation is better
- Include tables for structured data where appropriate
- Add code examples where helpful (using proper markdown code blocks)
- Make the documentation comprehensive, practical, and easy to understand
- Focus on clarity and actionability
- Make sure ALL requested document types are included and EQUALLY detailed

⚠️ REMEMBER: GENERATE ALL ${requestedDocCount} DOCUMENT TYPES REQUESTED ABOVE - DO NOT SKIP ANY. Make sure each document type has substantial, detailed content and not just headings.

Start now with generating complete documentation for all ${requestedDocCount} document types requested.
`;

  return prompt;
}

// Helper Function to Parse Markdown into Sections
function parseMarkdownSections(markdown: string): DocumentSection[] {
  if (!markdown) return [];
  
  const sections: DocumentSection[] = [];
  const lines = markdown.split('\n');
  
  let currentTitle = "General";
  let currentContent = "";
  let hasStartedContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
  
    // Check for top-level headings (# Heading)
    if (line.trim().startsWith('# ')) {
      // If we already have content, save the previous section
      if (hasStartedContent) {
        sections.push({
          title: currentTitle,
          content: currentContent.trim()
        });
    }
    
      // Start a new section
      currentTitle = line.trim().replace(/^#\s+/, '');
      currentContent = "";
      hasStartedContent = true;
    } else {
      // Add to current content (including the line)
      currentContent += line + '\n';
    }
  }
  
  // Add the last section if it exists
  if (hasStartedContent) {
    sections.push({
      title: currentTitle,
      content: currentContent.trim()
    });
  }
  
  return sections;
}

// Function to validate API key format (basic check)
function validateApiKey(provider: string, apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    console.error(`API key validation failed: Key is ${apiKey ? 'empty string' : 'null or undefined'}`);
    return false;
  }
  
  const trimmedKey = apiKey.trim();
  
  switch (provider) {
    case 'openai':
      const isValid = trimmedKey.startsWith('sk-');
      if (!isValid) {
        console.error('OpenAI key validation failed: Key does not start with "sk-"');
      }
      return isValid;
    case 'anthropic':
      // Anthropic keys don't have a consistent prefix, just check it's not empty
      return trimmedKey.length > 0;
    case 'gemini':
      // Gemini keys don't have a consistent prefix, just check it's not empty
      return trimmedKey.length > 0;
    default:
      console.error(`API key validation failed: Unknown provider ${provider}`);
      return false;
  }
}

// Define response type
type ApiResponse = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Debug logging
  console.log('Request body:', {
    projectDetails: req.body?.projectDetails ? 'Present' : 'Missing',
    selectedDocs: req.body?.selectedDocs ? 'Present' : 'Missing',
    provider: req.body?.provider || 'Not specified',
    apiKey: req.body?.apiKey ? 'Present' : 'Missing'
  });

  // More detailed logging for selectedDocs
  if (req.body?.selectedDocs) {
    const selectedCount = Object.values(req.body.selectedDocs).filter(Boolean).length;
    console.log('Selected document types:', {
      count: selectedCount,
      types: Object.entries(req.body.selectedDocs)
        .filter(([_, value]) => Boolean(value))
        .map(([key]) => key)
    });
    
    // Log selected document types to help with debugging
    console.log('Building prompt with selected document types:', 
      Object.entries(req.body.selectedDocs)
        .filter(([_, value]) => Boolean(value))
        .map(([key]) => key)
    );
  }
  
  // Get requestId for tracking
  const { requestId } = req.body || {};
  const generationId = requestId || `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // For background functions in production, immediately return an accepted response
  // This prevents the function from timing out when running as a background function
  if (process.env.NETLIFY_DEV !== 'true' && process.env.NETLIFY_FUNCTIONS_BACKGROUND === 'true') {
    // We're in production and running as a background function
    console.log(`Processing request ${generationId} in background mode`);
    
    // Return 202 Accepted status for background processing
    res.status(202).json({ 
      status: 'accepted',
      message: 'Request accepted and is being processed in the background',
      requestId: generationId,
      note: 'This request is being processed in the background and may take several minutes. Check back soon for your completed documents.'
    });
    
    // Don't return - continue processing in the background
  }

  try {
    // Rate limiting (5 requests per minute per IP)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const key = `generate-docs-${ip}`;
    const rateLimit = await rateLimiter.limit(key);
    if (!rateLimit.success) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    // Destructure and validate request body
    const { projectDetails, selectedDocs, provider = 'openai', apiKey } = req.body;

    if (!projectDetails || !selectedDocs) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Validate at least one document type is selected
    const hasSelectedDoc = Object.values(selectedDocs).some(Boolean);
    if (!hasSelectedDoc) {
      console.warn('No document types selected in request');
      return res.status(400).json({ 
        error: 'No document types selected', 
        details: 'Please select at least one document type to generate'
      });
    }

    // Track the actual provider and model we're using
    let actualProvider = provider;
    let modelUsed = '';
    let finalUsage: Anthropic.Message['usage'] | undefined;

    // Determine what model to use based on the provider
    switch (provider.toLowerCase()) {
      case 'openai':
        modelUsed = 'gpt-4o';
        break;
      case 'anthropic':
        modelUsed = ANTHROPIC_MODEL;
        break;
      case 'gemini':
        modelUsed = GEMINI_MODELS.PRIMARY;
        break;
      default:
        modelUsed = 'gpt-4o'; // Default to OpenAI
        actualProvider = 'openai';
    }

    const startTime = Date.now();
    let generatedContent = '';
    let apiError = null;

    try {
      // Background processing - log status for debugging
      console.log(`Preparing to generate with ${provider} using model ${modelUsed}`);
      
      
      if (provider === 'openai') {
        // OpenAI implementation
        if (!apiKey && !process.env.OPENAI_API_KEY) {
          console.error(`OpenAI API key is required for request ${generationId}`);
          
          return res.status(400).json({ error: 'OpenAI API key is required' });
        }
        
        // Background processing - log progress
        console.log(`Building prompt and sending to OpenAI for request ${generationId}`);
        
        
        const openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
        const prompt = buildPrompt(projectDetails, selectedDocs);
        
        // Background processing - log progress
        console.log(`Generating content with OpenAI for request ${generationId}`);
        
        
        const response = await openai.chat.completions.create({
          model: modelUsed,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: TOKEN_LIMITS.openai,
        });
        generatedContent = response.choices[0]?.message?.content || '';
      } else if (provider === 'anthropic') {
        // Anthropic implementation
        if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
          return res.status(400).json({ error: 'Anthropic API key is required' });
        }
        
        const anthropic = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
        const prompt = buildPrompt(projectDetails, selectedDocs);

        // Create a system prompt for better context
        const systemPrompt = `You are a senior software architect specializing in creating detailed documentation.
Your task is to generate comprehensive project documentation based on the user's request.
Each document section should be complete with detailed information, not just headings or outlines.
Format your response as markdown with proper headings (# for main sections, ## for subsections).
The documentation MUST include ALL requested document types, and each type should be equally detailed.`;

        // Validate prompt length against token limits before making the call
        // (Simple check - a more accurate tokenizer would be better)
        if (prompt.length / 3.5 > TOKEN_LIMITS.anthropic * 0.7) { // More accurate estimate, leave 30% buffer
          throw new Error(`Prompt exceeds estimated token limit for ${provider}. Please shorten the input.`);
        }

        console.log(`Calling Anthropic (${modelUsed}) with prompt (length: ${prompt.length})...`);

        // Use streaming approach for Anthropic to avoid timeout errors
        try {
          let fullContent = '';
          const streamResponse = await anthropic.messages.create({
            model: modelUsed,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }],
            temperature: 1.0,
            max_tokens: TOKEN_LIMITS.anthropic,
            // Add thinking parameter to improve reasoning capabilities
            thinking: {
              type: "enabled",
              budget_tokens: 2000
            },
            stream: true
          });

          // Process stream to collect the response
          for await (const chunk of streamResponse) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              fullContent += chunk.delta.text;
            }
          }
          
          // Create a response object that matches the expected format
          generatedContent = fullContent;
          
          console.log(`Anthropic request successful (length: ${generatedContent.length}).`);
        } catch (error) {
          console.error('Error in Anthropic API call:', error);
          throw error; // Re-throw to be caught by the outer catch block
        }

      } else if (provider === 'gemini') {
        // Google Gemini implementation with fallback
        if (!apiKey && !process.env.GEMINI_API_KEY) {
          console.error(`Gemini API key is required for request ${generationId}`);
          
          return res.status(400).json({ error: 'Gemini API key is required' });
        }
        
        // Background processing - log progress
        console.log(`Building prompt and preparing Gemini request for ${generationId}`);
        
        
        const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY || '');
        const prompt = buildPrompt(projectDetails, selectedDocs);
        
        // Try with primary model first
        try {
          modelUsed = GEMINI_MODELS.PRIMARY;
          console.log(`Attempting with primary Gemini model: ${modelUsed}`);
          
          // Background processing - log progress
          console.log(`Generating content with Gemini model: ${modelUsed} for request ${generationId}`);
          
          
          const model = genAI.getGenerativeModel({ 
            model: modelUsed,
            safetySettings: safetySettings,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: TOKEN_LIMITS.gemini
            }
          });
          
          // This is the critical operation that was timing out previously
          // Now it will continue in the background function with plenty of time
          const result = await withTimeout(
            model.generateContent({ 
              contents: [{ role: 'user', parts: [{ text: prompt }] }] 
            }),
            // Extended timeout of 10 minutes for background processing
            600000,
            `Gemini API request timed out after 10 minutes`
          );
          
          // Background processing - log progress
          console.log(`Content generated with Gemini, now processing response for request ${generationId}`);
          
          
          // Safely extract text
          try {
            generatedContent = result.response.text();
          } catch (e) {
            console.warn("Gemini response.text() failed, trying manual extraction.", e);
            generatedContent = result.response?.candidates?.[0]?.content?.parts?.map(part => part.text).join('') || '';
          }
          
        } catch (primaryModelError) {
          // If primary model fails, try fallback model
          console.warn(`Primary Gemini model failed: ${(primaryModelError as Error).message}. Trying fallback model.`);
          
          // Background processing - log fallback attempt
          console.log(`Primary Gemini model failed for request ${generationId}, trying fallback model: ${GEMINI_MODELS.FALLBACK}`);
          console.error(`Error was: ${(primaryModelError as Error).message}`);
          
          
          try {
            modelUsed = GEMINI_MODELS.FALLBACK;
            console.log(`Attempting with fallback Gemini model: ${modelUsed}`);
            
            const fallbackModel = genAI.getGenerativeModel({ 
              model: modelUsed,
              safetySettings: safetySettings,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: TOKEN_LIMITS.gemini
              }
            });
            
            // Background processing - log fallback progress
            console.log(`Generating content with fallback Gemini model: ${modelUsed} for request ${generationId}`);
            
            
            // Extended timeout for fallback model
            const fallbackResult = await withTimeout(
              fallbackModel.generateContent({ 
                contents: [{ role: 'user', parts: [{ text: prompt }] }] 
              }),
              // Extended timeout of 10 minutes for background processing
              600000,
              `Gemini fallback API request timed out after 10 minutes`
            );
            
            // Background processing - log fallback progress
            console.log(`Content generated with fallback Gemini model for request ${generationId}, now processing response`);
            
            
            // Safely extract text
            try {
              generatedContent = fallbackResult.response.text();
            } catch (e) {
              console.warn("Gemini fallback response.text() failed, trying manual extraction.", e);
              generatedContent = fallbackResult.response?.candidates?.[0]?.content?.parts?.map(part => part.text).join('') || '';
            }
            
          } catch (fallbackModelError) {
            // If both models fail, throw the fallback error
            console.error(`Fallback Gemini model also failed: ${(fallbackModelError as Error).message}`);
            
            // Background processing - log both models failed
            console.error(`Both Gemini models failed for request ${generationId}. Error: ${(fallbackModelError as Error).message}`);
            
            
            throw fallbackModelError;
          }
        }
      } else {
        return res.status(400).json({ error: 'Unsupported provider' });
      }
    } catch (error) {
      console.error(`Error generating content with ${provider}:`, error);
      apiError = error; // Store the error to return details later
      // Set a generic error message, specific details might be sensitive
      generatedContent = ''; // Ensure content is empty on error
      // Determine appropriate status code
      let statusCode = 500;
      const errorMessage = (error as Error).message?.toLowerCase();
      if (errorMessage?.includes('api key') || errorMessage?.includes('authentication')) {
        statusCode = 401;
      } else if (errorMessage?.includes('quota') || errorMessage?.includes('limit')) {
        statusCode = 429;
      } else if (errorMessage?.includes('not found') || errorMessage?.includes('invalid model')) {
         statusCode = 400;
      }
      // Do not return immediately, proceed to send response outside this block
       return res.status(statusCode).json({ 
         error: `Failed to generate documentation using ${provider}.`,
         details: `API Error: ${(error as Error).message}` // Provide clearer error details
       });
    }

    // Check if content generation failed silently or returned empty
    if (!generatedContent && !apiError) {
      console.warn(`${provider} returned empty content.`);
      return res.status(500).json({ 
          error: 'AI provider returned empty content.',
          details: 'The AI model generated an empty response. Try adjusting your project details or selected documents.' 
      });
    }
    
    // If an API error occurred previously, it would have already returned a response.
    // This check is redundant due to the return inside the catch block above but kept for clarity.
    // if (apiError) { 
    //    // Response already sent in the catch block
    //    return; 
    // }

    const processingTime = Date.now() - startTime;
    const sections = parseContentToSections(generatedContent);

    // Return success response
    return res.status(200).json({
      message: 'Documentation generated successfully',
      content: generatedContent,
      sections: sections,
      debug: {
        provider: actualProvider,
        model: modelUsed,
        timestamp: new Date().toISOString(),
        contentLength: generatedContent.length,
        processingTimeMs: processingTime,
        sectionsCount: sections.length,
        tokensUsed: finalUsage && {
          input: finalUsage.input_tokens,
          output: finalUsage.output_tokens,
          // Include cache tokens if needed, though often 0 for basic streaming
          cache_creation_input: finalUsage.cache_creation_input_tokens,
          cache_read_input: finalUsage.cache_read_input_tokens,
        }
      }
    });

  } catch (outerError) {
    // Catch any unexpected errors in the main handler logic
    console.error('Unhandled error in generate-docs handler:', outerError);
    return res.status(500).json({ 
      error: 'An unexpected server error occurred.', 
      details: (outerError as Error).message 
    });
  }
}

