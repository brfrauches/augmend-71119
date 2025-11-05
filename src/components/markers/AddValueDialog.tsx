import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddValueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markerId: string;
  markerName: string;
  unit: string;
  onValueAdded: () => void;
}

export function AddValueDialog({
  open,
  onOpenChange,
  markerId,
  markerName,
  unit,
  onValueAdded,
}: AddValueDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    measured_at: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("health_marker_values")
        .insert({
          marker_id: markerId,
          value: parseFloat(formData.value),
          measured_at: new Date(formData.measured_at).toISOString(),
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Medição adicionada",
        description: "O valor foi registrado com sucesso",
      });

      onValueAdded();
      onOpenChange(false);
      setFormData({
        value: "",
        measured_at: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar medição",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Medição - {markerName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="value">Valor ({unit})</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={`Ex: 180`}
              required
            />
          </div>

          <div>
            <Label htmlFor="measured_at">Data e Hora</Label>
            <Input
              id="measured_at"
              type="datetime-local"
              value={formData.measured_at}
              onChange={(e) => setFormData({ ...formData, measured_at: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: exame em jejum, após dieta low carb..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar Medição"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
