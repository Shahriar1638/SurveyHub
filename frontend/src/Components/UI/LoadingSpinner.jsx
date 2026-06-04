import { ThreeDot } from "react-loading-indicators";

const BRAND_COLOR = "#5BBCEA";

export function LoadingSpinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <ThreeDot color={BRAND_COLOR} size="medium" text="" textColor="" />
    </div>
  );
}

export function LoadingPage({ className = "" }) {
  return (
    <div className={`flex min-h-[40vh] items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <ThreeDot color={BRAND_COLOR} size="medium" text="" textColor="" />
        <p className="type-body-sm text-[--color-text-tertiary]">Loading…</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-[--color-bg-inset] rounded w-3/4" />
        <div className="h-4 bg-[--color-bg-inset] rounded w-1/2" />
        <div className="h-4 bg-[--color-bg-inset] rounded w-2/3" />
      </div>
    </div>
  );
}
