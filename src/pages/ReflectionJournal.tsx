
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DailyPrompt } from "@/components/reflection/DailyPrompt";
import { ReflectionCalendar } from "@/components/reflection/ReflectionCalendar";
import { ReflectionHistory } from "@/components/reflection/ReflectionHistory";
import { ReflectionDetail } from "@/components/reflection/ReflectionDetail";
import { Reflection } from "@/types/reflection";
import { v4 as uuidv4 } from "uuid";
import { Book, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchReflections, 
  createReflection, 
  updateReflection, 
  deleteReflection 
} from "@/services/reflectionService";

const ReflectionJournal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load reflections from API on component mount
  useEffect(() => {
    const loadReflections = async () => {
      try {
        setIsLoading(true);
        const data = await fetchReflections();
        setReflections(data);
      } catch (error) {
        console.error("Error loading reflections:", error);
        toast({
          title: "Failed to load reflections",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReflections();
  }, [toast]);

  const handleSaveReflection = async (newReflection: { text: string, mood: string, date: Date }) => {
    // Check if a reflection for this date already exists
    const existingIndex = reflections.findIndex(r => 
      new Date(r.date).toDateString() === newReflection.date.toDateString()
    );
    
    try {
      if (existingIndex >= 0) {
        // Update existing reflection
        const reflectionToUpdate = reflections[existingIndex];
        const updatedData = {
          text: newReflection.text,
          mood: newReflection.mood,
          updatedAt: new Date().toISOString()
        };
        
        const updated = await updateReflection(reflectionToUpdate.id, updatedData);
        if (updated) {
          const updatedReflections = [...reflections];
          updatedReflections[existingIndex] = updated;
          setReflections(updatedReflections);
          toast({
            title: "Reflection updated",
            description: "Your daily reflection has been updated successfully."
          });
        }
      } else {
        // Create new reflection
        const reflectionToAdd: Reflection = {
          id: uuidv4(),
          text: newReflection.text,
          mood: newReflection.mood,
          date: newReflection.date.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const created = await createReflection(reflectionToAdd);
        setReflections([...reflections, created]);
        toast({
          title: "Reflection saved",
          description: "Your daily reflection has been saved successfully."
        });
      }
    } catch (error) {
      console.error("Error saving reflection:", error);
      toast({
        title: "Failed to save reflection",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleEditReflection = async (editedReflection: Reflection) => {
    try {
      const updated = await updateReflection(editedReflection.id, editedReflection);
      if (updated) {
        const updatedReflections = reflections.map(reflection => 
          reflection.id === editedReflection.id ? updated : reflection
        );
        setReflections(updatedReflections);
        setSelectedReflection(updated);
        toast({
          title: "Reflection updated",
          description: "Your reflection has been updated successfully."
        });
      }
    } catch (error) {
      console.error("Error updating reflection:", error);
      toast({
        title: "Failed to update reflection",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReflection = async (id: string) => {
    try {
      const success = await deleteReflection(id);
      if (success) {
        setReflections(reflections.filter(reflection => reflection.id !== id));
        setSelectedReflection(null);
        toast({
          title: "Reflection deleted",
          description: "Your reflection has been deleted successfully."
        });
      }
    } catch (error) {
      console.error("Error deleting reflection:", error);
      toast({
        title: "Failed to delete reflection",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  // Find if there's a reflection for the currently selected date
  const reflectionForSelectedDate = reflections.find(reflection => 
    new Date(reflection.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Top Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-full frosted-glass"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-foreground/70" />
              </button>
              <h1 className="text-xl font-semibold text-gradient flex items-center">
                <Book className="w-5 h-5 mr-2" />
                Reflection Journal
              </h1>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {selectedReflection ? (
                <ReflectionDetail
                  reflection={selectedReflection}
                  onEdit={handleEditReflection}
                  onDelete={handleDeleteReflection}
                  onClose={() => setSelectedReflection(null)}
                />
              ) : (
                <DailyPrompt 
                  date={selectedDate}
                  onSave={handleSaveReflection}
                />
              )}
              
              <ReflectionHistory
                reflections={reflections}
                onSelectReflection={setSelectedReflection}
              />
            </div>
            
            <div className="space-y-6">
              <ReflectionCalendar
                reflectionDates={reflections.map(r => new Date(r.date))}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  // If there's a reflection for this date, show it
                  const reflection = reflections.find(r => 
                    new Date(r.date).toDateString() === date.toDateString()
                  );
                  setSelectedReflection(reflection || null);
                }}
              />
              
              {/* Additional stats or info could go here */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReflectionJournal;
