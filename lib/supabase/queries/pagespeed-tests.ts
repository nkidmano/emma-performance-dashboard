import { PageSpeedPerformanceResponse } from '@/types/pagespeed-insight'
import { PageSpeedDeviceType } from '@/types/pagespeed'
import { supabase } from '@/lib/supabase/client'

export async function createPageSpeedTest(performance: PageSpeedPerformanceResponse, deviceType: PageSpeedDeviceType) {
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