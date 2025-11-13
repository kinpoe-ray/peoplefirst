import { create } from 'zustand';
import { Content, CareerCategory } from '../types/pathfinder';
import * as contentsApi from '../api/contents';

interface ContentState {
  contents: Content[];
  currentContent: Content | null;
  selectedCategory: CareerCategory;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchContents: (category?: CareerCategory) => Promise<void>;
  fetchContentById: (id: string) => Promise<void>;
  setSelectedCategory: (category: CareerCategory) => void;
  incrementViewCount: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  contents: [],
  currentContent: null,
  selectedCategory: '全部',
  isLoading: false,
  error: null,

  fetchContents: async (category) => {
    try {
      set({ isLoading: true, error: null });
      const data = await contentsApi.getContents(category);
      set({ contents: data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contents';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchContentById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await contentsApi.getContentById(id);
      set({ currentContent: data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch content';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().fetchContents(category === '全部' ? undefined : category);
  },

  incrementViewCount: async (id) => {
    try {
      await contentsApi.incrementViewCount(id);
      // 更新本地状态
      if (get().currentContent?.id === id) {
        set({
          currentContent: {
            ...get().currentContent!,
            view_count: get().currentContent!.view_count + 1,
          },
        });
      }
    } catch (error) {
      console.error('Failed to increment view count:', error instanceof Error ? error.message : error);
    }
  },

  toggleFavorite: async (id) => {
    const content = get().currentContent;
    if (!content || content.id !== id) return;

    // Optimistic update - we don't know if it's add or remove, so fetch after
    try {
      await contentsApi.toggleFavorite(id);
      // Fetch updated content to get accurate count
      await get().fetchContentById(id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error instanceof Error ? error.message : error);
      // Refetch to ensure consistency
      await get().fetchContentById(id);
    }
  },
}));
