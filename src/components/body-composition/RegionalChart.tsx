import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface BodySegment {
  region: string;
  lean_mass_kg: number | null;
  fat_mass_kg: number | null;
}

interface RegionalChartProps {
  measurementId?: string;
}

export function RegionalChart({ measurementId }: RegionalChartProps) {
  const [segments, setSegments] = useState<BodySegment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (measurementId) {
      fetchSegments();
    }
  }, [measurementId]);

  const fetchSegments = async () => {
    if (!measurementId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("body_segments" as any)
        .select("*")
        .eq("measurement_id", measurementId);

      if (error) throw error;
      setSegments((data || []) as any);
    } catch (error) {
      console.error("Error fetching segments:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = segments.map((seg) => ({
    region: seg.region,
    massa_magra: seg.lean_mass_kg || 0,
    gordura: seg.fat_mass_kg || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composição por Região Corporal</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: "Peso (kg)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="massa_magra" fill="hsl(142 76% 36%)" name="Massa Magra (kg)" />
              <Bar dataKey="gordura" fill="hsl(0 84% 60%)" name="Gordura (kg)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {loading
              ? "Carregando dados regionais..."
              : "Nenhuma medição regional disponível. Adicione medidas por região ao registrar uma nova medição."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
