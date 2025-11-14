import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AISuggestionsPanelProps {
  dailySummary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  meals: any[];
}

interface AIAnalysis {
  insights: string[];
  alerts: string[];
  recommendations: string[];
}

export function AISuggestionsPanel({ dailySummary, meals }: AISuggestionsPanelProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const generateAnalysis = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get workout data
      const { data: workouts } = await supabase
        .from("workout_checkins" as any)
        .select("*")
        .eq("user_id", user.id)
        .gte("completed_at", `${today}T00:00:00`);

      const data = {
        dailySummary,
        meals: meals.map(m => ({
          name: m.name,
          category: m.category,
          calories: m.total_calories,
          protein: m.protein_g,
        })),
        workoutsToday: workouts?.length || 0,
        currentHour: new Date().getHours(),
      };

      const { data: aiResult, error } = await supabase.functions.invoke('nutrition-ai', {
        body: {
          type: 'analyze-nutrition',
          data,
        }
      });

      if (error) throw error;

      setAnalysis(aiResult);

      // Save insights to database
      if (aiResult.insights.length > 0 || aiResult.alerts.length > 0) {
        await supabase.from("nutrition_ai_logs" as any).insert(
          [
            ...aiResult.insights.map((text: string) => ({
              user_id: user.id,
              suggestion_text: text,
              type: 'insight',
            })),
            ...aiResult.alerts.map((text: string) => ({
              user_id: user.id,
              suggestion_text: text,
              type: 'alert',
            })),
          ]
        );
      }

      toast.success("Análise gerada pela IA!");
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast.error("Erro ao gerar análise");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meals.length > 0) {
      generateAnalysis();
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Análise Inteligente</h3>
        <Button
          onClick={generateAnalysis}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Analisando..." : "Atualizar Análise"}
        </Button>
      </div>

      {!analysis ? (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Clique em "Atualizar Análise" para receber insights personalizados da IA
          </p>
        </Card>
      ) : (
        <>
          {/* Alerts */}
          {analysis.alerts.length > 0 && (
            <Card className="p-4 border-orange-500/50 bg-orange-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400">
                    Alertas
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.alerts.map((alert, idx) => (
                      <li key={idx}>• {alert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Insights */}
          {analysis.insights.length > 0 && (
            <Card className="p-4 border-blue-500/50 bg-blue-500/5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                    Insights
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.insights.map((insight, idx) => (
                      <li key={idx}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card className="p-4 border-green-500/50 bg-green-500/5">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700 dark:text-green-400">
                    Recomendações
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}