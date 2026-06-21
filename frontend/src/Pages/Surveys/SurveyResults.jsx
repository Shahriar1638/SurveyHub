import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { LoadingSpinner } from "../../Components/UI/LoadingSpinner";
import { PageTransition } from "../../Components/UI/PageTransition";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { ArrowLeftIcon, ChartBarIcon, SparklesIcon, UserGroupIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const CHART_COLORS = [
  "#2D9FCF", "#5BBCEA", "#82C8E8", "#A8D8F0", "#C8E6F5",
  "#E85D75", "#F09EB5", "#F5C6D0", "#6BCB77", "#A8E6CF",
  "#FFD93D", "#FFB347", "#FF8C69", "#C9B1FF", "#B19CD9",
];

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
};

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function ResultChart({ question }) {
  const scaleLabels = question.scaleLabels || {};
  const hasScaleLabels = Object.keys(scaleLabels).length > 0;

  const data = Object.entries(question.breakdown || {}).map(([name, value]) => ({
    name,
    value,
    label: hasScaleLabels ? (scaleLabels[name] || name) : name,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[--color-text-tertiary] type-body-sm">
        No responses yet
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (question.type === "multiple_choice") {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={CustomPieLabel}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]} />
              <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2 min-w-[140px]">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2 type-body-sm">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-[--color-text-secondary] truncate">{d.name}</span>
              <span className="ml-auto font-mono text-[--color-text-primary] font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "linear_scale") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={hasScaleLabels ? -30 : 0}
            textAnchor={hasScaleLabels ? "end" : "middle"}
            height={hasScaleLabels ? 60 : 30}
          />
          <YAxis
            tick={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name, entry) => [`${value} responses`, entry.payload.label || entry.payload.name]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // checkbox → horizontal BarChart
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
      <BarChart data={data} layout="vertical" barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} selections`, "Count"]} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={32}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function SurveyResults() {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();

  const { data, isLoading, error } = useQuery({
    queryKey: ["surveyResults", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/surveys/${id}/results`);
      return res.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    const msg = error.response?.data?.message || "Failed to load results";
    const status = error.response?.status;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <div className="card max-w-md w-full text-center p-8">
          <ChartBarIcon className="w-12 h-12 mx-auto text-[--color-text-tertiary] mb-3" />
          <h2 className="type-heading-sm text-[--color-text-primary] mb-2">
            {status === 403 ? "Access Restricted" : "Results Unavailable"}
          </h2>
          <p className="type-body text-[--color-text-secondary] mb-4">{msg}</p>
          <Link to={`/surveys/${id}`} className="btn btn-primary btn-md">
            Back to Survey
          </Link>
        </div>
      </div>
    );
  }

  const { survey, totalResponses, questionResults, aiInsight } = data;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[--color-bg]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              to={`/surveys/${id}`}
              className="inline-flex items-center gap-1.5 type-meta text-[--color-text-secondary] hover:text-[--color-primary] transition-colors mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to survey
            </Link>
            <h1 className="type-heading-lg text-[--color-text-primary] mb-2">
              {survey.title}
            </h1>
            {survey.description && (
              <p className="type-body text-[--color-text-secondary] mb-4">
                {survey.description}
              </p>
            )}

            {/* Summary Stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[--color-bg-subtle] border border-[--color-border]">
                <UserGroupIcon className="w-5 h-5 text-[--color-primary]" />
                <div>
                  <p className="type-meta text-[--color-text-tertiary]">Total Responses</p>
                  <p className="type-heading-sm text-[--color-text-primary] font-mono">{totalResponses}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[--color-bg-subtle] border border-[--color-border]">
                <CheckCircleIcon className="w-5 h-5 text-[--color-success]" />
                <div>
                  <p className="type-meta text-[--color-text-tertiary]">Questions</p>
                  <p className="type-heading-sm text-[--color-text-primary] font-mono">{questionResults.length}</p>
                </div>
              </div>
              {survey.category && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[--color-bg-subtle] border border-[--color-border]">
                  <span className="badge badge-outline">{survey.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          {questionResults.length > 0 ? (
            <div className="flex flex-col gap-6">
              {questionResults.map((q, idx) => (
                <div key={q.questionId} className="card p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[--color-primary] text-white text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <span className="type-meta text-[--color-text-tertiary] uppercase tracking-wide">
                          {q.type.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="type-heading-sm text-[--color-text-primary] mt-2">
                        {q.label}
                      </h3>
                    </div>
                    <span className="badge badge-outline ml-3 shrink-0">
                      {q.responseCount} answer{q.responseCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ResultChart question={q} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <ChartBarIcon className="w-12 h-12 mx-auto text-[--color-text-tertiary] mb-3" />
              <h3 className="type-heading-sm text-[--color-text-primary] mb-2">
                No chartable results
              </h3>
              <p className="type-body text-[--color-text-secondary]">
                This survey only contains text-based questions, so there are no charts to display.
              </p>
            </div>
          )}

          {/* AI Insight */}
          {aiInsight && (
            <div className="card p-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-[--color-primary]" />
                <h3 className="type-heading-sm text-[--color-text-primary]">
                  AI Insight
                </h3>
              </div>

              {aiInsight.summary && (
                <p className="type-body text-[--color-text-secondary] mb-4">
                  {aiInsight.summary}
                </p>
              )}

              {aiInsight.keyFindings?.length > 0 && (
                <div className="mb-4">
                  <h4 className="type-meta font-semibold text-[--color-text-primary] mb-2">
                    Key Findings
                  </h4>
                  <ul className="flex flex-col gap-1.5">
                    {aiInsight.keyFindings.map((f, i) => (
                      <li
                        key={i}
                        className="type-body-sm text-[--color-text-secondary] flex items-start gap-2"
                      >
                        <span className="text-[--color-primary] mt-1">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiInsight.recommendations?.length > 0 && (
                <div>
                  <h4 className="type-meta font-semibold text-[--color-text-primary] mb-2">
                    Recommendations
                  </h4>
                  <ul className="flex flex-col gap-1.5">
                    {aiInsight.recommendations.map((r, i) => (
                      <li
                        key={i}
                        className="type-body-sm text-[--color-text-secondary] flex items-start gap-2"
                      >
                        <span className="text-green-500 mt-1">→</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="type-meta text-[--color-text-tertiary] mt-4">
                Generated {new Date(aiInsight.generatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
