
-- Create validation_rules table
CREATE TABLE IF NOT EXISTS public.validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('simple', 'dependency', 'complex', 'custom')),
  target_field TEXT NOT NULL,
  condition TEXT NOT NULL,
  value JSONB,
  message TEXT NOT NULL,
  source_field TEXT,
  expression TEXT,
  validation_fn TEXT,
  roles TEXT[],
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create validation_errors table to track validation issues
CREATE TABLE IF NOT EXISTS public.validation_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID,
  user_id UUID,
  component_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  input_value JSONB,
  validation_rule TEXT,
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create schema_definitions table to store JSON schema definitions
CREATE TABLE IF NOT EXISTS public.schema_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  schema_json JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_definitions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for validation_rules
CREATE POLICY "Validation rules are viewable by everyone"
ON public.validation_rules FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage validation rules"
ON public.validation_rules FOR INSERT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

CREATE POLICY "Only admins can update validation rules"
ON public.validation_rules FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

CREATE POLICY "Only admins can delete validation rules"
ON public.validation_rules FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

-- Create RLS policies for validation_errors
CREATE POLICY "Validation errors are viewable by admins only"
ON public.validation_errors FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

CREATE POLICY "Users can insert their own validation errors"
ON public.validation_errors FOR INSERT
TO authenticated
USING (
  user_id = auth.uid() OR
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

-- Create RLS policies for schema_definitions
CREATE POLICY "Schema definitions are viewable by everyone"
ON public.schema_definitions FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage schema definitions"
ON public.schema_definitions FOR INSERT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

CREATE POLICY "Only admins can update schema definitions"
ON public.schema_definitions FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

CREATE POLICY "Only admins can delete schema definitions"
ON public.schema_definitions FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

-- Create an example validation rule
INSERT INTO public.validation_rules (
  name,
  description,
  type,
  target_field,
  condition,
  value,
  message,
  category_id
)
VALUES (
  'Required School Name',
  'School name is required for all form submissions',
  'simple',
  'schoolName',
  'required',
  NULL,
  'Məktəb adı mütləq daxil edilməlidir',
  (SELECT id FROM public.categories LIMIT 1)
);

-- Add index on commonly queried fields
CREATE INDEX IF NOT EXISTS validation_rules_category_id_idx ON public.validation_rules(category_id);
CREATE INDEX IF NOT EXISTS validation_errors_timestamp_idx ON public.validation_errors(timestamp);
CREATE INDEX IF NOT EXISTS validation_errors_user_id_idx ON public.validation_errors(user_id);
CREATE INDEX IF NOT EXISTS schema_definitions_category_id_idx ON public.schema_definitions(category_id);
