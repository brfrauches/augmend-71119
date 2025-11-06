import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

interface CheckIn {
  completed_at: string;
}

interface WeeklyConsistencyChartProps {
  checkins: CheckIn[];
}

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function WeeklyConsistencyChart({
  checkins,
}: WeeklyConsistencyChartProps) {
  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  };

  const startOfWeek = getStartOfWeek();

  const daysWithCheckins = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    const hasCheckin = checkins.some((checkin) => {
      const checkinDate = new Date(checkin.completed_at);
      return (
        checkinDate.getDate() === date.getDate() &&
        checkinDate.getMonth() === date.getMonth() &&
        checkinDate.getFullYear() === date.getFullYear()
      );
    });

    return {
      day: dayLabels[i],
      hasCheckin,
      date,
      isToday:
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth(),
    };
  });

  return (
    <div className="flex items-center justify-between gap-2">
      {daysWithCheckins.map((day, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-2 flex-1 min-w-0"
        >
          <span
            className={`text-xs font-medium ${
              day.isToday ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {day.day}
          </span>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              day.hasCheckin
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            } ${day.isToday ? "ring-2 ring-primary ring-offset-2" : ""}`}
          >
            {day.hasCheckin ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
