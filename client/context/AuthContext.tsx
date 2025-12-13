"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

/*
The Context: the "Pipe" that runs through the app.
The Provider: the "Tank" at the top of the app that fills the pipe with data.
The Hook: the "Faucet" that components open to get the data.
*/

// 1. Define the Context Shape
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}
// Create the Context
// We start it as 'null' because the Provider hasn't run yet.
const AuthContext = createContext<AuthContextType | null>(null);

// The Provider Component
// This wraps our entire app and holds the actual State variables.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The Login Function
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // We don't need to setUser here! The useEffect listener will handle it.
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  // The Logout Function
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // The "Listener"
  useEffect(() => {
    // Start listening on mount
    // We save the "Stop Button" into the variable 'unsubscribe'
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the user (or null)
      setIsLoading(false);
    });

    // 2. SAVE THE STOP BUTTON FOR LATER
    // We are NOT running this yet. We are handing it to React.
    // React puts it in a safe box and says: "I will press this button ONLY when the component dies."
    return () => unsubscribe();
  }, []);

  // The value object is what gets passed down the "Pipe"
  const value = {
    user,
    isLoading,
    signIn,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Optional: We could show a loading spinner here if (isLoading) is true,
        so the user doesn't see a flash of "Logged Out" content before the user is found.
       */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// The Custom Hook (The Faucet)
// This makes it easy for components to just say `const { user } = useAuth();`
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
