import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MealTimelineProps {
  meals: any[];
  onMealDeleted: () => void;
}

export function MealTimeline({ meals, onMealDeleted }: MealTimelineProps) {
  const categoryLabels: Record<string, string> = {
    "cafe-manha": "Café da Manhã",
    "lanche-manha": "Lanche da Manhã",
    "almoco": "Almoço",
    "lanche-tarde": "Lanche da Tarde",
    "jantar": "Jantar",
    "ceia": "Ceia",
    "pre-treino": "Pré-Treino",
    "pos-treino": "Pós-Treino",
    "livre": "Livre",
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("nutrition_meals" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Refeição excluída");
      onMealDeleted();
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error("Erro ao excluir refeição");
    }
  };

  if (meals.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma refeição registrada hoje. Comece adicionando sua primeira refeição! 🍽️
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <Card key={meal.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{meal.name}</h3>
                <Badge variant="outline">
                  {categoryLabels[meal.category] || meal.category}
                </Badge>
                {meal.is_ai_generated && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    IA
                  </Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {format(new Date(meal.created_at), "HH:mm", { locale: ptBR })}
              </div>

              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="font-medium">{Math.round(meal.total_calories)}</span>
                  <span className="text-muted-foreground ml-1">kcal</span>
                </div>
                <div>
                  <span className="font-medium">{Math.round(meal.protein_g)}</span>
                  <span className="text-muted-foreground ml-1">g prot</span>
                </div>
                <div>
                  <span className="font-medium">{Math.round(meal.carbs_g)}</span>
                  <span className="text-muted-foreground ml-1">g carb</span>
                </div>
                <div>
                  <span className="font-medium">{Math.round(meal.fat_g)}</span>
                  <span className="text-muted-foreground ml-1">g gord</span>
                </div>
              </div>

              {meal.notes && (
                <p className="text-sm text-muted-foreground mt-2">{meal.notes}</p>
              )}

              {meal.nutrition_items && meal.nutrition_items.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Alimentos:</p>
                  {meal.nutrition_items.map((item: any, idx: number) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      • {item.name} {item.quantity && `(${item.quantity})`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(meal.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}