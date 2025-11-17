import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { createLogger } from '../lib/logger';

const logger = createLogger('AuthContext');

type GuestProfile = {
  id: string;
  user_type: 'guest';
  full_name: string;
  avatar_url?: string;
  school?: string;
  major?: string;
  graduation_year?: number;
  bio?: string;
  is_public: boolean;
  guest_token: string;
  converted_to_user_id?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | GuestProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  createGuestUser: () => Promise<void>;
  convertGuestToUser: (email: string, password: string, userData: Partial<Profile>) => Promise<any>;
  refreshProfile: () => Promise<void>;
};

const GUEST_PROFILE_KEY = 'evolv_guest_profile';
const GUEST_TOKEN_KEY = 'evolv_guest_token';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | GuestProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const generateGuestToken = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateGuestId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 11)}`;
  };

  // 创建游客用户
  const createGuestUser = useCallback(async () => {
    try {
      const guestToken = generateGuestToken();
      const guestId = generateGuestId();

      const guestProfile: GuestProfile = {
        id: guestId,
        user_type: 'guest',
        full_name: '游客用户',
        is_public: false,
        guest_token: guestToken,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 只保存到本地存储，不依赖数据库
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(guestProfile));
      localStorage.setItem(GUEST_TOKEN_KEY, guestToken);

      setProfile(guestProfile);
      logger.debug('游客用户创建成功', guestProfile);
    } catch (error) {
      logger.error('创建游客用户时发生错误', error);
      // 即使出错也要创建本地游客用户
      const fallbackGuestProfile: GuestProfile = {
        id: 'guest_fallback',
        user_type: 'guest',
        full_name: '游客用户',
        is_public: false,
        guest_token: 'fallback_token',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(fallbackGuestProfile);
    }
  }, []);

  // 加载游客用户
  const loadGuestUser = useCallback(async () => {
    const savedProfile = localStorage.getItem(GUEST_PROFILE_KEY);
    const savedToken = localStorage.getItem(GUEST_TOKEN_KEY);

    if (savedProfile && savedToken) {
      try {
        const guestProfile = JSON.parse(savedProfile);
        setProfile(guestProfile as GuestProfile);
        logger.debug('游客用户加载成功', guestProfile);
      } catch (error) {
        logger.error('加载游客用户失败', error);
        await createGuestUser();
      }
    } else {
      // 没有游客信息，创建新的游客用户
      await createGuestUser();
    }
  }, [createGuestUser]);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    }
  }, []);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        // 设置超时保护
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );

        const authPromise = supabase.auth.getUser();

        try {
          const { data: { user: authUser }, error } = await Promise.race([
            authPromise,
            timeoutPromise
          ]) as Awaited<ReturnType<typeof supabase.auth.getUser>>;

          if (error) {
            logger.warn('Auth error, using guest mode', error);
            await loadGuestUser();
            return;
          }

          setUser(authUser);

          if (authUser) {
            await loadProfile(authUser.id);
          } else {
            await loadGuestUser();
          }
        } catch (timeoutError) {
          logger.warn('Auth timeout, using guest mode');
          await loadGuestUser();
        }
      } catch (error) {
        logger.error('Auth initialization error', error);
        await loadGuestUser();
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          await loadGuestUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadGuestUser, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    } else if (profile && 'guest_token' in profile) {
      // 游客用户只从localStorage刷新
      const savedProfile = localStorage.getItem(GUEST_PROFILE_KEY);
      if (savedProfile) {
        try {
          const guestProfile = JSON.parse(savedProfile);
          setProfile(guestProfile as GuestProfile);
        } catch (error) {
          logger.error('刷新游客用户资料失败', error);
        }
      }
    }
  }, [user, profile, loadProfile]);

  async function signIn(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error && result.data.user) {
      await loadProfile(result.data.user.id);
      localStorage.removeItem(GUEST_PROFILE_KEY);
      localStorage.removeItem(GUEST_TOKEN_KEY);
    }
    return result;
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });

    if (!error) {
      localStorage.removeItem(GUEST_PROFILE_KEY);
      localStorage.removeItem(GUEST_TOKEN_KEY);
    }

    return { data, error };
  }

  async function signUp(email: string, password: string, userData: Partial<Profile>) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { error: authError };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        ...userData,
        is_public: true,
      });

    if (profileError) {
      return { error: profileError };
    }

    await loadProfile(authData.user.id);
    localStorage.removeItem(GUEST_PROFILE_KEY);
    localStorage.removeItem(GUEST_TOKEN_KEY);
    
    return { data: authData };
  }

  async function convertGuestToUser(email: string, password: string, userData: Partial<Profile>) {
    if (!profile || !('guest_token' in profile)) {
      return { error: new Error('当前不是游客用户') };
    }

    const guestId = profile.id;
    const guestToken = profile.guest_token;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { error: authError };
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          ...userData,
          is_public: true,
        });

      if (profileError) {
        return { error: profileError };
      }

      // 更新guest_profiles标记已转换
      await supabase
        .from('guest_profiles')
        .update({
          converted_to_user_id: authData.user.id,
          converted_at: new Date().toISOString(),
        })
        .eq('id', guestId)
        .eq('guest_token', guestToken);

      // 迁移数据
      await supabase.from('user_skills').update({ user_id: authData.user.id }).eq('user_id', guestId);
      await supabase.from('user_badges').update({ user_id: authData.user.id }).eq('user_id', guestId);
      await supabase.from('skill_assessments').update({ user_id: authData.user.id }).eq('user_id', guestId);
      await supabase.from('user_answers').update({ user_id: authData.user.id }).eq('user_id', guestId);
      await supabase.from('user_courses').update({ user_id: authData.user.id }).eq('user_id', guestId);
      await supabase.from('career_goals').update({ user_id: authData.user.id }).eq('user_id', guestId);
      await supabase.from('learning_paths').update({ user_id: authData.user.id }).eq('user_id', guestId);

      await loadProfile(authData.user.id);
      localStorage.removeItem(GUEST_PROFILE_KEY);
      localStorage.removeItem(GUEST_TOKEN_KEY);
      
      return { data: authData, success: true };
    } catch (error) {
      logger.error('数据迁移失败', error);
      return { error: error as Error };
    }
  }

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(GUEST_PROFILE_KEY);
    localStorage.removeItem(GUEST_TOKEN_KEY);
    await createGuestUser();
  }, [createGuestUser]);

  const isGuest = profile ? 'guest_token' in profile : false;
  const isAuthenticated = !!user || isGuest;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        loading, 
        isAuthenticated, 
        isGuest,
        signIn, 
        signUp, 
        signInWithGoogle,
        signOut, 
        createGuestUser,
        convertGuestToUser,
        refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
