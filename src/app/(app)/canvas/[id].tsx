import { File, Paths } from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import {
  Activity,
  Download,
  Minus,
  Play,
  Radio,
  RotateCcw,
  RotateCw,
  Share2,
  Square,
  Terminal as TerminalIcon,
  Trash2,
  Wifi,
  Wrench,
  X,
} from 'lucide-react-native';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { CablePickerModal } from '@/components/CablePickerModal';
import { DeviceIcon, getDeviceColor } from '@/components/DeviceIcon';
import { EdgeDetailSheet } from '@/components/EdgeDetailSheet';
import { fetchProjectById, updateTopology } from '@/db/api';
import { DeviceDrawer } from '@/features/devices/DeviceDrawer';
import { NodeDetailSheet } from '@/features/devices/NodeDetailSheet';
import { TerminalPanel } from '@/features/terminal/TerminalPanel';
import { CABLE_COLORS, getCableCompatWarning } from '@/lib/constants';
import { exportPdf } from '@/lib/exportPdf';
import { topologyToSvg } from '@/lib/exportSvg';
import { loadTopologyCache, saveTopologyCache } from '@/lib/topologyCache';
import { findTracePath, generatePathTraceOutput, generateTraceOutput } from '@/lib/tracePacket';
import type { PacketType } from '@/store/useCanvasStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTerminalStore } from '@/store/useTerminalStore';
import type { CableType, DeviceType, NetworkEdge, NetworkNode } from '@/types';

const CANVAS_SIZE = 3000;
const GRID_STEP = 20;
const NODE_SIZE = 56;

// ─── Grid background ──────────────────────────────────────────────────────────
function GridBackground({ showGrid }: { showGrid: boolean }) {
  if (!showGrid) return null;
  const lines: React.ReactNode[] = [];
  for (let x = 0; x <= CANVAS_SIZE; x += GRID_STEP) {
    lines.push(<Line key={`v${x}`} x1={x} y1={0} x2={x} y2={CANVAS_SIZE} stroke="#334155" strokeWidth={0.5} opacity={0.4} />);
  }
  for (let y = 0; y <= CANVAS_SIZE; y += GRID_STEP) {
    lines.push(<Line key={`h${y}`} x1={0} y1={y} x2={CANVAS_SIZE} y2={y} stroke="#334155" strokeWidth={0.5} opacity={0.4} />);
  }
  return (
    <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ position: 'absolute' }}>
      <G>{lines}</G>
    </Svg>
  );
}

// Packet-type accent colours
const PACKET_COLORS: Record<string, string> = {
  icmp: '#34D399', // green
  tcp:  '#60A5FA', // blue
  udp:  '#F472B6', // pink
};

// ─── Animated flow dot along a quadratic bezier ──────────────────────────────
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function FlowDot({
  x1, y1, cpx, cpy, x2, y2,
  color, offset, duration, large,
}: {
  x1: number; y1: number; cpx: number; cpy: number; x2: number; y2: number;
  color: string; offset: number; duration: number; large?: boolean;
}) {
  const t = useSharedValue(offset);

  useEffect(() => {
    t.value = offset;
    t.value = withRepeat(withTiming(offset + 1, { duration }), -1, false);
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const tv = t.value % 1;
    const inv = 1 - tv;
    const cx = inv * inv * x1 + 2 * inv * tv * cpx + tv * tv * x2;
    const cy = inv * inv * y1 + 2 * inv * tv * cpy + tv * tv * y2;
    return { cx, cy };
  });

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      r={large ? 5.5 : 3.5}
      fill={color}
      opacity={large ? 0.95 : 0.9}
    />
  );
}

// ─── Edge (Bezier) ────────────────────────────────────────────────────────────
function EdgeLine({
  edge,
  nodes,
  showLabels,
  selected,
  onPress,
  simulationMode,
  packetType,
  isTracePath,
}: {
  edge: NetworkEdge;
  nodes: NetworkNode[];
  showLabels: boolean;
  selected: boolean;
  onPress: () => void;
  simulationMode: boolean;
  packetType: PacketType;
  isTracePath?: boolean;
}) {
  const src = nodes.find((n) => n.id === edge.source);
  const tgt = nodes.find((n) => n.id === edge.target);
  if (!src || !tgt) return null;

  const half = NODE_SIZE / 2;
  const x1 = src.x + half;
  const y1 = src.y + half;
  const x2 = tgt.x + half;
  const y2 = tgt.y + half;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const ctrlOffset = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 0.4;
  const cpx = midX;
  const cpy = midY - ctrlOffset;
  const d = `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;

  const color = isTracePath ? '#FBBF24' : selected ? '#22D3EE' : (CABLE_COLORS[edge.cable_type] ?? '#3B82F6');
  const isActive = edge.status === 'active';
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const dotDuration = Math.max(900, dist * 3.5);

  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      pointerEvents="none"
    >
      {/* Hit target */}
      <Path d={d} stroke="transparent" strokeWidth={24} fill="none" onPress={onPress} />
      {/* Glow: trace path (amber) or selected (cyan) */}
      {(isTracePath || selected) && (
        <Path d={d} stroke={color} strokeWidth={isTracePath ? 10 : 6} fill="none" opacity={isTracePath ? 0.35 : 0.18} />
      )}
      <Path
        d={d}
        stroke={color}
        strokeWidth={isTracePath ? 3 : selected ? 2.5 : 1.8}
        fill="none"
        strokeDasharray={!isActive ? '6,4' : undefined}
        opacity={!isActive ? 0.45 : 1}
      />
      {/* Animated data-flow dots — active edges always, ALL edges in sim mode */}
      {(isActive || simulationMode) && (() => {
        const dotColor = simulationMode ? (PACKET_COLORS[packetType] ?? color) : color;
        const speed = simulationMode ? Math.max(500, dist * 2) : dotDuration;
        const count = simulationMode ? 5 : 3;
        return Array.from({ length: count }, (_, i) => (
          <FlowDot
            key={i}
            x1={x1} y1={y1} cpx={cpx} cpy={cpy} x2={x2} y2={y2}
            color={dotColor}
            offset={i / count}
            duration={speed}
            large={simulationMode}
          />
        ));
      })()}
      {showLabels && (
        <SvgText x={midX} y={cpy - 6} fill={color} fontSize={11} fontWeight="600" textAnchor="middle">
          {edge.cable_type}
        </SvgText>
      )}
      {/* VLAN badge — shown whenever vlan_id is set, regardless of showLabels */}
      {edge.vlan_id !== undefined && (
        <>
          <Rect
            x={midX - 18} y={midY - 10}
            width={36} height={16}
            rx={4} ry={4}
            fill="#1E293B" stroke="#6366F1" strokeWidth={1}
          />
          <SvgText
            x={midX} y={midY + 3}
            fill="#A5B4FC" fontSize={9} fontWeight="700" textAnchor="middle"
          >
            {`V${edge.vlan_id}`}
          </SvgText>
        </>
      )}
    </Svg>
  );
}

// ─── Device node ──────────────────────────────────────────────────────────────
function DeviceNode({
  node,
  selected,
  isConnecting,
  connectingFrom,
  onTap,
  onDragEnd,
}: {
  node: NetworkNode;
  selected: boolean;
  isConnecting: boolean;
  connectingFrom: string | null;
  onTap: () => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const tx = useSharedValue(node.x);
  const ty = useSharedValue(node.y);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => { tx.value = node.x; ty.value = node.y; }, [node.x, node.y]);

  const dragGesture = Gesture.Pan()
    .onStart(() => { startX.value = tx.value; startY.value = ty.value; })
    .onUpdate((e) => { tx.value = startX.value + e.translationX; ty.value = startY.value + e.translationY; })
    .onEnd(() => { runOnJS(onDragEnd)(tx.value, ty.value); })
    .minDistance(5);

  const tapGesture = Gesture.Tap().onEnd(() => { runOnJS(onTap)(); });

  const gesture = Gesture.Simultaneous(tapGesture, dragGesture);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  const color = getDeviceColor(node.type);
  const isConnectingSource = connectingFrom === node.id;
  const isConnectingTarget = isConnecting && connectingFrom && connectingFrom !== node.id;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[{ position: 'absolute', width: NODE_SIZE, height: NODE_SIZE }, animStyle]}
      >
        <View
          style={{
            width: NODE_SIZE,
            height: NODE_SIZE,
            borderRadius: 14,
            borderWidth: selected || isConnectingSource ? 2 : isConnectingTarget ? 1.5 : 0,
            borderColor: isConnectingSource ? '#22D3EE' : isConnectingTarget ? '#F59E0B' : '#3B82F6',
            backgroundColor: '#1E293B',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: color,
            shadowOpacity: selected ? 0.6 : 0.2,
            shadowRadius: selected ? 10 : 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <DeviceIcon type={node.type} size={36} bgColor="transparent" />
        </View>
        <View
          style={{
            position: 'absolute',
            top: NODE_SIZE + 4,
            left: '50%',
            transform: [{ translateX: -36 }],
            width: 72,
            alignItems: 'center',
            gap: 2,
          }}
        >
          <View style={{
            backgroundColor: 'rgba(11,18,32,0.82)',
            borderRadius: 6,
            paddingHorizontal: 5,
            paddingVertical: 2,
          }}>
            <Text
              style={{ fontSize: 10, textAlign: 'center', color: '#F1F5F9', fontWeight: '600', letterSpacing: 0.1 }}
              numberOfLines={1}
            >
              {node.hostname || node.label}
            </Text>
          </View>
          {!!node.ip_address && (
            <View style={{
              backgroundColor: 'rgba(6,182,212,0.18)',
              borderRadius: 5,
              paddingHorizontal: 4,
              paddingVertical: 1,
              borderWidth: 0.5,
              borderColor: 'rgba(6,182,212,0.4)',
            }}>
              <Text style={{ fontSize: 8.5, textAlign: 'center', color: '#67E8F9', fontFamily: 'monospace' }} numberOfLines={1}>
                {node.ip_address}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Main Canvas Screen ───────────────────────────────────────────────────────
export default function CanvasScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const {
    nodes, edges, selectedNodeIds, selectedEdgeIds,
    zoom, panX, panY, showGrid, isConnecting, connectingFromNodeId,
    loadTopology, addNode, moveNode, removeNode, addEdge, updateEdge,
    selectNode, selectEdge, clearSelection, deleteSelected,
    setZoom, setPan, fitToScreen, setConnecting, toggleGrid,
    undo, redo, undoStack, redoStack, isDirty, clearDirty,
    simulationMode, packetType, setSimulationMode, setPacketType,
  } = useCanvasStore();

  const { isExpanded: terminalExpanded, setExpanded: setTerminalExpanded, addLine } = useTerminalStore();
  const { showLinkLabels } = useSettingsStore();
  const [simPanelVisible, setSimPanelVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('Untitled');
  const [isOffline, setIsOffline] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);

  // Pan/zoom animated values
  const canvasScale = useSharedValue(1);
  const canvasX = useSharedValue(0);
  const canvasY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  // Load project
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const project = await fetchProjectById(projectId);
        if (project) {
          setProjectName(project.name);
          const remoteNodes = project.topology_data?.nodes ?? [];
          const remoteEdges = project.topology_data?.edges ?? [];

          // Check for offline conflict: local cache newer than server?
          const cached = await loadTopologyCache(projectId);
          if (cached) {
            const cacheNodeIds = new Set(cached.topology.nodes.map((n) => n.id));
            const remoteNodeIds = new Set(remoteNodes.map((n) => n.id));
            const hasConflict =
              cached.topology.nodes.length !== remoteNodes.length ||
              cached.topology.edges.length !== remoteEdges.length ||
              [...cacheNodeIds].some((id) => !remoteNodeIds.has(id));
            if (hasConflict) {
              // Show diff — load cached version first, let user decide
              loadTopology(projectId, cached.topology.nodes, cached.topology.edges);
              setConflictRemote({ nodes: remoteNodes, edges: remoteEdges });
              setConflictVisible(true);
              setLoading(false);
              return;
            }
          }

          loadTopology(projectId, remoteNodes, remoteEdges);
          await saveTopologyCache(projectId, project.name, { nodes: remoteNodes, edges: remoteEdges });
          setIsOffline(false);
        }
      } catch {
        // Network failed — try offline cache
        const cached = await loadTopologyCache(projectId);
        if (cached) {
          setProjectName(cached.projectName);
          loadTopology(projectId, cached.topology.nodes, cached.topology.edges);
          setIsOffline(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  // Auto-save + cache update
  useEffect(() => {
    if (!isDirty || !projectId) return;
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateTopology(projectId, { nodes, edges });
        await saveTopologyCache(projectId, projectName, { nodes, edges });
        clearDirty();
        setLastSaved(new Date());
      } catch {
        await saveTopologyCache(projectId, projectName, { nodes, edges });
      } finally {
        setIsSaving(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [isDirty, nodes, edges, projectId, projectName]);

  // Canvas pan/zoom gestures
  const pinchGesture = Gesture.Pinch()
    .onStart(() => { savedScale.value = canvasScale.value; })
    .onUpdate((e) => {
      const newScale = Math.min(Math.max(savedScale.value * e.scale, 0.25), 4);
      canvasScale.value = newScale;
    })
    .onEnd(() => { runOnJS(setZoom)(canvasScale.value); });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => { savedX.value = canvasX.value; savedY.value = canvasY.value; })
    .onUpdate((e) => {
      canvasX.value = savedX.value + e.translationX;
      canvasY.value = savedY.value + e.translationY;
    })
    .onEnd(() => { runOnJS(setPan)(canvasX.value, canvasY.value); });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const canvasAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: canvasX.value },
      { translateY: canvasY.value },
      { scale: canvasScale.value },
    ],
  }));

  const [cablePickerVisible, setCablePickerVisible] = useState(false);
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);
  const [cableCompatWarning, setCableCompatWarning] = useState<string | null>(null);
  const [pendingCableType, setPendingCableType] = useState<CableType | null>(null);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Conflict resolution state
  const [conflictVisible, setConflictVisible] = useState(false);
  const [conflictRemote, setConflictRemote] = useState<{ nodes: NetworkNode[]; edges: NetworkEdge[] } | null>(null);

  // Tracer: two-tap src → dst selection
  const [traceSource, setTraceSource] = useState<string | null>(null);
  const [traceRunning, setTraceRunning] = useState(false);
  const [tracePathEdgeIds, setTracePathEdgeIds] = useState<Set<string>>(new Set());

  // Sync status indicator
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleNodeTap = useCallback((nodeId: string) => {
    // ── Tracer mode: two-tap path trace ────────────────────────────────
    if (simulationMode) {
      if (!traceSource) {
        setTraceSource(nodeId);
        addLine(`! Trace source: ${nodes.find((n) => n.id === nodeId)?.label ?? nodeId}`, 'system');
        addLine(`! Now tap the destination device…`, 'system');
        setTerminalExpanded(true);
        return;
      }
      if (traceSource === nodeId) {
        setTraceSource(null);
        return;
      }
      // Run BFS trace
      setTraceRunning(true);
      const path = findTracePath(traceSource, nodeId, nodes, edges);
      if (!path) {
        addLine(`! No path found from ${nodes.find((n) => n.id === traceSource)?.label ?? traceSource} to ${nodes.find((n) => n.id === nodeId)?.label ?? nodeId}`, 'error');
        addLine(`! Check that devices are connected with cables.`, 'error');
      } else {
        setTracePathEdgeIds(new Set(path.edgeIds));
        const lines = generatePathTraceOutput(path, nodes, edges, packetType);
        lines.forEach((l) => addLine(l, 'output'));
        // Clear highlight after 3 s
        setTimeout(() => setTracePathEdgeIds(new Set()), 3000);
      }
      setTraceSource(null);
      setTraceRunning(false);
      setTerminalExpanded(true);
      return;
    }
    // ── Normal mode ────────────────────────────────────────────────────
    if (isConnecting && connectingFromNodeId && connectingFromNodeId !== nodeId) {
      setPendingTargetId(nodeId);
      setCablePickerVisible(true);
    } else if (isConnecting && !connectingFromNodeId) {
      setConnecting(true, nodeId);
    } else {
      selectNode(nodeId);
    }
  }, [simulationMode, traceSource, nodes, edges, packetType, addLine, setTerminalExpanded,
      isConnecting, connectingFromNodeId, setConnecting, selectNode]);

  const handleCableSelected = useCallback((cableType: CableType) => {
    if (!connectingFromNodeId || !pendingTargetId) {
      setCablePickerVisible(false);
      setPendingTargetId(null);
      setConnecting(false);
      return;
    }
    // Check cable compat
    const srcNode = nodes.find((n) => n.id === connectingFromNodeId);
    const tgtNode = nodes.find((n) => n.id === pendingTargetId);
    if (srcNode && tgtNode) {
      const warning = getCableCompatWarning(srcNode.type, tgtNode.type, cableType);
      if (warning) {
        setCablePickerVisible(false);
        setPendingCableType(cableType);
        setCableCompatWarning(warning);
        return;
      }
    }
    const edge = addEdge(connectingFromNodeId, pendingTargetId, cableType);
    // Trace output in terminal
    if (srcNode && tgtNode) {
      const traceLines = generateTraceOutput(srcNode, tgtNode, edge, nodes.length);
      traceLines.forEach((l) => addLine(l, 'output'));
      setTerminalExpanded(true);
    }
    setCablePickerVisible(false);
    setPendingTargetId(null);
    setConnecting(false);
  }, [connectingFromNodeId, pendingTargetId, nodes, addEdge, setConnecting, addLine, setTerminalExpanded]);

  const handleCablePickerDismiss = useCallback(() => {
    setCablePickerVisible(false);
    setPendingTargetId(null);
    setConnecting(false);
  }, [setConnecting]);

  const handleCompatConfirm = useCallback(() => {
    if (connectingFromNodeId && pendingTargetId && pendingCableType) {
      const edge = addEdge(connectingFromNodeId, pendingTargetId, pendingCableType);
      const srcNode = nodes.find((n) => n.id === connectingFromNodeId);
      const tgtNode = nodes.find((n) => n.id === pendingTargetId);
      if (srcNode && tgtNode) {
        const traceLines = generateTraceOutput(srcNode, tgtNode, edge, nodes.length);
        traceLines.forEach((l) => addLine(l, 'output'));
        setTerminalExpanded(true);
      }
    }
    setCableCompatWarning(null);
    setPendingCableType(null);
    setPendingTargetId(null);
    setConnecting(false);
  }, [connectingFromNodeId, pendingTargetId, pendingCableType, addEdge, setConnecting]);

  const handleCompatCancel = useCallback(() => {
    setCableCompatWarning(null);
    setPendingCableType(null);
    // Re-open cable picker to let user pick a different cable
    if (connectingFromNodeId && pendingTargetId) {
      setCablePickerVisible(true);
    } else {
      setPendingTargetId(null);
      setConnecting(false);
    }
  }, [connectingFromNodeId, pendingTargetId, setConnecting]);

  const handleExportJSON = useCallback(async () => {
    setExportMenuVisible(false);
    try {
      const payload = JSON.stringify({ nodes, edges, exportedAt: new Date().toISOString(), project: projectName }, null, 2);
      if (process.env.EXPO_OS === 'web') {
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${projectName}.json`; a.click();
        URL.revokeObjectURL(url);
        return;
      }
      const fileName = `${projectName.replace(/\s+/g, '_')}_topology.json`;
      const file = new File(Paths.cache, fileName);
      await file.write(payload);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export Topology JSON' });
      }
    } catch (e) {
      console.error('Export JSON failed', e);
    }
  }, [nodes, edges, projectName]);

  const handleExportSVG = useCallback(async () => {
    setExportMenuVisible(false);
    try {
      const svgStr = topologyToSvg(nodes, edges, projectName);
      const baseName = projectName.replace(/\s+/g, '_') + '_topology';

      if (process.env.EXPO_OS === 'web') {
        // ── Web: render SVG to a hidden <canvas> → download as PNG ──────────
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Parse width/height from SVG string (e.g. width="1200" height="800")
        const wMatch = svgStr.match(/width="(\d+(\.\d+)?)"/);
        const hMatch = svgStr.match(/height="(\d+(\.\d+)?)"/);
        const W = wMatch ? Math.ceil(parseFloat(wMatch[1])) : 1200;
        const H = hMatch ? Math.ceil(parseFloat(hMatch[1])) : 800;

        const canvas = document.createElement('canvas');
        canvas.width = W * 2;   // @2x for retina
        canvas.height = H * 2;
        const ctx2d = canvas.getContext('2d')!;
        ctx2d.scale(2, 2);

        const img = new Image();
        img.onload = () => {
          ctx2d.drawImage(img, 0, 0, W, H);
          URL.revokeObjectURL(svgUrl);
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${baseName}.png`;
          a.click();
        };
        img.onerror = () => {
          // PNG failed — fall back to SVG download
          URL.revokeObjectURL(svgUrl);
          const fallbackBlob = new Blob([svgStr], { type: 'image/svg+xml' });
          const fallbackUrl = URL.createObjectURL(fallbackBlob);
          const a = document.createElement('a');
          a.href = fallbackUrl;
          a.download = `${baseName}.svg`;
          a.click();
          URL.revokeObjectURL(fallbackUrl);
        };
        img.src = svgUrl;
        return;
      }

      // ── Native: share as SVG file (universally openable) ─────────────────
      const file = new File(Paths.cache, `${baseName}.svg`);
      await file.write(svgStr);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'image/svg+xml', dialogTitle: 'Export Topology' });
      }
    } catch (e) {
      console.error('Export SVG/PNG failed', e);
    }
  }, [nodes, edges, projectName]);

  // Share — generates a read-only deep-link for the current topology
  const handleShare = useCallback(async () => {
    const baseUrl = process.env.EXPO_OS === 'web'
      ? window.location.origin
      : 'https://packetflow.app';
    const shareUrl = `${baseUrl}/view/${projectId}`;
    if (process.env.EXPO_OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } else {
      setShareVisible(true);
    }
  }, [projectId]);

  const handleExportPdf = useCallback(async () => {
    setExportMenuVisible(false);
    try {
      await exportPdf(projectName, projectId ?? '', nodes, edges);
    } catch (e) {
      console.error('PDF export failed', e);
    }
  }, [projectName, nodes, edges]);

  const handleDrop = (type: DeviceType) => {
    const cx = -canvasX.value / canvasScale.value + screenW / 2 / canvasScale.value;
    const cy = -canvasY.value / canvasScale.value + screenH / 3 / canvasScale.value;
    addNode(type, cx, cy);
    setShowDrawer(false);
  };

  const handleFitScreen = () => {
    fitToScreen(screenW, screenH - 160);
    canvasScale.value = withSpring(zoom, { stiffness: 100 });
    canvasX.value = withSpring(panX);
    canvasY.value = withSpring(panY);
  };

  const zoomIn = () => {
    const next = Math.min(canvasScale.value * 1.25, 4);
    canvasScale.value = withTiming(next, { duration: 200 });
    setZoom(next);
  };

  const zoomOut = () => {
    const next = Math.max(canvasScale.value * 0.8, 0.25);
    canvasScale.value = withTiming(next, { duration: 200 });
    setZoom(next);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0B1220]">
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-[#CBD5E1] mt-3 text-sm">Loading canvas...</Text>
      </View>
    );
  }

  const zoomPct = Math.round(canvasScale.value * 100);

  return (
    <View className="flex-1 bg-[#0B1220]">
      <StatusBar style="light" />

      {/* ── Top toolbar ── */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-3 bg-[#111827] border-b border-[#1E293B] z-10">
        {/* Left: hamburger */}
        <Pressable onPress={() => setShowDrawer(true)} className="w-9 h-9 rounded-xl bg-[#1E293B] items-center justify-center active:opacity-70">
          <View className="gap-1 items-center justify-center">
            <View style={{ width: 16, height: 1.5, backgroundColor: '#CBD5E1', borderRadius: 1 }} />
            <View style={{ width: 16, height: 1.5, backgroundColor: '#CBD5E1', borderRadius: 1 }} />
            <View style={{ width: 12, height: 1.5, backgroundColor: '#CBD5E1', borderRadius: 1 }} />
          </View>
        </Pressable>

        {/* Center: title + dirty indicator */}
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[#F8FAFC] font-bold text-base">PacketFlow</Text>
          {isDirty && <View className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />}
        </View>

        {/* Right: Online/Offline badge + undo/redo */}
        <View className="flex-row items-center gap-2">
          {isOffline ? (
            <View className="flex-row items-center gap-1 bg-[#F59E0B]/15 px-2 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '600' }}>Offline</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1 bg-[#22C55E]/15 px-2 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <Text style={{ color: '#22C55E', fontSize: 11, fontWeight: '600' }}>Online</Text>
            </View>
          )}
          <Pressable onPress={undo} disabled={undoStack.length === 0} className="w-8 h-8 rounded-lg bg-[#1E293B] items-center justify-center active:opacity-70" style={{ opacity: undoStack.length === 0 ? 0.3 : 1 }}>
            <RotateCcw size={14} color="#CBD5E1" />
          </Pressable>
          <Pressable onPress={redo} disabled={redoStack.length === 0} className="w-8 h-8 rounded-lg bg-[#1E293B] items-center justify-center active:opacity-70" style={{ opacity: redoStack.length === 0 ? 0.3 : 1 }}>
            <RotateCw size={14} color="#CBD5E1" />
          </Pressable>
          {(selectedNodeIds.length > 0 || selectedEdgeIds.length > 0) && (
            <Pressable onPress={deleteSelected} className="w-8 h-8 rounded-lg bg-[#EF444433] items-center justify-center active:opacity-70">
              <Trash2 size={14} color="#EF4444" />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Canvas ── */}
      <GestureDetector gesture={composed}>
        <View
          style={{ flex: 1 }}
          onStartShouldSetResponder={() => { clearSelection(); return false; }}
        >
          <Animated.View style={[{ width: CANVAS_SIZE, height: CANVAS_SIZE }, canvasAnimStyle]}>
            {/* Grid */}
            <GridBackground showGrid={showGrid} />

            {/* Edges */}
            {edges.map((edge) => (
              <EdgeLine
                key={edge.id}
                edge={edge}
                nodes={nodes}
                showLabels={showLinkLabels}
                selected={selectedEdgeIds.includes(edge.id)}
                onPress={() => { selectEdge(edge.id); setEditingEdgeId(edge.id); }}
                simulationMode={simulationMode}
                packetType={packetType}
                isTracePath={tracePathEdgeIds.has(edge.id)}
              />
            ))}

            {/* Nodes */}
            {nodes.map((node) => (
              <DeviceNode
                key={node.id}
                node={node}
                selected={selectedNodeIds.includes(node.id)}
                isConnecting={isConnecting}
                connectingFrom={connectingFromNodeId}
                onTap={() => handleNodeTap(node.id)}
                onDragEnd={(x, y) => moveNode(node.id, x, y)}
              />
            ))}

            {/* Empty state */}
            {nodes.length === 0 && (
              <View style={{ position: 'absolute', left: CANVAS_SIZE / 2 - 130, top: CANVAS_SIZE / 2 - 90, width: 260, alignItems: 'center', gap: 12 }}>
                <Pressable
                  onPress={() => setShowDrawer(true)}
                  style={{
                    width: 72, height: 72, borderRadius: 18,
                    backgroundColor: '#2563EB',
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: '#2563EB', shadowOpacity: 0.5,
                    shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 40, lineHeight: 44, marginTop: -2 }}>+</Text>
                </Pressable>
                <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Your canvas is empty
                </Text>
                <Text style={{ color: '#64748B', fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
                  Add devices from the tools{'\n'}to start building your network.
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Connecting indicator */}
      {isConnecting && (
        <View className="absolute top-24 self-center bg-[#F59E0B]/90 rounded-xl px-4 py-2 flex-row items-center gap-2">
          <Text className="text-[#0B1220] text-sm font-semibold">
            {connectingFromNodeId ? 'Tap target device to connect' : 'Tap a source device'}
          </Text>
          <Pressable onPress={() => setConnecting(false)} className="w-5 h-5 rounded-full bg-[#0B122044] items-center justify-center">
            <X size={12} color="#0B1220" />
          </Pressable>
        </View>
      )}

      {/* Zoom level indicator */}
      <View className="absolute top-24 right-4 rounded-lg px-2 py-1" style={{ backgroundColor: 'rgba(17,24,39,0.92)' }}>
        <Text style={{ color: '#CBD5E1', fontSize: 11, fontWeight: '600' }}>{zoomPct}%</Text>
      </View>

      {/* ── Simulation banner — shows tracer state ── */}
      {simulationMode && (
        <View
          className="absolute top-24 self-center rounded-2xl overflow-hidden"
          style={{ shadowColor: '#10B981', shadowOpacity: 0.5, shadowRadius: 12 }}
        >
          {traceSource ? (
            /* Step 2: source chosen, waiting for destination */
            <View className="flex-row items-center gap-3 px-4 py-2" style={{ backgroundColor: 'rgba(251,191,36,0.95)' }}>
              <Radio size={15} color="#0F172A" />
              <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '800', letterSpacing: 0.2 }}>
                {nodes.find((n) => n.id === traceSource)?.label ?? '?'} → Tap destination
              </Text>
              <Pressable
                onPress={() => setTraceSource(null)}
                className="w-5 h-5 rounded-full items-center justify-center active:opacity-70"
                style={{ backgroundColor: 'rgba(0,0,0,0.18)' }}
              >
                <X size={11} color="#0F172A" />
              </Pressable>
            </View>
          ) : (
            /* Step 1: sim active, waiting for source */
            <View className="flex-row items-center gap-3 px-4 py-2" style={{ backgroundColor: 'rgba(16,185,129,0.92)' }}>
              <Activity size={15} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 }}>
                {traceRunning ? 'Tracing…' : `Trace · ${packetType.toUpperCase()} · Tap source`}
              </Text>
              <Pressable
                onPress={() => { setSimulationMode(false); setTraceSource(null); setTracePathEdgeIds(new Set()); }}
                className="w-5 h-5 rounded-full items-center justify-center active:opacity-70"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
              >
                <X size={11} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* ── Simulation Panel ── */}
      {simPanelVisible && (
        <View
          className="absolute bottom-20 self-center rounded-2xl p-4 gap-3"
          style={{ backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1E293B', width: 280,
            shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 20 }}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text style={{ color: '#F8FAFC', fontSize: 15, fontWeight: '800' }}>Packet Simulation</Text>
            <Pressable onPress={() => setSimPanelVisible(false)} className="active:opacity-70">
              <X size={16} color="#64748B" />
            </Pressable>
          </View>
          {/* Packet type selector */}
          <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 }}>Packet Type</Text>
          <View className="flex-row gap-2">
            {(['icmp','tcp','udp'] as PacketType[]).map((pt) => (
              <Pressable
                key={pt}
                onPress={() => setPacketType(pt)}
                className="flex-1 py-2 rounded-xl items-center active:opacity-70"
                style={{ backgroundColor: packetType === pt ? PACKET_COLORS[pt] + '33' : '#1E293B',
                  borderWidth: 1, borderColor: packetType === pt ? PACKET_COLORS[pt] : '#334155' }}
              >
                <Text style={{ color: packetType === pt ? PACKET_COLORS[pt] : '#94A3B8', fontSize: 12, fontWeight: '700' }}>
                  {pt.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
          {/* Legend */}
          <View className="flex-row items-center gap-2 mt-1">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: PACKET_COLORS[packetType] }} />
            <Text style={{ color: '#64748B', fontSize: 11 }}>
              {packetType === 'icmp' ? 'Echo request/reply (ping)' : packetType === 'tcp' ? 'Connection-oriented segments' : 'Connectionless datagrams'}
            </Text>
          </View>
          {/* Start / Stop */}
          <Pressable
            onPress={() => { setSimulationMode(!simulationMode); setSimPanelVisible(false); if (simulationMode) { setTraceSource(null); setTracePathEdgeIds(new Set()); } }}
            className="flex-row items-center justify-center gap-2 py-3 rounded-xl mt-1 active:opacity-80"
            style={{ backgroundColor: simulationMode ? '#EF444422' : '#10B98122',
              borderWidth: 1, borderColor: simulationMode ? '#EF4444' : '#10B981' }}
          >
            {simulationMode
              ? <><Square size={14} color="#EF4444" /><Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '700' }}>Stop Simulation</Text></>
              : <><Play  size={14} color="#10B981" /><Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700' }}>Start Simulation</Text></>
            }
          </Pressable>
        </View>
      )}

      {/* Terminal panel */}
      {terminalExpanded && (
        <TerminalPanel onClose={() => setTerminalExpanded(false)} />
      )}

      {/* ── Sync status indicator ── */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16, paddingVertical: 5,
          backgroundColor: '#0A1220', borderTopWidth: 1, borderColor: '#1E293B',
        }}
      >
        {/* Online / offline pill */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: isOffline ? '#F87171' : '#4ADE80',
          }} />
          <Text style={{ color: isOffline ? '#F87171' : '#4ADE80', fontSize: 10, fontWeight: '700' }}>
            {isOffline ? 'Offline' : 'Online'}
          </Text>
        </View>

        {/* Save status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          {isSaving ? (
            <>
              <ActivityIndicator size={10} color="#60A5FA" />
              <Text style={{ color: '#60A5FA', fontSize: 10, fontWeight: '600' }}>Saving…</Text>
            </>
          ) : isDirty ? (
            <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: '600' }}>Unsaved changes</Text>
          ) : lastSaved ? (
            <Text style={{ color: '#475569', fontSize: 10 }}>
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          ) : null}
        </View>

        {/* Node / edge count */}
        <Text style={{ color: '#334155', fontSize: 10 }}>
          {nodes.length} devices · {edges.length} links
        </Text>
      </View>

      {/* ── Bottom toolbar ── */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#111827] border-t border-[#1E293B]">
        {/* Tools */}
        <Pressable
          onPress={() => setShowDrawer(true)}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl active:opacity-70"
          style={{ backgroundColor: showDrawer ? '#2563EB33' : '#1E293B' }}
        >
          <Wrench size={17} color={showDrawer ? '#3B82F6' : '#CBD5E1'} />
          <Text style={{ color: showDrawer ? '#3B82F6' : '#CBD5E1', fontSize: 12, fontWeight: '500' }}>Tools</Text>
        </Pressable>

        {/* Zoom controls: − | Fit | + */}
        <View className="flex-row items-center gap-1.5">
          <Pressable onPress={zoomOut} className="w-8 h-8 rounded-lg bg-[#1E293B] items-center justify-center active:opacity-70">
            <Minus size={16} color="#CBD5E1" />
          </Pressable>
          <Pressable onPress={handleFitScreen} className="px-3 h-8 rounded-lg bg-[#1E293B] items-center justify-center active:opacity-70">
            <Text style={{ color: '#CBD5E1', fontSize: 12, fontWeight: '500' }}>Fit</Text>
          </Pressable>
          <Pressable onPress={zoomIn} className="w-8 h-8 rounded-lg bg-[#1E293B] items-center justify-center active:opacity-70">
            <Text style={{ color: '#CBD5E1', fontSize: 18, lineHeight: 20 }}>+</Text>
          </Pressable>
        </View>

        {/* Simulate */}
        <Pressable
          onPress={() => { setSimPanelVisible(!simPanelVisible); setShowDrawer(false); }}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl active:opacity-70"
          style={{ backgroundColor: simulationMode ? '#10B98122' : simPanelVisible ? '#10B98133' : '#1E293B',
            borderWidth: simulationMode ? 1 : 0, borderColor: '#10B981' }}
        >
          {simulationMode
            ? <Radio size={17} color="#10B981" />
            : <Play  size={17} color={simPanelVisible ? '#10B981' : '#CBD5E1'} />
          }
          <Text style={{ color: simulationMode || simPanelVisible ? '#10B981' : '#CBD5E1', fontSize: 12, fontWeight: '500' }}>
            {simulationMode ? 'Simulating' : 'Simulate'}
          </Text>
        </Pressable>

        {/* Console */}
        <Pressable
          onPress={() => { setTerminalExpanded(!terminalExpanded); setShowDrawer(false); }}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl active:opacity-70"
          style={{ backgroundColor: terminalExpanded ? '#2563EB33' : '#1E293B' }}
        >
          <TerminalIcon size={17} color={terminalExpanded ? '#3B82F6' : '#CBD5E1'} />
          <Text style={{ color: terminalExpanded ? '#3B82F6' : '#CBD5E1', fontSize: 12, fontWeight: '500' }}>Console</Text>
        </Pressable>

        {/* Share */}
        <Pressable
          onPress={handleShare}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl active:opacity-70"
          style={{ backgroundColor: shareCopied ? '#16a34a33' : '#1E293B' }}
        >
          <Share2 size={17} color={shareCopied ? '#4ade80' : '#CBD5E1'} />
          <Text style={{ color: shareCopied ? '#4ade80' : '#CBD5E1', fontSize: 12, fontWeight: '500' }}>
            {shareCopied ? 'Copied!' : 'Share'}
          </Text>
        </Pressable>

        {/* Export */}
        <Pressable
          onPress={() => setExportMenuVisible(true)}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl active:opacity-70"
          style={{ backgroundColor: '#1E293B' }}
        >
          <Download size={17} color="#CBD5E1" />
          <Text style={{ color: '#CBD5E1', fontSize: 12, fontWeight: '500' }}>Export</Text>
        </Pressable>
      </View>

      {/* Device Drawer */}
      {showDrawer && (
        <DeviceDrawer
          onClose={() => setShowDrawer(false)}
          onAddDevice={(type) => handleDrop(type)}
          onStartConnect={() => { setConnecting(true); setShowDrawer(false); }}
        />
      )}

      {/* Cable type picker — shown when user completes a connection */}
      <CablePickerModal
        visible={cablePickerVisible}
        onPick={handleCableSelected}
        onCancel={handleCablePickerDismiss}
      />

      {/* Cable compatibility warning */}
      {cableCompatWarning && (
        <View style={{ position: 'absolute', inset: 0, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1E293B', borderRadius: 20, padding: 24, width: '100%', gap: 16, borderWidth: 1, borderColor: '#F59E0B40' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F59E0B20', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18 }}>⚠️</Text>
              </View>
              <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '800', flex: 1 }}>Incompatible Cable</Text>
            </View>
            <Text style={{ color: '#CBD5E1', fontSize: 14, lineHeight: 20 }}>{cableCompatWarning}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={handleCompatCancel}
                style={{ flex: 1, backgroundColor: '#334155', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#CBD5E1', fontWeight: '700', fontSize: 14 }}>Change Cable</Text>
              </Pressable>
              <Pressable
                onPress={handleCompatConfirm}
                style={{ flex: 1, backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#0B1220', fontWeight: '800', fontSize: 14 }}>Use Anyway</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Export menu */}
      {exportMenuVisible && (
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: '#00000066', justifyContent: 'flex-end' }}
          onPress={() => setExportMenuVisible(false)}
        >
          <Pressable
            style={{ backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12, borderTopWidth: 1, borderColor: '#334155' }}
            onPress={() => {}}
          >
            <View style={{ width: 36, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 4 }} />
            <Text style={{ color: '#F8FAFC', fontSize: 17, fontWeight: '800', marginBottom: 4 }}>Export Topology</Text>

            <Pressable
              onPress={handleExportJSON}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#0F172A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#3B82F630' }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#3B82F620', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={20} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F1F5F9', fontSize: 15, fontWeight: '700' }}>Export as JSON</Text>
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                  Save full topology with {nodes.length} devices & {edges.length} links
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleExportSVG}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#0F172A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#10B98130' }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#10B98120', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F1F5F9', fontSize: 15, fontWeight: '700' }}>Export as PNG</Text>
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                  High-res PNG image (Web) or SVG vector (mobile)
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleExportPdf}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#0F172A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#F59E0B30' }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F59E0B20', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F1F5F9', fontSize: 15, fontWeight: '700' }}>Export as PDF</Text>
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                  Device table, cable legend & topology diagram
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setExportMenuVisible(false)}
              style={{ backgroundColor: '#334155', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 }}
            >
              <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 14 }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}

      {/* Node detail sheet */}
      {editingNodeId && (
        <NodeDetailSheet
          nodeId={editingNodeId}
          onClose={() => setEditingNodeId(null)}
        />
      )}

      {/* Edge detail sheet — VLAN assignment + delete */}
      {editingEdgeId && (
        <EdgeDetailSheet
          edgeId={editingEdgeId}
          onClose={() => setEditingEdgeId(null)}
        />
      )}

      {/* ── Share Sheet (native) ───────────────────────────────────────── */}
      {shareVisible && (
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: '#00000066', justifyContent: 'flex-end' }}
          onPress={() => setShareVisible(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{ backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14, borderTopWidth: 1, borderColor: '#334155' }}
          >
            <View style={{ width: 36, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 4 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Share2 size={20} color="#3B82F6" />
              <Text style={{ color: '#F8FAFC', fontSize: 17, fontWeight: '800' }}>Share Topology</Text>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 13, lineHeight: 19 }}>
              Anyone with the link can view this topology in read-only mode.
            </Text>
            {/* Link box */}
            <View style={{ backgroundColor: '#0F172A', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ flex: 1, color: '#60A5FA', fontSize: 13, fontFamily: 'monospace' }} numberOfLines={1}>
                {`https://packetflow.app/view/${projectId}`}
              </Text>
            </View>
            <Pressable
              onPress={async () => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  await navigator.clipboard.writeText(`https://packetflow.app/view/${projectId}`);
                }
                setShareCopied(true);
                setShareVisible(false);
                setTimeout(() => setShareCopied(false), 2500);
              }}
              style={{ backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Copy Link</Text>
            </Pressable>
            <Pressable
              onPress={() => setShareVisible(false)}
              style={{ backgroundColor: '#334155', borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}
            >
              <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 14 }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}

      {/* ── Conflict Diff Modal ───────────────────────────────────────────── */}
      {conflictVisible && conflictRemote && (
        <Pressable
          style={{ position: 'absolute', inset: 0, backgroundColor: '#000000AA', justifyContent: 'center', alignItems: 'center', padding: 20 }}
          onPress={() => {}}
        >
          <View style={{ backgroundColor: '#0F172A', borderRadius: 22, width: '100%', overflow: 'hidden', borderWidth: 1, borderColor: '#F59E0B40' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#1C1A11', padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: '#F59E0B30' }}>
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#F59E0B20', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '800' }}>Sync Conflict Detected</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>Your offline edits differ from the server version</Text>
              </View>
            </View>

            {/* Diff side-by-side */}
            <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
              {/* Local */}
              <View style={{ flex: 1, backgroundColor: '#1E3A2F', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#22c55e33' }}>
                <Text style={{ color: '#4ade80', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Your Version</Text>
                <Text style={{ color: '#F1F5F9', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>{nodes.length}</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center' }}>devices</Text>
                <Text style={{ color: '#F1F5F9', fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 6 }}>{edges.length}</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center' }}>links</Text>
              </View>
              {/* Arrow */}
              <View style={{ justifyContent: 'center', alignItems: 'center', width: 24 }}>
                <Text style={{ color: '#F59E0B', fontSize: 18 }}>⇄</Text>
              </View>
              {/* Remote */}
              <View style={{ flex: 1, backgroundColor: '#1E2A3A', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#3b82f633' }}>
                <Text style={{ color: '#60A5FA', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Server Version</Text>
                <Text style={{ color: '#F1F5F9', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>{conflictRemote.nodes.length}</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center' }}>devices</Text>
                <Text style={{ color: '#F1F5F9', fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 6 }}>{conflictRemote.edges.length}</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center' }}>links</Text>
              </View>
            </View>

            {/* Changed devices list */}
            {(() => {
              const remoteIds = new Set(conflictRemote.nodes.map((n) => n.id));
              const localIds = new Set(nodes.map((n) => n.id));
              const added = nodes.filter((n) => !remoteIds.has(n.id)).slice(0, 4);
              const removed = conflictRemote.nodes.filter((n) => !localIds.has(n.id)).slice(0, 4);
              if (added.length === 0 && removed.length === 0) return null;
              return (
                <View style={{ marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1E293B', borderRadius: 12, padding: 12, gap: 4 }}>
                  {added.map((n) => (
                    <Text key={n.id} style={{ color: '#4ade80', fontSize: 12 }}>+ {n.label ?? n.type}</Text>
                  ))}
                  {removed.map((n) => (
                    <Text key={n.id} style={{ color: '#f87171', fontSize: 12 }}>− {n.label ?? n.type}</Text>
                  ))}
                </View>
              );
            })()}

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 8, padding: 16, paddingTop: 8 }}>
              <Pressable
                onPress={() => {
                  setConflictVisible(false);
                  setConflictRemote(null);
                }}
                style={{ flex: 1, backgroundColor: '#22c55e22', borderRadius: 13, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4ade8033' }}
              >
                <Text style={{ color: '#4ade80', fontWeight: '800', fontSize: 13 }}>Keep Mine</Text>
                <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>Offline edits</Text>
              </Pressable>
              {/* ── Merge Both — union dedup by id ── */}
              <Pressable
                onPress={() => {
                  if (!conflictRemote) return;
                  const mergedNodeMap = new Map<string, NetworkNode>();
                  // local takes precedence for same id
                  for (const n of conflictRemote.nodes) mergedNodeMap.set(n.id, n);
                  for (const n of nodes) mergedNodeMap.set(n.id, n);
                  const mergedEdgeMap = new Map<string, NetworkEdge>();
                  for (const e of conflictRemote.edges) mergedEdgeMap.set(e.id, e);
                  for (const e of edges) mergedEdgeMap.set(e.id, e);
                  const mergedNodes = Array.from(mergedNodeMap.values());
                  const mergedEdges = Array.from(mergedEdgeMap.values());
                  loadTopology(projectId ?? '', mergedNodes, mergedEdges);
                  setConflictVisible(false);
                  setConflictRemote(null);
                  addLine(`! Merged: ${mergedNodes.length} devices, ${mergedEdges.length} links`, 'system');
                }}
                style={{ flex: 1, backgroundColor: '#F59E0B22', borderRadius: 13, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B44' }}
              >
                <Text style={{ color: '#FBBF24', fontWeight: '800', fontSize: 13 }}>Merge Both</Text>
                <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>Combine all</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  loadTopology(projectId ?? '', conflictRemote.nodes, conflictRemote.edges);
                  setConflictVisible(false);
                  setConflictRemote(null);
                }}
                style={{ flex: 1, backgroundColor: '#2563EB22', borderRadius: 13, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f633' }}
              >
                <Text style={{ color: '#60A5FA', fontWeight: '800', fontSize: 13 }}>Use Server</Text>
                <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>Discard local</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    </View>
  );
}
