import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";
import { useApp } from "./store";

import { initFirestoreSync, cleanupFirestoreSync } from "./firestore-sync";

interface AuthContextValue {
  /** Firebase User object, null = signed out, undefined = still loading */
  firebaseUser: User | null | undefined;
}

const AuthContext = createContext<AuthContextValue>({ firebaseUser: undefined });

export function useFirebaseAuth() {
  return useContext(AuthContext);
}

/**
 * Wraps the app and keeps Firebase auth state in sync with the Zustand store
 * and initializes real-time Firestore listeners.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(
    undefined
  );
  const storeLogin = useApp((s) => s.login);
  const storeLogout = useApp((s) => s.logout);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        storeLogin(user.email ?? user.uid);
        initFirestoreSync(user.uid);
      } else {
        storeLogout();
        initFirestoreSync(null);
      }
    });

    return () => {
      unsub();
      cleanupFirestoreSync();
    };
  }, [storeLogin, storeLogout]);

  return (
    <AuthContext.Provider value={{ firebaseUser }}>
      {children}
    </AuthContext.Provider>
  );
}
