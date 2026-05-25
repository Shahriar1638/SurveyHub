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
import useAxiosPublic from "@/Hooks/useAxiosPublic";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);
export const TOKEN_KEY = "access-token";
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();

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

  const logOut = useCallback(() => {
    setLoading(true);
    return signOut(auth).catch((error) => {
      setLoading(false);
      throw error;
    });
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
      if (currentUser) {
        const userInfo = { email: currentUser.email };
        axiosPublic.post("/jwt", userInfo).then((res) => {
          if (res.data.token) {
            localStorage.setItem(TOKEN_KEY, res.data.token);
          }
          setLoading(false);
        }).catch((err) => {
          console.error("JWT fetch error:", err);
          setLoading(false);
        });
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setLoading(false);
      }
    });
    return () => {
      unSubscribe();
    };
  }, [axiosPublic]);
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
