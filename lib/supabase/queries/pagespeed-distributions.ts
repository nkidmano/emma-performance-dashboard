import { supabase } from '@/lib/supabase/client'

export async function createPageSpeedDistribution(distribution: any) {
  const { data, error } = await supabase
    .from('pagespeed_distributions')
    .insert(distribution)
    .select()

  return { data, error }
}