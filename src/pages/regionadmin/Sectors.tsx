
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { api } from "@/lib/api";
import { Sector } from "@/lib/api/types";
import { BuildingIcon, Plus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Sektor adı ən azı 2 simvol olmalıdır.",
  }),
});

const Sectors = () => {
  const { profile } = useProfile();
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      if (profile?.regionId) {
        const sectorsData = await api.sectors.getByRegion(profile.regionId);
        setSectors(sectorsData);
      }
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Sektorların siyahısını əldə etmək mümkün olmadı.");
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (profile?.regionId) {
        await api.sectors.create({
          name: values.name,
          region_id: profile.regionId,
        });
        form.reset();
        toast.success("Sektor uğurla yaradıldı");
        fetchSectors();
      } else {
        toast.error("Region ID tapılmadı");
      }
    } catch (error) {
      console.error("Error creating sector:", error);
      toast.error("Sektoru yaratmaq mümkün olmadı");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sektorlar</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Sektor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Sektor Yaradın</DialogTitle>
              <DialogDescription>
                Sektorun məlumatlarını daxil edin
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sektor adı</FormLabel>
                      <FormControl>
                        <Input placeholder="Sektor adını daxil edin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="default">
                  Yaradın
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Bütün Sektorlar</TabsTrigger>
          <TabsTrigger value="active">Aktiv Sektorlar</TabsTrigger>
          <TabsTrigger value="inactive">Deaktiv Sektorlar</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((sector) => (
              <Card key={sector.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    {sector.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <BuildingIcon className="mr-2 h-4 w-4" />
                    <span>
                      {sectors.filter((s) => s.id === sector.id).length} məktəb
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      Məktəblər
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors
              .filter((sector) => true) // Filter condition for active sectors
              .map((sector) => (
                <Card key={sector.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">
                      {sector.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <BuildingIcon className="mr-2 h-4 w-4" />
                      <span>
                        {sectors.filter((s) => s.id === sector.id).length} məktəb
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Məktəblər
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="inactive">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors
              .filter((sector) => false) // Filter condition for inactive sectors
              .map((sector) => (
                <Card key={sector.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">
                      {sector.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <BuildingIcon className="mr-2 h-4 w-4" />
                      <span>
                        {sectors.filter((s) => s.id === sector.id).length} məktəb
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm">
                        Məktəblər
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sectors;
