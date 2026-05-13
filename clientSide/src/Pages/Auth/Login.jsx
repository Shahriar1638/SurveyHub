import { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { AuthContext } from '../../Firebase_AuthProvider/AuthProvider';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

const Login = () => {
  const { signInUser, logOut } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Firebase Auth
      await signInUser(formData.email, formData.password);

      // 2. Fetch User Data from Mongo & check status
      const dbResponse = await axiosPublic.post('/api/auth/login', { email: formData.email });

      if (dbResponse.status === 200) {
        const userData = dbResponse.data.user;
        
        // Save minimal needed data to localStorage (or you could use cookies/context properly later)
        localStorage.setItem('surveyhub-user', JSON.stringify(userData));

        navigate('/'); // Redirect to dashboard/home
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      // Rollback: if MongoDB login check fails (e.g., user is banned or doesn't exist), log them out of Firebase.
      await logOut().catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg-subtle">
      <div className="grid min-h-screen w-full overflow-hidden bg-[linear-gradient(135deg,var(--color-bg-surface)_0%,var(--color-bg-base)_58%,var(--color-visitor-light)_100%)] grid-cols-1 md:grid-cols-[1fr_3fr] lg:grid-cols-[3fr_2fr]">
        <aside className="order-2 hidden items-center justify-center bg-[linear-gradient(180deg,var(--color-bg-subtle)_0%,var(--color-user-light)_100%)] px-6 py-8 sm:px-10 sm:py-12 md:order-1 md:flex">
          <div className="w-full max-w-md space-y-4">
            <div className="card border-border bg-bg-surface p-5 shadow-md">
              <div className="space-y-3 md:block lg:hidden">
                <p className="type-label-sm uppercase tracking-[0.24em] text-text-tertiary">Access panel</p>
                <h1 className="type-heading-lg text-navy">Welcome back</h1>
                <p className="type-body-sm text-text-secondary">Resume your SurveyHub session.</p>
              </div>

              <div className="hidden lg:block">
                <p className="type-label-sm uppercase tracking-[0.24em] text-text-tertiary">Access panel</p>
                <h1 className="mt-3 type-heading-xl text-navy">Welcome back</h1>
                <p className="mt-3 type-body-base text-text-secondary">
                  Pick up where you left off and continue managing surveys, feedback, and roles.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
                <p className="type-meta-sm text-text-tertiary">Fast auth</p>
                <p className="mt-2 type-body-sm text-text-secondary">Firebase first.</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
                <p className="type-meta-sm text-text-tertiary">Role sync</p>
                <p className="mt-2 type-body-sm text-text-secondary">Mongo loads your profile.</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="order-1 flex items-center justify-center px-6 py-8 sm:px-10 sm:py-12 md:order-2 md:col-start-2 lg:order-2">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="type-label-sm uppercase tracking-[0.24em] text-text-tertiary">Sign in</p>
              <h2 className="mt-3 type-heading-xl text-navy">Log in to SurveyHub</h2>
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
                <label className="type-label-sm text-text-primary" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 type-body-base text-text-primary outline-none transition focus:border-visitor focus:ring-4 focus:ring-visitor-light"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="type-label-sm text-text-primary" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 type-body-base text-text-primary outline-none transition focus:border-visitor focus:ring-4 focus:ring-visitor-light"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-lg btn-primary mt-2 w-full justify-center"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <p className="mt-6 text-center type-body-sm text-text-secondary lg:text-left">
              Don&apos;t have an account?{' '}
              <Link to="/sign-up" className="font-medium text-visitor hover:underline">
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