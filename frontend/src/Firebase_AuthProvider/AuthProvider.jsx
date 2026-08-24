import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import auth from "../Firebase/firebase.config";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);
export const TOKEN_KEY = "access-token";
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //Sign in with user email pass
  const createUser = useCallback((email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password).catch((error) => {
      setLoading(false);
      throw error;
    });
  }, []);

  const signInUser = useCallback((email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password).catch((error) => {
      setLoading(false);
      throw error;
    });
  }, []);

  const logOut = useCallback(async () => {
    setLoading(true);
    localStorage.removeItem(TOKEN_KEY);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setLoading(false);
      // Hard site-wide refresh to clear all in-memory caches, React Query stores, and singleton states
      window.location.href = "/";
    }
  }, []);

  //Sign in with gmail pass
  const signInWithGoogle = useCallback(() => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider).catch((error) => {
      setLoading(false);
      throw error;
    });
  }, []);
  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      unSubscribe();
    };
  }, []);
  const authInfo = useMemo(
    () => ({
      user,
      createUser,
      signInUser,
      logOut,
      loading,
      signInWithGoogle,
    }),
    [loading, logOut, signInUser, signInWithGoogle, createUser, user]
  );
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
