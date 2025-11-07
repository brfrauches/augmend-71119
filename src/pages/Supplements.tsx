import { useState, useEffect } from "react";
import { Plus, Pill, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddSupplementDialog } from "@/components/supplements/AddSupplementDialog";
import { SupplementCard } from "@/components/supplements/SupplementCard";
import { WeeklyUsageChart } from "@/components/supplements/WeeklyUsageChart";

interface Supplement {
  id: string;
  name: string;
  form: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  linked_marker_id?: string;
}

export default function Supplements() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "finished">("active");
  const { toast } = useToast();

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("supplements")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSupplements(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar suplementos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSupplements = supplements.filter((supp) => {
    if (filter === "active") return supp.is_active;
    if (filter === "finished") return !supp.is_active;
    return true;
  });

  const activeSupplements = filteredSupplements.filter((s) => s.is_active);
  const finishedSupplements = filteredSupplements.filter((s) => !s.is_active);

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suplementação</h1>
          <p className="text-muted-foreground">Registre e acompanhe seus suplementos</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Suplemento
        </Button>
      </div>

      {/* Weekly Usage Summary */}
      <WeeklyUsageChart />

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Ativos ({activeSupplements.length})</TabsTrigger>
          <TabsTrigger value="finished">Finalizados ({finishedSupplements.length})</TabsTrigger>
          <TabsTrigger value="all">Todos ({supplements.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Supplements List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando suplementos...
          </div>
        ) : filteredSupplements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum suplemento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando seu primeiro suplemento
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Suplemento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {filter !== "finished" && activeSupplements.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-foreground">Ativos</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeSupplements.map((supplement) => (
                    <SupplementCard
                      key={supplement.id}
                      supplement={supplement}
                      onUpdate={fetchSupplements}
                    />
                  ))}
                </div>
              </div>
            )}

            {filter !== "active" && finishedSupplements.length > 0 && (
              <div className={filter === "all" ? "mt-8" : ""}>
                <h2 className="text-xl font-semibold mb-3 text-foreground">Finalizados</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {finishedSupplements.map((supplement) => (
                    <SupplementCard
                      key={supplement.id}
                      supplement={supplement}
                      onUpdate={fetchSupplements}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddSupplementDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchSupplements}
      />
    </div>
  );
}
