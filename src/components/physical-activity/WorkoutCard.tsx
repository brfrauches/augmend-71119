import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, CheckCircle2, Trash2 } from "lucide-react";
import { CheckInDialog } from "./CheckInDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkoutCardProps {
  workout: {
    id: string;
    name: string;
    description: string;
    week_days: string[];
    exercises?: any[];
  };
  onRefresh: () => void;
  onCheckInSuccess: () => void;
}

const dayLabels: Record<string, string> = {
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
  sunday: "Dom",
};

export function WorkoutCard({
  workout,
  onRefresh,
  onCheckInSuccess,
}: WorkoutCardProps) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workout.id);

      if (error) throw error;

      toast.success("Treino removido com sucesso");
      onRefresh();
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Erro ao remover treino");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{workout.name}</h3>
              {workout.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {workout.description}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>

        {workout.week_days && workout.week_days.length > 0 && (
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {workout.week_days.map((day) => (
              <Badge key={day} variant="secondary" className="text-xs">
                {dayLabels[day]}
              </Badge>
            ))}
          </div>
        )}

        {workout.exercises && workout.exercises.length > 0 && (
          <p className="text-sm text-muted-foreground mb-3">
            {workout.exercises.length} exercício(s)
          </p>
        )}

        <Button
          className="w-full"
          onClick={() => setShowCheckIn(true)}
          size="sm"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Fazer Check-in
        </Button>
      </Card>

      <CheckInDialog
        open={showCheckIn}
        onOpenChange={setShowCheckIn}
        workout={workout}
        onSuccess={onCheckInSuccess}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Treino</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{workout.name}"? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
