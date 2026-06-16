import { useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { motion } from "motion/react";
import logo from "../../assets/logo.svg";

// Information for the 4 distinct user tiers
const ROLES_INFO = [
  {
    id: "visitor",
    name: "Visitor / Guest",
    color: "var(--color-visitor)",
    glowClass: "hover:border-visitor/40 hover:shadow-[0_0_15px_rgba(32,126,197,0.15)]",
    description: "Explore community surveys, view public analytics, and share your perspective.",
    icon: (
      <svg className="w-5 h-5 text-visitor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    id: "user",
    name: "Registered User",
    color: "var(--color-user)",
    glowClass: "hover:border-user/40 hover:shadow-[0_0_15px_rgba(246,119,36,0.15)]",
    description: "Vote on premium polls, keep a response history, and unlock profile rewards.",
    icon: (
      <svg className="w-5 h-5 text-user" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "surveyor",
    name: "Premium Surveyor",
    color: "var(--color-surveyor)",
    glowClass: "hover:border-surveyor/40 hover:shadow-[0_0_15px_rgba(91,188,234,0.15)]",
    description: "Design advanced surveys, use dynamic questions, and run AI Analytics labs.",
    icon: (
      <svg className="w-5 h-5 text-surveyor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    ),
  },
  {
    id: "admin",
    name: "System Admin",
    color: "var(--color-admin)",
    glowClass: "hover:border-admin/40 hover:shadow-[0_0_15px_rgba(219,55,37,0.15)]",
    description: "Moderate content, review flagged profiles, and manage system operations.",
    icon: (
      <svg className="w-5 h-5 text-admin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

// Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const formContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }
  }
};

const Login = () => {
  const { signInUser, logOut } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const message = location.state?.message;

  const onSubmit = async (values) => {
    try {
      await signInUser(values.email, values.password);

      const dbResponse = await axiosPublic.post("/api/auth/login", {
        email: values.email,
      });

      if (dbResponse.status === 200) {
        const userData = dbResponse.data.user;
        localStorage.setItem("surveyhub-user", JSON.stringify(userData));

        const from = location.state?.from;
        if (from) {
          navigate(from, { replace: true });
          return;
        }

        navigate("/", { replace: true });
      }
    } catch (err) {
      setFieldError("root", {
        message:
          err?.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials.",
      });
      await logOut().catch((logoutErr) => {
        console.error("Login rollback logout failed", logoutErr);
      });
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-bg-base">
      <div className="grid h-screen w-full grid-cols-1 md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.25fr_1fr] xl:grid-cols-[1.35fr_1fr]">
        
        {/* Left Aside Column — Beautiful visual gate showcasing 4 distinct roles */}
        <aside className="relative order-2 sticky top-0 hidden h-screen flex-col justify-between overflow-hidden bg-navy px-8 py-10 md:order-1 md:flex text-white">
          
          {/* Creative Role-Mesh Background Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:28px_28px] z-10" />
            
            {/* Blurring Blend Layer */}
            <div className="absolute inset-0 backdrop-blur-[100px] z-10" />

            {/* Glowing Blobs representing roles */}
            <div 
              className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-admin opacity-[0.32] blur-[80px]"
              style={{ animation: "float-1 16s infinite ease-in-out" }}
            />
            <div 
              className="absolute top-[20%] -right-24 w-[450px] h-[450px] rounded-full bg-surveyor opacity-[0.28] blur-[90px]"
              style={{ animation: "float-2 20s infinite ease-in-out" }}
            />
            <div 
              className="absolute -bottom-24 left-[20%] w-[500px] h-[500px] rounded-full bg-user opacity-[0.25] blur-[100px]"
              style={{ animation: "float-3 18s infinite ease-in-out" }}
            />
            <div 
              className="absolute top-[50%] left-[-10%] w-[380px] h-[380px] rounded-full bg-visitor opacity-[0.25] blur-[80px]"
              style={{ animation: "float-4 14s infinite ease-in-out" }}
            />
          </div>

          <style>{`
            @keyframes float-1 {
              0%, 100% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.12); }
              66% { transform: translate(-20px, 20px) scale(0.92); }
            }
            @keyframes float-2 {
              0%, 100% { transform: translate(0px, 0px) scale(1); }
              50% { transform: translate(-40px, 50px) scale(1.15); }
            }
            @keyframes float-3 {
              0%, 100% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(-20px, -30px) scale(0.88); }
              66% { transform: translate(45px, 25px) scale(1.1); }
            }
            @keyframes float-4 {
              0%, 100% { transform: translate(0px, 0px) scale(1); }
              50% { transform: translate(40px, -20px) scale(1.08); }
            }
          `}</style>

          {/* Floating Logo Medallion with slow hovering */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md self-start hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-md group"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-white/10">
              <img src={logo} alt="SurveyHub Logo" className="h-6.5 w-6.5 object-contain transition-transform duration-500 group-hover:rotate-[360deg]" />
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight text-white select-none">
              SurveyHub
            </span>
          </motion.div>

          {/* Main Title and Copy */}
          <div className="relative z-20 my-auto max-w-lg space-y-8 py-8">
            <motion.div 
              variants={titleVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.24em] bg-white/10 text-white/95 border border-white/5 backdrop-blur-sm">
                Access Gateway
              </span>
              <h1 className="type-heading-xl text-white font-extrabold tracking-tight leading-tight lg:type-display-lg">
                The gateway to <br />
                <span className="bg-gradient-to-r from-visitor via-surveyor to-user bg-clip-text text-transparent">survey intelligence</span>.
              </h1>
              <p className="type-body-base text-white/80 leading-relaxed max-w-md">
                Log in to connect with users, design intelligent feedback loops, and compile rich datasets powered by automated AI analytics.
              </p>
            </motion.div>

            {/* Interactive Roles Display */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-3 sm:grid-cols-2"
            >
              {ROLES_INFO.map((role) => (
                <motion.div
                  key={role.id}
                  variants={cardVariants}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 transition-all duration-300 backdrop-blur-md ${role.glowClass}`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none"
                    style={{ backgroundColor: role.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                        {role.icon}
                      </div>
                      <p className="type-label-sm font-semibold text-white/95 tracking-wide text-[13px]">{role.name}</p>
                    </div>
                    <p className="type-body-sm text-white/70 group-hover:text-white/90 transition-colors duration-300 text-[12px] leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer Copy */}
          <div className="relative z-20 text-[11px] font-medium text-white/50 tracking-wider font-mono">
            SURVEYHUB DASHBOARD SYSTEM v2.0
          </div>
        </aside>

        {/* Right Content Column — Interactive Card Form */}
        <main className="order-1 relative flex h-screen min-h-0 items-center justify-center overflow-y-auto bg-bg-base px-6 py-8 sm:px-10 sm:py-12 md:order-2 md:col-start-2 lg:order-2">
          
          {/* Elegant Back Navigation */}
          <Link
            to="/"
            className="group absolute top-6 left-6 flex items-center gap-2 type-body-sm font-semibold text-text-secondary transition-colors hover:text-navy sm:top-8 sm:left-8 z-20"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go to Home
          </Link>

          {/* Form Container */}
          <motion.div 
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 w-full max-w-md py-8 px-6 sm:px-8 overflow-hidden"
          >

            <div className="mb-6">
              <p className="type-label-sm uppercase tracking-[0.24em] text-text-tertiary">
                Sign In Portal
              </p>
              <h2 className="mt-2.5 type-heading-lg text-navy tracking-tight font-extrabold">
                Welcome Back
              </h2>
              <p className="mt-2 type-body-sm text-text-secondary leading-relaxed">
                Log in to resume your active SurveyHub sessions.
              </p>
            </div>

            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-success/20 bg-success-light px-4 py-3 type-body-sm text-success font-medium"
              >
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message}
              </motion.div>
            )}

            {errors.root && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-error/20 bg-error-light px-4 py-3 type-body-sm text-error font-medium"
              >
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.root.message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="type-label-sm text-text-primary text-[13px]"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-visitor focus:ring-4 focus:ring-visitor-light/30 shadow-xs placeholder:text-text-tertiary"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-error">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  className="type-label-sm text-text-primary text-[13px]"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-visitor focus:ring-4 focus:ring-visitor-light/30 shadow-xs placeholder:text-text-tertiary"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-error">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-lg btn-primary mt-3 w-full justify-center shadow-md font-semibold cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-border pt-5">
              <p className="type-body-sm text-text-secondary">
                Don&apos;t have an account yet?{" "}
                <Link
                  to="/sign-up"
                  className="font-bold text-visitor hover:text-visitor-dark hover:underline transition"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Login;
