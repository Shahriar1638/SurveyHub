/* eslint-disable no-unused-vars */
import { useContext, useState, useEffect, useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { FaCrown } from "react-icons/fa";
import { IoShieldHalfOutline } from "react-icons/io5";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import { Button } from "../UI/Button";
import logo from "../../assets/logo.svg";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

// Guest nav links (visible to all visitors)
const GUEST_LINKS = [
  { name: "Home", path: "/" },
  { name: "Explore Surveys", path: "/surveys" },
  { name: "Blogs", path: "/blogs" },
  { name: "Pricing", path: "/pricing" },
  { name: "Feedback & Support", path: "/feedback" },
];

// Registered user nav links
const USER_LINKS = [
  { name: "Home", path: "/" },
  { name: "Explore Surveys", path: "/surveys" },
  { name: "Blogs", path: "/blogs" },
  { name: "Pricing", path: "/pricing" },
  { name: "Feedback & Support", path: "/feedback" },
  { name: "Dashboard", path: "/dashboard" },
];

// Surveyor nav links (same as user)
const SURVEYOR_LINKS = USER_LINKS;

// Admin nav links
const ADMIN_LINKS = [
  { name: "Home", path: "/" },
  { name: "Explore Surveys", path: "/surveys" },
  { name: "Blogs", path: "/blogs" },
  { name: "Dashboard", path: "/dashboard" },
];

// ── Role indicator pill shown next to avatar ──────────────────────────────────
// Admin:    navy shield badge
// Surveyor: accent-light pill with credit balance
// User:     no badge
const RoleIndicator = ({ role, user, isProfileLoading, creditBalance }) => {
  if (isProfileLoading || !user) return null;

  if (role === "admin") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-[--font-ui] uppercase tracking-wide"
        style={{ backgroundColor: "var(--color-primary)", color: "white" }}
        title="Administrator"
      >
        <IoShieldHalfOutline className="w-3 h-3" />
        Admin
      </span>
    );
  }

  if (role === "surveyor") {
    return (
      <span
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: "var(--color-accent-light)",
          border: "1px solid #F5CBA7",
        }}
        title="Surveyor — Credit Balance"
      >
        <FaCrown
          style={{ color: "var(--color-accent)" }}
          className="w-3 h-3"
        />
        {creditBalance !== null && (
          <span
            className="font-[--font-mono] text-xs font-bold"
            style={{ color: "var(--color-accent-dark)" }}
          >
            {creditBalance}
          </span>
        )}
      </span>
    );
  }

  // Regular user — no badge per spec
  return null;
};

export function Navbar() {
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const { data: profile, isPending: isProfileLoading } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(null);

  const role = profile?.role;
  const userId = profile?._id;
  const axiosSecure = useAxiosSecure();

  // Fetch credit balance only for surveyors
  useEffect(() => {
    if (role === "surveyor" && userId) {
      axiosSecure
        .get(`/api/payments/wallet/${userId}`)
        .then(({ data }) => {
          if (data?.success) setCreditBalance(data.data?.balance ?? 0);
          else setCreditBalance(0);
        })
        .catch((err) => {
          console.error("credit fetch error", err?.message || err);
          setCreditBalance(0);
        });
    }
  }, [role, userId, axiosSecure]);

  // Memoized role-based link selection
  const links = useMemo(() => {
    if (!user) return GUEST_LINKS;
    if (role === "admin") return ADMIN_LINKS;
    if (role === "surveyor") return SURVEYOR_LINKS;
    return USER_LINKS;
  }, [user, role]);

  const avatarInitial = (
    profile?.name || user?.displayName || user?.email || "?"
  )[0].toUpperCase();

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-[--color-border]"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="container-app mx-auto flex h-[64px] w-full items-center justify-between px-4">
        {/* ── Brand ── */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="SurveyHub"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span
            className="type-heading-sm hidden sm:block tracking-tight"
            style={{ color: "white" }}
          >
            SurveyHub
          </span>
        </Link>

        {/* ── Desktop Links ── */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                `relative px-3 py-1.5 rounded-lg text-sm font-medium font-[--font-ui] transition-colors ${
                  isActive
                    ? "text-white bg-white/15"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: "var(--color-accent)" }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* ── Auth Section ── */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Avatar + role indicator → profile link */}
              <Link
                to="/dashboard/my-profile"
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/10 transition-all"
              >
                {/* Role indicator */}
                <RoleIndicator
                  role={role}
                  user={user}
                  isProfileLoading={isProfileLoading}
                  creditBalance={creditBalance}
                />

                {/* Avatar */}
                {profile?.avatar || user.photoURL ? (
                  <img
                    src={profile?.avatar || user.photoURL}
                    alt={profile?.name || user.displayName || "avatar"}
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.3)" }}
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    {avatarInitial}
                  </div>
                )}

                {/* First name on large screens */}
                <span className="hidden lg:block text-sm font-medium text-white/90">
                  {(profile?.name || user.displayName || "User").split(" ")[0]}
                </span>
              </Link>

              <button
                onClick={() => logOut()}
                className="px-3 py-1.5 rounded-lg text-sm font-medium font-[--font-ui] text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <button className="px-3 py-1.5 rounded-lg text-sm font-medium font-[--font-ui] text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link to="/sign-up">
                <button
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold font-[--font-ui] transition-colors"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-accent-dark)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-accent)";
                  }}
                >
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          aria-label="Toggle menu"
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[64px] left-0 w-full border-b border-white/10 shadow-xl md:hidden"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <div className="p-4 flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `type-body-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard/my-profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {profile?.avatar || user.photoURL ? (
                        <img
                          src={profile?.avatar || user.photoURL}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: "var(--color-accent)" }}
                        >
                          {avatarInitial}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="type-meta text-white/80 truncate font-medium">
                          {profile?.name || user.displayName || user.email}
                        </span>
                        {!isProfileLoading && role && (
                          <span className="text-[10px] text-white/50 capitalize font-[--font-ui]">
                            {role}
                          </span>
                        )}
                      </div>
                    </Link>
                    <button
                      className="w-full px-3 py-2 rounded-lg text-sm font-medium font-[--font-ui] text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                      onClick={async () => {
                        try { await logOut(); } finally {
                          setMobileMenuOpen(false);
                          navigate("/");
                        }
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full px-3 py-2 rounded-lg text-sm font-medium font-[--font-ui] text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left">
                        Sign In
                      </button>
                    </Link>
                    <Link to="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                      <button
                        className="w-full px-4 py-2 rounded-lg text-sm font-semibold font-[--font-ui] transition-colors"
                        style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                      >
                        Get Started Free
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
