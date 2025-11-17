import { supabase } from '../lib/supabase';
import { Task, UserTaskAttempt, TaskDifficulty, TaskSubmissionContent } from '../types/pathfinder';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getTasks(
  difficulty?: TaskDifficulty,
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string
): Promise<PaginatedResponse<Task>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // First get total count
  let countQuery = supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true });

  if (difficulty) {
    countQuery = countQuery.eq('difficulty', difficulty);
  }

  // Apply search filter to count query
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = `%${searchQuery.trim()}%`;
    countQuery = countQuery.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  const { count } = await countQuery;

  // Then get paginated data
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  // Apply search filter to data query
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = `%${searchQuery.trim()}%`;
    query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  const { data, error } = await query;

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data || [],
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getTaskById(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function startTask(taskId: string): Promise<UserTaskAttempt> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to start a task.');
  }

  const { data, error } = await supabase
    .from('user_task_attempts')
    .insert({
      user_id: user.id,
      task_id: taskId,
      status: 'in_progress',
      current_step: 1,
    })
    .select(`
      *,
      task:tasks(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateAttemptStep(
  attemptId: string,
  step: number,
  submission?: TaskSubmissionContent
): Promise<UserTaskAttempt> {
  const updateData: {
    current_step: number;
    submission_content?: TaskSubmissionContent;
  } = {
    current_step: step,
  };

  if (submission) {
    updateData.submission_content = submission;
  }

  const { data, error } = await supabase
    .from('user_task_attempts')
    .update(updateData)
    .eq('id', attemptId)
    .select(`
      *,
      task:tasks(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function completeTask(
  attemptId: string,
  rating: number
): Promise<UserTaskAttempt> {
  const { data, error } = await supabase
    .from('user_task_attempts')
    .update({
      status: 'completed',
      rating,
      completed_at: new Date().toISOString(),
    })
    .eq('id', attemptId)
    .select(`
      *,
      task:tasks(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserAttempts(): Promise<UserTaskAttempt[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to view your attempts.');
  }

  const { data, error } = await supabase
    .from('user_task_attempts')
    .select(`
      *,
      task:tasks(*)
    `)
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export interface AIFeedbackResponse {
  ai_feedback: string;
  skill_scores: {
    creativity: number;
    logic: number;
    communication: number;
    stress_resistance: number;
    learning_ability: number;
  };
}

export async function submitTaskForAIFeedback(
  attemptId: string,
  submission: TaskSubmissionContent
): Promise<AIFeedbackResponse> {
  // 这里应该调用AI服务进行评估
  // 暂时返回模拟数据
  const mockFeedback: AIFeedbackResponse = {
    ai_feedback: '很好的尝试!你展现了良好的创造力和逻辑思维能力。建议在沟通表达方面加强练习。',
    skill_scores: {
      creativity: 8,
      logic: 7,
      communication: 6,
      stress_resistance: 7,
      learning_ability: 8,
    },
  };

  // 更新数据库
  const { error } = await supabase
    .from('user_task_attempts')
    .update({
      ai_feedback: mockFeedback.ai_feedback,
      skill_scores: mockFeedback.skill_scores,
    })
    .eq('id', attemptId);

  if (error) throw error;

  return mockFeedback;
}
