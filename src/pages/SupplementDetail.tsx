import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Pill, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SupplementHistoryChart } from "@/components/supplements/SupplementHistoryChart";
import { LogUsageDialog } from "@/components/supplements/LogUsageDialog";

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

interface SupplementLog {
  id: string;
  taken_at: string;
  dose: string;
  notes?: string;
  created_at: string;
}

export default function SupplementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [logs, setLogs] = useState<SupplementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogDialog, setShowLogDialog] = useState(false);

  useEffect(() => {
    fetchSupplementData();
  }, [id]);

  const fetchSupplementData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch supplement
      const { data: suppData, error: suppError } = await supabase
        .from("supplements")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (suppError) throw suppError;
      setSupplement(suppData);

      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from("supplement_logs")
        .select("*")
        .eq("supplement_id", id)
        .eq("user_id", user.id)
        .order("taken_at", { ascending: false });

      if (logsError) throw logsError;
      setLogs(logsData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      navigate("/supplements");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      const { error } = await supabase
        .from("supplement_logs")
        .delete()
        .eq("id", logId);

      if (error) throw error;

      toast({
        title: "Registro excluído",
        description: "O registro foi removido com sucesso.",
      });

      fetchSupplementData();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir registro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  if (!supplement) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <Button
        variant="ghost"
        onClick={() => navigate("/supplements")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      {/* Supplement Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">{supplement.name}</CardTitle>
              </div>
              <CardDescription>
                {supplement.dosage} • {supplement.frequency} • {supplement.form}
              </CardDescription>
            </div>
            <Badge variant={supplement.is_active ? "default" : "secondary"}>
              {supplement.is_active ? "Ativo" : "Finalizado"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Data de Início</p>
              <p className="font-medium">
                {format(new Date(supplement.start_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            {supplement.end_date && (
              <div>
                <p className="text-muted-foreground">Data de Fim</p>
                <p className="font-medium">
                  {format(new Date(supplement.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {supplement.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Observações</p>
              <p className="text-sm">{supplement.notes}</p>
            </div>
          )}

          {supplement.is_active && (
            <Button onClick={() => setShowLogDialog(true)} className="w-full">
              Registrar Uso
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      <SupplementHistoryChart logs={logs} />

      {/* Logs History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico de Uso</CardTitle>
          <CardDescription>
            {logs.length} {logs.length === 1 ? "registro" : "registros"} encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum registro de uso ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(log.taken_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className="text-sm text-muted-foreground">• {log.dose}</span>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LogUsageDialog
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        supplement={supplement}
        onSuccess={fetchSupplementData}
      />
    </div>
  );
}
