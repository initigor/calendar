import { createBrowserClient } from "@supabase/ssr";

// Not parameterized with a generated Database type: our hand-written types in
// lib/types.ts don't include relationship metadata, which makes Supabase's
// embedded-select typing (e.g. `environments(...)`) collapse to `never`.
// Call sites cast results to the domain interfaces instead.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
