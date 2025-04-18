/* eslint-disable */
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit } from '../../utils/rate-limiter';

// For environments that have issues with the native fetch implementation
import fetch from 'cross-fetch';
global.fetch = fetch;

// Initialize the rate limiter (e.g., 10 requests per minute per IP)
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
});


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

interface GenerateDocsRequestBody {
  projectDetails: ProjectDetails;
  selectedDocs: DocumentSelection;
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
}

type SuccessResponse = { 
  message: string;
  content: string; // Full content in markdown format
  // Add structure to return parsed document sections
  sections?: Array<{
    title: string;
    content: string;
  }>;
  debug?: {
    provider: string;
    model: string;
    timestamp: string;
    contentLength: number;
    processingTimeMs?: number;
  }
}

type ErrorResponse = { 
  error: string;
  code?: string;
}

// Constants
const GEMINI_MODEL = "gemini-2.5-pro-exp-03-25"; // Using exactly the model shown on the frontend
const OPENAI_MODEL = "gpt-4o"; // Current OpenAI model
const ANTHROPIC_MODEL = "claude-3-7-sonnet-20250219"; // Updated to Claude 3.7 Sonnet

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Token limits per provider (Maintaining higher limits as we've increased the timeout)
const TOKEN_LIMITS = {
  gemini: 8192,    // Higher limit for comprehensive documents
  openai: 8192,    // For gpt-4o
  anthropic: 32768  // Claude 3.7 Sonnet can handle even larger outputs
};

// Helper Function to Build Prompt
function buildPrompt(details: ProjectDetails, docs: DocumentSelection): string {
  const selectedDocList = Object.entries(docs)
    .filter(([, value]) => value)
    .map(([key]) => `- ${key.replace(/([A-Z])/g, ' $1').trim()}`)
    .join('\n');
    
  const mermaidExample = '```mermaid\nsequenceDiagram\n    participant User\n    participant Browser\n    participant Server\n    User->>Browser: Request page\n    Browser->>Server: GET /resource\n    Server-->>Browser: HTML page\n    Browser-->>User: Display page\n```';

  let promptString = "Act as an expert technical writer and software architect specialized in creating comprehensive project planning documents.\n";
  promptString += "Your task is to generate the requested preliminary planning documentation in **Markdown format** for the software project described below.\n\n";
  promptString += "**Project Context:**\n";
  promptString += `* **Project Name:** ${details.projectName || '(Not specified)'}\n`;
  promptString += `* **Project Type:** ${details.projectType || '(Not specified)'}\n`;
  promptString += `* **Main Goal/Purpose:** ${details.projectGoal || '(Not specified)'}\n`;
  promptString += `* **Key Features:** ${details.features || '(Not specified)'}\n`;
  promptString += `* **Known Tech Stack Hints:** ${details.techStack || '(Not specified)'}\n\n`;
  promptString += "**Requested Documents:**\n";
  promptString += `Generate the following documents, ensuring each starts with a clear Level 1 Markdown heading (e.g., '# Project Requirements Document'):\n${selectedDocList || '(No specific documents selected - provide a general project overview if possible)'}\n\n`;
  promptString += "**Detailed Instructions & Formatting:**\n";
  promptString += "* **Markdown Usage:** Utilize Markdown extensively for structure and readability (headings, subheadings, lists, bold/italics, code blocks for examples).\n";
  promptString += `* **Diagrams (Optional but Recommended):** Where appropriate (e.g., App Flow, Backend Structure, Database Schema), embed diagrams using **Mermaid syntax** within Markdown code blocks. Suggest relevant diagram types (sequenceDiagram, classDiagram, erDiagram, flowchart). For example:\n${mermaidExample}\n`;
  promptString += "* **Content Generation:**\n";
  promptString += "    * Tailor the content specifically to the **Project Type** and **Key Features** provided.\n";
  promptString += "    * Incorporate relevant **software development best practices** for each document (e.g., mention SMART criteria for requirements, REST principles for APIs, accessibility (WCAG) for frontend, MVC/MVVM patterns, security considerations, database normalization).\n";
  promptString += "    * Provide practical, actionable starting points. If details are sparse, make logical assumptions based on the project type and state them clearly.\n";
  promptString += "    * **System Prompts:** If AI interaction seems relevant based on the project description, explain the purpose of system prompts and provide illustrative examples. Otherwise, state that specific system prompts might not be applicable initially.\n";
  promptString += "    * **File Structure:** Propose a standard, logical directory layout suitable for the project type and mentioned technologies. Explain the purpose of key folders.\n";
  promptString += "* **Output Style:** Generate only the requested document content. Do not include conversational introductions, summaries, or remarks outside the documents themselves. Ensure the output is a single, valid Markdown block containing all requested sections.\n";

  return promptString;
}

// Function to parse markdown content into sections based on H1 headers
function parseMarkdownSections(markdown: string): Array<{title: string, content: string}> {
  if (!markdown) return [];
  
  // Split the markdown by level 1 headings (# )
  const sections: Array<{title: string, content: string}> = [];
  
  // Use regex to find all level 1 headings and their content
  const regex = /^# (.+)$/gm;
  let match;
  let lastIndex = 0;
  let lastTitle = '';
  
  // Find all matches
  while ((match = regex.exec(markdown)) !== null) {
    // If this isn't the first heading, save the previous section
    if (lastTitle) {
      const sectionContent = markdown.substring(lastIndex, match.index).trim();
      sections.push({ title: lastTitle, content: sectionContent });
    }
    
    // Update for the next iteration
    lastTitle = match[1];
    lastIndex = match.index;
  }
  
  // Don't forget the last section
  if (lastTitle) {
    const sectionContent = markdown.substring(lastIndex).trim();
    sections.push({ title: lastTitle, content: sectionContent });
  }
  
  // If no sections were found, treat the entire document as one section
  if (sections.length === 0 && markdown.trim().length > 0) {
    sections.push({ title: 'Documentation', content: markdown });
  }
  
  return sections;
}

// Function to validate API key format (basic check)
function validateApiKey(provider: string, apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return false;
  }
  
  const trimmedKey = apiKey.trim();
  
  switch (provider) {
    case 'openai':
      return trimmedKey.startsWith('sk-');
    case 'anthropic':
      // Only check that Anthropic keys start with sk-
      return trimmedKey.startsWith('sk-');
    case 'gemini':
      // Gemini keys don't have a consistent prefix, just check it's not empty
      return trimmedKey.length > 0;
    default:
      return false;
  }
}

// Main API Handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  // Method verification
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Apply rate limiting
  try {
    // Use IP address as the unique token for rate limiting
    const token = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
    await limiter.check(res, 10, token); // Limit to 10 requests per interval (defined above)
  } catch {
    // The limiter.check function already handles sending the 429 response
    return; // Stop execution if rate limited
  }

  // Declare provider variable here, allowing it to be accessible in catch block
  let provider: GenerateDocsRequestBody['provider'] | undefined;
  
  // Record start time for performance tracking
  const startTime = Date.now();
  
  try {
    const { 
      projectDetails, 
      selectedDocs, 
      apiKey, 
      provider: reqProvider 
    }: GenerateDocsRequestBody = req.body;
    
    // Assign the destructured provider to the outer scope variable
    provider = reqProvider;

    // Enhanced validation checks
    if (!projectDetails) {
      return res.status(400).json({ 
        error: 'Project details are required', 
        code: 'MISSING_PROJECT_DETAILS' 
      });
    }

    if (!projectDetails.projectName?.trim()) {
      return res.status(400).json({ 
        error: 'Project Name is required', 
        code: 'MISSING_PROJECT_NAME' 
      });
    }

    if (!apiKey?.trim()) {
      return res.status(400).json({ 
        error: 'API Key is required', 
        code: 'MISSING_API_KEY' 
      });
    }

    if (!provider || !['gemini', 'openai', 'anthropic'].includes(provider)) {
      return res.status(400).json({ 
        error: 'Invalid AI provider selected', 
        code: 'INVALID_PROVIDER' 
      });
    }

    if (!Object.values(selectedDocs).some(isSelected => isSelected)) {
      return res.status(400).json({ 
        error: 'Please select at least one document type', 
        code: 'NO_DOCS_SELECTED' 
      });
    }

    // Validate API key format
    if (!validateApiKey(provider, apiKey)) {
      return res.status(400).json({ 
        error: `Invalid ${provider} API key format`, 
        code: 'INVALID_API_KEY_FORMAT' 
      });
    }

    const prompt = buildPrompt(projectDetails, selectedDocs);
    let generatedText: string | null = null;

    // console.log(`Received request. Provider: ${provider}, Project: ${projectDetails.projectName}`); // Removed for production

    // Set a very generous timeout for all providers as requested
    const requestTimeout = 600000; // 600 seconds (10 minutes)

    switch (provider) {
      case 'gemini':
        try {
          // Configure Gemini API with direct fetch implementation
          const genAI = new GoogleGenerativeAI(apiKey);
          
          const systemInstruction = "You are an expert technical writer generating Markdown project planning documents. Your output should be well-structured, comprehensive, and follow Markdown best practices.";
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
          
          console.log(`Using Gemini model: ${GEMINI_MODEL}`);
          
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            systemInstruction
          });
          
          // Configure generation with appropriate settings
          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { 
              temperature: 0.7,
              maxOutputTokens: TOKEN_LIMITS.gemini,
              topK: 40,
              topP: 0.95
            },
            safetySettings
          }, { signal: controller.signal });
          
          clearTimeout(timeoutId);
          
          const response = result.response;
          generatedText = response.text();
          
          if (!generatedText) {
            throw new Error("Gemini API returned no text in response");
          }
        } catch (err) { 
          if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Gemini API request timed out');
          }
          // Check if the error message indicates a quota/rate limit issue (common cause of 429)
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (errorMessage.includes('429') || /quota|rate limit/i.test(errorMessage)) {
             console.error(`Gemini API quota/rate limit error: ${errorMessage}`); // Log specific error server-side
             // Return a 429 status code to the client
             res.status(429).json({ error: `Gemini API Error: Rate limit or quota exceeded. Please check your Gemini plan/usage. (${errorMessage.substring(0, 100)}...)`, code: 'GEMINI_QUOTA_EXCEEDED' });
             return; // Stop execution after sending response
          }
          // Throw other errors to be caught by the main handler
          throw new Error(`Gemini API request failed: ${errorMessage}`);
        }
        break;

      case 'openai':
        try {
          const openai = new OpenAI({ apiKey });
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
          
          const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
              { role: "system", content: "You are an expert technical writer generating Markdown project planning documents. Your output should be well-structured, comprehensive, and follow Markdown best practices." }, 
              { role: "user", content: prompt }
            ],
            temperature: 0.7, 
            max_tokens: TOKEN_LIMITS.openai,
            top_p: 0.95,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          }, { signal: controller.signal });
          
          clearTimeout(timeoutId);
          
          generatedText = completion.choices[0]?.message?.content || null;
          
          if (!generatedText) {
            throw new Error("OpenAI API returned no content");
          }
        } catch (err) { 
          if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('OpenAI API request timed out');
          }
          
          let specificError = "";
          if (err instanceof OpenAI.APIError) {
            specificError = ` (Status: ${err.status}, Type: ${err.type}, Code: ${err.code})`;
          }
          
          throw new Error(`OpenAI API request failed: ${err instanceof Error ? err.message : String(err)}${specificError}`); 
        }
        break;

      case 'anthropic':
        try {
          // Simple API key check
          const trimmedApiKey = apiKey.trim();
          
          if (!trimmedApiKey || !trimmedApiKey.startsWith('sk-')) {
            throw new Error("Invalid Anthropic API key format: must start with 'sk-'");
          }
          
          // Configure Anthropic client with proper timeout
          const anthropic = new Anthropic({
            apiKey: trimmedApiKey, 
            timeout: requestTimeout,
          });
          
          console.log(`Using Anthropic model: ${ANTHROPIC_MODEL}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
          
          // Make a single request - let the API validate the key and model availability
          try {
            const response = await anthropic.messages.create({
              model: ANTHROPIC_MODEL,
              max_tokens: TOKEN_LIMITS.anthropic,
              temperature: 0.7,
              system: "You are an expert technical writer generating Markdown project planning documents. Your output should be well-structured, comprehensive, and follow Markdown best practices.",
              messages: [{ role: "user", content: prompt }],
            }, { signal: controller.signal });
            
            clearTimeout(timeoutId);
            
            // Check response structure carefully - Anthropic returns content as an array
            if (response && response.content && response.content.length > 0) {
              const contentBlock = response.content[0];
              if ('text' in contentBlock) {
                generatedText = contentBlock.text;
              } else {
                throw new Error("Missing text in Anthropic API response");
              }
            } else {
              throw new Error("Invalid response structure from Anthropic API");
            }
          } catch (error: any) {
            // Enhanced error handling with more specific messages
            if (error.status === 401) {
              throw new Error("Authentication failed: Invalid Anthropic API key");
            } else if (error.status === 400) {
              throw new Error(`Anthropic API error: ${error.message || 'Bad request'}`); 
            } else if (error.status === 403) {
              throw new Error("Access denied: This API key doesn't have permission to use this Claude model");
            } else if (error.status === 404) {
              throw new Error("Model not found: The specified Claude model isn't available with this API key");
            } else if (error.status === 429) {
              throw new Error("Rate limit exceeded: Please try again later");
            } else {
              throw error; // Re-throw other errors
            }
          }
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Anthropic API request timed out');
          }
          let specificError = "";
          if (err instanceof Anthropic.APIError) {
            // Use err.name instead of err.type
            specificError = ` (Status: ${err.status}, Name: ${err.name})`;
          }

          throw new Error(`Anthropic API request failed: ${err instanceof Error ? err.message : String(err)}${specificError}`);
        }
        break;

      default: 
        return res.status(400).json({ 
          error: 'Invalid AI provider specified', 
          code: 'INVALID_PROVIDER' 
        });
    }

    if (generatedText) {
      // Parse the markdown content into sections for better display
      const sections = parseMarkdownSections(generatedText);
      
      // Record end time and calculate processing time
      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;
      
      // Include the generated content and sections in the response
      return res.status(200).json({
        message: `Successfully generated documentation using ${provider}!`,
        content: generatedText,
        sections: sections,
        // Add debug info to help troubleshoot any issues
        debug: {
          provider,
          model: provider === 'gemini' ? GEMINI_MODEL : provider === 'openai' ? OPENAI_MODEL : ANTHROPIC_MODEL,
          timestamp: new Date().toISOString(),
          contentLength: generatedText.length,
          processingTimeMs: processingTimeMs
        }
      }); 
    } else {
      throw new Error("AI generation completed but produced no output text");
    }

  } catch (error) {
    // Log the error on the server side for debugging
    console.error(`Error in /api/generate-docs (${provider || 'unknown'}) handler:`, error);
    
    // Handle API key related issues for all providers
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      // Check for authentication/API key errors for any provider
      if (
        errorMessage.includes('API key') || 
        errorMessage.includes('Authentication') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('auth') ||
        errorMessage.includes('format') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403') ||
        errorMessage.includes('key') ||
        errorMessage.includes('credential')
      ) {
        return res.status(400).json({
          error: errorMessage,
          code: 'INVALID_API_KEY_FORMAT'
        });
      }
      
      // Check for model not found errors
      if (errorMessage.includes('model') && 
          (errorMessage.includes('not found') || errorMessage.includes('404'))) {
        return res.status(400).json({
          error: errorMessage,
          code: 'MODEL_NOT_FOUND'
        });
      }
    }

    // Generic error handling for all other cases
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_SERVER_ERROR';
    
    return res.status(500).json({ 
      error: `Failed to generate documentation: ${message}`,
      code: errorCode
    });
  }
}
