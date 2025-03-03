
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "@/lib/api/types";

interface SchoolFormProps {
  school?: School;
  onSubmit: (data: Omit<School, 'id'>) => void;
  sectors: any[];
  regions: any[];
}

export const SchoolForm = ({ school, onSubmit, sectors, regions }: SchoolFormProps) => {
  const [name, setName] = useState(school?.name || "");
  const [sectorId, setSectorId] = useState(school?.sector_id || "");
  const [address, setAddress] = useState(school?.address || "");
  const [email, setEmail] = useState(school?.email || "");
  const [phone, setPhone] = useState(school?.phone || "");
  const [regionId, setRegionId] = useState("");
  const [filteredSectors, setFilteredSectors] = useState(sectors);

  // Set initial region based on sector
  useEffect(() => {
    if (school?.sector_id) {
      const sector = sectors.find(s => s.id === school.sector_id);
      if (sector && sector.region_id) {
        setRegionId(sector.region_id);
      }
    }
  }, [school, sectors]);

  // Filter sectors based on selected region
  useEffect(() => {
    if (regionId) {
      setFilteredSectors(sectors.filter(sector => sector.region_id === regionId));
      if (!filteredSectors.find(s => s.id === sectorId)) {
        setSectorId("");
      }
    } else {
      setFilteredSectors(sectors);
    }
  }, [regionId, sectors, sectorId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      sector_id: sectorId,
      address,
      email,
      phone
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Məktəb adı</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Məktəb adını daxil edin"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Select
          value={regionId}
          onValueChange={(value) => {
            setRegionId(value);
            setSectorId("");  // Reset sector when region changes
          }}
        >
          <SelectTrigger id="region">
            <SelectValue placeholder="Region seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Region seçin</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector">Sektor</Label>
        <Select
          value={sectorId}
          onValueChange={setSectorId}
          disabled={!regionId} // Disable if no region is selected
        >
          <SelectTrigger id="sector">
            <SelectValue placeholder="Sektor seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sektor seçin</SelectItem>
            {filteredSectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Ünvan</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ünvanı daxil edin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email ünvanını daxil edin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon nömrəsini daxil edin"
        />
      </div>

      <Button type="submit">
        {school ? "Yenilə" : "Yarat"}
      </Button>
    </form>
  );
};
