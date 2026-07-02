import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";

export interface AuthProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  university: string;
  level: string;
  department: string;
  gender: string;
  relationship: string;
  phone: string;
  hobbies: string;
}

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

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to load profile:", error);
    return null;
  }

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        const profileData = await fetchProfile(data.session.user.id);
        if (!isMounted) return;
        setProfile(profileData);
      }
      setLoading(false);
    }

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return false;
    }

    setSession(data.session);
    setUser(data.session?.user ?? null);
    if (data.session?.user) {
      const profileData = await fetchProfile(data.session.user.id);
      setProfile(profileData);
    }

    setLoading(false);
    return true;
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);

    const username = email.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "_");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return false;
    }

    const userId = data.user?.id ?? data.session?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          email,
          username,
          full_name: "",
          avatar_url: "",
          cover_url: "",
          bio: "",
          university: "",
          level: "",
          department: "",
          gender: "",
          relationship: "",
          phone: "",
          hobbies: "",
        });

      if (profileError) {
        console.error("Failed to create profile after signup:", profileError);
      }
    }

    if (data.session) {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (userId) {
        const profileData = await fetchProfile(userId);
        setProfile(profileData);
      }
      setLoading(false);
      return true;
    }

    if (data.user) {
      setAuthError("Check your email to confirm your account before logging in.");
      setLoading(false);
      return false;
    }

    setAuthError("Sign up failed. Please try again.");
    setLoading(false);
    return false;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return false;
    }

    if (!data || !data.url) {
      setAuthError("Google sign-in failed. Please try again.");
      setLoading(false);
      return false;
    }

    window.location.assign(data.url);
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

    const { error, data } = await supabase.from("profiles").upsert(payload).select().single();
    if (error) {
      console.error("Failed to update profile:", error);
      return false;
    }

    setProfile(data as AuthProfile);
    return true;
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    const profileData = await fetchProfile(user.id);
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
