
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Save, Smile } from "lucide-react";
import { getDailyPrompt } from "@/lib/reflection-prompts";

interface DailyPromptProps {
  date?: Date;
  onSave: (reflection: { text: string, mood: string, date: Date }) => void;
}

export const DailyPrompt = ({ date = new Date(), onSave }: DailyPromptProps) => {
  const [prompt, setPrompt] = useState("");
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState<string>("Neutral");
  const { toast } = useToast();

  const moodOptions = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😌", label: "Calm" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😰", label: "Anxious" },
    { emoji: "😤", label: "Frustrated" }
  ];

  useEffect(() => {
    const dailyPrompt = getDailyPrompt(date);
    setPrompt(dailyPrompt);
  }, [date]);

  const handleSave = () => {
    if (reflection.trim().length === 0) {
      toast({
        title: "Cannot save empty reflection",
        description: "Please write a reflection before saving.",
        variant: "destructive"
      });
      return;
    }

    onSave({
      text: reflection,
      mood,
      date: new Date(date)
    });

    toast({
      title: "Reflection saved",
      description: "Your daily reflection has been saved successfully."
    });

    setReflection("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="content-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gradient">Daily Reflection</h3>
        <div className="flex items-center text-muted-foreground text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <p className="text-foreground mb-6 text-lg italic">{prompt}</p>

      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        className="input-minimal w-full h-40 mb-4"
        placeholder="Write your reflection here..."
      />

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center">
            <Smile className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground">How are you feeling?</span>
          </div>
          <div className="flex space-x-2">
            {moodOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => setMood(option.label)}
                className={`p-2 rounded-full transition-all ${
                  mood === option.label
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "hover:bg-secondary"
                }`}
                title={option.label}
              >
                <span className="text-xl">{option.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="button-primary flex items-center justify-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Reflection
        </motion.button>
      </div>
    </motion.div>
  );
};
