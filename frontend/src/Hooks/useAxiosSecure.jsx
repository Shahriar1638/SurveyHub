import axios from "axios";
import { useNavigate } from "react-router";
import { useContext, useEffect, useRef } from "react";
import { AuthContext, TOKEN_KEY } from "../Firebase_AuthProvider/AuthProvider";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Synchronous module-level request interceptor:
// Guarantees that EVERY request (including immediate useQuery fetches on mount)
// always has Authorization attached without waiting for React useEffect.
axiosSecure.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global callbacks ref for 401/403 handling
let globalLogOut = null;
let globalNavigate = null;

// Synchronous module-level response interceptor
axiosSecure.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      if (typeof globalLogOut === "function") {
        await globalLogOut().catch(() => {});
      }
      if (typeof globalNavigate === "function") {
        globalNavigate("/login");
      }
    }
    return Promise.reject(error);
  }
);

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { logOut } = useContext(AuthContext);

  const logOutRef = useRef(logOut);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    logOutRef.current = logOut;
    navigateRef.current = navigate;
    globalLogOut = logOut;
    globalNavigate = navigate;
  }, [logOut, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
