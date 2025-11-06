import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface WorkoutLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: () => void;
}

const templateWorkouts = [
  {
    name: "Iniciante - Corpo Inteiro",
    description: "Treino completo para iniciantes, 3x por semana",
    category: "Iniciante",
    difficulty: "Fácil",
    duration: 45,
    week_days: ["monday", "wednesday", "friday"],
    exercises: [
      { name: "Agachamento livre", sets: 3, reps: 12, load: 0 },
      { name: "Supino reto", sets: 3, reps: 10, load: 0 },
      { name: "Remada curvada", sets: 3, reps: 12, load: 0 },
      { name: "Desenvolvimento com halteres", sets: 3, reps: 10, load: 0 },
      { name: "Rosca direta", sets: 3, reps: 12, load: 0 },
      { name: "Tríceps pulley", sets: 3, reps: 12, load: 0 },
    ],
  },
  {
    name: "Intermediário - Hipertrofia",
    description: "Divisão de treino para ganho de massa muscular",
    category: "Intermediário",
    difficulty: "Médio",
    duration: 60,
    week_days: ["monday", "tuesday", "thursday", "friday"],
    exercises: [
      { name: "Supino inclinado", sets: 4, reps: 10, load: 0 },
      { name: "Supino reto", sets: 4, reps: 10, load: 0 },
      { name: "Crucifixo inclinado", sets: 3, reps: 12, load: 0 },
      { name: "Tríceps testa", sets: 4, reps: 12, load: 0 },
      { name: "Tríceps francês", sets: 3, reps: 12, load: 0 },
    ],
  },
  {
    name: "Avançado - Divisão ABC",
    description: "Treino avançado com divisão de grupos musculares",
    category: "Avançado",
    difficulty: "Difícil",
    duration: 75,
    week_days: ["monday", "wednesday", "friday"],
    exercises: [
      { name: "Supino reto", sets: 5, reps: 8, load: 0 },
      { name: "Supino inclinado", sets: 4, reps: 10, load: 0 },
      { name: "Crucifixo", sets: 4, reps: 12, load: 0 },
      { name: "Peck deck", sets: 3, reps: 15, load: 0 },
      { name: "Tríceps pulley", sets: 4, reps: 12, load: 0 },
      { name: "Tríceps francês", sets: 4, reps: 10, load: 0 },
    ],
  },
  {
    name: "Cardio & Resistência",
    description: "Treino funcional com foco em resistência cardiovascular",
    category: "Funcional",
    difficulty: "Médio",
    duration: 50,
    week_days: ["tuesday", "thursday", "saturday"],
    exercises: [
      { name: "Burpees", sets: 4, reps: 15, load: 0 },
      { name: "Mountain climbers", sets: 4, reps: 20, load: 0 },
      { name: "Jump squats", sets: 4, reps: 15, load: 0 },
      { name: "Prancha", sets: 4, reps: 60, load: 0 },
      { name: "Russian twist", sets: 4, reps: 30, load: 0 },
    ],
  },
];

export function WorkoutLibrary({
  open,
  onOpenChange,
  onSelectTemplate,
}: WorkoutLibraryProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectTemplate = async (template: any) => {
    setLoading(template.name);

    try {
      // Create workout from template
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user?.id,
          name: template.name,
          description: template.description,
          week_days: template.week_days,
          category: template.category,
          difficulty_level: template.difficulty,
          estimated_duration: template.duration,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create exercises
      const exercisesData = template.exercises.map((ex: any, index: number) => ({
        workout_id: workout.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        load: ex.load,
        notes: "",
        order_index: index,
      }));

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      toast.success("Treino adicionado com sucesso!");
      onSelectTemplate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error selecting template:", error);
      toast.error("Erro ao adicionar treino");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Biblioteca de Treinos</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templateWorkouts.map((template) => (
            <Card key={template.name} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="secondary">{template.category}</Badge>
                <Badge
                  variant={
                    template.difficulty === "Fácil"
                      ? "default"
                      : template.difficulty === "Médio"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {template.difficulty}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{template.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{template.exercises.length} exercícios</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="sm"
                onClick={() => handleSelectTemplate(template)}
                disabled={loading === template.name}
              >
                {loading === template.name
                  ? "Adicionando..."
                  : "Adicionar aos Meus Treinos"}
              </Button>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
