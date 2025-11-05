
import { motion } from "framer-motion";
import { Calendar } from 'lucide-react';
import { TodaysFocus } from "./TodaysFocus";
import { FocusItem } from "@/services/dashboardService";

interface WelcomeSectionProps {
  focusItems: FocusItem[];
}

export const WelcomeSection = ({ focusItems }: WelcomeSectionProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary to-primary/90 rounded-xl p-6 text-white"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">Welcome Back</h2>
          <p className="mt-2 opacity-90">Your journey continues with strength and resilience</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
        >
          <Calendar className="w-5 h-5" />
        </motion.button>
      </div>
      
      <TodaysFocus focusItems={focusItems} />
    </motion.div>
  );
};
