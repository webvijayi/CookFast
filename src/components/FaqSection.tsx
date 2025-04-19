'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// FAQ section with common questions and answers
export default function FaqSection() {
  // FAQ data
  const faqData = [
    {
      question: "What is CookFast?",
      answer: "CookFast is an AI-powered tool that automatically generates comprehensive project documentation, templates, and development guides based on your project details. It helps developers quickly convert ideas into structured plans, reducing the initial project setup time significantly."
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
      answer: "CookFast supports multiple AI providers including OpenAI (GPT-4o), Anthropic (Claude 3.7 Sonnet), and Google (Gemini 2.5 Pro)."
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
      answer: "CookFast is completely open-source. You can self-host it by forking the repository at https://github.com/webvijayi/CookFast, following the installation instructions in the README, and deploying it to your preferred hosting platform. The code is designed to be easily deployable on platforms like Vercel, Netlify, or your own server."
    },
    {
      question: "How can I contribute to CookFast?",
      answer: "We welcome contributions! You can contribute by reporting issues, suggesting features, or submitting pull requests on our GitHub repository at https://github.com/webvijayi/CookFast. Check the CONTRIBUTING.md file in the repo for guidelines."
    },
    {
      question: "How much does CookFast cost?",
      answer: "CookFast is completely free and open-source. You only pay for the API usage charged by your chosen AI provider (OpenAI, Anthropic, or Google). If you'd like to support the development, you can buy us a coffee at https://buymeacoffee.com/lokeshmotwani."
    },
    {
      question: "Can I export the generated documentation?",
      answer: "Yes! You can export the documentation as Markdown (.md) files or as structured JSON that you can integrate into your development workflow."
    },
    {
      question: "Where can I get support?",
      answer: "You can get support by creating an issue on our GitHub repository at https://github.com/webvijayi/CookFast/issues or reaching out to us on Twitter @webvijayi. We're always happy to help!"
    }
  ];

  return (
    <section id="faq" className="py-16">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get answers to common questions about CookFast.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <span className="mr-2">💡</span> {faq.question}
                </AccordionTrigger>
                <AccordionContent>
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