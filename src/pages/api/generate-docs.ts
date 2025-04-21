/* eslint-disable */
// Timestamp: ${new Date().toISOString()} - Removed ineffective in-memory rate limiter for serverless environment
// Timestamp: ${new Date().toISOString()} - Refactored Gemini logic, updated models, improved storage
// Timestamp: ${new Date().toISOString()} - Improved API implementation with error handling and response processing
// Timestamp: ${new Date().toISOString()} - Updated Anthropic model to 3.7 Sonnet and adjusted token limit
// Timestamp: ${new Date().toISOString()} - Updated to use centralized retry utility functions
// Timestamp: 2023-11-20T00:00:00.000Z - Fixed compatibility with Netlify background functions
// Timestamp: 2023-11-21T00:00:00.000Z - Fixed 502 error by correctly implementing background function pattern
// Timestamp: ${new Date().toISOString()} - Updated OpenAI model to gpt-4.1 and increased token limit
import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentCandidate, GenerateContentResponse } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { withRetry } from '@/utils/index';
import { saveGenerationResult } from '@/utils/saveResult';

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
  openai: 32768, // Updated limit for GPT-4.1 max output tokens
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
  const sections: DocumentSection[] = [];
  // Use a more robust regex to handle potential variations in markdown headings
  const sectionRegex = /^#{1,3}\s+(.+?)\s*?\n([\s\S]*?)(?=\n#{1,3}\s+|$)/gm;
  let match;

  let lastIndex = 0;
  while ((match = sectionRegex.exec(content)) !== null) {
    // Capture content before the first heading as Introduction
    if (sections.length === 0 && match.index > 0) {
      sections.push({
        title: 'Introduction',
        content: content.substring(0, match.index).trim()
      });
    }
    sections.push({
      title: match[1].trim(),
      content: match[2].trim()
    });
    lastIndex = sectionRegex.lastIndex;
  }

  // If no sections were found, treat the whole content as one section
  if (sections.length === 0 && content.trim().length > 0) {
    sections.push({
      title: 'Documentation',
      content: content.trim()
    });
  } else if (lastIndex < content.length) {
     // Capture any trailing content after the last heading
     const trailingContent = content.substring(lastIndex).trim();
     if (trailingContent) {
       if (sections.length > 0) {
         // Append to the last section if it exists
         sections[sections.length - 1].content += `\\n\\n${trailingContent}`;
       } else {
         // Or create an Introduction section if no sections were parsed
         sections.push({ title: 'Introduction', content: trailingContent });
       }
     }
  }


  // Filter out empty sections potentially created during parsing
  return sections.filter(section => section.title.trim() !== '' || section.content.trim() !== '');
}


// Updated prompt building function
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

  let prompt = `## Project Context\\\\n\\\\n` +
               `**Project Name:** ${projectName || 'Not Specified'}\\\\n` +
               `**Project Type:** ${projectType || 'Not Specified'}\\\\n` +
               `**Core Goal/Objective:** ${projectGoal || 'Not Specified'}\\\\n` +
               `${projectDescription ? `**Detailed Description:** ${projectDescription}\\\\n` : ''}` +
               `**Target Audience:** ${targetAudience || 'Not Specified'}\\\\n` +
               `**User Personas:** ${userPersonas || 'Not Specified'}\\\\n` +
               `**Key Features:**\\\\n${features ? features.split(/[\\n,]+/).map(f => `- ${f.trim()}`).join('\\\\n') : '- Not Specified'}\\\\n` +
               `**Technology Stack:** ${techStack || 'Not Specified'}\\\\n` +
               `${hasFrontend !== undefined ? `**Includes Frontend:** ${hasFrontend ? 'Yes' : 'No'}\\\\n` : ''}` +
               `${hasBackend !== undefined ? `**Includes Backend:** ${hasBackend ? 'Yes' : 'No'}\\\\n` : ''}` +
               `**Key Challenges/Risks:** ${keyChallenges || 'Not Specified'}\\\\n` +
               `**Success Metrics:** ${successMetrics || 'Not Specified'}\\\\n\\\\n` +
               `## Documentation Task\\\\n\\\\n` +
               `Based *strictly* on the **Project Context** provided above, generate the following technical documentation sections. ` +
               `Use detailed markdown formatting (headings, subheadings, lists, code blocks \\\`\\\`\\\`language...\\\`\\\`\\\`, emphasis). ` +
               `Be highly specific and avoid generic statements or placeholders. Assume standard best practices where details are missing but align with the provided stack and project type. ` +
               `Do NOT invent features, technologies, or requirements not implied by the context.\\\\n\\\\n` +
               `### Selected Documentation Sections:\\\\n\\\\n`;

  let sectionCount = 1;

  const addSection = (title: string, details: string[]) => {
    prompt += `${sectionCount}. **${title}**\\\\n`;
    details.forEach(detail => prompt += `   - ${detail}\\\\n`);
    prompt += `   *Instructions:* Provide thorough, specific details based *only* on the project information given above. Structure clearly using relevant subheadings (##, ###) within this section. Provide concrete examples where applicable (e.g., code snippets, API endpoints, user stories).\\\\n\\\\n`;
    sectionCount++;
  };

  if (selectedDocs.requirements) {
    addSection('Requirements Document (PRD/BRD)', [
      'Detailed functional requirements derived directly from the Key Features list.',
      'Specific non-functional requirements (e.g., performance expectations based on project type, security needs, scalability considerations).',
      'User stories for 3-5 core features (Format: "As a [persona from User Personas/Target Audience], I want [feature] so that [benefit derived from Core Goal]").',
      'Acceptance criteria for 2 key user stories (specific, measurable conditions for completion).',
      'Identify technical constraints or dependencies implied by the Technology Stack.',
      'Define explicit scope boundaries (what is NOT included, based on features and goal).',
      'Prioritize features (e.g., Must-Have, Should-Have) based on the Core Goal.'
    ]);
  }

  if (selectedDocs.frontendGuidelines && (hasFrontend === undefined || hasFrontend === true)) {
    addSection('Frontend Guidelines', [
      'Suggest a component architecture/structure (e.g., Atomic Design, feature folders) suitable for the Technology Stack (e.g., React, Angular, Vue).',
      'Recommend a state management approach (e.g., Context API, Redux, Zustand, Pinia) based on the Technology Stack and project complexity.',
      'Propose styling conventions (e.g., Tailwind CSS, CSS Modules, Styled Components) aligning with the Technology Stack.',
      'Define standard responsive design breakpoints (e.g., sm, md, lg, xl).',
      'Provide a code example of a reusable UI component pattern (e.g., a Button or Card) using the proposed stack and styling.',
      'Outline a routing strategy (e.g., Next.js App Router, React Router DOM, Vue Router).',
      'List key accessibility considerations (target WCAG AA compliance).',
      'Describe a standard approach for handling forms and input validation.',
      'Define patterns for displaying loading states and handling/displaying errors.'
    ]);
  }

  if (selectedDocs.backendStructure && (hasBackend === undefined || hasBackend === true)) {
    addSection('Backend Architecture', [
      'Propose an API design style (e.g., RESTful, GraphQL) suitable for the Project Type and Technology Stack.',
      'Include an example API endpoint definition (e.g., `POST /api/users` with request/response body structure).',
      'Outline a potential database schema (suggest key tables/collections and relationships based on features and project type).',
      'Recommend an authentication/authorization strategy (e.g., JWT, OAuth 2.0, session cookies) relevant to the Project Type.',
      'List essential security measures (input validation, output encoding, rate limiting, secure secrets management).',
      'Define a logging strategy (levels: info, warn, error; format; potential storage solution).',
      'Suggest error handling conventions (e.g., standard HTTP status codes, error response format).',
      'Propose caching mechanisms if relevant (e.g., Redis, Memcached, CDN) based on potential performance needs.',
      'Identify potential background jobs or asynchronous tasks based on Features.'
    ]);
  }

  if (selectedDocs.appFlow) {
    addSection('Application Flow', [
      'Describe the user flow for a core feature using a numbered list or simple diagram description.',
      'Detail the interaction sequence between frontend and backend (if applicable) for one key action (e.g., submitting a form).',
      'Illustrate the data flow for a critical piece of information (e.g., from user input to database and back to UI).',
      'Explain the handling of a specific edge case or error scenario mentioned in Key Challenges or implied by features.'
    ]);
  }

  if (selectedDocs.techStackDoc) {
    addSection('Technology Stack Details', [
      'Detailed breakdown of each technology listed in the Technology Stack.',
      'Justification for choosing each major technology, linking it to the Project Goal or specific Features.',
      'Specify recommended versions (e.g., Node.js LTS, latest stable React).',
      'List key libraries/frameworks within the stack and explain their primary roles.',
      'Identify potential integration points and challenges between stack components.',
      'Provide links to official documentation for major technologies.'
    ]);
  }

  if (selectedDocs.systemPrompts && projectType?.toLowerCase().includes('ai')) {
    addSection('AI System Prompts (Examples)', [
      'Example system prompt for an AI feature derived from the project Features or Description.',
      'Example user prompt and the expected AI response format/structure.',
      'Outline strategies for managing conversation context or history.',
      'Describe how the system should handle ambiguous user inputs or generation errors.'
    ]);
  }

  if (selectedDocs.fileStructure) {
    addSection('Recommended Project Structure', [
      'Provide a tree-like representation of a recommended file/folder structure.',
      'Tailor the structure based on the Technology Stack (e.g., Next.js conventions, standard backend layouts).',
      'Include separate sections for frontend and backend if applicable.',
      'Explain the purpose of key directories (e.g., `src/components`, `src/utils`, `server/routes`, `db/models`).'
    ]);
  }

  prompt += `\\\\n**Final Instruction:** Generate the content for *only* the selected sections listed above. Ensure the output is a single, coherent markdown document starting directly with the first selected section heading. Do not include any introductory or concluding remarks outside of the requested sections.`;

  return prompt;
}

// Reusable function for Gemini API calls
async function generateWithGemini(
  apiKey: string,
  modelName: string,
  prompt: string,
  requestId: string
): Promise<{ content: string; modelUsed: string; tokens: { input: number, output: number, total: number } }> {
  console.log(`[${requestId}] Attempting generation with Gemini model: ${modelName}`);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName, safetySettings });

  const generationConfig = {
    maxOutputTokens: TOKEN_LIMITS.gemini,
    // Add other config like temperature if needed here
  };

  try {
    // Structure the first argument as GenerateContentRequest
    const generationFn = () => model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig });

    const result = await withRetry(
      generationFn,
      {
        retries: 2,
        retryDelayMs: 1500,
        onRetry: (attempt, error) => console.warn(`[${requestId}] Gemini attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}. Retrying...`)
      }
    );

    const response = result.response;

    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error(`[${requestId}] Gemini Error: No candidates returned for model ${modelName}.`, response?.promptFeedback);
      throw new Error('No content generated by Gemini. Prompt feedback: ' + JSON.stringify(response?.promptFeedback));
    }

    const candidate: GenerateContentCandidate | undefined = response.candidates[0];

    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn(`[${requestId}] Gemini generation finished with reason: ${candidate.finishReason}. Content might be incomplete.`, candidate?.safetyRatings);
      if (candidate.finishReason === 'SAFETY') {
        throw new Error(`Generation stopped due to safety settings. Ratings: ${JSON.stringify(candidate.safetyRatings)}`);
      } else if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn(`[${requestId}] Max tokens reached for model ${modelName}. Output might be truncated.`);
      } else {
         throw new Error(`Generation finished unexpectedly: ${candidate.finishReason}`);
      }
    }

    let combinedContent = '';
    if (candidate?.content?.parts) {
      combinedContent = candidate.content.parts
        .map((part: GeminiPart) => typeof part === 'string' ? part : part.text || '')
        .join('');
    } else {
      console.warn(`[${requestId}] No parts found in Gemini candidate for model ${modelName}.`);
    }

    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(combinedContent.length / 4);
    const totalTokens = inputTokens + outputTokens;
    const tokens = { input: inputTokens, output: outputTokens, total: totalTokens };

    console.log(`[${requestId}] Gemini generation successful with ${modelName}. Estimated tokens: ${JSON.stringify(tokens)}`);

    return {
      content: combinedContent,
      modelUsed: modelName,
      tokens: tokens
    };

  } catch (error: any) {
    console.error(`[${requestId}] Error calling Gemini model ${modelName}:`, error.message);
    if (error.response?.data) {
      console.error(`[${requestId}] Gemini API Error Details:`, error.response.data);
    }
    throw new Error(`Gemini API Error (${modelName}): ${error.message}`);
  }
}

// Add similar wrappers for OpenAI and Anthropic if they exist
async function generateWithOpenAI(
  apiKey: string,
  prompt: string,
  requestId: string
): Promise<{ content: string; modelUsed: string; tokens: { input: number, output: number, total: number } }> {
  console.log(`[${requestId}] Attempting generation with OpenAI model: ${OPENAI_MODEL}`);
  const openai = new OpenAI({ apiKey });

  try {
    const completionFn = () => openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are a technical documentation writer. Generate detailed, accurate documentation based on the provided project context and instructions. Use Markdown formatting extensively." },
          { role: "user", content: prompt }
        ],
        max_tokens: TOKEN_LIMITS.openai,
      });

    const completion = await withRetry(
      completionFn,
      {
        retries: 2,
        retryDelayMs: 1500,
        // Removed backoffFactor
        onRetry: (attempt, error) => console.warn(`[${requestId}] OpenAI attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}. Retrying...`)
      }
    );

    const content = completion.choices[0]?.message?.content;
    const usage = completion.usage;

    if (!content) {
      console.error(`[${requestId}] OpenAI Error: No content returned.`);
      throw new Error('No content generated by OpenAI.');
    }

    const tokens = {
      input: usage?.prompt_tokens || 0,
      output: usage?.completion_tokens || 0,
      total: usage?.total_tokens || 0
    };

    console.log(`[${requestId}] OpenAI generation successful. Tokens: ${JSON.stringify(tokens)}`);

    return {
      content: content.trim(),
      modelUsed: OPENAI_MODEL,
      tokens: tokens
    };

  } catch (error: any) {
    console.error(`[${requestId}] Error calling OpenAI:`, error.message);
     if (error.response?.data) {
      console.error(`[${requestId}] OpenAI API Error Details:`, error.response.data);
    }
    throw new Error(`OpenAI API Error: ${error.message}`);
  }
}

async function generateWithAnthropic(
  apiKey: string,
  prompt: string,
  requestId: string
): Promise<{ content: string; modelUsed: string; tokens: { input: number, output: number, total: number } }> {
  console.log(`[${requestId}] Attempting generation with Anthropic model: ${ANTHROPIC_MODEL}`);
  const anthropic = new Anthropic({ apiKey });

  try {
    const messageFn = () => anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: TOKEN_LIMITS.anthropic,
        system: "You are a technical documentation writer. Generate detailed, accurate documentation based on the provided project context and instructions. Use Markdown formatting extensively. Output only the requested markdown sections.",
        messages: [{ role: "user", content: prompt }],
      });

    const response = await withRetry(
      messageFn,
      {
        retries: 2,
        retryDelayMs: 1500,
        // Removed backoffFactor
        onRetry: (attempt, error) => console.warn(`[${requestId}] Anthropic attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}. Retrying...`)
      }
    );

    let content = '';
    if (response.content && Array.isArray(response.content)) {
      // Handle potential TextBlock or other block types
      content = response.content.map(block => block.type === 'text' ? block.text : '').join('');
    } else {
        console.warn(`[${requestId}] Unexpected Anthropic response content format:`, response.content);
    }

    if (!content) {
      console.error(`[${requestId}] Anthropic Error: No content returned. Stop reason: ${response.stop_reason}`);
      throw new Error(`No content generated by Anthropic. Stop Reason: ${response.stop_reason}`);
    }

    const usage = response.usage;
    const tokens = {
      input: usage?.input_tokens || 0,
      output: usage?.output_tokens || 0,
      total: (usage?.input_tokens || 0) + (usage?.output_tokens || 0)
    };

    console.log(`[${requestId}] Anthropic generation successful. Tokens: ${JSON.stringify(tokens)}`);

    return {
      content: content.trim(),
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
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // CORS Headers
  const allowedOrigins = [
    'https://cook-fast.webvijayi.com',
    'https://cookfast.netlify.app',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
     res.setHeader('Access-Control-Allow-Origin', '*'); // Be cautious with wildcard in production
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Generate a unique request ID
  const requestId = req.body.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  console.log(`[${requestId}] Received generation request.`);
  res.setHeader('X-Request-ID', requestId);

  // Determine if running as a background function
  const isBackground = req.headers['x-netlify-background'] === 'true';
  console.log(`[${requestId}] Running as background function: ${isBackground}`);

  const { projectDetails, selectedDocs, provider, apiKey } = req.body as GenerateDocsRequestBody;

  if (!projectDetails || !selectedDocs || !provider || !apiKey) {
    console.error(`[${requestId}] Invalid request body: Missing required fields.`);
    return res.status(400).json({ message: 'Invalid request body: Missing required fields.', requestId });
  }

  // Function to perform the generation logic
  const performGeneration = async () => {
    const startTime = Date.now();
    let result: { content: string; modelUsed: string; tokens: { input: number; output: number; total: number } };
    const prompt = buildPrompt(projectDetails, selectedDocs);

    try {
      console.log(`[${requestId}] Starting generation with provider: ${provider}`);
      if (provider === 'gemini') {
          // Try primary model first, then fallback
          try {
            result = await generateWithGemini(apiKey, GEMINI_MODELS.PRIMARY, prompt, requestId);
          } catch (primaryError: any) {
            console.warn(`[${requestId}] Gemini primary model (${GEMINI_MODELS.PRIMARY}) failed: ${primaryError.message}. Trying fallback...`);
            result = await generateWithGemini(apiKey, GEMINI_MODELS.FALLBACK, prompt, requestId);
          }
      } else if (provider === 'openai') {
        result = await generateWithOpenAI(apiKey, prompt, requestId);
      } else if (provider === 'anthropic') {
        result = await generateWithAnthropic(apiKey, prompt, requestId);
      } else {
        throw new Error('Invalid provider selected');
      }

      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;
      console.log(`[${requestId}] Generation successful. Time taken: ${processingTimeMs}ms`);

      const sections = parseContentToSections(result.content);
      console.log(`[${requestId}] Parsed ${sections.length} sections from content.`);

      const responseData = {
        status: 'completed',
        message: 'Documentation generated successfully.',
        content: result.content,
        sections: sections,
        debug: {
          provider: provider,
          model: result.modelUsed,
          timestamp: new Date(startTime).toISOString(),
          processingTimeMs: processingTimeMs,
          contentLength: result.content.length,
          tokensUsed: result.tokens
        },
        requestId // Include requestId in final saved result
      };

      // Save the result to the store
      await saveGenerationResult(requestId, responseData);
      return responseData;

    } catch (error: any) {
      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;
      console.error(`[${requestId}] Generation failed: ${error.message}. Time taken: ${processingTimeMs}ms`, error.stack);

      const errorData = {
        status: 'failed',
        message: `Error generating documentation: ${error.message}`,
        error: error.message,
        debug: {
          provider: provider,
          model: provider === 'gemini' ? GEMINI_MODELS.PRIMARY : (provider === 'openai' ? OPENAI_MODEL : ANTHROPIC_MODEL), // Best guess model
          timestamp: new Date(startTime).toISOString(),
          processingTimeMs: processingTimeMs,
        },
        requestId // Include requestId in final saved result
      };
      
      // Save error result to the store
      await saveGenerationResult(requestId, errorData);
      throw error; // Re-throw for background function handling or immediate response
    }
  };

  // Handle background vs immediate execution
  if (isBackground) {
    console.log(`[${requestId}] Processing request in background.`);
    performGeneration().catch(err => {
       // Errors are saved within performGeneration, just log here if needed
       console.error(`[${requestId}] Background generation process failed: ${err.message}`);
    });
    // Respond immediately that background processing has started
    return res.status(202).json({ 
      status: 'processing',
      message: 'Request accepted for background processing.', 
      requestId: requestId 
    });
  } else {
    // Process immediately and wait for the result
    console.log(`[${requestId}] Processing request immediately.`);
    try {
      const resultData = await performGeneration();
      console.log(`[${requestId}] Immediate generation complete. Sending response.`);
      return res.status(200).json(resultData);
    } catch (error: any) {
      console.error(`[${requestId}] Immediate generation failed. Sending error response.`);
      // Error data is already saved in performGeneration, just return error status
      return res.status(500).json({ 
          status: 'failed',
          message: `Error generating documentation: ${error.message}`,
          error: error.message,
          requestId 
      });
    }
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