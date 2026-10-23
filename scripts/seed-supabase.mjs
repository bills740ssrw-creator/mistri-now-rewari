#!/usr/bin/env node
/**
 * Seed a Supabase project with the catalogue and the admin account.
 *
 * Usage:
 *   pnpm seed:supabase
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (or the shell). The service role key bypasses RLS — run this from a trusted
 * machine only, and never expose the key to the browser.
 *
 * Optional:
 *   ADMIN_EMAIL     (default admin@mistrinow.in)
 *   ADMIN_PASSWORD  (default Admin@123 — change it after first sign-in)
 *   ADMIN_NAME      (default "Lakshya Yadav")
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();

function loadEnvFile(file) {
  const path = resolve(ROOT, file);
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\nMissing Supabase credentials.\n" +
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then re-run `pnpm seed:supabase`.\n",
  );
  process.exit(1);
}

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@mistrinow.in";
const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123";
const adminName = process.env.ADMIN_NAME ?? "Lakshya Yadav";

const SERVICES = [
  {
    title: "Plumber",
    price: 350,
    description: "Tap, leak, fitting and blockage fixes by a verified plumber.",
    category: "plumbing",
    badge: null,
    icon: "wrench",
    duration_mins: 60,
  },
  {
    title: "Electrician",
    price: 199,
    description: "Switch, socket, fan, MCB and wiring repairs. Parts extra.",
    category: "electrical",
    badge: "Same-day",
    icon: "zap",
    duration_mins: 45,
  },
  {
    title: "RO Service",
    price: 299,
    description: "Full RO service - TDS check, filter cleaning and sanitisation.",
    category: "cooling",
    badge: null,
    icon: "droplets",
    duration_mins: 60,
  },
  {
    title: "Washing Machine",
    price: 300,
    description: "Top-load and front-load repair, installation and demo.",
    category: "appliance",
    badge: null,
    icon: "washing-machine",
    duration_mins: 60,
  },
  {
    title: "Welding",
    price: 300,
    description: "Grill, gate, railing and on-site fabrication work.",
    category: "fabrication",
    badge: null,
    icon: "flame",
    duration_mins: 90,
  },
  {
    title: "RO Filter",
    price: 350,
    description: "Genuine filter replacement with a 7-day fitment warranty.",
    category: "cooling",
    badge: null,
    icon: "filter",
    duration_mins: 45,
  },
  {
    title: "AC Service",
    price: 499,
    description: "Deep clean, gas pressure check and cooling performance tune-up.",
    category: "cooling",
    badge: "Bestseller",
    icon: "snowflake",
    duration_mins: 75,
  },
  {
    title: "AC Gas Filling",
    price: 3399,
    description: "Complete gas top-up with leak test and 30-day performance warranty.",
    category: "cooling",
    badge: "Most Popular",
    icon: "wind",
    duration_mins: 120,
  },
];

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function fail(step, error) {
  console.error(`\n[seed] ${step} failed: ${error.message ?? error}`);
  process.exit(1);
}

async function ensureAdmin() {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) fail("listing auth users", listError);

  let user = list.users.find((candidate) => candidate.email === adminEmail);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName, role: "admin" },
    });
    if (error) fail("creating admin auth user", error);
    user = data.user;
    console.log(`[seed] created auth user ${adminEmail}`);
  } else {
    console.log(`[seed] admin auth user already exists (${adminEmail})`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: adminEmail,
      full_name: adminName,
      role: "admin",
      status: "ACTIVE",
      terms_accepted_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (profileError) fail("upserting admin profile", profileError);
  console.log("[seed] admin profile ready");
}

async function ensureServices() {
  let created = 0;
  let updated = 0;

  for (const service of SERVICES) {
    const { data: existing, error: findError } = await supabase
      .from("services")
      .select("id")
      .ilike("title", service.title)
      .maybeSingle();
    if (findError) fail(`looking up service "${service.title}"`, findError);

    if (existing) {
      const { error } = await supabase
        .from("services")
        .update({ ...service, is_active: true })
        .eq("id", existing.id);
      if (error) fail(`updating service "${service.title}"`, error);
      updated += 1;
    } else {
      const { error } = await supabase.from("services").insert({ ...service, is_active: true });
      if (error) fail(`inserting service "${service.title}"`, error);
      created += 1;
    }
  }

  console.log(`[seed] services: ${created} created, ${updated} refreshed`);
}

console.log(`[seed] target ${url}`);
await ensureAdmin();
await ensureServices();

console.log("\n[seed] done.");
if (!process.env.ADMIN_PASSWORD) {
  console.log(
    `[seed] The admin password is the default "Admin@123". Sign in at /auth and change it immediately in Supabase Auth.`,
  );
}
console.log("[seed] Catalogue prices are placeholders — edit them in Admin → Services.\n");
