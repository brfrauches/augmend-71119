-- Create supplements table
CREATE TABLE public.supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  form TEXT,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  linked_marker_id UUID REFERENCES public.health_markers(id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create supplement_logs table
CREATE TABLE public.supplement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  taken_at DATE NOT NULL,
  dose TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supplements
CREATE POLICY "Users can view their own supplements"
  ON public.supplements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supplements"
  ON public.supplements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplements"
  ON public.supplements
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplements"
  ON public.supplements
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view their clients supplements"
  ON public.supplements
  FOR SELECT
  USING (
    has_role(auth.uid(), 'professional'::app_role) 
    AND EXISTS (
      SELECT 1 FROM public.client_trainers 
      WHERE trainer_id = auth.uid() AND client_id = user_id
    )
  );

-- RLS Policies for supplement_logs
CREATE POLICY "Users can view their own supplement logs"
  ON public.supplement_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supplement logs"
  ON public.supplement_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement logs"
  ON public.supplement_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement logs"
  ON public.supplement_logs
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view their clients supplement logs"
  ON public.supplement_logs
  FOR SELECT
  USING (
    has_role(auth.uid(), 'professional'::app_role) 
    AND EXISTS (
      SELECT 1 FROM public.client_trainers 
      WHERE trainer_id = auth.uid() AND client_id = user_id
    )
  );

-- Create indexes
CREATE INDEX idx_supplements_user_id ON public.supplements(user_id);
CREATE INDEX idx_supplements_linked_marker ON public.supplements(linked_marker_id);
CREATE INDEX idx_supplement_logs_supplement_id ON public.supplement_logs(supplement_id);
CREATE INDEX idx_supplement_logs_user_id ON public.supplement_logs(user_id);
CREATE INDEX idx_supplement_logs_taken_at ON public.supplement_logs(taken_at);

-- Create trigger for updated_at
CREATE TRIGGER update_supplements_updated_at
  BEFORE UPDATE ON public.supplements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();