import { createClient } from "@supabase/supabase-js";
/**
 * @typedef {import('../database').Database} Database
 */

/**
 * @type {import('@supabase/supabase-js').SupabaseClient<Database>}
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
