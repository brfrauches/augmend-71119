
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Circle, Heart, Brain, Shield, Book, MessageCircle } from "lucide-react";
import { MilestoneCelebration } from "./MilestoneCelebration";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { 
  recordMood, 
  recordBreathingSession, 
  getRecentMoods,
  getBreathingStats
} from "@/services/wellnessService";

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

export const WellnessToolkit = () => {
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [breathingStats, setBreathingStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    totalBreaths: 0
  });
  const { toast } = useToast();

  const moodOptions = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😌", label: "Calm" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😰", label: "Anxious" },
    { emoji: "😤", label: "Frustrated" }
  ];

  const quickTools = [
    {
      icon: Circle,
      title: "Breathing Exercise",
      description: "Take a moment to breathe",
      action: () => setIsBreathing(true)
    },
    {
      icon: Heart,
      title: "Self-Compassion",
      description: "Practice kind self-talk",
      action: () => {
        toast({
          title: "Self-Compassion Exercise",
          description: "Take a moment to practice self-kindness"
        });
      }
    },
    {
      icon: Brain,
      title: "Thought Check",
      description: "Challenge negative thoughts",
      action: () => {
        toast({
          title: "Thought Check",
          description: "Identify and reframe negative thinking patterns"
        });
      }
    },
    {
      icon: Shield,
      title: "Grounding",
      description: "Connect with your senses",
      action: () => {
        toast({
          title: "Grounding Exercise",
          description: "Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste"
        });
      }
    },
    {
      icon: MessageCircle,
      title: "Health Assistant",
      description: "Get personalized guidance",
      action: () => {
        window.location.href = "/health-assistant";
      }
    }
  ];

  // Load breathing stats on component mount
  useEffect(() => {
    const loadBreathingStats = async () => {
      try {
        const stats = await getBreathingStats();
        setBreathingStats(stats);
      } catch (error) {
        console.error("Error loading breathing stats:", error);
      }
    };

    loadBreathingStats();
  }, []);

  // Handle mood selection
  const handleMoodSelect = async (selectedMood: string) => {
    setMood(selectedMood);
    
    try {
      const success = await recordMood(selectedMood);
      if (success) {
        toast({
          title: "Mood recorded",
          description: `Your mood has been recorded as ${selectedMood}.`
        });
      }
    } catch (error) {
      console.error("Error recording mood:", error);
      toast({
        title: "Failed to record mood",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Handle end of breathing session
  const handleEndBreathingSession = async () => {
    try {
      if (breathCount > 0) {
        const duration = breathCount * 5; // Each breath is 5 seconds
        const completedBreaths = Math.floor(breathCount / 2); // Each full breath is inhale+exhale
        
        const success = await recordBreathingSession(duration, completedBreaths);
        if (success) {
          toast({
            title: "Breathing session complete",
            description: `You completed ${completedBreaths} breaths in ${duration} seconds.`
          });
          
          // Update stats
          setBreathingStats(prev => ({
            totalSessions: prev.totalSessions + 1,
            totalMinutes: prev.totalMinutes + duration / 60,
            totalBreaths: prev.totalBreaths + completedBreaths
          }));
        }
      }
    } catch (error) {
      console.error("Error recording breathing session:", error);
    } finally {
      setIsBreathing(false);
      setBreathCount(0);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathCount(count => {
          if (count >= 10) {
            handleEndBreathingSession();
            return 0;
          }
          return count + 1;
        });
      }, 5000); // 5 seconds per breath cycle
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {isBreathing && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="bg-white p-8 rounded-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Breathing Exercise</h3>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-primary/20 rounded-full mx-auto flex items-center justify-center"
            >
              <span className="text-primary text-lg">
                {breathCount % 2 === 0 ? "Inhale" : "Exhale"}
              </span>
            </motion.div>
            <p className="text-center mt-4 text-muted-foreground">
              Breath {Math.floor(breathCount / 2) + 1} of 5
            </p>
            <button
              onClick={handleEndBreathingSession}
              className="mt-6 w-full py-2 px-4 bg-secondary hover:bg-secondary/80 rounded-lg text-foreground transition-colors"
            >
              End Exercise
            </button>
          </div>
        </motion.div>
      )}

      <motion.section variants={item}>
        <h3 className="text-lg font-medium text-foreground mb-4">How are you feeling?</h3>
        <div className="flex flex-wrap gap-4">
          {moodOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleMoodSelect(option.label)}
              className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                mood === option.label
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-secondary/50 border-2 border-transparent hover:bg-secondary"
              }`}
            >
              <span className="text-2xl mb-1">{option.emoji}</span>
              <span className="text-sm text-foreground/80">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section variants={item}>
        <h3 className="text-lg font-medium text-foreground">Quick Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickTools.map((tool) => (
            <motion.button
              key={tool.title}
              onClick={tool.action}
              className="flex items-start p-4 content-card hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tool.icon className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-foreground">{tool.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Breathing Stats */}
      {breathingStats.totalSessions > 0 && (
        <motion.section variants={item} className="p-4 content-card">
          <h3 className="text-lg font-medium text-foreground mb-3">Breathing Practice Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-primary">{breathingStats.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">{Math.round(breathingStats.totalMinutes)}</p>
              <p className="text-sm text-muted-foreground">Minutes</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-primary">{breathingStats.totalBreaths}</p>
              <p className="text-sm text-muted-foreground">Breaths</p>
            </div>
          </div>
        </motion.section>
      )}

      <motion.section variants={item}>
        <MilestoneCelebration />
      </motion.section>
    </motion.div>
  );
};
