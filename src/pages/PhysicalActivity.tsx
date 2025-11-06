import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Dumbbell, Calendar, TrendingUp } from "lucide-react";
import { CreateWorkoutDialog } from "@/components/physical-activity/CreateWorkoutDialog";
import { WorkoutLibrary } from "@/components/physical-activity/WorkoutLibrary";
import { WorkoutCard } from "@/components/physical-activity/WorkoutCard";
import { WeeklyConsistencyChart } from "@/components/physical-activity/WeeklyConsistencyChart";
import { AIWorkoutDialog } from "@/components/physical-activity/AIWorkoutDialog";
import { toast } from "sonner";

interface Workout {
  id: string;
  name: string;
  description: string;
  week_days: string[];
  category: string;
  difficulty_level: string;
  estimated_duration: number;
  exercises?: any[];
}

interface CheckIn {
  id: string;
  workout_id: string;
  completed_at: string;
}

export default function PhysicalActivity() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
      fetchWeeklyCheckins();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from("workouts")
        .select("*, workout_exercises(*)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast.error("Erro ao carregar treinos");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyCheckins = async () => {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("workout_checkins")
        .select("*")
        .eq("user_id", user?.id)
        .gte("completed_at", startOfWeek.toISOString());

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error("Error fetching checkins:", error);
    }
  };

  const totalWorkoutsThisWeek = checkins.length;
  const plannedWorkouts = workouts.reduce((acc, w) => acc + (w.week_days?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Atividade Física</h1>
              <p className="text-sm text-muted-foreground">
                Hoje é um ótimo dia para treinar! 💪
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Summary Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Resumo Semanal</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                {totalWorkoutsThisWeek}/{plannedWorkouts > 0 ? plannedWorkouts : "∞"}
              </p>
              <p className="text-sm text-muted-foreground">treinos concluídos</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Esta semana</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">+12% vs. semana passada</span>
              </div>
            </div>
          </div>
          <WeeklyConsistencyChart checkins={checkins} />
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="h-auto py-4 flex-col gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Treino</span>
          </Button>
          <Button
            onClick={() => setShowLibrary(true)}
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            size="lg"
          >
            <Calendar className="h-5 w-5" />
            <span>Biblioteca de Treinos</span>
          </Button>
          <Button
            onClick={() => setShowAIDialog(true)}
            variant="secondary"
            className="h-auto py-4 flex-col gap-2"
            size="lg"
          >
            <TrendingUp className="h-5 w-5" />
            <span>IA: Gerar Treino</span>
          </Button>
        </div>

        {/* Workouts List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Meus Treinos</h2>
          {workouts.length === 0 ? (
            <Card className="p-8 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum treino cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro treino ou escolha da biblioteca
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Treino
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onRefresh={fetchWorkouts}
                  onCheckInSuccess={fetchWeeklyCheckins}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateWorkoutDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchWorkouts}
      />
      <WorkoutLibrary
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelectTemplate={fetchWorkouts}
      />
      <AIWorkoutDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        onSuccess={fetchWorkouts}
      />
    </div>
  );
}
