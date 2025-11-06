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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: {
    id: string;
    name: string;
    exercises?: any[];
  };
  onSuccess: () => void;
}

export function CheckInDialog({
  open,
  onOpenChange,
  workout,
  onSuccess,
}: CheckInDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const handleCheckIn = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.from("workout_checkins").insert({
        user_id: user?.id,
        workout_id: workout.id,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success("Parabéns! Treino concluído com sucesso 💪");
      onSuccess();
      onOpenChange(false);
      setNotes("");
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Erro ao fazer check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Check-in: {workout.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {workout.exercises && workout.exercises.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Exercícios do treino:</p>
              <ul className="space-y-1">
                {workout.exercises.map((ex: any, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    • {ex.name} - {ex.sets}x{ex.reps}
                    {ex.load > 0 && ` (${ex.load}kg)`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Como foi o treino? Alguma observação sobre carga ou execução..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="bg-primary/5 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Ao confirmar, este treino será registrado no seu histórico
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCheckIn} disabled={loading}>
            {loading ? "Registrando..." : "Confirmar Check-in ✅"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
