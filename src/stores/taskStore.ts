import { create } from 'zustand';
import { Task, UserTaskAttempt, TaskDifficulty, TaskSubmissionContent } from '../types/pathfinder';
import * as tasksApi from '../api/tasks';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  currentAttempt: UserTaskAttempt | null;
  userAttempts: UserTaskAttempt[];
  selectedDifficulty: TaskDifficulty | 'all';
  searchQuery: string;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: (difficulty?: TaskDifficulty, page?: number, searchQuery?: string) => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  startTask: (taskId: string) => Promise<void>;
  updateAttemptStep: (attemptId: string, step: number, submission?: TaskSubmissionContent) => Promise<void>;
  completeTask: (attemptId: string, rating: number) => Promise<void>;
  fetchUserAttempts: () => Promise<void>;
  setSelectedDifficulty: (difficulty: TaskDifficulty | 'all') => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  currentAttempt: null,
  userAttempts: [],
  selectedDifficulty: 'all',
  searchQuery: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    pageSize: 12,
  },
  isLoading: false,
  error: null,

  fetchTasks: async (difficulty, page = 1, searchQuery) => {
    try {
      set({ isLoading: true, error: null });
      const query = searchQuery !== undefined ? searchQuery : get().searchQuery;
      const response = await tasksApi.getTasks(difficulty, page, 12, query);
      set({
        tasks: response.data,
        pagination: {
          currentPage: response.page,
          totalPages: response.totalPages,
          total: response.total,
          pageSize: response.pageSize,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchTaskById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await tasksApi.getTaskById(id);
      set({ currentTask: data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task';
      set({ error: errorMessage, isLoading: false });
    }
  },

  startTask: async (taskId) => {
    try {
      set({ isLoading: true, error: null });
      const attempt = await tasksApi.startTask(taskId);
      set({ currentAttempt: attempt, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start task';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateAttemptStep: async (attemptId, step, submission) => {
    try {
      const updated = await tasksApi.updateAttemptStep(attemptId, step, submission);
      set({ currentAttempt: updated });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update step';
      set({ error: errorMessage });
      throw error;
    }
  },

  completeTask: async (attemptId, rating) => {
    try {
      set({ isLoading: true, error: null });
      const completed = await tasksApi.completeTask(attemptId, rating);
      set({
        currentAttempt: completed,
        isLoading: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete task';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchUserAttempts: async () => {
    try {
      set({ isLoading: true, error: null });
      const attempts = await tasksApi.getUserAttempts();
      set({ userAttempts: attempts, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch attempts';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setSelectedDifficulty: (difficulty) => {
    set({ selectedDifficulty: difficulty, pagination: { ...get().pagination, currentPage: 1 } });
    get().fetchTasks(difficulty === 'all' ? undefined : difficulty, 1);
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, pagination: { ...get().pagination, currentPage: 1 } });
    const { selectedDifficulty } = get();
    get().fetchTasks(selectedDifficulty === 'all' ? undefined : selectedDifficulty, 1, query);
  },

  setCurrentPage: (page) => {
    const { selectedDifficulty, searchQuery } = get();
    get().fetchTasks(selectedDifficulty === 'all' ? undefined : selectedDifficulty, page, searchQuery);
  },
}));
