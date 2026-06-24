// Supabase client initialization.
// This is used if DB_TYPE is set to 'supabase' in src/db/client.js

// Safe check: if we want to run without installing @supabase/supabase-js,
// we can export a mock or a real client. Let's try importing it.

let supabaseInstance = null;

try {
  // If @supabase/supabase-js is installed, use it
  const supabaseJS = await import('@supabase/supabase-js');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
  
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder-url.supabase.co') {
    supabaseInstance = supabaseJS.createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.warn("Supabase client could not be initialized. Using local mock/fallback.", e);
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
