// Offline queue for canvas saves using expo-sqlite
// Failed saves are queued locally and auto-synced when connectivity is restored.

import * as SQLite from 'expo-sqlite';
import * as Network from 'expo-network';
import { updateTopology } from './api';

const DB_NAME = 'packetflow_offline.db';

export interface QueueEntry {
  id: number;
  projectId: string;
  payload: string;  // JSON string of { nodes, edges }
  queuedAt: string;
}

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_queue (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      payload    TEXT NOT NULL,
      queued_at  TEXT NOT NULL
    );
  `);
  return db;
}

/** Add a topology save to the offline queue */
export async function enqueueOfflineSave(
  projectId: string,
  topology: { nodes: unknown[]; edges: unknown[] },
): Promise<void> {
  const database = await getDb();
  // Upsert — keep only the latest snapshot per project (no point syncing stale intermediate states)
  await database.runAsync(
    `INSERT INTO offline_queue (project_id, payload, queued_at) VALUES (?, ?, ?)`,
    projectId,
    JSON.stringify(topology),
    new Date().toISOString(),
  );
}

/** Get all pending queue entries */
export async function getPendingQueue(): Promise<QueueEntry[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{
    id: number;
    project_id: string;
    payload: string;
    queued_at: string;
  }>(`SELECT * FROM offline_queue ORDER BY queued_at ASC`);
  return rows.map((r) => ({
    id: r.id,
    projectId: r.project_id,
    payload: r.payload,
    queuedAt: r.queued_at,
  }));
}

/** Remove a queue entry after successful sync */
export async function dequeueEntry(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM offline_queue WHERE id = ?`, id);
}

/** Count pending items */
export async function getPendingCount(): Promise<number> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM offline_queue`,
  );
  return row?.count ?? 0;
}

/** Check if device is connected to the internet */
export async function isOnline(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();
  return state.isConnected === true && state.isInternetReachable === true;
}

/** Flush all pending entries — call when connectivity is restored */
export async function flushOfflineQueue(
  onProgress?: (synced: number, total: number) => void,
): Promise<{ synced: number; failed: number }> {
  const entries = await getPendingQueue();
  if (entries.length === 0) return { synced: 0, failed: 0 };

  // Deduplicate: keep only the latest entry per project
  const latestByProject = new Map<string, QueueEntry>();
  for (const e of entries) {
    latestByProject.set(e.projectId, e);
  }
  const toSync = [...latestByProject.values()];
  const stale = entries.filter((e) => !toSync.includes(e));

  // Remove stale duplicates immediately
  for (const e of stale) {
    await dequeueEntry(e.id);
  }

  let synced = 0;
  let failed = 0;

  for (const entry of toSync) {
    try {
      const topology = JSON.parse(entry.payload);
      await updateTopology(entry.projectId, topology);
      await dequeueEntry(entry.id);
      synced++;
      onProgress?.(synced, toSync.length);
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
