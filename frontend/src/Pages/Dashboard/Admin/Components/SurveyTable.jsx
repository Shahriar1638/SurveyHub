"use no memo";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { DocumentTextIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { AnimatePresence } from "motion/react";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import { StatusBadge, SortHeader } from "./ModerationShared";
import ContentReviewModal from "./ContentReviewModal";

export default function SurveyTable({ statusFilter, search, sort }) {
  const axiosSecure = useAxiosSecure();
  const [reviewItem, setReviewItem] = useState(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["adminSurveys", statusFilter, search, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("sort", sort);
      params.set("limit", "100");
      const r = await axiosSecure.get(`/api/surveys/admin/all?${params}`);
      return r.data;
    },
  });

  const data = res?.data || [];
  const total = res?.pagination?.total || 0;

  const columns = useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => <SortHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <span className="type-body-sm text-[--color-text-primary] font-medium truncate block max-w-[200px]">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "surveyorId.email",
      header: "Owner",
      cell: ({ row }) => (
        <span className="type-meta text-[--color-text-secondary]">
          {row.original.surveyorId?.email || "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="type-meta text-[--color-text-tertiary]">
          {row.original.category || "—"}
        </span>
      ),
    },
    {
      accessorKey: "participantCount",
      header: ({ column }) => <SortHeader column={column} title="Responses" />,
      cell: ({ row }) => (
        <span className="type-meta text-[--color-text-secondary] font-[--font-mono]">
          {row.original.participantCount || 0}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <span className="type-meta text-[--color-text-tertiary]">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const survey = row.original;
        const canReview = survey.status === "rejected" || survey.status === "pending_review";
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setReviewItem(survey);
            }}
            className={`btn btn-sm flex items-center gap-1.5 ${
              canReview
                ? "bg-[--color-error-light] text-[--color-error] hover:bg-[--color-error]/20"
                : "btn-secondary opacity-50 cursor-not-allowed"
            }`}
            disabled={!canReview}
            title={canReview ? `Review ${survey.status} survey` : "Only rejected or pending surveys can be reviewed"}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            Review
          </button>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card p-12 text-center">
        <DocumentTextIcon className="w-8 h-8 text-[--color-text-tertiary] mx-auto mb-3" />
        <p className="type-heading-sm text-[--color-text-primary]">No surveys found</p>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          {search ? "Try a different search term." : "Nothing matches the current filters."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[--color-border] bg-[--color-bg-subtle]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left type-label-sm text-[--color-text-tertiary] font-medium whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[--color-border] last:border-b-0 hover:bg-[--color-bg-subtle]/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[--color-border] bg-[--color-bg-subtle]">
          <p className="type-meta text-[--color-text-tertiary]">
            Showing {table.getRowModel().rows.length} of {total} surveys
          </p>
        </div>
      </div>

      <ContentReviewModal
        item={reviewItem}
        type="survey"
        isOpen={!!reviewItem}
        onClose={() => setReviewItem(null)}
      />
    </>
  );
}
