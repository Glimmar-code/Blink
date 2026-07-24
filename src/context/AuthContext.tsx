import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import type { AuthProfile } from '../types/auth';
import {
  defaultHandleFromEmail,
  mapProfile,
  PROFILE_SELECT,
  profileToDbPayload,
} from '../lib/dbCompat';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  authError: string | null;
  isNewUser: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  authError: null,
  isNewUser: false,
  signIn: async () => false,
  signUp: async () => false,
  signInWithGoogle: async () => false,
  signOut: async () => {},
  updateProfile: async () => false,
  refreshProfile: async () => {},
  completeOnboarding: () => {},
});
async function fetchAndEnsureProfile(user: User): Promise<{ profile: AuthProfile | null; isNew: boolean }> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', user.id)
    .maybeSingle();

  if (!error && data) {
    return { profile: mapProfile(data), isNew: false };
  }

  // If profile is missing (e.g. Google OAuth sign-in), create one
  const email = user.email ?? '';
  const handle = defaultHandleFromEmail(email);
  const name = user.user_metadata?.full_name || user.user_metadata?.name || '';
  const avatarUrl = user.user_metadata?.avatar_url || '';

  const { data: newProfile, error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      handle,
      name,
      full_name: name,
      avatar_url: avatarUrl,
      cover_url: '',
      bio: '',
      university: '',
      faculty: '',
      gender: '',
      relationship_status: '',
      phone: '',
      hobby: '',
    })
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (upsertError) {
    console.error('Failed to auto-create profile:', upsertError);
    return { profile: null, isNew: false };
  }
  return { profile: mapProfile(newProfile), isNew: true };
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function initialize() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { profile: profileData, isNew } = await fetchAndEnsureProfile(session.user);
        if (!isMounted) return;
        setProfile(profileData);
        if (isNew) setIsNewUser(true);
      }
      setLoading(false);
    }
    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          (async () => {
            const { profile: profileData, isNew } = await fetchAndEnsureProfile(session.user);
            if (!isMounted) return;
            setProfile(profileData);
            if (isNew) setIsNewUser(true);
          })();
        } else {
          setProfile(null);
          setIsNewUser(false);
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
      const { profile: profileData, isNew } = await fetchAndEnsureProfile(data.session.user);
      setProfile(profileData);
      if (isNew) setIsNewUser(true);
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
        handle: defaultHandleFromEmail(email),
        name: '',
        avatar_url: '',
        cover_url: '',
        bio: '',
        university: '',
        faculty: '',
        gender: '',
        relationship_status: '',
        phone: '',
        hobby: '',
      });
      if (profileError) {
        console.error('Failed to create profile after signup:', profileError);
      }
    }
    if (data.session) {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session.user) {
        const { profile: profileData, isNew } = await fetchAndEnsureProfile(data.session.user);
        setProfile(profileData);
        if (isNew) setIsNewUser(true);
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
    const redirectTo =
      Platform.OS === 'web'
        ? window.location.origin
        : 'exp://localhost:8081/--/auth';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
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
    const payload = profileToDbPayload({
      id: user.id,
      ...updates,
    });
    const { error, data } = await supabase
      .from('profiles')
      .upsert(payload)
      .select(PROFILE_SELECT)
      .single();
    if (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
    setProfile(mapProfile(data));
    return true;
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { profile: profileData } = await fetchAndEnsureProfile(user);
    setProfile(profileData);
  };

  const completeOnboarding = () => setIsNewUser(false);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      authError,
      isNewUser,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateProfile,
      refreshProfile,
      completeOnboarding,
    }),
    [session, user, profile, loading, authError, isNewUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
