
import { motion } from "framer-motion";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export const SuggestedQuestions = ({ 
  questions, 
  onSelectQuestion 
}: SuggestedQuestionsProps) => {
  if (!questions.length) return null;

  return (
    <div className="mt-4 mb-2">
      <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectQuestion(question)}
            className="text-xs px-3 py-1.5 rounded-full bg-secondary/70 text-foreground hover:bg-secondary transition-colors"
          >
            {question}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
