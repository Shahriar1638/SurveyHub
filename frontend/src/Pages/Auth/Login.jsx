import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";

const Login = () => {
  const { signInUser, logOut } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Firebase Auth
      await signInUser(formData.email, formData.password);

      // 2. Fetch User Data from Mongo & check status
      const dbResponse = await axiosPublic.post("/api/auth/login", {
        email: formData.email,
      });

      if (dbResponse.status === 200) {
        const userData = dbResponse.data.user;

        // Save minimal needed data to localStorage
        localStorage.setItem("surveyhub-user", JSON.stringify(userData));

        // 3. Role-based redirect
        // Honour the "from" location if the user was sent here by a protected route
        const from = location.state?.from;
        if (from) {
          navigate(from, { replace: true });
          return;
        }

        // Role-based content is now handled internally by the Home component at "/"
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials.",
      );
      // Rollback: if MongoDB login check fails (e.g., user is banned or doesn't exist), log them out of Firebase.
      await logOut().catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-bg-subtle">
      <div className="grid h-screen w-full bg-[linear-gradient(135deg,var(--color-bg-surface)_0%,var(--color-bg-base)_58%,var(--color-visitor-light)_100%)] grid-cols-1 md:grid-cols-[1fr_3fr] lg:grid-cols-[3fr_2fr]">
        <aside className="order-2 sticky top-0 hidden h-screen items-center justify-center overflow-hidden bg-user px-6 py-8 sm:px-10 sm:py-12 md:order-1 md:flex">
          <div className="w-full max-w-md space-y-4">
            <div className="card border-white/20 bg-white/10 p-5 shadow-md backdrop-blur-sm">
              <div className="space-y-3 md:block lg:hidden">
                <p className="type-label-sm uppercase tracking-[0.24em] text-user/70">
                  Access panel
                </p>
                <h1 className="type-heading-lg text-user">Welcome back</h1>
                <p className="type-body-sm text-user/90">
                  Resume your SurveyHub session.
                </p>
              </div>

              <div className="hidden lg:block">
                <p className="type-label-sm uppercase tracking-[0.24em] text-user/70">
                  Access panel
                </p>
                <h1 className="mt-3 type-heading-xl text-user">Welcome back</h1>
                <p className="mt-3 type-body-base text-user/90">
                  Pick up where you left off and continue managing surveys,
                  feedback, and roles.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                <p className="type-meta-sm text-white/70">Fast auth</p>
                <p className="mt-2 type-body-sm text-white/90">
                  Firebase first.
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                <p className="type-meta-sm text-white/70">Role sync</p>
                <p className="mt-2 type-body-sm text-white/90">
                  Mongo loads your profile.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="order-1 flex h-screen min-h-0 items-center justify-center overflow-y-auto px-6 py-8 sm:px-10 sm:py-12 md:order-2 md:col-start-2 lg:order-2 relative">
          {/* Go to Home Link */}
          <Link
            to="/"
            className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 type-body-sm font-medium text-text-secondary hover:text-navy transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go to Home
          </Link>

          <div className="w-full max-w-md py-2 mt-8 sm:mt-0">
            <div className="mb-8 text-center lg:text-left">
              <p className="type-label-sm uppercase tracking-[0.24em] text-text-tertiary">
                Sign in
              </p>
              <h2 className="mt-3 type-heading-xl text-navy">
                Log in to SurveyHub
              </h2>
              <p className="mt-3 type-body-base text-text-secondary">
                Use your Firebase account, then we’ll load your Mongo profile.
              </p>
            </div>

            {message && (
              <div className="mb-5 rounded-xl border border-success/20 bg-success-light px-4 py-3 type-body-sm text-success">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-5 rounded-xl border border-error/20 bg-error-light px-4 py-3 type-body-sm text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  className="type-label-sm text-text-primary"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 type-body-base text-text-primary outline-none transition focus:border-visitor focus:ring-4 focus:ring-visitor-light"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  className="type-label-sm text-text-primary"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 type-body-base text-text-primary outline-none transition focus:border-visitor focus:ring-4 focus:ring-visitor-light"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-lg mt-2 w-full justify-center bg-user text-white hover:bg-[#d9651c]"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <p className="mt-6 text-center type-body-sm text-text-secondary lg:text-left">
              Don&apos;t have an account?{" "}
              <Link
                to="/sign-up"
                className="font-medium text-user hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
