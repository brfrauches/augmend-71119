import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Exam {
  id: string;
  exam_date: string;
  marker_count: number;
}

const ExamList = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unique exam dates from health_marker_values
      const { data, error } = await supabase
        .from("health_marker_values")
        .select("measured_at, marker_id")
        .eq("marker_id", user.id)
        .order("measured_at", { ascending: false });

      if (error) throw error;

      // Group by date
      const examsByDate = data?.reduce((acc: any, curr) => {
        const date = curr.measured_at.split("T")[0];
        if (!acc[date]) {
          acc[date] = { exam_date: date, marker_count: 0 };
        }
        acc[date].marker_count++;
        return acc;
      }, {});

      const examList = Object.values(examsByDate || {}).map((exam: any, index) => ({
        id: `exam-${index}`,
        ...exam,
      })) as Exam[];

      setExams(examList);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Erro ao carregar exames",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Exames</h1>
            <p className="text-muted-foreground mt-2">
              Histórico de exames importados
            </p>
          </div>
          <Button onClick={() => navigate("/exams/import")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Exame
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium text-foreground">Nenhum exame importado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comece importando seu primeiro exame
                </p>
              </div>
              <Button onClick={() => navigate("/exams/import")}>
                <Plus className="mr-2 h-4 w-4" />
                Importar Exame
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {format(new Date(exam.exam_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardTitle>
                      <CardDescription>
                        {exam.marker_count} marcador{exam.marker_count !== 1 ? "es" : ""} encontrado{exam.marker_count !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/exams/${exam.id}`)}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
