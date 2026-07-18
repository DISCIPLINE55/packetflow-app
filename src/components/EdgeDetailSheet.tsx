// Edge detail sheet — shown when a single edge is selected.
// Lets the user set a VLAN ID (1–4094) and remove the link.
import { Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { CABLE_COLORS, CABLE_LABELS } from '@/lib/constants';
import { useCanvasStore } from '@/store/useCanvasStore';

interface EdgeDetailSheetProps {
  edgeId: string;
  onClose: () => void;
}

const PRESET_VLANS = [1, 10, 20, 30, 100, 200];

export function EdgeDetailSheet({ edgeId, onClose }: EdgeDetailSheetProps) {
  const { edges, updateEdge, removeEdge, clearSelection } = useCanvasStore();
  const edge = edges.find((e) => e.id === edgeId);

  const [vlanInput, setVlanInput] = useState(
    edge?.vlan_id !== undefined ? String(edge.vlan_id) : '',
  );

  if (!edge) return null;

  const cableColor = (CABLE_COLORS as Record<string, string>)[edge.cable_type] ?? '#3B82F6';
  const cableLabel = (CABLE_LABELS as Record<string, string>)[edge.cable_type] ?? edge.cable_type;

  const handleSaveVlan = () => {
    const n = parseInt(vlanInput, 10);
    if (vlanInput === '') {
      updateEdge(edgeId, { vlan_id: undefined });
    } else if (!Number.isNaN(n) && n >= 1 && n <= 4094) {
      updateEdge(edgeId, { vlan_id: n });
    }
    onClose();
  };

  const handleDelete = () => {
    removeEdge(edgeId);
    clearSelection();
    onClose();
  };

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: '#0D1829',
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        borderWidth: 1, borderColor: '#1E2D45',
        padding: 20, gap: 16,
        shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: -4 },
      }}
    >
      {/* Handle + header */}
      <View style={{ alignItems: 'center', marginBottom: -8 }}>
        <View style={{ width: 36, height: 4, backgroundColor: '#1E293B', borderRadius: 2 }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {/* Cable color stripe */}
        <View style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: cableColor }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#F8FAFC', fontSize: 16, fontWeight: '800' }}>Link Properties</Text>
          <Text style={{ color: '#64748B', fontSize: 12, marginTop: 1 }}>{cableLabel}</Text>
        </View>
        <Pressable
          onPress={onClose}
          style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={15} color="#64748B" />
        </Pressable>
      </View>

      {/* VLAN section */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
          VLAN ID (1–4094)
        </Text>
        {/* Preset chips */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <Pressable
            onPress={() => setVlanInput('')}
            style={{
              paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
              backgroundColor: vlanInput === '' ? '#334155' : '#1E293B',
              borderWidth: 1, borderColor: vlanInput === '' ? '#64748B' : '#1E293B',
            }}
          >
            <Text style={{ color: vlanInput === '' ? '#F1F5F9' : '#64748B', fontSize: 12, fontWeight: '600' }}>
              Trunk / None
            </Text>
          </Pressable>
          {PRESET_VLANS.map((v) => (
            <Pressable
              key={v}
              onPress={() => setVlanInput(String(v))}
              style={{
                paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                backgroundColor: vlanInput === String(v) ? '#312E81' : '#1E293B',
                borderWidth: 1, borderColor: vlanInput === String(v) ? '#6366F1' : '#1E293B',
              }}
            >
              <Text style={{ color: vlanInput === String(v) ? '#A5B4FC' : '#64748B', fontSize: 12, fontWeight: '700' }}>
                V{v}
              </Text>
            </Pressable>
          ))}
        </View>
        {/* Free-form input */}
        <TextInput
          value={vlanInput}
          onChangeText={setVlanInput}
          keyboardType="number-pad"
          placeholder="Custom VLAN (e.g. 42)"
          placeholderTextColor="#334155"
          style={{
            backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1E293B',
            borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
            color: '#A5B4FC', fontSize: 14, fontFamily: 'monospace',
          }}
          returnKeyType="done"
          onSubmitEditing={handleSaveVlan}
        />
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={handleDelete}
          style={{
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: '#F87171' + '18', borderWidth: 1, borderColor: '#F87171' + '33',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Trash2 size={18} color="#F87171" />
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 14 }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSaveVlan}
          style={{ flex: 1, height: 44, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Save</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
