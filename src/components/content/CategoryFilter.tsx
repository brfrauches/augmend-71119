
import { motion } from "framer-motion";

type ContentCategory = "All" | "Exercises" | "Articles" | "Videos" | "Audio";

interface CategoryFilterProps {
  activeCategory: ContentCategory;
  setActiveCategory: (category: ContentCategory) => void;
  categories: ContentCategory[];
}

export const CategoryFilter = ({ 
  activeCategory, 
  setActiveCategory, 
  categories 
}: CategoryFilterProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="flex overflow-x-auto space-x-3 pb-2 scrollbar-none"
    >
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
            activeCategory === category
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {category}
        </motion.button>
      ))}
    </motion.div>
  );
};
