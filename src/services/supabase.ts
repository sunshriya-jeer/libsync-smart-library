import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables.');
}

function normalizeSupabaseUrl(url: string): string {
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.includes('/rest/v1')) {
      return parsed.origin;
    }
    return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
}

export const supabase = createClient(
  normalizeSupabaseUrl(supabaseUrl),
  supabasePublishableKey
);