'use client';

import React from 'react';

// How It Works section with 3-step process
export default function HowItWorksSection() {
  // Steps for the How It Works section
  const steps = [
    {
      number: '01',
      title: 'Enter Project Details',
      description: 'Provide your project name, type, goals, and key features you want to build.',
      icon: '📝',
    },
    {
      number: '02',
      title: 'Select Documentation Types',
      description: 'Choose what documentation you need - requirements, architecture, guidelines, or all of the above.',
      icon: '🔍',
    },
    {
      number: '03',
      title: 'Generate & Export',
      description: 'Our AI generates comprehensive documentation that you can download as Markdown or JSON.',
      icon: '🚀',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            CookFast makes project documentation simple with just three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-card border rounded-lg p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <div className="text-6xl mb-4">{step.icon}</div>
              <div className="absolute -top-2 -right-2 text-6xl font-bold text-muted-foreground/10">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 