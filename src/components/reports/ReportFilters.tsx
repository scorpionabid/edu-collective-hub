
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/lib/api/types';

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
  categories: Category[];
  fetchCategoryColumns: (categoryId: string) => void;
  updateFilteredSectors: (region: string) => void;
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
  fetchCategoryColumns,
  updateFilteredSectors
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select 
            value={selectedRegion} 
            onValueChange={(value) => {
              setSelectedRegion(value);
              updateFilteredSectors(value);
              setSelectedSector('');
              setSelectedSchool('');
            }}
          >
            <SelectTrigger id="region">
              <SelectValue placeholder="Select region" />
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
          <Label htmlFor="sector">Sector</Label>
          <Select 
            value={selectedSector} 
            onValueChange={(value) => {
              setSelectedSector(value);
              setSelectedSchool('');
            }}
            disabled={!selectedRegion}
          >
            <SelectTrigger id="sector">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sectors</SelectItem>
              {filteredSectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="school">School</Label>
          <Select 
            value={selectedSchool} 
            onValueChange={setSelectedSchool}
            disabled={!selectedSector}
          >
            <SelectTrigger id="school">
              <SelectValue placeholder="Select school" />
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
          <Label htmlFor="category">Category</Label>
          <Select 
            value={selectedCategory} 
            onValueChange={(value) => {
              setSelectedCategory(value);
              if (value) fetchCategoryColumns(value);
            }}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
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
    </div>
  );
};
