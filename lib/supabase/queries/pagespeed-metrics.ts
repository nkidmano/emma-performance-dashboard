import { supabase } from '@/lib/supabase/client'

export async function createPageSpeedMetrics(metrics: any) {
  const { data, error } = await supabase
    .from('pagespeed_metrics')
    .insert(metrics)
    .select();

  return { data, error }
}

