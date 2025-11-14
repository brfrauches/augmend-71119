import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdded: () => void;
}

interface MealItem {
  name: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  quantity: string;
}

export function AddMealDialog({ open, onOpenChange, onMealAdded }: AddMealDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "livre",
    notes: "",
    description: "",
  });
  const [items, setItems] = useState<MealItem[]>([]);

  const categories = [
    { value: "cafe-manha", label: "Café da Manhã" },
    { value: "lanche-manha", label: "Lanche da Manhã" },
    { value: "almoco", label: "Almoço" },
    { value: "lanche-tarde", label: "Lanche da Tarde" },
    { value: "jantar", label: "Jantar" },
    { value: "ceia", label: "Ceia" },
    { value: "pre-treino", label: "Pré-Treino" },
    { value: "pos-treino", label: "Pós-Treino" },
    { value: "livre", label: "Livre" },
  ];

  const handleAICalculation = async () => {
    if (!formData.description.trim()) {
      toast.error("Descreva a refeição primeiro");
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nutrition-ai', {
        body: {
          type: 'calculate-macros',
          data: { description: formData.description }
        }
      });

      if (error) throw error;

      setItems(data.items.map((item: any) => ({
        name: item.name,
        calories: item.calories.toString(),
        protein_g: item.protein_g.toString(),
        carbs_g: item.carbs_g.toString(),
        fat_g: item.fat_g.toString(),
        quantity: item.quantity,
      })));

      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: formData.description }));
      }

      toast.success("Macros calculados pela IA!");
    } catch (error) {
      console.error("Error calculating macros:", error);
      toast.error("Erro ao calcular macros com IA");
    } finally {
      setAiLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, {
      name: "",
      calories: "",
      protein_g: "",
      carbs_g: "",
      fat_g: "",
      quantity: "",
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof MealItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name) return;

    setLoading(true);
    try {
      // Calculate totals
      const totals = items.reduce(
        (acc, item) => ({
          calories: acc.calories + (parseFloat(item.calories) || 0),
          protein: acc.protein + (parseFloat(item.protein_g) || 0),
          carbs: acc.carbs + (parseFloat(item.carbs_g) || 0),
          fat: acc.fat + (parseFloat(item.fat_g) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Insert meal
      const { data: meal, error: mealError } = await supabase
        .from("nutrition_meals" as any)
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          total_calories: totals.calories,
          protein_g: totals.protein,
          carbs_g: totals.carbs,
          fat_g: totals.fat,
          notes: formData.notes,
          is_ai_generated: aiLoading || false,
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Insert items if any
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          meal_id: (meal as any).id,
          name: item.name,
          calories: parseFloat(item.calories) || 0,
          protein_g: parseFloat(item.protein_g) || 0,
          carbs_g: parseFloat(item.carbs_g) || 0,
          fat_g: parseFloat(item.fat_g) || 0,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("nutrition_items" as any)
          .insert(itemsToInsert as any);

        if (itemsError) throw itemsError;
      }

      toast.success("Refeição registrada com sucesso! 🍽️");
      onMealAdded();
      onOpenChange(false);
      
      // Reset form
      setFormData({ name: "", category: "livre", notes: "", description: "" });
      setItems([]);
    } catch (error) {
      console.error("Error adding meal:", error);
      toast.error("Erro ao registrar refeição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Refeição</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição da Refeição (para IA)</Label>
              <div className="flex gap-2">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: arroz, feijão, frango grelhado, salada de tomate"
                  className="min-h-[80px]"
                />
                <Button
                  type="button"
                  onClick={handleAICalculation}
                  disabled={aiLoading}
                  variant="outline"
                  className="shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Refeição</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Almoço"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações adicionais"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Alimentos/Ingredientes</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={index} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <Input
                      placeholder="Nome do alimento"
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Quantidade"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    type="number"
                    placeholder="Calorias"
                    value={item.calories}
                    onChange={(e) => updateItem(index, "calories", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Proteína (g)"
                    value={item.protein_g}
                    onChange={(e) => updateItem(index, "protein_g", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Carbs (g)"
                    value={item.carbs_g}
                    onChange={(e) => updateItem(index, "carbs_g", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Gordura (g)"
                    value={item.fat_g}
                    onChange={(e) => updateItem(index, "fat_g", e.target.value)}
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Refeição"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}