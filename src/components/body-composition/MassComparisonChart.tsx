import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BodyMeasurement {
  id: string;
  measured_at: string;
  lean_mass_kg: number | null;
  fat_weight_kg: number | null;
}

interface MassComparisonChartProps {
  measurements: BodyMeasurement[];
}

type Period = "7d" | "30d" | "90d" | "1y" | "all";

export function MassComparisonChart({ measurements }: MassComparisonChartProps) {
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
      massa_magra: m.lean_mass_kg || 0,
      massa_gorda: m.fat_weight_kg || 0,
    }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Massa Magra vs Massa de Gordura</CardTitle>
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
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "Peso (kg)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="massa_magra"
                stackId="1"
                stroke="hsl(142 76% 36%)"
                fill="hsl(142 76% 36% / 0.3)"
                name="Massa Magra (kg)"
              />
              <Area
                type="monotone"
                dataKey="massa_gorda"
                stackId="1"
                stroke="hsl(0 84% 60%)"
                fill="hsl(0 84% 60% / 0.3)"
                name="Massa de Gordura (kg)"
              />
            </AreaChart>
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
