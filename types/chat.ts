export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isGenerating?: boolean;
  file?: {
    name: string;
    type: string;
    data?: string; // base64 for images or text for documents
  };
}

export interface ChatSession {
  messages: Message[];
  uploadedFile?: {
    name: string;
    type: string;
    content: string; // extracted text or base64
    preview?: string;
  };
}

export interface ChatRequest {
  messages: Message[];
  fileContent?: string;
  fileType?: string;
}
