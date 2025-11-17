import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Story, StoryFormData } from '../types/pathfinder';
import * as storiesApi from '../api/stories';
import { PaginatedResponse } from '../api/stories';
import { createLogger } from '../lib/logger';

const logger = createLogger('useStories');

// Query keys factory for consistent key management
export const storyKeys = {
  all: ['stories'] as const,
  lists: () => [...storyKeys.all, 'list'] as const,
  list: (filters: { page?: number; pageSize?: number; searchQuery?: string }) =>
    [...storyKeys.lists(), filters] as const,
  details: () => [...storyKeys.all, 'detail'] as const,
  detail: (id: string) => [...storyKeys.details(), id] as const,
};

// Hook for fetching paginated stories with search support
export function useStories(page: number = 1, pageSize: number = 12, searchQuery?: string) {
  return useQuery<PaginatedResponse<Story>, Error>({
    queryKey: storyKeys.list({ page, pageSize, searchQuery }),
    queryFn: async () => {
      logger.debug('Fetching stories', { page, pageSize, searchQuery });
      const result = await storiesApi.getStories(page, pageSize, searchQuery);
      logger.info('Stories fetched successfully', {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      });
      return result;
    },
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  });
}

// Hook for fetching a single story by ID
export function useStory(id: string) {
  return useQuery<Story, Error>({
    queryKey: storyKeys.detail(id),
    queryFn: async () => {
      logger.debug('Fetching story by ID', { id });
      const result = await storiesApi.getStoryById(id);
      logger.info('Story fetched successfully', { id, title: result.title });
      return result;
    },
    enabled: !!id,
    // Single story items can be stale for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating a story
export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyData: StoryFormData) => {
      logger.debug('Creating story', { title: storyData.title });
      return await storiesApi.createStory(storyData);
    },
    onSuccess: (newStory) => {
      logger.info('Story created successfully', {
        id: newStory.id,
        title: newStory.title
      });
      // Invalidate stories list to include the new story
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
    },
    onError: (error) => {
      logger.error('Failed to create story', error);
    },
  });
}

// Hook for updating a story
export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<StoryFormData>;
    }) => {
      logger.debug('Updating story', { id });
      return await storiesApi.updateStory(id, data);
    },
    onSuccess: (updatedStory) => {
      logger.info('Story updated successfully', {
        id: updatedStory.id,
        title: updatedStory.title
      });
      // Update specific story in cache
      queryClient.setQueryData(storyKeys.detail(updatedStory.id), updatedStory);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
    },
    onError: (error, { id }) => {
      logger.error('Failed to update story', { id, error });
    },
  });
}

// Hook for deleting a story
export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.debug('Deleting story', { id });
      await storiesApi.deleteStory(id);
      return id;
    },
    onSuccess: (id) => {
      logger.info('Story deleted successfully', { id });
      // Remove from cache
      queryClient.removeQueries({ queryKey: storyKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
    },
    onError: (error, id) => {
      logger.error('Failed to delete story', { id, error });
    },
  });
}

// Hook for toggling like
export function useToggleStoryLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      logger.debug('Toggling story like', { storyId });
      await storiesApi.toggleLike(storyId);
    },
    onMutate: async (storyId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: storyKeys.detail(storyId) });
      const previousStory = queryClient.getQueryData<Story>(
        storyKeys.detail(storyId)
      );

      if (previousStory) {
        queryClient.setQueryData<Story>(storyKeys.detail(storyId), {
          ...previousStory,
          like_count: previousStory.like_count + 1,
        });
      }

      return { previousStory };
    },
    onError: (error, storyId, context) => {
      logger.error('Failed to toggle story like', { storyId, error });
      // Rollback on error
      if (context?.previousStory) {
        queryClient.setQueryData(
          storyKeys.detail(storyId),
          context.previousStory
        );
      }
    },
    onSettled: (_, __, storyId) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: storyKeys.detail(storyId) });
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
    },
  });
}

// Hook for toggling favorite
export function useToggleStoryFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      logger.debug('Toggling story favorite', { storyId });
      await storiesApi.toggleFavorite(storyId);
    },
    onSuccess: (_, storyId) => {
      logger.info('Story favorite toggled', { storyId });
      // Invalidate to refetch with updated counts
      queryClient.invalidateQueries({ queryKey: storyKeys.detail(storyId) });
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
    },
    onError: (error, storyId) => {
      logger.error('Failed to toggle story favorite', { storyId, error });
    },
  });
}

// Hook for fetching comments
export function useStoryComments(storyId: string) {
  return useQuery({
    queryKey: [...storyKeys.detail(storyId), 'comments'],
    queryFn: async () => {
      logger.debug('Fetching story comments', { storyId });
      return await storiesApi.getComments(storyId);
    },
    enabled: !!storyId,
  });
}

// Hook for adding a comment
export function useAddStoryComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storyId,
      content,
      parentId,
    }: {
      storyId: string;
      content: string;
      parentId?: string;
    }) => {
      logger.debug('Adding story comment', { storyId, parentId });
      return await storiesApi.addComment(storyId, content, parentId);
    },
    onSuccess: (_, { storyId }) => {
      logger.info('Story comment added', { storyId });
      // Invalidate comments and story to update comment count
      queryClient.invalidateQueries({
        queryKey: [...storyKeys.detail(storyId), 'comments']
      });
      queryClient.invalidateQueries({ queryKey: storyKeys.detail(storyId) });
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
    },
    onError: (error, { storyId }) => {
      logger.error('Failed to add story comment', { storyId, error });
    },
  });
}
