# Code Architecture

CookFast follows a structured architecture based on Next.js conventions with a clear separation of concerns. This document outlines the codebase organization, key components, and data flow.

## Directory Structure

```
CookFast/
├── public/              # Static assets
│   ├── images/          # Image assets
├── src/                 # Application source code
│   ├── components/      # UI components
│   │   ├── icons/       # Icon components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # Base UI components (shadcn/ui)
│   ├── contexts/        # React contexts
│   ├── lib/             # Helper functions and utilities
│   ├── pages/           # Next.js pages
│   │   └── api/         # API endpoints
│   ├── styles/          # CSS styles
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── docs/                # Project documentation
└── netlify/             # Netlify-specific configuration
    └── edge-functions/  # Netlify edge functions
```

## Key Components

### UI Components

1. **EnhancedForm.tsx** (31KB)
   - Collects project details and user preferences
   - Manages form state and validation

2. **GeneratorSection.tsx** (30KB)
   - Controls document generation workflow
   - Handles API communication with providers

3. **MarkdownRenderer.tsx** (12KB)
   - Renders generated Markdown content
   - Supports Mermaid diagrams and code highlighting

4. **DocumentTypeSection.tsx** (17KB)
   - Allows selection of document types to generate
   - Provides document type descriptions

5. **AnimatedHero.tsx** (11KB)
   - Implements animated hero section on the landing page

6. **EnhancedFooter.tsx** (11KB)
   - Application footer with links and information

7. **FaqSection.tsx** (9.2KB)
   - Frequently asked questions section

### API Endpoints

1. **generate-docs.ts** (25KB)
   - Main document generation endpoint
   - Handles communication with AI providers
   - Processes generation results

2. **check-status.ts** (7.3KB)
   - Checks generation status for ongoing requests
   - Returns generation results when complete

3. **validate-key.ts** (3.1KB)
   - Validates API keys for different providers
   - Returns validation status and any errors

4. **og.tsx** (4.5KB)
   - Generates Open Graph images for social sharing

### Utility Functions

1. **saveResult.ts**
   - Manages result storage for status checking
   - Handles temporary data storage

2. **documentStore.ts**
   - In-memory storage for generation results
   - Manages request IDs and results

3. **rate-limiter.ts**
   - Implements rate limiting for API requests
   - Prevents abuse of the service

## Data Flow

1. **User Input → Form → API Request**
   - User fills out the project details form
   - Form state is captured and validated
   - API request is prepared with necessary data

2. **API Request → AI Provider → Raw Response**
   - Request is sent to the selected AI provider
   - Provider processes the request and generates content
   - Raw response is returned to the application

3. **Raw Response → Parsing → Structured Content**
   - Raw response is parsed into structured sections
   - Content is organized into titled sections
   - Structured content is returned to the client

4. **Structured Content → Rendering → UI Display**
   - Structured content is rendered as Markdown
   - UI updates to show the generated content
   - User can download, copy, or modify the content

## State Management

- **Form State**: Managed through React useState hooks
- **Theme State**: Managed through ThemeContext
- **Generation State**: Managed through generation-specific state variables
- **Result Storage**: Managed through server-side storage mechanisms

## Error Handling

- **Client-side validation**: Form validation before submission
- **API error handling**: Robust error handling in API routes
- **Retry logic**: Automatic retries for transient errors
- **User feedback**: Clear error messages for user understanding

## UI Framework

The application uses:
- **Tailwind CSS**: For styling
- **shadcn/ui**: For UI components
- **Radix UI**: For accessible component primitives
- **Framer Motion**: For animations 