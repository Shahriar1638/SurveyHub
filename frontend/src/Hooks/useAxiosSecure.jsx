import axios from "axios";
import { useNavigate } from "react-router";
import { useContext, useEffect, useRef } from "react";
import { AuthContext, TOKEN_KEY } from "../Firebase_AuthProvider/AuthProvider";

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let requestInterceptorId = null;
let responseInterceptorId = null;
let currentToken = localStorage.getItem(TOKEN_KEY);
let currentLogOut = null;
let currentNavigate = null;

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { logOut, user } = useContext(AuthContext);
  const tokenRef = useRef(localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    currentLogOut = logOut;
    currentNavigate = navigate;
    const token = localStorage.getItem(TOKEN_KEY);
    tokenRef.current = token;
    currentToken = token;

    if (requestInterceptorId === null) {
      requestInterceptorId = axiosSecure.interceptors.request.use(
        function (config) {
          if (currentToken) {
            config.headers.authorization = `Bearer ${currentToken}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    }

    if (responseInterceptorId === null) {
      responseInterceptorId = axiosSecure.interceptors.response.use(
        function (response) {
          return response;
        },
        async function (error) {
          const status = error?.response?.status;
          if (status === 401 || status === 403) {
            if (typeof currentLogOut === "function") {
              await currentLogOut();
            }
            if (typeof currentNavigate === "function") {
              currentNavigate("/login");
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
