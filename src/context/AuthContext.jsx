import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../db/supabaseClient';

const AuthContext = createContext();

const MOCK_ADMIN = {
  email: 'admin@sdss.com',
  password: 'admin'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase auth is running, otherwise check mock session in localStorage
    const checkAuth = async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        if (sessionRes?.data?.session?.user) {
          setUser({
            email: sessionRes.data.session.user.email,
            id: sessionRes.data.session.user.id,
            isSupabase: true
          });
        } else {
          // Check local storage mock session
          const localUser = localStorage.getItem('sdss_admin_user');
          if (localUser) {
            setUser(JSON.parse(localUser));
          }
        }
      } catch (err) {
        console.error("Auth initialization error", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          id: session.user.id,
          isSupabase: true
        });
      } else if (!localStorage.getItem('sdss_admin_user')) {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Try mock login first (or if Supabase is placeholder)
      if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
        const mockUser = { email: MOCK_ADMIN.email, role: 'admin', id: 'mock-admin-id' };
        localStorage.setItem('sdss_admin_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setLoading(false);
        return { success: true };
      }

      // 2. Try Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.user) {
        const supabaseUser = { email: data.user.email, id: data.user.id, isSupabase: true };
        setUser(supabaseUser);
        setLoading(false);
        return { success: true };
      }
      
      throw new Error('User not found / Invalid credentials');
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('sdss_admin_user');
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Error logging out", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
