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
          ? "bg-neutral-100 text-neutral-800"
          : "bg-neutral-900 text-white ml-auto"
      }`}
    >
      {content}
    </motion.div>
  );
}
