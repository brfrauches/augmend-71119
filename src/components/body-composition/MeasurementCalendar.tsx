import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

interface BodyMeasurement {
  id: string;
  measured_at: string;
  weight_kg: number;
  fat_percent: number | null;
  lean_mass_kg: number | null;
}

interface MeasurementCalendarProps {
  measurements: BodyMeasurement[];
}

export function MeasurementCalendar({ measurements }: MeasurementCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const measurementDates = measurements.map((m) => new Date(m.measured_at));

  const selectedMeasurement = selectedDate
    ? measurements.find(
        (m) => format(new Date(m.measured_at), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      )
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendário de Medições</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              modifiers={{
                hasMeasurement: measurementDates,
              }}
              modifiersStyles={{
                hasMeasurement: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "white",
                  fontWeight: "bold",
                },
              }}
              className="rounded-md border"
            />
            <p className="text-sm text-muted-foreground mt-4">
              Datas com medições estão destacadas. Clique em uma data para ver os detalhes.
            </p>
          </div>

          <div>
            {selectedMeasurement ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {format(new Date(selectedMeasurement.measured_at), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">Peso Total</span>
                    <Badge variant="secondary">{selectedMeasurement.weight_kg} kg</Badge>
                  </div>

                  {selectedMeasurement.fat_percent && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Percentual de Gordura</span>
                      <Badge variant="secondary">{selectedMeasurement.fat_percent.toFixed(1)} %</Badge>
                    </div>
                  )}

                  {selectedMeasurement.lean_mass_kg && (
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Massa Magra</span>
                      <Badge variant="secondary">{selectedMeasurement.lean_mass_kg.toFixed(1)} kg</Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-6">
                Selecione uma data no calendário para ver os detalhes da medição
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
