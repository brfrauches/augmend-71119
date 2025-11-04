
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WelcomeSection } from "./dashboard/WelcomeSection";
import { ChartSection } from "./dashboard/ChartSection";
import { MetricsCards } from "./dashboard/MetricsCards";
import { fetchDashboardData, DashboardData, getFallbackDashboardData } from "@/services/dashboardService";
import { useToast } from "@/hooks/use-toast";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const ProgressDashboard = () => {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData>(getFallbackDashboardData());

  // Use React Query to fetch dashboard data
  const { isLoading, error, data } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: () => fetchDashboardData(),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setDashboardData(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error loading dashboard",
        description: "Using fallback data. Please try again later.",
        variant: "destructive"
      });
      setDashboardData(getFallbackDashboardData());
    }
  }, [error, toast]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Welcome Section with Today's Focus */}
          <WelcomeSection focusItems={dashboardData.todaysFocus} />

          {/* Charts Section */}
          <ChartSection 
            wellnessScoreData={dashboardData.wellnessScore} 
            treatmentProgressData={dashboardData.treatmentProgress} 
          />

          {/* Key Metrics */}
          <MetricsCards 
            weeklyProgress={dashboardData.weeklyProgress}
            streak={dashboardData.streak}
            goalsCompleted={dashboardData.goalsCompleted}
            totalGoals={dashboardData.totalGoals}
          />
        </>
      )}
    </motion.div>
  );
};
