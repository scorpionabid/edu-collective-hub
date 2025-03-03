
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, School as SchoolIcon, Pencil, Trash2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  sectorId?: string;
  sectorName?: string;
  regionId?: string;
  regionName?: string;
}

interface Region {
  id: string;
  name: string;
}

interface Sector {
  id: string;
  name: string;
  regionId: string;
}

const Schools = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [availableSectors, setAvailableSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  
  // Form states
  const [schoolName, setSchoolName] = useState<string>("");
  const [schoolAddress, setSchoolAddress] = useState<string>("");
  const [schoolPhone, setSchoolPhone] = useState<string>("");
  const [schoolEmail, setSchoolEmail] = useState<string>("");
  const [schoolSector, setSchoolSector] = useState<string>("");
  const [schoolRegion, setSchoolRegion] = useState<string>("");

  useEffect(() => {
    fetchSchools();
    fetchRegions();
    fetchSectors();
  }, []);

  useEffect(() => {
    // Filter schools based on search term and selected filters
    const filtered = schools.filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (school.address && school.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (school.phone && school.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (school.email && school.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRegion = !selectedRegion || school.regionId === selectedRegion;
      const matchesSector = !selectedSector || school.sectorId === selectedSector;
      
      return matchesSearch && matchesRegion && matchesSector;
    });
    
    setFilteredSchools(filtered);
  }, [schools, searchTerm, selectedRegion, selectedSector]);

  // Update available sectors when region changes
  useEffect(() => {
    if (showAddDialog || showEditDialog) {
      if (schoolRegion) {
        const sectorsByRegion = sectors.filter(sector => sector.regionId === schoolRegion);
        setAvailableSectors(sectorsByRegion);
        
        // If the currently selected sector doesn't belong to the new region, reset it
        const sectorExistsInRegion = sectorsByRegion.some(sector => sector.id === schoolSector);
        if (!sectorExistsInRegion) {
          setSchoolSector("");
        }
      } else {
        setAvailableSectors([]);
        setSchoolSector("");
      }
    }
  }, [schoolRegion, sectors, showAddDialog, showEditDialog, schoolSector]);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const data = await api.schools.getAll();
      setSchools(data);
      setFilteredSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to load schools");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const data = await api.regions.getAll();
      setRegions(data);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Failed to load regions");
    }
  };

  const fetchSectors = async () => {
    try {
      const data = await api.sectors.getAll();
      setSectors(data);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Failed to load sectors");
    }
  };

  const resetForm = () => {
    setSchoolName("");
    setSchoolAddress("");
    setSchoolPhone("");
    setSchoolEmail("");
    setSchoolSector("");
    setSchoolRegion("");
  };

  const handleAddSchool = async () => {
    if (!schoolName.trim()) {
      toast.error("School name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const newSchool = await api.schools.create({
        name: schoolName,
        address: schoolAddress,
        phone: schoolPhone,
        email: schoolEmail,
        sectorId: schoolSector || undefined
      });

      // Add region name and sector name for display
      const displaySchool = {
        ...newSchool,
        sectorName: sectors.find(s => s.id === newSchool.sectorId)?.name || "",
        regionId: sectors.find(s => s.id === newSchool.sectorId)?.regionId || "",
        regionName: ""
      };
      
      if (displaySchool.regionId) {
        displaySchool.regionName = regions.find(r => r.id === displaySchool.regionId)?.name || "";
      }

      setSchools([...schools, displaySchool]);
      setShowAddDialog(false);
      resetForm();
      toast.success("School added successfully");
    } catch (error) {
      console.error("Error adding school:", error);
      toast.error("Failed to add school");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSchool = async () => {
    if (!currentSchool) return;
    if (!schoolName.trim()) {
      toast.error("School name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const updatedSchool = await api.schools.update(currentSchool.id, {
        name: schoolName,
        address: schoolAddress,
        phone: schoolPhone,
        email: schoolEmail,
        sectorId: schoolSector || undefined
      });

      // Add region name and sector name for display
      const displaySchool = {
        ...updatedSchool,
        sectorName: sectors.find(s => s.id === updatedSchool.sectorId)?.name || "",
        regionId: sectors.find(s => s.id === updatedSchool.sectorId)?.regionId || "",
        regionName: ""
      };
      
      if (displaySchool.regionId) {
        displaySchool.regionName = regions.find(r => r.id === displaySchool.regionId)?.name || "";
      }

      setSchools(schools.map(school => 
        school.id === currentSchool.id ? displaySchool : school
      ));
      
      setShowEditDialog(false);
      setCurrentSchool(null);
      resetForm();
      toast.success("School updated successfully");
    } catch (error) {
      console.error("Error updating school:", error);
      toast.error("Failed to update school");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchool = async () => {
    if (!currentSchool) return;

    setIsLoading(true);
    try {
      await api.schools.delete(currentSchool.id);
      setSchools(schools.filter(school => school.id !== currentSchool.id));
      setShowDeleteDialog(false);
      setCurrentSchool(null);
      toast.success("School deleted successfully");
    } catch (error) {
      console.error("Error deleting school:", error);
      toast.error("Failed to delete school");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Schools</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add School
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search schools..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="w-full sm:w-[200px]">
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Regions</SelectItem>
                          {regions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-[200px]">
                      <Select 
                        value={selectedSector} 
                        onValueChange={setSelectedSector}
                        disabled={!selectedRegion && sectors.length > 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Sectors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Sectors</SelectItem>
                          {sectors
                            .filter(sector => !selectedRegion || sector.regionId === selectedRegion)
                            .map((sector) => (
                              <SelectItem key={sector.id} value={sector.id}>
                                {sector.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Schools</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">Loading...</div>
                ) : filteredSchools.length === 0 ? (
                  <div className="text-center p-4">No schools found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>School Name</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Sector</TableHead>
                          <TableHead>Contact Info</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSchools.map((school) => (
                          <TableRow key={school.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <SchoolIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                {school.name}
                              </div>
                            </TableCell>
                            <TableCell>{school.regionName || "-"}</TableCell>
                            <TableCell>{school.sectorName || "-"}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {school.phone && <div>{school.phone}</div>}
                                {school.email && <div>{school.email}</div>}
                                {school.address && (
                                  <div className="text-muted-foreground truncate max-w-[200px]">
                                    {school.address}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setCurrentSchool(school);
                                    setSchoolName(school.name);
                                    setSchoolAddress(school.address || "");
                                    setSchoolPhone(school.phone || "");
                                    setSchoolEmail(school.email || "");
                                    setSchoolSector(school.sectorId || "");
                                    setSchoolRegion(school.regionId || "");
                                    setShowEditDialog(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setCurrentSchool(school);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Add School Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New School</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                placeholder="Enter school name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school-region">Region</Label>
              <Select value={schoolRegion} onValueChange={setSchoolRegion}>
                <SelectTrigger id="school-region">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school-sector">Sector</Label>
              <Select 
                value={schoolSector} 
                onValueChange={setSchoolSector}
                disabled={!schoolRegion}
              >
                <SelectTrigger id="school-sector">
                  <SelectValue placeholder={schoolRegion ? "Select a sector" : "Select a region first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {availableSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school-address">Address</Label>
              <Input
                id="school-address"
                placeholder="Enter school address"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school-phone">Phone</Label>
              <Input
                id="school-phone"
                placeholder="Enter school phone"
                value={schoolPhone}
                onChange={(e) => setSchoolPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school-email">Email</Label>
              <Input
                id="school-email"
                type="email"
                placeholder="Enter school email"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddSchool} disabled={isLoading || !schoolName.trim()}>
              {isLoading ? "Adding..." : "Add School"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-school-name">School Name</Label>
              <Input
                id="edit-school-name"
                placeholder="Enter school name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-school-region">Region</Label>
              <Select value={schoolRegion} onValueChange={setSchoolRegion}>
                <SelectTrigger id="edit-school-region">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-school-sector">Sector</Label>
              <Select 
                value={schoolSector} 
                onValueChange={setSchoolSector}
                disabled={!schoolRegion}
              >
                <SelectTrigger id="edit-school-sector">
                  <SelectValue placeholder={schoolRegion ? "Select a sector" : "Select a region first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {availableSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-school-address">Address</Label>
              <Input
                id="edit-school-address"
                placeholder="Enter school address"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-school-phone">Phone</Label>
              <Input
                id="edit-school-phone"
                placeholder="Enter school phone"
                value={schoolPhone}
                onChange={(e) => setSchoolPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-school-email">Email</Label>
              <Input
                id="edit-school-email"
                type="email"
                placeholder="Enter school email"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setCurrentSchool(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditSchool} disabled={isLoading || !schoolName.trim()}>
              {isLoading ? "Updating..." : "Update School"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete School Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete School</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this school? This action cannot be undone.</p>
            <p className="font-medium mt-2">{currentSchool?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchool} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete School"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Schools;
