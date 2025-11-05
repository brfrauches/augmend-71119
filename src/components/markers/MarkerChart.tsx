import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MarkerValue {
  value: number;
  measured_at: string;
}

interface MarkerChartProps {
  values: MarkerValue[];
  unit: string;
  minReference: number | null;
  maxReference: number | null;
  personalGoal: number | null;
}

export function MarkerChart({
  values,
  unit,
  minReference,
  maxReference,
  personalGoal,
}: MarkerChartProps) {
  const chartData = values.map((v) => ({
    date: new Date(v.measured_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    value: v.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: unit, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [`${value} ${unit}`, 'Valor']}
        />
        
        {minReference && (
          <ReferenceLine
            y={minReference}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
            label={{ value: 'Mín', position: 'right', fontSize: 10 }}
          />
        )}
        
        {maxReference && (
          <ReferenceLine
            y={maxReference}
            stroke="hsl(var(--destructive))"
            strokeDasharray="3 3"
            label={{ value: 'Máx', position: 'right', fontSize: 10 }}
          />
        )}
        
        {personalGoal && (
          <ReferenceLine
            y={personalGoal}
            stroke="hsl(var(--accent))"
            strokeDasharray="5 5"
            label={{ value: 'Meta', position: 'right', fontSize: 10 }}
          />
        )}
        
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
