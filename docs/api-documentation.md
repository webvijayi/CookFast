# API Documentation

CookFast exposes several API endpoints for document generation and supporting functionality. This document outlines the available endpoints, their request/response formats, and usage examples.

## API Endpoints

### 1. `/api/generate-docs`

The primary endpoint for generating documentation using various AI providers.

#### Request

- **Method**: POST
- **Content-Type**: application/json
- **Body**:

```json
{
  "projectDetails": {
    "projectName": "string",
    "projectType": "string",
    "projectGoal": "string",
    "features": "string",
    "techStack": "string",
    "hasBackend": "boolean",
    "hasFrontend": "boolean",
    "projectDescription": "string"
  },
  "selectedDocs": {
    "requirements": "boolean",
    "frontendGuidelines": "boolean",
    "backendStructure": "boolean",
    "appFlow": "boolean",
    "techStackDoc": "boolean",
    "systemPrompts": "boolean",
    "fileStructure": "boolean"
  },
  "provider": "gemini" | "openai" | "anthropic",
  "apiKey": "string",
  "requestId": "string" (optional)
}
```

#### Response

```json
{
  "status": "completed" | "failed" | "processing",
  "message": "string",
  "documents": [
    {
      "title": "string",
      "content": "string"
    }
  ],
  "error": "string" (optional),
  "debug": "object" (optional),
  "requestId": "string"
}
```

#### Features

- Multi-provider support (OpenAI, Anthropic, Gemini)
- JSON-structured responses
- Retry logic with error handling
- Token limit management
- Comprehensive logging
- Safety settings for content generation

### 2. `/api/check-status`

Used to check the status of an ongoing document generation request.

#### Request

- **Method**: GET
- **Query Parameters**:
  - `requestId`: The ID of the generation request to check

#### Response

```json
{
  "status": "completed" | "failed" | "processing",
  "message": "string",
  "documents": [
    {
      "title": "string",
      "content": "string"
    }
  ] (if completed),
  "error": "string" (if failed),
  "requestId": "string"
}
```

### 3. `/api/validate-key`

Used to validate API keys before generating documentation.

#### Request

- **Method**: POST
- **Content-Type**: application/json
- **Body**:

```json
{
  "provider": "gemini" | "openai" | "anthropic",
  "apiKey": "string"
}
```

#### Response

```json
{
  "valid": "boolean",
  "message": "string",
  "error": "string" (optional)
}
```

## Error Handling

The API implements robust error handling including:

- Network/connection error detection
- Response validation
- JSON parsing error handling
- Provider-specific error handling
- Rate limiting errors

## Models & Token Limits

| Provider | Model | Token Limit |
|----------|-------|-------------|
| Gemini | gemini-2.5-pro-exp-03-25 | 65,536 |
| OpenAI | gpt-4.1 | 32,768 |
| Anthropic | claude-3-7-sonnet-20250219 | 64,000 |

## Implementation Details

- The API uses a structured prompt-building approach to generate consistent, high-quality documentation
- Content is parsed into structured sections for better organization
- Retry mechanisms are implemented for handling transient errors
- Background processing is supported for long-running generations
- Results are stored temporarily for status checking 