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
      className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-line ${
        role === "system"
          ? "backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 text-white/90"
          : "bg-gradient-to-r from-violet-600 to-purple-600 text-white ml-auto shadow-lg shadow-violet-500/20"
      }`}
    >
      {content}
    </motion.div>
  );
}
