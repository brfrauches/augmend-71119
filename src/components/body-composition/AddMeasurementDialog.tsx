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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface AddMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface SegmentData {
  region: string;
  lean_mass_kg: string;
  fat_mass_kg: string;
}

export function AddMeasurementDialog({ open, onOpenChange, onSuccess }: AddMeasurementDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSegments, setShowSegments] = useState(false);
  
  const [formData, setFormData] = useState({
    measured_at: new Date().toISOString().split("T")[0],
    weight_kg: "",
    fat_percent: "",
    fat_weight_kg: "",
    lean_mass_kg: "",
    height_m: "",
    imc: "",
    water_percent: "",
    basal_metabolic_rate: "",
    notes: "",
  });

  const [segments, setSegments] = useState<SegmentData[]>([
    { region: "Braço Direito", lean_mass_kg: "", fat_mass_kg: "" },
    { region: "Braço Esquerdo", lean_mass_kg: "", fat_mass_kg: "" },
    { region: "Tronco", lean_mass_kg: "", fat_mass_kg: "" },
    { region: "Abdômen", lean_mass_kg: "", fat_mass_kg: "" },
    { region: "Coxa Direita", lean_mass_kg: "", fat_mass_kg: "" },
    { region: "Coxa Esquerda", lean_mass_kg: "", fat_mass_kg: "" },
    { region: "Panturrilhas", lean_mass_kg: "", fat_mass_kg: "" },
  ]);

  const calculateIMC = (weight: number, height: number) => {
    return weight / (height * height);
  };

  const calculateFatWeight = (weight: number, fatPercent: number) => {
    return (weight * fatPercent) / 100;
  };

  const calculateLeanMass = (weight: number, fatWeight: number) => {
    return weight - fatWeight;
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-calculate IMC
    if (field === "weight_kg" || field === "height_m") {
      const weight = parseFloat(field === "weight_kg" ? value : formData.weight_kg);
      const height = parseFloat(field === "height_m" ? value : formData.height_m);
      if (weight && height) {
        newFormData.imc = calculateIMC(weight, height).toFixed(2);
      }
    }

    // Auto-calculate fat weight and lean mass
    if (field === "weight_kg" || field === "fat_percent") {
      const weight = parseFloat(field === "weight_kg" ? value : formData.weight_kg);
      const fatPercent = parseFloat(field === "fat_percent" ? value : formData.fat_percent);
      if (weight && fatPercent) {
        const fatWeight = calculateFatWeight(weight, fatPercent);
        newFormData.fat_weight_kg = fatWeight.toFixed(2);
        newFormData.lean_mass_kg = calculateLeanMass(weight, fatWeight).toFixed(2);
      }
    }

    setFormData(newFormData);
  };

  const handleSegmentChange = (index: number, field: "lean_mass_kg" | "fat_mass_kg", value: string) => {
    const newSegments = [...segments];
    newSegments[index][field] = value;
    setSegments(newSegments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Insert measurement
      const { data: measurement, error: measurementError } = await supabase
        .from("body_measurements")
        .insert({
          user_id: user.id,
          measured_at: formData.measured_at,
          weight_kg: parseFloat(formData.weight_kg),
          fat_percent: formData.fat_percent ? parseFloat(formData.fat_percent) : null,
          fat_weight_kg: formData.fat_weight_kg ? parseFloat(formData.fat_weight_kg) : null,
          lean_mass_kg: formData.lean_mass_kg ? parseFloat(formData.lean_mass_kg) : null,
          height_m: formData.height_m ? parseFloat(formData.height_m) : null,
          imc: formData.imc ? parseFloat(formData.imc) : null,
          water_percent: formData.water_percent ? parseFloat(formData.water_percent) : null,
          basal_metabolic_rate: formData.basal_metabolic_rate ? parseInt(formData.basal_metabolic_rate) : null,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (measurementError) throw measurementError;

      // Insert segments if any are filled
      if (showSegments && measurement) {
        const filledSegments = segments.filter(
          (seg) => seg.lean_mass_kg || seg.fat_mass_kg
        );

        if (filledSegments.length > 0) {
          const segmentsToInsert = filledSegments.map((seg) => ({
            measurement_id: measurement.id,
            region: seg.region,
            lean_mass_kg: seg.lean_mass_kg ? parseFloat(seg.lean_mass_kg) : null,
            fat_mass_kg: seg.fat_mass_kg ? parseFloat(seg.fat_mass_kg) : null,
          }));

          const { error: segmentsError } = await supabase
            .from("body_segments")
            .insert(segmentsToInsert);

          if (segmentsError) throw segmentsError;
        }
      }

      toast.success("📈 Medição registrada com sucesso! Seus gráficos foram atualizados.");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error saving measurement:", error);
      toast.error("Erro ao salvar medição");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      measured_at: new Date().toISOString().split("T")[0],
      weight_kg: "",
      fat_percent: "",
      fat_weight_kg: "",
      lean_mass_kg: "",
      height_m: "",
      imc: "",
      water_percent: "",
      basal_metabolic_rate: "",
      notes: "",
    });
    setSegments([
      { region: "Braço Direito", lean_mass_kg: "", fat_mass_kg: "" },
      { region: "Braço Esquerdo", lean_mass_kg: "", fat_mass_kg: "" },
      { region: "Tronco", lean_mass_kg: "", fat_mass_kg: "" },
      { region: "Abdômen", lean_mass_kg: "", fat_mass_kg: "" },
      { region: "Coxa Direita", lean_mass_kg: "", fat_mass_kg: "" },
      { region: "Coxa Esquerda", lean_mass_kg: "", fat_mass_kg: "" },
      { region: "Panturrilhas", lean_mass_kg: "", fat_mass_kg: "" },
    ]);
    setShowSegments(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Medição</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="measured_at">Data da Medição</Label>
              <Input
                id="measured_at"
                type="date"
                value={formData.measured_at}
                onChange={(e) => handleInputChange("measured_at", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="weight_kg">Peso Total (kg) *</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.01"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange("weight_kg", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="height_m">Altura (m)</Label>
              <Input
                id="height_m"
                type="number"
                step="0.01"
                value={formData.height_m}
                onChange={(e) => handleInputChange("height_m", e.target.value)}
                placeholder="ex: 1.75"
              />
            </div>

            <div>
              <Label htmlFor="imc">IMC</Label>
              <Input
                id="imc"
                type="number"
                step="0.01"
                value={formData.imc}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="fat_percent">Percentual de Gordura (%)</Label>
              <Input
                id="fat_percent"
                type="number"
                step="0.01"
                value={formData.fat_percent}
                onChange={(e) => handleInputChange("fat_percent", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="fat_weight_kg">Peso de Gordura (kg)</Label>
              <Input
                id="fat_weight_kg"
                type="number"
                step="0.01"
                value={formData.fat_weight_kg}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="lean_mass_kg">Massa Magra (kg)</Label>
              <Input
                id="lean_mass_kg"
                type="number"
                step="0.01"
                value={formData.lean_mass_kg}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="water_percent">Água Corporal (%)</Label>
              <Input
                id="water_percent"
                type="number"
                step="0.01"
                value={formData.water_percent}
                onChange={(e) => handleInputChange("water_percent", e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="basal_metabolic_rate">Taxa Metabólica Basal (kcal)</Label>
              <Input
                id="basal_metabolic_rate"
                type="number"
                value={formData.basal_metabolic_rate}
                onChange={(e) => handleInputChange("basal_metabolic_rate", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Notas sobre a medição..."
              rows={3}
            />
          </div>

          <Collapsible open={showSegments} onOpenChange={setShowSegments}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="outline" className="w-full gap-2">
                <ChevronDown className={`h-4 w-4 transition-transform ${showSegments ? "rotate-180" : ""}`} />
                Adicionar medidas por região
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {segments.map((segment, index) => (
                <div key={segment.region} className="grid grid-cols-3 gap-4 items-center">
                  <Label className="font-medium">{segment.region}</Label>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Massa (kg)"
                      value={segment.lean_mass_kg}
                      onChange={(e) => handleSegmentChange(index, "lean_mass_kg", e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Gordura (kg)"
                      value={segment.fat_mass_kg}
                      onChange={(e) => handleSegmentChange(index, "fat_mass_kg", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Medição"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
