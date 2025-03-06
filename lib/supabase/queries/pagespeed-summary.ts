import { supabase } from '@/lib/supabase/client'

export async function getPageSpeedSummaryTests() {
  const { data, error } = await supabase
    .from('pagespeed_summary')
    .select('*')
    .order('test_date', { ascending: false });

  return { data, error }
}
