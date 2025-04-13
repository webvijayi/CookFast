import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface ValidateKeyRequestBody {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
}

type ValidationResponse = {
  valid: boolean;
  error?: string; // Include error message on failure
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ valid: false, error: `Method ${req.method} Not Allowed` });
  }

  const { provider, apiKey } = req.body as ValidateKeyRequestBody;

  if (!apiKey || !provider) {
    return res.status(400).json({ valid: false, error: 'Provider and API Key are required.' });
  }

  // console.log(`Attempting to validate key for provider: ${provider}`); // Log validation attempt - Removed for production

  try {
    // Removed unused 'isValid' variable. Success is implied if no error is thrown.
    switch (provider) {
      case 'gemini':
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          // Attempt to get a model instance to validate the key
          // Attempt to get a model instance to validate the key
          genAI.getGenerativeModel({ model: "gemini-pro" });
          // console.log("Gemini key validation successful (attempted to get model)."); // Removed for production
        } catch (err) {
          // console.error("Gemini validation error:", err); // Optional: Keep for server-side debugging
          // Ensure a standard Error is thrown for consistent handling
          const errorMessage = err instanceof Error ? err.message : String(err);
          throw new Error(`Gemini key validation failed: ${errorMessage}`);
        }
        break;

      case 'openai':
        try {
          const openai = new OpenAI({ apiKey });
          await openai.models.list();
          // console.log("OpenAI key validation successful (listed models)."); // Removed for production
        } catch (err) {
           // console.error("OpenAI validation error:", err); // Keep error logging if desired, or replace with proper logger
            let specificError = "";
            if (err instanceof OpenAI.APIError) {
                 specificError = ` (Status: ${err.status}, Type: ${err.type})`;
            }
           if (err instanceof OpenAI.AuthenticationError || (err instanceof OpenAI.APIError && err.status === 401)) {
                throw new Error(`OpenAI key validation failed: Invalid API Key.`);
           }
           throw new Error(`OpenAI key validation failed: ${err instanceof Error ? err.message : 'Unknown error'}${specificError}`);
        }
        break;

      case 'anthropic':
        try {
          const anthropic = new Anthropic({ apiKey });
          await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1,
            messages: [{ role: 'user', content: 'hello' }],
          });
          // console.log("Anthropic key validation successful (sent test message)."); // Removed for production
        } catch (err) {
           // console.error("Anthropic validation error:", err); // Keep error logging if desired, or replace with proper logger
            let specificError = "";
             if (err instanceof Anthropic.APIError) {
                 // Use err.name instead of err.type
                 specificError = ` (Status: ${err.status}, Name: ${err.name})`;
             }
            if (err instanceof Anthropic.AuthenticationError || (err instanceof Anthropic.APIError && (err.status === 401 || err.status === 403))) {
                 throw new Error(`Anthropic key validation failed: Invalid API Key.`);
            }
           throw new Error(`Anthropic key validation failed: ${err instanceof Error ? err.message : 'Unknown error'}${specificError}`);
        }
        break;

      default:
        return res.status(400).json({ valid: false, error: 'Invalid provider specified.' });
    }

    // If we reached here without error, the basic check passed
    return res.status(200).json({ valid: true });

  } catch (error) {
    // Catch errors thrown from the switch cases
    // console.error("Validation API Error:", error); // Keep error logging if desired, or replace with proper logger
    return res.status(400).json({ valid: false, error: error instanceof Error ? error.message : 'Validation failed.' });
  }
}
