import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const ExamSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Exame importado com sucesso!
            </h1>
            <p className="text-muted-foreground">
              Seus marcadores foram salvos e já estão disponíveis para visualização.
            </p>
          </div>

          <Button onClick={() => navigate("/markers")} className="w-full">
            Ver meus marcadores
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamSuccess;
