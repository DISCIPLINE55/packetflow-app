import { Session } from '@supabase/supabase-js';
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { firebaseAuth } from '@/client/firebase';
import { supabase } from '@/client/supabase';
import { useSettingsStore } from '@/store/useSettingsStore';

type SessionContextType = {
  session: Session | null;
  firebaseUser: import('firebase/auth').User | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  firebaseUser: null,
  isLoading: true,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<import('firebase/auth').User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const appState = useRef(AppState.currentState);
  const backend = useSettingsStore((s) => s.backend);

  useEffect(() => {
    if (backend === 'firebase') {
      // Firebase auth state
      const unsub = onAuthStateChanged(firebaseAuth, (user) => {
        setFirebaseUser(user);
        setSession(null);
        setIsLoading(false);
      });
      return () => unsub();
    } else {
      // Supabase auth state
      setFirebaseUser(null);
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
        setSession(s);
      });

      const appStateSubscription = AppState.addEventListener('change', async (nextState) => {
        if (Platform.OS !== 'web' && appState.current.match(/inactive|background/) && nextState === 'active') {
          const { error } = await supabase.auth.refreshSession();
          if (error) await supabase.auth.signOut();
        }
        appState.current = nextState;
      });

      return () => {
        subscription.unsubscribe();
        appStateSubscription.remove();
      };
    }
  }, [backend]);

  return (
    <SessionContext.Provider value={{ session, firebaseUser, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
