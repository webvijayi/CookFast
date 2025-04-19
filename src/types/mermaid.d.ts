declare module 'mermaid' {
  interface MermaidConfig {
    startOnLoad?: boolean;
    theme?: string;
    securityLevel?: string;
    [key: string]: unknown;
  }

  interface RunOptions {
    nodes?: HTMLElement[];
    [key: string]: unknown;
  }

  export function initialize(config: MermaidConfig): void;
  export function run(options?: RunOptions): Promise<unknown>;
  
  const mermaid = {
    initialize,
    run
  };
  
  export default mermaid;
} 