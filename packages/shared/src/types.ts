// Shared types across all packages

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  amazonUrl?: string;
  price?: number;
  currency?: string;
}

export interface Source {
  id: string;
  domain: string;
  name: string;
  affiliateId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRecommendation {
  id: string;
  productId: string;
  sourceId: string;
  chatgptResponseId: string;
  originalUrl: string;
  affiliateUrl: string;
  timestamp: Date;
}

export interface ChatGPTResponse {
  id: string;
  content: string;
  products: Product[];
  sources: Source[];
  timestamp: Date;
}

export interface AffiliateLink {
  originalUrl: string;
  affiliateUrl: string;
  sourceId: string;
  productId?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SourceRegistration {
  domain: string;
  name: string;
  email: string;
  affiliateId: string;
  description?: string;
}

// Extension message types
export interface ExtensionMessage {
  type: 'PROCESS_RESPONSE' | 'STORE_MAPPING' | 'GET_AFFILIATE_LINK';
  payload: any;
}

export interface ProcessResponseMessage extends ExtensionMessage {
  type: 'PROCESS_RESPONSE';
  payload: {
    responseText: string;
    responseElement: string;
  };
}

export interface GetAffiliateLinkMessage extends ExtensionMessage {
  type: 'GET_AFFILIATE_LINK';
  payload: {
    originalUrl: string;
    productName?: string;
  };
}