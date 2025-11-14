
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Markers from "./pages/Markers";
import MarkerDetail from "./pages/MarkerDetail";
import PhysicalActivity from "./pages/PhysicalActivity";
import Supplements from "./pages/Supplements";
import SupplementDetail from "./pages/SupplementDetail";
import BodyComposition from "./pages/BodyComposition";
import Nutrition from "./pages/Nutrition";
import NotFound from "./pages/NotFound";

// Initialize query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      meta: {
        onError: (error: unknown) => {
          console.error("Query Error:", error);
        }
      }
    }
  }
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/markers" element={<Markers />} />
                  <Route path="/markers/:id" element={<MarkerDetail />} />
                  <Route path="/physical-activity" element={<PhysicalActivity />} />
                  <Route path="/supplements" element={<Supplements />} />
                  <Route path="/supplements/:id" element={<SupplementDetail />} />
                  <Route path="/evolucao-corporal" element={<BodyComposition />} />
                  <Route path="/nutrition" element={<Nutrition />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BottomNav />
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
