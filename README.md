# 🍳🚀 CookFast: AI-Powered Project Planning Documents 🛠️

CookFast is a web application built with Next.js that helps you quickly generate preliminary project planning documents using various AI models. Provide your project details, select the documents you need, choose your preferred AI provider (Gemini, OpenAI, or Anthropic), enter your API key, and CookFast will generate the Markdown documentation for you.

## ✨ Features

*   **Multiple AI Providers:** Choose between Google Gemini, OpenAI, and Anthropic models.
    *   Currently using: Google `gemini-2.5-pro-exp-03-25` (Experimental), OpenAI `gpt-4o`, Anthropic `claude-3-7-sonnet-20250219` (models subject to future updates).
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

---
## 🧑‍🍳 Frequently Asked Questions

1. **What is CookFast?**  
   CookFast is an AI-powered tool that generates project planning documents in Markdown or JSON formats to help you start coding faster.

2. **How does it work?**  
   Enter your project details, select the document types you need, choose an AI provider, and CookFast will generate comprehensive docs.

3. **Which AI providers are supported?**  
   Currently, CookFast supports Google Gemini, OpenAI, and Anthropic models.

4. **What formats can I export?**  
   You can download your generated docs as Markdown files or as a structured JSON file optimized for AI code assistants.

5. **Is my API key saved?**  
   No. API keys are validated client-side and never stored by CookFast.

## Getting Started

### Prerequisites

*   Node.js (Version 20 or later recommended)
*   npm, yarn, or pnpm
*   An API key for at least one of the supported AI providers (Gemini, OpenAI, Anthropic).

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/webvijayi/CookFast.git # Replace with your actual repo URL if different
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
6.  The generated Markdown content will appear in the results area below the form.

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

This application is configured for deployment on platforms like Netlify or Vercel which support Next.js applications with API routes.

---

## Learn More (Default Next.js Info)

To learn more about the underlying Next.js framework, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.
