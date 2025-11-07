import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";

interface LogUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplement: {
    id: string;
    name: string;
    dosage: string;
  };
  onSuccess: () => void;
}

export function LogUsageDialog({ open, onOpenChange, supplement, onSuccess }: LogUsageDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([new Date()]);
  const [dose, setDose] = useState(supplement.dosage);
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const datesToLog = mode === "single" ? [selectedDates[0]] : selectedDates;

      const logsToInsert = datesToLog.map((date) => ({
        supplement_id: supplement.id,
        user_id: user.id,
        taken_at: format(date, "yyyy-MM-dd"),
        dose: dose,
        notes: notes || null,
      }));

      const { error } = await supabase.from("supplement_logs").insert(logsToInsert);

      if (error) throw error;

      toast({
        title: "Uso registrado com sucesso ✅",
        description: `${datesToLog.length} ${datesToLog.length === 1 ? "dia de uso registrado" : "dias de uso registrados"} para ${supplement.name}.`,
      });

      onSuccess();
      onOpenChange(false);
      setSelectedDates([new Date()]);
      setDose(supplement.dosage);
      setNotes("");
      setMode("single");
    } catch (error: any) {
      toast({
        title: "Erro ao registrar uso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Uso de {supplement.name}</DialogTitle>
          <DialogDescription>
            Registre quando você tomou este suplemento
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Uso de Hoje</TabsTrigger>
            <TabsTrigger value="multiple">Múltiplos Dias</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={format(selectedDates[0], "yyyy-MM-dd")}
                onChange={(e) => setSelectedDates([new Date(e.target.value)])}
              />
            </div>

            <div>
              <Label htmlFor="dose">Dosagem</Label>
              <Input
                id="dose"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="Ex: 3g, 5000 UI"
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre este uso..."
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="multiple" className="space-y-4">
            <div>
              <Label>Selecione os dias em que você usou este suplemento</Label>
              <div className="border rounded-md p-4 mt-2">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  locale={ptBR}
                  className="mx-auto"
                  disabled={(date) => date > new Date()}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedDates.length} {selectedDates.length === 1 ? "dia selecionado" : "dias selecionados"}
              </p>
            </div>

            <div>
              <Label htmlFor="dose-multi">Dosagem (mesma para todos os dias)</Label>
              <Input
                id="dose-multi"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="Ex: 3g, 5000 UI"
              />
            </div>

            <div>
              <Label htmlFor="notes-multi">Observações (opcional)</Label>
              <Textarea
                id="notes-multi"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre este uso..."
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || selectedDates.length === 0}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : `Registrar ${selectedDates.length} ${selectedDates.length === 1 ? "dia" : "dias"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
