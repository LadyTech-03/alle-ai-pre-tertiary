import { LucideProps } from "lucide-react";
import { Model } from "./api/models";

export type Benchmark = {
  name: string;
  score: number;
  maxScore: number;
};

export type UseCase = {
  title: string;
  description: string;
};

export type TechnicalSpecs = {
  modelSize?: string;
  contextWindow?: string;
  trainingData?: string;
  architecture?: string;
  parameters?: string;
  [key: string]: string | undefined;
};

export type ModelDetails = {
  id: string;
  name: string;
  provider: string;
  version: string;
  type: string;
  releaseDate: string;
  image: string;
  description: string;
  capabilities: string[];
  technicalSpecs: TechnicalSpecs;
  benchmarks: Benchmark[];
  useCases: UseCase[];
  limitations: string[];
};

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  status: "loading" | "ready" | "error";
  progress?: number;
  processedContent?: string;
  timestamp?: number;
  originalFile?: File;
  fileUuid?: string; // Backend UUID for text files
}

export interface ChatThread {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  modelResponses: ModelResponse[];
}

export interface ModelResponse {
  id: string; // response ID
  modelId: string; // model_uid
  content: string;
  status: 'loading' | 'complete' | 'error';
  error?: string;
  sources?: Source[];
}

export interface Article {
  id: string;
  title: string;
  description: string;
  readingTime: string;
}

export interface Section {
  title: string;
  articles: Article[];
}

export interface HelpCategory {
  id: string;
  iconName: IconName;
  title: string;
  description: string;
  sections: Section[];
  uniqueRoute?: boolean;
  href?:string
}

export type IconName =
  | "Settings"
  | "BriefcaseBusiness"
  | "Code"
  | "MessageCircleMore"
  | "FolderCog"
  | "Users"
  | "Building2"
  | "AlertTriangle"
  | "Clock"
  | "ChevronRight"
  | "Search"
  | "ArrowLeft"
  | "ThumbsUp"
  | "ThumbsDown";

export type CategoryKeys =
  | "3943089-account-login-and-billing"
  | "6864268-privacy-and-policies"
  | "3675931-api"
  | "3742473-alle-ai"
  | "7835004-alle-ai-custom"
  | "5688074-alle-ai-teams"
  | "11106745-alle-ai-enterprise";

export type HelpCategories = {
  [K in CategoryKeys]: HelpCategory;
};

export interface Transaction {
  id: string;
  type: "subscription" | "referral" | "refund";
  amount: number;
  mode: "platform" | "card";
  status: "completed" | "pending" | "failed";
  plan?: string;
  date: Date;
  cardLast4?: string;
  description: string;
  paymentMethod?: string;
}

export interface Invoice {
  id: string;
  number: string;
  status: "paid" | "open" | "void" | "uncollectible";
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  subscription?: string;
  billing_reason?: string;
  discount?: any;
  description?: string;
}

export interface InvoicesResponse {
  status: boolean;
  invoices: Invoice[];
}

export interface Source {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  summary?: string;
  favicon?: string;
  image?: string; 
}

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'feature' | 'security' | 'update' | 'alert' | 'info';
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  metadata?: {
    category?: string;
    tags?: string[];
    relatedFeature?: string;
  };
};

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  position: [number, number];
  responses: ModelResponse[];
}

export interface Branch {
  messages: Message[];
  startPosition: [number, number];
}

export interface LoadedConversation {
  input_content: any | null;
  position: [number, number];
  prompt: string;
  prompt_id: number;
  responses: Array<{
    body: string;
    id: number;
    liked: boolean | null;
    model: {
      uid: string;
      name: string;
      image: string;
      model_plan: string;
    }
  }>;
}
