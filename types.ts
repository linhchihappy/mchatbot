export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface MathResponseData {
  theory: string;
  hint: string;
  solution: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text?: string;
  image?: string; // Base64 string
  mimeType?: string;
  fileName?: string;
  data?: MathResponseData; // Structured data for model responses
  isError?: boolean;
}

export interface ProcessingState {
  isLoading: boolean;
  statusText: string;
}