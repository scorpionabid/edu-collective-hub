
-- Categories procedures
CREATE OR REPLACE FUNCTION get_categories_with_columns()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  region_id UUID,
  sector_id UUID,
  school_id UUID,
  columns JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.region_id,
    c.sector_id,
    c.school_id,
    COALESCE(
      (SELECT jsonb_agg(row_to_json(col))
       FROM (
         SELECT col.id, col.name, col.type, col.category_id
         FROM columns col
         WHERE col.category_id = c.id
       ) col
      ),
      '[]'::jsonb
    ) as columns
  FROM categories c;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_category_by_id(category_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  region_id UUID,
  sector_id UUID,
  school_id UUID,
  columns JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.region_id,
    c.sector_id,
    c.school_id,
    COALESCE(
      (SELECT jsonb_agg(row_to_json(col))
       FROM (
         SELECT col.id, col.name, col.type, col.category_id
         FROM columns col
         WHERE col.category_id = c.id
       ) col
      ),
      '[]'::jsonb
    ) as columns
  FROM categories c
  WHERE c.id = category_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_category(
  category_name TEXT,
  region_id UUID DEFAULT NULL,
  sector_id UUID DEFAULT NULL,
  school_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  region_id UUID,
  sector_id UUID,
  school_id UUID
) AS $$
DECLARE
  inserted_id BIGINT;
BEGIN
  INSERT INTO categories (name, region_id, sector_id, school_id, created_by)
  VALUES (category_name, region_id, sector_id, school_id, auth.uid())
  RETURNING id INTO inserted_id;

  RETURN QUERY
  SELECT c.id, c.name, c.region_id, c.sector_id, c.school_id
  FROM categories c
  WHERE c.id = inserted_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_category(
  id BIGINT,
  name TEXT DEFAULT NULL,
  region_id UUID DEFAULT NULL,
  sector_id UUID DEFAULT NULL,
  school_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  region_id UUID,
  sector_id UUID,
  school_id UUID
) AS $$
BEGIN
  UPDATE categories c
  SET 
    name = COALESCE(update_category.name, c.name),
    region_id = COALESCE(update_category.region_id, c.region_id),
    sector_id = COALESCE(update_category.sector_id, c.sector_id),
    school_id = COALESCE(update_category.school_id, c.school_id)
  WHERE c.id = update_category.id;

  RETURN QUERY
  SELECT c.id, c.name, c.region_id, c.sector_id, c.school_id
  FROM categories c
  WHERE c.id = update_category.id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_category(
  category_id BIGINT
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM categories
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

-- Columns procedures
CREATE OR REPLACE FUNCTION get_columns_by_category(category_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  type TEXT,
  category_id BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT col.id, col.name, col.type, col.category_id
  FROM columns col
  WHERE col.category_id = get_columns_by_category.category_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_column(
  column_name TEXT,
  column_type TEXT,
  category_id BIGINT
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  type TEXT,
  category_id BIGINT
) AS $$
DECLARE
  inserted_id BIGINT;
BEGIN
  INSERT INTO columns (name, type, category_id)
  VALUES (column_name, column_type, category_id)
  RETURNING id INTO inserted_id;

  RETURN QUERY
  SELECT col.id, col.name, col.type, col.category_id
  FROM columns col
  WHERE col.id = inserted_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_column(
  column_id BIGINT,
  column_name TEXT DEFAULT NULL,
  column_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  type TEXT,
  category_id BIGINT
) AS $$
BEGIN
  UPDATE columns col
  SET 
    name = COALESCE(update_column.column_name, col.name),
    type = COALESCE(update_column.column_type, col.type)
  WHERE col.id = update_column.column_id;

  RETURN QUERY
  SELECT col.id, col.name, col.type, col.category_id
  FROM columns col
  WHERE col.id = update_column.column_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_column(
  column_id BIGINT
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM columns
  WHERE id = column_id;
END;
$$ LANGUAGE plpgsql;

-- Form Data procedures
CREATE OR REPLACE FUNCTION get_form_data(
  school_id_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  category_id BIGINT,
  school_id UUID,
  data JSONB,
  status TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fd.id,
    fd.category_id,
    fd.school_id,
    fd.data,
    fd.status,
    fd.submitted_at,
    fd.approved_at,
    fd.approved_by
  FROM form_data fd
  WHERE (school_id_filter IS NULL OR fd.school_id = school_id_filter);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_form_data_by_id(
  form_id UUID
)
RETURNS TABLE (
  id UUID,
  category_id BIGINT,
  school_id UUID,
  data JSONB,
  status TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fd.id,
    fd.category_id,
    fd.school_id,
    fd.data,
    fd.status,
    fd.submitted_at,
    fd.approved_at,
    fd.approved_by
  FROM form_data fd
  WHERE fd.id = form_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION submit_form_data(
  category_id BIGINT,
  school_id UUID,
  form_data JSONB,
  status TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  category_id BIGINT,
  school_id UUID,
  data JSONB,
  status TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID
) AS $$
DECLARE
  inserted_id UUID;
BEGIN
  INSERT INTO form_data (
    category_id,
    school_id,
    data,
    status,
    submitted_at,
    created_by
  )
  VALUES (
    category_id,
    school_id,
    form_data,
    status,
    submitted_at,
    auth.uid()
  )
  RETURNING id INTO inserted_id;

  RETURN QUERY
  SELECT 
    fd.id,
    fd.category_id,
    fd.school_id,
    fd.data,
    fd.status,
    fd.submitted_at,
    fd.approved_at,
    fd.approved_by
  FROM form_data fd
  WHERE fd.id = inserted_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_form_data(
  form_id UUID,
  form_data JSONB DEFAULT NULL,
  status TEXT DEFAULT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  category_id BIGINT,
  school_id UUID,
  data JSONB,
  status TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID
) AS $$
BEGIN
  UPDATE form_data fd
  SET 
    data = COALESCE(update_form_data.form_data, fd.data),
    status = COALESCE(update_form_data.status, fd.status),
    submitted_at = COALESCE(update_form_data.submitted_at, fd.submitted_at),
    updated_at = now()
  WHERE fd.id = update_form_data.form_id;

  RETURN QUERY
  SELECT 
    fd.id,
    fd.category_id,
    fd.school_id,
    fd.data,
    fd.status,
    fd.submitted_at,
    fd.approved_at,
    fd.approved_by
  FROM form_data fd
  WHERE fd.id = update_form_data.form_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION approve_form_data(
  form_id UUID,
  approved_by UUID
)
RETURNS TABLE (
  id UUID,
  category_id BIGINT,
  school_id UUID,
  data JSONB,
  status TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID
) AS $$
BEGIN
  UPDATE form_data fd
  SET 
    status = 'approved',
    approved_at = now(),
    approved_by = approve_form_data.approved_by,
    updated_at = now()
  WHERE fd.id = approve_form_data.form_id;

  RETURN QUERY
  SELECT 
    fd.id,
    fd.category_id,
    fd.school_id,
    fd.data,
    fd.status,
    fd.submitted_at,
    fd.approved_at,
    fd.approved_by
  FROM form_data fd
  WHERE fd.id = approve_form_data.form_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reject_form_data(
  form_id UUID
)
RETURNS TABLE (
  id UUID,
  category_id BIGINT,
  school_id UUID,
  data JSONB,
  status TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID
) AS $$
BEGIN
  UPDATE form_data fd
  SET 
    status = 'rejected',
    updated_at = now()
  WHERE fd.id = reject_form_data.form_id;

  RETURN QUERY
  SELECT 
    fd.id,
    fd.category_id,
    fd.school_id,
    fd.data,
    fd.status,
    fd.submitted_at,
    fd.approved_at,
    fd.approved_by
  FROM form_data fd
  WHERE fd.id = reject_form_data.form_id;
END;
$$ LANGUAGE plpgsql;
