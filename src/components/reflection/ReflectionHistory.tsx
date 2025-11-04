
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Filter, Calendar, SortAsc, SortDesc } from "lucide-react";
import { Reflection } from "@/types/reflection";

interface ReflectionHistoryProps {
  reflections: Reflection[];
  onSelectReflection: (reflection: Reflection) => void;
}

export const ReflectionHistory = ({ 
  reflections, 
  onSelectReflection 
}: ReflectionHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterMood, setFilterMood] = useState<string | null>(null);

  const availableMoods = [...new Set(reflections.map(r => r.mood))];

  const sortedAndFilteredReflections = [...reflections]
    .filter(reflection => 
      (searchTerm === "" || 
       reflection.text.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterMood === null || reflection.mood === filterMood)
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
  };

  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case "Happy": return "😊";
      case "Calm": return "😌";
      case "Neutral": return "😐";
      case "Sad": return "😔";
      case "Anxious": return "😰";
      case "Frustrated": return "😤";
      default: return "😐";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="content-card space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gradient">Reflection History</h3>
        <button 
          onClick={toggleSortDirection}
          className="p-2 rounded-full frosted-glass"
          title={`Sort by date: ${sortDirection === "desc" ? "Newest first" : "Oldest first"}`}
        >
          {sortDirection === "desc" ? (
            <SortDesc className="h-4 w-4 text-foreground/70" />
          ) : (
            <SortAsc className="h-4 w-4 text-foreground/70" />
          )}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reflections..."
            className="input-minimal w-full pl-9"
          />
        </div>
        
        <div className="relative">
          <select
            value={filterMood || ""}
            onChange={(e) => setFilterMood(e.target.value || null)}
            className="input-minimal appearance-none pr-10"
          >
            <option value="">All moods</option>
            {availableMoods.map(mood => (
              <option key={mood} value={mood}>{getMoodEmoji(mood)} {mood}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {sortedAndFilteredReflections.length > 0 ? (
          sortedAndFilteredReflections.map(reflection => (
            <motion.div
              key={reflection.id}
              whileHover={{ scale: 1.01 }}
              className="p-4 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => onSelectReflection(reflection)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{getMoodEmoji(reflection.mood)}</span>
                  <span className="font-medium">{reflection.mood}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(reflection.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {reflection.text}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Search className="h-10 w-10 mb-2 text-muted-foreground/50" />
            <h4 className="text-foreground font-medium text-lg">No reflections found</h4>
            <p className="text-muted-foreground">
              {searchTerm || filterMood ? 
                "Try adjusting your search or filter criteria" : 
                "Start your reflection journey today"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
