API info-  /api/generate-docs
The API endpoint for generating documentation using various AI providers (OpenAI, Anthropic, and Gemini). Here's a summary of the key components:
Interfaces:
ProjectDetails: Project metadata like name, type, goals, features, etc.
DocumentSelection: Types of docs to generate (requirements, frontend guidelines, etc.)
DocumentSection: Structure for parsed content
GenerateDocsRequestBody: API request structure
ApiResponseType: API response structure
Core Functions:
buildPrompt(): Constructs prompts for AI models
parseContentToSections(): Parses AI responses into structured sections
generateWithGemini(): Handles Gemini API integration
generateWithOpenAI(): Handles OpenAI API integration
generateWithAnthropic(): Handles Anthropic API integration
Key Features:
Multi-provider support (OpenAI, Anthropic, Gemini)
JSON-structured responses
Retry logic with error handling
Token limit management
Comprehensive logging
Safety settings for content generation
Error Handling:
Network/connection error detection
Response validation
JSON parsing error handling
Provider-specific error handling
Constants:
Token limits per provider
Model names
Safety settings
The endpoint follows best practices for API design and error handling, with robust logging and structured responses. It's designed to be used in a serverless environment and includes retry logic for reliability.