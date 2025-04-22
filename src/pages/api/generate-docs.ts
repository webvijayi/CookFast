/* eslint-disable */
// Timestamp: 2024-11-05T12:00:00Z - Added Mermaid diagram generation instructions for Application Flow documents
// Timestamp: 2025-04-22T21:15:00Z - Moved document selection validation before prompt generation.
// Timestamp: ${new Date().toISOString()} - Removed ineffective in-memory rate limiter for serverless environment
// Timestamp: ${new Date().toISOString()} - Refactored Gemini logic, updated models, improved storage
// Timestamp: ${new Date().toISOString()} - Improved API implementation with error handling and response processing
// Timestamp: ${new Date().toISOString()} - Updated Anthropic model to 3.7 Sonnet and adjusted token limit
// Timestamp: ${new Date().toISOString()} - Updated to use centralized retry utility functions
// Timestamp: 2023-11-20T00:00:00.000Z - Fixed compatibility with Netlify background functions
// Timestamp: 2023-11-21T00:00:00.000Z - Fixed 502 error by correctly implementing background function pattern
// Timestamp: ${new Date().toISOString()} - Updated OpenAI model to gpt-4.1 and increased token limit
// Timestamp: 2025-04-21T06:40:00Z - Refined markdown section parser for better robustness.
// Timestamp: 2025-04-22T10:15:00Z - Updated buildPrompt to request structured JSON output.
// Timestamp: 2025-04-22T10:25:00Z - Added instruction for JSON output to buildPrompt.
// Timestamp: 2025-04-22T10:30:00Z - Updated API handler to parse JSON response and return documents array.
// Timestamp: 2025-04-22T10:40:00Z - Fixed lint errors: removed unused getStore, added missing fields to error responses.
// Timestamp: 2025-04-22T10:45:00Z - Corrected remaining lint error by adding status field.
// Timestamp: 2025-04-22T10:50:00Z - Corrected lint error in 400 response.
// Timestamp: 2025-04-22T11:20:00Z - Fixed 405 response lint error.
// Timestamp: YYYY-MM-DD - Added logging for raw AI response before parsing
// Timestamp: 2025-04-22T21:20:00Z - Removed duplicate selectedDocKeys declaration.
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentCandidate, GenerateContentResponse, BlockReason } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { withRetry } from '@/utils/index';
import { saveGenerationResult } from '@/utils/saveResult';
import { nanoid } from 'nanoid';

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
  targetAudience?: string;
  userPersonas?: string;
  keyChallenges?: string;
  successMetrics?: string;
  hasBackend?: boolean;
  hasFrontend?: boolean;
  projectDescription?: string;
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
  requestId?: string; // Include requestId
}

// Constants - Use specified Gemini models
const GEMINI_MODELS = {
  PRIMARY: "gemini-2.5-pro-exp-03-25", // Experimental model
  FALLBACK: "gemini-2.5-pro-preview-03-25" // Paid/Preview model
};
const OPENAI_MODEL = "gpt-4.1";
const ANTHROPIC_MODEL = "claude-3-opus-20240229";

// Safety settings for Gemini
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Token limits per provider
const TOKEN_LIMITS = {
  gemini: 65536, // Common output limit for 2.5 Pro variants
  openai: 16384, // Corrected limit for GPT-4.1 max output tokens (was 32768)
  anthropic: 64000
};

// // Simple rate limiter (REMOVED - ineffective in serverless)
// // ... existing rateLimiter code ...
// // Create a simple rate limiter
// const rateLimiter = {
//   // Store for tracking request counts
//   store: new Map<string, { count: number, resetTime: number }>(),

//   // Limit function to check and update rate limits
//   limit: async (key: string, maxRequests: number = 5, windowMs: number = 60000): Promise<{ success: boolean }> => {
//     const now = Date.now();
//     const record = rateLimiter.store.get(key) || { count: 0, resetTime: now + windowMs };

//     // Reset count if window has expired
//     if (now > record.resetTime) {
//       record.count = 0;
//       record.resetTime = now + windowMs;
//     }

//     // Check if limit is reached
//     if (record.count >= maxRequests) {
//       return { success: false };
//     }

//     // Increment count and update store
//     record.count++;
//     rateLimiter.store.set(key, record);

//     return { success: true };
//   }
// };


// Improved parsing function
function parseContentToSections(content: string): DocumentSection[] {
  if (!content || content.trim() === '') {
    console.log('Parsing empty content, returning empty sections array.');
    return [];
  }

  const sections: DocumentSection[] = [];
  // Regex to find H1, H2, or H3 headings
  const sectionRegex = /^#{1,3}\s+(.+?)\s*?\n/gm;
  let lastIndex = 0;
  let firstHeadingIndex = -1;

  // Find the index of the first heading
  const firstMatch = sectionRegex.exec(content);
  if (firstMatch) {
    firstHeadingIndex = firstMatch.index;
    // If there is content before the first heading, capture it as Introduction
    if (firstHeadingIndex > 0) {
      const introContent = content.substring(0, firstHeadingIndex).trim();
      if (introContent) {
        console.log(`Found Introduction content (length: ${introContent.length})`);
        sections.push({ title: 'Introduction', content: introContent });
      }
    }
  } else {
    // No headings found, treat the entire content as one section
    console.log('No headings found, treating entire content as single section.');
    return [{ title: 'Documentation', content: content.trim() }];
  }

  // Reset regex index for iteration
  sectionRegex.lastIndex = 0;
  let match;
  let startIndex = firstHeadingIndex; // Start parsing from the first heading

  while ((match = sectionRegex.exec(content)) !== null) {
    const title = match[1].trim();
    const currentHeadingIndex = match.index;

    // Add content from the previous heading (or start) to the current heading
    if (startIndex !== -1) {
      const sectionContent = content.substring(startIndex + match[0].length, currentHeadingIndex).trim();
      if (sections.length > 0 && sectionContent) {
         // Add content to the previously added section title
         sections[sections.length - 1].content = sectionContent;
         console.log(`Added content (length: ${sectionContent.length}) to section: ${sections[sections.length - 1].title}`);
      }
    }

    // Add the new section title (content will be added in the next iteration or after the loop)
    console.log(`Found section title: ${title}`);
    sections.push({ title: title, content: '' }); // Initialize content as empty

    startIndex = currentHeadingIndex;
    lastIndex = sectionRegex.lastIndex; // Keep track of the end of the last match
  }

  // Add content after the last heading
  if (startIndex !== -1 && sections.length > 0) {
    const lastSectionContent = content.substring(lastIndex).trim();
    if (lastSectionContent) {
      sections[sections.length - 1].content = lastSectionContent;
      console.log(`Added final content (length: ${lastSectionContent.length}) to section: ${sections[sections.length - 1].title}`);
    }
  }

  // Filter out sections that might have ended up with empty titles or content
  const filteredSections = sections.filter(section => section.title.trim() !== '' || section.content.trim() !== '');
  console.log(`Parsing complete. Found ${filteredSections.length} valid sections.`);
  return filteredSections;
}


// Updated buildPrompt function with consolidated JSON instructions
function buildPrompt(details: ProjectDetails, selectedDocs: DocumentSelection): string {
  const {
    projectName,
    projectType,
    projectGoal,
    features,
    techStack,
    targetAudience,
    userPersonas,
    keyChallenges,
    successMetrics,
    hasBackend,
    hasFrontend,
    projectDescription
  } = details;

  // Map internal keys to the exact titles expected in the JSON output
  const requestedDocTitlesMap: { [key in keyof DocumentSelection]?: string } = {
    requirements: 'Requirements Document (PRD/BRD)',
    frontendGuidelines: 'Frontend Guidelines & Architecture',
    backendStructure: 'Backend Architecture & Design',
    appFlow: 'Application Flow',
    techStackDoc: 'Technology Stack Details',
    systemPrompts: 'AI System Prompts (Examples)',
    fileStructure: 'Recommended Project Structure',
  };

  // Fix: Debug the selected documents to ensure they're being processed correctly
  console.log(`[buildPrompt] Raw selectedDocs:`, JSON.stringify(selectedDocs));

  // Fix: Ensure we're correctly filtering only the selected document types
  const requestedDocTitles = Object.entries(selectedDocs)
    .filter(([key, isSelected]) => {
      const result = Boolean(isSelected) && requestedDocTitlesMap[key as keyof DocumentSelection];
      // Add debug log for each key
      console.log(`[buildPrompt] Document key: ${key}, isSelected: ${isSelected}, hasMapping: ${Boolean(requestedDocTitlesMap[key as keyof DocumentSelection])}`);
      return result;
    })
    .map(([key]) => {
      const title = requestedDocTitlesMap[key as keyof DocumentSelection]!;
      console.log(`[buildPrompt] Mapped document title: ${title} from key: ${key}`);
      return title;
    });

  // Log the final list of document titles that will be requested
  console.log(`[buildPrompt] Final requested document titles (${requestedDocTitles.length}): ${requestedDocTitles.join(', ')}`);

  // Check if we have valid project details - if not, provide default placeholders
  // but ensure we explicitly tell the AI this is a placeholder
  const safeProjectName = projectName?.trim() || 'UNTITLED PROJECT';
  const safeProjectType = projectType?.trim() || 'Generic Project';
  
  // Explicitly instruct the AI not to improvise details
  const noDetailsWarning = (!projectName?.trim() && !projectGoal?.trim() && !features?.trim() && !techStack?.trim()) 
    ? `\n\n**IMPORTANT: The user has not provided specific project details. DO NOT invent a fictitious company, website, or application. Generate generic documentation for a ${safeProjectType} without filling in details that weren't provided.**\n\n`
    : '';

  // --- Base Prompt Structure ---
  let basePrompt = `# ${safeProjectName} Documentation Generator\n\n` +
                   `## Agent Identity and Purpose\n\n` +
                   `You are DocuMentor, a specialized AI documentation generator. Your task is to generate detailed, accurate, and production-ready technical documentation in JSON format based on the provided Project Context.${noDetailsWarning}\n\n` +
                   `<documentation_rules>\n` +
                   `1. **JSON Output Required:** The ENTIRE response must be a single, valid JSON object.\n` +
                   `2. **Context Adherence:** Base content strictly on Project Context - DO NOT invent fictitious companies or websites.\n` +
                   `3. **Deep Specificity:** Provide concrete examples and details based ONLY on what is provided.\n` +
                   `4. **Rich Markdown:** Use proper markdown formatting within JSON string values.\n` +
                   `5. **Production Ready:** All recommendations must be implementable.\n` +
                   `6. **No Defaults:** If project details are minimal, create generalized documentation rather than inventing specific details.\n` +
                   `</documentation_rules>\n\n` +

                   `## Project Context\n\n` +
                   `<project_details>\n` +
                   `**Project Name:** ${safeProjectName}\n` +
                   `**Project Type:** ${safeProjectType}\n` +
                   `**Core Goal/Objective:** ${projectGoal?.trim() || 'Not Specified'}\n` +
                   `${projectDescription ? `**Detailed Description:** ${projectDescription}\\n` : ''}` +
                   `**Target Audience:** ${targetAudience?.trim() || 'Not Specified'}\n` +
                   `**User Personas:** ${userPersonas?.trim() || 'Not Specified'}\n` +
                   `**Key Features:**\\n${features?.trim() ? features.split(/[\\n,]+/).map(f => `- ${f.trim()}`).join('\\n') : '- Not Specified'}\\n` +
                   `**Technology Stack:** ${techStack?.trim() || 'Not Specified'}\\n` +
                   `${hasFrontend !== undefined ? `**Includes Frontend:** ${hasFrontend ? 'Yes' : 'No'}\\n` : ''}` +
                   `${hasBackend !== undefined ? `**Includes Backend:** ${hasBackend ? 'Yes' : 'No'}\\n` : ''}` +
                   `**Key Challenges/Risks:** ${keyChallenges?.trim() || 'Not Specified'}\n` +
                   `**Success Metrics:** ${successMetrics?.trim() || 'Not Specified'}\n` +
                   `</project_details>\n\n`;

  // --- Check if App Flow documentation is requested ---
  const includesAppFlow = selectedDocs.appFlow;
  if (includesAppFlow) {
    // Add specialized Mermaid diagram instructions
    basePrompt += `## Mermaid Diagram Instructions\n\n` +
                 `<mermaid_diagram_instructions>\n` +
                 `When generating "Application Flow" documentation, you MUST include multiple Mermaid diagrams to visualize flows. Follow these requirements:\n\n` +
                 `1. **Mandatory Diagrams:** Include at least 3 different diagrams:\n` +
                 `   - User Journey Flowchart\n` +
                 `   - Component Interaction Sequence Diagram\n` +
                 `   - Data Flow Diagram\n\n` +
                 
                 `2. **Mermaid Syntax:** Use the following format for ALL diagrams:\n` +
                 "```mermaid\n[DIAGRAM CODE HERE]\n```\n\n" +
                 
                 `3. **Sequence Diagram Example:** Use this exact syntax pattern:\n` +
                 "```mermaid\nsequenceDiagram\n    participant User\n    participant Frontend\n    participant API\n    participant Database\n    \n    User->>Frontend: Interacts with UI\n    Frontend->>API: Sends request\n    API->>Database: Queries data\n    Database-->>API: Returns results\n    API-->>Frontend: Sends response\n    Frontend-->>User: Updates UI\n```\n\n" +
                 
                 `4. **Flowchart Example:** Use this exact syntax pattern:\n` +
                 "```mermaid\nflowchart TD\n    A[Start] --> B{User logged in?}\n    B -->|Yes| C[Dashboard]\n    B -->|No| D[Login Screen]\n    D --> E[Authentication]\n    E -->|Success| C\n    E -->|Failure| D\n    C --> F[End]\n```\n\n" +
                 
                 `5. **Requirements for Diagrams:**\n` +
                 `   - Base all diagrams on the provided project details\n` +
                 `   - Include major components from the tech stack if specified\n` +
                 `   - Cover key user flows based on project features\n` +
                 `   - Show interactions between frontend and backend if both exist\n` +
                 `   - Add helpful labels, annotations, and captions\n` +
                 `   - Use proper Mermaid syntax with no mistakes\n` +
                 `</mermaid_diagram_instructions>\n\n`;
  }

  // --- JSON Output Requirements (Single, Clear Block) ---
  basePrompt += `## Required JSON Output Format\n\n` +
                `<output_format>\n` +
                `1. Response MUST be a single JSON object\n` +
                `2. JSON object MUST contain ONLY these exact keys, one for each requested document type:\n` +
                requestedDocTitles.map(title => `   - "${title}"\n`).join('') +
                `3. Each key's value MUST be a markdown-formatted string containing the complete documentation\n` +
                `4. Each markdown document MUST start with a level-1 heading matching its key\n` +
                `5. NO text before or after the JSON object\n` +
                `6. Do NOT group documents under a "general" key, use the exact keys specified above\n\n` +
                `Example Structure:\n` +
                `{\n` +
                `  "${requestedDocTitles[0] || 'Document Title'}": "# ${requestedDocTitles[0] || 'Document Title'}\\n## Section 1\\nDetailed content...",\n` +
                (requestedDocTitles.length > 1 ? `  "${requestedDocTitles[1]}": "# ${requestedDocTitles[1]}\\n## Overview\\nMore content..."\n` : `  "Another Document": "# Another Document\\n## Overview\\nMore content..."\n`) +
                `}\n` +
                `</output_format>\n\n`;

  // Add specific document type instructions for Application Flow
  if (includesAppFlow) {
    basePrompt += `## Application Flow Document Requirements\n\n` +
                 `<app_flow_requirements>\n` +
                 `The "Application Flow" document MUST include these specific sections:\n\n` +
                 
                 `1. **Overview** - Brief summary of the application architecture\n\n` +
                 
                 `2. **User Journeys** - Flow diagrams of key user interactions\n` +
                 `   - Show each major user path through the application\n` +
                 `   - Use Mermaid flowchart syntax (flowchart TD)\n` +
                 `   - Label key decision points and actions\n\n` +
                 
                 `3. **Component Interactions** - Sequence diagrams showing how components communicate\n` +
                 `   - Show request/response patterns\n` +
                 `   - Include all major system components\n` +
                 `   - Use Mermaid sequence diagram syntax (sequenceDiagram)\n\n` +
                 
                 `4. **Data Flow** - Diagrams showing how data moves through the system\n` +
                 `   - Show data transformations\n` +
                 `   - Include data stores and processing steps\n` +
                 `   - Use appropriate Mermaid diagram syntax\n\n` +
                 
                 `5. **Error Handling Flows** - How the system handles failures\n` +
                 `   - Show error paths and recovery mechanisms\n` +
                 `   - Use Mermaid diagram syntax\n\n` +
                 
                 `6. **Deployment Flow** - How the application is deployed\n` +
                 `   - Include build and release process if relevant\n` +
                 `   - Use Mermaid diagram syntax\n` +
                 `</app_flow_requirements>\n\n`;
  }

  // --- Final Instruction (Single, Clear) ---
  basePrompt += `<final_instruction>\n` +
                `Generate a JSON object containing complete documentation for exactly these ${requestedDocTitles.length} document types:\n\n` +
                requestedDocTitles.map(title => `- "${title}"\n`).join('') +
                `\nStrictly follow these rules:\n` +
                `1. Output MUST be ONLY a clean JSON object: starts with '{' and ends with '}'\n` +
                `2. Each document has comprehensive content in markdown format\n` +
                `3. Content is specific to ${safeProjectName} and its context WITHOUT inventing fictional details\n` +
                `4. Each document MUST have its own top-level key as listed above\n` +
                `5. DO NOT create a "general" object containing document sections\n` +
                `6. NO text outside the JSON structure\n` +
                `7. IMPORTANT: NEVER return an empty JSON object. If you cannot generate full documentation, at least include a basic outline or minimal content for each requested document.\n`;
  
  // Add special instruction for Application Flow
  if (includesAppFlow) {
    basePrompt += `8. "Application Flow" MUST include Mermaid diagrams using proper syntax (in code blocks with \`\`\`mermaid). Include at least 3 different diagram types.\n`;
  }
  
  basePrompt += `</final_instruction>`;

  console.log(`[buildPrompt] Generated prompt requesting ${requestedDocTitles.length} documents in JSON format.`);
  return basePrompt;
}

// Interface for structured AI response (keys are document titles)
interface StructuredGenerationResponse {
  [documentTitle: string]: string;
}

// Interface for the final API response sent to frontend
interface ApiResponseType {
  status: 'completed' | 'failed' | 'processing';
  message: string;
  documents?: { title: string; content: string }[]; // Changed from content/sections
  error?: string;
  debug?: any;
  requestId: string;
}

// Updated generateWithGemini (still relies on prompt for JSON)
async function generateWithGemini(
  apiKey: string,
  modelName: string,
  prompt: string,
  requestId: string,
  isBackground: boolean
): Promise<{ responseText: string; modelUsed: string; tokens: { input: number, output: number, total: number } }> {
  console.log(`[${requestId}] [Gemini] Initializing with model: ${modelName}`);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName, safetySettings });

  const generationConfig = {
    // temperature: 0.7, // Adjust as needed
    maxOutputTokens: TOKEN_LIMITS.gemini,
    // responseMimeType: "application/json", // Ensure JSON output if model supports it
  };

  try {
    console.log(`[${requestId}] [Gemini] Sending request...`);
    // Add a system instruction for non-empty responses
    const systemInstruction = "You are DocuMentor, a specialized technical documentation generator. You MUST output a valid, non-empty JSON object containing markdown-formatted documentation. Never return an empty object {}. Always include at least one document with meaningful content. When generating Application Flow documentation, include multiple Mermaid diagrams in markdown code blocks. Use ```mermaid syntax for sequence diagrams and flowcharts to visualize application flows.";

    // Use retry utility
    const generationFn = () => model.generateContent({ 
      contents: [
        { role: "user", parts: [{ text: systemInstruction + "\n\n" + prompt }] }
      ], 
      generationConfig 
    });
    
    const result = await withRetry(generationFn, {
      retries: 2,
      retryDelayMs: 1500,
      isBackground,
      errorMessage: `Gemini API Call (${requestId})`
    });

    // --- Robust Response Validation ---
    if (!result || !result.response) {
      console.error(`[${requestId}] [Gemini] Error: Received null or undefined response object.`);
      throw new Error('Gemini API returned an invalid response object.');
    }

    const response = result.response;

    // Check for safety blocks
    if (response.promptFeedback?.blockReason) {
      const blockReason = response.promptFeedback.blockReason;
      const safetyRatings = response.promptFeedback.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ') || 'N/A';
      console.error(`[${requestId}] [Gemini] Error: Prompt blocked due to safety settings. Reason: ${blockReason}. Ratings: [${safetyRatings}]`);
      throw new Error(`Gemini API request blocked due to safety settings: ${blockReason}.`);
    }

    if (!response.candidates || response.candidates.length === 0) {
      const finishReason = response.candidates?.[0]?.finishReason || 'Unknown';
      const safetyRatings = response.candidates?.[0]?.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ') || 'N/A';
      console.error(`[${requestId}] [Gemini] Error: No candidates returned. Finish Reason: ${finishReason}. Safety Ratings: [${safetyRatings}]`);
      // Check if candidate finish reason indicates blockage
      if (finishReason && finishReason !== 'STOP') {
         throw new Error(`Gemini API generation stopped unexpectedly. Finish Reason: ${finishReason}`);
      }
      throw new Error('Gemini API returned no candidates in the response.');
    }

    const candidate = response.candidates[0];

    // Check candidate finish reason
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.error(`[${requestId}] [Gemini] Error: Candidate generation stopped. Reason: ${candidate.finishReason}. Safety Ratings: [${candidate.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ') || 'N/A'}]`);
      throw new Error(`Gemini API generation finished unexpectedly: ${candidate.finishReason}.`);
    }

    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error(`[${requestId}] [Gemini] Error: Candidate content or parts are missing.`);
      throw new Error('Gemini API candidate returned empty content or parts.');
    }

    // Aggregate text from parts (handle potential non-text parts gracefully)
    let responseText = '';
    for (const part of candidate.content.parts) {
        if (typeof part === 'string') {
            responseText += part;
        } else if (part && typeof part.text === 'string') {
            responseText += part.text;
        } else {
             console.warn(`[${requestId}] [Gemini] Encountered non-text part: ${JSON.stringify(part)}`);
        }
    }
    responseText = responseText.trim(); // Trim aggregated text

    if (!responseText) {
        console.error(`[${requestId}] [Gemini] Error: Extracted response text is empty after processing parts.`);
        throw new Error('Gemini API returned empty text content after processing parts.');
    }
    // --- End Validation ---

    // Assuming token count might be available directly or needs calculation
    // Placeholder for token calculation - adapt based on actual API response structure if available
    const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount ?? 0;
    const totalTokens = response.usageMetadata?.totalTokenCount ?? (inputTokens + outputTokens);

    console.log(`[${requestId}] [Gemini] Request successful. Tokens: Input=${inputTokens}, Output=${outputTokens}, Total=${totalTokens}. Response length: ${responseText.length}`);

    return {
      responseText,
      modelUsed: modelName,
      tokens: { input: inputTokens, output: outputTokens, total: totalTokens }
    };
  } catch (error: any) {
    console.error(`[${requestId}] [Gemini] API call failed:`, error);
    // Rethrow a more specific error message if possible
    const message = error.message || 'Unknown Gemini API error';
    // Check for specific Gemini API error structures if available (e.g., error.details)
    throw new Error(`Gemini API Error: ${message}`);
  }
}

// Updated generateWithOpenAI (using JSON mode)
async function generateWithOpenAI(
  apiKey: string,
  prompt: string,
  requestId: string,
  isBackground: boolean
): Promise<{ responseText: string; modelUsed: string; tokens: { input: number, output: number, total: number } }> {
  console.log(`[${requestId}] Attempting generation with OpenAI model: ${OPENAI_MODEL} (JSON Mode Enabled)`);
  const openai = new OpenAI({ apiKey });

  try {
    const completionFn = () => openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { 
            role: "system", 
            content: "You are DocuMentor, a specialized technical documentation generator. You MUST output a valid, non-empty JSON object containing markdown-formatted documentation. Always include at least one document in your response even if minimal. Your response MUST contain at least one key-value pair for documentation, NEVER return an empty object {}. If generating Application Flow documentation, include multiple Mermaid diagrams with proper syntax in markdown code blocks." 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: TOKEN_LIMITS.openai,
        response_format: { type: "json_object" }, // Explicitly request JSON
        temperature: 0.7, // Using 0.7 for more creative and varied diagrams
      });

    // Add specific logging before the API call
    console.log(`[${requestId}] Calling OpenAI API. Model: ${OPENAI_MODEL}, Background: ${isBackground}, Max Tokens: ${TOKEN_LIMITS.openai}`);

    const completion = await withRetry(
      completionFn,
      {
        retries: 2,
        retryDelayMs: 1500,
        onRetry: (attempt, error, willRetry) => console.warn(`[${requestId}] OpenAI attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}. ${willRetry ? 'Retrying...' : 'Giving up.'}`),
        isBackground,
        timeoutMs: isBackground ? 840000 : 60000, // Use longer timeout for background functions
        errorMessage: `OpenAI API call timed out for model ${OPENAI_MODEL}`
      }
    );

    // Add more specific logging of the OpenAI response
    console.log(`[${requestId}] OpenAI raw response structure:`, JSON.stringify({
      id: completion.id,
      object: completion.object,
      model: completion.model,
      usage: completion.usage,
      choices_length: completion.choices?.length || 0,
      finish_reason: completion.choices?.[0]?.finish_reason || 'unknown'
    }));
    
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      console.error(`[${requestId}] OpenAI Error: No content returned.`);
      throw new Error('No content generated by OpenAI.');
    }
    
    // Validate the response is proper JSON
    try {
      const jsonObj = JSON.parse(responseText);
      if (Object.keys(jsonObj).length === 0) {
        console.warn(`[${requestId}] OpenAI returned empty JSON object.`);
      } else {
        console.log(`[${requestId}] OpenAI JSON validation successful. Found ${Object.keys(jsonObj).length} document keys.`);
      }
    } catch (jsonError) {
      console.error(`[${requestId}] OpenAI returned invalid JSON: ${responseText.substring(0, 100)}...`);
      // Continue anyway, as the main parser will handle this more gracefully
    }

    const tokens = {
      input: completion.usage?.prompt_tokens || 0,
      output: completion.usage?.completion_tokens || 0,
      total: completion.usage?.total_tokens || 0
    };

    console.log(`[${requestId}] OpenAI generation successful. Tokens: ${JSON.stringify(tokens)}`);

    return {
      responseText: responseText || '',
      modelUsed: OPENAI_MODEL,
      tokens: tokens
    };

  } catch (error: any) {
    // Add more specific logging for connection errors
    const errorMessage = error.message || String(error);
    console.error(`[${requestId}] Error calling OpenAI:`, errorMessage);
     if (error.response?.data) {
      console.error(`[${requestId}] OpenAI API Error Details:`, error.response.data);
    }
    if (errorMessage.toLowerCase().includes('connection') || errorMessage.toLowerCase().includes('network')) {
       console.error(`[${requestId}] OpenAI API call failed likely due to a network/connection issue.`);
       throw new Error(`OpenAI API Error: Connection error. Please check network connectivity and OpenAI status.`);
    }
    throw new Error(`OpenAI API Error: ${errorMessage}`);
  }
}

// Updated generateWithAnthropic (relying on prompt for JSON)
async function generateWithAnthropic(
  apiKey: string,
  prompt: string,
  requestId: string,
  isBackground: boolean
): Promise<{ responseText: string; modelUsed: string; tokens: { input: number, output: number, total: number } }> {
  console.log(`[${requestId}] Attempting generation with Anthropic model: ${ANTHROPIC_MODEL} (Requesting JSON structure via prompt)`);
  const anthropic = new Anthropic({ apiKey });

  try {
    const messageFn = () => anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: TOKEN_LIMITS.anthropic,
        system: "You are DocuMentor, a specialized technical documentation generator. You MUST output ONLY valid, non-empty JSON objects containing markdown-formatted documentation. Your entire response must be a single, parseable JSON object with at least one document - no text before or after. NEVER return an empty JSON object {}. When generating Application Flow documentation, include multiple Mermaid diagrams with proper syntax in markdown code blocks using ```mermaid for flowcharts and sequence diagrams.",
        messages: [{ role: "user", content: prompt }],
      });

    const response = await withRetry(
      messageFn,
      {
        retries: 2,
        retryDelayMs: 1500,
        onRetry: (attempt, error, willRetry) => console.warn(`[${requestId}] Anthropic attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}. ${willRetry ? 'Retrying...' : 'Giving up.'}`),
        isBackground,
        timeoutMs: isBackground ? 840000 : 60000, // Use longer timeout for background functions
        errorMessage: `Anthropic API call timed out for model ${ANTHROPIC_MODEL}`
      }
    );

    let responseText = '';
    if (response.content && Array.isArray(response.content)) {
      // Handle potential TextBlock or other block types
      responseText = response.content.map(block => block.type === 'text' ? block.text : '').join('');
    } else {
        console.warn(`[${requestId}] Unexpected Anthropic response content format:`, response.content);
    }

    if (!responseText) {
      console.error(`[${requestId}] Anthropic Error: No content returned. Stop reason: ${response.stop_reason}`);
      throw new Error(`No content generated by Anthropic. Stop Reason: ${response.stop_reason}`);
    }

    responseText = responseText.replace(/^```json\s*([\s\S]*?)\s*```$/, '$1').trim(); // Clean ```json

    const usage = response.usage;
    const tokens = {
      input: usage?.input_tokens || 0,
      output: usage?.output_tokens || 0,
      total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0)
    };

    console.log(`[${requestId}] Anthropic generation successful. Tokens: ${JSON.stringify(tokens)}`);

    return {
      responseText: responseText,
      modelUsed: ANTHROPIC_MODEL,
      tokens: tokens
    };

  } catch (error: any) {
    console.error(`[${requestId}] Error calling Anthropic:`, error.message);
     if (error.response?.data) {
      console.error(`[${requestId}] Anthropic API Error Details:`, error.response.data);
    }
    throw new Error(`Anthropic API Error: ${error.message}`);
  }
}

// Main API Handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'failed', error: 'Method not allowed' });
  }

  // Extract request ID from headers or generate a new one
  const requestId = req.headers['x-request-id'] as string || nanoid();
  console.log(`[${requestId}] Starting documentation generation request`);
  
  // Check if this is a background function request from Netlify
  const isBackground = req.headers['x-netlify-background'] === 'true';
  console.log(`[${requestId}] Background Processing: ${isBackground}`);

  try {
    // Extract required fields from request body
    const body = req.body as GenerateDocsRequestBody;
    const { projectDetails, selectedDocs, provider, apiKey } = body;
    
    // Log the raw selectedDocs object from the request
    console.log(`[${requestId}] Raw selectedDocs from request:`, JSON.stringify(selectedDocs));

    // Validate required fields
    if (!projectDetails || !selectedDocs || !provider || !apiKey) {
      console.error(`[${requestId}] Missing required fields in request`);
      return res.status(400).json({ 
        status: 'failed',
        error: 'Missing required fields: projectDetails, selectedDocs, provider, and apiKey are required', 
        requestId 
      });
    }

    // Convert selectedDocs object to array of keys where value is true
    // Fix: Check that selectedDocs is properly structured 
    if (typeof selectedDocs !== 'object') {
      console.error(`[${requestId}] Invalid selectedDocs format: ${typeof selectedDocs}`);
      return res.status(400).json({
        status: 'failed',
        error: 'Invalid selectedDocs format. Expected an object with boolean values.',
        requestId
      });
    }

    // Fix: Ensure proper parsing of selectedDocs object to extract document keys
    const selectedDocKeys = Object.entries(selectedDocs)
      .filter(([key, value]) => {
        // Add debug logs for each key-value pair
        console.log(`[${requestId}] Document selection: key=${key}, value=${value}, type=${typeof value}`);
        return Boolean(value); // Convert any truthy value to true
      })
      .map(([key]) => key);

    console.log(`[${requestId}] Processed selectedDocKeys:`, selectedDocKeys);

    // Validate that at least one document is selected BEFORE building the prompt
    if (selectedDocKeys.length === 0) {
      console.error(`[${requestId}] No documents selected`);
      // Return error immediately if no documents are selected
      return res.status(400).json({
        status: 'failed',
        error: 'Please select at least one document type to generate',
        requestId
      });
    }

    // Log the document keys that were selected
    console.log(`[${requestId}] Selected document types (${selectedDocKeys.length}): ${selectedDocKeys.join(', ')}`);

    // Build the prompt from project details and selected documents
    const prompt = buildPrompt(projectDetails, selectedDocs);
    console.log(`[${requestId}] Built prompt for ${selectedDocKeys.length} document types`);
    
    // Add a debug log of the first 500 chars of the prompt
    console.log(`[${requestId}] Prompt preview (first 500 chars): ${prompt.substring(0, 500)}...`);

    // Process response based on provider
    let result: { responseText: string; modelUsed: string; tokens: { input: number; output: number; total: number } };
    try {
      console.log(`[${requestId}] Starting generation with ${provider} provider`);

    switch (provider.toLowerCase()) {
        case 'gemini':
          // Try the primary model first, fall back to alternative if needed
          try {
            result = await generateWithGemini(apiKey, GEMINI_MODELS.PRIMARY, prompt, requestId, isBackground);
          } catch (error: any) {
            console.log(`[${requestId}] Primary Gemini model failed, trying fallback: ${error.message}`);
            result = await generateWithGemini(apiKey, GEMINI_MODELS.FALLBACK, prompt, requestId, isBackground);
          }
          break;
      case 'openai':
          result = await generateWithOpenAI(apiKey, prompt, requestId, isBackground);
        break;
      case 'anthropic':
          result = await generateWithAnthropic(apiKey, prompt, requestId, isBackground);
        break;
      default:
          return res.status(400).json({ 
            status: 'failed',
            error: `Invalid provider: ${provider}. Supported providers are: gemini, openai, anthropic`,
            requestId
          });
      }
    } catch (generationError: any) {
      console.error(`[${requestId}] Generation error with ${provider}:`, generationError.message);
      
      // If in background mode, store the error and return success with the requestId
      if (isBackground) {
        const errorData: ApiResponseType = {
          status: 'failed',
          message: 'Document generation failed',
          error: generationError.message || 'Unknown error during generation',
          requestId,
          debug: {
            provider,
            timestamp: new Date().toISOString(),
            error: generationError.message
          }
        };
        
        await saveGenerationResult(requestId, errorData);
        return res.status(202).json({ 
          message: 'Generation task started in background, but encountered an error',
          requestId, 
          isBackgroundProcessing: true 
        });
      }
      
      // If not background, return the error directly
      return res.status(500).json({ 
        status: 'failed',
        error: generationError.message || 'Unknown error during generation',
        requestId
      });
    }
    
    // Process the raw response text into structured data
    console.log(`[${requestId}] Raw response from ${provider} (length: ${result.responseText.length}): ${result.responseText.substring(0, 200)}...`);
    
    // Add detailed logging of the ENTIRE raw response for debugging
    console.log(`[${requestId}] Raw response from ${provider} (length: ${result.responseText.length}):`, result.responseText);
    
    try {
      // First check if the response is valid JSON
      if (!result.responseText || result.responseText.trim() === '') {
        throw new Error('Empty response received from AI provider');
      }
      
      // Try to parse the JSON response from the AI
      let parsedResponse: StructuredGenerationResponse;
      try {
        parsedResponse = JSON.parse(result.responseText);
      } catch (jsonError: any) {
        console.error(`[${requestId}] Failed to parse AI response: ${jsonError.message}`);
        // Try to clean up the response if it might be wrapped in markdown code blocks
        const cleanedResponse = result.responseText.replace(/^```json\s*([\s\S]*?)\s*```$/g, '$1').trim();
        try {
          parsedResponse = JSON.parse(cleanedResponse);
          console.log(`[${requestId}] Successfully parsed JSON after cleaning markdown code blocks`);
        } catch (secondError) {
          // If still failing, rethrow the original error
          throw jsonError;
        }
      }
      
      // Check if the response is empty or has no keys
      if (!parsedResponse || Object.keys(parsedResponse).length === 0) {
        console.error(`[${requestId}] AI provider returned empty JSON object: ${result.responseText}`);
        
        // Extract the requested document titles from the prompt for fallback
        const requestedDocTitlesRegex = /<final_instruction>[\s\S]*?these (\d+) document types:[\s\S]*?((?:- "[^"]+"\n)+)/i;
        const promptMatch = prompt.match(requestedDocTitlesRegex);
        const requestedTitles: string[] = [];
        
        if (promptMatch && promptMatch[2]) {
          // Extract titles from the matched section in the prompt
          const titleLines = promptMatch[2].split('\n');
          titleLines.forEach(line => {
            const titleMatch = line.match(/- "([^"]+)"/);
            if (titleMatch && titleMatch[1]) {
              requestedTitles.push(titleMatch[1]);
            }
          });
          console.log(`[${requestId}] Extracted ${requestedTitles.length} document titles from prompt for fallback`);
        }
        
        // Create a fallback document with error information and minimal template documents
        const fallbackContent = `# Generation Failed - Empty Response
        
## What Happened
The AI provider (${provider.toUpperCase()}) returned an empty response. This could be due to:
- Rate limiting
- Token limits exceeded
- Content filtering triggered
- API connectivity issues

## How to Fix
1. Please try again with a different AI provider
2. Simplify your project details and reduce the number of document types
3. Check your API key and ensure it has proper permissions
4. If using OpenAI or Anthropic, check your account usage and quotas

## Technical Details
- Provider: ${provider}
- Model: ${result.modelUsed}
- Timestamp: ${new Date().toISOString()}
- Response Length: ${result.responseText.length} characters
- Response Content: \`${result.responseText}\`
`;

        const fallbackDocuments = [{
          title: "Error Report",
          content: fallbackContent
        }];
        
        // Add fallback documents for each requested document type
        if (requestedTitles.length > 0) {
          requestedTitles.forEach(title => {
            fallbackDocuments.push({
              title,
              content: `# ${title}\n\n## Overview\n\nThis is a minimal placeholder document. The AI provider returned an empty response, but this document type was requested.\n\n## Basic Outline\n\n- Section 1\n- Section 2\n- Section 3`
            });
          });
          console.log(`[${requestId}] Added ${requestedTitles.length} minimal fallback documents`);
        }
        
        // Create response with fallback documents and error flag
        const errorData: ApiResponseType = {
          status: 'completed', // Mark as completed, but with error flag
          message: 'AI provider returned empty response. Fallback content generated.',
          documents: fallbackDocuments,
          requestId,
          debug: {
            provider,
            model: result.modelUsed,
            timestamp: new Date().toISOString(),
            processingTimeMs: Date.now() - new Date().getTime(),
            contentLength: result.responseText.length,
            tokensUsed: result.tokens,
            error: 'Empty response from AI provider',
            originalResponse: result.responseText
          }
        };
        
        if (isBackground) {
          await saveGenerationResult(requestId, errorData);
          return res.status(202).json({ 
            message: 'Document generation task started, but AI returned empty response. Fallback content created.',
            requestId,
            isBackgroundProcessing: true
          });
        }
        
        return res.status(200).json(errorData);
      }
      
      // Convert the response to documents array format expected by the client
      const documents = Object.entries(parsedResponse).map(([title, content]) => ({
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content)
      }));
      
      if (documents.length === 0) {
        throw new Error('No documents were generated from non-empty response');
      }
      
      // Create final response with debug info
      const responseData: ApiResponseType = {
        status: 'completed',
        message: 'Documents generated successfully',
        documents,
        requestId,
        debug: {
          provider,
          model: result.modelUsed,
          timestamp: new Date().toISOString(),
          processingTimeMs: Date.now() - new Date().getTime(),
          contentLength: result.responseText.length,
          tokensUsed: result.tokens
        }
      };
      
      // If this is a background process, store the result and return a simple response
      if (isBackground) {
        await saveGenerationResult(requestId, responseData);
        return res.status(202).json({ 
          message: 'Document generation task started',
          requestId,
          isBackgroundProcessing: true
        });
      }
      
      // Otherwise return the full result
      return res.status(200).json(responseData);
      
    } catch (parseError: any) {
      console.error(`[${requestId}] Failed to parse AI response:`, parseError.message);
      
      // Create error response
      const errorData: ApiResponseType = {
        status: 'failed',
        message: 'Failed to parse generated documentation',
        error: parseError.message || 'Invalid JSON response from AI provider',
        requestId,
        debug: {
          provider,
          model: result.modelUsed,
          timestamp: new Date().toISOString(),
          rawResponsePreview: result.responseText.substring(0, 500) + (result.responseText.length > 500 ? '...' : '')
        }
      };
      
      // If in background mode, store the error and return success with the requestId
      if (isBackground) {
        await saveGenerationResult(requestId, errorData);
        return res.status(202).json({ 
          message: 'Generation task started in background, but encountered a parsing error',
          requestId,
          isBackgroundProcessing: true
        });
      }
      
      // If not background, return the error directly
      return res.status(500).json(errorData);
    }
    
  } catch (error: any) {
    console.error(`[${requestId}] Unhandled error in generate-docs API:`, error);
    return res.status(500).json({ 
      status: 'failed',
      error: error.message || 'An unexpected error occurred',
      requestId
    });
  }
}

// Utility to save results (simplified, assumes saveGenerationResult handles storage)
// async function saveGenerationResult(requestId: string, data: any) {
//   console.log(`[${requestId}] Saving generation result/error...`);
//   // In a real app, save to Netlify Blobs, DB, or file system
//   // Example: await getStore('generationResults').setJSON(requestId, data);
//   // For now, just log
//   console.log(`[${requestId}] Result for save:`, JSON.stringify(data).substring(0, 200) + '...'); 
// }
