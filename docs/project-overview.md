# CookFast: Project Overview

CookFast is an AI-powered tool designed to automatically generate comprehensive project documentation and planning documents for developers. It leverages advanced AI models from multiple providers to transform basic project information into structured documentation, helping developers jumpstart their projects quickly.

## Purpose

The main purpose of CookFast is to reduce the initial project setup time by automating the creation of project documentation, allowing developers to focus more on implementation rather than planning and documentation. It helps transform ideas into structured plans with minimal effort.

## Key Features

- **Multi-Provider AI Support**: Supports multiple AI providers including Google Gemini, OpenAI, and Anthropic Claude
- **Comprehensive Document Generation**: Creates various types of documentation including requirements, frontend guidelines, backend structure, application flow, tech stack documentation, system prompts, and file structure
- **Extended Context Windows**: Leverages large context windows of the latest AI models
- **Markdown Output**: Generates all documentation in Markdown format for easy integration with project repositories
- **Mermaid Diagram Support**: Automatically generates Mermaid syntax for diagrams where appropriate
- **API Key Validation**: Client-side validation of API keys before generation
- **Secure Key Handling**: API keys are never stored, only used for generation requests
- **Dark Mode**: Toggle between light and dark themes
- **JSON Export**: Download structured JSON file with project details for AI IDE integration
- **Stop/Retry Generation**: Controls to stop ongoing generation or retry failed generations

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **AI Integration**: Direct API integration with Google Gemini, OpenAI, and Anthropic Claude
- **Deployment**: Configured for deployment on Netlify or Vercel

## Architecture

CookFast follows a Next.js application structure with:

1. Client-side form for collecting project details and document preferences
2. Server-side API endpoints for AI-powered document generation
3. Real-time processing and streaming of generation results
4. Client-side rendering of generated Markdown content

## Target Audience

- Developers starting new projects
- Teams that need standardized project documentation
- Individuals looking to quickly structure their project ideas 