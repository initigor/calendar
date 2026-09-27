import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key — bypasses RLS entirely.
// NEVER import this from a Client Component or expose SUPABASE_SERVICE_ROLE_KEY
// with a NEXT_PUBLIC_ prefix. Used only to auto-confirm the synthetic-email
// accounts created for username/password auth (see lib/auth-username.ts).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
