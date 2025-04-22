# API Information

## `/api/generate-docs`

The core API endpoint for generating documentation using various AI providers (OpenAI, Anthropic, and Google Gemini).

### Interfaces

- **ProjectDetails**: Project metadata including name, type, goals, features, etc.
- **DocumentSelection**: Types of documentation to generate (requirements, frontend guidelines, etc.)
- **DocumentSection**: Structure for parsed content (title, content)
- **GenerateDocsRequestBody**: API request structure
- **ApiResponseType**: API response structure

### Core Functions

- **buildPrompt()**: Constructs optimized prompts for different AI models
- **parseContentToSections()**: Parses AI responses into structured document sections
- **generateWithGemini()**: Handles Gemini API integration
- **generateWithOpenAI()**: Handles OpenAI API integration
- **generateWithAnthropic()**: Handles Anthropic API integration

### Key Features

- **Multi-provider support**: Integrates with OpenAI, Anthropic, and Google Gemini
- **JSON-structured responses**: Returns well-formatted document sections
- **Robust retry logic**: Implements exponential backoff for transient errors
- **Token limit management**: Respects provider-specific token limits
- **Comprehensive logging**: Tracks generation process for debugging
- **Safety settings**: Implements content filtering for responsible AI use

### Error Handling

- **Network/connection error detection**: Handles connectivity issues
- **Response validation**: Verifies response format and content
- **JSON parsing error handling**: Gracefully handles malformed responses
- **Provider-specific error handling**: Customized error handling per provider
- **Rate limiting**: Basic protection against excessive requests

### Constants

- **Token limits per provider**: Configures maximum output sizes
- **Model names**: Uses the latest available models
- **Safety settings**: Configures content filtering thresholds

## `/api/check-status`

Endpoint for checking the status of ongoing document generation processes.

### Key Features

- **Async status checking**: Allows clients to poll for completion
- **Progress updates**: Returns current generation status
- **Result retrieval**: Returns completed documents when available

## `/api/validate-key`

Endpoint for validating AI provider API keys before generation.

### Key Features

- **Provider-specific validation**: Different validation logic per provider
- **Format checking**: Validates API key format
- **Connectivity testing**: Verifies provider access
- **Error details**: Returns specific validation failure reasons

## `/api/og`

Generates Open Graph images for social media sharing.

### Implementation Details

The CookFast API system follows best practices for serverless environments, with robust error handling and retry mechanisms. It's designed to handle potentially long-running AI generation processes while providing appropriate status updates and results storage.

The API endpoints are fully typed with TypeScript and include comprehensive validation of inputs and outputs. The system can be extended to support additional AI providers in the future with minimal code changes. 