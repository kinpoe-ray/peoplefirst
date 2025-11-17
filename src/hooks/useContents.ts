import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Content, CareerCategory } from '../types/pathfinder';
import * as contentsApi from '../api/contents';
import { PaginatedResponse } from '../api/contents';
import { createLogger } from '../lib/logger';

const logger = createLogger('useContents');

// Query keys factory for consistent key management
export const contentKeys = {
  all: ['contents'] as const,
  lists: () => [...contentKeys.all, 'list'] as const,
  list: (filters: { category?: CareerCategory; page?: number; pageSize?: number; searchQuery?: string }) =>
    [...contentKeys.lists(), filters] as const,
  details: () => [...contentKeys.all, 'detail'] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
};

// Hook for fetching paginated contents with search support
export function useContents(
  category?: CareerCategory,
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string
) {
  return useQuery<PaginatedResponse<Content>, Error>({
    queryKey: contentKeys.list({ category, page, pageSize, searchQuery }),
    queryFn: async () => {
      logger.debug('Fetching contents', { category, page, pageSize, searchQuery });
      const result = await contentsApi.getContents(category, page, pageSize, searchQuery);
      logger.info('Contents fetched successfully', {
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

// Hook for fetching a single content by ID
export function useContent(id: string) {
  return useQuery<Content, Error>({
    queryKey: contentKeys.detail(id),
    queryFn: async () => {
      logger.debug('Fetching content by ID', { id });
      const result = await contentsApi.getContentById(id);
      logger.info('Content fetched successfully', { id, title: result.title });
      return result;
    },
    enabled: !!id,
    // Single content items can be stale for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for incrementing view count
export function useIncrementViewCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      logger.debug('Incrementing view count', { id });
      await contentsApi.incrementViewCount(id);
    },
    onSuccess: (_, id) => {
      logger.info('View count incremented', { id });
      // Invalidate specific content to refetch with updated count
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(id) });
    },
    onError: (error, id) => {
      logger.error('Failed to increment view count', { id, error });
    },
  });
}

// Hook for toggling favorite
export function useToggleContentFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      logger.debug('Toggling content favorite', { contentId });
      await contentsApi.toggleFavorite(contentId);
    },
    onSuccess: (_, contentId) => {
      logger.info('Content favorite toggled', { contentId });
      // Invalidate specific content and lists to refetch with updated counts
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(contentId) });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    onError: (error, contentId) => {
      logger.error('Failed to toggle content favorite', { contentId, error });
    },
  });
}

// Hook for fetching comments
export function useContentComments(contentId: string) {
  return useQuery({
    queryKey: [...contentKeys.detail(contentId), 'comments'],
    queryFn: async () => {
      logger.debug('Fetching content comments', { contentId });
      return await contentsApi.getComments(contentId);
    },
    enabled: !!contentId,
  });
}

// Hook for adding a comment
export function useAddContentComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      content,
      parentId,
    }: {
      contentId: string;
      content: string;
      parentId?: string;
    }) => {
      logger.debug('Adding content comment', { contentId, parentId });
      return await contentsApi.addComment(contentId, content, parentId);
    },
    onSuccess: (_, { contentId }) => {
      logger.info('Content comment added', { contentId });
      // Invalidate comments and content to update comment count
      queryClient.invalidateQueries({
        queryKey: [...contentKeys.detail(contentId), 'comments']
      });
      queryClient.invalidateQueries({ queryKey: contentKeys.detail(contentId) });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    onError: (error, { contentId }) => {
      logger.error('Failed to add content comment', { contentId, error });
    },
  });
}
