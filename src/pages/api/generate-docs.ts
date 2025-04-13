import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define expected structure for the request body
interface GenerateDocsRequestBody {
  projectDetails: {
    projectName: string;
    projectType: string;
    projectGoal: string;
    features: string;
    techStack: string;
  };
  selectedDocs: {
    requirements: boolean;
    frontendGuidelines: boolean;
    backendStructure: boolean;
    appFlow: boolean;
    techStackDoc: boolean;
    systemPrompts: boolean;
    fileStructure: boolean;
  };
}

// Define possible response structures
type Data = {
  message: string;
  // Optionally include generated file paths or content later
}

type ErrorResponse = {
    error: string;
}


// --- Gemini API Configuration ---
const MODEL_NAME = "gemini-1.0-pro"; // Or your desired model

// IMPORTANT: Store your API key securely. Using environment variables is recommended.
// Create a .env.local file in your project root with:
// GEMINI_API_KEY=YOUR_API_KEY_HERE
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable not set.");
  // Optionally throw an error during build/startup in a real app
}

// Initialize the Generative AI client
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI?.getGenerativeModel({ model: MODEL_NAME });

// Safety settings for the Gemini API call
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- Helper Function to Build Prompt ---
function buildPrompt(details: GenerateDocsRequestBody['projectDetails'], docs: GenerateDocsRequestBody['selectedDocs']): string {
    const selectedDocList = Object.entries(docs)
        .filter(([, value]) => value)
        .map(([key]) => `- ${key.replace(/([A-Z])/g, ' $1').trim()}`) // Format key nicely
        .join('
');

    // More sophisticated prompt structure
    return `
Act as an expert technical writer and software architect.
Your task is to generate preliminary planning documentation in Markdown format for a software project.

**Project Details:**
*   **Project Name:** ${details.projectName || '(Not specified)'}
*   **Project Type:** ${details.projectType || '(Not specified)'}
*   **Main Goal/Purpose:** ${details.projectGoal || '(Not specified)'}
*   **Key Features:** ${details.features || '(Not specified)'}
*   **Known Tech Stack Hints:** ${details.techStack || '(Not specified)'}

**Requested Documents:**
Please generate the following documents, ensuring each starts with a clear heading (e.g., '# Project Requirements Document'):
${selectedDocList || '(No documents selected)'}

**Instructions & Best Practices:**
*   Use Markdown formatting extensively (headings, lists, code blocks, bold/italics).
*   Where applicable (like App Flow or Backend Structure), consider using Mermaid syntax within Markdown code blocks for diagrams (e.g., sequenceDiagram, classDiagram, erDiagram).
*   Tailor the content based on the project type and details provided.
*   Incorporate common software development best practices relevant to each document type (e.g., mention REST principles for APIs, accessibility for frontend, MVC/MVVM patterns, database normalization hints).
*   Provide practical, actionable starting points for each document. If details are sparse, make reasonable assumptions based on the project type.
*   For 'System Prompts', explain its purpose and provide examples if AI interaction is implied by features/goal, otherwise state it might not be applicable.
*   For 'File Structure', suggest a logical layout based on the project type and tech stack hints.

**Output Format:**
Combine all requested documents into a single Markdown response. Separate each document clearly with its main heading. Do not include introductory or concluding remarks outside the document content itself.
    `;
}


// --- API Handler ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Check if Gemini Client is initialized (API Key is present)
  if (!genAI || !model) {
      console.error("Gemini AI client not initialized. Check API Key.");
      return res.status(500).json({ error: "Server configuration error: AI service unavailable." });
  }

  try {
    const { projectDetails, selectedDocs }: GenerateDocsRequestBody = req.body;

    // Basic Input Validation
    if (!projectDetails?.projectName) {
      return res.status(400).json({ error: 'Project Name is required.' });
    }
    const anyDocSelected = Object.values(selectedDocs).some(isSelected => isSelected);
    if (!anyDocSelected) {
         return res.status(400).json({ error: 'Please select at least one document type to generate.' });
    }


    // Build the prompt for the Gemini API
    const prompt = buildPrompt(projectDetails, selectedDocs);
    console.log("Sending prompt to Gemini API..."); // Avoid logging the full prompt in production if it contains sensitive info

    // --- Call Gemini API ---
    const generationConfig = {
        temperature: 0.7, // Adjust creativity/determinism
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192, // Adjust based on expected output size & model limits
    };

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [], // Start a fresh chat session for each request
    });

    const result = await chat.sendMessage(prompt); // Send the constructed prompt

    // --- Process Response ---
    if (result.response) {
        const responseText = result.response.text();
        console.log("Received response from Gemini API."); // Log success, maybe length

        // --- TODO: Save Generated Content ---
        // In a real application, you would parse `responseText` (which should be Markdown)
        // and potentially split it into separate files or store it appropriately.
        // For now, we just log it and send success.

        // Example: Save the entire response to a file (using Node.js fs for demonstration)
        // import fs from 'fs/promises';
        // import path from 'path';
        // const outputDir = path.resolve(process.cwd(), 'generated_docs');
        // await fs.mkdir(outputDir, { recursive: true });
        // const outputFilePath = path.join(outputDir, `${projectDetails.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_docs.md`);
        // await fs.writeFile(outputFilePath, responseText);
        // console.log(`Generated docs saved to: ${outputFilePath}`);
        // ---

        res.status(200).json({ message: 'Documentation generation successful! (Content logged on server)' });
    } else {
        // Handle cases where the response might be blocked or empty
        console.error("Gemini API call completed but returned no content or was blocked.", result);
         // Attempt to get blocking reason if available
        const blockReason = result.response?.promptFeedback?.blockReason;
        const safetyRatings = result.response?.candidates?.[0]?.safetyRatings;
        let errorMessage = "Gemini API call failed or response was blocked.";
        if(blockReason){
            errorMessage += ` Reason: ${blockReason}.`;
        }
        if(safetyRatings){
             errorMessage += ` Safety Ratings: ${JSON.stringify(safetyRatings)}`;
        }
        res.status(500).json({ error: errorMessage });
    }

  } catch (error) {
    console.error("Error calling Gemini API or processing request:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during generation.';
    res.status(500).json({ error: `Documentation generation failed: ${message}` });
  }
}
