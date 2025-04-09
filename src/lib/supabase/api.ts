import { Database } from "@/lib/supabase/schema";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createApiClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};
