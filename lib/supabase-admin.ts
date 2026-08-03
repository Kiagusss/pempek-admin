import { createClient } from '@supabase/supabase-js';

// Server-only client (service role bypasses RLS).
// Jangan diimpor dari komponen client — hanya untuk server actions.
export const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        { auth: { persistSession: false } },
      )
    : null;
