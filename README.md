# 🍳🚀 CookFast: AI-Powered Project Planning Documents 🛠️

[![License](https://img.shields.io/github/license/webvijayi/cookfast)](https://github.com/webvijayi/cookfast/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/webvijayi/cookfast)](https://github.com/webvijayi/cookfast/stargazers)
[![Twitter Follow](https://img.shields.io/twitter/follow/webvijayi?style=social)](https://twitter.com/webvijayi)

CookFast is an AI-powered tool that automatically generates comprehensive project documentation, templates, and development guides based on your project details. It helps developers quickly convert ideas into structured plans, reducing the initial project setup time significantly.

## ✨ Features

*   **Multiple AI Providers:** Choose between Google Gemini, OpenAI, Anthropic, and X.ai models with extensive model selection.
    *   **OpenAI Models:** GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano, o3, o3 Pro, o3 Mini, o4 Mini, o4 Mini High, o1, GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
    *   **Google Gemini Models:** Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash-Lite, Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash
    *   **Anthropic Models:** Claude Opus 4.5, Claude Opus 4, Claude Sonnet 4, Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus, Claude 3 Haiku
    *   **X.ai Models:** Grok 4, Grok 3, Grok 3 Mini
*   **Extended Context Windows & Model Selection:** Choose from models with varying capabilities:
    *   **OpenAI GPT-4.1:** 1M tokens context, 32K output tokens - Latest with improved coding
    *   **OpenAI o3/o3 Pro:** 200K tokens context, 65K output tokens - Advanced reasoning models
    *   **Gemini 2.5 Pro:** 1M+ tokens context, 65K output tokens - State-of-the-art with always-on thinking
    *   **Gemini 2.5 Flash:** 1M+ tokens context, 65K output tokens - Configurable thinking budget
    *   **Claude Opus 4:** 200K tokens context, 128K output tokens - Most capable with hybrid reasoning
    *   **Claude Sonnet 4:** 200K tokens context, 128K output tokens - High performance hybrid reasoning
    *   **X.ai Grok 4:** 256K tokens context, 32K output tokens - Always-on reasoning capabilities
*   **Flexible Document Selection:** Select the specific planning documents you need, such as:
    *   Project Requirements Document
    *   Frontend Guidelines
    *   Backend Structure Proposal
    *   Application Flow Diagram (Mermaid)
    *   Tech Stack Documentation
    *   System Prompts (if applicable)
    *   File Structure Proposal
*   **Markdown Output:** Generates documents in Markdown format, suitable for easy integration into your project's documentation.
*   **Mermaid Diagram Support:** Automatically suggests and includes Mermaid syntax for diagrams where appropriate (e.g., App Flow, Backend Structure).
*   **API Key Validation:** Includes a client-side check to help validate the format and accessibility of your provided API key before generation.
*   **Secure API Key Handling:** Your API keys are **never stored** by the application. They are sent directly to the chosen AI provider for the generation request only. The application is open-source for verification.
*   **Rate Limiting:** Basic API rate limiting is implemented to prevent abuse.
*   **Dark Mode:** Toggle between light and dark themes for comfortable viewing.
*   **Built with Modern Tech:** Next.js, React, TypeScript, Tailwind CSS.
*   **JSON Export:** Download a structured JSON file with project details and document sections for AI IDE integration (e.g., Cursor, Windsurf, Aider).
*   **Stop Generation:** Cancel an ongoing documentation generation process if needed.
*   **Retry Generation:** Easily retry the generation process if it fails or if you want to attempt generation again with the same inputs.

---
## 🧑‍🍳 Frequently Asked Questions

### 1. What is CookFast?  
CookFast is an AI-powered tool that automatically generates comprehensive project documentation, templates, and development guides based on your project details. It helps developers quickly convert ideas into structured plans, reducing the initial project setup time significantly.

### 2. What types of projects can CookFast generate documentation for?
CookFast can generate documentation for a wide range of project types including Web Applications, Websites, Mobile Apps, API Services, Libraries/Packages, and Desktop Applications. The tool tailors the documentation based on the specific needs and requirements of each project type.

### 3. Why was CookFast created?
We built CookFast because we often had project ideas (like CookFast itself) and wanted to get started quickly, but planning would take considerable time. We needed a tool that could help us jumpstart projects with AI-powered documentation and planning, allowing us to focus more on implementation rather than initial documentation.

### 4. Why is it called 'CookFast'?
The name 'CookFast' comes from the idea that it helps you 'cook up' (prepare) the basics of your idea quickly. Just as a chef prepares ingredients before cooking, CookFast helps prepare your project's foundation fast, so you can start building immediately.

### 5. Which AI providers does CookFast support?  
CookFast supports four major AI providers with extensive model selection:

**OpenAI Models:**
- GPT-4.1 (1M context, 32K output) - Latest flagship with improved coding
- o3/o3 Pro/o3 Mini (200K context, 65K output) - Advanced reasoning models
- o4 Mini/o4 Mini High (200K context, 32K output) - Optimized reasoning models
- GPT-4o/GPT-4o Mini (128K context, 16K output) - Multimodal capabilities
- Legacy models: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo

**Google Gemini Models:**
- Gemini 2.5 Pro (1M+ context, 65K output) - Always-on thinking
- Gemini 2.5 Flash (1M+ context, 65K output) - Configurable thinking budget
- Gemini 2.0 Flash (1M context, 32K output) - Next-gen with native tool use
- Legacy models: Gemini 1.5 Pro, Gemini 1.5 Flash

**Anthropic Models:**
- Claude Opus 4.5 (200K context, 128K output) - Frontier reasoning with extended thinking
- Claude Opus 4 (200K context, 128K output) - Most capable with hybrid reasoning
- Claude Sonnet 4 (200K context, 128K output) - High performance hybrid reasoning
- Claude 3.7 Sonnet (200K context, 64K output) - Extended reasoning enabled
- Legacy models: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus

**X.ai Models:**
- Grok 4 (256K context, 32K output) - Frontier-level with always-on reasoning
- Grok 3 (1M context, 16K output) - Advanced reasoning capabilities
- Grok 3 Mini (128K context, 8K output) - Cost-efficient reasoning

### 6. Do I need to provide my own API keys?
Yes, you'll need to provide your own API key for the AI provider you choose to use. This ensures your data security and gives you control over which AI model processes your project information.

### 7. What types of documentation can CookFast generate?
CookFast can generate requirements documents, frontend guidelines, backend architecture, application flow, tech stack documentation, system prompts, and file structure documentation.

### 8. Can I customize the documentation CookFast generates?
Yes! You can customize the documentation by adjusting your project details and selecting specific document types. After generation, you can also download the documentation as Markdown or JSON and then modify it to suit your specific needs. We're also working on more customization options in future updates.

### 9. Is my API key saved?  
No. API keys are validated client-side and never stored by CookFast. They are sent directly to the chosen AI provider for the generation request only.

## Getting Started

### Prerequisites

*   Node.js (Version 20 or later recommended)
*   npm, yarn, or pnpm
*   An API key for at least one of the supported AI providers:
    * [OpenAI API](https://platform.openai.com/)
    * [Anthropic API](https://www.anthropic.com/product)
    * [Google Gemini API](https://ai.google.dev/)
    * [X.ai API](https://x.ai/api)

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/webvijayi/CookFast.git
    cd CookFast
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🌐 Live Demo

**[https://cookfa.st](https://cookfa.st)**

### How to Use

1.  Select your preferred AI Provider (Google Gemini, OpenAI, Anthropic, or X.ai).
2.  Choose your specific model from the available options for enhanced control.
3.  Enter your corresponding API Key and optionally click "Test" to validate it.
4.  Fill in the details about your project (Name, Type, Goal, Features, Tech Stack).
5.  Select the checkboxes for the document types you want to generate.
6.  Click "Cook Up Docs!".
6.  While generating, a "Stop Generation" button is available if you need to cancel.
7.  The generated Markdown content will appear in the results area below the form.
8.  If the generation fails or you want to try again, a "Retry Generation" button will be available in the results area.

---

## ❤️ Support & Contribution

Found CookFast helpful? Here are a few ways you can support the project:

*   ⭐ **Star the Repository:** If you like the project, please star it on [GitHub](https://github.com/webvijayi/CookFast)! It helps with visibility.
*   ☕ **Donate:** Support the development by buying me a coffee! <br> **<a href="https://buymeacoffee.com/lokeshmotwani" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 145px !important;" ></a>**
*   🐞 **Report Bugs / Suggest Features:** Found a bug or have an idea? Open an issue on the [GitHub Issues page](https://github.com/webvijayi/CookFast/issues).
*   🤝 **Contribute Code:** Pull requests are welcome! Feel free to fork the repository and submit your improvements.
*   📧 **Contact:** For other inquiries, you can reach out to **care [at] webvijayi [dot] com**.

---

## 🚀 Deployment

This application is configured for deployment on platforms like Netlify, Vercel, or self-hosted solutions like Coolify.

### Docker Deployment

CookFast includes a Dockerfile for easy containerized deployment:

```bash
# Build the Docker image
docker build -t cookfast .

# Run the container
docker run -p 3000:3000 cookfast
```

Or use Docker Compose:

```yaml
version: '3.8'
services:
  cookfast:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

### Coolify Deployment

CookFast is optimized for deployment on [Coolify](https://coolify.io/):

1. Create a new application in Coolify
2. Connect to the GitHub repository: `webvijayi/CookFast`
3. Coolify will automatically detect the Dockerfile
4. Configure your domain and SSL
5. Deploy!

### Netlify/Vercel Deployment

The code is designed to be easily deployable on platforms like Vercel or Netlify with zero configuration.

### Netlify Blobs Integration

CookFast uses Netlify Blobs for storing generated documents in production environments:

- **Zero Configuration**: Netlify Blobs is automatically configured when deployed on Netlify
- **Persistent Storage**: Documents are stored persistently even through redeployments
- **Local Development**: In local development, files are stored in the `tmp` directory as a fallback
- **High Availability**: Netlify Blobs provides a highly-available, scalable storage solution

To work with Netlify Blobs locally, you can use the following commands:

```bash
# Start Netlify dev environment
npm run netlify:dev

# List all blobs in the store
npm run netlify:blobs:list

# Delete a specific blob
npm run netlify:blobs:delete generationResults/YOUR_REQUEST_ID
```

For more information about Netlify Blobs, see the [documentation](.docs/netlify-blobs.md).

---

## Learn More (Default Next.js Info)

To learn more about the underlying Next.js framework, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.
 
