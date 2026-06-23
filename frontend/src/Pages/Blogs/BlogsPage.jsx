import { useEffect, useRef, useContext } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import { useBlogsInfinite } from "../../Hooks/useBlogs";
import { BlogCard, BlogCardSkeleton } from "../../Components/UI/BlogCard";
import { PageTransition } from "../../Components/UI/PageTransition";

export default function BlogsPage() {
  const { user } = useContext(AuthContext);
  const sentinelRef = useRef(null);

  // Fetch blogs using our custom infinite query hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useBlogsInfinite(5);

  // Flatten page query results
  const blogs = data?.pages.flatMap((page) => page.data) || [];

  // IntersectionObserver for infinite scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <PageTransition>
      {/* ── Page header ── */}
      <div className="border-b border-[--color-border] bg-[--color-bg-surface]">
        <div className="container-app mx-auto py-10 px-4">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
                style={{
                  backgroundColor: "var(--color-accent-light)",
                  color: "var(--color-accent-dark)",
                }}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI Insight Blogs
              </span>
              <h1 className="type-heading-xl text-[--color-text-primary]">
                Blogs
              </h1>
              <p className="type-body-base text-[--color-text-secondary] mt-1 max-w-xl">
                Explore insights published by our community of surveyors.
                Powered by real data and AI analysis.
              </p>
            </div>
            {!user && (
              <Link to="/login" className="btn btn-primary btn-md">
                Sign in to comment
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Feed ── */}
      <div className="container-app mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          {/* Loading Skeletons */}
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </>
          )}

          {/* Error View */}
          {isError && (
            <div className="card p-8 text-center">
              <p className="type-body-base text-[--color-error]">
                {error?.message || "Failed to load blogs"}
              </p>
              <button
                onClick={() => refetch()}
                className="btn btn-secondary btn-sm mt-4"
              >
                Retry
              </button>
            </div>
          )}

          {/* Blog Cards list */}
          <AnimatePresence>
            {blogs.map((blog, i) => (
              <BlogCard key={blog._id} blog={blog} index={i} />
            ))}
          </AnimatePresence>

          {/* Loading More Skeletons */}
          {isFetchingNextPage && (
            <>
              {[1, 2].map((i) => (
                <BlogCardSkeleton key={`load-${i}`} />
              ))}
            </>
          )}

          {/* Observer Sentinel Element */}
          <div ref={sentinelRef} className="h-2" />

          {/* End of Feed Indicator */}
          {!hasNextPage && blogs.length > 0 && !isFetchingNextPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[--color-bg-subtle]">
                <svg
                  className="w-4 h-4 text-[--color-text-tertiary]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="type-body-sm text-[--color-text-tertiary]">
                  You've reached the end
                </span>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && blogs.length === 0 && !isError && (
            <div className="empty-state py-24">
              <div className="empty-state-icon">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="type-heading-sm mt-3">No blogs published yet</h3>
              <p className="type-body-sm text-[--color-text-secondary] mt-1">
                Be the first to share an insight!
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
