
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ReportFiltersProps {
  selectedRegion: string;
  setSelectedRegion: (value: string) => void;
  selectedSector: string;
  setSelectedSector: (value: string) => void;
  selectedSchool: string;
  setSelectedSchool: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  regions: { id: string; name: string }[];
  filteredSectors: { id: string; name: string }[];
  filteredSchools: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  loading: boolean;
  updateFilteredSectors: (region: string) => void;
  updateFilteredSchools: (sector: string) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedRegion,
  setSelectedRegion,
  selectedSector,
  setSelectedSector,
  selectedSchool,
  setSelectedSchool,
  selectedCategory,
  setSelectedCategory,
  regions,
  filteredSectors,
  filteredSchools,
  categories,
  loading,
  updateFilteredSectors,
  updateFilteredSchools,
}) => {
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedSector("");
    setSelectedSchool("");
    setSelectedCategory("");
    updateFilteredSectors(value);
  };

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    setSelectedSchool("");
    setSelectedCategory("");
    updateFilteredSchools(value);
  };

  const handleSchoolChange = (value: string) => {
    setSelectedSchool(value);
    setSelectedCategory("");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Region</Label>
            <Select
              value={selectedRegion}
              onValueChange={handleRegionChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
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

          <div className="space-y-2">
            <Label>Sector</Label>
            <Select
              value={selectedSector}
              onValueChange={handleSectorChange}
              disabled={!selectedRegion || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Sector" />
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

          <div className="space-y-2">
            <Label>School</Label>
            <Select
              value={selectedSchool}
              onValueChange={handleSchoolChange}
              disabled={!selectedSector || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Schools</SelectItem>
                {filteredSchools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={!selectedSector || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
