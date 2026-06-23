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
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import { StatusBadge, SortHeader } from "./ModerationShared";
import ContentReviewModal from "./ContentReviewModal";

export default function BlogTable({ statusFilter, search, sort, onDetail }) {
  const axiosSecure = useAxiosSecure();
  const [reviewItem, setReviewItem] = useState(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["adminBlogs", statusFilter, search, sort],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("sort", sort);
      params.set("limit", "100");
      const r = await axiosSecure.get(`/api/blogs/admin/all?${params}`);
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
      accessorKey: "surveyorEmail",
      header: "Author",
      cell: ({ row }) => (
        <span className="type-meta text-[--color-text-secondary]">
          {row.original.surveyorEmail}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "preview",
      header: "Preview",
      cell: ({ row }) => (
        <span className="type-meta text-[--color-text-tertiary] truncate block max-w-[200px]">
          {row.original.content?.slice(0, 80)}...
        </span>
      ),
    },
    {
      accessorKey: "edited",
      header: "Edited",
      cell: ({ row }) => (
        <span className="type-meta text-[--color-text-tertiary]">
          {row.original.edited ? "Yes" : "No"}
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
        const blog = row.original;
        const canReview = blog.status === "rejected" || blog.status === "pending_review";
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setReviewItem(blog);
            }}
            className={`btn btn-sm flex items-center gap-1.5 ${
              canReview
                ? "bg-[--color-error-light] text-[--color-error] hover:bg-[--color-error]/20"
                : "btn-secondary opacity-50 cursor-not-allowed"
            }`}
            disabled={!canReview}
            title={canReview ? `Review ${blog.status} blog` : "Only rejected or pending blogs can be reviewed"}
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
        <p className="type-heading-sm text-[--color-text-primary]">No blogs found</p>
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
                onClick={onDetail ? () => onDetail(row.original) : undefined}
                className={`border-b border-[--color-border] last:border-b-0 hover:bg-[--color-bg-subtle]/50 transition-colors${onDetail ? " cursor-pointer" : ""}`}
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
          Showing {table.getRowModel().rows.length} of {total} blogs
        </p>
      </div>
    </div>
    <ContentReviewModal
      isOpen={!!reviewItem}
      onClose={() => setReviewItem(null)}
      item={reviewItem}
      type="blog"
    />
    </>
  );
}
