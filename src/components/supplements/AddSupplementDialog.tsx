import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddSupplementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface HealthMarker {
  id: string;
  name: string;
}

export function AddSupplementDialog({ open, onOpenChange, onSuccess }: AddSupplementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState<HealthMarker[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    form: "oral",
    dosage: "",
    frequency: "diário",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    linked_marker_id: "",
    notes: "",
    is_active: true,
  });

  useEffect(() => {
    if (open) {
      fetchMarkers();
    }
  }, [open]);

  const fetchMarkers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("health_markers")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setMarkers(data || []);
    } catch (error: any) {
      console.error("Error fetching markers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("supplements").insert({
        user_id: user.id,
        ...formData,
        linked_marker_id: formData.linked_marker_id || null,
        end_date: formData.end_date || null,
      });

      if (error) throw error;

      toast({
        title: "Suplemento adicionado com sucesso 💊",
        description: `${formData.name} foi adicionado à sua lista.`,
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        name: "",
        form: "oral",
        dosage: "",
        frequency: "diário",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        linked_marker_id: "",
        notes: "",
        is_active: true,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar suplemento",
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
          <DialogTitle>Adicionar Suplemento</DialogTitle>
          <DialogDescription>
            Registre um novo suplemento para acompanhar seu uso
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Suplemento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Vitamina D3, Creatina, Ômega 3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="form">Forma de Administração</Label>
              <Select value={formData.form} onValueChange={(value) => setFormData({ ...formData, form: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="capsula">Cápsula</SelectItem>
                  <SelectItem value="liquido">Líquido</SelectItem>
                  <SelectItem value="intramuscular">Intramuscular</SelectItem>
                  <SelectItem value="sublingual">Sublingual</SelectItem>
                  <SelectItem value="topico">Tópico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dosage">Dosagem *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="Ex: 3g, 5000 UI, 200mg"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="frequency">Frequência</Label>
            <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diário">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="a cada 2 dias">A cada 2 dias</SelectItem>
                <SelectItem value="a cada 3 dias">A cada 3 dias</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Data de Fim (opcional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linked_marker">Vincular a Marcador de Saúde</Label>
            <Select value={formData.linked_marker_id} onValueChange={(value) => setFormData({ ...formData, linked_marker_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um marcador (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {markers.map((marker) => (
                  <SelectItem key={marker.id} value={marker.id}>
                    {marker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre o suplemento..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Suplemento ativo
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Adicionar Suplemento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
