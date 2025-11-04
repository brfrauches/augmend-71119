
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SearchBar } from "./content/SearchBar";
import { CategoryFilter } from "./content/CategoryFilter";
import { ContentCard, ContentItem } from "./content/ContentCard";
import { 
  fetchContent, 
  fetchContentByType, 
  toggleBookmark, 
  searchContent 
} from "@/services/contentService";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

type ContentCategory = "All" | "Exercises" | "Articles" | "Videos" | "Audio";

export const ContentLibrary = () => {
  const [activeCategory, setActiveCategory] = useState<ContentCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const { toast } = useToast();

  const categories: ContentCategory[] = ["All", "Exercises", "Articles", "Videos", "Audio"];

  // Convert from plural category to singular for API calls
  const getCategoryType = (category: ContentCategory): string => {
    if (category === "All") return "all";
    return category.slice(0, -1).toLowerCase();
  };

  // Use React Query for data fetching
  const { isLoading, error, data } = useQuery({
    queryKey: ['content', activeCategory],
    queryFn: () => 
      activeCategory === "All" 
        ? fetchContent() 
        : fetchContentByType(getCategoryType(activeCategory))
  });

  // Handle search
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['contentSearch', searchQuery],
    queryFn: () => searchContent(searchQuery),
    enabled: searchQuery.length > 0
  });

  useEffect(() => {
    if (searchQuery && searchResults) {
      setContentItems(searchResults);
    } else if (!searchQuery && data) {
      setContentItems(data);
    }
  }, [data, searchResults, searchQuery]);

  const handleToggleBookmark = async (id: string) => {
    try {
      const result = await toggleBookmark(id);
      if (result) {
        // Update the content items to reflect the bookmark change
        setContentItems(prevItems => 
          prevItems.map(item => 
            item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
          )
        );
        toast({
          title: result.isBookmarked ? "Content bookmarked" : "Bookmark removed",
          description: `"${result.title}" has been ${result.isBookmarked ? 'added to' : 'removed from'} your bookmarks.`
        });
      }
    } catch (error) {
      console.error(`Error toggling bookmark for item ${id}:`, error);
      toast({
        title: "Bookmark update failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleContentOpen = (id: string) => {
    // This would navigate to content detail page in a real implementation
    console.log(`Opening content with id: ${id}`);
    toast({
      title: "Opening content",
      description: "Content detail view would open here."
    });
  };

  const isLoaded = !isLoading && !isSearching;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <CategoryFilter 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
      />

      {!isLoaded ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {error && (
            <motion.div variants={item} className="text-center py-8 text-red-500">
              Error loading content. Please try again later.
            </motion.div>
          )}

          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentItems.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onBookmark={handleToggleBookmark}
                onOpen={handleContentOpen}
              />
            ))}
          </motion.div>

          {contentItems.length === 0 && !error && (
            <motion.div
              variants={item}
              className="text-center py-12 text-muted-foreground"
            >
              No content found matching your criteria
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};
