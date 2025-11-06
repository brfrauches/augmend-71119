import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AIWorkoutDialog({
  open,
  onOpenChange,
  onSuccess,
}: AIWorkoutDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Digite uma descrição do treino desejado");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-workout",
        {
          body: { prompt },
        }
      );

      if (error) throw error;

      setGeneratedWorkout(data);
      toast.success("Treino gerado com sucesso!");
    } catch (error) {
      console.error("Error generating workout:", error);
      toast.error("Erro ao gerar treino com IA");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedWorkout) return;

    setLoading(true);

    try {
      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({
          user_id: user?.id,
          name: generatedWorkout.name,
          description: generatedWorkout.description,
          week_days: generatedWorkout.week_days || [],
          category: generatedWorkout.category,
          difficulty_level: generatedWorkout.difficulty,
          estimated_duration: generatedWorkout.duration,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create exercises
      const exercisesData = generatedWorkout.exercises.map(
        (ex: any, index: number) => ({
          workout_id: workout.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          load: ex.load || 0,
          notes: ex.notes || "",
          order_index: index,
        })
      );

      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      toast.success("Treino salvo com sucesso!");
      onSuccess();
      onOpenChange(false);
      setPrompt("");
      setGeneratedWorkout(null);
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Erro ao salvar treino");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Treino com IA
          </DialogTitle>
        </DialogHeader>

        {!generatedWorkout ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">
                Descreva o treino que você deseja
              </Label>
              <Textarea
                id="prompt"
                placeholder="Ex: Monte um treino de força para 4 dias por semana focado em peito e pernas, nível intermediário..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
              />
            </div>

            <div className="bg-primary/5 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Dicas:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Especifique seu nível (iniciante, intermediário, avançado)</li>
                <li>• Mencione grupos musculares desejados</li>
                <li>• Indique quantos dias por semana quer treinar</li>
                <li>• Informe seu objetivo (hipertrofia, emagrecimento, performance)</li>
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando treino...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Treino
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">
                {generatedWorkout.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {generatedWorkout.description}
              </p>
              <div className="flex gap-2 flex-wrap mb-3">
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">
                  {generatedWorkout.category}
                </span>
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">
                  {generatedWorkout.difficulty}
                </span>
                <span className="text-xs px-2 py-1 bg-primary/10 rounded">
                  {generatedWorkout.duration} min
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Exercícios:</h4>
              <div className="space-y-2">
                {generatedWorkout.exercises.map((ex: any, index: number) => (
                  <div
                    key={index}
                    className="bg-muted/20 rounded-lg p-3 text-sm"
                  >
                    <p className="font-medium">
                      {index + 1}. {ex.name}
                    </p>
                    <p className="text-muted-foreground">
                      {ex.sets} séries x {ex.reps} repetições
                      {ex.notes && ` - ${ex.notes}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedWorkout(null);
                  setPrompt("");
                }}
                className="flex-1"
              >
                Gerar Novo
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar Treino"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
