import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Droplets } from "lucide-react";

interface AddWaterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWaterAdded: () => void;
}

export function AddWaterDialog({ open, onOpenChange, onWaterAdded }: AddWaterDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const quickAmounts = [
    { label: "Copo Pequeno", value: 250 },
    { label: "Copo Grande", value: 500 },
    { label: "Garrafa", value: 750 },
    { label: "1 Litro", value: 1000 },
  ];

  const handleAddWater = async (amount: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("water_logs" as any)
        .insert({
          user_id: user.id,
          amount_ml: amount,
        });

      if (error) throw error;

      toast.success(`${amount}ml de água registrados! 💧`);
      onWaterAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding water:", error);
      toast.error("Erro ao registrar água");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Água 💧</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Selecione uma quantidade rápida:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {quickAmounts.map((amount) => (
              <Button
                key={amount.value}
                onClick={() => handleAddWater(amount.value)}
                disabled={loading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                <Droplets className="h-6 w-6 text-cyan-500" />
                <div className="text-center">
                  <div className="font-semibold">{amount.label}</div>
                  <div className="text-xs text-muted-foreground">{amount.value}ml</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="pt-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}