import { create } from 'zustand';
import { Content, CareerCategory } from '../types/pathfinder';
import * as contentsApi from '../api/contents';
import { createLogger } from '../lib/logger';

const logger = createLogger('ContentStore');

interface PaginationState {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

interface ContentState {
  contents: Content[];
  currentContent: Content | null;
  selectedCategory: CareerCategory;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchContents: (category?: CareerCategory, page?: number) => Promise<void>;
  fetchContentById: (id: string) => Promise<void>;
  setSelectedCategory: (category: CareerCategory) => void;
  setCurrentPage: (page: number) => void;
  incrementViewCount: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  contents: [],
  currentContent: null,
  selectedCategory: '全部',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    pageSize: 12,
  },
  isLoading: false,
  error: null,

  fetchContents: async (category, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contentsApi.getContents(category, page, 12);
      set({
        contents: response.data,
        pagination: {
          currentPage: response.page,
          totalPages: response.totalPages,
          total: response.total,
          pageSize: response.pageSize,
        },
        isLoading: false,
      });
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
    set({ selectedCategory: category, pagination: { ...get().pagination, currentPage: 1 } });
    get().fetchContents(category === '全部' ? undefined : category, 1);
  },

  setCurrentPage: (page) => {
    const { selectedCategory } = get();
    get().fetchContents(selectedCategory === '全部' ? undefined : selectedCategory, page);
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
      logger.error('Failed to increment view count', error);
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
      logger.error('Failed to toggle favorite', error);
      // Refetch to ensure consistency
      await get().fetchContentById(id);
    }
  },
}));
