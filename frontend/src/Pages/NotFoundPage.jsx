import { Link } from "react-router";
import { motion } from "motion/react";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h1 className="type-display-lg text-[--color-text-primary]">404</h1>
        <p className="type-body-lg text-[--color-text-secondary] mt-2 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-md">
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
