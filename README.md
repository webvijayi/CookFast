# 🍳🚀 CookFast: AI-Powered Project Planning Documents 🛠️

CookFast is an AI-powered tool that automatically generates comprehensive project documentation, templates, and development guides based on your project details. It helps developers quickly convert ideas into structured plans, reducing the initial project setup time significantly.

## ✨ Features

*   **Multiple AI Providers:** Choose between Google Gemini, OpenAI, and Anthropic models.
    *   Currently using: Google `gemini-2.5-pro-exp-03-25` (Experimental), OpenAI `gpt-4.1`, Anthropic `claude-3-7-sonnet-20250219` (models subject to future updates).
*   **Extended Context Windows:** Leverage large context windows of the latest AI models:
    *   OpenAI GPT-4.1: 1,000,000 tokens context window (32,768 output tokens)
    *   Gemini 2.5 Pro: 1,048,576 tokens context window (65,536 output tokens)
    *   Claude 3.7 Sonnet: 200,000 tokens context window (64,000 output tokens)
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
Currently, CookFast supports multiple AI providers including OpenAI (GPT-4.1), Anthropic (Claude 3.7 Sonnet), and Google (Gemini 2.5 Pro). Each provider offers different capabilities:
- GPT-4.1 supports up to 1,000,000 tokens of context and can generate up to 32,768 output tokens
- Gemini 2.5 Pro allows 1,048,576 input tokens and up to 65,536 output tokens
- Claude 3.7 Sonnet has a 200,000-token context window with 64,000 output tokens

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
*   An API key for at least one of the supported AI providers (Gemini, OpenAI, Anthropic).

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

**[https://cook-fast.netlify.app/](https://cook-fast.netlify.app/)**

### How to Use

1.  Select your preferred AI Provider (Gemini, OpenAI, or Anthropic).
2.  Enter your corresponding API Key and optionally click "Test" to validate it.
3.  Fill in the details about your project (Name, Type, Goal, Features, Tech Stack).
4.  Select the checkboxes for the document types you want to generate.
5.  Click "Cook Up Docs!".
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

This application is configured for deployment on platforms like Netlify or Vercel which support Next.js applications with API routes. The code is designed to be easily deployable on platforms like Vercel, Netlify, or your own server.

---

## Learn More (Default Next.js Info)

To learn more about the underlying Next.js framework, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.
