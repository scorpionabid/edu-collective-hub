
-- Function to get all categories
CREATE OR REPLACE FUNCTION get_categories()
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', c.id,
      'name', c.name,
      'regionId', c.region_id,
      'sectorId', c.sector_id,
      'schoolId', c.school_id,
      'createdAt', c.created_at,
      'createdBy', c.created_by
    )
  FROM categories c;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a category by ID
CREATE OR REPLACE FUNCTION get_category_by_id(category_id bigint)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT 
    json_build_object(
      'id', c.id,
      'name', c.name,
      'regionId', c.region_id,
      'sectorId', c.sector_id,
      'schoolId', c.school_id,
      'createdAt', c.created_at,
      'createdBy', c.created_by,
      'columns', (
        SELECT json_agg(
          json_build_object(
            'id', col.id,
            'name', col.name,
            'type', col.type,
            'categoryId', col.category_id,
            'required', col.required,
            'options', col.options,
            'description', col.description
          )
        )
        FROM columns col
        WHERE col.category_id = c.id
      )
    ) INTO result
  FROM categories c
  WHERE c.id = category_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a category
CREATE OR REPLACE FUNCTION create_category(
  category_name text,
  region_id uuid DEFAULT NULL,
  sector_id uuid DEFAULT NULL,
  school_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  new_category_id bigint;
  result json;
BEGIN
  INSERT INTO categories (name, region_id, sector_id, school_id, created_by)
  VALUES (category_name, region_id, sector_id, school_id, auth.uid())
  RETURNING id INTO new_category_id;
  
  SELECT 
    json_build_object(
      'id', c.id,
      'name', c.name,
      'regionId', c.region_id,
      'sectorId', c.sector_id,
      'schoolId', c.school_id,
      'createdAt', c.created_at,
      'createdBy', c.created_by
    ) INTO result
  FROM categories c
  WHERE c.id = new_category_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a category
CREATE OR REPLACE FUNCTION update_category(
  category_id bigint,
  category_name text
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  UPDATE categories
  SET name = category_name
  WHERE id = category_id;
  
  SELECT 
    json_build_object(
      'id', c.id,
      'name', c.name,
      'regionId', c.region_id,
      'sectorId', c.sector_id,
      'schoolId', c.school_id,
      'createdAt', c.created_at,
      'createdBy', c.created_by
    ) INTO result
  FROM categories c
  WHERE c.id = category_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a category
CREATE OR REPLACE FUNCTION delete_category(category_id bigint)
RETURNS void AS $$
BEGIN
  DELETE FROM categories
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
