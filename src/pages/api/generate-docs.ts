/* eslint-disable */
// Timestamp: ${new Date().toISOString()} - Improved API implementation with error handling and response processing
// Timestamp: ${new Date().toISOString()} - Updated Anthropic model to 3.7 Sonnet and adjusted token limit
// Timestamp: ${new Date().toISOString()} - Updated to use centralized retry utility functions
// Timestamp: 2023-11-20T00:00:00.000Z - Fixed compatibility with Netlify background functions
// Timestamp: 2023-11-21T00:00:00.000Z - Fixed 502 error by correctly implementing background function pattern
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages'; // Import MessageStreamEvent
import { withTimeout, withRetry, API_TIMEOUT_MS, MAX_RETRIES, RETRY_DELAY_MS } from '@/utils';
import { saveGenerationResult } from '@/utils/saveResult'; // Import saveGenerationResult

// For environments that have issues with the native fetch implementation
import fetch from 'cross-fetch';
global.fetch = fetch;

// Add custom type for Gemini response part
type GeminiPart = string | { text?: string; [key: string]: any };

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
  PRIMARY: "gemini-1.5-pro", // Use stable version for Netlify
  FALLBACK: "gemini-1.0-pro"
};
const OPENAI_MODEL = "gpt-4o"; // Use standard model for background functions
const ANTHROPIC_MODEL = "claude-3-opus-20240229"; // Use full-featured model for background

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

// Function to parse the content into sections
function parseContentToSections(content: string): DocumentSection[] {
  try {
    // Initialize sections array
  const sections: DocumentSection[] = [];
    
    // Split the content by Markdown H1 or H2 headings (# or ##)
    const splitContent = content.split(/^(#+)\s+(.+)$/gm);
    
    let currentTitle = '';
    let currentContent = '';
    let inSection = false;
    
    // Process the split content
    for (let i = 0; i < splitContent.length; i++) {
      const part = splitContent[i];
      
      // If the part is a heading marker (# or ##)
      if (part === '#' || part === '##') {
        // If we were in a section, save the previous section
        if (inSection && currentTitle) {
          sections.push({
            title: currentTitle.trim(),
            content: currentContent.trim()
          });
        }
        
        // Start a new section
        currentTitle = splitContent[i + 1] || '';
        currentContent = '';
        inSection = true;
        i++; // Skip the title part in the next iteration
      } else if (inSection) {
        // Add to the current section content
        currentContent += part;
      } else {
        // Before any section, add to content without a title
        currentContent += part;
      }
    }
    
    // Add the last section if there is one
    if (inSection && currentTitle) {
      sections.push({
        title: currentTitle.trim(),
        content: currentContent.trim()
      });
    } else if (currentContent.trim()) {
      // Add any content that wasn't in a section
    sections.push({
        title: 'Introduction',
        content: currentContent.trim()
    });
  }
  
  return sections;
  } catch (error) {
    console.error('Error parsing content to sections:', error);
    // Return a single section with all content if parsing fails
    return [{
      title: 'Documentation',
      content: content
    }];
  }
}

// Build the prompt based on project details and selected docs
function buildPrompt(details: ProjectDetails, selectedDocs: DocumentSelection): string {
  const { projectName, projectType, projectGoal, features, techStack } = details;

  // Base prompt with project information
  let prompt = `Create comprehensive documentation for the following project:\n\n`;
  prompt += `Project Name: ${projectName}\n`;
  prompt += `Project Type: ${projectType}\n`;
  prompt += `Project Goal: ${projectGoal}\n`;
  prompt += `Features: ${features}\n`;
  prompt += `Tech Stack: ${techStack}\n\n`;

  // Add specific documentation requests based on selection
  prompt += `Please generate the following documentation sections, using markdown format with proper headings (# for main headers, ## for subheaders). Make each section extremely detailed, comprehensive, and specific to this project:\n\n`;

  if (selectedDocs.requirements) {
    prompt += `1. Requirements Document: 
    - Clearly define all functional requirements with detailed specifications
    - List all non-functional requirements (performance, security, scalability, etc.)
    - Create detailed user stories in the format "As a [user type], I want [goal] so that [benefit]"
    - Define acceptance criteria for each major feature
    - Include any technical constraints or dependencies
    - Outline project scope and boundaries (what is NOT included)
    - Prioritize requirements (must-have, should-have, could-have)
    \n\n`;
  }

  if (selectedDocs.frontendGuidelines) {
    prompt += `2. Frontend Guidelines: 
    - Define the component architecture with detailed hierarchy
    - Explain state management approach with specific patterns and libraries
    - Document styling conventions (CSS methodology, variables, theming)
    - Provide responsive design breakpoints and principles
    - Define reusable component patterns with specific examples
    - Document routing structure and navigation patterns
    - Include accessibility guidelines (ARIA roles, keyboard navigation, etc.)
    - Explain how to handle forms and user input validation
    - Provide error handling and loading state guidelines
    \n\n`;
  }

  if (selectedDocs.backendStructure) {
    prompt += `3. Backend Structure: 
    - Detail the API design with endpoints, methods, request/response formats
    - Document complete database schema with tables/collections, relationships, and indexes
    - Explain authentication and authorization flow in detail
    - Document security measures (CSRF protection, input validation, etc.)
    - Outline error handling and logging strategy
    - Detail caching mechanisms and performance optimization
    - Document background jobs and scheduled tasks
    - Explain deployment architecture and environment configuration
    - Include data validation and sanitization approaches
    \n\n`;
  }

  if (selectedDocs.appFlow) {
    prompt += `4. Application Flow: 
    - Map out detailed user journeys for primary user types
    - Create screen-by-screen flow diagrams with decision points
    - Document all key interaction points and system responses
    - Explain state transitions throughout the application
    - Detail error scenarios and recovery paths
    - Document integration points with external systems
    - Explain authentication and session management flow
    - Provide sequence diagrams for complex processes
    - Detail data flow between frontend and backend
    \n\n`;
  }

  if (selectedDocs.techStackDoc) {
    prompt += `5. Technology Stack Details: 
    - Provide detailed justification for each technology choice
    - Document specific version information and compatibility requirements
    - Explain integration points between different technologies
    - Detail build tools and development environment setup
    - Document testing frameworks and methodology
    - Explain deployment pipeline and infrastructure requirements
    - Outline scaling considerations for each technology
    - Document known limitations or challenges with chosen technologies
    - Provide alternative technologies considered and reasons for rejection
    \n\n`;
  }

  if (selectedDocs.systemPrompts) {
    prompt += `6. System Prompts: 
    - Provide detailed LLM system prompts for each AI-powered feature
    - Document context requirements and input formatting
    - Explain response parsing and handling
    - Detail prompt engineering techniques used
    - Provide examples of successful and problematic prompts
    - Document fallback strategies for handling AI limitations
    - Explain how to update and optimize prompts
    - Detail any specific model parameters or configurations
    - Provide testing and evaluation methodology for prompts
    \n\n`;
  }

  if (selectedDocs.fileStructure) {
    prompt += `7. File Structure: 
    - Provide complete project organization with detailed directory layout
    - Explain purpose and content guidelines for each directory
    - Document naming conventions and file organization patterns
    - Detail module/package organization and dependencies
    - Explain configuration file structure and environment variables
    - Document build output organization
    - Provide asset organization guidelines (images, fonts, etc.)
    - Explain test file organization and naming conventions
    - Document source control strategies (branching, gitignore, etc.)
    \n\n`;
  }

  prompt += `For each section, provide practical details that are specific to this type of project. Include code examples where appropriate. Format everything in clear, well-structured markdown with proper section headers. Make sure each section is extremely comprehensive and detailed - at least 1000-1500 words per section with multiple subheadings and examples. Avoid vague statements and provide specific, actionable guidance.`;

  return prompt;
}

// Modified handler for Netlify compatibility
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed',
      content: '',
      error: 'Only POST requests are allowed'
    });
  }
  
  console.log('Background function started at:', new Date().toISOString());
  
  // Extract requestId from body or generate a new one
  const requestId = req.body.requestId || `request_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`Processing request with ID: ${requestId}`);
  
  // Background functions in Netlify should return a response quickly
  res.status(202).json({
    message: 'Document generation started in background',
    status: 'processing',
    requestId: requestId // Return the requestId to the client
  });
  
  // The rest of the function will continue processing in the background
  try {
    // Parse request body
    const {
      projectDetails,
      selectedDocs,
      provider: requestedProvider,
      apiKey
    } = req.body as GenerateDocsRequestBody;

    // Set actual provider (default to gemini if not provided or invalid)
    const actualProvider = ['gemini', 'openai', 'anthropic'].includes(requestedProvider)
      ? requestedProvider
      : 'gemini';

    // Validate required fields
    if (!projectDetails || !selectedDocs) {
      console.error('Missing required fields: projectDetails or selectedDocs');
      await saveGenerationResult(requestId, {
        status: 'failed',
        error: 'Missing required fields: projectDetails or selectedDocs',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check for API key
    if (!apiKey) {
      console.error('No API key provided for the selected provider');
      await saveGenerationResult(requestId, {
        status: 'failed',
        error: 'No API key provided for the selected provider',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Apply rate limiting
    const clientId = req.headers['x-forwarded-for'] as string || 'anonymous';
    const rateLimitResult = await rateLimiter.limit(clientId);
    if (!rateLimitResult.success) {
      console.error('Rate limit exceeded for client', clientId);
      await saveGenerationResult(requestId, {
        status: 'failed',
        error: 'Rate limit exceeded. Please try again later.',
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      // Track processing time
      const startTime = Date.now();

      // Build prompt based on project details and selected docs
      const prompt = buildPrompt(projectDetails, selectedDocs);
      
      // Initialize variables to track responses
      let generatedContent = '';
      let sections: DocumentSection[] = [];
      let processingTime = 0;
      let modelUsed = '';
      let finalUsage: any = null;

      // Try the requested provider with centralized retry handling
      try {
        switch (actualProvider) {
          case 'gemini': {
            // Generate content using Gemini
            modelUsed = GEMINI_MODELS.PRIMARY; // Start with primary model
            
            try {
              // Initialize Google GenAI with API key
              const genAI = new GoogleGenerativeAI(apiKey);
              
              // Try with primary model first
              const primaryModel = genAI.getGenerativeModel({
                model: GEMINI_MODELS.PRIMARY,
                safetySettings
              });
              
              // Execute with retry logic
              const result = await withRetry(
                async () => {
                  const result = await primaryModel.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                      maxOutputTokens: TOKEN_LIMITS.gemini,
                      temperature: 0.7,
                      topP: 0.9,
                      topK: 40,
                    },
                  });
                  
                  return result;
                },
                {
                  errorMessage: "Gemini API request timed out",
                  shouldRetry: (error) => {
                    // Retry network errors, but not safety filter rejections
                    return !error.message.includes("safety settings");
                  },
                  onRetry: (attempt, error, willRetry) => {
                    console.log(`Gemini attempt ${attempt} failed: ${error.message}. ${willRetry ? 'Retrying...' : 'Giving up.'}`);
                  }
                }
              );
              
              // Process the response
              if (result.response.promptFeedback?.blockReason) {
                throw new Error(`Content blocked by Gemini due to ${result.response.promptFeedback.blockReason}`);
              }
              
              // Extract text from response
              let responseText = '';
              result.response.candidates?.forEach(candidate => {
                candidate.content.parts.forEach((part: GeminiPart) => {
                  if (typeof part === 'string') {
                    responseText += part;
                  } else if (part.text) {
                    responseText += part.text;
                  }
                });
              });
              
              generatedContent = responseText;
            } catch (primaryError) {
              console.error(`Error with ${GEMINI_MODELS.PRIMARY}:`, primaryError);
              console.log(`Falling back to ${GEMINI_MODELS.FALLBACK} model...`);
              
              try {
                // Update model used for tracking
                modelUsed = GEMINI_MODELS.FALLBACK;
                
                // Initialize Google GenAI with API key
                const genAI = new GoogleGenerativeAI(apiKey);
                
                // Try with fallback model
                const fallbackModel = genAI.getGenerativeModel({
                  model: GEMINI_MODELS.FALLBACK,
                  safetySettings
                });
                
                // Execute with retry logic
                const result = await withRetry(
                  async () => {
                    const result = await fallbackModel.generateContent({
                      contents: [{ role: 'user', parts: [{ text: prompt }] }],
                      generationConfig: {
                        maxOutputTokens: Math.min(TOKEN_LIMITS.gemini, 32000), // Fallback might have lower limits
                        temperature: 0.7,
                        topP: 0.9,
                        topK: 40,
                      },
                    });
                    
                    return result;
                  },
                  {
                    errorMessage: "Fallback Gemini API request timed out",
                    shouldRetry: (error) => {
                      // Retry network errors, but not safety filter rejections
                      return !error.message.includes("safety settings");
                    },
                    onRetry: (attempt, error, willRetry) => {
                      console.log(`Fallback Gemini attempt ${attempt} failed: ${error.message}. ${willRetry ? 'Retrying...' : 'Giving up.'}`);
                    }
                  }
                );
                
                // Process the response
                if (result.response.promptFeedback?.blockReason) {
                  throw new Error(`Content blocked by Gemini fallback due to ${result.response.promptFeedback.blockReason}`);
                }
                
                // Extract text from response
                let responseText = '';
                result.response.candidates?.forEach(candidate => {
                  candidate.content.parts.forEach((part: GeminiPart) => {
                    if (typeof part === 'string') {
                      responseText += part;
                    } else if (part.text) {
                      responseText += part.text;
                    }
                  });
                });
                
                generatedContent = responseText;
              } catch (fallbackError) {
                console.error(`Error with fallback model ${GEMINI_MODELS.FALLBACK}:`, fallbackError);
                throw new Error(`Failed to generate with both Gemini models: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`);
              }
            }
            break;
          }
          
          case 'openai': {
            // Generate content using OpenAI
            modelUsed = OPENAI_MODEL;
            
            // Create OpenAI client
            const openai = new OpenAI({ apiKey });
            
            // Execute with retry logic
            const response = await withRetry(
              async () => {
                return await openai.chat.completions.create({
                  model: OPENAI_MODEL,
                  messages: [
                    { role: 'system', content: 'You are a technical documentation expert. Your task is to create comprehensive, well-structured documentation as requested by the user.' },
                    { role: 'user', content: prompt }
                  ],
                  temperature: 0.7,
                  max_tokens: TOKEN_LIMITS.openai,
                  top_p: 0.9,
                });
              },
              {
                errorMessage: "OpenAI API request timed out",
                shouldRetry: (error) => {
                  // Retry network and rate limit errors
                  return error.message.includes('429') || 
                         error.message.includes('network') ||
                         error.message.includes('timeout');
                },
                onRetry: (attempt, error, willRetry) => {
                  console.log(`OpenAI attempt ${attempt} failed: ${error.message}. ${willRetry ? 'Retrying...' : 'Giving up.'}`);
                }
              }
            );
            
            // Extract content from response
            generatedContent = response.choices[0]?.message?.content || '';
            
            // Track token usage
            finalUsage = response.usage;
            break;
          }
          
          case 'anthropic': {
            // Generate content using Anthropic
            modelUsed = ANTHROPIC_MODEL;
            
            // Create Anthropic client
            const anthropic = new Anthropic({ apiKey });
            
            // Execute with retry logic
            const response = await withRetry(
              async () => {
                return await anthropic.messages.create({
                  model: ANTHROPIC_MODEL,
                  max_tokens: TOKEN_LIMITS.anthropic,
                  messages: [
                    { role: 'user', content: prompt }
                  ],
                  system: 'You are a technical documentation expert. Your task is to create comprehensive, well-structured documentation as requested by the user.',
                  temperature: 0.7,
                });
              },
              {
                errorMessage: "Anthropic API request timed out",
                shouldRetry: (error) => {
                  // Retry network and rate limit errors
                  return error.message.includes('429') || 
                         error.message.includes('network') ||
                         error.message.includes('timeout');
                },
                onRetry: (attempt, error, willRetry) => {
                  console.log(`Anthropic attempt ${attempt} failed: ${error.message}. ${willRetry ? 'Retrying...' : 'Giving up.'}`);
                }
              }
            );
            
            // Extract content from response
            generatedContent = '';
            if (response.content && response.content.length > 0) {
              response.content.forEach(block => {
                if (block.type === 'text' && typeof block.text === 'string') {
                  generatedContent += block.text;
                }
              });
            }
            
            // Track token usage
            finalUsage = {
              input_tokens: response.usage?.input_tokens || 0,
              output_tokens: response.usage?.output_tokens || 0
            };
            break;
          }
        }
        
        // Check if content was successfully generated
        if (!generatedContent || generatedContent.length < 50) {
          const errorMessage = 'Generated content is too short or empty';
          console.error(errorMessage);
          await saveGenerationResult(requestId, {
            status: 'failed',
            error: errorMessage,
            timestamp: new Date().toISOString(),
            debug: {
              provider: actualProvider,
              model: modelUsed,
              timestamp: new Date().toISOString()
            }
          });
          return;
        }
        
        // Process sections after successful generation
        sections = parseContentToSections(generatedContent);
        
        // Calculate processing time
        processingTime = Date.now() - startTime;
        
        // Save the result for later retrieval
        const result = {
          message: 'Documentation generated successfully',
          content: generatedContent,
          sections,
          debug: {
            provider: actualProvider,
            model: modelUsed,
            timestamp: new Date().toISOString(),
            contentLength: generatedContent.length,
            processingTimeMs: processingTime,
            sectionsCount: sections.length,
            tokensUsed: finalUsage && {
              input: finalUsage?.input_tokens || 0,
              output: finalUsage?.output_tokens || 0
            }
          }
        };
        
        const saved = await saveGenerationResult(requestId, result);
        if (!saved) {
          console.error(`Failed to save result for request ${requestId}`);
        } else {
          console.log(`Successfully saved result for request ${requestId}`);
        }
        
        console.log('Background function completed at:', new Date().toISOString());
      } catch (innerError) {
        // Handle error in AI provider processing
        console.error('Error processing with AI provider:', innerError);
        await saveGenerationResult(requestId, {
          status: 'failed',
          error: innerError instanceof Error ? innerError.message : 'Unknown error during AI processing',
          timestamp: new Date().toISOString(),
          debug: {
            provider: actualProvider,
            model: modelUsed || 'unknown',
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (processingError) {
      // Handle error in main processing flow
      console.error('Error in main processing flow:', processingError);
      await saveGenerationResult(requestId, {
        status: 'failed',
        error: processingError instanceof Error ? processingError.message : 'Unknown error during processing',
        timestamp: new Date().toISOString()
      });
    }
  } catch (outerError) {
    // Handle any unexpected errors
    console.error('Unhandled error in generate-docs-background handler:', outerError);
    try {
      await saveGenerationResult(requestId, {
        status: 'failed',
        error: outerError instanceof Error ? outerError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } catch (saveError) {
      console.error('Failed to save error result:', saveError);
    }
  }
}