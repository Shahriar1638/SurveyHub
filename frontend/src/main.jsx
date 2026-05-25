import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Routes from "./Router/Routes";
import AuthProvider from "./Firebase_AuthProvider/AuthProvider.jsx";
import { RouterProvider } from "react-router";
import { ThreeDot } from "react-loading-indicators";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <ThreeDot color="#32cd32" size="medium" text="" textColor="" />
            </div>
          }
        >
          <RouterProvider router={Routes} />
        </Suspense>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);
