import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import { Button } from "../UI/Button";
import logo from "../../assets/logo.svg";

// Guest nav links (visible to all visitors)
const GUEST_LINKS = [
  { name: "Home", path: "/" },
  { name: "Explore Surveys", path: "/surveys" },
  { name: "Blogs", path: "/blogs" },
  { name: "Pricings", path: "/pricing" },
  { name: "About Us", path: "/about" },
];

// Registered user nav links
const USER_LINKS = [
  { name: "Home", path: "/" },
  { name: "Explore Surveys", path: "/surveys" },
  { name: "Blogs", path: "/blogs" },
  { name: "Survey Drafts", path: "/drafts" },
  { name: "Pricings", path: "/pricing" },
  { name: "About Us", path: "/about" },
];

// Surveyor nav links
const SURVEYOR_LINKS = [
  { name: "Home", path: "/" },
  { name: "Explore Surveys", path: "/surveys" },
  { name: "Blogs", path: "/blogs" },
  { name: "Survey Drafts", path: "/drafts" },
  { name: "Pricings", path: "/pricing" },
  { name: "About Us", path: "/about" },
  { name: "Dashboard", path: "/dashboard" },
];

// Admin nav links
const ADMIN_LINKS = [
  { name: "Home", path: "/" },
  { name: "Explore Surveys", path: "/surveys" },
  { name: "Blogs", path: "/blogs" },
  { name: "Survey Drafts", path: "/drafts" },
  { name: "Dashboard", path: "/dashboard" },
];

export function Navbar() {
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const { data: profile, isPending: isProfileLoading } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = profile?.role;

  // Role-based link selection
  const getLinks = () => {
    if (!user) return GUEST_LINKS;
    if (role === "admin") return ADMIN_LINKS;
    if (role === "surveyor") return SURVEYOR_LINKS;
    return USER_LINKS;
  };

  // Role accent color for active indicator
  const getRoleAccent = () => {
    if (!user) return "var(--color-visitor)";
    if (role === "admin") return "var(--color-admin)";
    if (role === "surveyor") return "var(--color-surveyor)";
    return "var(--color-user)";
  };

  const links = getLinks();
  const accentColor = getRoleAccent();

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-[--color-border] backdrop-blur-md"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-bg-primary) 85%, transparent)",
      }}
    >
      <div className="container-app mx-auto flex h-[64px] w-full items-center justify-between px-4">
        {/* ── Brand ── */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="SurveyHub"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="type-heading-sm hidden sm:block text-[--color-text-primary] tracking-tight">
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
                    ? "text-[--color-text-primary] bg-[--color-bg-subtle]"
                    : "text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-subtle]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
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
              {/* Role pill */}
              {!isProfileLoading && (
                <span
                  className="type-meta px-2 py-0.5 rounded-full text-xs font-semibold uppercase"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                    color: accentColor,
                  }}
                >
                  {role || "Member"}
                </span>
              )}

              {/* Avatar / Name / Link to Profile */}
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {profile?.avatar || user.photoURL ? (
                  <img
                    src={profile?.avatar || user.photoURL}
                    alt={profile?.name || user.displayName || "avatar"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[--color-border]"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {(profile?.name ||
                      user.displayName ||
                      user.email ||
                      "?")[0].toUpperCase()}
                  </div>
                )}
                {/* First name on large screen */}
                <span className="hidden lg:block text-sm font-medium text-[--color-text-primary]">
                  {(profile?.name || user.displayName || "User").split(" ")[0]}
                </span>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await logOut();
                  } finally {
                    navigate("/");
                  }
                }}
              >
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          aria-label="Toggle menu"
          className="md:hidden p-2 rounded-lg text-[--color-text-secondary] hover:bg-[--color-bg-subtle] transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
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
            className="absolute top-[64px] left-0 w-full bg-[--color-bg-primary] border-b border-[--color-border] shadow-xl md:hidden"
          >
            <div className="p-4 flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `type-body-sm font-medium px-3 py-2.5 rounded-lg ${
                      isActive
                        ? "bg-[--color-bg-subtle] text-[--color-text-primary]"
                        : "text-[--color-text-secondary] hover:bg-[--color-bg-subtle]"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="mt-3 pt-3 border-t border-[--color-border] flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1 hover:bg-[--color-bg-subtle] rounded-lg transition-colors"
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
                          style={{ backgroundColor: accentColor }}
                        >
                          {(profile?.name ||
                            user.displayName ||
                            user.email ||
                            "?")[0].toUpperCase()}
                        </div>
                      )}
                      <span className="type-meta text-[--color-text-tertiary] truncate">
                        {profile?.name || user.displayName || user.email}
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={async () => {
                        try {
                          await logOut();
                        } finally {
                          setMobileMenuOpen(false);
                          navigate("/");
                        }
                      }}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      to="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="primary" className="w-full">
                        Get Started Free
                      </Button>
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
