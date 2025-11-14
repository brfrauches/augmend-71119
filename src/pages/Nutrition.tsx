import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Droplets, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AddMealDialog } from "@/components/nutrition/AddMealDialog";
import { AddWaterDialog } from "@/components/nutrition/AddWaterDialog";
import { MealTimeline } from "@/components/nutrition/MealTimeline";
import { NutritionSummary } from "@/components/nutrition/NutritionSummary";
import { AISuggestionsPanel } from "@/components/nutrition/AISuggestionsPanel";

interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export default function Nutrition() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [addWaterOpen, setAddWaterOpen] = useState(false);
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
  });
  const [meals, setMeals] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Load today's meals
      const { data: mealsData, error: mealsError } = await supabase
        .from("nutrition_meals" as any)
        .select("*, nutrition_items(*)")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .order("created_at", { ascending: true });

      if (mealsError) throw mealsError;
      setMeals(mealsData || []);

      // Calculate daily summary
      const summary = (mealsData || []).reduce(
        (acc: DailySummary, meal: any) => ({
          calories: acc.calories + (parseFloat(meal.total_calories) || 0),
          protein: acc.protein + (parseFloat(meal.protein_g) || 0),
          carbs: acc.carbs + (parseFloat(meal.carbs_g) || 0),
          fat: acc.fat + (parseFloat(meal.fat_g) || 0),
          water: acc.water,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 }
      );

      // Load today's water intake
      const { data: waterData, error: waterError } = await supabase
        .from("water_logs" as any)
        .select("amount_ml")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      if (waterError) throw waterError;
      
      summary.water = (waterData || []).reduce(
        (acc: number, log: any) => acc + log.amount_ml,
        0
      );

      setDailySummary(summary);
    } catch (error) {
      console.error("Error loading nutrition data:", error);
      toast.error("Erro ao carregar dados nutricionais");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados nutricionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Nutrição 🍎</h1>
          <p className="text-muted-foreground">
            Olá, {user?.email?.split('@')[0]}! Acompanhe aqui sua alimentação e hidratação 📈
          </p>
        </div>

        {/* Summary Cards */}
        <NutritionSummary summary={dailySummary} />

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => setAddMealOpen(true)}
            className="h-16 text-base"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Registrar Refeição
          </Button>
          <Button
            onClick={() => setAddWaterOpen(true)}
            variant="outline"
            className="h-16 text-base"
            size="lg"
          >
            <Droplets className="mr-2 h-5 w-5" />
            Registrar Água
          </Button>
          <Button
            variant="outline"
            className="h-16 text-base"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Sugestão da IA
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
            <TabsTrigger value="ai">Sugestões da IA</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <MealTimeline meals={meals} onMealDeleted={loadData} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AISuggestionsPanel
              dailySummary={dailySummary}
              meals={meals}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddMealDialog
        open={addMealOpen}
        onOpenChange={setAddMealOpen}
        onMealAdded={loadData}
      />
      <AddWaterDialog
        open={addWaterOpen}
        onOpenChange={setAddWaterOpen}
        onWaterAdded={loadData}
      />
    </div>
  );
}