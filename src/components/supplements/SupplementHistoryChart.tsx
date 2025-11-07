import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SupplementLog {
  taken_at: string;
}

interface SupplementHistoryChartProps {
  logs: SupplementLog[];
}

export function SupplementHistoryChart({ logs }: SupplementHistoryChartProps) {
  // Create data for last 30 days
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29);
  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

  const logsByDate = logs.reduce((acc, log) => {
    acc[log.taken_at] = (acc[log.taken_at] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return {
      date: format(day, "dd/MM", { locale: ptBR }),
      fullDate: dateStr,
      count: logsByDate[dateStr] || 0,
    };
  });

  const totalDays = days.length;
  const daysWithUsage = chartData.filter((d) => d.count > 0).length;
  const adherence = Math.round((daysWithUsage / totalDays) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consistência dos Últimos 30 Dias</CardTitle>
        <CardDescription>
          Você registrou uso em {daysWithUsage} de {totalDays} dias ({adherence}% de aderência)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
