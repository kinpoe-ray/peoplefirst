import { createClient } from '@supabase/supabase-js';

// 使用环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少 Supabase 环境变量！');
  console.error('请确保 .env 文件包含:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - VITE_SUPABASE_ANON_KEY');
  throw new Error('Supabase configuration missing. Please check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  user_type: 'student' | 'teacher' | 'alumni' | 'guest';
  full_name: string;
  avatar_url?: string;
  school?: string;
  major?: string;
  graduation_year?: number;
  bio?: string;
  is_public: boolean;
  is_guest?: boolean;
  guest_token?: string;
  converted_to_user_id?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
};

// Skill类型已移至types/index.ts
export type Skill = {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  level_required?: number;
  market_demand?: number;
  prerequisites?: string[];
  difficulty_level?: number;
  learning_resources?: string[];
  estimated_learning_time?: number;
  created_at: string;
};

export type UserSkill = {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  score: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  skill_id?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement_score?: number;
  created_at: string;
};

export type Guild = {
  id: string;
  name: string;
  description?: string;
  skill_category: string;
  icon_url?: string;
  member_count: number;
  created_by: string;
  created_at: string;
};

export type UserRole = 'student' | 'teacher' | 'alumni' | 'guest';

// 认证相关类型
export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    user_type?: UserRole;
    school?: string;
    major?: string;
    graduation_year?: number;
  };
  app_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

// 数据库表类型
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      user_skills: {
        Row: UserSkill;
        Insert: Omit<UserSkill, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSkill, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

// 工具函数
export const getUserRole = (user: AuthUser | null): UserRole | null => {
  if (!user) return null;
  return user.user_metadata?.user_type || null;
};

export const isTeacher = (user: AuthUser | null): boolean => {
  return getUserRole(user) === 'teacher';
};

export const isStudent = (user: AuthUser | null): boolean => {
  return getUserRole(user) === 'student';
};

export const isAlumni = (user: AuthUser | null): boolean => {
  return getUserRole(user) === 'alumni';
};

// 数据库操作辅助函数
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('获取用户资料失败:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('更新用户资料失败:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

// 角色权限检查
export const canCreateCourse = (user: AuthUser | null): boolean => {
  const role = getUserRole(user);
  return role === 'teacher' || role === 'alumni';
};

export const canCreateQuestion = (user: AuthUser | null): boolean => {
  const role = getUserRole(user);
  return role === 'teacher';
};

export const canViewPrivateProfile = (
  viewer: AuthUser | null,
  profileOwnerId: string
): boolean => {
  if (!viewer) return false;
  return viewer.id === profileOwnerId; // 只有本人可以查看私有资料
};

export const canEditProfile = (
  editor: AuthUser | null,
  profileOwnerId: string
): boolean => {
  if (!editor) return false;
  return editor.id === profileOwnerId; // 只有本人可以编辑自己的资料
};
