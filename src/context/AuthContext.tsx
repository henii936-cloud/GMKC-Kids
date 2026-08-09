import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

interface UserProfile {
  id: string;
  email?: string;
  role: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const CACHE_KEY_PREFIX = "kids_profile_";

export const isKidsRole = (role?: string): boolean => {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return (
    r.includes("kid") ||
    r.includes("child") ||
    r.includes("children") ||
    r.includes("sunday") ||
    r === "admin"
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const clearStaleSession = async () => {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch (_) { }
      if (mounted) {
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    };

    const loadUser = async (currentSession: any) => {
      if (!currentSession?.user) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const authUser = currentSession.user;

      try {
        const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${authUser.id}`);
        if (cached && mounted) {
          const parsed = JSON.parse(cached);
          if (isKidsRole(parsed.role)) {
            setUser({ ...authUser, ...parsed });
            setLoading(false);
          }
        }
      } catch (_) { }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (error) throw error;

        const effectiveRole = data?.role || authUser.user_metadata?.role;
        const effectiveName = data?.full_name || authUser.user_metadata?.full_name || authUser.email;

        if (effectiveRole && isKidsRole(effectiveRole) && mounted) {
          const profileObj = {
            id: authUser.id,
            email: authUser.email,
            role: effectiveRole,
            full_name: effectiveName,
            ...(data || {}),
          };
          localStorage.setItem(`${CACHE_KEY_PREFIX}${authUser.id}`, JSON.stringify(profileObj));
          setUser({ ...authUser, ...profileObj });
        } else if (mounted) {
          console.warn("User is not authorized for Kids Ministry Portal");
          await clearStaleSession();
        }
      } catch (err: any) {
        console.warn("Profile refresh failed:", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(s);
          await loadUser(s);
        }
      } catch (_) {
        if (mounted) setLoading(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await loadUser(newSession);
        }
        if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        }
      }
    );

    init();

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    const effectiveRole = profileData?.role || data.user.user_metadata?.role;
    const effectiveName = profileData?.full_name || data.user.user_metadata?.full_name || data.user.email;

    if (!effectiveRole || !isKidsRole(effectiveRole)) {
      await supabase.auth.signOut();
      throw new Error(`Access denied. Role "${effectiveRole || 'none'}" is not authorized for Kids Ministry.`);
    }

    const fullProfile = {
      id: data.user.id,
      email: data.user.email,
      role: effectiveRole,
      full_name: effectiveName,
      ...(profileData || {}),
    };

    localStorage.setItem(`${CACHE_KEY_PREFIX}${data.user.id}`, JSON.stringify(fullProfile));
    setSession(data.session);
    setUser({ ...data.user, ...fullProfile });
  };

  const logout = async () => {
    if (user?.id) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${user.id}`);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
