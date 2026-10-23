import { isDemoMode } from "@/lib/session";
import type { DataAdapter } from "@/lib/data/adapter";
import { createDemoAdapter } from "@/lib/data/demo-adapter";
import { createSupabaseAdapter } from "@/lib/data/supabase-adapter";

let adapter: DataAdapter | null = null;

export function getData(): DataAdapter {
  if (!adapter) {
    adapter = isDemoMode() ? createDemoAdapter() : createSupabaseAdapter();
  }
  return adapter;
}

export type { DataAdapter, BookingViewer, WorkerApprovalItem } from "@/lib/data/adapter";
