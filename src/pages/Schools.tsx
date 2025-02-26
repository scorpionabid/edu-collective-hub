
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { School, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Region {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  regionId: number;
}

interface SchoolType {
  id: string;
  name: string;
}

interface NewSchool {
  name: string;
  utisCode: string;
  email: string;
  district: string;
  address: string;
  phone: string;
  type: string;
  sectorId: string;
  regionId: string;
}

const schoolTypes: SchoolType[] = [
  { id: "public", name: "Dövlət məktəbi" },
  { id: "private", name: "Özəl məktəb" },
  { id: "lyceum", name: "Lisey" },
  { id: "gymnasium", name: "Gimnaziya" },
];

const Schools = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<NewSchool[]>([]);
  const [regions] = useState<Region[]>([
    { id: 1, name: "Bakı" },
    { id: 2, name: "Sumqayıt" },
    { id: 3, name: "Gəncə" },
  ]);

  const [sectors] = useState<Sector[]>([
    { id: 1, name: "Sektor 1", regionId: 1 },
    { id: 2, name: "Sektor 2", regionId: 1 },
    { id: 3, name: "Sektor 3", regionId: 2 },
    { id: 4, name: "Sektor 4", regionId: 2 },
    { id: 5, name: "Sektor 5", regionId: 3 },
  ]);

  const [newSchool, setNewSchool] = useState<NewSchool>({
    name: "",
    utisCode: "",
    email: "",
    district: "",
    address: "",
    phone: "",
    type: "",
    sectorId: "",
    regionId: "",
  });

  const handleSectorChange = (sectorId: string) => {
    const sector = sectors.find(s => s.id === parseInt(sectorId));
    if (sector) {
      setNewSchool({
        ...newSchool,
        sectorId,
        regionId: sector.regionId.toString(),
      });
    }
  };

  const getRegionName = (regionId: string) => {
    return regions.find(r => r.id === parseInt(regionId))?.name || "";
  };

  const getSectorsBySRegion = (regionId: number) => {
    return sectors.filter(s => s.regionId === regionId);
  };

  const validateSchool = (school: NewSchool): boolean => {
    if (!school.name.trim()) {
      toast.error("Məktəbin adı daxil edilməlidir");
      return false;
    }
    if (!school.utisCode.trim()) {
      toast.error("UTIS kodu daxil edilməlidir");
      return false;
    }
    if (!school.email.trim() || !school.email.includes("@")) {
      toast.error("Düzgün email daxil edilməlidir");
      return false;
    }
    if (!school.district.trim()) {
      toast.error("Rayon daxil edilməlidir");
      return false;
    }
    if (!school.address.trim()) {
      toast.error("Ünvan daxil edilməlidir");
      return false;
    }
    if (!school.phone.trim()) {
      toast.error("Telefon nömrəsi daxil edilməlidir");
      return false;
    }
    if (!school.type) {
      toast.error("Məktəb tipi seçilməlidir");
      return false;
    }
    if (!school.sectorId) {
      toast.error("Sektor seçilməlidir");
      return false;
    }
    return true;
  };

  const handleAddSchool = () => {
    if (validateSchool(newSchool)) {
      setSchools([...schools, newSchool]);
      setNewSchool({
        name: "",
        utisCode: "",
        email: "",
        district: "",
        address: "",
        phone: "",
        type: "",
        sectorId: "",
        regionId: "",
      });
      toast.success("Məktəb uğurla əlavə edildi");
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
                <h1 className="text-xl font-semibold">Məktəblər</h1>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Məktəb əlavə et
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Yeni məktəb əlavə et</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Məktəbin adı</Label>
                      <Input
                        id="name"
                        value={newSchool.name}
                        onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                        placeholder="Məktəbin adını daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="utisCode">UTIS kodu</Label>
                      <Input
                        id="utisCode"
                        value={newSchool.utisCode}
                        onChange={(e) => setNewSchool({ ...newSchool, utisCode: e.target.value })}
                        placeholder="UTIS kodunu daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newSchool.email}
                        onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                        placeholder="Email daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={newSchool.phone}
                        onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                        placeholder="Telefon nömrəsini daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">Rayon</Label>
                      <Input
                        id="district"
                        value={newSchool.district}
                        onChange={(e) => setNewSchool({ ...newSchool, district: e.target.value })}
                        placeholder="Rayonu daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Ünvan</Label>
                      <Input
                        id="address"
                        value={newSchool.address}
                        onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                        placeholder="Ünvanı daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sektor</Label>
                      <Select
                        value={newSchool.sectorId}
                        onValueChange={handleSectorChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sektor seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id.toString()}>
                              {sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={getRegionName(newSchool.regionId)}
                        disabled
                        placeholder="Region avtomatik seçiləcək"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Məktəb tipi</Label>
                      <Select
                        value={newSchool.type}
                        onValueChange={(value) => setNewSchool({ ...newSchool, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Məktəb tipini seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {schoolTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="col-span-2" onClick={handleAddSchool}>
                      Məktəb əlavə et
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Məktəblər</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Məktəbin adı</TableHead>
                      <TableHead>UTIS kodu</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Sektor</TableHead>
                      <TableHead>Məktəb tipi</TableHead>
                      <TableHead>Əlaqə</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map((school, index) => (
                      <TableRow key={index}>
                        <TableCell>{school.name}</TableCell>
                        <TableCell>{school.utisCode}</TableCell>
                        <TableCell>{getRegionName(school.regionId)}</TableCell>
                        <TableCell>
                          {sectors.find(s => s.id === parseInt(school.sectorId))?.name}
                        </TableCell>
                        <TableCell>
                          {schoolTypes.find(t => t.id === school.type)?.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{school.email}</div>
                            <div>{school.phone}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Schools;
