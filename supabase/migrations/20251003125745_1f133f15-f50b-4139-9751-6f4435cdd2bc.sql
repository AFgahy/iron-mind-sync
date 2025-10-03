-- Create user_context table for learning system
CREATE TABLE public.user_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_key TEXT NOT NULL,
  context_value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('preference', 'behavior', 'history', 'skill')),
  confidence_score FLOAT DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, context_key)
);

-- Enable RLS
ALTER TABLE public.user_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own context"
  ON public.user_context FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context"
  ON public.user_context FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context"
  ON public.user_context FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own context"
  ON public.user_context FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_context_user_id ON public.user_context(user_id);
CREATE INDEX idx_user_context_category ON public.user_context(category);
CREATE INDEX idx_user_context_updated_at ON public.user_context(updated_at);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.update_user_context_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to update timestamp
CREATE TRIGGER on_user_context_updated
  BEFORE UPDATE ON public.user_context
  FOR EACH ROW EXECUTE FUNCTION public.update_user_context_timestamp();