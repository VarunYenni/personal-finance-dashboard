import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";

interface AuthState {
  session: Session | null;
  isLoading: boolean;
}

export function useAuthSession() {
  const [state, setState] = useState<AuthState>({ session: null, isLoading: isSupabaseConfigured });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState({ session: null, isLoading: false });
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setState({ session: data.session, isLoading: false });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, isLoading: false });
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
