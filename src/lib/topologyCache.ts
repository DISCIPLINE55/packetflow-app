// Offline topology cache — persists the last known topology for a project.
// Web: uses localStorage. Native: uses expo-file-system cache directory.
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import type { TopologyData } from '@/types';

const CACHE_VERSION = 1;

interface CacheEntry {
  version: number;
  projectId: string;
  projectName: string;
  savedAt: string;
  topology: TopologyData;
}

function webKey(projectId: string) {
  return `pf_topology_cache_${projectId}`;
}

// ─── Web (localStorage) ───────────────────────────────────────────────────────
function webSave(projectId: string, projectName: string, topology: TopologyData): void {
  try {
    const entry: CacheEntry = {
      version: CACHE_VERSION,
      projectId,
      projectName,
      savedAt: new Date().toISOString(),
      topology,
    };
    localStorage.setItem(webKey(projectId), JSON.stringify(entry));
  } catch {
    // storage quota exceeded — ignore
  }
}

function webLoad(projectId: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(webKey(projectId));
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

// ─── Native (expo-file-system) ────────────────────────────────────────────────
async function nativeSave(
  projectId: string,
  projectName: string,
  topology: TopologyData,
): Promise<void> {
  try {
    const entry: CacheEntry = {
      version: CACHE_VERSION,
      projectId,
      projectName,
      savedAt: new Date().toISOString(),
      topology,
    };
    const file = new File(Paths.cache, `pf_cache_${projectId}.json`);
    await file.write(JSON.stringify(entry));
  } catch {
    // cache write failure — non-fatal
  }
}

async function nativeLoad(projectId: string): Promise<CacheEntry | null> {
  try {
    const file = new File(Paths.cache, `pf_cache_${projectId}.json`);
    if (!(await file.exists())) return null;
    const raw = await file.text();
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function saveTopologyCache(
  projectId: string,
  projectName: string,
  topology: TopologyData,
): Promise<void> {
  if (Platform.OS === 'web') {
    webSave(projectId, projectName, topology);
  } else {
    await nativeSave(projectId, projectName, topology);
  }
}

export async function loadTopologyCache(projectId: string): Promise<CacheEntry | null> {
  if (Platform.OS === 'web') {
    return webLoad(projectId);
  }
  return nativeLoad(projectId);
}

