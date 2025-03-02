
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";

interface ReportFiltersProps {
  regions: any[];
  sectors: any[];
  categories: any[];
  selectedRegion: string;
  selectedSector: string;
  selectedCategory: string;
  filteredSectors: any[];
  setSelectedRegion: Dispatch<SetStateAction<string>>;
  setSelectedSector: Dispatch<SetStateAction<string>>;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
}

export const ReportFilters = ({
  regions,
  sectors,
  categories,
  selectedRegion,
  selectedSector,
  selectedCategory,
  filteredSectors,
  setSelectedRegion,
  setSelectedSector,
  setSelectedCategory,
}: ReportFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="space-y-2">
        <Label>Region</Label>
        <Select
          value={selectedRegion}
          onValueChange={setSelectedRegion}
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
          onValueChange={setSelectedSector}
          disabled={!selectedRegion}
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
        <Label>Category</Label>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          disabled={!selectedSector}
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
  );
};
