
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { ReactNode } from "react";

export type MessageType = "user" | "assistant";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export const ChatMessage = ({ message, isTyping = false }: ChatMessageProps) => {
  const isUser = message.type === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex items-start max-w-[85%] md:max-w-[70%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-primary/10 text-primary ml-2"
              : "bg-secondary/80 text-primary mr-2"
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div
          className={`py-3 px-4 rounded-2xl ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/50 text-foreground border border-border/50"
          }`}
        >
          {isTyping ? <TypingIndicator /> : <p className="text-sm">{message.content}</p>}
          <div
            className={`text-xs mt-1 text-right ${
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <div className="flex space-x-1 items-center py-2 px-1">
    <motion.div
      animate={{ scale: [0.8, 1, 0.8] }}
      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
      className="bg-current rounded-full h-2 w-2"
    />
    <motion.div
      animate={{ scale: [0.8, 1, 0.8] }}
      transition={{
        repeat: Infinity,
        duration: 1,
        ease: "easeInOut",
        delay: 0.2,
      }}
      className="bg-current rounded-full h-2 w-2"
    />
    <motion.div
      animate={{ scale: [0.8, 1, 0.8] }}
      transition={{
        repeat: Infinity,
        duration: 1,
        ease: "easeInOut",
        delay: 0.4,
      }}
      className="bg-current rounded-full h-2 w-2"
    />
  </div>
);

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
