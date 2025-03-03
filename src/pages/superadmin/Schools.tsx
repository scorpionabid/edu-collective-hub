
// Fix the property name mismatches (sectorId -> sector_id)
// Replace instances of sectorId with sector_id in the code

// For the Sector transformation:
const transformedSectors = sectorsData.map(sector => ({
  id: sector.id,
  name: sector.name,
  regionId: sector.region_id
}));

// For school creation:
const handleCreateSchool = async (data: any) => {
  try {
    // Make sure we're using sector_id, not sectorId
    await schools.create({
      name: data.name,
      sector_id: data.sector_id, // Using the correct property name
      address: data.address,
      email: data.email,
      phone: data.phone
    });
    
    toast.success('School created successfully');
    fetchSchools();
    setAddDialogOpen(false);
  } catch (error) {
    toast.error('Failed to create school');
  }
};

// For school update:
const handleUpdateSchool = async (data: any) => {
  if (!editingSchool) return;
  
  try {
    // Make sure we're using sector_id, not sectorId
    await schools.update(editingSchool.id, {
      name: data.name,
      sector_id: data.sector_id, // Using the correct property name
      address: data.address,
      email: data.email,
      phone: data.phone
    });
    
    toast.success('School updated successfully');
    fetchSchools();
    setEditDialogOpen(false);
    setEditingSchool(null);
  } catch (error) {
    toast.error('Failed to update school');
  }
};

// Fix the type casting for the schools state
setSchools(schoolsWithInfo.map(school => ({
  id: school.id,
  name: school.name,
  sector_id: school.sector_id, // Using the correct property name
  sectorName: school.sectorName,
  regionName: school.regionName,
  address: school.address,
  email: school.email,
  phone: school.phone
})));

// Fix button variant from "primary" to "default"
<Button variant="default" onClick={() => handleAction()}>
  Action
</Button>
