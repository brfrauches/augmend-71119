import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Apple, 
  Dumbbell, 
  FlaskConical, 
  LogOut, 
  Pill, 
  Ruler, 
  TrendingUp 
} from "lucide-react";
import logo from "@/assets/logo.png";

export default function Dashboard() {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const modules = [
    {
      title: "Marcadores de Saúde",
      description: "Acompanhe seus exames e indicadores",
      icon: FlaskConical,
      href: "/markers",
      color: "text-blue-600"
    },
    {
      title: "Suplementação",
      description: "Registre suplementos e medicamentos",
      icon: Pill,
      href: "/supplements",
      color: "text-green-600"
    },
    {
      title: "Atividade Física",
      description: "Gerencie treinos e exercícios",
      icon: Dumbbell,
      href: "/workouts",
      color: "text-orange-600"
    },
    {
      title: "Alimentação",
      description: "Monitore nutrição com IA",
      icon: Apple,
      href: "/nutrition",
      color: "text-red-600"
    },
    {
      title: "Evolução Corporal",
      description: "Acompanhe medidas e composição",
      icon: Ruler,
      href: "/body-evolution",
      color: "text-purple-600"
    },
    {
      title: "Análise com IA",
      description: "Insights e recomendações personalizadas",
      icon: TrendingUp,
      href: "/insights",
      color: "text-cyan-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Avitta Health" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-semibold">Avitta Health</h1>
              <p className="text-sm text-muted-foreground">
                {userRole?.role === "professional" ? "Área Profissional" : "Área do Usuário"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.email}</p>
              {userRole && (
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole.role === "individual" ? "Usuário Individual" : 
                   userRole.role === "professional" ? "Profissional" : "Administrador"}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bem-vindo de volta! 👋
          </h2>
          <p className="text-muted-foreground">
            Escolha um módulo para começar seu acompanhamento de saúde
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card 
              key={module.href}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(module.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-secondary/50 ${module.color} group-hover:scale-110 transition-transform`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <Activity className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full group-hover:bg-secondary">
                  Acessar módulo →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats - Placeholder for now */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Visão Geral</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Marcadores", value: "0", unit: "registrados" },
              { label: "Treinos", value: "0", unit: "esta semana" },
              { label: "Proteína", value: "0g", unit: "hoje" },
              { label: "Peso", value: "--", unit: "kg" },
            ].map((stat, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label} <span className="text-muted-foreground/70">• {stat.unit}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
