import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import type { AuthProfile } from '../types/auth';
import {
  registerForPushNotifications,
  savePushTokenToSupabase,
  removePushTokenFromSupabase,
  setupNotificationListeners,
  teardownNotificationListeners,
} from '../services/notificationService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  authError: null,
  signIn: async () => false,
  signUp: async () => false,
  signInWithGoogle: async () => false,
  signOut: async () => {},
  updateProfile: async () => false,
  refreshProfile: async () => {},
});
async function fetchAndEnsureProfile(user: User) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!error && data) {
    return data;
  }

  // If profile is missing (e.g. Google OAuth sign-in), create one
  const email = user.email ?? '';
  const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '_');
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const username = `${baseUsername}_${randSuffix}`;
  const full_name = user.user_metadata?.full_name || user.user_metadata?.name || '';
  const avatar_url = user.user_metadata?.avatar_url || '';

  const { data: newProfile, error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email,
      username,
      full_name,
      avatar_url,
      cover_url: '',
      bio: '',
      university: '',
      level: '',
      department: '',
      gender: '',
      relationship: '',
      phone: '',
      hobbies: '',
    })
    .select()
    .single();

  if (upsertError) {
    console.error('Failed to auto-create profile:', upsertError);
    return null;
  }
  return newProfile;
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function initialize() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchAndEnsureProfile(session.user);
        if (!isMounted) return;
        setProfile(profileData);
      }
      setLoading(false);
    }
    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const profileData = await fetchAndEnsureProfile(session.user);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('invalid api key') || message.includes('unauthorized')) {
        setAuthError(
          'Login failed: your Supabase API key may be invalid. Check environment variables.'
        );
      } else {
        setAuthError(error.message);
      }
      setLoading(false);
      return false;
    }
    setSession(data.session);
    setUser(data.session?.user ?? null);
    if (data.session?.user) {
      const profileData = await fetchAndEnsureProfile(data.session.user);
      setProfile(profileData);
    }
    setLoading(false);
    return true;
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('invalid api key') || message.includes('unauthorized')) {
        setAuthError(
          'Sign up failed: your Supabase API key may be invalid. Check environment variables.'
        );
      } else {
        setAuthError(error.message);
      }
      setLoading(false);
      return false;
    }
    const userId = data.user?.id ?? data.session?.user?.id;
    if (userId && data.session) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email,
        username: email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '_'),
        full_name: '',
        avatar_url: '',
        cover_url: '',
        bio: '',
        university: '',
        level: '',
        department: '',
        gender: '',
        relationship: '',
        phone: '',
        hobbies: '',
      });
      if (profileError) {
        console.error('Failed to create profile after signup:', profileError);
      }
    }
    if (data.session) {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session.user) {
        const profileData = await fetchAndEnsureProfile(data.session.user);
        setProfile(profileData);
      }
      setLoading(false);
      return true;
    }
    if (data.user) {
      setAuthError('Check your email to confirm your account before logging in.');
      setLoading(false);
      return false;
    }
    setAuthError('Sign up failed. Please try again.');
    setLoading(false);
    return false;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'exp://localhost:8081/--/auth', // This will need to be configured for your app
      },
    });
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('provider is not enabled')) {
        setAuthError(
          'Google sign-in is not enabled in Supabase Auth. Enable Google under Auth > Providers.'
        );
      } else if (message.includes('invalid api key') || message.includes('unauthorized')) {
        setAuthError(
          'Supabase API key is invalid or missing. Check environment variables.'
        );
      } else {
        setAuthError(error.message);
      }
      setLoading(false);
      return false;
    }
    // In Expo, signInWithOAuth typically opens a browser and then redirects back to the app.
    // The session will be handled by the onAuthStateChange listener.
    return true;
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<AuthProfile>) => {
    if (!user?.id) return false;
    const payload = {
      id: user.id,
      ...updates,
    };
    const { error, data } = await supabase.from('profiles').upsert(payload).select().single();
    if (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
    setProfile(data as AuthProfile);
    return true;
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profileData = await fetchAndEnsureProfile(user);
    setProfile(profileData);
  };

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      authError,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateProfile,
      refreshProfile,
    }),
    [session, user, profile, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
