
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Moon, Brain, PieChart, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { WellnessToolkit } from "@/components/WellnessToolkit";
import { 
  getWellnessStats, 
  getSleepHistory, 
  getMeditationHistory, 
  WellnessStats,
  SleepData,
  MeditationSession
} from "@/services/wellnessService";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-teal-600">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const WellnessCenter = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "sleep" | "meditation" | "toolkit">("overview");
  const [wellnessStats, setWellnessStats] = useState<WellnessStats | null>(null);
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [meditationData, setMeditationData] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const stats = await getWellnessStats();
        setWellnessStats(stats);
        
        const sleep = await getSleepHistory(14); // 2 weeks of data
        setSleepData(sleep);
        
        const meditation = await getMeditationHistory();
        setMeditationData(meditation);
      } catch (error) {
        console.error("Error loading wellness data:", error);
        toast({
          title: "Unable to load wellness data",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Group meditation sessions by day and sum durations
  const aggregatedMeditationData = meditationData.reduce((acc, session) => {
    const date = session.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += session.duration;
    return acc;
  }, {} as Record<string, number>);

  const meditationChartData = Object.entries(aggregatedMeditationData)
    .map(([date, duration]) => ({ date, duration }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 days

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 pb-20">
      {/* Header */}
      <header className="glassmorphism border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="mr-4">
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </Link>
          <h1 className="text-xl font-semibold text-gradient">Wellness Center</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto mb-6 pb-2 no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === "overview" 
                ? "bg-primary text-white" 
                : "glassmorphism text-foreground"
            }`}
          >
            <PieChart className="w-4 h-4 inline-block mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("sleep")}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === "sleep" 
                ? "bg-primary text-white" 
                : "glassmorphism text-foreground"
            }`}
          >
            <Moon className="w-4 h-4 inline-block mr-2" />
            Sleep Tracking
          </button>
          <button
            onClick={() => setActiveTab("meditation")}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === "meditation" 
                ? "bg-primary text-white" 
                : "glassmorphism text-foreground"
            }`}
          >
            <Brain className="w-4 h-4 inline-block mr-2" />
            Meditation
          </button>
          <button
            onClick={() => setActiveTab("toolkit")}
            className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
              activeTab === "toolkit" 
                ? "bg-primary text-white" 
                : "glassmorphism text-foreground"
            }`}
          >
            <Heart className="w-4 h-4 inline-block mr-2" />
            Wellness Toolkit
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <motion.div variants={item} className="content-card">
                  <h2 className="text-lg font-medium mb-4">Wellness Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <Moon className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg. Sleep</p>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {wellnessStats?.averageSleepHours.toFixed(1)} hrs
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <Brain className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Meditation</p>
                          <h4 className="text-xl font-semibold text-gray-900">
                            {wellnessStats?.totalMeditationMinutes} mins
                          </h4>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <Heart className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Mood Trend</p>
                          <h4 className="text-xl font-semibold text-gray-900 capitalize">
                            {wellnessStats?.moodTrend}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div variants={item} className="content-card">
                  <h2 className="text-lg font-medium mb-4">Breathing Practice</h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-semibold text-primary">
                        {wellnessStats?.breathingStats.totalSessions}
                      </p>
                      <p className="text-sm text-muted-foreground">Sessions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-primary">
                        {Math.round(wellnessStats?.breathingStats.totalMinutes || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Minutes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-primary">
                        {wellnessStats?.breathingStats.totalBreaths}
                      </p>
                      <p className="text-sm text-muted-foreground">Breaths</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {activeTab === "sleep" && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <motion.div variants={item} className="content-card">
                  <h2 className="text-lg font-medium mb-4">Sleep History</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sleepData}>
                        <defs>
                          <linearGradient id="sleepColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="hoursSlept"
                          name="Hours"
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#sleepColor)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
                
                <motion.div variants={item} className="content-card">
                  <h2 className="text-lg font-medium mb-4">Sleep Quality</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sleepData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="quality"
                          name="Quality"
                          stroke="#14b8a6" 
                          strokeWidth={2}
                          dot={{ fill: '#14b8a6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {activeTab === "meditation" && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <motion.div variants={item} className="content-card">
                  <h2 className="text-lg font-medium mb-4">Meditation History</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={meditationChartData}>
                        <defs>
                          <linearGradient id="meditationColor" x1="0" y1="0" x2="0" y2="1">
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
                          dataKey="duration"
                          name="Minutes"
                          stroke="#14b8a6" 
                          fillOpacity={1} 
                          fill="url(#meditationColor)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
                
                <motion.div variants={item}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="content-card">
                      <h3 className="text-lg font-medium mb-3">Recent Sessions</h3>
                      {meditationData.length > 0 ? (
                        <div className="space-y-3">
                          {meditationData.slice(0, 5).map((session, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                              <div>
                                <p className="font-medium">{session.type}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.date).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="font-medium">{session.duration} min</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No meditation sessions recorded yet
                        </p>
                      )}
                    </div>
                    
                    <div className="content-card">
                      <h3 className="text-lg font-medium mb-3">Start Meditating</h3>
                      <div className="space-y-3">
                        <button className="w-full p-3 bg-white/10 rounded-lg text-left flex items-center hover:bg-white/20 transition-colors">
                          <Calendar className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <p className="font-medium">Guided Meditation</p>
                            <p className="text-sm text-muted-foreground">5 minutes</p>
                          </div>
                        </button>
                        <button className="w-full p-3 bg-white/10 rounded-lg text-left flex items-center hover:bg-white/20 transition-colors">
                          <Calendar className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <p className="font-medium">Breathing Focus</p>
                            <p className="text-sm text-muted-foreground">10 minutes</p>
                          </div>
                        </button>
                        <button className="w-full p-3 bg-white/10 rounded-lg text-left flex items-center hover:bg-white/20 transition-colors">
                          <Calendar className="w-5 h-5 mr-3 text-primary" />
                          <div>
                            <p className="font-medium">Body Scan</p>
                            <p className="text-sm text-muted-foreground">15 minutes</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {activeTab === "toolkit" && <WellnessToolkit />}
          </>
        )}
      </main>
    </div>
  );
};

export default WellnessCenter;
