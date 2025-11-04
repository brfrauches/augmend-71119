
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Award } from "lucide-react";
import { useEffect, useState } from "react";
import { getMilestonesForUI } from "@/services/achievementService";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  date?: string;
}

export const MilestoneCelebration = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch milestones when component mounts
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        // This will work with both local storage and the API
        // Using a temporary userId until auth is fully implemented
        const tempUserId = localStorage.getItem('userId') || '12345';
        const fetchedMilestones = await getMilestonesForUI(tempUserId);
        setMilestones(fetchedMilestones);
      } catch (error) {
        console.error("Error fetching milestones:", error);
        toast({
          title: "Error fetching milestones",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [toast]);

  const celebrateMilestone = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Your Milestones</h3>
        <Award className="w-6 h-6 text-primary" />
      </div>

      {loading ? (
        <div className="flex justify-center p-6">
          <div className="animate-pulse h-6 w-6 rounded-full bg-primary/50"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {milestones.map((milestone) => (
            <motion.div
              key={milestone.id}
              className={`p-4 rounded-lg border ${
                milestone.achieved
                  ? "border-primary bg-primary/10"
                  : "border-muted bg-muted/10"
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                if (milestone.achieved) celebrateMilestone();
              }}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-3">{milestone.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{milestone.title}</h4>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  {milestone.achieved && milestone.date && (
                    <p className="text-xs text-primary mt-1">
                      Achieved on {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {milestone.achieved && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2"
                  >
                    <span className="text-primary">✓</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
