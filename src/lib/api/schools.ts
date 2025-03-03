
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { School } from "./types";

export const schools = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*, sectors(name), sectors:sectors(regions:regions(name))')
        .order('name');
      
      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }
      
      return data?.map(school => ({
        id: school.id,
        name: school.name,
        address: school.address,
        email: school.email,
        phone: school.phone,
        sectorId: school.sector_id,
        createdAt: school.created_at,
        sectorName: school.sectors?.name,
        regionName: school.sectors?.regions?.name
      })) || [];
    } catch (error) {
      console.error('Error in getAll schools:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*, sectors(name), sectors:sectors(regions:regions(name))')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching school:', error);
        throw error;
      }
      
      return data ? {
        id: data.id,
        name: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        sectorId: data.sector_id,
        createdAt: data.created_at,
        sectorName: data.sectors?.name,
        regionName: data.sectors?.regions?.name
      } : null;
    } catch (error) {
      console.error('Error in getById school:', error);
      return null;
    }
  },
  
  getBySector: async (sectorId: string) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*, sectors(name), sectors:sectors(regions:regions(name))')
        .eq('sector_id', sectorId)
        .order('name');
      
      if (error) {
        console.error('Error fetching schools by sector:', error);
        throw error;
      }
      
      return data?.map(school => ({
        id: school.id,
        name: school.name,
        address: school.address,
        email: school.email,
        phone: school.phone,
        sectorId: school.sector_id,
        createdAt: school.created_at,
        sectorName: school.sectors?.name,
        regionName: school.sectors?.regions?.name
      })) || [];
    } catch (error) {
      console.error('Error in getBySector schools:', error);
      return [];
    }
  },
  
  create: async (schoolData: Omit<School, 'id'>) => {
    try {
      const dbSchoolData = {
        name: schoolData.name,
        sector_id: schoolData.sectorId,
        address: schoolData.address,
        email: schoolData.email,
        phone: schoolData.phone
      };
      
      const { data, error } = await supabase
        .from('schools')
        .insert(dbSchoolData)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('School created successfully');
      return {
        id: data.id,
        name: data.name,
        sectorId: data.sector_id,
        address: data.address,
        email: data.email,
        phone: data.phone,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error in create school:', error);
      toast.error('Failed to create school');
      return { 
        id: "0", 
        name: schoolData.name,
        sectorId: schoolData.sectorId,
        address: schoolData.address,
        email: schoolData.email,
        phone: schoolData.phone
      };
    }
  },
  
  update: async (id: string, schoolData: Partial<School>) => {
    try {
      const dbSchoolData = {
        name: schoolData.name,
        sector_id: schoolData.sectorId,
        address: schoolData.address,
        email: schoolData.email,
        phone: schoolData.phone
      };
      
      // Remove undefined fields
      Object.keys(dbSchoolData).forEach(key => 
        dbSchoolData[key] === undefined && delete dbSchoolData[key]
      );
      
      const { data, error } = await supabase
        .from('schools')
        .update(dbSchoolData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('School updated successfully');
      return {
        id: data.id,
        name: data.name,
        sectorId: data.sector_id,
        address: data.address,
        email: data.email,
        phone: data.phone,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error in update school:', error);
      toast.error('Failed to update school');
      return { 
        id, 
        name: schoolData.name || "Unknown",
        sectorId: schoolData.sectorId || "",
        address: schoolData.address || "",
        email: schoolData.email || "",
        phone: schoolData.phone || ""
      };
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('School deleted successfully');
    } catch (error) {
      console.error('Error in delete school:', error);
      toast.error('Failed to delete school');
    }
  }
};
