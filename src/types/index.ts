export type ActionType = 'PURCHASE' | 'USAGE';

export interface User {
  id: string;
  email: string;
  credits: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreditHistory {
  id: string;
  userId: string;
  amount: number;
  action: ActionType;
  description: string;
  createdAt: Date | string;
}

export interface ImageResult {
  id: string;
  userId: string;
  originalUrl: string;
  enhancedUrl: string;
  scaleFactor: number;
  createdAt: Date | string;
}

export interface EnhanceResponse {
  success: boolean;
  enhancedUrl?: string;
  creditsRemaining?: number;
  error?: string;
  isMock?: boolean;
}

export interface CheckoutResponse {
  sessionId?: string;
  url?: string;
  error?: string;
}
