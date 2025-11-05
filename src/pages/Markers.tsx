import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, Minus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddMarkerDialog } from "@/components/markers/AddMarkerDialog";
import { ImportExamDialog } from "@/components/markers/ImportExamDialog";
import { motion } from "framer-motion";

interface Marker {
  id: string;
  name: string;
  unit: string;
  min_reference: number | null;
  max_reference: number | null;
  personal_goal: number | null;
  latest_value?: {
    value: number;
    measured_at: string;
  };
}

export default function Markers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    loadMarkers();
  }, []);

  const loadMarkers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: markersData, error } = await supabase
        .from("health_markers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load latest value for each marker
      const markersWithValues = await Promise.all(
        (markersData || []).map(async (marker) => {
          const { data: latestValue } = await supabase
            .from("health_marker_values")
            .select("value, measured_at")
            .eq("marker_id", marker.id)
            .order("measured_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...marker,
            latest_value: latestValue || undefined,
          };
        })
      );

      setMarkers(markersWithValues);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar marcadores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (marker: Marker) => {
    if (!marker.latest_value) return <Minus className="w-5 h-5 text-muted-foreground" />;
    
    const value = marker.latest_value.value;
    const min = marker.min_reference;
    const max = marker.max_reference;
    
    if (min && max) {
      if (value < min) return <TrendingDown className="w-5 h-5 text-destructive" />;
      if (value > max) return <TrendingUp className="w-5 h-5 text-destructive" />;
      return <TrendingUp className="w-5 h-5 text-accent" />;
    }
    
    return <Minus className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusText = (marker: Marker) => {
    if (!marker.latest_value) return "Sem medições";
    
    const value = marker.latest_value.value;
    const min = marker.min_reference;
    const max = marker.max_reference;
    
    if (min && max) {
      if (value < min || value > max) return "Fora da faixa";
      return "Na faixa ideal";
    }
    
    return "Registrado";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center pb-24">
        <p className="text-muted-foreground">Carregando marcadores...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background pb-24">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold">Marcadores de Saúde</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe seus exames e resultados
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex gap-3">
          <Button onClick={() => setShowAddDialog(true)} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Marcador
          </Button>
          <Button onClick={() => setShowImportDialog(true)} variant="outline" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Importar Exame
          </Button>
        </div>

        {markers.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum marcador adicionado</h3>
              <p className="text-muted-foreground">
                Comece adicionando seu primeiro marcador de saúde para acompanhar sua evolução
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Marcador
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {markers.map((marker, index) => (
              <motion.div
                key={marker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => navigate(`/markers/${marker.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{marker.name}</h3>
                      {marker.latest_value ? (
                        <div className="mt-2">
                          <p className="text-2xl font-bold text-primary">
                            {marker.latest_value.value} {marker.unit}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(marker.latest_value.measured_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          Nenhuma medição registrada
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusIcon(marker)}
                      <span className="text-xs font-medium">
                        {getStatusText(marker)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AddMarkerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onMarkerAdded={loadMarkers}
      />

      <ImportExamDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImportComplete={loadMarkers}
      />
    </div>
  );
}
