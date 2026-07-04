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

async function fetchAndEnsureProfile(user: User) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!error && data) {
    return data;
  }

  // If profile is missing (e.g. Google OAuth sign-in), create one
  const email = user.email ?? "";
  const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "_");
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const username = `${baseUsername}_${randSuffix}`;
  const full_name = user.user_metadata?.full_name || user.user_metadata?.name || "";
  const avatar_url = user.user_metadata?.avatar_url || "";

  const { data: newProfile, error: upsertError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email,
      username,
      full_name,
      avatar_url,
      cover_url: "",
      bio: "",
      university: "",
      level: "",
      department: "",
      gender: "",
      relationship: "",
      phone: "",
      hobbies: "",
    })
    .select()
    .single();

  if (upsertError) {
    console.error("Failed to auto-create profile:", upsertError);
    return null;
  }

  return newProfile;
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
      // If redirected back from an OAuth provider, parse the URL and store the session.
      try {
        // `getSessionFromUrl` is not present in all @supabase/supabase-js type definitions.
        // Call it defensively to avoid TypeScript errors in editors that mark it red.
        const getSessionFromUrl = (supabase.auth as any)?.getSessionFromUrl;
        if (typeof getSessionFromUrl === "function") {
          const fromUrl = await getSessionFromUrl.call(supabase.auth, { storeSession: true });
          if (fromUrl?.data?.session) {
            try {
              const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
              window.history.replaceState({}, document.title, cleanUrl);
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (e) {
        // ignore if not an auth callback or method unavailable
      }

      // Fallback: if the redirect left tokens in the URL hash and the SDK didn't parse them,
      // parse them manually and set the session. This handles cases where getSessionFromUrl
      // is unavailable or didn't run early enough.
      try {
        if (typeof window !== "undefined") {
          const hash = window.location.hash || "";
          if (hash.includes("access_token=")) {
            const params = new URLSearchParams(hash.replace(/^#/, ""));
            const access_token = params.get("access_token");
            const refresh_token = params.get("refresh_token");
            const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
            if (access_token) {
              const setSession = (supabase.auth as any)?.setSession;
              if (typeof setSession === "function") {
                try {
                  await setSession.call(supabase.auth, {
                    access_token,
                    refresh_token,
                  });
                  try {
                    window.history.replaceState({}, document.title, cleanUrl);
                  } catch (e) {
                    // ignore
                  }
                } catch (e) {
                  // ignore setSession errors
                }
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }

      const session = (await supabase.auth.getSession()).data.session;
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

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
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
      const message = error.message.toLowerCase();
      if (message.includes("invalid api key") || message.includes("unauthorized")) {
        setAuthError(
          "Login failed: your Supabase API key may be invalid. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env."
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

    const username = email.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "_");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("invalid api key") || message.includes("unauthorized")) {
        setAuthError(
          "Sign up failed: your Supabase API key may be invalid. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env."
        );
      } else {
        setAuthError(error.message);
      }
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
      if (data.session.user) {
        const profileData = await fetchAndEnsureProfile(data.session.user);
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
      const message = error.message.toLowerCase();
      if (message.includes("provider is not enabled")) {
        setAuthError(
          "Google sign-in is not enabled in Supabase Auth. Enable Google under Auth > Providers."
        );
      } else if (message.includes("invalid api key") || message.includes("unauthorized")) {
        setAuthError(
          "Supabase API key is invalid or missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env."
        );
      } else {
        setAuthError(error.message);
      }
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
