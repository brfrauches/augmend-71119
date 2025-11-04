
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  category: string;
}

export interface HealthAssistantResponse {
  response: string;
  timestamp: string;
}
