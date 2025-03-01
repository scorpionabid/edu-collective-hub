
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get URL params
    const url = new URL(req.url);
    const schoolId = url.searchParams.get('schoolId');
    const sectorId = url.searchParams.get('sectorId');
    const regionId = url.searchParams.get('regionId');

    console.log("Request received with params:", { schoolId, sectorId, regionId });

    // Build query based on parameters
    let query = supabase
      .from('form_data')
      .select(`
        id,
        status,
        category_id,
        school_id,
        categories:category_id(name),
        schools:school_id(name, sector_id),
        sectors:schools(sectors:sector_id(name, region_id)),
        submitted_at,
        approved_at
      `);

    if (schoolId) {
      query = query.eq('school_id', schoolId);
    } else if (sectorId) {
      // For sector admin, we need to get all schools in the sector
      const { data: schools } = await supabase
        .from('schools')
        .select('id')
        .eq('sector_id', sectorId);
      
      if (schools && schools.length > 0) {
        const schoolIds = schools.map(school => school.id);
        query = query.in('school_id', schoolIds);
      }
    } else if (regionId) {
      // For region admin, we need to get all sectors in the region, then all schools in those sectors
      const { data: sectors } = await supabase
        .from('sectors')
        .select('id')
        .eq('region_id', regionId);
      
      if (sectors && sectors.length > 0) {
        const sectorIds = sectors.map(sector => sector.id);
        const { data: schools } = await supabase
          .from('schools')
          .select('id')
          .in('sector_id', sectorIds);
        
        if (schools && schools.length > 0) {
          const schoolIds = schools.map(school => school.id);
          query = query.in('school_id', schoolIds);
        }
      }
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error("Database query error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Process the data to create statistics
    const stats = {
      total: data.length,
      byStatus: {
        draft: data.filter(item => item.status === 'draft').length,
        submitted: data.filter(item => item.status === 'submitted').length,
        approved: data.filter(item => item.status === 'approved').length,
        rejected: data.filter(item => item.status === 'rejected').length,
      },
      byCategory: {} as Record<string, number>,
      recentActivity: data
        .filter(item => item.submitted_at || item.approved_at)
        .sort((a, b) => {
          const dateA = new Date(a.submitted_at || a.approved_at);
          const dateB = new Date(b.submitted_at || b.approved_at);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          status: item.status,
          categoryName: item.categories?.name,
          schoolName: item.schools?.name,
          sectorName: item.schools?.sectors?.sectors?.name,
          date: item.approved_at || item.submitted_at,
          action: item.approved_at ? 'approved' : 'submitted'
        }))
    };

    // Count by category
    data.forEach(item => {
      const categoryName = item.categories?.name || 'Unknown';
      if (!stats.byCategory[categoryName]) {
        stats.byCategory[categoryName] = 0;
      }
      stats.byCategory[categoryName] += 1;
    });

    return new Response(
      JSON.stringify(stats),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
