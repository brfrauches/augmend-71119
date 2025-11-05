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
import { Upload, Loader2 } from "lucide-react";

interface ImportExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ExtractedMarker {
  name: string;
  value: string;
  unit: string;
}

export function ImportExamDialog({ open, onOpenChange, onImportComplete }: ImportExamDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractedMarkers, setExtractedMarkers] = useState<ExtractedMarker[]>([]);
  const [processingStep, setProcessingStep] = useState<'upload' | 'review'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;

        // Call edge function to process the file with AI
        const { data, error } = await supabase.functions.invoke('process-exam', {
          body: { 
            file: base64,
            filename: file.name 
          }
        });

        if (error) throw error;

        if (data?.markers) {
          setExtractedMarkers(data.markers);
          setProcessingStep('review');
        } else {
          throw new Error("Nenhum marcador foi encontrado no documento");
        }
      };

      reader.onerror = () => {
        throw new Error("Erro ao ler o arquivo");
      };
    } catch (error: any) {
      toast({
        title: "Erro ao processar arquivo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Process each extracted marker
      for (const marker of extractedMarkers) {
        // Check if marker already exists
        const { data: existingMarker } = await supabase
          .from("health_markers")
          .select("id")
          .eq("user_id", user.id)
          .eq("name", marker.name)
          .single();

        let markerId = existingMarker?.id;

        // Create marker if it doesn't exist
        if (!markerId) {
          const { data: newMarker, error: markerError } = await supabase
            .from("health_markers")
            .insert({
              user_id: user.id,
              name: marker.name,
              unit: marker.unit,
            })
            .select()
            .single();

          if (markerError) throw markerError;
          markerId = newMarker.id;
        }

        // Add the value
        const { error: valueError } = await supabase
          .from("health_marker_values")
          .insert({
            marker_id: markerId,
            value: parseFloat(marker.value),
            measured_at: new Date().toISOString(),
          });

        if (valueError) throw valueError;
      }

      toast({
        title: "Exame importado",
        description: `${extractedMarkers.length} marcadores foram importados com sucesso`,
      });

      onImportComplete();
      handleClose();
    } catch (error: any) {
      toast({
        title: "Erro ao importar marcadores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setExtractedMarkers([]);
    setProcessingStep('upload');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Exame</DialogTitle>
        </DialogHeader>

        {processingStep === 'upload' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Envie um PDF ou foto do seu exame e a IA extrairá os marcadores automaticamente
            </p>

            <div>
              <Label htmlFor="file">Arquivo do Exame</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>

            {file && (
              <div className="p-4 bg-secondary/20 rounded-lg">
                <p className="text-sm">
                  <strong>Arquivo selecionado:</strong> {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tamanho: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <Button
              onClick={processFile}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando com IA...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Processar Exame
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revise os marcadores extraídos e confirme a importação
            </p>

            <div className="space-y-3">
              {extractedMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Marcador</Label>
                      <Input
                        value={marker.name}
                        onChange={(e) => {
                          const updated = [...extractedMarkers];
                          updated[index].name = e.target.value;
                          setExtractedMarkers(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Valor</Label>
                      <Input
                        value={marker.value}
                        onChange={(e) => {
                          const updated = [...extractedMarkers];
                          updated[index].value = e.target.value;
                          setExtractedMarkers(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unidade</Label>
                      <Input
                        value={marker.unit}
                        onChange={(e) => {
                          const updated = [...extractedMarkers];
                          updated[index].unit = e.target.value;
                          setExtractedMarkers(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setProcessingStep('upload')}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={confirmImport}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Importando..." : "Confirmar Importação"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
