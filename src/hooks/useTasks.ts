import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskDifficulty, UserTaskAttempt, TaskSubmissionContent } from '../types/pathfinder';
import * as tasksApi from '../api/tasks';
import { PaginatedResponse } from '../api/tasks';
import { createLogger } from '../lib/logger';

const logger = createLogger('useTasks');

// Query keys factory for consistent key management
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: { difficulty?: TaskDifficulty; page?: number; pageSize?: number; searchQuery?: string }) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  attempts: () => [...taskKeys.all, 'attempts'] as const,
  userAttempts: () => [...taskKeys.attempts(), 'user'] as const,
};

// Hook for fetching paginated tasks with search support
export function useTasks(
  difficulty?: TaskDifficulty,
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string
) {
  return useQuery<PaginatedResponse<Task>, Error>({
    queryKey: taskKeys.list({ difficulty, page, pageSize, searchQuery }),
    queryFn: async () => {
      logger.debug('Fetching tasks', { difficulty, page, pageSize, searchQuery });
      const result = await tasksApi.getTasks(difficulty, page, pageSize, searchQuery);
      logger.info('Tasks fetched successfully', {
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

// Hook for fetching a single task by ID
export function useTask(id: string) {
  return useQuery<Task, Error>({
    queryKey: taskKeys.detail(id),
    queryFn: async () => {
      logger.debug('Fetching task by ID', { id });
      const result = await tasksApi.getTaskById(id);
      logger.info('Task fetched successfully', { id, title: result.title });
      return result;
    },
    enabled: !!id,
    // Single task items can be stale for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching user's task attempts
export function useUserAttempts() {
  return useQuery<UserTaskAttempt[], Error>({
    queryKey: taskKeys.userAttempts(),
    queryFn: async () => {
      logger.debug('Fetching user task attempts');
      const result = await tasksApi.getUserAttempts();
      logger.info('User attempts fetched successfully', { count: result.length });
      return result;
    },
    // User attempts might change frequently, shorter stale time
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for starting a task
export function useStartTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      logger.debug('Starting task', { taskId });
      return await tasksApi.startTask(taskId);
    },
    onSuccess: (attempt) => {
      logger.info('Task started successfully', {
        attemptId: attempt.id,
        taskId: attempt.task_id
      });
      // Invalidate user attempts to include the new attempt
      queryClient.invalidateQueries({ queryKey: taskKeys.userAttempts() });
      // Invalidate task list to update attempt count
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    onError: (error, taskId) => {
      logger.error('Failed to start task', { taskId, error });
    },
  });
}

// Hook for updating attempt step
export function useUpdateAttemptStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attemptId,
      step,
      submission,
    }: {
      attemptId: string;
      step: number;
      submission?: TaskSubmissionContent;
    }) => {
      logger.debug('Updating attempt step', { attemptId, step });
      return await tasksApi.updateAttemptStep(attemptId, step, submission);
    },
    onSuccess: (updatedAttempt) => {
      logger.info('Attempt step updated successfully', {
        attemptId: updatedAttempt.id,
        currentStep: updatedAttempt.current_step
      });
      // Invalidate user attempts to reflect changes
      queryClient.invalidateQueries({ queryKey: taskKeys.userAttempts() });
    },
    onError: (error, { attemptId }) => {
      logger.error('Failed to update attempt step', { attemptId, error });
    },
  });
}

// Hook for completing a task
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attemptId,
      rating,
    }: {
      attemptId: string;
      rating: number;
    }) => {
      logger.debug('Completing task', { attemptId, rating });
      return await tasksApi.completeTask(attemptId, rating);
    },
    onSuccess: (completedAttempt) => {
      logger.info('Task completed successfully', {
        attemptId: completedAttempt.id,
        rating: completedAttempt.rating
      });
      // Invalidate user attempts and task list to update stats
      queryClient.invalidateQueries({ queryKey: taskKeys.userAttempts() });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      // Invalidate specific task to update completion rate
      if (completedAttempt.task_id) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.detail(completedAttempt.task_id)
        });
      }
    },
    onError: (error, { attemptId }) => {
      logger.error('Failed to complete task', { attemptId, error });
    },
  });
}

// Hook for submitting task for AI feedback
export function useSubmitTaskForAIFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      attemptId,
      submission,
    }: {
      attemptId: string;
      submission: TaskSubmissionContent;
    }) => {
      logger.debug('Submitting task for AI feedback', { attemptId });
      return await tasksApi.submitTaskForAIFeedback(attemptId, submission);
    },
    onSuccess: (feedback, { attemptId }) => {
      logger.info('AI feedback received', { attemptId });
      // Invalidate user attempts to include the feedback
      queryClient.invalidateQueries({ queryKey: taskKeys.userAttempts() });
    },
    onError: (error, { attemptId }) => {
      logger.error('Failed to get AI feedback', { attemptId, error });
    },
  });
}

// Prefetch helper for task details (useful for hover previews)
export function usePrefetchTask() {
  const queryClient = useQueryClient();

  return (taskId: string) => {
    queryClient.prefetchQuery({
      queryKey: taskKeys.detail(taskId),
      queryFn: () => tasksApi.getTaskById(taskId),
      staleTime: 10 * 60 * 1000,
    });
  };
}
