import { supabase } from '../lib/supabase';
import { Content, CareerCategory } from '../types/pathfinder';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getContents(
  category?: CareerCategory,
  page: number = 1,
  pageSize: number = 12,
  searchQuery?: string
): Promise<PaginatedResponse<Content>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // First get total count
  let countQuery = supabase
    .from('contents')
    .select('*', { count: 'exact', head: true });

  if (category && category !== '全部') {
    countQuery = countQuery.eq('category', category);
  }

  // Apply search filter to count query
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = `%${searchQuery.trim()}%`;
    countQuery = countQuery.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  const { count } = await countQuery;

  // Then get paginated data
  let query = supabase
    .from('contents')
    .select(`
      *,
      author:users(id, username, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (category && category !== '全部') {
    query = query.eq('category', category);
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

export async function getContentById(id: string): Promise<Content> {
  const { data, error } = await supabase
    .from('contents')
    .select(`
      *,
      author:users(id, username, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_content_views', {
    content_id: id,
  });

  if (error) throw error;
}

export async function toggleFavorite(contentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  // 检查是否已收藏
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', 'content')
    .eq('target_id', contentId)
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
        target_type: 'content',
        target_id: contentId,
      });
  }
}

export async function getComments(contentId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:users(id, username, avatar_url)
    `)
    .eq('target_type', 'content')
    .eq('target_id', contentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addComment(contentId: string, content: string, parentId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('未登录');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      target_type: 'content',
      target_id: contentId,
      content,
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
