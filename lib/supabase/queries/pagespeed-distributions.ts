import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/schema'

type Client = SupabaseClient<Database>

export async function createPageSpeedDistribution(supabase: Client, distribution: any) {
  const { data, error } = await supabase
    .from('pagespeed_distributions')
    .insert(distribution)
    .select()

  return { data, error }
}