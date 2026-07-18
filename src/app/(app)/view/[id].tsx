// Read-only topology viewer — share link destination.
// No editing, no auth wall; anyone with the link can view.
import { fetchProjectById } from '@/db/api';
import { CABLE_COLORS } from '@/lib/constants';
import { DeviceIcon, getDeviceColor } from '@/components/DeviceIcon';
import type { NetworkEdge, NetworkNode } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Eye, Lock, Share2, ZoomIn, ZoomOut } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

const NODE_SIZE = 52;
const CANVAS_SIZE = 3200;
const HALF = NODE_SIZE / 2;

// ─── Edge renderer ────────────────────────────────────────────────────────────
function ViewEdge({ edge, nodes }: { edge: NetworkEdge; nodes: NetworkNode[] }) {
  const src = nodes.find((n) => n.id === edge.source);
  const tgt = nodes.find((n) => n.id === edge.target);
  if (!src || !tgt) return null;
  const x1 = src.x + HALF, y1 = src.y + HALF;
  const x2 = tgt.x + HALF, y2 = tgt.y + HALF;
  const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
  const ctrl = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 0.35;
  const d = `M ${x1} ${y1} Q ${midX} ${midY - ctrl} ${x2} ${y2}`;
  const color = CABLE_COLORS[edge.cable_type] ?? '#3B82F6';
  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      pointerEvents="none"
    >
      <Path d={d} stroke={color} strokeWidth={2} fill="none" opacity={0.8} />
    </Svg>
  );
}

// ─── Node renderer ────────────────────────────────────────────────────────────
function ViewNode({ node }: { node: NetworkNode }) {
  const color = getDeviceColor(node.type);
  return (
    <View
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: NODE_SIZE,
        height: NODE_SIZE,
        borderRadius: 14,
        backgroundColor: color + '22',
        borderWidth: 1.5,
        borderColor: color + '55',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DeviceIcon type={node.type} size={30} bgColor="transparent" />
      <View
        style={{
          position: 'absolute',
          top: NODE_SIZE + 4,
          left: '50%',
          transform: [{ translateX: -32 }],
          width: 64,
          alignItems: 'center',
        }}
      >
        <View style={{ backgroundColor: 'rgba(11,18,32,0.8)', borderRadius: 5, paddingHorizontal: 4, paddingVertical: 2 }}>
          <Text style={{ fontSize: 9, color: '#F1F5F9', fontWeight: '600', textAlign: 'center' }} numberOfLines={1}>
            {node.hostname ?? node.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function ViewTopologyScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const [nodes, setNodes]           = useState<NetworkNode[]>([]);
  const [edges, setEdges]           = useState<NetworkEdge[]>([]);
  const [projectName, setProjectName] = useState('Topology');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [updatedAt, setUpdatedAt]   = useState<string | null>(null);

  // Pan / zoom
  const scale   = useSharedValue(0.5);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const savedScale = useSharedValue(0.5);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  useEffect(() => {
    if (!projectId) { setError('No project ID'); setLoading(false); return; }
    fetchProjectById(projectId)
      .then((proj) => {
        if (!proj) throw new Error('Project not found');
        setProjectName(proj.name);
        setNodes((proj.topology_data as any)?.nodes ?? []);
        setEdges((proj.topology_data as any)?.edges ?? []);
        setUpdatedAt(proj.updated_at ? new Date(proj.updated_at).toLocaleString() : null);
      })
      .catch((e) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [projectId]);

  const pinch = Gesture.Pinch()
    .onStart(() => { savedScale.value = scale.value; })
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 0.15), 3);
    });

  const pan = Gesture.Pan()
    .minPointers(1).maxPointers(1)
    .onStart(() => { savedX.value = offsetX.value; savedY.value = offsetY.value; })
    .onUpdate((e) => {
      offsetX.value = savedX.value + e.translationX;
      offsetY.value = savedY.value + e.translationY;
    });

  const combined = Gesture.Simultaneous(pinch, pan);

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
    ],
  }));

  const handleZoomIn = useCallback(() => {
    scale.value = withSpring(Math.min(scale.value * 1.3, 3));
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    scale.value = withSpring(Math.max(scale.value / 1.3, 0.15));
  }, [scale]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#060D1A' }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16,
          backgroundColor: '#0A1628',
          borderBottomWidth: 1, borderColor: '#1E293B',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={18} color="#94A3B8" />
        </Pressable>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '800' }} numberOfLines={1}>
            {projectName}
          </Text>
          {updatedAt && (
            <Text style={{ color: '#475569', fontSize: 11 }}>Last updated {updatedAt}</Text>
          )}
        </View>
        {/* Read-only badge */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: '#1E293B', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
            borderWidth: 1, borderColor: '#334155',
          }}
        >
          <Lock size={11} color="#64748B" />
          <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700' }}>Read-only</Text>
        </View>
      </View>

      {/* Stats bar */}
      {!loading && !error && (
        <View style={{
          flexDirection: 'row', gap: 0, backgroundColor: '#0A1628',
          borderBottomWidth: 1, borderColor: '#1E293B',
        }}>
          {[
            { label: 'Devices', value: nodes.length },
            { label: 'Links', value: edges.length },
            { label: 'Types', value: new Set(nodes.map((n) => n.type)).size },
          ].map((s, i) => (
            <View key={s.label} style={{
              flex: 1, alignItems: 'center', paddingVertical: 8,
              borderRightWidth: i < 2 ? 1 : 0, borderColor: '#1E293B',
            }}>
              <Text style={{ color: '#F1F5F9', fontSize: 16, fontWeight: '800' }}>{s.value}</Text>
              <Text style={{ color: '#475569', fontSize: 10, fontWeight: '600' }}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Canvas area */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ color: '#475569', fontSize: 14 }}>Loading topology…</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 }}>
          <Eye size={40} color="#475569" />
          <Text style={{ color: '#F87171', fontSize: 15, fontWeight: '700', textAlign: 'center' }}>{error}</Text>
          <Text style={{ color: '#475569', fontSize: 13, textAlign: 'center' }}>
            This topology may not exist or may have been deleted.
          </Text>
        </View>
      ) : nodes.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Share2 size={36} color="#334155" />
          <Text style={{ color: '#475569', fontSize: 14 }}>This topology is empty.</Text>
        </View>
      ) : (
        <GestureDetector gesture={combined}>
          <Animated.View style={{ flex: 1, overflow: 'hidden' }}>
            <Animated.View style={[{ width: CANVAS_SIZE, height: CANVAS_SIZE }, canvasStyle]}>
              {/* Edges first */}
              {edges.map((e) => (
                <ViewEdge key={e.id} edge={e} nodes={nodes} />
              ))}
              {/* Nodes on top */}
              {nodes.map((n) => (
                <ViewNode key={n.id} node={n} />
              ))}
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      )}

      {/* Zoom controls */}
      {!loading && !error && nodes.length > 0 && (
        <View style={{ position: 'absolute', bottom: 40, right: 16, gap: 8 }}>
          <Pressable
            onPress={handleZoomIn}
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' }}
          >
            <ZoomIn size={18} color="#94A3B8" />
          </Pressable>
          <Pressable
            onPress={handleZoomOut}
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' }}
          >
            <ZoomOut size={18} color="#94A3B8" />
          </Pressable>
        </View>
      )}
    </GestureHandlerRootView>
  );
}
