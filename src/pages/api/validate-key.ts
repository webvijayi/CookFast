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
          const trimmedApiKey = apiKey.trim();
          
          // Basic check for non-empty string
          if (!trimmedApiKey) {
            throw new Error("API key cannot be empty");
          }
          
          const genAI = new GoogleGenerativeAI(trimmedApiKey);
          // Just get a model instance to validate the key
          genAI.getGenerativeModel({ model: "gemini-pro" });
          console.log("Gemini key validation successful");
        } catch (err) {
          console.error("Gemini validation error:", err);
          let errorMessage = "Invalid Gemini API key";
          
          if (err instanceof Error) {
            if (err.message.includes('API key')) {
              errorMessage = "Invalid Gemini API key format or credentials";
            } else {
              errorMessage = err.message;
            }
          }
          
          throw new Error(errorMessage);
        }
        break;

      case 'openai':
        try {
          const trimmedApiKey = apiKey.trim();
          
          // Basic check for non-empty string starting with sk-
          if (!trimmedApiKey || !trimmedApiKey.startsWith('sk-')) {
            throw new Error("OpenAI API key must start with 'sk-'");
          }
          
          const openai = new OpenAI({ apiKey: trimmedApiKey });
          // Simple call to list models
          await openai.models.list();
          console.log("OpenAI key validation successful");
        } catch (err) {
          console.error("OpenAI validation error:", err);
          let errorMessage = "Invalid OpenAI API key";
          
          if (err instanceof OpenAI.AuthenticationError || 
              (err instanceof OpenAI.APIError && err.status === 401)) {
            errorMessage = "Authentication failed: Invalid OpenAI API key";
          } else if (err instanceof OpenAI.APIError) {
            errorMessage = `API error (${err.status}): ${err.message}`;
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          
          throw new Error(errorMessage);
        }
        break;

      case 'anthropic':
        try {
          // Minimal format check - just ensure it starts with sk-
          const trimmedApiKey = apiKey.trim();
          
          // Basic check that it's a non-empty string starting with sk-
          if (!trimmedApiKey || !trimmedApiKey.startsWith('sk-')) {
            throw new Error("API key must start with 'sk-'");
          }
          
          // Now attempt to authenticate using a model that should be available to all users
          const anthropic = new Anthropic({ apiKey: trimmedApiKey });
          
          // Use a lightweight model and request for quick validation
          // Use a model that should be available to most API keys
          try {
            await anthropic.messages.create({
              model: "claude-3-haiku-20240307", // Use a widely available model for validation
              max_tokens: 1, // Minimal tokens for quick validation
              messages: [{ role: 'user', content: 'hello' }],
            });
          } catch (modelErr) {
            // If the model is not available, try the latest model
            if (modelErr instanceof Error && 
                (modelErr.message.includes('not found') || modelErr.message.includes('model'))) {
              // Try another model
              await anthropic.messages.create({
                model: "claude-3-sonnet-20240229", // Fallback to older model
                max_tokens: 1,
                messages: [{ role: 'user', content: 'hello' }],
              });
            } else {
              throw modelErr; // Re-throw if it's not a model error
            }
          }
          
          // If we get here, the key is valid
          console.log("Anthropic key validation successful");
        } catch (err) {
          // Handle specific error cases for better user feedback
          let errorMessage = "Anthropic key validation failed";
          
          if (err instanceof Anthropic.APIError) {
            // Handle common error codes
            if (err.status === 401) {
              errorMessage = "Authentication failed: Invalid Anthropic API key";
            } else if (err.status === 403) {
              errorMessage = "Access denied: This API key doesn't have permission to use Claude";
            } else if (err.status === 404) {
              errorMessage = "Model not found: Please check available models for your API key";
            } else if (err.status === 429) {
              errorMessage = "Rate limit exceeded: Please try again later";
            } else {
              errorMessage = `API error (${err.status}): ${err.message}`;
            }
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
          
          throw new Error(errorMessage);
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
