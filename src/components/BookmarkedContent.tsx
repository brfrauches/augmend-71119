
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchBookmarkedContent, toggleBookmark } from "@/services/contentService";
import { ContentItem } from "./content/ContentCard";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Bookmark, BookmarkX, Clock } from "lucide-react";

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

export const BookmarkedContent = () => {
  const [bookmarkedItems, setBookmarkedItems] = useState<ContentItem[]>([]);
  const { toast } = useToast();

  // Use React Query for data fetching
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['bookmarkedContent'],
    queryFn: () => fetchBookmarkedContent()
  });

  useEffect(() => {
    if (data) {
      setBookmarkedItems(data);
    }
  }, [data]);

  const handleToggleBookmark = async (id: string) => {
    try {
      await toggleBookmark(id);
      
      // Remove from list since we're in the bookmarks view
      setBookmarkedItems(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "Bookmark removed",
        description: "Content removed from your bookmarks."
      });
      
      // Refresh the data
      refetch();
    } catch (error) {
      console.error(`Error removing bookmark for item ${id}:`, error);
      toast({
        title: "Failed to remove bookmark",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleOpenContent = (id: string) => {
    // This would navigate to content detail page in a real implementation
    console.log(`Opening bookmarked content with id: ${id}`);
    toast({
      title: "Opening content",
      description: "Bookmarked content detail view would open here."
    });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="text-left">
        <h2 className="text-2xl font-semibold text-gradient">Bookmarks</h2>
        <p className="text-muted-foreground mt-2">Your saved content for easy access</p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <motion.div variants={item} className="text-center py-8 text-red-500">
          Error loading bookmarks. Please try again later.
        </motion.div>
      ) : bookmarkedItems.length > 0 ? (
        <motion.div variants={item} className="space-y-4">
          {bookmarkedItems.map((item) => (
            <motion.div
              key={item.id}
              className="content-card p-4"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gradient">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  
                  <div className="mt-3 flex items-center space-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.duration}
                    </span>
                    <span className="px-2 py-1 rounded-full frosted-glass text-xs">
                      {item.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full frosted-glass text-xs capitalize">
                      {item.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleBookmark(item.id)}
                  className="p-2 rounded-full frosted-glass text-red-500 hover:bg-red-50"
                >
                  <BookmarkX className="w-4 h-4" />
                </button>
              </div>
              
              {item.progress !== undefined && item.progress > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary font-medium">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                </div>
              )}
              
              <button
                onClick={() => handleOpenContent(item.id)}
                className="mt-3 w-full py-2 px-4 text-sm button-primary"
              >
                {item.progress && item.progress > 0 ? "Continue" : "Start"} {item.type}
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="text-center py-12 rounded-lg bg-secondary/30 backdrop-blur-sm"
        >
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No bookmarked content yet</p>
          <p className="text-sm text-muted-foreground/80 mt-1">
            Save content from the library to access it here
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
