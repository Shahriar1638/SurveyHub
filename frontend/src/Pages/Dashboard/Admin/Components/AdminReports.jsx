"use no memo";

import { useState, useCallback } from "react";
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence } from "motion/react";
import ReportsTable from "./ReportsTable";
import ReportSidePanel from "../ReportSidePanel";

const REPORT_STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const REPORT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "survey", label: "Survey" },
  { value: "blog", label: "Blog" },
  { value: "comment", label: "Comment" },
  { value: "reply", label: "Reply" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export default function AdminReports() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedReport, setSelectedReport] = useState(null);

  const handleReport = useCallback((report) => {
    setSelectedReport(report);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="type-heading-md text-[--color-text-primary]">All Reports</h3>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          View and manage all user-reported content across the platform.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Status filter chips */}
        <div className="flex items-center gap-1.5">
          {REPORT_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-[--color-error] text-white"
                  : "bg-[--color-bg-inset] text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-subtle]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="form-input py-1.5 text-sm w-auto shrink-0"
        >
          {REPORT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative w-56 shrink-0">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-tertiary]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
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

      {/* Reports table */}
      <ReportsTable
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        search={search}
        sort={sort}
        onOpenPanel={handleReport}
      />

      {/* Side panel */}
      <AnimatePresence>
        {selectedReport && (
          <ReportSidePanel
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
