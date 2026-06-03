import { useState, useContext, useMemo } from "react";
import { Link, useNavigate, Outlet, NavLink, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";
import useProfile from "../Hooks/useProfile";
import logo from "../assets/logo.svg";

import {
  HomeIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  MegaphoneIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLeftIcon,
  BeakerIcon,
  PencilSquareIcon,
  InboxIcon,
  Bars3Icon,
  DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// ── Sidebar nav definitions ──────────────────────────────────────────────────
const ADMIN_NAV = [
  { group: "OVERVIEW", items: [
    { name: "Overview", icon: HomeIcon, id: "overview" },
  ]},
  { group: "MANAGEMENT", items: [
    { name: "Moderation", icon: ShieldCheckIcon, id: "moderation" },
    { name: "Audit Logs", icon: DocumentMagnifyingGlassIcon, id: "audit-logs" },
    { name: "Broadcasts", icon: MegaphoneIcon, id: "broadcasts" },
    { name: "Feedback", icon: ChatBubbleLeftEllipsisIcon, id: "feedback" },
  ]},
];

const SURVEYOR_NAV = [
  { group: "OVERVIEW", items: [
    { name: "Overview", icon: HomeIcon, id: "overview" },
  ]},
  { group: "MANAGEMENT", items: [
    { name: "My Surveys", icon: ClipboardDocumentListIcon, id: "surveys" },
    { name: "AI Analytics", icon: BeakerIcon, id: "analytics" },
    { name: "Blog Studio", icon: PencilSquareIcon, id: "blog-studio" },
    { name: "Feedback Inbox", icon: InboxIcon, id: "feedback-inbox" },
  ]},
];

const USER_NAV = [
  { group: "OVERVIEW", items: [
    { name: "Overview", icon: HomeIcon, id: "overview" },
  ]},
  { group: "MY ACTIVITY", items: [
    { name: "Participation Ledger", icon: ClipboardDocumentListIcon, id: "participation" },
    { name: "Report Status", icon: ShieldCheckIcon, id: "reports" },
    { name: "Support Tickets", icon: ChatBubbleLeftEllipsisIcon, id: "support" },
  ]},
];

// ── Sidebar nav item ─────────────────────────────────────────────────────────
function NavItem({ item, accentColor, accentLight, onNav }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.id}
      end={item.id === "overview"}
      onClick={onNav}
      className={({ isActive }) =>
        `group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-[--font-ui] transition-all duration-200 ease-[var(--ease-out-expo)] ${
          isActive
            ? ""
            : "text-[--color-text-secondary] hover:text-[--color-text-primary]"
        }`
      }
      style={({ isActive }) =>
        isActive
          ? { backgroundColor: accentLight, color: accentColor }
          : undefined
      }
    >
      {({ isActive }) => (
        <>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
            style={
              isActive
                ? { backgroundColor: accentColor, color: "white" }
                : undefined
            }
          >
            <Icon
              className="w-[18px] h-[18px]"
              style={!isActive ? { color: "var(--color-text-tertiary)" } : undefined}
            />
          </div>
          <span className="truncate">{item.name}</span>
          {isActive && (
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: accentColor }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

// ── Main layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop();

  const role = profile?.role;

  const navGroups = useMemo(() => {
    if (role === "admin") return ADMIN_NAV;
    if (role === "surveyor") return SURVEYOR_NAV;
    if (role === "user") return USER_NAV;
    return [];
  }, [role]);

  const accentColor = useMemo(() => {
    if (role === "admin") return "var(--color-admin)";
    if (role === "surveyor") return "var(--color-surveyor-dark)";
    return "var(--color-user)";
  }, [role]);

  const accentLight = useMemo(() => {
    if (role === "admin") return "var(--color-admin-light)";
    if (role === "surveyor") return "var(--color-surveyor-light)";
    return "var(--color-user-light)";
  }, [role]);

  // ── Sidebar content (shared between desktop & mobile) ──────────────────────
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Workspace header */}
      <div className="px-5 pt-6 pb-5">
        <Link to="/" className="flex items-center gap-3 mb-5 group/logo">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accentLight }}>
            <img src={logo} alt="SurveyHub" className="h-5 w-5 object-cover" />
          </div>
          <span className="type-heading-sm text-[--color-text-primary] tracking-tight text-base">
            SurveyHub
          </span>
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[--color-bg-subtle]/60">
          {profile?.avatar || user?.photoURL ? (
            <img
              src={profile?.avatar || user?.photoURL}
              alt=""
              className="w-9 h-9 rounded-full object-cover shrink-0"
              style={{ boxShadow: `0 0 0 2px ${accentLight}` }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {(profile?.name || user?.displayName || user?.email || "?")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="type-label-sm text-[--color-text-primary] truncate text-sm leading-tight">
              {profile?.name || user?.displayName || "User"}
            </p>
            <p className="text-[11px] font-[--font-ui] text-[--color-text-tertiary] truncate capitalize leading-tight mt-0.5">
              {role || "Member"}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-[--color-border]" />

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2.5 text-[10px] font-semibold font-[--font-ui] text-[--color-text-tertiary] uppercase tracking-[0.1em]">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  accentColor={accentColor}
                  accentLight={accentLight}
                  onNav={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mx-5 h-px bg-[--color-border]" />
      <div className="px-3 py-4 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-[--font-ui] text-[--color-text-secondary] hover:text-[--color-text-primary] transition-all duration-200 ease-[var(--ease-out-expo)]"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-bg-subtle)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <ArrowLeftIcon className="w-[18px] h-[18px] text-[--color-text-tertiary]" />
          </div>
          Back to Site
        </button>
        <button
          onClick={async () => {
            try { await logOut(); } finally { navigate("/"); }
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-[--font-ui] text-[--color-text-secondary] hover:text-[--color-error] transition-all duration-200 ease-[var(--ease-out-expo)]"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-error-light)";
            e.currentTarget.style.color = "var(--color-error)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-text-secondary)";
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <ArrowLeftStartOnRectangleIcon className="w-[18px] h-[18px] text-[--color-text-tertiary]" />
          </div>
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[--color-bg-base] overflow-hidden">
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[--color-bg-surface] flex-col shrink-0" style={{ boxShadow: "1px 0 0 0 var(--color-border), 4px 0 12px -4px rgba(0,0,0,0.04)" }}>
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-full w-64 bg-[--color-bg-surface] z-50 lg:hidden"
              style={{ boxShadow: "4px 0 24px -4px rgba(0,0,0,0.12)" }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center h-14 px-4 border-b border-[--color-border] bg-[--color-bg-surface] shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-[--color-text-secondary] hover:bg-[--color-bg-subtle] transition-colors"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <img src={logo} alt="" className="h-6 w-6 rounded" />
            <span className="type-label-sm text-[--color-text-primary]">Dashboard</span>
          </div>
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-app mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
