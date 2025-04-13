# 🚀 CookFast: AI-Powered Project Planning Documents 🛠️

CookFast is a web application built with Next.js that helps you quickly generate preliminary project planning documents using various AI models. Provide your project details, select the documents you need, choose your preferred AI provider (Gemini, OpenAI, or Anthropic), enter your API key, and CookFast will generate the Markdown documentation for you.

## ✨ Features

*   **Multiple AI Providers:** Choose between Google Gemini, OpenAI (GPT-4o), and Anthropic Claude 3 models.
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

---

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

### How to Use

1.  Select your preferred AI Provider (Gemini, OpenAI, or Anthropic).
2.  Enter your corresponding API Key and optionally click "Test" to validate it.
3.  Fill in the details about your project (Name, Type, Goal, Features, Tech Stack).
4.  Select the checkboxes for the document types you want to generate.
5.  Click "Cook Up Docs!".
6.  The generated Markdown content will appear in the results area below the form.

---

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/webvijayi/CookFast). (Update link if necessary)

---

## Learn More (Default Next.js Info)

To learn more about the underlying Next.js framework, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

## Deploy on Vercel (Default Next.js Info)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
