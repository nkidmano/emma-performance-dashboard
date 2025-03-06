import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase/schema'
import { cookies } from 'next/headers'

export const createApiClient = () => {
  return createRouteHandlerClient<Database>({ cookies });
}

// Helper for checking authentication
export const requireAuth = async () => {
  const supabase = createApiClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
};