
import { supabase } from "@/integrations/supabase/client";

export const realtime = {
  subscribeToFormData: (schoolId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`form_data:school_id=eq.${schoolId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'form_data',
        filter: `school_id=eq.${schoolId}`
      }, payload => {
        callback(payload);
      })
      .subscribe();
  },
  
  unsubscribe: (channel: any) => {
    if (channel && channel.unsubscribe) {
      channel.unsubscribe();
    }
  }
};
