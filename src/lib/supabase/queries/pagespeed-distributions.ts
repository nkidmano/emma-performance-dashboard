import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/schema";

type Client = SupabaseClient<Database>;

export async function createPagespeedDistribution(
  supabase: Client,
  distribution: any,
) {
  const { data, error } = await supabase
    .from("PagespeedDistribution")
    .insert(distribution)
    .select();

  return { data, error };
}
