import { supabase } from '@/client/supabase';
import type { AppNotification, NetworkEdge, NetworkNode, Profile, Project, TopologyData } from '@/types';

// ─── Projects ────────────────────────────────────────────────────────────────

export async function fetchProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? (data as Project[]) : [];
}

export async function fetchArchivedProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', true)
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? (data as Project[]) : [];
}

export async function fetchProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Project | null;
}

// Alias used by canvas screen
export const fetchProjectById = fetchProject;

export async function updateTopology(
  id: string,
  topology: { nodes: NetworkNode[]; edges: NetworkEdge[] }
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      topology_data: topology,
      device_count: topology.nodes.length,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createProject(name: string, description = ''): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function updateProjectTopology(id: string, topology: TopologyData): Promise<void> {
  const deviceCount = topology.nodes.length;
  const { error } = await supabase
    .from('projects')
    .update({ topology_data: topology, device_count: deviceCount })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateProjectMeta(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'is_favorite' | 'is_archived'>>
): Promise<void> {
  const { error } = await supabase.from('projects').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function duplicateProject(project: Project): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: `${project.name} (Copy)`,
      description: project.description,
      topology_data: project.topology_data,
      device_count: project.device_count,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'bio'>>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? (data as AppNotification[]) : [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw new Error(error.message);
}
