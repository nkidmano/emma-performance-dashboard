import { PagespeedPerformanceResponse } from "@/types/pagespeed-insight";
import { PagespeedDeviceType } from "@/types/pagespeed";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/schema";

type Client = SupabaseClient<Database>;

export async function createPagespeedTest(
  supabase: Client,
  performance: PagespeedPerformanceResponse,
  deviceType: PagespeedDeviceType,
) {
  const { data, error } = await supabase
    .from("PagespeedTests")
    .insert({
      url: performance.id,
      test_date: performance.analysisUTCTimestamp,
      device_type: deviceType,
      overall_category: performance.loadingExperience.overall_category,
    })
    .select();

  return { data, error };
}
