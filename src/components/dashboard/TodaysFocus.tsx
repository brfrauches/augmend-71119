
import { motion } from "framer-motion";
import { Brain, Target, ArrowRight } from 'lucide-react';
import { FocusItem } from "@/services/dashboardService";

interface TodaysFocusProps {
  focusItems: FocusItem[];
}

export const TodaysFocus = ({ focusItems }: TodaysFocusProps) => {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meditation':
        return Brain;
      case 'exercise':
        return Target;
      default:
        return Brain;
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Today's Focus</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {focusItems.map((focus, index) => {
          const Icon = getIcon(focus.type);
          return (
            <motion.div
              key={focus.id || index}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer"
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3" />
                <div>
                  <h4 className="font-medium">{focus.title}</h4>
                  <p className="text-sm opacity-90">{focus.duration}</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
