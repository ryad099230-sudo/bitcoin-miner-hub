import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Subscribe before reading the initial session so sign-in events are not missed.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("[Auth] Could not restore session:", error.message);
          setSession(null);
        } else {
          setSession(data.session);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("[Auth] Session restoration failed:", error);
        setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const uid = session?.user.id;

    if (!uid) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(false);
    void supabase.rpc("has_role", { _user_id: uid, _role: "admin" })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("[Auth] Could not verify administrator role:", error.message);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(data === true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("[Auth] Administrator role check failed:", error);
        setIsAdmin(false);
      });

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        isAdmin,
        loading,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
