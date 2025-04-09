import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/schema";

type Client = SupabaseClient<Database>;

export async function getPageSpeedSummaryTests(supabase: Client) {
  const { data, error } = await supabase
    .from("pagespeed_summary")
    .select("*")
    .order("test_date", { ascending: false });

  return { data, error };
}
