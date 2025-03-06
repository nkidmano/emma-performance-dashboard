import { PageSpeedPerformanceResponse } from '@/types/pagespeed-insight'
import { PageSpeedDeviceType } from '@/types/pagespeed'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/schema'

type Client = SupabaseClient<Database>

export async function createPageSpeedTest(supabase: Client, performance: PageSpeedPerformanceResponse, deviceType: PageSpeedDeviceType) {
  const { data, error } = await supabase
    .from('pagespeed_tests')
    .insert({
      url: performance.id,
      test_date: performance.analysisUTCTimestamp,
      device_type: deviceType,
      overall_category: performance.loadingExperience.overall_category,
    })
    .select()


  return { data, error }
}