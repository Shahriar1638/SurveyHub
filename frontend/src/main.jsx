import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Routes from "./Router/Routes";
import AuthProvider from "./Firebase_AuthProvider/AuthProvider.jsx";
import { RouterProvider } from "react-router";
import { LoadingPage } from "./Components/UI/LoadingSpinner";
import ErrorBoundary from "./Components/ErrorBoundary";
import { initChunkLoadErrorHandler } from "./utils/chunkLoadErrorHandler";

initChunkLoadErrorHandler();

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
        <ErrorBoundary>
          <Suspense fallback={<LoadingPage />}>
            <RouterProvider router={Routes} />
          </Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);
