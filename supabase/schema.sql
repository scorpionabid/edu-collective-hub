
-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id),
  sector_id UUID REFERENCES public.sectors(id),
  school_id UUID REFERENCES public.schools(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Create columns table
CREATE TABLE IF NOT EXISTS public.columns (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category_id BIGINT REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  options JSONB,
  required BOOLEAN DEFAULT true,
  description TEXT
);

-- Create form_data table for storing submitted data
CREATE TABLE IF NOT EXISTS public.form_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id BIGINT REFERENCES public.categories(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable row level security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Superadmins can insert categories" 
ON public.categories FOR INSERT 
TO authenticated
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'superadmin');

CREATE POLICY "Region admins can insert region-specific categories" 
ON public.categories FOR INSERT 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'regionadmin' AND
  region_id = (SELECT region_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Sector admins can insert sector-specific categories" 
ON public.categories FOR INSERT 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'sectoradmin' AND
  sector_id = (SELECT sector_id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create RLS policies for columns
CREATE POLICY "Columns are viewable by everyone" 
ON public.columns FOR SELECT
USING (true);

CREATE POLICY "Only category creators can insert columns" 
ON public.columns FOR INSERT 
TO authenticated
USING (
  (
    SELECT created_by FROM public.categories WHERE id = category_id
  ) = auth.uid()
);

-- Create RLS policies for form_data
CREATE POLICY "Form data is viewable by admins and owners" 
ON public.form_data FOR SELECT
USING (
  school_id = (SELECT school_id FROM public.profiles WHERE user_id = auth.uid()) OR
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

CREATE POLICY "School admins can insert their own form data" 
ON public.form_data FOR INSERT 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'schooladmin' AND
  school_id = (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "School admins can update their draft form data" 
ON public.form_data FOR UPDATE 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'schooladmin' AND
  school_id = (SELECT school_id FROM public.profiles WHERE user_id = auth.uid()) AND
  status = 'draft'
);

CREATE POLICY "Admins can update form data status" 
ON public.form_data FOR UPDATE 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('superadmin', 'regionadmin', 'sectoradmin')
);

-- Setup Supabase Realtime for form_data
ALTER TABLE public.form_data REPLICA IDENTITY FULL;
