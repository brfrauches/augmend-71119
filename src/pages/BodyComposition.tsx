import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AddMeasurementDialog } from "@/components/body-composition/AddMeasurementDialog";
import { ImportBioimpedanceDialog } from "@/components/body-composition/ImportBioimpedanceDialog";
import { WeightFatChart } from "@/components/body-composition/WeightFatChart";
import { MassComparisonChart } from "@/components/body-composition/MassComparisonChart";
import { RegionalChart } from "@/components/body-composition/RegionalChart";
import { MeasurementHistory } from "@/components/body-composition/MeasurementHistory";
import { MeasurementCalendar } from "@/components/body-composition/MeasurementCalendar";
import { toast } from "sonner";

interface BodyMeasurement {
  id: string;
  measured_at: string;
  weight_kg: number;
  fat_percent: number | null;
  fat_weight_kg: number | null;
  lean_mass_kg: number | null;
  imc: number | null;
  water_percent: number | null;
}

export default function BodyComposition() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [userName, setUserName] = useState("usuário");

  useEffect(() => {
    fetchMeasurements();
    fetchUserName();
  }, [user]);

  const fetchUserName = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (data?.full_name) {
      setUserName(data.full_name.split(" ")[0]);
    }
  };

  const fetchMeasurements = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("body_measurements" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false });

      if (error) throw error;
      setMeasurements((data || []) as any);
    } catch (error) {
      console.error("Error fetching measurements:", error);
      toast.error("Erro ao carregar medições");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMeasurement = () => measurements[0];
  const getPreviousMeasurement = () => measurements[1];

  const calculateDifference = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    return current - previous;
  };

  const currentMeasurement = getCurrentMeasurement();
  const previousMeasurement = getPreviousMeasurement();

  const getDifferenceIcon = (diff: number | null) => {
    if (!diff) return <Minus className="h-4 w-4" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getDifferenceColor = (diff: number | null, isPositiveGood: boolean) => {
    if (!diff) return "text-muted-foreground";
    if (isPositiveGood) {
      return diff > 0 ? "text-green-600" : "text-red-600";
    } else {
      return diff > 0 ? "text-red-600" : "text-green-600";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Evolução Corporal</h1>
          <p className="text-muted-foreground">
            Olá, {userName}! Acompanhe aqui suas medidas corporais e composição física 📈
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Medição
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Importar Bioimpedância
          </Button>
        </div>

        {/* Summary Cards */}
        {currentMeasurement && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Peso Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentMeasurement.weight_kg} kg</div>
                {previousMeasurement && (
                  <div className={`flex items-center gap-1 text-sm mt-1 ${getDifferenceColor(
                    calculateDifference(currentMeasurement.weight_kg, previousMeasurement.weight_kg),
                    false
                  )}`}>
                    {getDifferenceIcon(calculateDifference(currentMeasurement.weight_kg, previousMeasurement.weight_kg))}
                    <span>
                      {Math.abs(calculateDifference(currentMeasurement.weight_kg, previousMeasurement.weight_kg) || 0).toFixed(1)} kg
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Percentual de Gordura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMeasurement.fat_percent?.toFixed(1) || "-"} %
                </div>
                {previousMeasurement && currentMeasurement.fat_percent && previousMeasurement.fat_percent && (
                  <div className={`flex items-center gap-1 text-sm mt-1 ${getDifferenceColor(
                    calculateDifference(currentMeasurement.fat_percent, previousMeasurement.fat_percent),
                    false
                  )}`}>
                    {getDifferenceIcon(calculateDifference(currentMeasurement.fat_percent, previousMeasurement.fat_percent))}
                    <span>
                      {Math.abs(calculateDifference(currentMeasurement.fat_percent, previousMeasurement.fat_percent) || 0).toFixed(1)} %
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Massa Magra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMeasurement.lean_mass_kg?.toFixed(1) || "-"} kg
                </div>
                {previousMeasurement && currentMeasurement.lean_mass_kg && previousMeasurement.lean_mass_kg && (
                  <div className={`flex items-center gap-1 text-sm mt-1 ${getDifferenceColor(
                    calculateDifference(currentMeasurement.lean_mass_kg, previousMeasurement.lean_mass_kg),
                    true
                  )}`}>
                    {getDifferenceIcon(calculateDifference(currentMeasurement.lean_mass_kg, previousMeasurement.lean_mass_kg))}
                    <span>
                      {Math.abs(calculateDifference(currentMeasurement.lean_mass_kg, previousMeasurement.lean_mass_kg) || 0).toFixed(1)} kg
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  IMC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentMeasurement.imc?.toFixed(1) || "-"}
                </div>
                {previousMeasurement && currentMeasurement.imc && previousMeasurement.imc && (
                  <div className={`flex items-center gap-1 text-sm mt-1 ${getDifferenceColor(
                    calculateDifference(currentMeasurement.imc, previousMeasurement.imc),
                    false
                  )}`}>
                    {getDifferenceIcon(calculateDifference(currentMeasurement.imc, previousMeasurement.imc))}
                    <span>
                      {Math.abs(calculateDifference(currentMeasurement.imc, previousMeasurement.imc) || 0).toFixed(1)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts and History */}
        <Tabs defaultValue="charts" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4 mt-4">
            <Tabs defaultValue="weight-fat">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weight-fat">Peso e Gordura</TabsTrigger>
                <TabsTrigger value="mass-comparison">Massa vs Gordura</TabsTrigger>
                <TabsTrigger value="regional">Por Região</TabsTrigger>
              </TabsList>

              <TabsContent value="weight-fat" className="mt-4">
                <WeightFatChart measurements={measurements} />
              </TabsContent>

              <TabsContent value="mass-comparison" className="mt-4">
                <MassComparisonChart measurements={measurements} />
              </TabsContent>

              <TabsContent value="regional" className="mt-4">
                <RegionalChart measurementId={currentMeasurement?.id} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <MeasurementCalendar measurements={measurements} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <MeasurementHistory measurements={measurements} onUpdate={fetchMeasurements} />
          </TabsContent>
        </Tabs>
      </div>

      <AddMeasurementDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchMeasurements}
      />

      <ImportBioimpedanceDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={fetchMeasurements}
      />
    </div>
  );
}
