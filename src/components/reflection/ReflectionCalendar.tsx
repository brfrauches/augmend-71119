
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface ReflectionCalendarProps {
  reflectionDates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const ReflectionCalendar = ({
  reflectionDates,
  selectedDate,
  onSelectDate,
}: ReflectionCalendarProps) => {
  const [month, setMonth] = useState<Date>(new Date());

  // Format reflection dates for highlighting
  const hasReflection = reflectionDates.map(date => 
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
  );

  // Identify streak days (consecutive reflection days)
  const getStreakDays = () => {
    const sortedDates = [...reflectionDates].sort((a, b) => a.getTime() - b.getTime());
    const streakDays: Date[] = [];
    
    let currentStreak: Date[] = [];
    let lastDate: Date | null = null;
    
    sortedDates.forEach(date => {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (lastDate) {
        const dayDiff = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          // Continue streak
          currentStreak.push(currentDate);
        } else {
          // Break in streak
          if (currentStreak.length >= 2) {
            // Only count as streak if 2+ consecutive days
            streakDays.push(...currentStreak);
          }
          currentStreak = [currentDate];
        }
      } else {
        currentStreak.push(currentDate);
      }
      
      lastDate = currentDate;
    });
    
    // Add final streak if it exists
    if (currentStreak.length >= 2) {
      streakDays.push(...currentStreak);
    }
    
    return streakDays.map(date => date.toISOString());
  };

  const streakDays = getStreakDays();

  const isDayWithReflection = (day: Date) => {
    return hasReflection.includes(
      new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString()
    );
  };

  const isDayInStreak = (day: Date) => {
    return streakDays.includes(
      new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString()
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="content-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gradient">Reflection Calendar</h3>
        <CalendarIcon className="h-5 w-5 text-primary" />
      </div>

      <style>
        {`
          .rdp-day_selected:not([disabled]) { 
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
          }
          .rdp-day_selected:hover:not([disabled]) { 
            background-color: hsl(var(--primary));
            opacity: 0.8;
          }
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
            background-color: hsl(var(--secondary));
          }
          .reflection-day:not(.rdp-day_selected) {
            background-color: hsl(var(--primary) / 0.1);
            color: hsl(var(--primary));
          }
          .streak-day:not(.rdp-day_selected) {
            border: 2px solid hsl(var(--primary));
          }
        `}
      </style>

      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={(day) => day && onSelectDate(day)}
        month={month}
        onMonthChange={setMonth}
        modifiersClassNames={{
          selected: "rdp-day_selected",
        }}
        modifiers={{
          reflectionDay: (day) => isDayWithReflection(day),
          streakDay: (day) => isDayInStreak(day),
        }}
        modifiersStyles={{
          reflectionDay: {
            fontWeight: "bold",
          },
          streakDay: {
            border: "2px solid var(--rdp-accent-color)",
            borderRadius: "100%",
          },
        }}
        className="rdp-custom"
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
      />

      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary/10 mr-2"></div>
          <span>Days with reflections</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-3 h-3 rounded-full border-2 border-primary mr-2"></div>
          <span>Reflection streak</span>
        </div>
      </div>
    </motion.div>
  );
};
