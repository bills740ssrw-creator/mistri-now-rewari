export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey, configured: Boolean(url && anonKey) };
}

export function requireSupabaseConfig() {
  const { url, anonKey, configured } = supabaseConfig();
  if (!configured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or run in demo mode with NEXT_PUBLIC_DEMO_MODE=true.",
    );
  }
  return { url: url as string, anonKey: anonKey as string };
}

export const WORKER_DOCS_BUCKET = "worker-documents";
