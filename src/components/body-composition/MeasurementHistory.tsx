import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

interface BodyMeasurement {
  id: string;
  measured_at: string;
  weight_kg: number;
  fat_percent: number | null;
  lean_mass_kg: number | null;
  imc: number | null;
}

interface MeasurementHistoryProps {
  measurements: BodyMeasurement[];
  onUpdate: () => void;
}

export function MeasurementHistory({ measurements, onUpdate }: MeasurementHistoryProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("body_measurements")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast.success("Medição excluída com sucesso");
      onUpdate();
    } catch (error) {
      console.error("Error deleting measurement:", error);
      toast.error("Erro ao excluir medição");
    } finally {
      setDeleteId(null);
    }
  };

  const calculateDifference = (current: BodyMeasurement, previous?: BodyMeasurement) => {
    if (!previous) return null;

    return {
      weight: current.weight_kg - previous.weight_kg,
      fat: current.fat_percent && previous.fat_percent 
        ? current.fat_percent - previous.fat_percent 
        : null,
      lean: current.lean_mass_kg && previous.lean_mass_kg
        ? current.lean_mass_kg - previous.lean_mass_kg
        : null,
    };
  };

  return (
    <>
      <div className="space-y-3">
        {measurements.map((measurement, index) => {
          const diff = calculateDifference(measurement, measurements[index + 1]);

          return (
            <Card key={measurement.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-medium">
                        {format(new Date(measurement.measured_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                          Mais recente
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Peso:</span>
                        <div className="font-medium">
                          {measurement.weight_kg} kg
                          {diff && diff.weight !== 0 && (
                            <span className={`ml-2 ${diff.weight > 0 ? "text-orange-600" : "text-green-600"}`}>
                              {diff.weight > 0 ? "+" : ""}{diff.weight.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Gordura:</span>
                        <div className="font-medium">
                          {measurement.fat_percent?.toFixed(1) || "-"} %
                          {diff?.fat && diff.fat !== 0 && (
                            <span className={`ml-2 ${diff.fat > 0 ? "text-red-600" : "text-green-600"}`}>
                              {diff.fat > 0 ? "+" : ""}{diff.fat.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Massa Magra:</span>
                        <div className="font-medium">
                          {measurement.lean_mass_kg?.toFixed(1) || "-"} kg
                          {diff?.lean && diff.lean !== 0 && (
                            <span className={`ml-2 ${diff.lean > 0 ? "text-green-600" : "text-red-600"}`}>
                              {diff.lean > 0 ? "+" : ""}{diff.lean.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground">IMC:</span>
                        <div className="font-medium">
                          {measurement.imc?.toFixed(1) || "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(measurement.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {measurements.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Nenhuma medição registrada ainda. Adicione sua primeira medição para começar!
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir medição?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A medição será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
