// Firebase Firestore API — mirrors src/db/api.ts structure
// Collection layout:
//   projects/{projectId}  → Project
//   profiles/{userId}     → Profile
//   notifications/{id}    → AppNotification
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestore } from '@/client/firebase';
import type { Profile, Project, TopologyData } from '@/types';

// ─── helpers ──────────────────────────────────────────────────────────────────
function tsToIso(ts: unknown): string {
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

function docToProject(id: string, d: Record<string, unknown>): Project {
  return {
    id,
    user_id:       d.user_id as string,
    name:          d.name as string,
    description:   (d.description as string) ?? '',
    topology_data: (d.topology_data as TopologyData) ?? { nodes: [], edges: [] },
    device_count:  (d.device_count as number) ?? 0,
    is_favorite:   (d.is_favorite as boolean) ?? false,
    is_archived:   (d.is_archived as boolean) ?? false,
    thumbnail_url: (d.thumbnail_url as string) ?? undefined,
    created_at:    tsToIso(d.created_at),
    updated_at:    tsToIso(d.updated_at),
  };
}

// ─── Projects ────────────────────────────────────────────────────────────────
export async function fbFetchProjects(userId: string): Promise<Project[]> {
  const q = query(
    collection(firestore, 'projects'),
    where('user_id', '==', userId),
    where('is_archived', '==', false),
    orderBy('updated_at', 'desc'),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToProject(d.id, d.data() as Record<string, unknown>));
}

export async function fbFetchArchivedProjects(userId: string): Promise<Project[]> {
  const q = query(
    collection(firestore, 'projects'),
    where('user_id', '==', userId),
    where('is_archived', '==', true),
    orderBy('updated_at', 'desc'),
    limit(100),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToProject(d.id, d.data() as Record<string, unknown>));
}

export async function fbFetchProjectById(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(firestore, 'projects', id));
  if (!snap.exists()) return null;
  return docToProject(snap.id, snap.data() as Record<string, unknown>);
}

export async function fbCreateProject(
  userId: string,
  name: string,
  description = '',
): Promise<Project> {
  const ref = doc(collection(firestore, 'projects'));
  const now = serverTimestamp();
  const data = {
    user_id: userId,
    name,
    description,
    is_archived: false,
    device_count: 0,
    is_favorite: false,
    topology_data: { nodes: [], edges: [] },
    thumbnail_url: null,
    created_at: now,
    updated_at: now,
  };
  await setDoc(ref, data);
  const snap = await getDoc(ref);
  return docToProject(snap.id, snap.data() as Record<string, unknown>);
}

export async function fbUpdateTopology(
  projectId: string,
  topology: TopologyData,
): Promise<void> {
  await updateDoc(doc(firestore, 'projects', projectId), {
    topology_data: topology,
    updated_at: serverTimestamp(),
  });
}

export async function fbDeleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(firestore, 'projects', projectId));
}

export async function fbArchiveProject(projectId: string): Promise<void> {
  await updateDoc(doc(firestore, 'projects', projectId), {
    is_archived: true,
    updated_at: serverTimestamp(),
  });
}

export async function fbRenameProject(projectId: string, name: string): Promise<void> {
  await updateDoc(doc(firestore, 'projects', projectId), {
    name,
    updated_at: serverTimestamp(),
  });
}

// ─── Profile ─────────────────────────────────────────────────────────────────
export async function fbFetchProfile(userId: string): Promise<Profile | null> {
  const snap = await getDoc(doc(firestore, 'profiles', userId));
  if (!snap.exists()) return null;
  const d = snap.data() as Record<string, unknown>;
  return {
    id: userId,
    full_name:         (d.full_name as string) ?? '',
    email:             (d.email as string) ?? '',
    avatar_url:        (d.avatar_url as string) ?? undefined,
    bio:               (d.bio as string) ?? '',
    subscription_tier: (d.subscription_tier as Profile['subscription_tier']) ?? 'free',
    total_projects:    (d.total_projects as number) ?? 0,
    total_devices:     (d.total_devices as number) ?? 0,
    created_at:        tsToIso(d.created_at),
    updated_at:        tsToIso(d.updated_at),
  } as Profile;
}

export async function fbUpdateProfile(
  userId: string,
  updates: Partial<Profile>,
): Promise<Profile> {
  const ref = doc(firestore, 'profiles', userId);
  await setDoc(ref, { ...updates, updated_at: serverTimestamp() }, { merge: true });
  const refreshed = await fbFetchProfile(userId);
  return refreshed ?? ({ ...updates, id: userId } as Profile);
}
