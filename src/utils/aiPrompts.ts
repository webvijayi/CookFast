/**
 * AI Prompt Templates for Documentation Generation
 * 
 * This file provides specialized prompt templates for generating high-quality
 * technical documentation with Mermaid diagrams.
 */

import { getMermaidSystemPrompt, formatMermaidDiagram } from './mermaidPrompts';

/**
 * Templates for generating documentation with Mermaid diagrams
 */
export const documentationPrompts = {
  /**
   * Template for generating process documentation with flowcharts
   */
  processFlow: `
I need to document a process with a flowchart. Please help me explain the following process with both text and a Mermaid diagram:

{description}

For the flowchart, please:
1. Use proper 'graph TD' syntax with semicolons
2. Ensure proper spacing in all connections (A --> B not A-->B)
3. Use double quotes for node labels with spaces 
4. Add proper edge labels with spaces after pipe symbols (A -->|Yes| B not A-->|Yes|B)
5. Wrap the diagram in triple-backtick code blocks with 'mermaid' language tag
  `,

  /**
   * Template for generating sequence diagrams for interaction documentation
   */
  interactionSequence: `
I need to document a sequence of interactions between different components/actors. Please create a clear explanation with a Mermaid sequence diagram:

{description}

For the sequence diagram:
1. Start with 'sequenceDiagram'
2. Define all participants clearly with descriptive labels
3. Use proper arrow syntax (A->>B, A-->>B) with consistent spacing
4. Include activate/deactivate where appropriate
5. Use notes for additional context
6. Wrap the diagram in triple-backtick code blocks with 'mermaid' language tag
  `,

  /**
   * Template for generating system architecture documentation
   */
  systemArchitecture: `
I need to document a system architecture. Please provide a written description and create a Mermaid diagram showing the components and their relationships:

{description}

For the architecture diagram:
1. Use 'graph LR' for left-to-right flow or 'graph TD' for top-down
2. Use clear node shapes to indicate different component types:
   - Rectangles for services/applications [Service]
   - Cylinders for databases [(Database)]
   - Hexagons for external systems {{External}}
3. Use different arrow styles to show different types of relationships
4. Include a legend explaining the node and arrow types
5. Wrap the diagram in triple-backtick code blocks with 'mermaid' language tag
  `,

  /**
   * Template for generating entity-relationship diagrams
   */
  dataModel: `
I need to document a data model with an entity-relationship diagram. Please provide an explanation of the model and create a Mermaid ER diagram:

{description}

For the ER diagram:
1. Start with 'erDiagram'
2. Use UPPERCASE for entity names
3. Include proper relationship syntax (||--o{, }|--|{, etc.)
4. Add relationship descriptions
5. List key attributes within each entity
6. Wrap the diagram in triple-backtick code blocks with 'mermaid' language tag
  `,

  /**
   * Template for generating state machine documentation
   */
  stateMachine: `
I need to document a state machine or workflow. Please provide an explanation and create a Mermaid state diagram:

{description}

For the state diagram:
1. Start with 'stateDiagram-v2'
2. Use [*] for start/end states
3. Use clear state names without spaces or use quotes for spaces
4. Label transitions with meaningful descriptions
5. Use composite states where appropriate
6. Wrap the diagram in triple-backtick code blocks with 'mermaid' language tag
  `,

  /**
   * Template for generating project timeline documentation
   */
  projectTimeline: `
I need to document a project timeline. Please provide a description of the project phases and create a Mermaid Gantt chart:

{description}

For the Gantt chart:
1. Start with 'gantt'
2. Include dateFormat directive (YYYY-MM-DD)
3. Use sections to group related tasks
4. Include dependencies between tasks where relevant
5. Use status indicators (done, active, crit) appropriately
6. Wrap the diagram in triple-backtick code blocks with 'mermaid' language tag
  `,
};

/**
 * Prepares a complete prompt for generating documentation with Mermaid diagrams
 * 
 * @param templateKey The key of the template to use
 * @param description The specific description to include in the template
 * @param diagramType The type of Mermaid diagram for specialized guidance
 * @returns A complete prompt for the AI
 */
export const prepareDocumentationPrompt = (
  templateKey: keyof typeof documentationPrompts,
  description: string,
  diagramType?: string
): { systemPrompt: string; userPrompt: string } => {
  // Get the system prompt for generating well-formed Mermaid diagrams
  const systemPrompt = getMermaidSystemPrompt(diagramType);
  
  // Get the template and insert the description
  const template = documentationPrompts[templateKey] || documentationPrompts.processFlow;
  const userPrompt = template.replace('{description}', description);
  
  return { systemPrompt, userPrompt };
};

/**
 * Processes AI-generated documentation to ensure proper Mermaid diagram formatting
 * 
 * @param text The AI-generated text that may contain Mermaid diagrams
 * @returns Processed text with properly formatted Mermaid diagrams
 */
export const processAIGeneratedDocumentation = (text: string): string => {
  if (!text) return '';
  
  // Find potential Mermaid diagram blocks
  const mermaidBlockRegex = /```(?:mermaid)?\s*\n([\s\S]*?)```/g;
  let result = text;
  let match;
  
  while ((match = mermaidBlockRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const diagramContent = match[1];
    
    // Check if this is already a properly tagged mermaid block
    if (fullMatch.startsWith('```mermaid')) {
      continue; // Already properly formatted
    }
    
    // Determine if the content is likely a Mermaid diagram
    const formattedDiagram = formatMermaidDiagram(diagramContent);
    if (formattedDiagram !== diagramContent) {
      // Replace the untagged code block with a properly tagged mermaid block
      result = result.replace(fullMatch, formattedDiagram);
    }
  }
  
  return result;
}; 