// App-wide type definitions

// UI State Types
export type PanelState = 'intro' | 'details' | 'docs' | 'results';
export type WorkPhase = 'preparing' | 'generating' | 'complete' | 'error';
export type ModelProvider = 'gemini' | 'openai' | 'anthropic';
export type AIProvider = 'gemini' | 'openai' | 'anthropic';

// Core Data Types
export interface ProjectDetails {
  projectName: string;
  projectType: string;
  projectGoal: string;
  features: string;
  techStack: string;
  hasBackend?: boolean;
  hasFrontend?: boolean;
  projectDescription?: string;
}

export interface DocumentSelection {
  requirements: boolean;
  frontendGuidelines: boolean;
  backendStructure: boolean;
  appFlow: boolean;
  techStackDoc: boolean;
  systemPrompts: boolean;
  fileStructure: boolean;
}

export interface DocumentSection {
  title: string;
  content: string;
}

export interface ModelConfig {
  provider: ModelProvider;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
}

export interface DebugLog {
  timestamp: string;
  event: string;
  details: unknown;
}

export interface ProjectJSON {
  project: ProjectDetails;
  documents: {
    [key: string]: {
      content: string;
      sections: DocumentSection[];
    };
  };
  metadata: {
    generatedWith: string;
    timestamp: string;
    provider?: string;
    model?: string;
  };
} 