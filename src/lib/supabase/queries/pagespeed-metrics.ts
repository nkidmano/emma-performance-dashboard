import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/schema";

type Client = SupabaseClient<Database>;

export async function createPageSpeedMetrics(supabase: Client, metrics: any) {
  const { data, error } = await supabase
    .from("PagespeedMetric")
    .insert(metrics)
    .select();

  return { data, error };
}
