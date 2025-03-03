import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Entity {
  id: string;
  name: string;
}

interface CategoryFormProps {
  onSubmit: (data: {
    name: string;
    regionId?: string;
    sectorId?: string;
    schoolId?: string;
  }) => void;
}

export const CategoryForm = ({ onSubmit }: CategoryFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [viewLevel, setViewLevel] = useState<"region" | "sector" | "school">("region");
  
  // Mock data for regions and sectors
  const [regions, setRegions] = useState<Entity[]>([
    { id: "1", name: "Bakı" },
    { id: "2", name: "Sumqayıt" },
    { id: "3", name: "Gəncə" },
  ]);

  const [sectors, setSectors] = useState<Entity[]>([
    { id: "1", name: "Sektor 1", },
    { id: "2", name: "Sektor 2", },
    { id: "3", name: "Sektor 3", },
  ]);
  
  // Filtered sectors based on selected region
  const [filteredSectors, setFilteredSectors] = useState<Entity[]>([]);
  
  // Update filtered sectors when region changes
  useEffect(() => {
    if (selectedRegion) {
      // In a real app, you would filter sectors that belong to the selected region
      // For this example, we'll just show all sectors
      setFilteredSectors(sectors);
      setSelectedSector("");
    } else {
      setFilteredSectors([]);
    }
  }, [selectedRegion, sectors]);

  const handleSubmit = () => {
    if (name.trim()) {
      const categoryData = {
        name,
        regionId: selectedRegion,
        sectorId: viewLevel === "sector" ? selectedSector : undefined,
        schoolId: viewLevel === "school" ? selectedRegion : undefined // Use regionId for school level visibility
      };
      
      onSubmit(categoryData);
      setName("");
      setSelectedRegion("");
      setSelectedSector("");
      setViewLevel("region");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Category</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="view-level">Visibility Level</Label>
          <Select
            value={viewLevel}
            onValueChange={(value: "region" | "sector" | "school") => {
              setViewLevel(value);
              setSelectedSector("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select visibility level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="region">Region Level</SelectItem>
              <SelectItem value="sector">Sector Level</SelectItem>
              <SelectItem value="school">School Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select
            value={selectedRegion}
            onValueChange={setSelectedRegion}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {viewLevel === "sector" && selectedRegion && (
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select
              value={selectedSector}
              onValueChange={setSelectedSector}
              disabled={!selectedRegion}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {filteredSectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button onClick={handleSubmit}>Add Category</Button>
      </div>
    </>
  );
};
