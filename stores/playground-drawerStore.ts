import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Types
export type TabType = 'response' | 'history' | 'conversations';

interface ModelResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  tokens_used: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ConversationResponse {
  modelName: string;
  status: 'success' | 'error';
  response: ModelResponse;
}

interface ConversationEntry {
  conversationId: string;
  userMessage: string;
  timestamp: string;
  responses: Record<string, ConversationResponse>; // Key: modelId
}

interface ConversationState {
  conversations: ConversationEntry[];
  showDrawer: boolean;
  hasFollowUp: boolean;
  isDrawerAnimationLoading: boolean;
  activeTab: TabType; // Add new state
  addConversation: (entry: ConversationEntry) => void;
  removeConversation: (conversationId: string) => void;
  clearAllConversations: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setHasFollowUp: (value: boolean) => void;
  clearFollowUpState: () => void;
  setDrawerAnimationLoading: (value: boolean) => void;
  setActiveTab: (tab: TabType) => void; // Add new action
}

// Helper to format model names
const formatModelName = (modelId: string): string => {
  const parts = modelId
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter((part) => !/^\d+[bB]$/.test(part));
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

// Create entry from API response
export const createConversationEntry = (
  userMessage: string,
  serverResponse: any
): ConversationEntry => {
  const conversationId = uuidv4();
  const timestamp = new Date(serverResponse.responses.created.date).toISOString();
  const responsesRaw = serverResponse.responses.responses;
  const responseEntries: Record<string, ConversationResponse> = {};

  for (const modelId in responsesRaw) {
    const modelResponse = responsesRaw[modelId];
    responseEntries[modelId] = {
      modelName: formatModelName(modelId),
      status:
        serverResponse.success && modelResponse?.message?.content ? 'success' : 'error',
      response: modelResponse || {
        model: modelId,
        message: { role: 'assistant', content: 'No response available' },
        finish_reason: 'error',
        tokens_used: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      }
    };
  }

  return {
    conversationId,
    userMessage,
    timestamp,
    responses: responseEntries
  };
};

// Zustand Store without persistence
export const useFollowUpConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  showDrawer: false,
  hasFollowUp: false,
  isDrawerAnimationLoading: false,
  activeTab: 'response', // Add initial state

  addConversation: (entry: ConversationEntry) => {
    set((state) => ({
      conversations: [...state.conversations, entry]
    }));
  },

  removeConversation: (conversationId: string) => {
    set((state) => ({
      conversations: state.conversations.filter(
        (conv) => conv.conversationId !== conversationId
      )
    }));
  },

  clearAllConversations: () => {
    set((state) => ({
      ...state,
      conversations: []
    }));
  },

  openDrawer: () => set({ showDrawer: true }),
  
  closeDrawer: () => set((state) => ({ 
    showDrawer: false,
    activeTab: 'response' // Automatically switch to response tab when drawer closes
  })),
  
  setHasFollowUp: (value: boolean) => {
    if (!value) {
      set({ hasFollowUp: false, showDrawer: false, activeTab: 'response' }); // Add tab reset
    } else {
      set({ hasFollowUp: true });
    }
  },

  clearFollowUpState: () => {
    set({
      conversations: [],
      showDrawer: false,
      hasFollowUp: false,
      isDrawerAnimationLoading: false,
      activeTab: 'response'
    });
  },

  setDrawerAnimationLoading: (value: boolean) => set({ isDrawerAnimationLoading: value }),
  
  // Add new action
  setActiveTab: (tab: TabType) => {
    set({ activeTab: tab });
  },
}));
