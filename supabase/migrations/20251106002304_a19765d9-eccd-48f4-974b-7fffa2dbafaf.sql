-- Create workouts table
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  week_days TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT false,
  category TEXT,
  difficulty_level TEXT,
  estimated_duration INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sets INT NOT NULL,
  reps INT NOT NULL,
  load DECIMAL(10,2),
  notes TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workout_checkins table
CREATE TABLE public.workout_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create client_trainers table (for professional-client relationships)
CREATE TABLE public.client_trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  trainer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, trainer_id)
);

-- Enable RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_trainers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts
CREATE POLICY "Users can view their own workouts"
  ON public.workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view template workouts"
  ON public.workouts FOR SELECT
  USING (is_template = true);

CREATE POLICY "Professionals can view their clients workouts"
  ON public.workouts FOR SELECT
  USING (
    has_role(auth.uid(), 'professional'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.client_trainers
      WHERE trainer_id = auth.uid() AND client_id = workouts.user_id
    )
  );

CREATE POLICY "Users can create their own workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update their clients workouts"
  ON public.workouts FOR UPDATE
  USING (
    has_role(auth.uid(), 'professional'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.client_trainers
      WHERE trainer_id = auth.uid() AND client_id = workouts.user_id
    )
  );

CREATE POLICY "Users can delete their own workouts"
  ON public.workouts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workout_exercises
CREATE POLICY "Users can view exercises from their workouts"
  ON public.workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND (workouts.user_id = auth.uid() OR workouts.is_template = true)
    )
  );

CREATE POLICY "Professionals can view exercises from their clients workouts"
  ON public.workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts w
      JOIN public.client_trainers ct ON ct.client_id = w.user_id
      WHERE w.id = workout_exercises.workout_id
      AND ct.trainer_id = auth.uid()
      AND has_role(auth.uid(), 'professional'::app_role)
    )
  );

CREATE POLICY "Users can manage exercises in their workouts"
  ON public.workout_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can manage exercises in their clients workouts"
  ON public.workout_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts w
      JOIN public.client_trainers ct ON ct.client_id = w.user_id
      WHERE w.id = workout_exercises.workout_id
      AND ct.trainer_id = auth.uid()
      AND has_role(auth.uid(), 'professional'::app_role)
    )
  );

-- RLS Policies for workout_checkins
CREATE POLICY "Users can view their own checkins"
  ON public.workout_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view their clients checkins"
  ON public.workout_checkins FOR SELECT
  USING (
    has_role(auth.uid(), 'professional'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.client_trainers
      WHERE trainer_id = auth.uid() AND client_id = workout_checkins.user_id
    )
  );

CREATE POLICY "Users can create their own checkins"
  ON public.workout_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
  ON public.workout_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for client_trainers
CREATE POLICY "Clients can view their trainers"
  ON public.client_trainers FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Trainers can view their clients"
  ON public.client_trainers FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can add clients"
  ON public.client_trainers FOR INSERT
  WITH CHECK (
    auth.uid() = trainer_id AND
    has_role(auth.uid(), 'professional'::app_role)
  );

CREATE POLICY "Trainers can remove clients"
  ON public.client_trainers FOR DELETE
  USING (
    auth.uid() = trainer_id AND
    has_role(auth.uid(), 'professional'::app_role)
  );

-- Triggers for updated_at
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_is_template ON public.workouts(is_template);
CREATE INDEX idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX idx_workout_checkins_user_id ON public.workout_checkins(user_id);
CREATE INDEX idx_workout_checkins_workout_id ON public.workout_checkins(workout_id);
CREATE INDEX idx_workout_checkins_completed_at ON public.workout_checkins(completed_at);
CREATE INDEX idx_client_trainers_client_id ON public.client_trainers(client_id);
CREATE INDEX idx_client_trainers_trainer_id ON public.client_trainers(trainer_id);