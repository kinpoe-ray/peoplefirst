import { create } from 'zustand';
import { Story, StoryFormData } from '../types/pathfinder';
import * as storiesApi from '../api/stories';
import { createLogger } from '../lib/logger';

const logger = createLogger('StoryStore');

interface PaginationState {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

interface StoryState {
  stories: Story[];
  currentStory: Story | null;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStories: (page?: number) => Promise<void>;
  fetchStoryById: (id: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  createStory: (data: StoryFormData) => Promise<Story>;
  updateStory: (id: string, data: Partial<StoryFormData>) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],
  currentStory: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    pageSize: 12,
  },
  isLoading: false,
  error: null,

  fetchStories: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const response = await storiesApi.getStories(page, 12);
      set({
        stories: response.data,
        pagination: {
          currentPage: response.page,
          totalPages: response.totalPages,
          total: response.total,
          pageSize: response.pageSize,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stories';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchStoryById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await storiesApi.getStoryById(id);
      set({ currentStory: data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch story';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setCurrentPage: (page) => {
    get().fetchStories(page);
  },

  createStory: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const story = await storiesApi.createStory(data);
      set({
        stories: [story, ...get().stories],
        isLoading: false
      });
      return story;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateStory: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const updated = await storiesApi.updateStory(id, data);
      set({
        stories: get().stories.map(s => s.id === id ? updated : s),
        currentStory: get().currentStory?.id === id ? updated : get().currentStory,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteStory: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await storiesApi.deleteStory(id);
      set({
        stories: get().stories.filter(s => s.id !== id),
        currentStory: get().currentStory?.id === id ? null : get().currentStory,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete story';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  toggleLike: async (id) => {
    const story = get().currentStory;
    if (!story || story.id !== id) return;

    // Optimistic update
    const previousCount = story.like_count;
    const optimisticCount = previousCount + 1;

    set({
      currentStory: {
        ...story,
        like_count: optimisticCount,
      },
    });

    try {
      await storiesApi.toggleLike(id);
      // Fetch updated story to get accurate count
      await get().fetchStoryById(id);
    } catch (error) {
      // Rollback on error
      logger.error('Failed to toggle like', error);
      set({
        currentStory: {
          ...story,
          like_count: previousCount,
        },
      });
    }
  },

  toggleFavorite: async (id) => {
    const story = get().currentStory;
    if (!story || story.id !== id) return;

    // Optimistic update - we don't know if it's add or remove, so fetch after
    try {
      await storiesApi.toggleFavorite(id);
      // Fetch updated story to get accurate count
      await get().fetchStoryById(id);
    } catch (error) {
      logger.error('Failed to toggle favorite', error);
      // Refetch to ensure consistency
      await get().fetchStoryById(id);
    }
  },
}));
