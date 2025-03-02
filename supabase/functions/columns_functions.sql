
-- Function to get columns by category
CREATE OR REPLACE FUNCTION get_columns_by_category(category_id bigint)
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', c.id,
      'name', c.name,
      'type', c.type,
      'categoryId', c.category_id,
      'required', c.required,
      'options', c.options,
      'description', c.description
    )
  FROM columns c
  WHERE c.category_id = category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a column
CREATE OR REPLACE FUNCTION create_column(
  column_name text,
  column_type text,
  category_id bigint,
  column_required boolean DEFAULT true,
  column_options jsonb DEFAULT NULL,
  column_description text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  new_column_id bigint;
  result json;
BEGIN
  INSERT INTO columns (name, type, category_id, required, options, description)
  VALUES (column_name, column_type, category_id, column_required, column_options, column_description)
  RETURNING id INTO new_column_id;
  
  SELECT 
    json_build_object(
      'id', c.id,
      'name', c.name,
      'type', c.type,
      'categoryId', c.category_id,
      'required', c.required,
      'options', c.options,
      'description', c.description
    ) INTO result
  FROM columns c
  WHERE c.id = new_column_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a column
CREATE OR REPLACE FUNCTION update_column(
  column_id bigint,
  column_name text DEFAULT NULL,
  column_type text DEFAULT NULL,
  column_required boolean DEFAULT NULL,
  column_options jsonb DEFAULT NULL,
  column_description text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  UPDATE columns
  SET 
    name = COALESCE(column_name, name),
    type = COALESCE(column_type, type),
    required = COALESCE(column_required, required),
    options = COALESCE(column_options, options),
    description = COALESCE(column_description, description)
  WHERE id = column_id;
  
  SELECT 
    json_build_object(
      'id', c.id,
      'name', c.name,
      'type', c.type,
      'categoryId', c.category_id,
      'required', c.required,
      'options', c.options,
      'description', c.description
    ) INTO result
  FROM columns c
  WHERE c.id = column_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a column
CREATE OR REPLACE FUNCTION delete_column(column_id bigint)
RETURNS void AS $$
BEGIN
  DELETE FROM columns
  WHERE id = column_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
