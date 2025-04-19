/* eslint-disable */
// Timestamp: ${new Date().toISOString()} - Improved API implementation with error handling and response processing
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

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
  };
}

interface ErrorResponse {
  message: string;
  content: string;
  error: string;
}

// Constants - Updated with current model versions
const GEMINI_MODEL = "gemini-2.5-pro-exp-03-25"; // Using exactly the model shown on the frontend
const OPENAI_MODEL = "gpt-4o"; // Current OpenAI model
const ANTHROPIC_MODEL = "claude-3-7-sonnet-20250219"; // Updated to Claude 3.7 Sonnet

// Safety settings for Gemini
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Token limits per provider (Maintaining higher limits as we've increased the timeout)
const TOKEN_LIMITS = {
  gemini: 30000,    // Increased for more comprehensive documents
  openai: 16000,    // For gpt-4o
  anthropic: 100000  // Claude 3.7 Sonnet can handle even larger outputs
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
  if (!content) return sections;

  const lines = content.split('\n');
  let currentSection: DocumentSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; // Keep original spacing for content, trim only for matching
    const trimmedLine = line.trim();

    // Match H1 or H2 headings (# Heading, ## Heading)
    const match = trimmedLine.match(/^(#+)\s+(.*)/);
    
    if (match && match[1] && match[2]) { // Found a heading
      const level = match[1].length; // # -> 1, ## -> 2
      const title = match[2].trim();

      // For simplicity, treat H1 and H2 as top-level sections
      if (level <= 2) {
        // Save the previous section if it exists and has content
        if (currentSection && currentSection.content.trim()) {
          sections.push({ ...currentSection, content: currentSection.content.trim() });
        }
        // Start a new section
        currentSection = { title: title, content: '' }; // Start content empty
      } else if (currentSection) {
        // Treat lower-level headings as content of the current section
        currentSection.content += line + '\n';
      }
    } else if (currentSection) {
      // Add non-heading lines to the current section's content
      currentSection.content += line + '\n';
    } else {
      // Content before the first heading (should ideally not happen with good prompts)
      // If needed, could collect this into a default "Introduction" section
      // console.warn("Content found before first heading:", line);
    }
  }

  // Add the last section if it exists and has content
  if (currentSection && currentSection.content.trim()) {
    sections.push({ ...currentSection, content: currentSection.content.trim() });
  }

  // If no sections were parsed but content exists, return a single section
  if (sections.length === 0 && content.trim()) {
    console.warn("Failed to parse sections, returning content as a single section.");
    sections.push({ title: "Generated Documentation", content: content.trim() });
  }

  return sections;
}

// Build prompt function
function buildPrompt(projectDetails: any, selectedDocs: DocumentSelection): string {
  // Selected document types
  const selectedDocTypes = Object.entries(selectedDocs)
    .filter(([_, isSelected]) => isSelected)
    .map(([docType, _]) => docType);
  
  // Format the project details for the prompt
  const projectName = projectDetails.projectName?.trim() || 'Unnamed Project';
  const projectType = projectDetails.projectType?.trim() || 'Web Application';
  const projectGoal = projectDetails.projectGoal?.trim() || 'No goal specified';
  const features = projectDetails.features?.trim() || 'No specific features provided';
  const techStack = projectDetails.techStack?.trim() || 'No specific tech stack provided';
  
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
**IMPORTANT: Generate COMPLETE documentation with detailed content, NOT just an outline or section headings.** For each section requested below, provide detailed explanations, examples where applicable (like code snippets, configuration examples, or API endpoints), and narrative descriptions. Avoid simple bulleted lists for explanations; use prose.

Focus on creating detailed Markdown documents for the following sections:

${selectedDocTypes.includes('requirements') ? `
## Requirements Document

### Functional Requirements
Detail each requirement with explanations. E.g., For User Authentication, describe the login process, password requirements, session handling, etc.

### Non-Functional Requirements
Elaborate on performance goals (e.g., target load times, concurrent users), security measures (e.g., specific vulnerability protections, data encryption), and scalability considerations (e.g., potential bottlenecks, scaling strategies).

### Prioritization
Briefly justify the prioritization (Must-Have, Should-Have, Nice-to-Have).

### Acceptance Criteria
Write specific, measurable criteria for key features.
` : ''}

${selectedDocTypes.includes('frontendGuidelines') ? `
## Frontend Guidelines

### UI/UX Principles & Style Guide
Describe the design philosophy, target audience considerations, and key style elements (color palette usage, typography hierarchy, spacing rules, iconography style).

### Component Architecture
Explain the chosen component pattern (e.g., Atomic Design, simple functional components), folder structure for components, and conventions for component props and state.

### State Management
Detail the chosen approach (e.g., Context API, Redux, Zustand), explain why it was chosen, and provide examples of typical usage patterns.

### Responsive Design
Explain the breakpoints and how layouts adapt. Provide examples if necessary.

### Accessibility (A11y)
List key WCAG guidelines being followed and provide specific examples (e.g., ARIA attributes usage, keyboard navigation focus management).

### Testing Strategy
Describe the types of tests (unit, integration, E2E), tools used, and target coverage.
` : ''}

${selectedDocTypes.includes('backendStructure') ? `
## Backend Structure

### API Design
Describe the API style (e.g., REST, GraphQL). Detail key resource endpoints with HTTP methods, request/response formats (provide JSON examples), and authentication requirements.

### Database Schema
Explain the collections/tables, fields, data types, relationships, and indexing strategies. Provide schema definition snippets if possible.

### Authentication/Authorization
Detail the mechanism (e.g., JWT, OAuth), token handling, password hashing, and role/permission implementation.

### Data Models
Explain the core data structures used within the application logic.

### Middleware
Describe the purpose and order of key middleware (logging, error handling, auth, validation).

### Server Architecture
Explain the deployment model (e.g., Monolith, Microservices), hosting environment considerations, and key infrastructure components.
` : ''}

${selectedDocTypes.includes('appFlow') ? `
## Application Flow

### User Journeys
Describe primary user paths step-by-step in narrative form (e.g., "A new user visits the site, navigates to services, selects 'Web Development', reads the details, and clicks 'Contact Us'...").

### Sequence Diagrams
Provide key interaction flows using Mermaid syntax (\`\`\`mermaid\\nsequenceDiagram...\\n\`\`\`).

### Integration Points
Detail how major components (frontend, backend, database, external services) interact for key features.

### Error Handling
Describe common error scenarios and how they are handled and communicated to the user/system.

### Data Flow
Explain how data moves through the system for critical operations (e.g., user registration, order processing).
` : ''}

${selectedDocTypes.includes('techStackDoc') ? `
## Technology Stack Documentation

### Technology Explanations
Provide a paragraph or two for each major technology (frameworks, libraries, databases, services) explaining *why* it was chosen and its role in the project.

### Justification
Summarize the overall rationale for the stack choices.

### Infrastructure
Detail hosting, database, CDN, CI/CD pipeline requirements and setup.

### Dev Environment
Explain how to set up the local development environment (dependencies, commands, configurations).

### External Services
List integrations, their purpose, and configuration points.
` : ''}

${selectedDocTypes.includes('systemPrompts') ? `
## System Prompts (If Applicable)

### AI Feature Prompts
List the exact system prompts used for AI features.

### Edge Case Handling
Describe how the AI handles unclear input, errors, or unexpected scenarios.

### Prompt Engineering Guidelines
Provide best practices used for crafting effective prompts for this project.

### AI Integration
Detail how the AI service is called and how its responses are processed.
` : ''}

${selectedDocTypes.includes('fileStructure') ? `
## File Structure

### Project Organization
Explain the reasoning behind the top-level directory structure.

### Folder Structure
Detail the purpose of key subdirectories within frontend and backend.

### Key Files
Describe the role of critical files (e.g., entry points, main configuration, routing).

### Naming Conventions
List specific naming conventions for files, variables, functions, classes, components, etc.

### Configuration
Explain key configuration files and their settings.
` : ''}

# FORMAT REQUIREMENTS
- Create a well-structured Markdown document.
- Use proper headings (# for main sections, ## for subsections, ### for sub-subsections, etc.).
- **Write detailed paragraphs.** Avoid overly simplistic bullet points where narrative explanation is better.
- Include tables for structured data where appropriate (e.g., API endpoints, requirements prioritization).
- Add code examples (using \`\`\`language\\n...\\n\`\`\` blocks) and configuration snippets where helpful.
- Make the documentation comprehensive, practical, and easy to understand.
- Focus on clarity and actionability.

# ⚠️ IMPORTANT NOTES ⚠️
- **WRITE DETAILED PROSE:** Elaborate on each point. Do not just list items mentioned in the instructions; explain them thoroughly.
- **PROVIDE EXAMPLES:** Include code snippets, config examples, API request/response examples where appropriate.
- **EXPLAIN THE \'WHY\':** Briefly justify design decisions or technology choices where relevant.
- **SUBSTANTIAL SECTIONS:** Ensure each section generated is substantial and provides real value, not just placeholders.
- Use Mermaid syntax for diagrams where applicable (e.g., sequence diagrams).

Output ONLY the markdown content of the requested documentation, nothing else.
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

    // Track the actual provider and model we're using
    let actualProvider = provider;
    let modelUsed = '';

    // Determine what model to use based on the provider
    switch (provider.toLowerCase()) {
      case 'openai':
        modelUsed = 'gpt-4o';
        break;
      case 'anthropic':
        modelUsed = 'claude-3-sonnet-20240229';
        break;
      case 'gemini':
        modelUsed = 'gemini-1.5-pro';
        break;
      default:
        modelUsed = 'gpt-4o'; // Default to OpenAI
        actualProvider = 'openai';
    }

    const startTime = Date.now();
    let generatedContent = '';
    let apiError = null;

    try {
      if (provider === 'openai') {
        // OpenAI implementation
        if (!apiKey && !process.env.OPENAI_API_KEY) {
          return res.status(400).json({ error: 'OpenAI API key is required' });
        }
        
        const openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
        const prompt = buildPrompt(projectDetails, selectedDocs);
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
        const response = await anthropic.messages.create({
          model: modelUsed,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: TOKEN_LIMITS.anthropic,
        });
        // Handle content blocks
        generatedContent = response.content?.filter(block => 'text' in block).map(block => (block as any).text).join('') || '';
      } else if (provider === 'gemini') {
        // Google Gemini implementation
        if (!apiKey && !process.env.GEMINI_API_KEY) {
          return res.status(400).json({ error: 'Gemini API key is required' });
        }
        
        const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ 
          model: modelUsed,
          safetySettings: safetySettings, // Use defined safety settings
          generationConfig: { // Add generation config
            temperature: 0.3,
            maxOutputTokens: TOKEN_LIMITS.gemini
          }
        });
        const prompt = buildPrompt(projectDetails, selectedDocs);
        const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
        // Safely extract text
        try {
          generatedContent = result.response.text();
        } catch (e) {
           console.warn("Gemini response.text() failed, trying manual extraction.", e);
           generatedContent = result.response?.candidates?.[0]?.content?.parts?.map(part => part.text).join('') || '';
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
        sectionsCount: sections.length
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

