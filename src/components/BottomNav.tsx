import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home,
  FlaskConical, 
  Pill, 
  Apple, 
  Dumbbell, 
  Ruler, 
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const leftItems = [
    { icon: FlaskConical, href: "/markers", label: "Marcadores" },
    { icon: Pill, href: "/supplements", label: "Suplementação" },
    { icon: Apple, href: "/nutrition", label: "Alimentação" },
  ];

  const rightItems = [
    { icon: Dumbbell, href: "/physical-activity", label: "Atividade Física" },
    { icon: Ruler, href: "/evolucao-corporal", label: "Evolução Corporal" },
    { icon: TrendingUp, href: "/insights", label: "Análise com IA" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 py-4">
          {/* Left Items */}
          <div className="flex items-center gap-2">
            {leftItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
                aria-label={item.label}
              >
                <item.icon className="h-6 w-6" />
              </button>
            ))}
          </div>

          {/* Home Button - Destacado */}
          <button
            onClick={() => navigate("/dashboard")}
            className={cn(
              "flex items-center justify-center w-16 h-16 rounded-full transition-all scale-110 mx-2",
              isActive("/dashboard")
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-primary/90 text-primary-foreground hover:bg-primary shadow-md"
            )}
            aria-label="Home"
          >
            <Home className="h-7 w-7" />
          </button>

          {/* Right Items */}
          <div className="flex items-center gap-2">
            {rightItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
                aria-label={item.label}
              >
                <item.icon className="h-6 w-6" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
