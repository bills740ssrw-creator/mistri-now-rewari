#!/usr/bin/env node
/**
 * Print the full database schema (all migrations, in order) to stdout.
 *
 * Usage:
 *   pnpm db:print                # print to the terminal
 *   pnpm db:print -- --out db.sql  # write a single file
 *
 * Paste the output into the Supabase SQL editor on a fresh project, or commit
 * it as a snapshot. Migrations are idempotent (create ... if not exists /
 * create or replace), so re-running is safe.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const MIGRATIONS_DIR = resolve(process.cwd(), "supabase", "migrations");

const args = process.argv.slice(2);
const outIndex = args.findIndex((arg) => arg === "--out" || arg === "-o");
const outFile = outIndex !== -1 ? args[outIndex + 1] : undefined;

if (outIndex !== -1 && !outFile) {
  console.error("Usage: pnpm db:print [-- --out path/to/schema.sql]");
  process.exit(1);
}

const files = readdirSync(MIGRATIONS_DIR)
  .filter((file) => file.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

if (files.length === 0) {
  console.error(`No .sql migrations found in ${MIGRATIONS_DIR}`);
  process.exit(1);
}

const parts = [
  "-- ===========================================================================",
  "-- Mistri Now Rewari - complete database schema",
  `-- Generated ${new Date().toISOString()} from ${files.length} migrations.`,
  "-- Run on a fresh Supabase project via the SQL editor.",
  "-- ===========================================================================",
  "",
];

for (const file of files) {
  parts.push(
    "",
    `-- ---------------------------------------------------------------------------`,
    `-- ${file}`,
    `-- ---------------------------------------------------------------------------`,
    readFileSync(resolve(MIGRATIONS_DIR, file), "utf8").trimEnd(),
    "",
  );
}

const output = parts.join("\n");

if (outFile) {
  const target = resolve(process.cwd(), outFile);
  writeFileSync(target, output, "utf8");
  console.log(`Wrote ${files.length} migrations (${output.length.toLocaleString()} chars) to ${target}`);
} else {
  process.stdout.write(output);
}
