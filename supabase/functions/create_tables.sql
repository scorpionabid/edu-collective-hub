
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  required BOOLEAN DEFAULT true,
  options JSONB,
  description TEXT
);

-- Create form_data table
CREATE TABLE IF NOT EXISTS form_data (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create form_data_history table
CREATE TABLE IF NOT EXISTS form_data_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  form_id BIGINT REFERENCES form_data(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  status TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id)
);
