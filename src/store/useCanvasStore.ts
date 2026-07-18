import { create } from 'zustand';
import type { TopologyTemplate } from '@/lib/constants';
import {
  DEFAULT_ZOOM,
  DEVICE_CATALOG,
  GRID_SIZE,
  generateEdgeId,
  generateMac,
  generateNodeId,
  TOPOLOGY_TEMPLATES,
  UNDO_STACK_SIZE,
} from '@/lib/constants';
import type { CableType, CanvasState, DeviceType, NetworkEdge, NetworkNode } from '@/types';

type HistorySnapshot = { nodes: NetworkNode[]; edges: NetworkEdge[] };

export type PacketType = 'icmp' | 'tcp' | 'udp';

interface CanvasStore extends CanvasState {
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  activeProjectId: string | null;
  isDirty: boolean;
  customTemplates: TopologyTemplate[];
  // Packet simulation
  simulationMode: boolean;
  packetType: PacketType;
  setSimulationMode: (v: boolean) => void;
  setPacketType: (t: PacketType) => void;

  // Init
  loadTopology: (projectId: string, nodes: NetworkNode[], edges: NetworkEdge[]) => void;
  // Nodes
  addNode: (type: DeviceType, x: number, y: number) => NetworkNode;
  updateNode: (id: string, updates: Partial<NetworkNode>) => void;
  moveNode: (id: string, x: number, y: number) => void;
  removeNode: (id: string) => void;
  // Edges
  addEdge: (sourceId: string, targetId: string, cableType: CableType) => NetworkEdge;
  updateEdge: (id: string, updates: Partial<NetworkEdge>) => void;
  removeEdge: (id: string) => void;
  // Selection
  selectNode: (id: string, multi?: boolean) => void;
  selectEdge: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  // Viewport
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  fitToScreen: (width: number, height: number) => void;
  // Tools
  setConnecting: (active: boolean, fromNodeId?: string | null) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  // History
  undo: () => void;
  redo: () => void;
  // Dirty
  clearDirty: () => void;
  // Templates
  loadTemplate: (templateId: string, cx: number, cy: number) => void;
  saveCanvasAsTemplate: (name: string, description?: string) => void;
  deleteCustomTemplate: (id: string) => void;
}

function snapToGrid(val: number): number {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  selectedEdgeIds: [],
  zoom: DEFAULT_ZOOM,
  panX: 0,
  panY: 0,
  showGrid: true,
  snapToGrid: true,
  isConnecting: false,
  connectingFromNodeId: null,
  undoStack: [],
  redoStack: [],
  activeProjectId: null,
  isDirty: false,
  customTemplates: [],
  simulationMode: false,
  packetType: 'icmp',
  setSimulationMode: (simulationMode) => set({ simulationMode }),
  setPacketType: (packetType) => set({ packetType }),

  loadTopology: (projectId, nodes, edges) =>
    set({ nodes, edges, activeProjectId: projectId, undoStack: [], redoStack: [], isDirty: false }),

  _saveHistory: () => {
    const { nodes, edges, undoStack } = get();
    const snapshot: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    const newStack = [...undoStack, snapshot].slice(-UNDO_STACK_SIZE);
    set({ undoStack: newStack, redoStack: [] });
  },

  addNode: (type, rawX, rawY) => {
    const { snapToGrid: snap } = get();
    const x = snap ? snapToGrid(rawX) : rawX;
    const y = snap ? snapToGrid(rawY) : rawY;
    const catalog = DEVICE_CATALOG.find((d) => d.type === type);
    const interfaces = (catalog?.defaultInterfaces ?? []).map((iface, i) => ({
      ...iface,
      id: `iface_${i}_${Date.now()}`,
    }));
    const node: NetworkNode = {
      id: generateNodeId(),
      type,
      label: catalog?.label ?? type,
      x,
      y,
      hostname: catalog?.label ?? type,
      ip_address: '',
      subnet_mask: '255.255.255.0',
      gateway: '',
      mac_address: generateMac(),
      dns: '',
      description: '',
      interfaces,
    };
    (get() as any)._saveHistory();
    set((s) => ({ nodes: [...s.nodes, node], isDirty: true }));
    return node;
  },

  updateNode: (id, updates) => {
    (get() as any)._saveHistory();
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      isDirty: true,
    }));
  },

  moveNode: (id, rawX, rawY) => {
    const { snapToGrid: snap } = get();
    const x = snap ? snapToGrid(rawX) : rawX;
    const y = snap ? snapToGrid(rawY) : rawY;
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
      isDirty: true,
    }));
  },

  removeNode: (id) => {
    (get() as any)._saveHistory();
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeIds: s.selectedNodeIds.filter((nid) => nid !== id),
      isDirty: true,
    }));
  },

  addEdge: (sourceId, targetId, cableType) => {
    const edge: NetworkEdge = {
      id: generateEdgeId(),
      source: sourceId,
      target: targetId,
      cable_type: cableType,
      status: 'active',
    };
    (get() as any)._saveHistory();
    set((s) => ({ edges: [...s.edges, edge], isDirty: true }));
    return edge;
  },

  removeEdge: (id) => {
    (get() as any)._saveHistory();
    set((s) => ({
      edges: s.edges.filter((e) => e.id !== id),
      selectedEdgeIds: s.selectedEdgeIds.filter((eid) => eid !== id),
      isDirty: true,
    }));
  },

  updateEdge: (id, updates) => {
    set((s) => ({
      edges: s.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      isDirty: true,
    }));
  },

  selectNode: (id, multi = false) =>
    set((s) => ({
      selectedNodeIds: multi
        ? s.selectedNodeIds.includes(id)
          ? s.selectedNodeIds.filter((n) => n !== id)
          : [...s.selectedNodeIds, id]
        : [id],
      selectedEdgeIds: multi ? s.selectedEdgeIds : [],
    })),

  selectEdge: (id, multi = false) =>
    set((s) => ({
      selectedEdgeIds: multi
        ? s.selectedEdgeIds.includes(id)
          ? s.selectedEdgeIds.filter((e) => e !== id)
          : [...s.selectedEdgeIds, id]
        : [id],
      selectedNodeIds: multi ? s.selectedNodeIds : [],
    })),

  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  deleteSelected: () => {
    const { selectedNodeIds, selectedEdgeIds } = get();
    (get() as any)._saveHistory();
    set((s) => ({
      nodes: s.nodes.filter((n) => !selectedNodeIds.includes(n.id)),
      edges: s.edges.filter(
        (e) =>
          !selectedEdgeIds.includes(e.id) &&
          !selectedNodeIds.includes(e.source) &&
          !selectedNodeIds.includes(e.target)
      ),
      selectedNodeIds: [],
      selectedEdgeIds: [],
      isDirty: true,
    }));
  },

  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.25), 4) }),
  setPan: (panX, panY) => set({ panX, panY }),

  fitToScreen: (width, height) => {
    const { nodes } = get();
    if (nodes.length === 0) {
      set({ zoom: 1, panX: 0, panY: 0 });
      return;
    }
    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + 64));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + 64));
    const contentW = maxX - minX + 80;
    const contentH = maxY - minY + 80;
    const zoom = Math.min(width / contentW, height / contentH, 1);
    const panX = (width - contentW * zoom) / 2 - minX * zoom + 40;
    const panY = (height - contentH * zoom) / 2 - minY * zoom + 40;
    set({ zoom, panX, panY });
  },

  setConnecting: (active, fromNodeId = null) =>
    set({ isConnecting: active, connectingFromNodeId: fromNodeId ?? null }),

  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  undo: () => {
    const { undoStack, nodes, edges, redoStack } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    const current: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, current],
      isDirty: true,
    });
  },

  redo: () => {
    const { redoStack, nodes, edges, undoStack } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const current: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    set({
      nodes: next.nodes,
      edges: next.edges,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, current],
      isDirty: true,
    });
  },

  clearDirty: () => set({ isDirty: false }),

  loadTemplate: (templateId, cx, cy) => {
    // Check built-in templates first, then custom
    const builtIn = TOPOLOGY_TEMPLATES.find((t) => t.id === templateId);
    const custom = get().customTemplates.find((t) => t.id === templateId);
    const tmpl = builtIn ?? custom;
    if (!tmpl) return;
    const { nodes: rawNodes, edges: rawEdges } = tmpl.build(cx, cy);
    // Build a stable id-remap so edges point to real node ids
    const idMap: Record<string, string> = {};
    const nodes: NetworkNode[] = rawNodes.map((raw) => {
      const catalog = DEVICE_CATALOG.find((d) => d.type === raw.type);
      const interfaces = (catalog?.defaultInterfaces ?? []).map((iface, i) => ({
        ...iface,
        id: `iface_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      }));
      const newId = generateNodeId();
      idMap[raw.id] = newId;
      return { ...raw, id: newId, interfaces };
    });
    const edges: NetworkEdge[] = rawEdges.map((raw) => ({
      ...raw,
      id: generateEdgeId(),
      source: idMap[raw.source] ?? raw.source,
      target: idMap[raw.target] ?? raw.target,
    }));
    (get() as any)._saveHistory();
    set((s) => ({
      nodes: [...s.nodes, ...nodes],
      edges: [...s.edges, ...edges],
      isDirty: true,
    }));
  },

  saveCanvasAsTemplate: (name, description = '') => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;

    // Snapshot node positions relative to the bounding-box top-left corner
    // so templates always place cleanly when loaded.
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const snapshotNodes: NetworkNode[] = nodes.map((n) => ({
      ...n,
      x: n.x - minX,
      y: n.y - minY,
    }));
    const snapshotEdges: NetworkEdge[] = edges.map((e) => ({ ...e }));

    // Derive tag list from unique device types in the topology
    const tags = Array.from(new Set(snapshotNodes.map((n) => n.type))).slice(0, 5) as string[];

    const newTemplate: TopologyTemplate = {
      id: `custom_${Date.now()}`,
      name,
      description: description || `${snapshotNodes.length} devices · ${snapshotEdges.length} links`,
      tags,
      color: '#8B5CF6',
      isCustom: true,
      build: (cx: number, cy: number) => {
        // Offset all nodes to place around requested canvas center
        const boundW = Math.max(...snapshotNodes.map((n) => n.x), 0) + 80;
        const boundH = Math.max(...snapshotNodes.map((n) => n.y), 0) + 80;
        const offsetX = cx - boundW / 2;
        const offsetY = cy - boundH / 2;
        const newNodes = snapshotNodes.map((n) => ({
          ...n,
          x: n.x + offsetX,
          y: n.y + offsetY,
        }));
        return { nodes: newNodes, edges: snapshotEdges };
      },
    };

    set((s) => ({ customTemplates: [...s.customTemplates, newTemplate] }));
  },

  deleteCustomTemplate: (id) => {
    set((s) => ({ customTemplates: s.customTemplates.filter((t) => t.id !== id) }));
  },
}));
