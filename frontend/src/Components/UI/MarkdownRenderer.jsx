import Markdown from "react-markdown";

/**
 * Shared markdown renderer with consistent styling for SurveyHub.
 * Used in blog cards, detail pages, and editor previews.
 *
 * @param {object} props
 * @param {string} props.content - Raw markdown string
 * @param {string} [props.className] - Optional wrapper class
 * @param {boolean} [props.truncate] - If true, truncates at ~300 chars worth of rendered output
 */
export default function MarkdownRenderer({ content, className = "", truncate = false }) {
  if (!content) return null;

  const displayContent = truncate
    ? content.length > 400
      ? content.slice(0, 400) + "..."
      : content
    : content;

  return (
    <div className={`markdown-body prose prose-sm max-w-none ${className}`}>
      <Markdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 text-[--color-text-primary]">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-3 mb-1.5 text-[--color-text-primary]">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-2 mb-1 text-[--color-text-primary]">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-[--color-text-secondary] leading-relaxed mb-2">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-sm text-[--color-text-secondary] mb-2 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-sm text-[--color-text-secondary] mb-2 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-[--color-text-secondary]">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[--color-accent] pl-3 italic text-[--color-text-tertiary] my-2">
              {children}
            </blockquote>
          ),
          code: ({ inline, className: codeClassName, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-[--color-bg-subtle] text-[--color-accent] text-xs font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={`block p-3 rounded-lg bg-[--color-bg-subtle] text-[--color-text-secondary] text-xs font-mono overflow-x-auto my-2 ${codeClassName || ""}`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="rounded-lg bg-[--color-bg-subtle] overflow-x-auto my-2">{children}</pre>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[--color-accent] hover:underline">
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[--color-text-primary]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          hr: () => (
            <hr className="border-[--color-border] my-4" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full text-sm border border-[--color-border]">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[--color-bg-subtle]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-[--color-text-primary] border-b border-[--color-border]">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-[--color-text-secondary] border-b border-[--color-border]">{children}</td>
          ),
        }}
      >
        {displayContent}
      </Markdown>
    </div>
  );
}
