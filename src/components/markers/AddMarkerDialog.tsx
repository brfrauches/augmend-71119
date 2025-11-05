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
import { useToast } from "@/hooks/use-toast";

interface AddMarkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkerAdded: () => void;
}

const COMMON_MARKERS = [
  { name: "Colesterol Total", unit: "mg/dL", min: 0, max: 200 },
  { name: "HDL", unit: "mg/dL", min: 40, max: 1000 },
  { name: "LDL", unit: "mg/dL", min: 0, max: 130 },
  { name: "Triglicerídeos", unit: "mg/dL", min: 0, max: 150 },
  { name: "Glicose em Jejum", unit: "mg/dL", min: 70, max: 100 },
  { name: "Hemoglobina Glicada", unit: "%", min: 0, max: 5.7 },
  { name: "Testosterona Total", unit: "ng/dL", min: 300, max: 1000 },
  { name: "Vitamina D", unit: "ng/mL", min: 30, max: 100 },
  { name: "TSH", unit: "mUI/L", min: 0.4, max: 4.0 },
  { name: "T4 Livre", unit: "ng/dL", min: 0.8, max: 1.8 },
];

export function AddMarkerDialog({ open, onOpenChange, onMarkerAdded }: AddMarkerDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [useCustom, setUseCustom] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    min_reference: "",
    max_reference: "",
    personal_goal: "",
    initial_value: "",
    initial_date: new Date().toISOString().split('T')[0],
  });

  const handleCommonMarkerSelect = (marker: typeof COMMON_MARKERS[0]) => {
    setFormData({
      ...formData,
      name: marker.name,
      unit: marker.unit,
      min_reference: marker.min.toString(),
      max_reference: marker.max.toString(),
    });
    setUseCustom(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: marker, error: markerError } = await supabase
        .from("health_markers")
        .insert({
          user_id: user.id,
          name: formData.name,
          unit: formData.unit,
          min_reference: formData.min_reference ? parseFloat(formData.min_reference) : null,
          max_reference: formData.max_reference ? parseFloat(formData.max_reference) : null,
          personal_goal: formData.personal_goal ? parseFloat(formData.personal_goal) : null,
        })
        .select()
        .single();

      if (markerError) throw markerError;

      // Add initial value if provided
      if (formData.initial_value && marker) {
        const { error: valueError } = await supabase
          .from("health_marker_values")
          .insert({
            marker_id: marker.id,
            value: parseFloat(formData.initial_value),
            measured_at: new Date(formData.initial_date).toISOString(),
          });

        if (valueError) throw valueError;
      }

      toast({
        title: "Marcador adicionado",
        description: "O marcador foi adicionado com sucesso",
      });

      onMarkerAdded();
      onOpenChange(false);
      setFormData({
        name: "",
        unit: "",
        min_reference: "",
        max_reference: "",
        personal_goal: "",
        initial_value: "",
        initial_date: new Date().toISOString().split('T')[0],
      });
      setUseCustom(false);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar marcador",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Marcador de Saúde</DialogTitle>
        </DialogHeader>

        {!useCustom ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha um marcador comum ou crie um personalizado
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_MARKERS.map((marker) => (
                <Button
                  key={marker.name}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => handleCommonMarkerSelect(marker)}
                >
                  <div className="text-left">
                    <div className="font-medium">{marker.name}</div>
                    <div className="text-xs text-muted-foreground">{marker.unit}</div>
                  </div>
                </Button>
              ))}
            </div>
            <Button variant="secondary" className="w-full" onClick={() => setUseCustom(true)}>
              Criar Marcador Personalizado
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Marcador</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Colesterol Total"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">Unidade de Medida</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Ex: mg/dL"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_reference">Referência Mínima</Label>
                <Input
                  id="min_reference"
                  type="number"
                  step="0.01"
                  value={formData.min_reference}
                  onChange={(e) => setFormData({ ...formData, min_reference: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <Label htmlFor="max_reference">Referência Máxima</Label>
                <Input
                  id="max_reference"
                  type="number"
                  step="0.01"
                  value={formData.max_reference}
                  onChange={(e) => setFormData({ ...formData, max_reference: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="personal_goal">Meta Pessoal</Label>
              <Input
                id="personal_goal"
                type="number"
                step="0.01"
                value={formData.personal_goal}
                onChange={(e) => setFormData({ ...formData, personal_goal: e.target.value })}
                placeholder="Opcional"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Primeira Medição (Opcional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="initial_value">Valor</Label>
                  <Input
                    id="initial_value"
                    type="number"
                    step="0.01"
                    value={formData.initial_value}
                    onChange={(e) => setFormData({ ...formData, initial_value: e.target.value })}
                    placeholder="Ex: 180"
                  />
                </div>
                <div>
                  <Label htmlFor="initial_date">Data</Label>
                  <Input
                    id="initial_date"
                    type="date"
                    value={formData.initial_date}
                    onChange={(e) => setFormData({ ...formData, initial_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUseCustom(false)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar Marcador"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
