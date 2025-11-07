import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export function WeeklyUsageChart() {
  const [weekData, setWeekData] = useState<{ date: Date; hasUsage: boolean }[]>([]);
  const [adherence, setAdherence] = useState(0);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      const weekStart = startOfWeek(today, { locale: ptBR });
      const weekEnd = endOfWeek(today, { locale: ptBR });

      // Fetch logs for the week
      const { data: logs, error } = await supabase
        .from("supplement_logs")
        .select("taken_at")
        .eq("user_id", user.id)
        .gte("taken_at", format(weekStart, "yyyy-MM-dd"))
        .lte("taken_at", format(weekEnd, "yyyy-MM-dd"));

      if (error) throw error;

      const logDates = new Set(logs?.map((log) => log.taken_at) || []);

      // Create week data
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = subDays(today, 6 - i);
        const dateStr = format(date, "yyyy-MM-dd");
        week.push({
          date,
          hasUsage: logDates.has(dateStr),
        });
      }

      setWeekData(week);

      // Calculate adherence
      const daysWithUsage = week.filter((d) => d.hasUsage).length;
      setAdherence(Math.round((daysWithUsage / 7) * 100));
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Semanal</CardTitle>
        <CardDescription>
          Sua consistência nos últimos 7 dias: <strong>{adherence}%</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-2">
          {weekData.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  day.hasUsage
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {day.hasUsage ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {format(day.date, "EEE", { locale: ptBR })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
