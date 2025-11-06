import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  load: number;
  notes: string;
}

interface CreateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const weekDays = [
  { value: "monday", label: "Seg" },
  { value: "tuesday", label: "Ter" },
  { value: "wednesday", label: "Qua" },
  { value: "thursday", label: "Qui" },
  { value: "friday", label: "Sex" },
  { value: "saturday", label: "Sáb" },
  { value: "sunday", label: "Dom" },
];

export function CreateWorkoutDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkoutDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: 3, reps: 10, load: 0, notes: "" },
  ]);

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { name: "", sets: 3, reps: 10, load: 0, notes: "" },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (
    index: number,
    field: keyof Exercise,
    value: any
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Digite o nome do treino");
      return;
    }

    if (exercises.length === 0 || !exercises[0].name.trim()) {
      toast.error("Adicione pelo menos um exercício");
      return;
    }

    setLoading(true);

    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user?.id,
          name,
          description,
          week_days: selectedDays,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create exercises
      const exercisesData = exercises
        .filter((ex) => ex.name.trim())
        .map((ex, index) => ({
          workout_id: workout.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          load: ex.load,
          notes: ex.notes,
          order_index: index,
        }));

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      toast.success("Treino criado com sucesso!");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating workout:", error);
      toast.error("Erro ao criar treino");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedDays([]);
    setExercises([{ name: "", sets: 3, reps: 10, load: 0, notes: "" }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Treino</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Treino</Label>
            <Input
              id="name"
              placeholder="Ex: Treino A - Peito e Tríceps"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Notas sobre o treino..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Dias da Semana</Label>
            <div className="flex gap-2 mt-2">
              {weekDays.map((day) => (
                <div key={day.value} className="flex items-center">
                  <Checkbox
                    id={day.value}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <label
                    htmlFor={day.value}
                    className="ml-2 text-sm cursor-pointer"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Exercícios</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddExercise}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {exercises.map((exercise, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 mb-3 space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Exercício {index + 1}</Label>
                  {exercises.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <Input
                  placeholder="Nome do exercício"
                  value={exercise.name}
                  onChange={(e) =>
                    handleExerciseChange(index, "name", e.target.value)
                  }
                />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Séries</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) =>
                        handleExerciseChange(
                          index,
                          "sets",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Repetições</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) =>
                        handleExerciseChange(
                          index,
                          "reps",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Carga (kg)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.load}
                      onChange={(e) =>
                        handleExerciseChange(
                          index,
                          "load",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                <Input
                  placeholder="Observações (opcional)"
                  value={exercise.notes}
                  onChange={(e) =>
                    handleExerciseChange(index, "notes", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Criando..." : "Criar Treino"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
