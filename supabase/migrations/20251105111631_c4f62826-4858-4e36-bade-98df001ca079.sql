-- Create health markers table
CREATE TABLE public.health_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  min_reference DECIMAL,
  max_reference DECIMAL,
  personal_goal DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health marker values table
CREATE TABLE public.health_marker_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marker_id UUID NOT NULL REFERENCES public.health_markers(id) ON DELETE CASCADE,
  value DECIMAL NOT NULL,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  supplement_intervention_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_marker_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_markers
CREATE POLICY "Users can view their own markers"
  ON public.health_markers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own markers"
  ON public.health_markers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own markers"
  ON public.health_markers
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own markers"
  ON public.health_markers
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for health_marker_values
CREATE POLICY "Users can view their own marker values"
  ON public.health_marker_values
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.health_markers
      WHERE health_markers.id = health_marker_values.marker_id
      AND health_markers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own marker values"
  ON public.health_marker_values
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.health_markers
      WHERE health_markers.id = health_marker_values.marker_id
      AND health_markers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own marker values"
  ON public.health_marker_values
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.health_markers
      WHERE health_markers.id = health_marker_values.marker_id
      AND health_markers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own marker values"
  ON public.health_marker_values
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.health_markers
      WHERE health_markers.id = health_marker_values.marker_id
      AND health_markers.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_health_markers_updated_at
  BEFORE UPDATE ON public.health_markers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_health_markers_user_id ON public.health_markers(user_id);
CREATE INDEX idx_health_marker_values_marker_id ON public.health_marker_values(marker_id);
CREATE INDEX idx_health_marker_values_measured_at ON public.health_marker_values(measured_at);