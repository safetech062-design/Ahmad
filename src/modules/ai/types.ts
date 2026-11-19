export type ProviderId = 'openai' | 'claude' | 'gemini';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatTurn[];
  signal?: AbortSignal;
}

export interface AIProvider {
  id: ProviderId;
  label: string;
  defaultModel: string;
  complete(req: CompletionRequest): Promise<string>;
}

export class AIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'AIError';
  }
}
