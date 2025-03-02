
-- Function to get all form data
CREATE OR REPLACE FUNCTION get_all_form_data()
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', fd.id,
      'categoryId', fd.category_id,
      'schoolId', fd.school_id,
      'data', fd.data,
      'status', fd.status,
      'submittedAt', fd.submitted_at,
      'approvedAt', fd.approved_at,
      'approvedBy', fd.approved_by,
      'createdAt', fd.created_at,
      'updatedAt', fd.updated_at,
      'createdBy', fd.created_by,
      'categoryName', (SELECT name FROM categories WHERE id = fd.category_id),
      'schoolName', (SELECT name FROM schools WHERE id = fd.school_id)
    )
  FROM form_data fd;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get form data by school
CREATE OR REPLACE FUNCTION get_form_data_by_school(school_id uuid)
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT 
    json_build_object(
      'id', fd.id,
      'categoryId', fd.category_id,
      'schoolId', fd.school_id,
      'data', fd.data,
      'status', fd.status,
      'submittedAt', fd.submitted_at,
      'approvedAt', fd.approved_at,
      'approvedBy', fd.approved_by,
      'createdAt', fd.created_at,
      'updatedAt', fd.updated_at,
      'createdBy', fd.created_by,
      'categoryName', (SELECT name FROM categories WHERE id = fd.category_id)
    )
  FROM form_data fd
  WHERE fd.school_id = school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get form data by ID
CREATE OR REPLACE FUNCTION get_form_data_by_id(form_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT 
    json_build_object(
      'id', fd.id,
      'categoryId', fd.category_id,
      'schoolId', fd.school_id,
      'data', fd.data,
      'status', fd.status,
      'submittedAt', fd.submitted_at,
      'approvedAt', fd.approved_at,
      'approvedBy', fd.approved_by,
      'createdAt', fd.created_at,
      'updatedAt', fd.updated_at,
      'createdBy', fd.created_by,
      'categoryName', (SELECT name FROM categories WHERE id = fd.category_id),
      'schoolName', (SELECT name FROM schools WHERE id = fd.school_id)
    ) INTO result
  FROM form_data fd
  WHERE fd.id = form_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit form data
CREATE OR REPLACE FUNCTION submit_form_data(
  category_id bigint,
  school_id uuid,
  form_data jsonb,
  form_status text DEFAULT 'draft'
)
RETURNS json AS $$
DECLARE
  new_form_id uuid;
  result json;
BEGIN
  INSERT INTO form_data (category_id, school_id, data, status, created_by, submitted_at)
  VALUES (
    category_id, 
    school_id, 
    form_data, 
    form_status, 
    auth.uid(),
    CASE WHEN form_status = 'submitted' THEN now() ELSE NULL END
  )
  RETURNING id INTO new_form_id;
  
  SELECT 
    json_build_object(
      'id', fd.id,
      'categoryId', fd.category_id,
      'schoolId', fd.school_id,
      'data', fd.data,
      'status', fd.status,
      'submittedAt', fd.submitted_at,
      'createdAt', fd.created_at,
      'updatedAt', fd.updated_at,
      'createdBy', fd.created_by
    ) INTO result
  FROM form_data fd
  WHERE fd.id = new_form_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update form data
CREATE OR REPLACE FUNCTION update_form_data(
  form_id uuid,
  form_data jsonb DEFAULT NULL,
  form_status text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  result json;
  current_status text;
BEGIN
  -- Get current status
  SELECT status INTO current_status FROM form_data WHERE id = form_id;
  
  UPDATE form_data
  SET 
    data = COALESCE(form_data, data),
    status = COALESCE(form_status, status),
    updated_at = now(),
    submitted_at = CASE 
      WHEN form_status = 'submitted' AND current_status != 'submitted' THEN now() 
      ELSE submitted_at 
    END
  WHERE id = form_id;
  
  SELECT 
    json_build_object(
      'id', fd.id,
      'categoryId', fd.category_id,
      'schoolId', fd.school_id,
      'data', fd.data,
      'status', fd.status,
      'submittedAt', fd.submitted_at,
      'approvedAt', fd.approved_at,
      'approvedBy', fd.approved_by,
      'createdAt', fd.created_at,
      'updatedAt', fd.updated_at,
      'createdBy', fd.created_by
    ) INTO result
  FROM form_data fd
  WHERE fd.id = form_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve form data
CREATE OR REPLACE FUNCTION approve_form_data(
  form_id uuid,
  approved_by_user uuid
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  UPDATE form_data
  SET 
    status = 'approved',
    approved_at = now(),
    approved_by = approved_by_user,
    updated_at = now()
  WHERE id = form_id;
  
  SELECT 
    json_build_object(
      'id', fd.id,
      'categoryId', fd.category_id,
      'schoolId', fd.school_id,
      'data', fd.data,
      'status', fd.status,
      'submittedAt', fd.submitted_at,
      'approvedAt', fd.approved_at,
      'approvedBy', fd.approved_by,
      'createdAt', fd.created_at,
      'updatedAt', fd.updated_at,
      'createdBy', fd.created_by
    ) INTO result
  FROM form_data fd
  WHERE fd.id = form_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject form data
CREATE OR REPLACE FUNCTION reject_form_data(form_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  UPDATE form_data
  SET 
    status = 'rejected',
    updated_at = now()
  WHERE id = form_id;
  
  SELECT 
    json_build_object(
      'id', fd.id,
      'categoryId', fd.category_id,
      'schoolId', fd.school_id,
      'data', fd.data,
      'status', fd.status,
      'submittedAt', fd.submitted_at,
      'approvedAt', fd.approved_at,
      'approvedBy', fd.approved_by,
      'createdAt', fd.created_at,
      'updatedAt', fd.updated_at,
      'createdBy', fd.created_by
    ) INTO result
  FROM form_data fd
  WHERE fd.id = form_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
