import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { SparklesIcon, ChartBarIcon, LightBulbIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import { Link } from "react-router";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function AiAnalytics() {
  const axiosSecure = useAxiosSecure();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["aiAnalytics"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/analytics/ai-insights");
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h2 className="type-heading-lg text-[--color-text-primary]">AI Analytics Lab</h2>
        </motion.div>
        <motion.div variants={item} className="empty-state">
          <p className="type-body text-[--color-error]">Failed to load AI insights. Please try again.</p>
        </motion.div>
      </motion.div>
    );
  }

  const insights = data || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">AI Analytics Lab</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          AI-powered insights generated when your survey deadlines expire.
        </p>
      </motion.div>

      {insights.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <SparklesIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No insights yet</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            AI insights are generated automatically when a published survey reaches its deadline. Enable AI insights on your surveys to get started.
          </p>
          <Link to="/dashboard/surveys" className="btn btn-primary mt-4">
            Go to My Surveys
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {/* Summary cards */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[--color-primary]/10 flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-5 h-5 text-[--color-primary]" />
              </div>
              <div>
                <p className="type-meta text-[--color-text-secondary]">Surveys Analyzed</p>
                <p className="type-heading-sm text-[--color-text-primary]">{insights.length}</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="type-meta text-[--color-text-secondary]">Total Responses</p>
                <p className="type-heading-sm text-[--color-text-primary]">
                  {insights.reduce((sum, s) => sum + s.aiInsight.stats.totalResponses, 0)}
                </p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <LightBulbIcon className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="type-meta text-[--color-text-secondary]">Insights Generated</p>
                <p className="type-heading-sm text-[--color-text-primary]">
                  {insights.filter((s) => s.aiInsight.summary).length}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Insight cards */}
          {insights.map((survey) => (
            <motion.div key={survey._id} variants={item} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="type-heading-sm text-[--color-text-primary]">{survey.title}</h3>
                  <p className="type-meta text-[--color-text-secondary] mt-0.5">
                    {survey.participantCount} response{survey.participantCount !== 1 ? "s" : ""}
                    {survey.category && <> &middot; {survey.category}</>}
                    {survey.aiInsight.generatedAt && (
                      <> &middot; {new Date(survey.aiInsight.generatedAt).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/analytics-chat?surveyId=${survey._id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    <SparklesIcon className="w-4 h-4" /> Chat
                  </Link>
                  <Link
                    to={`/surveys/${survey._id}/results`}
                    className="btn btn-ghost btn-sm"
                  >
                    View Results
                  </Link>
                </div>
              </div>

              {survey.aiInsight.summary && (
                <p className="type-body text-[--color-text-secondary] mb-3">{survey.aiInsight.summary}</p>
              )}

              {survey.aiInsight.keyFindings?.length > 0 && (
                <div className="mb-3">
                  <h4 className="type-meta font-semibold text-[--color-text-primary] mb-1.5 flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4" />
                    Key Findings
                  </h4>
                  <ul className="flex flex-col gap-1">
                    {survey.aiInsight.keyFindings.map((f, i) => (
                      <li key={i} className="type-body-sm text-[--color-text-secondary] flex items-start gap-2">
                        <span className="text-[--color-primary] mt-1">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {survey.aiInsight.recommendations?.length > 0 && (
                <div>
                  <h4 className="type-meta font-semibold text-[--color-text-primary] mb-1.5 flex items-center gap-1.5">
                    <LightBulbIcon className="w-4 h-4" />
                    Recommendations
                  </h4>
                  <ul className="flex flex-col gap-1">
                    {survey.aiInsight.recommendations.map((r, i) => (
                      <li key={i} className="type-body-sm text-[--color-text-secondary] flex items-start gap-2">
                        <span className="text-green-500 mt-1">→</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
