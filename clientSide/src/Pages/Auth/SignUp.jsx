import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';
import { AuthContext } from '../../Firebase_AuthProvider/AuthProvider';
import useAxiosPublic from '../../Hooks/useAxiosPublic';

const SignUp = () => {
  const { createUser, logOut } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    let firebaseUser = null;
    try {
      // 1. Firebase Auth
      const result = await createUser(formData.email, formData.password);
      firebaseUser = result.user;

      // 2. MongoDB Auth
      const dbPayload = {
        name: formData.name,
        email: formData.email,
        avatar: '',
      };

      const dbResponse = await axiosPublic.post('/api/auth/sign-up', dbPayload);

      if (dbResponse.status === 201) {
        // Success for both.
        // Wait, User should log in now or we redirect to login
        await logOut(); // Sign them out of firebase so they log in officially via the login page
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed.');
      // Rollback: If mongo failed but firebase succeeded, delete the user from firebase
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
        } catch (rollbackErr) {
          console.error("Failed to rollback firebase user:", rollbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg-base">
      <div className="grid min-h-screen w-full overflow-hidden bg-bg-surface grid-cols-1 md:grid-cols-[1fr_3fr] lg:grid-cols-[3fr_2fr]">
        <aside className="hidden flex-col justify-between bg-navy px-6 py-8 text-text-inverse sm:px-10 sm:py-10 md:flex">
          <div className="space-y-8">
            <div className="space-y-4 md:block lg:hidden">
              <p className="type-label-sm uppercase tracking-[0.28em] text-visitor-light/80">SurveyHub</p>
              <h1 className="max-w-xs type-heading-lg text-text-inverse">
                Welcome to a calmer way to manage surveys.
              </h1>
              <p className="max-w-xs type-body-sm text-text-inverse/75">
                Create your account and start in a space designed to feel clear, warm, and easy to use.
              </p>
            </div>

            <div className="hidden lg:block">
              <p className="type-label-sm uppercase tracking-[0.28em] text-visitor-light/80">SurveyHub</p>
              <h1 className="mt-4 max-w-md type-heading-xl text-text-inverse sm:type-display-lg">
                Welcome to a thoughtful home for your surveys.
              </h1>
              <p className="mt-4 max-w-md type-body-lg text-text-inverse/80">
                Join a platform that keeps onboarding simple, navigation calm, and collaboration easy from the start.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="type-meta-sm text-visitor-light/90">Simple start</p>
                <p className="mt-2 type-body-base text-text-inverse/90">A smooth signup flow to get you moving quickly.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="type-meta-sm text-visitor-light/90">Built for growth</p>
                <p className="mt-2 type-body-base text-text-inverse/90">Everything stays ready for your survey journey.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="type-label-sm text-text-inverse/70">Ready when you are</p>
            <p className="mt-2 type-body-sm text-text-inverse/85">
              A clean, welcoming entry point that matches the rest of your refreshed SurveyHub experience.
            </p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-6 py-8 sm:px-10 sm:py-12 md:col-start-2">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="type-label-sm uppercase tracking-[0.24em] text-text-tertiary">Create account</p>
              <h2 className="mt-3 type-heading-xl text-navy">Join SurveyHub</h2>
              <p className="mt-3 type-body-base text-text-secondary">
                Create your account to continue into the platform.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-error/20 bg-error-light px-4 py-3 type-body-sm text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="type-label-sm text-text-primary" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 type-body-base text-text-primary outline-none transition focus:border-visitor focus:ring-4 focus:ring-visitor-light"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

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

              <div className="space-y-2">
                <label className="type-label-sm text-text-primary" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 type-body-base text-text-primary outline-none transition focus:border-visitor focus:ring-4 focus:ring-visitor-light"
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-lg btn-primary mt-2 w-full justify-center"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-6 text-center type-body-sm text-text-secondary lg:text-left">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-visitor hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SignUp;