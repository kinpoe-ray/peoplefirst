import { create } from 'zustand';
import { User } from '../types/pathfinder';
import { supabase } from '../lib/supabase';
import { createLogger } from '../lib/logger';

const logger = createLogger('AuthStore');

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isGuest: boolean;
  guestData: GuestData | null;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

interface GuestData {
  id: string;
  created_at: string;
  guest_token: string;
}

const GUEST_STORAGE_KEY = 'evolv_guest_data';

// Helper function to generate guest token
const generateGuestToken = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 11)}`;
};

// Helper function to generate guest ID
const generateGuestId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Load guest data from localStorage
const loadGuestData = (): GuestData | null => {
  try {
    const saved = localStorage.getItem(GUEST_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    logger.error('Failed to load guest data', error);
  }
  return null;
};

// Save guest data to localStorage
const saveGuestData = (data: GuestData) => {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    logger.error('Failed to save guest data', error);
  }
};

// Remove guest data from localStorage
const removeGuestData = () => {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch (error) {
    logger.error('Failed to remove guest data', error);
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  isGuest: false,
  guestData: null,

  setUser: (user) => set({ user, isGuest: false, guestData: null }),

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
      removeGuestData();
      set({ user: null, isGuest: false, guestData: null });
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

        removeGuestData(); // Clear any guest data when authenticated
        set({ user: profile, isLoading: false, isGuest: false, guestData: null });
      } else {
        // Check for existing guest session
        const savedGuestData = loadGuestData();
        if (savedGuestData) {
          set({
            user: null,
            isLoading: false,
            isGuest: true,
            guestData: savedGuestData
          });
        } else {
          set({ user: null, isLoading: false, isGuest: false, guestData: null });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auth check failed';
      set({ error: errorMessage, isLoading: false });
    }
  },

  enterGuestMode: () => {
    const guestData: GuestData = {
      id: generateGuestId(),
      created_at: new Date().toISOString(),
      guest_token: generateGuestToken(),
    };
    saveGuestData(guestData);
    set({ isGuest: true, guestData, user: null, isLoading: false });
    logger.debug('Guest mode activated', guestData);
  },

  exitGuestMode: () => {
    removeGuestData();
    set({ isGuest: false, guestData: null });
    logger.debug('Guest mode deactivated');
  },
}));
