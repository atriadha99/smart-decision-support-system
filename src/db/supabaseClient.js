import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder-url.supabase.co') {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn("Failed to initialize Supabase client:", e);
  }
}

// Fallback dummy client to avoid null pointer reference errors
if (!supabaseInstance) {
  supabaseInstance = {
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => Promise.resolve({ data: [{}], error: null }) }),
      upsert: () => ({ select: () => Promise.resolve({ data: [{}], error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
}

export const supabase = supabaseInstance;
