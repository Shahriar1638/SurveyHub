import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { SparklesIcon, ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";

const CHART_COLORS = [
  "#2D9FCF", "#5BBCEA", "#82C8E8", "#A8D8F0", "#C8E6F5",
  "#E85D75", "#F09EB5", "#F5C6D0", "#6BCB77", "#A8E6CF",
  "#FFD93D", "#FFB347", "#FF8C69", "#C9B1FF", "#B19CD9",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

function ChatChart({ chart }) {
  const data = chart.labels.map((label, i) => ({
    name: label,
    value: chart.values[i] || 0,
  }));

  if (chart.type === "pie") {
    return (
      <div className="mt-3">
        <p className="type-meta font-semibold text-[--color-text-primary] mb-2">{chart.title}</p>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const isHorizontal = chart.type === "bar_horizontal";
  return (
    <div className="mt-3">
      <p className="type-meta font-semibold text-[--color-text-primary] mb-2">{chart.title}</p>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart data={data} layout={isHorizontal ? "vertical" : "horizontal"}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          {isHorizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
            </>
          )}
          <Tooltip />
          <Bar dataKey="value" fill="#2D9FCF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AiChat() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("surveyId");
  const axiosSecure = useAxiosSecure();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const { data: survey, isLoading } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/api/analytics/ai-insights`);
      const found = res.data.data?.find((s) => s._id === surveyId);
      return found || null;
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);

    try {
      const res = await axiosSecure.post("/api/analytics/chat", {
        surveyId,
        message: text,
      });

      const data = res.data.data;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text,
          charts: data.charts || [],
        },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to get response";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Error: ${msg}`, charts: [] },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!survey) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <Link to="/dashboard/analytics" className="btn btn-ghost btn-sm mb-4">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Analytics
          </Link>
          <div className="empty-state">
            <SparklesIcon className="w-7 h-7 empty-state-icon" />
            <p className="type-heading-sm text-[--color-text-primary] mt-2">Survey not found</p>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">
              This survey doesn't have AI insights yet. Stats are generated when the deadline expires.
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={item}>
        <Link to="/dashboard/analytics" className="btn btn-ghost btn-sm mb-2">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Analytics
        </Link>
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-6 h-6 text-[--color-primary]" />
          <div>
            <h2 className="type-heading-lg text-[--color-text-primary]">{survey.title}</h2>
            <p className="type-meta text-[--color-text-secondary]">
              {survey.aiInsight.stats.totalResponses} response{survey.aiInsight.stats.totalResponses !== 1 ? "s" : ""}
              {survey.category && <> &middot; {survey.category}</>}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chat messages */}
      <motion.div variants={item} className="card p-4 flex flex-col gap-3 max-h-[500px] overflow-y-auto border border-[--color-border]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="type-body text-[--color-text-secondary]">
              Ask questions about your survey data. For example:
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {[
                "What was the most popular option?",
                "How did people rate each item?",
                "What's the overall sentiment?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="type-body-sm px-3 py-1.5 rounded-full border border-[--color-border] text-[--color-text-secondary] hover:border-[--color-primary] hover:text-[--color-primary] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%]">
              <div
                className={`rounded-xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-[--color-primary] text-white"
                    : "bg-[--color-accent-light] text-[--color-accent-dark]"
                }`}
              >
                <p className="type-body-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.charts?.map((chart, ci) => (
                <div className="mt-3" key={ci}>
                  <ChatChart chart={chart} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl px-5 py-3 bg-[--color-bg-surface] border border-[--color-border] relative overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="relative flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[--color-primary] animate-[pulse_1.4s_ease-in-out_infinite]" />
                  <span className="w-2 h-2 rounded-full bg-[--color-primary] animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
                  <span className="w-2 h-2 rounded-full bg-[--color-primary] animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
                </div>
                <span className="type-meta text-[--color-text-tertiary] italic">Analyzing your data...</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </motion.div>

      {/* Input */}
      <motion.div variants={item} className="flex gap-2 items-center">
        <div
          className={`flex-1 relative rounded-xl transition-all duration-300 ${
            input
              ? "shadow-[0_0_0_2px_var(--color-primary),0_0_12px_rgba(45,159,207,0.15)]"
              : "shadow-none"
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your survey data..."
            className="w-full rounded-xl border border-[--color-border] bg-[--color-bg-surface] text-[--color-text-primary] px-5 py-3.5 type-body-sm placeholder:text-[--color-text-tertiary] focus:outline-none transition-colors duration-200"
            disabled={sending}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="btn btn-primary btn-sm flex-shrink-0"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
