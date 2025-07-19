export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  contextWindow: number;
  supportsThinking?: boolean;
  thinkingType?: 'reasoning' | 'extended' | 'budget' | 'always-on';
  thinkingParameters?: {
    parameter?: string;
    defaultValue?: string | number;
    range?: string;
  };
}

export interface ProviderModels {
  gemini: AIModel[];
  openai: AIModel[];
  anthropic: AIModel[];
  xai: AIModel[];
}

export const AVAILABLE_MODELS: ProviderModels = {
  gemini: [
    {
      id: "gemini-2.5-pro",
      name: "Gemini 2.5 Pro",
      description: "State-of-the-art thinking model with enhanced reasoning (always-on thinking)",
      maxTokens: 65536,
      contextWindow: 1048576,
      supportsThinking: true,
      thinkingType: 'always-on',
      thinkingParameters: {
        parameter: 'thinking cannot be disabled',
        defaultValue: 'auto',
        range: 'always active'
      }
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      description: "Optimized for cost efficiency with configurable thinking budget (0-24576 tokens)",
      maxTokens: 65536,
      contextWindow: 1048576,
      supportsThinking: true,
      thinkingType: 'budget',
      thinkingParameters: {
        parameter: 'thinkingBudget',
        defaultValue: 'auto (-1)',
        range: '0 to 24576 tokens'
      }
    },
    {
      id: "gemini-2.5-flash-lite-preview-06-17",
      name: "Gemini 2.5 Flash-Lite",
      description: "Cost-efficient with optional thinking (thinking off by default)",
      maxTokens: 64000,
      contextWindow: 1000000,
      supportsThinking: true,
      thinkingType: 'budget',
      thinkingParameters: {
        parameter: 'thinkingBudget',
        defaultValue: 0,
        range: '0 to 24576 tokens'
      }
    },
    {
      id: "gemini-2.0-flash",
      name: "Gemini 2.0 Flash",
      description: "Next-gen features with superior speed, native tool use, and 1M token context",
      maxTokens: 32768,
      contextWindow: 1000000,
      supportsThinking: false
    },
    {
      id: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro (Legacy)",
      description: "Legacy model - Complex reasoning with large context processing",
      maxTokens: 8192,
      contextWindow: 2097152,
      supportsThinking: false
    },
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash (Legacy)",
      description: "Legacy model - Fast and cost-effective model for quick tasks",
      maxTokens: 8192,
      contextWindow: 1048576,
      supportsThinking: false
    }
  ],
  openai: [
    {
      id: "gpt-4.1",
      name: "GPT-4.1",
      description: "Latest GPT-4 with improved coding, instruction following, and 1M context window",
      maxTokens: 32768,
      contextWindow: 1000000,
      supportsThinking: false
    },
    {
      id: "gpt-4.1-mini",
      name: "GPT-4.1 Mini",
      description: "Smaller, efficient version of GPT-4.1 with 1M context window",
      maxTokens: 16384,
      contextWindow: 1000000,
      supportsThinking: false
    },
    {
      id: "gpt-4.1-nano",
      name: "GPT-4.1 Nano",
      description: "OpenAI's fastest and cheapest model with 1M context window",
      maxTokens: 8192,
      contextWindow: 1000000,
      supportsThinking: false
    },
    {
      id: "gpt-4o",
      name: "GPT-4o",
      description: "Flagship multimodal model with real-time capabilities",
      maxTokens: 16384,
      contextWindow: 128000,
      supportsThinking: false
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      description: "Cost-effective version of GPT-4o",
      maxTokens: 16384,
      contextWindow: 128000,
      supportsThinking: false
    },
    {
      id: "o3",
      name: "OpenAI o3",
      description: "Advanced reasoning model with 20% fewer errors than o1 - reasoning enabled by default (effort: low/medium/high)",
      maxTokens: 65536,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'reasoning',
      thinkingParameters: {
        parameter: 'reasoning_effort',
        defaultValue: 'medium',
        range: 'low, medium, high'
      }
    },
    {
      id: "o3-pro",
      name: "OpenAI o3 Pro",
      description: "Enhanced version designed for longer thinking - reasoning enabled by default (effort: low/medium/high)",
      maxTokens: 65536,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'reasoning',
      thinkingParameters: {
        parameter: 'reasoning_effort',
        defaultValue: 'high',
        range: 'low, medium, high'
      }
    },
    {
      id: "o3-mini",
      name: "OpenAI o3 Mini",
      description: "Cost-efficient reasoning model for coding and math - reasoning enabled by default (effort: low/medium/high)",
      maxTokens: 32768,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'reasoning',
      thinkingParameters: {
        parameter: 'reasoning_effort',
        defaultValue: 'medium',
        range: 'low, medium, high'
      }
    },
    {
      id: "o4-mini",
      name: "OpenAI o4 Mini",
      description: "Optimized for fast, cost-efficient reasoning - reasoning enabled by default (effort: low/medium/high)",
      maxTokens: 32768,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'reasoning',
      thinkingParameters: {
        parameter: 'reasoning_effort',
        defaultValue: 'medium',
        range: 'low, medium, high'
      }
    },
    {
      id: "o4-mini-high",
      name: "OpenAI o4 Mini High",
      description: "Stronger variant for code and visual reasoning - reasoning enabled by default (effort: low/medium/high)",
      maxTokens: 32768,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'reasoning',
      thinkingParameters: {
        parameter: 'reasoning_effort',
        defaultValue: 'high',
        range: 'low, medium, high'
      }
    },
    {
      id: "o1",
      name: "OpenAI o1",
      description: "Previous generation reasoning model - reasoning enabled by default (effort: low/medium/high)",
      maxTokens: 32768,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'reasoning',
      thinkingParameters: {
        parameter: 'reasoning_effort',
        defaultValue: 'medium',
        range: 'low, medium, high'
      }
    },
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      description: "Enhanced GPT-4 with 128K context window",
      maxTokens: 4096,
      contextWindow: 128000,
      supportsThinking: false
    },
    {
      id: "gpt-4",
      name: "GPT-4",
      description: "Standard GPT-4 model (legacy)",
      maxTokens: 8192,
      contextWindow: 8192,
      supportsThinking: false
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      description: "Fast and cost-effective model",
      maxTokens: 4096,
      contextWindow: 16385,
      supportsThinking: false
    },
    {
      id: "gpt-3.5-turbo-instruct",
      name: "GPT-3.5 Turbo Instruct",
      description: "Completion-style model similar to text-davinci-003",
      maxTokens: 4096,
      contextWindow: 4096,
      supportsThinking: false
    }
  ],
  anthropic: [
    {
      id: "claude-opus-4-20250514",
      name: "Claude Opus 4",
      description: "Most capable and intelligent model with hybrid reasoning - thinking enabled by default (budget_tokens parameter)",
      maxTokens: 128000,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'extended',
      thinkingParameters: {
        parameter: 'budget_tokens',
        defaultValue: 'auto',
        range: 'auto or positive integer up to 128k'
      }
    },
    {
      id: "claude-sonnet-4-20250514",
      name: "Claude Sonnet 4",
      description: "High performance hybrid reasoning model - thinking enabled by default (budget_tokens parameter)",
      maxTokens: 128000,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'extended',
      thinkingParameters: {
        parameter: 'budget_tokens',
        defaultValue: 'auto',
        range: 'auto or positive integer up to 128k'
      }
    },
    {
      id: "claude-3-7-sonnet-20250219",
      name: "Claude 3.7 Sonnet",
      description: "High intelligence with extended reasoning enabled by default (thinking_budget parameter)",
      maxTokens: 64000,
      contextWindow: 200000,
      supportsThinking: true,
      thinkingType: 'extended',
      thinkingParameters: {
        parameter: 'thinking_budget',
        defaultValue: 'auto',
        range: 'auto or positive integer'
      }
    },
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet",
      description: "High level of intelligence and capability",
      maxTokens: 8192,
      contextWindow: 200000,
      supportsThinking: false
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
      description: "Intelligence at blazing speeds",
      maxTokens: 8192,
      contextWindow: 200000,
      supportsThinking: false
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      description: "Top-level intelligence, fluency, and understanding",
      maxTokens: 4096,
      contextWindow: 200000,
      supportsThinking: false
    },
    {
      id: "claude-3-haiku-20240307",
      name: "Claude 3 Haiku",
      description: "Quick and accurate targeted performance",
      maxTokens: 4096,
      contextWindow: 200000,
      supportsThinking: false
    }
  ],
  xai: [
    {
      id: "grok-4-0709",
      name: "Grok 4",
      description: "Most intelligent model with frontier-level multimodal understanding and always-on reasoning",
      maxTokens: 32768,
      contextWindow: 256000,
      supportsThinking: true,
      thinkingType: 'always-on',
      thinkingParameters: {
        parameter: 'reasoning cannot be disabled',
        defaultValue: 'auto',
        range: 'always active'
      }
    },
    {
      id: "grok-3",
      name: "Grok 3",
      description: "Advanced reasoning model with refined capabilities - reasoning enabled by default",
      maxTokens: 16384,
      contextWindow: 1000000,
      supportsThinking: true,
      thinkingType: 'reasoning',
      thinkingParameters: {
        parameter: 'reasoning cannot be disabled',
        defaultValue: 'auto',
        range: 'always active'
      }
    },
    {
      id: "grok-3-mini",
      name: "Grok 3 Mini",
      description: "Cost-efficient reasoning model - reasoning enabled by default",
      maxTokens: 8192,
      contextWindow: 128000,
      supportsThinking: true,
      thinkingType: 'reasoning',
      thinkingParameters: {
        parameter: 'reasoning cannot be disabled',
        defaultValue: 'auto',
        range: 'always active'
      }
    }
  ]
};

// Default models for each provider (fallback if user doesn't select)
export const DEFAULT_MODELS = {
  gemini: "gemini-2.5-pro",
  openai: "gpt-4.1",
  anthropic: "claude-sonnet-4-20250514",
  xai: "grok-4-0709"
};

// Get model by ID
export function getModel(provider: keyof ProviderModels, modelId: string): AIModel | undefined {
  return AVAILABLE_MODELS[provider].find(model => model.id === modelId);
}

// Get default model for provider
export function getDefaultModel(provider: keyof ProviderModels): AIModel {
  const defaultId = DEFAULT_MODELS[provider];
  const model = getModel(provider, defaultId);
  if (!model) {
    // Fallback to first available model if default not found
    return AVAILABLE_MODELS[provider][0];
  }
  return model;
}