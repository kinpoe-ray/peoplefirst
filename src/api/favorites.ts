import { supabase } from '../lib/supabase';
import { Content, Story, Task } from '../types/pathfinder';

export interface Favorite {
  id: string;
  user_id: string;
  target_type: 'content' | 'task' | 'story';
  target_id: string;
  created_at: string;
  content?: Content;
  story?: Story;
  task?: Task;
}

/**
 * 检查是否已收藏内容
 */
export async function checkIfFavorited(contentId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', 'content')
    .eq('target_id', contentId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Check favorite error:', error);
  }

  return !!data;
}

/**
 * 检查是否已收藏故事
 */
export async function checkIfStoryFavorited(storyId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('target_type', 'story')
    .eq('target_id', storyId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Check story favorite error:', error);
  }

  return !!data;
}

/**
 * 添加内容到收藏
 */
export async function addToFavorites(contentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to add favorites.');
  }

  console.log('[addToFavorites] Starting with userId:', user.id, 'contentId:', contentId);

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      target_type: 'content',
      target_id: contentId,
    });

  if (error) {
    console.error('[addToFavorites] Insert error:', error);
    throw error;
  }

  console.log('[addToFavorites] Favorite inserted successfully');

  // 更新内容的收藏计数
  const { data: content, error: selectError } = await supabase
    .from('contents')
    .select('favorite_count')
    .eq('id', contentId)
    .single();

  if (selectError) {
    console.error('[addToFavorites] Select error:', selectError);
    throw selectError;
  }

  console.log('[addToFavorites] Current favorite_count:', content?.favorite_count);

  if (content) {
    const { error: updateError } = await supabase
      .from('contents')
      .update({ favorite_count: (content.favorite_count || 0) + 1 })
      .eq('id', contentId);

    if (updateError) {
      console.error('[addToFavorites] Update error:', updateError);
      throw updateError;
    }

    console.log('[addToFavorites] Favorite count updated successfully');
  }
}

/**
 * 添加故事到收藏
 */
export async function addStoryToFavorites(storyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to add favorites.');
  }

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      target_type: 'story',
      target_id: storyId,
    });

  if (error) throw error;
}

/**
 * 从收藏中移除内容
 */
export async function removeFromFavorites(contentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to remove favorites.');
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('target_type', 'content')
    .eq('target_id', contentId);

  if (error) throw error;

  // 更新内容的收藏计数
  const { data: content } = await supabase
    .from('contents')
    .select('favorite_count')
    .eq('id', contentId)
    .single();

  if (content && content.favorite_count > 0) {
    await supabase
      .from('contents')
      .update({ favorite_count: content.favorite_count - 1 })
      .eq('id', contentId);
  }
}

/**
 * 从收藏中移除故事
 */
export async function removeStoryFromFavorites(storyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to remove favorites.');
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('target_type', 'story')
    .eq('target_id', storyId);

  if (error) throw error;
}

/**
 * 切换收藏状态（内容）
 */
export async function toggleFavorite(contentId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to toggle favorites.');
  }

  const isFavorited = await checkIfFavorited(contentId, user.id);

  if (isFavorited) {
    await removeFromFavorites(contentId);
    return false;
  } else {
    await addToFavorites(contentId);
    return true;
  }
}

/**
 * 切换收藏状态（故事）
 */
export async function toggleStoryFavorite(storyId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to toggle favorites.');
  }

  const isFavorited = await checkIfStoryFavorited(storyId, user.id);

  if (isFavorited) {
    await removeStoryFromFavorites(storyId);
    return false;
  } else {
    await addStoryToFavorites(storyId);
    return true;
  }
}

/**
 * 获取用户的所有收藏
 */
export async function getUserFavorites(): Promise<Favorite[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to view favorites.');
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * 获取用户收藏的内容
 */
export async function getFavoriteContents(): Promise<Content[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to view favorite contents.');
  }

  // 获取收藏的内容 ID 列表
  const { data: favorites } = await supabase
    .from('favorites')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'content')
    .order('created_at', { ascending: false });

  if (!favorites || favorites.length === 0) return [];

  // 获取内容详情
  const contentIds = favorites.map(f => f.target_id);
  const { data: contents } = await supabase
    .from('contents')
    .select('*')
    .in('id', contentIds);

  return contents || [];
}

/**
 * 获取用户收藏的故事
 */
export async function getFavoriteStories(): Promise<Story[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required. Please log in to view favorite stories.');
  }

  // 获取收藏的故事 ID 列表
  const { data: favorites } = await supabase
    .from('favorites')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'story')
    .order('created_at', { ascending: false });

  if (!favorites || favorites.length === 0) return [];

  // 获取故事详情
  const storyIds = favorites.map(f => f.target_id);
  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .in('id', storyIds);

  return stories || [];
}
