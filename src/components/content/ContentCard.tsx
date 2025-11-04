
import { motion } from "framer-motion";
import { Book, Heart, Clock, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "exercise" | "article" | "video" | "audio";
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  progress?: number;
  isBookmarked: boolean;
}

interface ContentCardProps {
  content: ContentItem;
  onBookmark: (id: string) => void;
  onOpen?: (id: string) => void;
}

export const ContentCard = ({ content, onBookmark, onOpen }: ContentCardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <Book className="w-4 h-4 mr-1" />;
      case "video":
        return <BarChart className="w-4 h-4 mr-1" />;
      case "audio":
        return <BarChart className="w-4 h-4 mr-1" />;
      case "exercise":
        return <BarChart className="w-4 h-4 mr-1" />;
      default:
        return <Book className="w-4 h-4 mr-1" />;
    }
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen(content.id);
    }
  };

  return (
    <motion.div
      className="content-card"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gradient">{content.title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{content.description}</p>
          
          <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              {getTypeIcon(content.type)}
              <Clock className="w-4 h-4 ml-2 mr-1" />
              {content.duration}
            </span>
            <span className="px-3 py-1 rounded-full frosted-glass text-xs font-medium">
              {content.difficulty}
            </span>
          </div>

          {content.progress !== undefined && content.progress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-medium">{content.progress}%</span>
              </div>
              <Progress value={content.progress} className="h-2" />
            </div>
          )}
        </div>

        <button
          onClick={() => onBookmark(content.id)}
          className={`ml-4 p-2 rounded-full transition-all duration-300 ${
            content.isBookmarked
              ? "bg-red-50 text-red-500 hover:bg-red-100 hover:shadow-lg"
              : "frosted-glass text-muted-foreground hover:text-foreground hover:shadow-lg"
          }`}
        >
          <Heart className={`w-5 h-5 ${content.isBookmarked ? "fill-current" : ""}`} />
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="button-primary mt-4 w-full"
        onClick={handleOpen}
      >
        {content.progress ? "Continue" : "Start"} {content.type}
      </motion.button>
    </motion.div>
  );
};
