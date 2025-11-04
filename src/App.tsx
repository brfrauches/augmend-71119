
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { detectBrowser } from "@/utils/browser-detection";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ReflectionJournal from "./pages/ReflectionJournal";
import HealthAssistant from "./pages/HealthAssistant";
import WellnessCenter from "./pages/WellnessCenter";
import Achievements from "./pages/Achievements";

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

// Log browser information
const browserInfo = detectBrowser();
console.log("Browser Information:", browserInfo);

const App = () => {
  console.log("App Component Initializing");

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/reflection-journal" element={<ReflectionJournal />} />
                <Route path="/health-assistant" element={<HealthAssistant />} />
                <Route path="/wellness-center" element={<WellnessCenter />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
