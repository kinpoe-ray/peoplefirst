import { supabase } from '../lib/supabase';
import { Story, StoryFormData } from '../types/pathfinder';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getStories(
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string
): Promise<PaginatedResponse<Story>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // First get total count
  let countQuery = supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('is_public', true);

  // Apply search filter to count query
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = `%${searchQuery.trim()}%`;
    countQuery = countQuery.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
  }

  const { count } = await countQuery;

  // Then get paginated data
  let query = supabase
    .from('stories')
    .select(`
      *,
      author:users(id, username, avatar_url)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  // Apply search filter to data query
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = `%${searchQuery.trim()}%`;
    query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
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

export async function getStoryById(id: string): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      author:users(id, username, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createStory(storyData: StoryFormData): Promise<Story> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: user.id,
      ...storyData,
      is_public: true,
    })
    .select(`
      *,
      author:users(id, username, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateStory(
  id: string,
  storyData: Partial<StoryFormData>
): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .update({
      ...storyData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      author:users(id, username, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStory(id: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleLike(storyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  // 这里应该有一个likes表来记录点赞
  // 简化处理,直接更新like_count
  const { data: story } = await supabase
    .from('stories')
    .select('like_count')
    .eq('id', storyId)
    .single();

  if (!story) throw new Error('故事不存在');

  const { error } = await supabase
    .from('stories')
    .update({
      like_count: story.like_count + 1,
    })
    .eq('id', storyId);

  if (error) throw error;
}

export async function toggleFavorite(storyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  // 检查是否已收藏
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', 'story')
    .eq('target_id', storyId)
    .single();

  if (existing) {
    // 取消收藏
    await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);
  } else {
    // 添加收藏
    await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        target_type: 'story',
        target_id: storyId,
      });
  }
}

export async function getComments(storyId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:users(id, username, avatar_url)
    `)
    .eq('target_type', 'story')
    .eq('target_id', storyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addComment(storyId: string, content: string, parentId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      target_type: 'story',
      target_id: storyId,
      content,
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
