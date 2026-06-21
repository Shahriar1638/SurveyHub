import axios from "axios";
import { useNavigate } from "react-router";
import { useContext, useEffect, useRef } from "react";
import { AuthContext, TOKEN_KEY } from "../Firebase_AuthProvider/AuthProvider";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let requestInterceptorId = null;
let responseInterceptorId = null;

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { logOut, user } = useContext(AuthContext);

  // Refs so interceptors always read the latest logOut/navigate
  const logOutRef = useRef(logOut);
  const navigateRef = useRef(navigate);
  const tokenRef = useRef(localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    logOutRef.current = logOut;
    navigateRef.current = navigate;
    tokenRef.current = localStorage.getItem(TOKEN_KEY);

    if (requestInterceptorId === null) {
      requestInterceptorId = axiosSecure.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem(TOKEN_KEY);
          if (token) {
            config.headers.authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
    }

    if (responseInterceptorId === null) {
      responseInterceptorId = axiosSecure.interceptors.response.use(
        (response) => response,
        async (error) => {
          const status = error?.response?.status;
          if (status === 401 || status === 403) {
            if (typeof logOutRef.current === "function") {
              await logOutRef.current();
            }
            if (typeof navigateRef.current === "function") {
              navigateRef.current("/login");
            }
          }
          return Promise.reject(error);
        }
      );
    }
  }, [logOut, navigate, user?.email]);

  return axiosSecure;
};

export default useAxiosSecure;
