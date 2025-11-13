import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BodyMeasurement {
  id: string;
  measured_at: string;
  weight_kg: number;
  fat_percent: number | null;
}

interface WeightFatChartProps {
  measurements: BodyMeasurement[];
}

type Period = "7d" | "30d" | "90d" | "1y" | "all";

export function WeightFatChart({ measurements }: WeightFatChartProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const filterByPeriod = (data: BodyMeasurement[]) => {
    if (period === "all") return data;

    const now = new Date();
    const daysMap = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    };

    const days = daysMap[period];
    const cutoffDate = new Date(now.setDate(now.getDate() - days));

    return data.filter((m) => new Date(m.measured_at) >= cutoffDate);
  };

  const chartData = filterByPeriod(measurements)
    .reverse()
    .map((m) => ({
      date: format(new Date(m.measured_at), "dd/MM", { locale: ptBR }),
      peso: m.weight_kg,
      gordura: m.fat_percent || 0,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Peso e Percentual de Gordura</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={period === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("7d")}
            >
              7 dias
            </Button>
            <Button
              variant={period === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("30d")}
            >
              30 dias
            </Button>
            <Button
              variant={period === "90d" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("90d")}
            >
              90 dias
            </Button>
            <Button
              variant={period === "1y" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("1y")}
            >
              1 ano
            </Button>
            <Button
              variant={period === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("all")}
            >
              Tudo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: "Peso (kg)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Gordura (%)", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="peso"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Peso (kg)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="gordura"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                name="Gordura (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma medição neste período
          </div>
        )}
      </CardContent>
    </Card>
  );
}
