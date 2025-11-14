import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NutritionSummaryProps {
  summary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
}

export function NutritionSummary({ summary }: NutritionSummaryProps) {
  const macros = [
    {
      label: "Calorias",
      value: Math.round(summary.calories),
      unit: "kcal",
      goal: 2000,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Proteínas",
      value: Math.round(summary.protein),
      unit: "g",
      goal: 150,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Carboidratos",
      value: Math.round(summary.carbs),
      unit: "g",
      goal: 250,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Gorduras",
      value: Math.round(summary.fat),
      unit: "g",
      goal: 70,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Água",
      value: Math.round(summary.water),
      unit: "ml",
      goal: 2500,
      color: "text-cyan-600 dark:text-cyan-400",
    },
  ];

  const getTrendIcon = (value: number, goal: number) => {
    const percentage = (value / goal) * 100;
    if (percentage > 90 && percentage < 110) {
      return <Minus className="h-4 w-4 text-blue-500" />;
    } else if (percentage >= 110) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getProgressColor = (value: number, goal: number) => {
    const percentage = (value / goal) * 100;
    if (percentage > 90 && percentage < 110) return "bg-blue-500";
    if (percentage >= 110) return "bg-green-500";
    return "bg-red-500";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {macros.map((macro) => {
        const percentage = Math.min((macro.value / macro.goal) * 100, 100);
        return (
          <Card key={macro.label} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{macro.label}</span>
              {getTrendIcon(macro.value, macro.goal)}
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${macro.color}`}>
                {macro.value}
                <span className="text-sm font-normal ml-1">{macro.unit}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Meta: {macro.goal} {macro.unit}
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(macro.value, macro.goal)} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}