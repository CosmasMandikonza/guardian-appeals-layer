import { create } from 'zustand';
import type { ContentItem, CaseItem, MetricsData } from '../types';

const API_BASE = 'https://guardian-appeals-layer.onrender.com/api';;

interface AppState {
  // Content
  content: ContentItem[];
  contentLoading: boolean;
  contentError: string | null;
  fetchContent: () => Promise<void>;
  
  // Cases
  cases: CaseItem[];
  casesLoading: boolean;
  casesError: string | null;
  fetchCases: () => Promise<void>;
  createCase: (contentId: string, creatorDid: string, statement: string) => Promise<CaseItem | null>;
  
  // Metrics
  metrics: MetricsData | null;
  metricsLoading: boolean;
  fetchMetrics: () => Promise<void>;
  
  // Active case detail
  activeCase: CaseItem | null;
  setActiveCase: (c: CaseItem | null) => void;
  
  // UI state
  isAppealModalOpen: boolean;
  appealingContent: ContentItem | null;
  openAppealModal: (content: ContentItem) => void;
  closeAppealModal: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Content state
  content: [],
  contentLoading: false,
  contentError: null,
  
  fetchContent: async () => {
    set({ contentLoading: true, contentError: null });
    try {
      const res = await fetch(`${API_BASE}/content`);
      const json = await res.json();
      if (json.success) {
        set({ content: json.data, contentLoading: false });
      } else {
        set({ contentError: json.error || 'Failed to fetch content', contentLoading: false });
      }
    } catch (err) {
      set({ contentError: 'Network error', contentLoading: false });
    }
  },
  
  // Cases state
  cases: [],
  casesLoading: false,
  casesError: null,
  
  fetchCases: async () => {
    set({ casesLoading: true, casesError: null });
    try {
      const res = await fetch(`${API_BASE}/cases`);
      const json = await res.json();
      if (json.success) {
        set({ cases: json.data, casesLoading: false });
      } else {
        set({ casesError: json.error || 'Failed to fetch cases', casesLoading: false });
      }
    } catch (err) {
      set({ casesError: 'Network error', casesLoading: false });
    }
  },
  
  createCase: async (contentId, creatorDid, statement) => {
    try {
      const res = await fetch(`${API_BASE}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          creatorDid,
          appealStatement: statement,
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh cases
        get().fetchCases();
        return json.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },
  
  // Metrics state
  metrics: null,
  metricsLoading: false,
  
  fetchMetrics: async () => {
    set({ metricsLoading: true });
    try {
      const res = await fetch(`${API_BASE}/metrics`);
      const json = await res.json();
      if (json.success) {
        set({ metrics: json.data, metricsLoading: false });
      } else {
        set({ metricsLoading: false });
      }
    } catch (err) {
      set({ metricsLoading: false });
    }
  },
  
  // Active case
  activeCase: null,
  setActiveCase: (c) => set({ activeCase: c }),
  
  // Modal state
  isAppealModalOpen: false,
  appealingContent: null,
  
  openAppealModal: (content) => set({ isAppealModalOpen: true, appealingContent: content }),
  closeAppealModal: () => set({ isAppealModalOpen: false, appealingContent: null }),
}));
