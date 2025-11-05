import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddValueDialog } from "@/components/markers/AddValueDialog";
import { MarkerChart } from "@/components/markers/MarkerChart";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Marker {
  id: string;
  name: string;
  unit: string;
  min_reference: number | null;
  max_reference: number | null;
  personal_goal: number | null;
}

interface MarkerValue {
  id: string;
  value: number;
  measured_at: string;
  notes: string | null;
}

export default function MarkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [marker, setMarker] = useState<Marker | null>(null);
  const [values, setValues] = useState<MarkerValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadMarkerData();
  }, [id]);

  const loadMarkerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) return;

      const { data: markerData, error: markerError } = await supabase
        .from("health_markers")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (markerError) throw markerError;
      setMarker(markerData);

      const { data: valuesData, error: valuesError } = await supabase
        .from("health_marker_values")
        .select("*")
        .eq("marker_id", id)
        .order("measured_at", { ascending: true });

      if (valuesError) throw valuesError;
      setValues(valuesData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar marcador",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAlerts = () => {
    const alerts = [];
    
    if (!marker || values.length === 0) return alerts;

    const lastThreeValues = values.slice(-3);
    const min = marker.min_reference;
    const max = marker.max_reference;
    const goal = marker.personal_goal;

    // Check if values are consistently out of range
    if (min && max && lastThreeValues.length >= 3) {
      const allOutOfRange = lastThreeValues.every(v => v.value < min || v.value > max);
      if (allOutOfRange) {
        alerts.push({
          type: "warning",
          message: `Suas últimas ${lastThreeValues.length} medições estão fora da faixa de referência. Considere discutir com seu médico.`
        });
      }
    }

    // Check if goal is not being met
    if (goal && lastThreeValues.length >= 3) {
      const allBelowGoal = lastThreeValues.every(v => v.value < goal);
      if (allBelowGoal) {
        alerts.push({
          type: "info",
          message: `Você não atingiu sua meta pessoal nas últimas ${lastThreeValues.length} medições.`
        });
      }
    }

    return alerts;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center pb-24">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!marker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center pb-24">
        <p className="text-muted-foreground">Marcador não encontrado</p>
      </div>
    );
  }

  const alerts = getAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background pb-24">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/markers")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{marker.name}</h1>
              <p className="text-sm text-muted-foreground">
                {values.length} medições registradas
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {alerts.map((alert, index) => (
          <Alert key={index}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        ))}

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Evolução</h3>
          {values.length > 0 ? (
            <MarkerChart
              values={values}
              unit={marker.unit}
              minReference={marker.min_reference}
              maxReference={marker.max_reference}
              personalGoal={marker.personal_goal}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma medição registrada ainda</p>
              <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                Adicionar Primeira Medição
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Histórico de Medições</h3>
          <div className="space-y-3">
            {values.slice().reverse().map((value) => (
              <div
                key={value.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {value.value} {marker.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(value.measured_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {value.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {value.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <AddValueDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        markerId={marker.id}
        markerName={marker.name}
        unit={marker.unit}
        onValueAdded={loadMarkerData}
      />
    </div>
  );
}
