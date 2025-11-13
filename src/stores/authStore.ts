import { create } from 'zustand';
import { User } from '../types/pathfinder';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),

  updateUser: async (userData) => {
    try {
      set({ isLoading: true, error: null });

      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) throw error;

      set({ user: data, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 获取用户profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      set({ user: profile, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signUp: async (email, password, username) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;

      // 创建用户profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user!.id,
          email,
          username,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      set({ user: profile, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      set({ error: errorMessage });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        set({ user: profile, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auth check failed';
      set({ error: errorMessage, isLoading: false });
    }
  },
}));
