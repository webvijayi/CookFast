'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

// FAQ section with common questions and answers
export default function FaqSection() {
  // FAQ data
  const faqData = [
    {
      question: "What is CookFast?",
      answer: "CookFast is an AI-powered tool that automatically generates comprehensive project documentation, templates, and development guides based on your project details. It helps developers quickly convert ideas into structured plans, reducing the initial project setup time significantly."
    },
    {
      question: "What types of projects can CookFast generate documentation for?",
      answer: "CookFast can generate documentation for a wide range of project types including Web Applications, Websites, Mobile Apps, API Services, Libraries/Packages, and Desktop Applications. The tool tailors the documentation based on the specific needs and requirements of each project type."
    },
    {
      question: "Why was CookFast created?",
      answer: "We built CookFast because we often had project ideas (like CookFast itself) and wanted to get started quickly, but planning would take considerable time. We needed a tool that could help us jumpstart projects with AI-powered documentation and planning, allowing us to focus more on implementation rather than initial documentation."
    },
    {
      question: "Why is it called 'CookFast'?",
      answer: "The name 'CookFast' comes from the idea that it helps you 'cook up' (prepare) the basics of your idea quickly. Just as a chef prepares ingredients before cooking, CookFast helps prepare your project's foundation fast, so you can start building immediately."
    },
    {
      question: "Which AI providers does CookFast support?",
      answer: "CookFast supports multiple AI providers including OpenAI (GPT-4.1), Anthropic (Claude 3.7 Sonnet), and Google (Gemini 2.5 Pro). Each provider offers different capabilities: GPT-4.1 supports up to 1,000,000 tokens of context, Gemini 2.5 Pro allows up to 1,048,576 input tokens, and Claude 3.7 Sonnet has a 200,000-token context window."
    },
    {
      question: "Do I need to provide my own API keys?",
      answer: "Yes, you'll need to provide your own API key for the AI provider you choose to use. This ensures your data security and gives you control over which AI model processes your project information."
    },
    {
      question: "What types of documentation can CookFast generate?",
      answer: "CookFast can generate requirements documents, frontend guidelines, backend architecture, application flow, tech stack documentation, system prompts, and file structure documentation."
    },
    {
      question: "Can I customize the documentation CookFast generates?",
      answer: "Yes! You can customize the documentation by adjusting your project details and selecting specific document types. After generation, you can also download the documentation as Markdown or JSON and then modify it to suit your specific needs. We're also working on more customization options in future updates."
    },
    {
      question: "How can I self-host CookFast?",
      answer: <>
        CookFast is completely open-source. You can self-host it by forking the <a href="https://github.com/webvijayi/CookFast" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">GitHub repository</a>, following the installation instructions in the README, and deploying it to your preferred hosting platform. The code is designed to be easily deployable on platforms like Vercel, Netlify, or your own server.
      </>
    },
    {
      question: "How can I contribute to CookFast?",
      answer: <>
        We welcome contributions! You can contribute by reporting issues, suggesting features, or submitting pull requests on our <a href="https://github.com/webvijayi/CookFast" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">GitHub repository</a>. Check the CONTRIBUTING.md file in the repo for guidelines.
      </>
    },
    {
      question: "How much does CookFast cost?",
      answer: <>
        CookFast is completely <a href="https://github.com/webvijayi/CookFast" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">free and open-source</a>. You only pay for the API usage charged by your chosen AI provider (OpenAI, Anthropic, or Google). If you'd like to support the development:
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="https://buymeacoffee.com/lokeshmotwani" target="_blank" rel="noopener noreferrer">
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" className="h-8 sm:h-10" />
          </a>
          <a href="https://github.com/webvijayi/CookFast" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 sm:h-10 text-xs sm:text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Star on GitHub
            </Button>
          </a>
        </div>
      </>
    },
    {
      question: "Can I export the generated documentation?",
      answer: "Yes! You can export the documentation as Markdown (.md) files or as structured JSON that you can integrate into your development workflow."
    },
    {
      question: "Where can I get support?",
      answer: <>
        You can get support by creating an issue on our <a href="https://github.com/webvijayi/CookFast/issues" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">GitHub repository</a> or reaching out to us on Twitter <a href="https://twitter.com/webvijayi" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">@webvijayi</a>. We're always happy to help!
      </>
    }
  ];

  return (
    <section id="faq" className="py-12 sm:py-16">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Get answers to common questions about CookFast.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base pr-2 sm:pr-4">
                  <span className="mr-2 inline-block">💡</span> <span className="flex-1">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
} 