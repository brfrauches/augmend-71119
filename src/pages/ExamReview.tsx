import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExamStore } from "@/lib/store/examStore";
import { Marker, AnaRef } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

const ExamReview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const examStore = useExamStore();
  const [markers, setMarkers] = useState<Marker[]>(examStore.markers);
  const [loading, setLoading] = useState(false);

  if (!examStore.examDate || markers.length === 0) {
    navigate("/exams/import");
    return null;
  }

  const updateMarker = (index: number, field: keyof Marker, value: any) => {
    const updated = [...markers];
    updated[index] = { ...updated[index], [field]: value };
    setMarkers(updated);
  };

  const removeMarker = (index: number) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  const addMarker = () => {
    setMarkers([
      ...markers,
      {
        marker_name: "",
        value: null,
        unit: "",
        reference_range: "",
        ana_ref: "UNKNOWN",
      },
    ]);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://n8n.avitta.health/webhook/save_exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_date: examStore.examDate,
          markers: markers,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar exame");
      }

      toast({
        title: "Sucesso",
        description: "Exame salvo com sucesso!",
      });

      examStore.reset();
      navigate("/exams/success");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar exame",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    examStore.reset();
    navigate("/markers");
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Revisar Marcadores</h1>
            <p className="text-muted-foreground mt-2">
              Data do exame: {examStore.examDate}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Exame
                </>
              )}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Marcadores Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Marcador</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Range de Referência</TableHead>
                    <TableHead>Classificação</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markers.map((marker, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={marker.marker_name}
                          onChange={(e) => updateMarker(index, "marker_name", e.target.value)}
                          placeholder="Nome"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={marker.value ?? ""}
                          onChange={(e) => updateMarker(index, "value", e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="0.0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={marker.unit}
                          onChange={(e) => updateMarker(index, "unit", e.target.value)}
                          placeholder="mg/dL"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={marker.reference_range}
                          onChange={(e) => updateMarker(index, "reference_range", e.target.value)}
                          placeholder="10-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={marker.ana_ref}
                          onValueChange={(value) => updateMarker(index, "ana_ref", value as AnaRef)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="LOW">Baixo</SelectItem>
                            <SelectItem value="HIGH">Alto</SelectItem>
                            <SelectItem value="UNKNOWN">Desconhecido</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMarker(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button onClick={addMarker} variant="outline" className="mt-4 w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Marcador
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamReview;
