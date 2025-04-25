/**
 * Mermaid Diagram Prompt Utilities
 * 
 * This file contains prompts and utilities to help generate well-formed Mermaid diagrams
 * from AI responses, minimizing rendering errors.
 */

/**
 * Returns a system prompt that instructs AI models to produce well-formed Mermaid syntax
 * 
 * @param diagramType Optional specific diagram type to optimize for
 * @returns A system prompt string
 */
export const getMermaidSystemPrompt = (diagramType?: string): string => {
  // Base prompt that applies to all Mermaid diagrams
  let prompt = `
You are an expert Mermaid diagram generator. When asked to create diagrams, follow these strict rules to ensure error-free rendering:

1. Always wrap diagram code in triple backticks with the 'mermaid' language tag:
\`\`\`mermaid
[diagram code here]
\`\`\`

2. Always start with the diagram type declaration (graph TD, sequenceDiagram, etc.) on the first line.

3. Use valid syntax for the specific diagram type:
   - For flowcharts, use 'graph' instead of 'flowchart' (e.g., 'graph TD' not 'flowchart TD')
   - For node definitions, always use clear, valid identifiers without spaces
   - Always add a semicolon (;) at the end of flowchart declarations and other statements

4. Ensure proper spacing around arrows and operators:
   - A --> B (correct)
   - A-->B (avoid)

5. When using edge labels with pipes, ensure there's a space after the closing pipe:
   - A -->|condition| B (correct)
   - A -->|condition|B (avoid)

6. For node labels with multiple words, use double quotes:
   - A["Multi word label"] (correct)
   - A[Multi word label] (avoid for complex labels)

7. Make sure all brackets, parentheses, and quotes are properly closed.

8. Keep diagram structure simple and clear - avoid overly complex relationships.

9. Test your diagram mentally before providing it, ensuring it will parse correctly.
`;

  // Add diagram-specific guidance based on the requested type
  if (diagramType) {
    switch (diagramType.toLowerCase()) {
      case 'flow':
      case 'flowchart':
        prompt += `
FLOWCHART SPECIFIC RULES:
- Always use 'graph' instead of 'flowchart' (e.g., 'graph TD' not 'flowchart TD')
- Valid directions are: TD (top-down), BT (bottom-top), RL (right-left), LR (left-right)
- Node syntax: nodeId[label], nodeId(label), nodeId{label}, nodeId>label]
- Connection syntax: A --> B, A --- B, A ==> B, A -.- B
- Use proper spacing: A --> B not A-->B 
- Always define nodes before using them in connections
- Example:
\`\`\`mermaid
graph TD;
  A[Start] --> B[Process];
  B --> C{Decision};
  C -->|Yes| D[Result 1];
  C -->|No| E[Result 2];
\`\`\`
`;
        break;

      case 'sequence':
        prompt += `
SEQUENCE DIAGRAM SPECIFIC RULES:
- Start with 'sequenceDiagram'
- Define participants: participant A as "Label A"
- Message syntax: A->>B: Message text
- Activation: activate A / deactivate A
- Notes: Note over A,B: Note text
- Example:
\`\`\`mermaid
sequenceDiagram
  participant C as Client
  participant S as Server
  
  C->>S: Request Data
  activate S
  S->>S: Process Request
  S->>C: Response
  deactivate S
\`\`\`
`;
        break;

      case 'state':
        prompt += `
STATE DIAGRAM SPECIFIC RULES:
- Start with 'stateDiagram-v2'
- State definitions: state "Label" as StateId
- Transitions: StateA --> StateB
- Composite states: state StateA { [substates] }
- Example:
\`\`\`mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Processing: Start
  Processing --> Complete: Finish
  Processing --> Error: Fail
  Complete --> [*]
  Error --> Idle: Retry
\`\`\`
`;
        break;

      case 'er':
        prompt += `
ER DIAGRAM SPECIFIC RULES:
- Start with 'erDiagram'
- Entity relationship syntax: ENTITY1 ||--o{ ENTITY2 : "relationship"
- Example:
\`\`\`mermaid
erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  CUSTOMER }|..|{ PAYMENT : makes
\`\`\`
`;
        break;

      case 'class':
        prompt += `
CLASS DIAGRAM SPECIFIC RULES:
- Start with 'classDiagram'
- Class definition: class ClassName { methods and properties }
- Relationship syntax: ClassA <|-- ClassB
- Example:
\`\`\`mermaid
classDiagram
  Animal <|-- Duck
  Animal <|-- Fish
  Animal : +int age
  Animal : +String gender
  Animal: +isMammal()
  Animal: +mate()
  class Duck{
    +String beakColor
    +swim()
    +quack()
  }
\`\`\`
`;
        break;

      case 'gantt':
        prompt += `
GANTT CHART SPECIFIC RULES:
- Start with 'gantt'
- Include dateFormat, title, and section declarations
- Task syntax: Task name : status, dateA, dateB
- Example:
\`\`\`mermaid
gantt
  title Project Schedule
  dateFormat  YYYY-MM-DD
  section Design
  Task 1 : done, 2023-01-01, 2023-01-05
  Task 2 : active, 2023-01-06, 2023-01-10
  section Development
  Task 3 : 2023-01-11, 5d
\`\`\`
`;
        break;
    }
  }

  return prompt;
};

/**
 * Returns user prompt prefixes that help generate well-formed diagrams
 */
export const diagramPromptPrefixes = {
  flowchart: `Create a mermaid flowchart diagram showing the following process. Use 'graph TD' syntax with proper node definitions and spacing:

Process: `,

  sequence: `Create a mermaid sequence diagram showing the following interactions. Ensure proper syntax with clearly named participants and correct message arrows:

Interactions: `,

  state: `Create a mermaid state diagram showing the following state machine. Use 'stateDiagram-v2' syntax with clear state transitions:

States: `,

  er: `Create a mermaid entity-relationship diagram showing the following data model. Use proper ER syntax with relationship cardinality:

Entities: `,

  class: `Create a mermaid class diagram showing the following object model. Include appropriate methods, properties and relationships:

Classes: `,

  gantt: `Create a mermaid gantt chart showing the following project timeline. Include proper date formatting and section divisions:

Timeline: `
};

/**
 * Formats a Mermaid diagram for error-free rendering
 * 
 * Takes input text that might contain mermaid syntax and ensures it's
 * properly wrapped in code fences with the mermaid tag
 * 
 * @param text Input text potentially containing mermaid diagram
 * @returns Properly formatted mermaid diagram
 */
export const formatMermaidDiagram = (text: string): string => {
  // If already properly wrapped, return as is
  if (text.includes("```mermaid") && text.includes("```")) {
    return text;
  }
  
  // Identify common diagram type declarations
  const diagramDeclarations = [
    'graph ', 'flowchart ', 'sequenceDiagram', 'stateDiagram', 
    'erDiagram', 'classDiagram', 'gantt', 'pie', 'journey'
  ];
  
  // Check if we have an unwrapped diagram
  let foundDiagramType = false;
  for (const decl of diagramDeclarations) {
    if (text.includes(decl)) {
      foundDiagramType = true;
      break;
    }
  }
  
  if (foundDiagramType) {
    return "```mermaid\n" + text.trim() + "\n```";
  }
  
  // If no diagram type found, assume it's not a mermaid diagram
  return text;
};

/**
 * Use this to instruct the AI how to generate a specific type of diagram
 * 
 * @param type The type of mermaid diagram to create
 * @param description The description of what the diagram should represent
 * @returns A well-structured prompt that guides the AI to generate valid mermaid syntax
 */
export const createDiagramPrompt = (type: keyof typeof diagramPromptPrefixes, description: string): string => {
  // Get the prefix for the requested diagram type
  const prefix = diagramPromptPrefixes[type] || diagramPromptPrefixes.flowchart;
  
  return `${prefix}${description}

Remember to:
1. Start with the proper diagram type declaration
2. Use proper syntax and spacing
3. Wrap your response in triple backticks with 'mermaid' language tag
4. Keep node/entity names simple and consistent
5. Check that all brackets and quotes are properly closed`;
}; 