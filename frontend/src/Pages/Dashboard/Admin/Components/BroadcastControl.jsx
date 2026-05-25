/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "motion/react";
import { MegaphoneIcon } from "@heroicons/react/24/outline";
import { useSendBroadcast } from "../../../../Hooks/useDashboardAdmin";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function BroadcastControl() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const broadcastMutation = useSendBroadcast();

  const handleSend = async () => {
    if (!title.trim() || !message.trim() || broadcastMutation.isPending) return;
    try {
      await broadcastMutation.mutateAsync({ title: title.trim(), message: message.trim(), severity });
      setTitle("");
      setMessage("");
      setSeverity("info");
    } catch (e) {
      console.error("Broadcast failed:", e);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Broadcast Control</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Issue platform-wide announcements, maintenance notices, or emergency alerts.
        </p>
      </motion.div>

      <motion.div variants={item} className="card p-6 space-y-5 max-w-2xl">
        <div>
          <label className="form-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title…"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Message</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your announcement…"
            className="form-input resize-none"
          />
        </div>

        <div>
          <label className="form-label">Severity</label>
          <div className="flex gap-2">
            {[
              { value: "info", label: "Info", color: "var(--color-info)" },
              { value: "warning", label: "Warning", color: "var(--color-warning)" },
              { value: "critical", label: "Critical", color: "var(--color-error)" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSeverity(s.value)}
                className={`btn btn-sm capitalize ${
                  severity === s.value ? "" : "btn-secondary"
                }`}
                style={
                  severity === s.value
                    ? { backgroundColor: s.color, color: "white" }
                    : undefined
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSend}
            disabled={!title.trim() || !message.trim() || broadcastMutation.isPending}
            className="btn btn-md font-semibold text-white px-6 disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: "var(--color-admin)" }}
          >
            {broadcastMutation.isPending ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                Sending…
              </>
            ) : (
              <>
                <MegaphoneIcon className="w-4 h-4" />
                Send Broadcast
              </>
            )}
          </button>
        </div>

        {broadcastMutation.isSuccess && (
          <p className="type-body-sm text-[--color-success] flex items-center gap-1">
            ✓ Broadcast sent successfully.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
