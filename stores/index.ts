// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from '@/lib/api/auth';
import { User } from '@/lib/api/auth';
import { toast } from "sonner";
import { HistoryItem } from '@/lib/api/history';

import { driveService } from '@/lib/services/driveServices';

import { useModelsStore } from "./models";

export interface Attachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

type ContentKey = "input" | "voice" | "attachment";
type ContentType = "chat" | "image" | "audio" | "video";

interface ContentValue {
  input: string;
  voice: File | null;
  attachment: Attachment | null;
}

interface ContentStore {
  content: Record<ContentType, ContentValue>;
  setContent: <K extends ContentKey>(
    type: ContentType,
    key: K,
    value: ContentValue[K]
  ) => void;
  resetContent: (type: ContentType) => void;
}

export const useContentStore = create(
  persist<ContentStore>(
    (set) => ({
      content: {
        chat: { input: "", voice: null, attachment: null },
        image: { input: "", voice: null, attachment: null },
        audio: { input: "", voice: null, attachment: null },
        video: { input: "", voice: null, attachment: null },
      },
      setContent: (type, key, value) =>
        set((state) => ({
          content: {
            ...state.content,
            [type]: {
              ...state.content[type],
              [key]: value,
            },
          },
        })),
      resetContent: (type) =>
        set((state) => ({
          content: {
            ...state.content,
            [type]: { input: "", voice: null, attachment: null },
          },
        })),
    }),
    {
      name: "content-storage",
      partialize: (state) => ({ content: state.content }),
    }
  )
);

interface PendingChatState {
  link?: string;
  prompt?: string;
  isWebSearch?: boolean;
  isCombinedMode?: boolean;
  isCompareMode?: boolean;
}

interface PendingChatStateStore {
  pending: PendingChatState | null;
  setPending: (state: PendingChatState) => void;
  clearPending: () => void;
}

export const usePendingChatStateStore = create(
  persist<PendingChatStateStore>(
    (set) => ({
      pending: null,
      setPending: (state) => set({ pending: state }),
      clearPending: () => set({ pending: null }),
    }),
    {
      name: 'pending-chat-state',
      partialize: (state) => ({ pending: state.pending }),
    }
  )
);

interface SidebarState {
  isOpen: boolean;
  currentPage: string;
  sectionIds: { [key: string]: string | null }; // Generalized section IDs
  currentConversationLink: string | null; // Add this
  toggle: () => void;
  setCurrentPage: (page: string) => void;
  setSectionId: (section: string, id: string | null) => void; // Setter for dynamic IDs
  setOpen: (value: boolean) => void;
  setCurrentConversationLink: (link: string | null) => void; // Add this
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      currentPage: "chat",
      sectionIds: {
        chatId: null,
        imageId: null,
        audioId: null,
        videoId: null,
      }, // Default section IDs
      currentConversationLink: null,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setCurrentPage: (page) => set({ currentPage: page }),
      setSectionId: (section, id) =>
        set((state) => ({
          sectionIds: {
            ...state.sectionIds,
            [section]: id, // Dynamically update the section ID
          },
        })),
      setOpen: (value) => set({ isOpen: value }),
      setCurrentConversationLink: (link) => set({ currentConversationLink: link }),
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        isOpen: state.isOpen,
        sectionIds: state.sectionIds,
        currentConversationLink: state.currentConversationLink,
        // currentPage: state.currentPage,
      }),
    }
  )
);

interface SelectedModelsStore {
  initialized: boolean;
  setInitialized: (value: boolean) => void;
  selectedModels: {
    chat: string[];
    image: string[];
    audio: string[];
    video: string[];
  };
  inactiveModels: string[];
  setInactiveModels: (models: string[]) => void;
  tempSelectedModels: string[];
  setTempSelectedModels: (models: string[]) => void;
  saveSelectedModels: (type: 'chat' | 'image' | 'audio' | 'video') => void;
  toggleModelActive: (modelId: string) => void;
  getSelectedModelNames: (type: 'chat' | 'image' | 'audio' | 'video') => any[];
  lastUpdate: number;
  isLoadingLatest: boolean;
  setLoadingLatest: (loading: boolean) => void;
}

export const useSelectedModelsStore = create<SelectedModelsStore>((set, get) => ({
  initialized: false,
  setInitialized: (value) => set({ initialized: value }),
  selectedModels: {
    chat: [],
    image: [],
    audio: [],
    video: [],
  },
  inactiveModels: [],
  setInactiveModels: (models) => set({
    inactiveModels: models,
    lastUpdate: Date.now()
  }),
  tempSelectedModels: [],
  lastUpdate: Date.now(),
  isLoadingLatest: false,
  setTempSelectedModels: (models) => set({ tempSelectedModels: models }),
  saveSelectedModels: (type) => set((state) => ({
    selectedModels: {
      ...state.selectedModels,
      [type]: state.tempSelectedModels
    },
    lastUpdate: Date.now()
  })),
  toggleModelActive: (modelId) => {
    set((state) => ({
      inactiveModels: state.inactiveModels.includes(modelId)
        ? state.inactiveModels.filter(id => id !== modelId)
        : [...state.inactiveModels, modelId],
      lastUpdate: Date.now()
    }));
  },
  getSelectedModelNames: (type) => {
    const state = get();
    const modelsStore = useModelsStore.getState();

    const modelList = type === 'chat' ? modelsStore.chatModels
      : type === 'image' ? modelsStore.imageModels
        : type === 'audio' ? modelsStore.audioModels
          : modelsStore.videoModels;

    return state.selectedModels[type]
      .map(modelUid => {
        const model = modelList.find(m => m.model_uid === modelUid);
        return model ? {
          name: model.model_name,
          uid: model.model_uid,
          type: model.model_plan,
          isActive: !state.inactiveModels.includes(modelUid)
        } : null;
      })
      .filter((item): item is { name: string; uid: string; type: string; isActive: boolean } => item !== null);
  },
  setLoadingLatest: (loading) => set({ isLoadingLatest: loading }),
}));

interface ImageResponse {
  modelId: string;
  liked: boolean;
  imageUrl: string;
}

interface GeneratedImagesStore {
  images: ImageResponse[];
  lastPrompt: string | null;
  setImages: (images: ImageResponse[] | ((prev: ImageResponse[]) => ImageResponse[])) => void;
  updateImage: (modelId: string, updates: Partial<ImageResponse>) => void;
  setLastPrompt: (prompt: string) => void;
  clearImages: () => void;
}

export const useGeneratedImagesStore = create<GeneratedImagesStore>()(
  persist(
    (set) => ({
      images: [],
      lastPrompt: null,
      setImages: (images) => set((state) => ({
        images: typeof images === 'function' ? images(state.images) : images
      })),
      updateImage: (modelId, updates) => set((state) => ({
        images: state.images.map(img =>
          img.modelId === modelId ? { ...img, ...updates } : img
        )
      })),
      setLastPrompt: (prompt) => set({ lastPrompt: prompt }),
      clearImages: () => set({ images: [], lastPrompt: null }),
    }),
    {
      name: 'generated-images-storage'
    }
  )
);

interface AudioResponse {
  modelId: string;
  content: string;
  audioUrl: string;
  liked?: boolean;
}

interface GeneratedAudioStore {
  responses: AudioResponse[];
  lastPrompt: string | null;
  setResponses: (responses: AudioResponse[]) => void;
  updateResponse: (modelId: string, updates: Partial<AudioResponse>) => void;
  setLastPrompt: (prompt: string) => void;
  clearResponses: () => void;
}

export const useGeneratedAudioStore = create<GeneratedAudioStore>()(
  persist(
    (set) => ({
      responses: [],
      lastPrompt: null,
      setResponses: (responses) => set({ responses }),
      updateResponse: (modelId, updates) => set((state) => ({
        responses: state.responses.map(res =>
          res.modelId === modelId ? { ...res, ...updates } : res
        )
      })),
      setLastPrompt: (prompt) => set({ lastPrompt: prompt }),
      clearResponses: () => set({ responses: [], lastPrompt: null }),
    }),
    {
      name: 'generated-audio-storage'
    }
  )
);

interface HistoryStore {
  history: HistoryItem[];
  isLoading: boolean;
  currentPage: number;
  hasMore: boolean;
  error: string | null;
  setHistory: (items: HistoryItem[]) => void;
  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  removeHistory: (id: string) => void;
  renameHistory: (id: string, newTitle: string) => void;
  updateHistoryTitle: (id: string, newTitle: string) => void;
  getHistoryByType: (type: HistoryItem['type']) => HistoryItem[];
  getHistoryItemById: (id: string) => HistoryItem | undefined;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  clearHistory: () => void;
  addHistoryItems: (items: HistoryItem[]) => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  history: [],
  isLoading: false,
  currentPage: 1,
  hasMore: true,
  error: null,
  setHistory: (items) => set({ history: items }),
  addHistory: (item) => set((state) => ({
    history: [
      {
        ...item,
        id: item.session,
        timestamp: new Date(),
      },
      ...state.history,
    ],
  })),
  removeHistory: (id) => set((state) => ({
    history: state.history.filter((item) => item.id !== id),
  })),
  renameHistory: (id, newTitle) => set((state) => ({
    history: state.history.map((item) =>
      item.id === id ? { ...item, title: newTitle } : item
    ),
  })),
  updateHistoryTitle: (id, newTitle) =>
    set((state) => ({
      history: state.history.map((item) =>
        item.session === id ? { ...item, title: newTitle } : item
      )
    })),
  getHistoryByType: (type) => {
    return get().history.filter((item) => item.type === type);
  },
  getHistoryItemById: (id) => {
    return get().history.find((item) => item.session === id || item.id === id);
  },
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ currentPage: page }),
  setHasMore: (hasMore) => set({ hasMore }),
  clearHistory: () => set({ history: [], currentPage: 1, hasMore: true }),
  addHistoryItems: (items) =>
    set((state) => {
      // Filter out any duplicates based on session ID
      const existingIds = new Set(state.history.map(item => item.session));
      const newItems = items.filter(item => !existingIds.has(item.session));

      return {
        history: [...state.history, ...newItems]
      };
    }),
}));

export interface LikedMediaItem {
  id: string;
  responseId: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  modelName: string;
  modelIcon: string;
  modelId: string;
  prompt: string;
  timestamp: Date;
  liked: boolean;
}

interface LikedMediaStore {
  likedMedia: LikedMediaItem[];
  addLikedMedia: (item: Omit<LikedMediaItem, 'id' | 'timestamp'>) => void;
  removeLikedMedia: (id: string) => void;
  clearLikedMedia: () => void;
  getLikedMediaByType: (type: 'all' | 'image' | 'video' | 'audio') => LikedMediaItem[];
}

export const useLikedMediaStore = create<LikedMediaStore>()(
  // persist(
  (set, get) => ({
    likedMedia: [],
    addLikedMedia: (item) =>
      set((state) => ({
        likedMedia: [
          {
            ...item,
            id: `${item.type}-${Date.now()}`,
            timestamp: new Date(),
          },
          ...state.likedMedia,
        ],
      })),
    removeLikedMedia: (id) =>
      set((state) => ({
        likedMedia: state.likedMedia.filter((item) => item.id !== id),
      })),
    clearLikedMedia: () =>
      set({ likedMedia: [] }),
    getLikedMediaByType: (type) => {
      const media = get().likedMedia;
      if (type === 'all') return media;
      return media.filter((item) => item.type === type);
    },
  }),
  //   {
  //     name: 'liked-media-storage',
  //   }
  // )
);

interface DriveAuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  setAuth: (token: string, expiresIn: number) => void;
  clearAuth: () => void;
  checkAndRefreshAuth: () => Promise<boolean>;
}

export const useDriveAuthStore = create<DriveAuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,

      setAuth: (token: string, expiresIn: number) => {
        const expiresAt = Date.now() + (expiresIn * 1000);
        set({
          isAuthenticated: true,
          accessToken: token,
          expiresAt: expiresAt
        });
      },

      clearAuth: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          expiresAt: null
        });
      },

      checkAndRefreshAuth: async () => {
        const state = get();
        const now = Date.now();

        // If we have a valid token that's not expired
        if (state.accessToken && state.expiresAt && state.expiresAt > now) {
          return true;
        }

        try {
          // Get gapi instance from driveService
          const gapi = driveService.getGapi();
          if (!gapi) {
            throw new Error('Google Drive API not initialized');
          }

          // Try to refresh the token using gapi
          const authInstance = gapi.auth2.getAuthInstance();
          if (authInstance.isSignedIn.get()) {
            const currentUser = authInstance.currentUser.get();
            const authResponse = currentUser.getAuthResponse();

            set({
              isAuthenticated: true,
              accessToken: authResponse.access_token,
              expiresAt: authResponse.expires_at
            });

            return true;
          }

          // If not signed in, clear auth state
          state.clearAuth();
          return false;
        } catch (error) {
          // console.error('Failed to refresh auth:', error);
          state.clearAuth();
          return false;
        }
      }
    }),
    {
      name: 'drive-auth-storage'
    }
  )
);

interface SharedLink {
  id: string;
  historyId: string;
  title: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SharedLinksStore {
  sharedLinks: SharedLink[];
  addSharedLink: (historyId: string, title: string, link: string) => void;
  updateSharedLink: (id: string, link: string) => void;
  removeSharedLink: (id: string) => void;
  getSharedLink: (historyId: string) => SharedLink | undefined;
}

export const useSharedLinksStore = create<SharedLinksStore>()(
  persist(
    (set, get) => ({
      sharedLinks: [],
      addSharedLink: (historyId, title, link) =>
        set((state) => ({
          sharedLinks: [
            {
              id: `share-${Date.now()}`,
              historyId,
              title,
              link,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            ...state.sharedLinks,
          ],
        })),
      updateSharedLink: (id, link) =>
        set((state) => ({
          sharedLinks: state.sharedLinks.map((item) =>
            item.id === id ? { ...item, link, updatedAt: new Date() } : item
          ),
        })),
      removeSharedLink: (id) =>
        set((state) => ({
          sharedLinks: state.sharedLinks.filter((item) => item.id !== id),
        })),
      getSharedLink: (historyId) => {
        return get().sharedLinks.find((item) => item.historyId === historyId);
      },
    }),
    {
      name: 'shared-links-storage',
    }
  )
);

interface VoiceSettings {
  voice: string;  // Voice identifier
  pitch: number;  // 0 to 2
  rate: number;   // 0.1 to 10
  volume: number; // 0 to 1
}

interface VoiceStore {
  settings: VoiceSettings;
  availableVoices: SpeechSynthesisVoice[];
  setVoice: (voiceURI: string) => void;
  setPitch: (pitch: number) => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  initVoices: () => void;
}

export const useVoiceStore = create<VoiceStore>()(
  persist(
    (set) => ({
      settings: {
        voice: '',
        pitch: 1,
        rate: 1,
        volume: 1
      },
      availableVoices: [],
      setVoice: (voiceURI) => set((state) => ({
        settings: { ...state.settings, voice: voiceURI }
      })),
      setPitch: (pitch) => set((state) => ({
        settings: { ...state.settings, pitch }
      })),
      setRate: (rate) => set((state) => ({
        settings: { ...state.settings, rate }
      })),
      setVolume: (volume) => set((state) => ({
        settings: { ...state.settings, volume }
      })),
      initVoices: () => {
        const voices = window.speechSynthesis.getVoices();
        set({ availableVoices: voices });
      }
    }),
    {
      name: 'voice-settings-storage'
    }
  )
);

interface WebSearchState {
  isWebSearch: boolean;
  setIsWebSearch: (enabled: boolean) => void;
}

interface CombinedModeState {
  isCombinedMode: boolean;
  setIsCombinedMode: (enabled: boolean) => void;
}

interface CompareModeState {
  isCompareMode: boolean;
  setIsCompareMode: (enabled: boolean) => void;
}

export const useWebSearchStore = create<WebSearchState>((set) => ({
  isWebSearch: false,
  setIsWebSearch: (enabled) => set({ isWebSearch: enabled }),
}));

export const useCombinedModeStore = create<CombinedModeState>((set) => ({
  isCombinedMode: false,
  setIsCombinedMode: (enabled) => set({ isCombinedMode: enabled }),
}));

export const useCompareModeStore = create<CompareModeState>((set) => ({
  isCompareMode: false,
  setIsCompareMode: (enabled) => set({ isCompareMode: enabled }),
}));

interface CodeThemeStore {
  theme: keyof typeof AVAILABLE_THEMES;
  setTheme: (theme: keyof typeof AVAILABLE_THEMES) => void;
}

export const useCodeThemeStore = create<CodeThemeStore>()(
  persist(
    (set) => ({
      theme: 'System Default',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'code-theme-storage',
    }
  )
);

interface SettingsState {
  personalization: {
    summary: boolean;
    personalizedAds: boolean;
  };
  setPersonalizationSetting: (key: keyof SettingsState['personalization'], value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      personalization: {
        summary: false,
        personalizedAds: false,
      },
      setPersonalizationSetting: (key, value) =>
        set((state) => ({
          personalization: {
            ...state.personalization,
            [key]: value,
          },
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);

interface TextSizeStore {
  size: number;
  setSize: (size: number) => void;
}

export const useTextSizeStore = create<TextSizeStore>()(
  persist(
    (set) => ({
      size: 16, // default size
      setSize: (size) => set({ size }),
    }),
    {
      name: 'text-size-storage',
    }
  )
);

const generateId = () => {
  return 'key_' + Math.random().toString(36).substring(2, 15);
};

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
};

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  workspace: string;
  createdBy: string | undefined;
  email: string | undefined;
  createdAt: string;
  lastUsed: string;
  cost?: string;
  isVisible?: boolean;
  isDisabled?: boolean;
}

interface ApiKeyStore {
  keys: ApiKey[];
  addKey: (key: ApiKey) => void;
  removeKey: (id: string) => void;
  clearKeys: () => void;
  toggleKeyVisibility: (id: string) => void;
  toggleKeyStatus: (id: string, isDisabled: boolean) => void;
  updateKeyName: (id: string, newName: string) => void;
}

export const useApiKeyStore = create<ApiKeyStore>((set) => ({
  keys: [],
  addKey: (key) => set((state) => ({ keys: [...state.keys, key] })),
  removeKey: (id) => set((state) => ({
    keys: state.keys.filter(key => key.id !== id)
  })),
  clearKeys: () => set({ keys: [] }),
  toggleKeyVisibility: (id) => set((state) => ({
    keys: state.keys.map(key =>
      key.id === id ? { ...key, isVisible: !key.isVisible } : key
    )
  })),
  toggleKeyStatus: (id: string, isDisabled: boolean) => set((state) => ({
    keys: state.keys.map(key =>
      key.id === id ? { ...key, isDisabled } : key
    )
  })),
  updateKeyName: (id: string, newName: string) => set((state) => ({
    keys: state.keys.map(key =>
      key.id === id ? { ...key, name: newName } : key
    )
  })),
}));

export interface PaymentMethod {
  id: string;
  c_id: string;
  type: 'card' | 'link';
  lastFour?: string;
  expiryDate?: string;
  cardBrand?: 'visa' | 'mastercard' | 'amex' | 'other';
  bankName?: string;
  isDefault: boolean;
}

interface PaymentStore {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  getDefaultPaymentMethod: () => PaymentMethod | undefined;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
}

export const usePaymentStore = create<PaymentStore>()(
  (set, get) => ({
    paymentMethods: [],
    addPaymentMethod: (method) => set((state) => ({
      paymentMethods: [
        ...state.paymentMethods.map(m => ({ ...m, isDefault: false })),
        { ...method, id: `pm_${Date.now()}`, isDefault: method.isDefault }
      ]
    })),
    removePaymentMethod: (id) => set((state) => ({
      paymentMethods: state.paymentMethods.filter(m => m.id !== id)
    })),
    setDefaultPaymentMethod: (id) => set((state) => ({
      paymentMethods: state.paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    })),
    getDefaultPaymentMethod: () => {
      return get().paymentMethods.find(m => m.isDefault);
    },
    setPaymentMethods: (methods) => set({ paymentMethods: methods })
  }),
);

interface CreditsStore {
  balance: number;
  balance_fetched: boolean;
  fetching: boolean;
  setBalance: (balance: number) => void;
  updateBalance: (amount: number) => void; // For incrementing/decrementing
  setBalanceFetched: (fetched: boolean) => void;
  setFetching: (fetching: boolean) => void;
}

export const useCreditsStore = create<CreditsStore>()(

  (set) => ({
    balance: 0,
    balance_fetched: false,
    fetching: false,
    setBalance: (balance) => set({ balance, balance_fetched: true }),
    updateBalance: (amount) => set((state) => ({
      balance: state.balance + amount
    })),
    setBalanceFetched: (fetched) => set({ balance_fetched: fetched }),
    setFetching: (fetching) => set({ fetching }),
  }),
);

interface AutoReloadSettings {
  enabled: boolean;
  threshold: number;
  amount: number;
  payment_method_id: string;
}

interface AutoReloadStore {
  settings: AutoReloadSettings | null;
  setSettings: (settings: AutoReloadSettings | null) => void;
}

export const useAutoReloadStore = create<AutoReloadStore>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
}));

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  plan: string | null;

  setAuth: (user: User, token?: string, plan?: string | null) => void;
  clearAuth: () => void;
  setLoading: (status: boolean) => void;
  setPlan: (plan: string | null) => void;
  refreshPlan: () => Promise<{
    user: User | null,
    plan: string | null,
    aboutus: boolean
  } | null>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      plan: null,

      setAuth: (user: User, token: string, plan: string | null = null) => {
        if (!user || !token) return;
        set({
          user,
          token,
          isAuthenticated: true,
          plan,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          plan: null,
        });
      },

      setLoading: (status) => {
        set({ isLoading: status });
      },

      setPlan: (plan) => {
        set({ plan });
      },

      refreshPlan: async () => {
        try {
          const token = get().token;
          if (!token) {
            // If no token, ensure isAuthenticated is false
            set({ isAuthenticated: false, plan: null });
            return { plan: null, aboutus: false };
          }

          const response = await authApi.getUser();
          // Persist latest user and plan if provided

          if (response?.data?.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
            });
          }
          if (response) {
            set({
              plan: response.plan,
              isAuthenticated: true,
            });
            // console.log(response.plan, 'this is the plan from the store');
          }
          // console.log(response, 'this is the response from the store');
          return {
            user: response?.data?.user,
            plan: (typeof response?.plan === 'string') ? response.plan : null,
            aboutus: response?.aboutus
          };
        } catch (error: any) {
          // toast.error(error.response.data.error || error.response.data.message || 'Failed to load your data');
          set({
            isAuthenticated: false,
            plan: null
          });
          return { plan: null, aboutus: false };
        }
      },

    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // plan: state.plan,
      }),
    }
  )
);

interface PlanStore {
  selectedPlan: 'free' | 'standard' | 'plus' | 'custom' | 'pro';
  billingCycle: 'monthly' | 'yearly';
  isProcessing: boolean;
  setSelectedPlan: (plan: 'free' | 'standard' | 'plus' | 'custom' | 'pro') => void;
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  setIsProcessing: (status: boolean) => void;
}

export const usePlanStore = create<PlanStore>((set) => ({
  selectedPlan: 'free',
  billingCycle: 'monthly',
  isProcessing: false,
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setBillingCycle: (cycle) => set({ billingCycle: cycle }),
  setIsProcessing: (status) => set({ isProcessing: status }),
}));

export interface Project {
  id: string;
  uuid: string;
  name: string;
  description: string;
  files: ProjectFile[];
  instructions: string;
  createdAt: Date;
  histories: HistoryItem[];
  color?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  status: 'accessible' | 'not-accessible';
  type: string;
  // content: string;
  size: number;
  mimeType: string;
  url?: string;
  createdAt: Date;
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  addProject: (name: string, description: string, customProject?: Partial<Project>) => Project;
  updateProject: (uuid: string, data: Partial<Project>) => void;
  setCurrentProject: (project: Project | null) => void;
  addProjectHistory: (projectId: string, history: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
  removeProjectHistory: (projectId: string, historyId: string) => void;
  addProjectFile: (projectId: string, file: File) => Promise<void>;
  removeProjectFile: (projectId: string, fileId: string) => void;
  removeProject: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  setLoading: (status: boolean) => void;
  setError: (error: string | null) => void;
  setProjects: (projects: Project[]) => void;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  clearProjects: () => set({ projects: [], currentProject: null }),
  addProject: (name: string, description: string, customProject?: Partial<Project>) => {
    const newProject = {
      id: generateId(),
      uuid: generateId(),
      name,
      description,
      files: [],
      histories: [],
      instructions: "",
      createdAt: new Date(),
      ...customProject // Override with custom properties if provided
    };

    set((state) => ({
      projects: [newProject, ...state.projects],
      currentProject: newProject,
    }));

    return newProject;
  },

  updateProject: (uuid, data) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.uuid === uuid ? { ...p, ...data } : p
      ),
      currentProject: state.currentProject?.uuid === uuid
        ? { ...state.currentProject, ...data }
        : state.currentProject,
    }));
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  addProjectHistory: (projectUuid, history) => {
    const newHistory = {
      ...history,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message: history.message || ''
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.uuid === projectUuid
          ? { ...p, histories: [newHistory, ...p.histories] }
          : p
      ),
      currentProject: state.currentProject?.uuid === projectUuid
        ? { ...state.currentProject, histories: [newHistory, ...state.currentProject.histories] }
        : state.currentProject,
    }));
  },

  removeProjectHistory: (projectUuid, historyId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.uuid === projectUuid
          ? { ...p, histories: p.histories.filter((h) => h.id !== historyId) }
          : p
      ),
      currentProject: state.currentProject?.uuid === projectUuid
        ? { ...state.currentProject, histories: state.currentProject.histories.filter((h) => h.id !== historyId) }
        : state.currentProject,
    }));
  },

  addProjectFile: async (projectUuid, file) => {
    try {
      // Get the current project and find highest file index to increment
      const currentProject = get().projects.find(p => p.uuid === projectUuid);
      let nextIndex = 1; // Default start with 1

      if (currentProject && currentProject.files.length > 0) {
        // Find the highest existing index and add 1
        const highestIndex = Math.max(...currentProject.files
          .map(f => typeof f.id === 'string' ? parseInt(f.id, 10) : 0)
          .filter(id => !isNaN(id)));

        nextIndex = isFinite(highestIndex) ? highestIndex + 1 : 1;
      }

      // Create new file with index as ID
      const newFile: ProjectFile = {
        id: nextIndex.toString(),
        name: file.name,
        status: 'accessible',
        type: 'file',
        size: file.size,
        mimeType: file.type,
        createdAt: new Date(),
      };
      // console.log(newFile, 'This is the new file')

      set((state) => ({
        projects: state.projects.map((p) =>
          p.uuid === projectUuid
            ? { ...p, files: [newFile, ...p.files] }
            : p
        ),
        currentProject: state.currentProject?.uuid === projectUuid
          ? { ...state.currentProject, files: [newFile, ...state.currentProject.files] }
          : state.currentProject,
      }));

      return newFile;
    } catch (error) {
      throw new Error('Failed to process file: ' + (error as Error).message);
    }
  },

  removeProjectFile: (projectUuid, fileId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.uuid === projectUuid
          ? { ...p, files: p.files.filter((f) => f.id !== fileId) }
          : p
      ),
      currentProject: state.currentProject?.uuid === projectUuid
        ? { ...state.currentProject, files: state.currentProject.files.filter((f) => f.id !== fileId) }
        : state.currentProject,
    }));
  },

  removeProject: (uuid) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.uuid !== uuid),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },

  setProjects: (projects) => {
    // If projects have files, ensure the file IDs are set to their index
    const processedProjects = projects.map(project => {
      if (project.files && Array.isArray(project.files)) {
        // Map files to use index as id
        const processedFiles = project.files.map(file => {
          return {
            ...file,
            id: file.id || (file.index ? file.index.toString() : crypto.randomUUID())
          };
        });
        return { ...project, files: processedFiles };
      }
      return project;
    });

    set({ projects: processedProjects });
  },

  setLoading: (status) => set({ isLoading: status }),

  setError: (error) => set({ error }),
}));

interface StreamingTitlesStore {
  streamingTitles: Record<string, boolean>;
  startStreamingTitle: (id: string) => void;
  stopStreamingTitle: (id: string) => void;
}

export const useStreamingTitlesStore = create<StreamingTitlesStore>((set) => ({
  streamingTitles: {},
  startStreamingTitle: (id) => set((state) => ({
    streamingTitles: { ...state.streamingTitles, [id]: true }
  })),
  stopStreamingTitle: (id) => set((state) => {
    const newStreamingTitles = { ...state.streamingTitles };
    delete newStreamingTitles[id];
    return { streamingTitles: newStreamingTitles };
  })
}));


export interface VideoGenerationTask {
  id: string;
  conversationId: string;
  modelId: string;
  modelName: string;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
  progress: number; // 0-100
  jobId: string;
  responseId: string;
  videoUrl?: string;
  startTime: number;
  estimatedTimeRemaining?: number;
  errorMessage?: string;
}

interface VideoGenerationStore {
  tasks: VideoGenerationTask[];
  addTask: (task: Omit<VideoGenerationTask, 'progress' | 'startTime' | 'status'>) => void;
  updateTaskProgress: (id: string, progress: number, timeRemaining?: number) => void;
  updateTaskStatus: (id: string, status: 'generating' | 'completed' | 'failed', videoUrl?: string, errorMessage?: string) => void;
  removeTask: (id: string) => void;
  clearCompletedTasks: () => void;
  hasActiveTasks: () => boolean;
}

export { useModelsStore };

// Video Generation Tracker Store
interface VideoGenerationJob {
  modelId: string;
  responseId: string;
  status: 'generating' | 'completed' | 'failed';
  modelName: string;
  startedAt: number;
  videoUrl?: string;
  error?: string;
}

// stores/videoGenerationStore.ts
interface GeneratingVideo {
  id: string;
  modelId: string;
  modelName: string;
  modelImage: string;
  progress: number;
  status: 'generating' | 'completed' | 'failed';
  conversationId: string;
  responseId: string;
  prompt: string;
  error?: string;
}

interface VideoGenerationStore {
  generatingVideos: Record<string, GeneratingVideo>;
  addGeneratingVideo: (video: GeneratingVideo) => void;
  updateVideoStatus: (id: string, updates: Partial<GeneratingVideo>) => void;
  removeGeneratingVideo: (id: string) => void;
  isPolling: boolean;
  setPolling: (status: boolean) => void;
}

export const useVideoGenerationStore = create<VideoGenerationStore>()(
  persist(
    (set, get) => ({
      generatingVideos: {},
      isPolling: false,
      addGeneratingVideo: (video) => {
        set((state) => ({
          generatingVideos: {
            ...state.generatingVideos,
            [video.id]: video,
          },
        }));
      },
      updateVideoStatus: (id, updates) => {
        set((state) => ({
          generatingVideos: {
            ...state.generatingVideos,
            [id]: {
              ...state.generatingVideos[id],
              ...updates,
            },
          },
        }));
      },
      removeGeneratingVideo: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.generatingVideos;
          return { generatingVideos: rest };
        });
      },
      setPolling: (status) => set({ isPolling: status }),
    }),
    {
      name: 'video-generation-store',
    }
  )
);

// In stores/index.ts, around line 1095
interface UsageRestriction {
  message: string | null;
  comebackTime: string | null; // Keep this for chat, image, audio, video
  isRestricted: boolean;
}

interface UsageRestrictionsState {
  restrictions: {
    chat: UsageRestriction;
    image: UsageRestriction;
    audio: UsageRestriction;
    video: UsageRestriction;
    combine: UsageRestriction; // New restriction
    compare: UsageRestriction; // New restriction
  };
  setRestriction: (type: keyof UsageRestrictionsState['restrictions'], message: string, comebackTime?: string | null) => void;
  clearRestriction: (type: keyof UsageRestrictionsState['restrictions']) => void;
  isRestricted: (type: keyof UsageRestrictionsState['restrictions']) => boolean;
}

export const useUsageRestrictionsStore = create<UsageRestrictionsState>()(
  persist(
    (set, get) => ({
      restrictions: {
        chat: { message: null, comebackTime: null, isRestricted: false },
        image: { message: null, comebackTime: null, isRestricted: false },
        audio: { message: null, comebackTime: null, isRestricted: false },
        video: { message: null, comebackTime: null, isRestricted: false },
        combine: { message: null, comebackTime: null, isRestricted: false }, // New restriction
        compare: { message: null, comebackTime: null, isRestricted: false }, // New restriction
      },
      setRestriction: (type, message, comebackTime = null) =>
        set((state) => ({
          restrictions: {
            ...state.restrictions,
            [type]: {
              message,
              comebackTime,
              isRestricted: true
            }
          }
        })),
      clearRestriction: (type) =>
        set((state) => ({
          restrictions: {
            ...state.restrictions,
            [type]: {
              message: null,
              comebackTime: null,
              isRestricted: false
            }
          }
        })),
      isRestricted: (type) => {
        const restriction = get().restrictions[type];
        if (!restriction.isRestricted) {
          return false;
        }

        // For types with comeback time, check if time has passed
        if (restriction.comebackTime) {
          const now = new Date().getTime();
          const comebackTime = new Date(restriction.comebackTime).getTime();

          if (now >= comebackTime) {
            // Auto-clear restriction if time has passed
            get().clearRestriction(type);
            return false;
          }
        }

        return true;
      }
    }),
    {
      name: 'usage-restrictions-storage',
    }
  )
);

interface TutorialStore {
  isCompleted: boolean;
  setCompleted: (value: boolean) => void;
}

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set) => ({
      isCompleted: false,
      setCompleted: (value) => set({ isCompleted: value }),
    }),
    {
      name: 'tutorial-storage',
    }
  )
);

interface OrgSessionStore {
  deviceSessionId: string | null;
  setDeviceSessionId: (id: string | null) => void;
  sessionUser: { name: string; class_group: string } | null;
  setSessionUser: (user: { name: string; class_group: string } | null) => void;
  orgId: string | null;
  setOrgId: (id: string | null) => void;
  clearSession: () => void;
}

export const useOrgSessionStore = create<OrgSessionStore>()(
  persist(
    (set) => ({
      deviceSessionId: null,
      sessionUser: null,
      orgId: "1",
      setDeviceSessionId: (id) => set({ deviceSessionId: id }),
      setSessionUser: (user) => set({ sessionUser: user }),
      setOrgId: (id) => set({ orgId: id }),
      clearSession: () => set({ deviceSessionId: null, sessionUser: null, orgId: null }),
    }),
    {
      name: 'org-session-storage',
    }
  )
);