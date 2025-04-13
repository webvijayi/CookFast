/* eslint-disable */
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit } from '../../utils/rate-limiter';

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
  content: string; // Added to return the generated content
}

type ErrorResponse = { 
  error: string;
  code?: string;
}

// Constants
const GEMINI_MODEL = "gemini-2.5-pro-exp-03-25"; // Use Experimental model as Preview has no free tier
const OPENAI_MODEL = "gpt-4o";  // Current model
const ANTHROPIC_MODEL = "claude-3-7-sonnet-20250219"; // Updated based on user feedback

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Token limits per provider (Reduced for faster response / lower timeout risk)
const TOKEN_LIMITS = {
  gemini: 8192,    // Reduced from 30720
  openai: 8192,    // For gpt-4o
  anthropic: 8192  // Reduced from 100000
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

// Function to validate API key format (basic check)
function validateApiKey(provider: string, apiKey: string): boolean {
  switch (provider) {
    case 'openai':
      return /^sk-[A-Za-z0-9]{32,}$/.test(apiKey);
    case 'anthropic':
      return /^sk-ant-[A-Za-z0-9]{24,}$/.test(apiKey);
    case 'gemini':
      return /^[A-Za-z0-9_-]{39}$/.test(apiKey);
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

    // Set timeout for API calls to prevent hanging requests
    const requestTimeout = 60000; // 60 seconds

    switch (provider) {
      case 'gemini':
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
          
          const generationConfig = { 
            temperature: 0.7, 
            topK: 1, 
            topP: 1, 
            maxOutputTokens: TOKEN_LIMITS.gemini 
          };
          
          const chat = model.startChat({ 
            generationConfig, 
            safetySettings, 
            history: [] 
          });
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
          
          const result = await chat.sendMessage(prompt, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!result.response) {
            throw new Error("Gemini API returned an empty or blocked response");
          }
          
          generatedText = result.response.text();
          
          if (result.response?.promptFeedback?.blockReason) {
            console.warn(`Gemini response potentially blocked. Reason: ${result.response.promptFeedback.blockReason}`);
          }
        } catch (err) { 
          if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Gemini API request timed out');
          }
          throw new Error(`Gemini API request failed: ${err instanceof Error ? err.message : String(err)}`); 
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
              { role: "system", content: "You are an expert technical writer generating Markdown project planning documents." }, 
              { role: "user", content: prompt }
            ],
            temperature: 0.7, 
            max_tokens: TOKEN_LIMITS.openai,
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
          const anthropic = new Anthropic({ apiKey });
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
          
          const msg = await anthropic.messages.create({
            model: ANTHROPIC_MODEL, 
            max_tokens: TOKEN_LIMITS.anthropic, 
            temperature: 0.7,
            system: "You are an expert technical writer generating Markdown project planning documents.",
            messages: [{ role: "user", content: prompt }]
          }, { signal: controller.signal });
          
          clearTimeout(timeoutId);
          
          if (msg.content?.[0]?.type === 'text') {
            generatedText = msg.content[0].text;
          } else {
            throw new Error("Anthropic API returned unexpected/empty content");
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
      // console.log(`Successfully generated content using ${provider}. Length: ${generatedText.length}`); // Removed for production
      // Include the generated content in the response
      return res.status(200).json({
        message: `Successfully generated documentation using ${provider}!`,
        content: generatedText
      }); 
    } else {
      throw new Error("AI generation completed but produced no output text");
    }

  } catch (error) {
    // console.error(`Error in /api/generate-docs (${provider || 'unknown'}) handler:`, error); // Keep error logging if desired, or replace with proper logger

    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorCode = error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_SERVER_ERROR';
    
    return res.status(500).json({ 
      error: `Failed to generate documentation: ${message}`,
      code: errorCode
    });
  }
}
