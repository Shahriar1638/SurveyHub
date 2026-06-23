const variantClasses = {
  primary:     "btn-primary",     // accent orange — one CTA per section
  secondary:   "btn-secondary",   // navy — non-CTA primaries
  ghost:       "btn-ghost",       // border/transparent
  destructive: "btn-destructive", // error red
};

const sizeClasses = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  ...props
}) {
  const vClass = variantClasses[variant] || variantClasses.primary;
  const sClass = sizeClasses[size] || sizeClasses.md;

  return (
    <button
      className={`btn ${vClass} ${sClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
