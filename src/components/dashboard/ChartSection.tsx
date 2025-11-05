
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { useState } from "react";
import { WellnessScoreData, TreatmentProgressData } from "@/services/dashboardService";

interface ChartSectionProps {
  wellnessScoreData: {
    currentScore: number;
    data: WellnessScoreData[];
  };
  treatmentProgressData: TreatmentProgressData[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-primary">
          Score: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const ChartSection = ({ wellnessScoreData, treatmentProgressData }: ChartSectionProps) => {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly">("daily");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Treatment Progress Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Treatment Progress</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={treatmentProgressData}>
              <defs>
                <linearGradient id="progressColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="progress" 
                stroke="#14b8a6" 
                fillOpacity={1} 
                fill="url(#progressColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wellness Score Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Wellness Score</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeframe("daily")}
              className={`px-3 py-1 rounded-full text-sm ${
                timeframe === "daily"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe("weekly")}
              className={`px-3 py-1 rounded-full text-sm ${
                timeframe === "weekly"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wellnessScoreData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#14b8a6" 
                strokeWidth={2}
                dot={{ fill: '#14b8a6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
