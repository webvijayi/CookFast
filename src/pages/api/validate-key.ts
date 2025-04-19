import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

type ValidateResponse = {
  valid: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  const { provider, apiKey } = req.body;

  if (!provider || !apiKey) {
    return res.status(400).json({ 
      valid: false, 
      error: 'Provider and API key are required' 
    });
  }

  // Basic format validation
  if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return res.status(400).json({ 
      valid: false, 
      error: 'API key is empty or invalid format' 
    });
  }

  try {
    // Validate the API key based on the provider
    switch (provider) {
      case 'openai':
        await validateOpenAIKey(apiKey);
        break;
      case 'anthropic':
        await validateAnthropicKey(apiKey);
        break;
      case 'gemini':
        await validateGeminiKey(apiKey);
        break;
      default:
        return res.status(400).json({ 
          valid: false, 
          error: `Unsupported provider: ${provider}` 
        });
    }

    // If validation passes (no errors thrown), return success
    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error(`Error validating ${provider} API key:`, error);
    return res.status(200).json({ 
      valid: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// OpenAI API key validation
async function validateOpenAIKey(apiKey: string): Promise<void> {
  const openai = new OpenAI({ apiKey });
  
  // Make a minimal API call to validate the key
  try {
    await openai.models.list();
  } catch (error) {
    throw new Error(
      `Invalid OpenAI API key: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Anthropic API key validation
async function validateAnthropicKey(apiKey: string): Promise<void> {
  const anthropic = new Anthropic({ apiKey });
  
  // Make a minimal API call to validate the key
  try {
    await anthropic.models.list();
  } catch (error) {
    throw new Error(
      `Invalid Anthropic API key: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Gemini API key validation
async function validateGeminiKey(apiKey: string): Promise<void> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Make a simple API call to validate the key
    // We'll get the list of models to validate the key without creating a chat
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Just attempt a simple operation that will fail with an invalid key
    // Using countTokens as it's a lightweight operation
    await model.countTokens("test");
  } catch (error) {
    throw new Error(
      `Invalid Gemini API key: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
