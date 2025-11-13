-- Create body_measurements table
CREATE TABLE public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2) NOT NULL,
  fat_percent NUMERIC(4,2),
  fat_weight_kg NUMERIC(5,2),
  lean_mass_kg NUMERIC(5,2),
  height_m NUMERIC(3,2),
  imc NUMERIC(4,2),
  water_percent NUMERIC(4,2),
  basal_metabolic_rate INTEGER,
  notes TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create body_segments table
CREATE TABLE public.body_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measurement_id UUID NOT NULL REFERENCES public.body_measurements(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  lean_mass_kg NUMERIC(5,2),
  fat_mass_kg NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for body_measurements
CREATE POLICY "Users can view their own measurements"
  ON public.body_measurements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own measurements"
  ON public.body_measurements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements"
  ON public.body_measurements
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements"
  ON public.body_measurements
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view their clients measurements"
  ON public.body_measurements
  FOR SELECT
  USING (
    has_role(auth.uid(), 'professional') 
    AND EXISTS (
      SELECT 1 FROM client_trainers 
      WHERE trainer_id = auth.uid() 
      AND client_id = body_measurements.user_id
    )
  );

-- RLS Policies for body_segments
CREATE POLICY "Users can view segments of their measurements"
  ON public.body_segments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM body_measurements 
      WHERE id = body_segments.measurement_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create segments for their measurements"
  ON public.body_segments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM body_measurements 
      WHERE id = body_segments.measurement_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update segments of their measurements"
  ON public.body_segments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM body_measurements 
      WHERE id = body_segments.measurement_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete segments of their measurements"
  ON public.body_segments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM body_measurements 
      WHERE id = body_segments.measurement_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can view their clients segments"
  ON public.body_segments
  FOR SELECT
  USING (
    has_role(auth.uid(), 'professional')
    AND EXISTS (
      SELECT 1 FROM body_measurements bm
      JOIN client_trainers ct ON ct.client_id = bm.user_id
      WHERE bm.id = body_segments.measurement_id
      AND ct.trainer_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_body_measurements_updated_at
  BEFORE UPDATE ON public.body_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();