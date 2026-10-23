import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildSeedDb, type DemoDb } from "@/lib/demo/seed";

const DATA_DIR = process.env.DEMO_DATA_DIR
  ? path.resolve(process.env.DEMO_DATA_DIR)
  : process.env.VERCEL
    ? path.join(os.tmpdir(), "mistri-now-rewari")
    : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "demo.json");

let current: DemoDb | null = null;
let loading: Promise<DemoDb> | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function persist(db: DemoDb): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  try {
    await fs.rename(tmp, DATA_FILE);
  } catch {
    await fs.copyFile(tmp, DATA_FILE);
    await fs.unlink(tmp).catch(() => {});
  }
}

async function load(): Promise<DemoDb> {
  if (current) return current;
  if (loading) return loading;
  loading = (async () => {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw) as DemoDb;
      if (!parsed.version || !Array.isArray(parsed.profiles)) throw new Error("bad store");
      current = parsed;
      return parsed;
    } catch {
      const seeded = buildSeedDb();
      await persist(seeded);
      current = seeded;
      return seeded;
    } finally {
      loading = null;
    }
  })();
  return loading;
}

export async function readDb(): Promise<DemoDb> {
  return load();
}

/**
 * Serializes mutations and writes a full snapshot atomically. The callback
 * receives a structured clone so a thrown error can never leave a half-applied
 * state behind.
 */
export async function mutateDb<T>(fn: (db: DemoDb) => T | Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const db = await load();
    const draft = structuredClone(db);
    const result = await fn(draft);
    await persist(draft);
    current = draft;
    return result;
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

export async function resetDemoDb(): Promise<DemoDb> {
  const run = async (): Promise<DemoDb> => {
    const seeded = buildSeedDb();
    await persist(seeded);
    current = seeded;
    return seeded;
  };
  const next = queue.then(run, run);
  queue = next.catch(() => undefined);
  return next;
}

export function demoDataPath(): string {
  return DATA_FILE;
}
