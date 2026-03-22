import { motion } from "framer-motion";

type ChatMessageProps = {
  role: "system" | "user";
  content: string;
};

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
        role === "system"
          ? "bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/30 dark:to-blue-900/30 text-neutral-800 dark:text-neutral-100 border border-violet-100 dark:border-violet-800/30"
          : "bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-700 dark:to-neutral-600 text-white ml-auto shadow-md"
      }`}
    >
      {content}
    </motion.div>
  );
}
