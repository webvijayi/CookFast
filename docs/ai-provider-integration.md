# AI Provider Integration

CookFast integrates with multiple AI providers to generate documentation. This document details the integration approach, provider-specific implementations, and best practices.

## Supported Providers

CookFast currently supports three major AI providers:

1. **Google Gemini**
   - Model: `gemini-2.5-pro-exp-03-25` (Primary)
   - Fallback: `gemini-2.5-pro-preview-03-25`
   - Max Output Tokens: 65,536
   - Library: `@google/generative-ai`

2. **OpenAI**
   - Model: `gpt-4.1`
   - Max Output Tokens: 32,768
   - Library: `openai`

3. **Anthropic**
   - Model: `claude-3-opus-20240229`
   - Max Output Tokens: 64,000
   - Library: `@anthropic-ai/sdk`

## Integration Architecture

The integration follows a unified pattern across all providers:

1. **Client-Side**:
   - Provider selection through UI
   - API key input and validation
   - Generation request with appropriate parameters

2. **Server-Side**:
   - Provider-specific API client initialization
   - Structured prompt construction
   - Response handling and parsing
   - Error management and retry logic

## Provider-Specific Implementations

### Google Gemini

```typescript
async function generateWithGemini(apiKey, modelName, prompt, requestId, isBackground) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  
  const generationConfig = {
    temperature: 0.7,
    topK: 1,
    topP: 0.8,
    maxOutputTokens: TOKEN_LIMITS.gemini,
    stopSequences: []
  };
  
  // Generation request with safety settings
  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings
  });
  
  // Process response...
}
```

### OpenAI

```typescript
async function generateWithOpenAI(apiKey, prompt, requestId, isBackground) {
  const openai = new OpenAI({ apiKey });
  
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: TOKEN_LIMITS.openai,
    top_p: 0.8,
    frequency_penalty: 0,
    presence_penalty: 0
  });
  
  // Process response...
}
```

### Anthropic

```typescript
async function generateWithAnthropic(apiKey, prompt, requestId, isBackground) {
  const anthropic = new Anthropic({ apiKey });
  
  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: TOKEN_LIMITS.anthropic,
    temperature: 0.7,
    system: "You are an expert software architect and technical writer...",
    messages: [{ role: "user", content: prompt }]
  });
  
  // Process response...
}
```

## Prompt Engineering

All providers use a standardized prompt structure:

1. **System Context**: Information about the task and expected output format
2. **Project Information**: Detailed information about the project
3. **Document Requirements**: Specific documentation types requested
4. **Format Guidelines**: Instructions for formatting the output (Markdown, sections, etc.)
5. **Specific Instructions**: Tailored instructions per document type

## Error Handling & Retries

The application implements robust error handling and retry logic:

```typescript
// Retry utility
const withRetry = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let attempt = 0;
  let lastError;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      lastError = error;
      
      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
```

## Token Management

Each provider has specific token limits that the application respects:

- Token counting varies by provider
- Maximum output tokens are configured per provider
- Input tokens are optimized to maximize output space

## Safety Settings

Safety settings are implemented to ensure responsible content generation:

```typescript
// Example: Gemini safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
```

## Response Processing

Responses from all providers are processed into a consistent format:

1. Extract the text content from the provider-specific response
2. Parse the content into structured sections
3. Convert to a standardized document format
4. Return a unified API response

## API Key Security

API keys are handled securely:

- Never stored on the server
- Used only for the specific generation request
- Validated client-side before use
- Transmitted securely via HTTPS 