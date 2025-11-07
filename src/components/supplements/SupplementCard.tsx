import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Calendar, CheckCircle2, MoreVertical, Trash2, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogUsageDialog } from "./LogUsageDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

interface SupplementCardProps {
  supplement: Supplement;
  onUpdate: () => void;
}

export function SupplementCard({ supplement, onUpdate }: SupplementCardProps) {
  const [showLogDialog, setShowLogDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${supplement.name}?`)) return;

    try {
      const { error } = await supabase
        .from("supplements")
        .delete()
        .eq("id", supplement.id);

      if (error) throw error;

      toast({
        title: "Suplemento excluído",
        description: `${supplement.name} foi removido da sua lista.`,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir suplemento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async () => {
    try {
      const { error } = await supabase
        .from("supplements")
        .update({ is_active: !supplement.is_active })
        .eq("id", supplement.id);

      if (error) throw error;

      toast({
        title: supplement.is_active ? "Suplemento finalizado" : "Suplemento reativado",
        description: `${supplement.name} foi ${supplement.is_active ? "marcado como finalizado" : "reativado"}.`,
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar suplemento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{supplement.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/supplements/${supplement.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleActive}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {supplement.is_active ? "Finalizar" : "Reativar"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className="mt-2">
            {supplement.dosage} • {supplement.frequency}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={supplement.is_active ? "default" : "secondary"}>
              {supplement.is_active ? "Ativo" : "Finalizado"}
            </Badge>
            <Badge variant="outline">{supplement.form}</Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Início: {format(new Date(supplement.start_date), "dd/MM/yyyy", { locale: ptBR })}
            </div>
            {supplement.end_date && (
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Fim: {format(new Date(supplement.end_date), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
          </div>

          {supplement.is_active && (
            <Button
              onClick={() => setShowLogDialog(true)}
              className="w-full"
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Registrar Uso
            </Button>
          )}
        </CardContent>
      </Card>

      <LogUsageDialog
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        supplement={supplement}
        onSuccess={onUpdate}
      />
    </>
  );
}
