"use no memo";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence } from "motion/react";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import SurveyTable from "./SurveyTable";
import BlogTable from "./BlogTable";
import { SORT_OPTIONS } from "./ModerationShared";

const SURVEY_STATUSES = [
  { value: "all", label: "All" },
  { value: "pending_review", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "expired", label: "Expired" },
  { value: "banned", label: "Banned" },
];

const BLOG_STATUSES = [
  { value: "all", label: "All" },
  { value: "rejected", label: "Rejected" },
  { value: "pending_review", label: "Pending Review" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "banned", label: "Banned" },
];

export default function AdminModeration() {
  const axiosSecure = useAxiosSecure();

  const [tab, setTab] = useState("surveys");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  // Counts for tab badges
  const { data: surveyCount } = useQuery({
    queryKey: ["adminSurveys", "count"],
    queryFn: async () => {
      const r = await axiosSecure.get("/api/surveys/admin/all?limit=1");
      return r.data?.pagination?.total || 0;
    },
  });

  const { data: blogCount } = useQuery({
    queryKey: ["adminBlogs", "count"],
    queryFn: async () => {
      const r = await axiosSecure.get("/api/blogs/admin/all?limit=1");
      return r.data?.pagination?.total || 0;
    },
  });

  const handleTab = useCallback((t) => {
    setTab(t);
    setStatusFilter("all");
    setSearch("");
    setSort("newest");
  }, []);

  const statuses = tab === "surveys" ? SURVEY_STATUSES : BLOG_STATUSES;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="type-heading-md text-[--color-text-primary]">Content Moderation</h3>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Review and manage all surveys and blogs on the platform.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-[--color-bg-inset] rounded-lg p-1 w-fit">
        {["surveys", "blogs"].map((t) => (
          <button
            key={t}
            onClick={() => handleTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-[--color-bg-surface] text-[--color-text-primary] shadow-sm"
                : "text-[--color-text-secondary] hover:text-[--color-text-primary]"
            }`}
          >
            {t} ({t === "surveys" ? surveyCount ?? 0 : blogCount ?? 0})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Status filter chips */}
        <div className="flex items-center gap-1.5">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-[--color-admin] text-white"
                  : "bg-[--color-bg-inset] text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-subtle]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-56 shrink-0">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-tertiary]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="form-input pl-9 py-1.5 text-sm"
          />
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="form-input py-1.5 text-sm w-auto shrink-0"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Active table */}
      {tab === "surveys" ? (
        <SurveyTable statusFilter={statusFilter} search={search} sort={sort} />
      ) : (
        <BlogTable statusFilter={statusFilter} search={search} sort={sort} />
      )}
    </div>
  );
}
