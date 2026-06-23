/* eslint-disable no-unused-vars */
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router';
import { AuthContext } from '../../Firebase_AuthProvider/AuthProvider';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { useForm } from 'react-hook-form';
import { motion } from "motion/react";
import logo from "../../assets/logo.svg";

// Information for the 4 distinct user tiers
const ROLES_INFO = [
  {
    id: "visitor",
    name: "Visitor / Guest",
    color: "var(--color-accent)",
    glowClass: "hover:border-accent/40 hover:shadow-[0_0_15px_rgba(32,126,197,0.15)]",
    description: "Explore community surveys, view public analytics, and share your perspective.",
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    id: "user",
    name: "Registered User",
    color: "var(--color-accent)",
    glowClass: "hover:border-accent/40 hover:shadow-[0_0_15px_rgba(246,119,36,0.15)]",
    description: "Vote on premium polls, keep a response history, and unlock profile rewards.",
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "surveyor",
    name: "Premium Surveyor",
    color: "var(--color-accent)",
    glowClass: "hover:border-accent/40 hover:shadow-[0_0_15px_rgba(91,188,234,0.15)]",
    description: "Design advanced surveys, use dynamic questions, and run AI Analytics labs.",
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    ),
  },
  {
    id: "admin",
    name: "System Admin",
    color: "var(--color-error)",
    glowClass: "hover:border-error/40 hover:shadow-[0_0_15px_rgba(219,55,37,0.15)]",
    description: "Moderate content, review flagged profiles, and manage system operations.",
    icon: (
      <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

const SignUp = () => {
  const { createUser, logOut } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const [avatarFile, setAvatarFile] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      location: '',
      occupation: '',
      twitter: '',
      linkedin: '',
      website: '',
      preferences: '',
    },
  });
  const password = watch('password');

  const uploadAvatar = async () => {
    if (!avatarFile) {
      return '';
    }

    const imageData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read avatar image.'));
      reader.readAsDataURL(avatarFile);
    });

    const response = await axiosPublic.post('/api/auth/upload-avatar', {
      image: imageData,
    });

    return response.data.url;
  };

  const onSubmit = async (values) => {
    let firebaseUser = null;
    try {
      const avatarUrl = await uploadAvatar();

      // 1. Firebase Auth
      const result = await createUser(values.email, values.password);
      firebaseUser = result.user;

      // 2. MongoDB Auth
      const dbPayload = {
        name: values.name,
        email: values.email,
        avatar: avatarUrl,
        bio: values.bio,
        location: values.location,
        occupation: values.occupation,
        socialLinks: {
          twitter: values.twitter,
          linkedin: values.linkedin,
          website: values.website,
        },
        preferences: values.preferences
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const dbResponse = await axiosPublic.post('/api/auth/sign-up', dbPayload);

      if (dbResponse.status === 201) {
        await logOut();
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      }
    } catch (err) {
      setError('root', {
        message: err?.response?.data?.message || err.message || 'Registration failed.',
      });
      if (firebaseUser) {
        try {
          await firebaseUser.delete();
        } catch (rollbackErr) {
          console.error("Failed to rollback firebase user:", rollbackErr);
          // Firebase delete requires recent auth — inform user to contact support
          Swal.fire({
            title: 'Account Partially Created',
            text: 'Your email is registered but profile setup failed. Please contact support to complete registration.',
            icon: 'warning',
            confirmButtonColor: '#2D9FCF',
          });
        }
      }
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-bg-base">
      <div className="grid h-screen w-full grid-cols-1 md:grid-cols-[1.1fr_1fr] lg:grid-cols-[1.25fr_1fr] xl:grid-cols-[1.35fr_1fr]">
        
        {/* Left Aside Column — Beautiful visual gate showcasing 4 distinct roles */}
        <aside className="relative order-2 sticky top-0 hidden h-screen flex-col justify-between overflow-hidden bg-primary px-8 py-10 md:order-1 md:flex text-white">
          
          {/* Creative Role-Mesh Background Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:28px_28px] z-10" />
            
            {/* Blurring Blend Layer */}
            <div className="absolute inset-0 backdrop-blur-[100px] z-10" />

            {/* Glowing Blobs representing roles */}
            <div 
              className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-error opacity-[0.32] blur-[80px]"
              style={{ animation: "float-1 16s infinite ease-in-out" }}
            />
            <div 
              className="absolute top-[20%] -right-24 w-[450px] h-[450px] rounded-full bg-accent opacity-[0.28] blur-[90px]"
              style={{ animation: "float-2 20s infinite ease-in-out" }}
            />
            <div 
              className="absolute -bottom-24 left-[20%] w-[500px] h-[500px] rounded-full bg-accent opacity-[0.25] blur-[100px]"
              style={{ animation: "float-3 18s infinite ease-in-out" }}
            />
            <div 
              className="absolute top-[50%] left-[-10%] w-[380px] h-[380px] rounded-full bg-accent opacity-[0.25] blur-[80px]"
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
                Get Started
              </span>
              <h1 className="type-heading-xl text-white font-extrabold tracking-tight leading-tight lg:type-display-lg">
                Start your <br />
                <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">data journey here</span>.
              </h1>
              <p className="type-body-base text-white/80 leading-relaxed max-w-md">
                Create your SurveyHub profile to design deep insights campaigns, engage with premium voters, and generate advanced analytics.
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
            SURVEYHUB ONBOARDING SYSTEM v2.0
          </div>
        </aside>

        {/* Right Content Column — Interactive Card Form */}
        <main className="order-1 relative flex h-screen min-h-0 items-start justify-center overflow-y-auto bg-bg-base px-6 py-8 sm:px-10 sm:py-12 md:order-2 md:col-start-2 lg:order-2">
          
          {/* Elegant Back Navigation */}
          <Link
            to="/"
            className="group absolute top-6 left-6 flex items-center gap-2 type-body-sm font-semibold text-text-secondary transition-colors hover:text-primary sm:top-8 sm:left-8 z-20"
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
            className="relative z-10 w-full max-w-md py-8 px-6 sm:px-8 overflow-hidden mt-8 sm:mt-0"
          >

            <div className="mb-6">
              <p className="type-label-sm uppercase tracking-[0.24em] text-text-tertiary">
                Registration Gate
              </p>
              <h2 className="mt-2.5 type-heading-lg text-primary tracking-tight font-extrabold">
                Join SurveyHub
              </h2>
              <p className="mt-2 type-body-sm text-text-secondary leading-relaxed">
                Create a secure credentials profile and define your metadata fields.
              </p>
            </div>

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
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="type-label-sm text-text-primary text-[13px]" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-error">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="type-label-sm text-text-primary text-[13px]" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                  {...register('email', { required: 'Email is required' })}
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

              {/* Password */}
              <div className="space-y-1.5">
                <label className="type-label-sm text-text-primary text-[13px]" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                  {...register('password', { required: 'Password is required' })}
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="type-label-sm text-text-primary text-[13px]" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match.',
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-error">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Grid Layout for Metadata Fields */}
              <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-border mt-5">
                
                {/* Profile Image Avatar File */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="type-label-sm text-text-primary text-[13px]" htmlFor="avatar">Profile Image</label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2.5 type-body-xs text-text-secondary outline-none transition duration-200 file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:type-label-sm file:text-white hover:file:bg-accent-dark file:cursor-pointer focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 2 * 1024 * 1024) {
                        Swal.fire({
                          icon: 'error',
                          title: 'Image too large',
                          text: 'Avatar must be under 2MB.',
                          confirmButtonColor: '#2D9FCF',
                        });
                        e.target.value = '';
                        return;
                      }
                      setAvatarFile(file);
                    }}
                  />
                  <p className="text-[11px] leading-relaxed text-text-tertiary">
                    Upload a square PNG/JPG. We will host and reference it in your Mongo details.
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="type-label-sm text-text-primary text-[13px]" htmlFor="bio">Profile Bio</label>
                  <textarea
                    id="bio"
                    rows="2.5"
                    placeholder="A short intro about your background or role interests..."
                    className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary resize-none"
                    {...register('bio')}
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="type-label-sm text-text-primary text-[13px]" htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    placeholder="Dhaka, BD"
                    className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                    {...register('location')}
                  />
                </div>

                {/* Occupation */}
                <div className="space-y-1.5">
                  <label className="type-label-sm text-text-primary text-[13px]" htmlFor="occupation">Occupation</label>
                  <input
                    id="occupation"
                    type="text"
                    placeholder="Researcher, Dev..."
                    className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                    {...register('occupation')}
                  />
                </div>

                {/* Twitter Link */}
                <div className="space-y-1.5">
                  <label className="type-label-sm text-text-primary text-[13px]" htmlFor="twitter">Twitter URL</label>
                  <input
                    id="twitter"
                    type="url"
                    placeholder="https://twitter.com/..."
                    className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                    {...register('twitter')}
                  />
                </div>

                {/* LinkedIn Link */}
                <div className="space-y-1.5">
                  <label className="type-label-sm text-text-primary text-[13px]" htmlFor="linkedin">LinkedIn URL</label>
                  <input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                    {...register('linkedin')}
                  />
                </div>

                {/* Personal Website */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="type-label-sm text-text-primary text-[13px]" htmlFor="website">Website Link</label>
                  <input
                    id="website"
                    type="url"
                    placeholder="https://your-site.com"
                    className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                    {...register('website')}
                  />
                </div>

                {/* Preferences */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="type-label-sm text-text-primary text-[13px]" htmlFor="preferences">Preferences</label>
                  <input
                    id="preferences"
                    type="text"
                    placeholder="survey design, feedback, analytics..."
                    className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 type-body-sm text-text-primary outline-none transition duration-200 focus:border-accent focus:ring-4 focus:ring-accent-light/30 shadow-xs placeholder:text-text-tertiary"
                    {...register('preferences')}
                  />
                  <p className="text-[11px] leading-relaxed text-text-tertiary">
                    Comma-separated list of interests/preferences to build your feed.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-lg btn-primary mt-4 w-full justify-center shadow-md font-semibold cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-border pt-5">
              <p className="type-body-sm text-text-secondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-bold text-accent hover:text-accent-dark hover:underline transition"
                >
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SignUp;