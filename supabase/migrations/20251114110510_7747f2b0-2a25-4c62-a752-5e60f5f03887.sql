-- Create nutrition_meals table
CREATE TABLE public.nutrition_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  total_calories DECIMAL,
  protein_g DECIMAL,
  carbs_g DECIMAL,
  fat_g DECIMAL,
  notes TEXT,
  image_url TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create nutrition_items table
CREATE TABLE public.nutrition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES public.nutrition_meals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calories DECIMAL,
  protein_g DECIMAL,
  carbs_g DECIMAL,
  fat_g DECIMAL,
  quantity TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create water_logs table
CREATE TABLE public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create nutrition_ai_logs table
CREATE TABLE public.nutrition_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  suggestion_text TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutrition_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_ai_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutrition_meals
CREATE POLICY "Users can view their own meals"
  ON public.nutrition_meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meals"
  ON public.nutrition_meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
  ON public.nutrition_meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
  ON public.nutrition_meals FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view their clients meals"
  ON public.nutrition_meals FOR SELECT
  USING (
    has_role(auth.uid(), 'professional') AND
    EXISTS (
      SELECT 1 FROM client_trainers
      WHERE trainer_id = auth.uid() AND client_id = nutrition_meals.user_id
    )
  );

-- RLS Policies for nutrition_items
CREATE POLICY "Users can view items from their meals"
  ON public.nutrition_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nutrition_meals
      WHERE nutrition_meals.id = nutrition_items.meal_id
      AND nutrition_meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage items in their meals"
  ON public.nutrition_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM nutrition_meals
      WHERE nutrition_meals.id = nutrition_items.meal_id
      AND nutrition_meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can view their clients meal items"
  ON public.nutrition_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nutrition_meals nm
      JOIN client_trainers ct ON ct.client_id = nm.user_id
      WHERE nm.id = nutrition_items.meal_id
      AND ct.trainer_id = auth.uid()
      AND has_role(auth.uid(), 'professional')
    )
  );

-- RLS Policies for water_logs
CREATE POLICY "Users can view their own water logs"
  ON public.water_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own water logs"
  ON public.water_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water logs"
  ON public.water_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view their clients water logs"
  ON public.water_logs FOR SELECT
  USING (
    has_role(auth.uid(), 'professional') AND
    EXISTS (
      SELECT 1 FROM client_trainers
      WHERE trainer_id = auth.uid() AND client_id = water_logs.user_id
    )
  );

-- RLS Policies for nutrition_ai_logs
CREATE POLICY "Users can view their own AI logs"
  ON public.nutrition_ai_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI logs"
  ON public.nutrition_ai_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professionals can view their clients AI logs"
  ON public.nutrition_ai_logs FOR SELECT
  USING (
    has_role(auth.uid(), 'professional') AND
    EXISTS (
      SELECT 1 FROM client_trainers
      WHERE trainer_id = auth.uid() AND client_id = nutrition_ai_logs.user_id
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_nutrition_meals_updated_at
  BEFORE UPDATE ON public.nutrition_meals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();