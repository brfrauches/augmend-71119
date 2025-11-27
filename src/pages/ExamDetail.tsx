import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface MarkerValue {
  id: string;
  value: number;
  measured_at: string;
  marker: {
    name: string;
    unit: string;
    min_reference: number | null;
    max_reference: number | null;
  };
}

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [markers, setMarkers] = useState<MarkerValue[]>([]);
  const [examDate, setExamDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamDetails();
  }, [id]);

  const loadExamDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // This is a simplified version - you'd need to store exam IDs properly
      // For now, we'll just show markers
      const { data, error } = await supabase
        .from("health_marker_values")
        .select(`
          id,
          value,
          measured_at,
          marker:health_markers(name, unit, min_reference, max_reference)
        `)
        .order("measured_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        setMarkers(data as any);
        setExamDate(data[0].measured_at.split("T")[0]);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes do exame",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getClassification = (value: number, min: number | null, max: number | null) => {
    if (min === null || max === null) return "UNKNOWN";
    if (value < min) return "LOW";
    if (value > max) return "HIGH";
    return "NORMAL";
  };

  const getClassificationBadge = (classification: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      NORMAL: "default",
      LOW: "destructive",
      HIGH: "destructive",
      UNKNOWN: "secondary",
    };

    const labels: Record<string, string> = {
      NORMAL: "Normal",
      LOW: "Baixo",
      HIGH: "Alto",
      UNKNOWN: "Desconhecido",
    };

    return (
      <Badge variant={variants[classification]}>
        {labels[classification]}
      </Badge>
    );
  };

  const handleExport = () => {
    const exportData = {
      exam_date: examDate,
      markers: markers.map((m) => ({
        name: m.marker.name,
        value: m.value,
        unit: m.marker.unit,
        reference: `${m.marker.min_reference || "?"} - ${m.marker.max_reference || "?"}`,
        classification: getClassification(m.value, m.marker.min_reference, m.marker.max_reference),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exame-${examDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exclusão de exames será implementada em breve",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/exams")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Detalhes do Exame</h1>
              <p className="text-muted-foreground mt-2">
                {examDate && format(new Date(examDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O exame será permanentemente excluído.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Marcadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Classificação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markers.map((marker) => {
                    const classification = getClassification(
                      marker.value,
                      marker.marker.min_reference,
                      marker.marker.max_reference
                    );
                    return (
                      <TableRow key={marker.id}>
                        <TableCell className="font-medium">{marker.marker.name}</TableCell>
                        <TableCell>{marker.value}</TableCell>
                        <TableCell>{marker.marker.unit}</TableCell>
                        <TableCell>
                          {marker.marker.min_reference ?? "?"} - {marker.marker.max_reference ?? "?"}
                        </TableCell>
                        <TableCell>{getClassificationBadge(classification)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamDetail;
