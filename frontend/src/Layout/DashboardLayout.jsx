import { useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router";
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
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  BeakerIcon,
  PencilSquareIcon,
  InboxIcon,
  Bars3Icon,
  XMarkIcon,
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
function NavItem({ item, isActive, onClick, accentColor, accentLight }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-[--font-ui] transition-all duration-150 ${
        isActive
          ? "border-l-2"
          : "text-[--color-text-secondary] hover:bg-[--color-bg-subtle] hover:text-[--color-text-primary] border-l-2 border-transparent"
      }`}
      style={
        isActive
          ? {
              backgroundColor: accentLight,
              color: accentColor,
              borderLeftColor: accentColor,
            }
          : undefined
      }
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="truncate">{item.name}</span>
    </button>
  );
}

// ── Main layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({ children, activeSection, onSectionChange }) {
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const roleLabel = role === "admin" ? "Administrator" : role === "surveyor" ? "Surveyor" : "User";

  // ── Sidebar content (shared between desktop & mobile) ──────────────────────
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Workspace header */}
      <div className="px-5 pt-5 pb-4 border-b border-[--color-border]">
        <Link to="/" className="flex items-center gap-2.5 mb-4">
          <img src={logo} alt="SurveyHub" className="h-7 w-7 rounded-md object-cover" />
          <span className="type-heading-sm text-[--color-text-primary] tracking-tight text-base">
            SurveyHub
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {profile?.avatar || user?.photoURL ? (
            <img
              src={profile?.avatar || user?.photoURL}
              alt=""
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[--color-border] shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {(profile?.name || user?.displayName || user?.email || "?")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="type-label-sm text-[--color-text-primary] truncate text-sm">
              {profile?.name || user?.displayName || "User"}
            </p>
            <span
              className="badge text-[10px] mt-0.5"
              style={{ backgroundColor: accentLight, color: accentColor }}
            >
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-[10px] font-semibold font-[--font-ui] text-[--color-text-tertiary] uppercase tracking-[0.08em]">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={(id) => {
                    onSectionChange?.(id);
                    setMobileOpen(false);
                  }}
                  accentColor={accentColor}
                  accentLight={accentLight}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-[--color-border] space-y-0.5">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-[--font-ui] text-[--color-text-secondary] hover:bg-[--color-bg-subtle] hover:text-[--color-text-primary] transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 shrink-0" />
          Back to Site
        </button>
        <button
          onClick={async () => {
            try { await logOut(); } finally { navigate("/"); }
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-[--font-ui] text-[--color-text-secondary] hover:bg-[--color-bg-subtle] hover:text-[--color-error] transition-colors"
        >
          <ArrowLeftStartOnRectangleIcon className="w-5 h-5 shrink-0" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[--color-bg-base] overflow-hidden">
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[--color-bg-surface] border-r border-[--color-border] flex-col shrink-0">
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
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-full w-64 bg-[--color-bg-surface] border-r border-[--color-border] z-50 lg:hidden shadow-xl"
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
