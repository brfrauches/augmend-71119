import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExamStore } from "@/lib/store/examStore";
import { ExamAnalysisResponse } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

const ExamImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const examStore = useExamStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const analyzeExam = async (): Promise<ExamAnalysisResponse> => {
    if (!file) throw new Error("Nenhum arquivo selecionado");

    const fileBase64 = await fileToBase64(file);
    
    // Call N8N endpoint
    const response = await fetch("https://n8n.avitta.health/webhook/analyze_exam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_base64: fileBase64 }),
    });

    if (!response.ok) {
      throw new Error("Erro ao analisar exame");
    }

    return response.json();
  };

  const handleImportDirect = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const analysisResult = await analyzeExam();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Save markers directly to Supabase
      for (const marker of analysisResult.markers) {
        // Check if marker exists, if not create it
        const { data: existingMarker } = await supabase
          .from('health_markers')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', marker.marker_name)
          .single();

        let markerId: string;

        if (existingMarker) {
          markerId = existingMarker.id;
        } else {
          // Create new marker
          const { data: newMarker, error: markerError } = await supabase
            .from('health_markers')
            .insert({
              user_id: user.id,
              name: marker.marker_name,
              unit: marker.unit,
            })
            .select('id')
            .single();

          if (markerError) throw markerError;
          markerId = newMarker.id;
        }

        // Insert marker value with exam date as measured_at
        const { error: valueError } = await supabase
          .from('health_marker_values')
          .insert({
            marker_id: markerId,
            value: marker.value || 0,
            measured_at: analysisResult.exam_date,
          });

        if (valueError) throw valueError;
      }

      toast({
        title: "Sucesso",
        description: "Exame importado com sucesso!",
      });

      navigate("/exams/success");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao importar exame",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewFirst = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const analysisResult = await analyzeExam();
      
      examStore.setFile(file);
      examStore.setMarkers(analysisResult.markers);
      examStore.setExamDate(analysisResult.exam_date);

      navigate("/exams/review");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao analisar exame",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importar Exame</h1>
          <p className="text-muted-foreground mt-2">
            Faça upload de um PDF ou imagem do seu exame
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecione o arquivo</CardTitle>
            <CardDescription>
              Formatos aceitos: PDF, JPG, PNG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-12 w-12 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para selecionar ou arraste o arquivo
                </span>
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleImportDirect}
                disabled={!file || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Importar sem revisar"
                )}
              </Button>
              <Button
                onClick={handleReviewFirst}
                disabled={!file || loading}
                variant="outline"
                className="flex-1"
              >
                Revisar antes de salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamImport;
