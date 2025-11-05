
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Target } from 'lucide-react';

interface MetricsCardsProps {
  weeklyProgress: number;
  streak: number;
  goalsCompleted: number;
  totalGoals: number;
}

export const MetricsCards = ({ 
  weeklyProgress, 
  streak, 
  goalsCompleted, 
  totalGoals 
}: MetricsCardsProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Weekly Progress</p>
            <h4 className="text-xl font-semibold text-gray-900">{weeklyProgress}%</h4>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Streak</p>
            <h4 className="text-xl font-semibold text-gray-900">{streak} days</h4>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Goals Met</p>
            <h4 className="text-xl font-semibold text-gray-900">{goalsCompleted}/{totalGoals}</h4>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
