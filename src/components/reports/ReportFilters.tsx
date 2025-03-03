
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Column } from "@/lib/api/types";

export interface ReportFiltersProps {
  selectedRegion: string;
  setSelectedRegion: React.Dispatch<React.SetStateAction<string>>;
  selectedSector: string;
  setSelectedSector: React.Dispatch<React.SetStateAction<string>>;
  selectedSchool: string;
  setSelectedSchool: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  categories: any[];
  filteredSectors: any[];
  filteredSchools: any[];
  fetchRegions: () => Promise<any[]>;
  fetchSectors: (regionId?: string) => Promise<any[]>;
  fetchSchools: (sectorId?: string) => Promise<any[]>;
  fetchCategoryColumns: (categoryId: string) => Promise<void>;
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
  categories,
  filteredSectors,
  filteredSchools,
  fetchRegions,
  fetchSectors,
  fetchSchools,
  fetchCategoryColumns,
}) => {
  const [regions, setRegions] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const regionsData = await fetchRegions();
      setRegions(regionsData);
      
      if (selectedRegion) {
        const sectorsData = await fetchSectors(selectedRegion);
        setSectors(sectorsData);
      }
      
      if (selectedSector) {
        const schoolsData = await fetchSchools(selectedSector);
        setSchools(schoolsData);
      }
      
      setLoading(false);
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadSectors = async () => {
      if (selectedRegion) {
        setLoading(true);
        const sectorsData = await fetchSectors(selectedRegion);
        setSectors(sectorsData);
        setSelectedSector("");
        setSelectedSchool("");
        setLoading(false);
      } else {
        setSectors([]);
        setSelectedSector("");
        setSelectedSchool("");
      }
    };
    
    loadSectors();
  }, [selectedRegion]);

  useEffect(() => {
    const loadSchools = async () => {
      if (selectedSector) {
        setLoading(true);
        const schoolsData = await fetchSchools(selectedSector);
        setSchools(schoolsData);
        setSelectedSchool("");
        setLoading(false);
      } else {
        setSchools([]);
        setSelectedSchool("");
      }
    };
    
    loadSchools();
  }, [selectedSector]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="space-y-2">
        <Label>Region</Label>
        <Select 
          value={selectedRegion} 
          onValueChange={setSelectedRegion}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Region" />
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

      <div className="space-y-2">
        <Label>Sector</Label>
        <Select
          value={selectedSector}
          onValueChange={setSelectedSector}
          disabled={loading || sectors.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sectors</SelectItem>
            {sectors.map((sector) => (
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
          onValueChange={setSelectedSchool}
          disabled={loading || schools.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select School" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Schools</SelectItem>
            {schools.map((school) => (
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
          onValueChange={(value) => {
            setSelectedCategory(value);
            if (value) {
              fetchCategoryColumns(value);
            }
          }}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select Category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportFilters;
