import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MermaidGuide: React.FC = () => {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Creating Error-Free Mermaid Diagrams</h2>
      
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Use these guidelines to ensure your Mermaid diagrams render correctly:
      </p>
      
      <Tabs defaultValue="flow">
        <TabsList className="mb-4">
          <TabsTrigger value="flow">Flowcharts</TabsTrigger>
          <TabsTrigger value="sequence">Sequence</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
          <TabsTrigger value="er">ER Diagrams</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flow" className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium mb-2">Flowchart Diagrams</h3>
          
          <ul className="list-disc ml-5 mb-3 space-y-1 text-sm">
            <li>Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">graph TD</code> (top-down) or <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">graph LR</code> (left-right)</li>
            <li>Add semicolons to the graph declaration: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">graph TD;</code></li>
            <li>Use spaces in arrows: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">A --{'>'}  B</code> (not <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">A--{'>'}B</code>)</li>
            <li>For labels with spaces, use quotes: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">A["Multi word"]</code></li>
            <li>For edge labels, add spaces after pipes: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">A --{'>'}|Yes| B</code></li>
          </ul>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm font-mono overflow-x-auto">
{`\`\`\`mermaid
graph TD;
  A[Start] --> B[Process];
  B --> C{Decision};
  C -->|Yes| D[Result 1];
  C -->|No| E[Result 2];
\`\`\``}
          </div>
        </TabsContent>
        
        <TabsContent value="sequence" className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium mb-2">Sequence Diagrams</h3>
          
          <ul className="list-disc ml-5 mb-3 space-y-1 text-sm">
            <li>Start with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">sequenceDiagram</code></li>
            <li>Define participants: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">participant A as "System A"</code></li>
            <li>Use proper arrow syntax with spacing: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">A-{'>'}{'>'} B: Message</code></li>
            <li>Use activate/deactivate to show active periods: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">activate A</code></li>
          </ul>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm font-mono overflow-x-auto">
{`\`\`\`mermaid
sequenceDiagram
  participant A as System A
  participant B as System B
  
  A->>B: Request
  activate B
  B->>A: Response
  deactivate B
\`\`\``}
          </div>
        </TabsContent>
        
        <TabsContent value="state" className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium mb-2">State Diagrams</h3>
          
          <ul className="list-disc ml-5 mb-3 space-y-1 text-sm">
            <li>Start with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">stateDiagram-v2</code></li>
            <li>Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">[*]</code> for start/end states</li>
            <li>Add transition descriptions with colons: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">StateA --{'>'} StateB: Action</code></li>
            <li>For composite states, use curly braces: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">state StateA {'{'} ... {'}'}</code></li>
          </ul>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm font-mono overflow-x-auto">
{`\`\`\`mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Processing: Start
  Processing --> Complete: Success
  Processing --> Error: Failure
  Complete --> [*]
  Error --> Idle: Retry
\`\`\``}
          </div>
        </TabsContent>
        
        <TabsContent value="er" className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium mb-2">Entity Relationship Diagrams</h3>
          
          <ul className="list-disc ml-5 mb-3 space-y-1 text-sm">
            <li>Start with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">erDiagram</code></li>
            <li>Entity names are conventionally UPPERCASE</li>
            <li>Relationship syntax: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">ENTITY1 ||--o{'{'} ENTITY2 : "relationship"</code></li>
            <li>Cardinality indicators: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">||</code> (exactly one), <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">o{'{'}</code> (zero or many), etc.</li>
          </ul>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm font-mono overflow-x-auto">
{`\`\`\`mermaid
erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ ORDER_ITEM : contains
  CUSTOMER }|..|{ PAYMENT : makes
\`\`\``}
          </div>
        </TabsContent>
        
        <TabsContent value="gantt" className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="font-medium mb-2">Gantt Charts</h3>
          
          <ul className="list-disc ml-5 mb-3 space-y-1 text-sm">
            <li>Start with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">gantt</code></li>
            <li>Include a dateFormat: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">dateFormat YYYY-MM-DD</code></li>
            <li>Group tasks with sections: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">section SectionName</code></li>
            <li>Task syntax: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Task name : status, startDate, endDate</code></li>
          </ul>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm font-mono overflow-x-auto">
{`\`\`\`mermaid
gantt
  title Project Timeline
  dateFormat YYYY-MM-DD
  
  section Phase 1
  Task 1 : done, 2023-01-01, 2023-01-15
  Task 2 : active, 2023-01-16, 2023-01-30
  
  section Phase 2
  Task 3 : 2023-02-01, 2023-02-15
\`\`\``}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
        <h3 className="font-medium mb-2 text-indigo-700 dark:text-indigo-300">General Tips</h3>
        <ul className="list-disc ml-5 space-y-1 text-sm text-indigo-700 dark:text-indigo-300">
          <li>Always wrap Mermaid code in <code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">```mermaid</code> and <code className="bg-white/50 dark:bg-gray-800/50 px-1 rounded">```</code> fences</li>
          <li>Keep syntax consistent - uniform spacing around arrows and operators</li>
          <li>Test complex diagrams incrementally, adding a few elements at a time</li>
          <li>Use simple node IDs (alphanumeric, no spaces) with descriptive labels in brackets</li>
          <li>Ensure all brackets, parentheses, and quotes are properly closed</li>
        </ul>
      </div>
    </div>
  );
};

export default MermaidGuide;