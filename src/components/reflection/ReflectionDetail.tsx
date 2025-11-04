
import { motion } from "framer-motion";
import { Calendar, Edit2, Download, Trash2 } from "lucide-react";
import { Reflection } from "@/types/reflection";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReflectionDetailProps {
  reflection: Reflection;
  onEdit: (reflection: Reflection) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const ReflectionDetail = ({
  reflection,
  onEdit,
  onDelete,
  onClose
}: ReflectionDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(reflection.text);
  const { toast } = useToast();

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

  const handleSave = () => {
    if (editedText.trim() === "") {
      toast({
        title: "Cannot save empty reflection",
        description: "Please enter some text for your reflection.",
        variant: "destructive"
      });
      return;
    }

    onEdit({
      ...reflection,
      text: editedText
    });
    
    setIsEditing(false);
    
    toast({
      title: "Reflection updated",
      description: "Your reflection has been successfully updated."
    });
  };

  const handleDelete = () => {
    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this reflection? This action cannot be undone.")) {
      onDelete(reflection.id);
      onClose();
      
      toast({
        title: "Reflection deleted",
        description: "Your reflection has been permanently deleted."
      });
    }
  };

  const handleExport = () => {
    const formattedDate = new Date(reflection.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const content = `
Daily Reflection - ${formattedDate}
Mood: ${reflection.mood} ${getMoodEmoji(reflection.mood)}

${reflection.text}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-${formattedDate.replace(/,\s/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Reflection exported",
      description: "Your reflection has been exported as a text file."
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="content-card"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-xl mr-2">{getMoodEmoji(reflection.mood)}</span>
          <h3 className="text-lg font-medium">{reflection.mood}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(reflection.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="input-minimal w-full h-60 mb-4"
          placeholder="Write your reflection here..."
        />
      ) : (
        <div className="bg-secondary/30 p-4 rounded-lg mb-4 min-h-[200px] whitespace-pre-wrap">
          {reflection.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
              >
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(reflection.text);
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/70 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 frosted-glass flex items-center"
                title="Edit reflection"
              >
                <Edit2 className="h-4 w-4 text-foreground/70" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 frosted-glass flex items-center"
                title="Export reflection"
              >
                <Download className="h-4 w-4 text-foreground/70" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-destructive bg-destructive/10 rounded-lg flex items-center"
                title="Delete reflection"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        
        {!isEditing && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/70 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </motion.div>
  );
};
