import { useState, useCallback, useEffect, useContext } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import useSurveys from "../../Hooks/useSurveys";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import { Card } from "../../Components/UI/Card";

// ── Helpers ──────────────────────────────────────────────────────────────────
function deadlineDaysLeft(deadlineStr) {
  if (!deadlineStr) return null;
  const dl = new Date(deadlineStr);
  if (isNaN(dl.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((dl - today) / 86400000);
}

function questionLengthLabel(count) {
  if (count < 10)
    return {
      label: "Short",
      className: "bg-[--color-success-light] text-[--color-success]",
    };
  if (count <= 15)
    return {
      label: "Medium",
      className: "bg-[--color-warning-light] text-[--color-warning]",
    };
  return {
    label: "Long",
    className: "bg-[--color-user-light] text-[--color-user]",
  };
}

const STATUS_CONFIG = {
  published: {
    label: "Active",
    className: "bg-[--color-success-light] text-[--color-success]",
  },
  expired: {
    label: "Expired",
    className: "bg-[--color-bg-inset] text-[--color-text-secondary]",
  },
};

// ── Sort Options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title_asc", label: "Title A → Z" },
  { value: "title_desc", label: "Title Z → A" },
];

// ── Animated Card variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── SurveyCard (enhanced for this page) ──────────────────────────────────────
function SurveyListCard({ survey, user, profile }) {
  const daysLeft = survey.deadline ? deadlineDaysLeft(survey.deadline) : null;
  const isSoon =
    daysLeft !== null &&
    daysLeft >= 0 &&
    daysLeft <= 4 &&
    survey.status === "published";
  const statusCfg = STATUS_CONFIG[survey.status] || STATUS_CONFIG.published;
  const qLen = questionLengthLabel(survey.questions?.length || 0);
  const topBorderClass =
    survey.status === "expired"
      ? "bg-[--color-border-strong]"
      : isSoon
        ? "bg-[--color-warning]"
        : "bg-[--color-success]";

  return (
    <Card hover className="overflow-hidden flex flex-col h-full relative group">
      {/* Status colour band */}
      <div className={`absolute top-0 left-0 w-full h-[3px] ${topBorderClass}`} />

      {/* Card image */}
      {survey.image && (
        <div className="h-36 overflow-hidden">
          <img
            src={survey.image}
            alt={survey.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Top row: category + badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {survey.category && (
            <span className="badge badge-visitor">{survey.category}</span>
          )}
          <span
            className={`badge ${qLen.className}`}
          >
            {qLen.label} · {survey.questions?.length || 0}Q
          </span>
          {isSoon && (
            <span className="badge bg-[--color-warning-light] text-[--color-warning]">
              ⏳ {daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}
            </span>
          )}
          {survey.status === "expired" && (
            <span className={`badge ${statusCfg.className}`}>Expired</span>
          )}
        </div>

        {/* Title */}
        <h3 className="type-heading-sm line-clamp-2 mb-2 text-[--color-text-primary]">
          {survey.title}
        </h3>

        {/* Description */}
        {survey.description && (
          <p className="type-body-sm text-[--color-text-secondary] line-clamp-2 mb-3">
            {survey.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto flex items-center gap-2 type-meta text-[--color-text-tertiary]">
          <span>{survey.participantCount ?? 0} responses</span>
          {survey.status === "published" && daysLeft !== null && (
            <>
              <span>·</span>
              <span>
                {daysLeft === 0
                  ? "Ends today"
                  : daysLeft === 1
                    ? "1 day left"
                    : `${daysLeft} days left`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-[--color-border] flex justify-between items-center">
        {survey.deadline && (
          <span className="type-body-sm text-[--color-text-tertiary]">
            Due{" "}
            {new Date(survey.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}

        {!user ? (
          <Link
            to="/login"
            className="btn btn-sm text-[0.75rem] py-1.5 px-3.5 bg-[--color-visitor] text-white hover:bg-[--color-visitor-dark]"
          >
            Login to participate
          </Link>
        ) : survey.status === "expired" ? (
          (() => {
            const isCreator = profile?._id === survey.surveyorId;
            const hasParticipated = survey.hasParticipated;
            const canViewResults = isCreator || hasParticipated || survey.resultAccess === "everyone";
            if (canViewResults) {
              return (
                <Link
                  to={`/surveys/${survey._id}/results`}
                  className="btn btn-sm text-[0.75rem] py-1.5 px-3.5 bg-[--color-success-light] text-[--color-success] font-semibold"
                >
                  Check Results
                </Link>
              );
            }
            return (
              <span className="type-body-sm text-[--color-error] font-semibold">
                Expired
              </span>
            );
          })()
        ) : (
          <Link
            to={`/surveys/${survey._id}`}
            className="btn btn-sm btn-primary text-white bg-[--color-visitor] hover:bg-[--color-visitor-dark] text-[0.75rem] py-1.5 px-3.5"
          >
            Take Survey
          </Link>
        )}
      </div>
    </Card>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-36 bg-[--color-bg-subtle]" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-[--color-bg-subtle]" />
          <div className="h-5 w-16 rounded-full bg-[--color-bg-subtle]" />
        </div>
        <div className="h-5 bg-[--color-bg-subtle] rounded w-5/6" />
        <div className="h-4 bg-[--color-bg-subtle] rounded w-full" />
        <div className="h-4 bg-[--color-bg-subtle] rounded w-4/6" />
        <div className="h-3 bg-[--color-bg-subtle] rounded w-2/5 mt-4" />
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-[--color-border] flex justify-between">
        <div className="h-4 w-24 bg-[--color-bg-subtle] rounded" />
        <div className="h-7 w-24 bg-[--color-bg-subtle] rounded-lg" />
      </div>
    </div>
  );
}

// ── FilterSidebar ─────────────────────────────────────────────────────────────
function FilterSidebar({ filters, onChange, categories, onReset }) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [prevSearchFilter, setPrevSearchFilter] = useState(
    filters.search || "",
  );

  // 1. Sync external reset during render (React recommended pattern for derived state)
  // This prevents the cascading re-render that useEffect causes.
  if (filters.search !== prevSearchFilter) {
    setPrevSearchFilter(filters.search || "");
    setLocalSearch(filters.search || "");
  }

  // 2. Debounce search input (with all dependencies included)
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== filters.search) {
        onChange("search", localSearch);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch, filters.search, onChange]);

  const lengthOptions = [
    { value: "", label: "All Lengths" },
    { value: "short", label: "Short (<10 Q)" },
    { value: "medium", label: "Medium (10–15 Q)" },
    { value: "long", label: "Long (15+ Q)" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "published", label: "Active Only" },
    { value: "expired", label: "Expired Only" },
    { value: "deadline_soon", label: "⏳ Deadline Soon" },
  ];

  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.length ||
    filters.statusFilter ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <aside className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="type-label-lg text-[--color-text-primary]">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="type-body-sm text-[--color-visitor] hover:underline"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="form-label mb-1.5 block">Search by title</label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-tertiary]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
          <input
            type="text"
            placeholder="     Search surveys..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="form-label mb-1.5 block">Category</label>
        <select
          value={filters.category || "all"}
          onChange={(e) => onChange("category", e.target.value)}
          className="form-input"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Question Length */}
      <div>
        <label className="form-label mb-1.5 block">Survey Length</label>
        <div className="flex flex-col gap-1.5">
          {lengthOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange("length", opt.value)}
              className={`text-left px-3 py-2 rounded-lg type-body-sm transition-colors duration-150 ${
                filters.length === opt.value
                  ? "bg-[--color-visitor-light] text-[--color-visitor-dark] font-semibold"
                  : "text-[--color-text-secondary] hover:bg-[--color-bg-subtle]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="form-label mb-1.5 block">Status</label>
        <div className="flex flex-col gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange("statusFilter", opt.value)}
              className={`text-left px-3 py-2 rounded-lg type-body-sm transition-colors duration-150 ${
                filters.statusFilter === opt.value
                  ? "bg-[--color-visitor-light] text-[--color-visitor-dark] font-semibold"
                  : "text-[--color-text-secondary] hover:bg-[--color-bg-subtle]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="form-label mb-1.5 block">Date Range</label>
        <div className="flex flex-col gap-2">
          <div>
            <label className="type-body-sm text-[--color-text-tertiary] mb-1 block">
              From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => onChange("dateFrom", e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="type-body-sm text-[--color-text-tertiary] mb-1 block">
              To
            </label>
            <input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => onChange("dateTo", e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  sort: "newest",
  category: "all",
  search: "",
  length: "",
  statusFilter: "",
  dateFrom: "",
  dateTo: "",
};

export default function SurveysPage() {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const filtersWithUser = { ...filters, userId: profile?._id || null };
  const { data, isPending, isError } = useSurveys(filtersWithUser);

  const surveys = data?.data || [];
  const categories = data?.categories || [];
  const totalCount = data?.total ?? 0;

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return (
    <div className="min-h-screen bg-[--color-bg-base]">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="border-b border-[--color-border] bg-[--color-bg-surface]">
        <div className="container-marketing py-8">
          <div className="flex flex-col gap-1">
            <p className="type-meta text-[--color-visitor] uppercase tracking-widest">
              Explore
            </p>
            <h1 className="type-heading-xl text-[--color-text-primary]">
              All Surveys
            </h1>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">
              Discover, participate, and explore insights from the community.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Sidebar + Grid ──────────────────────────── */}
      <div className="container-marketing py-8">
        <div className="flex gap-8 items-start">
          {/* ── Sidebar (desktop) ──────────────────────────────── */}
          <div className="hidden lg:block w-64 shrink-0 sticky top-[80px]">
            <div className="card p-5">
              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                categories={categories}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* ── Content Area ──────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: count + sort + mobile filter btn */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden! btn btn-sm btn-secondary flex items-center gap-1.5"
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                    />
                  </svg>
                  Filters
                </button>

                <span className="type-meta text-[--color-text-tertiary]">
                  {isPending
                    ? "Loading..."
                    : `${totalCount} survey${totalCount !== 1 ? "s" : ""}`}
                </span>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="type-body-sm text-[--color-text-secondary] hidden sm:block">
                  Sort:
                </span>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="form-input py-1.5! px-3! text-sm! w-auto min-w-40"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {(filters.category !== "all" ||
              filters.length ||
              filters.statusFilter ||
              filters.search ||
              filters.dateFrom ||
              filters.dateTo) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.search && (
                  <FilterChip
                    label={`"${filters.search}"`}
                    onRemove={() => handleFilterChange("search", "")}
                  />
                )}
                {filters.category !== "all" && (
                  <FilterChip
                    label={filters.category}
                    onRemove={() => handleFilterChange("category", "all")}
                  />
                )}
                {filters.length && (
                  <FilterChip
                    label={filters.length}
                    onRemove={() => handleFilterChange("length", "")}
                  />
                )}
                {filters.statusFilter && (
                  <FilterChip
                    label={filters.statusFilter.replace("_", " ")}
                    onRemove={() => handleFilterChange("statusFilter", "")}
                  />
                )}
                {filters.dateFrom && (
                  <FilterChip
                    label={`From ${filters.dateFrom}`}
                    onRemove={() => handleFilterChange("dateFrom", "")}
                  />
                )}
                {filters.dateTo && (
                  <FilterChip
                    label={`To ${filters.dateTo}`}
                    onRemove={() => handleFilterChange("dateTo", "")}
                  />
                )}
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div className="empty-state">
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
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="type-heading-sm text-[--color-text-primary] mt-3">
                  Failed to load surveys
                </h3>
                <p className="type-body-sm text-[--color-text-secondary] max-w-xs mt-1">
                  Please try refreshing the page.
                </p>
              </div>
            )}

            {/* Loading skeleton grid */}
            {isPending && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isPending && !isError && surveys.length === 0 && (
              <div className="empty-state">
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
                      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                </div>
                <h3 className="type-heading-sm text-[--color-text-primary] mt-3">
                  No surveys found
                </h3>
                <p className="type-body-sm text-[--color-text-secondary] max-w-xs mt-1">
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={handleReset}
                  className="btn btn-sm btn-secondary mt-4"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Survey grid */}
            {!isPending && !isError && surveys.length > 0 && (
              <motion.div
                key={JSON.stringify(filters)}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {surveys.map((survey) => (
                  <motion.div key={survey._id} variants={itemVariants}>
                    <SurveyListCard survey={survey} user={user} profile={profile} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 h-full w-80 max-w-[90vw] bg-[--color-bg-surface] z-50 shadow-[--shadow-xl] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-[--color-border]">
                <h2 className="type-label-lg">Filters</h2>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--color-bg-subtle]"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <FilterSidebar
                  filters={filters}
                  onChange={(key, val) => {
                    handleFilterChange(key, val);
                  }}
                  categories={categories}
                  onReset={() => {
                    handleReset();
                    setMobileSidebarOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── FilterChip ────────────────────────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[--color-visitor-light] text-[--color-visitor-dark] type-body-sm font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:opacity-70 transition-opacity"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </span>
  );
}
