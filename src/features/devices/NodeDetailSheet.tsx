import { ChevronDown, Info, Plus, Wifi, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { DeviceIcon, getDeviceColor } from '@/components/DeviceIcon';
import { DEVICE_CATALOG } from '@/lib/constants';
import { useCanvasStore } from '@/store/useCanvasStore';
import type { DeviceType } from '@/types';

interface NodeDetailSheetProps {
  nodeId: string;
  onClose: () => void;
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' }}>
        {title}
      </Text>
      {count !== undefined && (
        <View style={{ backgroundColor: '#1E293B', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1 }}>
          <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }}>{count}</Text>
        </View>
      )}
    </View>
  );
}

const inputStyle = {
  backgroundColor: '#0D1829',
  borderWidth: 1,
  borderColor: '#1E293B',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  color: '#F8FAFC',
  fontSize: 14,
} as const;

export function NodeDetailSheet({ nodeId, onClose }: NodeDetailSheetProps) {
  const { nodes, updateNode } = useCanvasStore();
  const node = nodes.find((n) => n.id === nodeId);

  const [hostname, setHostname] = useState(node?.hostname ?? '');
  const [ipAddress, setIpAddress] = useState(node?.ip_address ?? '');
  const [subnetMask, setSubnetMask] = useState(node?.subnet_mask ?? '255.255.255.0');
  const [gateway, setGateway] = useState(node?.gateway ?? '');
  const [dns, setDns] = useState(node?.dns ?? '');
  const [description, setDescription] = useState(node?.description ?? '');

  if (!node) return null;
  const color = getDeviceColor(node.type);
  const catalog = DEVICE_CATALOG.find((d) => d.type === node.type);

  const handleSave = () => {
    updateNode(nodeId, { hostname, ip_address: ipAddress, subnet_mask: subnetMask, gateway, dns, description });
    onClose();
  };

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: '#0D1829',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        borderWidth: 1, borderColor: '#1E2D45',
        maxHeight: '85%',
        shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: -4 },
      }}
    >
      {/* Handle */}
      <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#1E293B' }} />
      </View>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E2D45' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}18`, borderWidth: 1, borderColor: `${color}30` }}>
            <DeviceIcon type={node.type} size={32} bgColor="transparent" color={color} />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={{ color: '#F8FAFC', fontWeight: '700', fontSize: 16 }}>{node.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#64748B', fontSize: 12 }}>{catalog?.description ?? node.type}</Text>
              {node.mac_address ? (
                <Text style={{ color: '#334155', fontSize: 11, fontFamily: 'monospace' }}>· {node.mac_address.slice(0, 8)}…</Text>
              ) : null}
            </View>
          </View>
        </View>
        <Pressable onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}>
          <X size={15} color="#94A3B8" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36, paddingTop: 16, gap: 20 }}>

        {/* Network Config */}
        <View style={{ gap: 12 }}>
          <SectionHeader title="Network Configuration" />

          {/* Hostname */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>Hostname</Text>
            <TextInput value={hostname} onChangeText={setHostname} placeholder="e.g. Router-1" placeholderTextColor="#334155" style={inputStyle} />
          </View>

          {/* IP + Subnet row */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>IP Address</Text>
              <TextInput value={ipAddress} onChangeText={setIpAddress} placeholder="192.168.1.1" placeholderTextColor="#334155" keyboardType="decimal-pad" style={inputStyle} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>Subnet Mask</Text>
              <TextInput value={subnetMask} onChangeText={setSubnetMask} placeholder="255.255.255.0" placeholderTextColor="#334155" keyboardType="decimal-pad" style={inputStyle} />
            </View>
          </View>

          {/* Gateway + DNS row */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>Default Gateway</Text>
              <TextInput value={gateway} onChangeText={setGateway} placeholder="192.168.1.254" placeholderTextColor="#334155" keyboardType="decimal-pad" style={inputStyle} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>DNS Server</Text>
              <TextInput value={dns} onChangeText={setDns} placeholder="8.8.8.8" placeholderTextColor="#334155" keyboardType="decimal-pad" style={inputStyle} />
            </View>
          </View>

          {/* Description */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '600' }}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description..."
              placeholderTextColor="#334155"
              multiline
              numberOfLines={2}
              style={{ ...inputStyle, height: 56, textAlignVertical: 'top' }}
            />
          </View>
        </View>

        {/* Interfaces */}
        <View style={{ gap: 10 }}>
          <SectionHeader title="Interfaces" count={node.interfaces.length} />
          {node.interfaces.map((iface) => (
            <View
              key={iface.id}
              style={{
                backgroundColor: '#111827',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: iface.status === 'up' ? '#16632E' : '#1E293B',
                paddingHorizontal: 14,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: iface.status === 'up' ? '#22C55E' : '#475569' }} />
                <View>
                  <Text style={{ color: '#F1F5F9', fontSize: 13, fontWeight: '600' }}>{iface.name}</Text>
                  {iface.ip_address ? (
                    <Text style={{ color: '#64748B', fontSize: 11, marginTop: 1 }}>{iface.ip_address}</Text>
                  ) : (
                    <Text style={{ color: '#334155', fontSize: 11, marginTop: 1 }}>No IP assigned</Text>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Wifi size={13} color={iface.status === 'up' ? '#22C55E' : '#475569'} />
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
                  backgroundColor: iface.status === 'up' ? 'rgba(34,197,94,0.12)' : 'rgba(71,85,105,0.3)',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: iface.status === 'up' ? '#22C55E' : '#64748B' }}>
                    {iface.status === 'up' ? 'UP' : 'DOWN'}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Add Interface */}
          <Pressable
            onPress={() => {}}
            className="active:opacity-60"
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingVertical: 11, borderRadius: 12,
              borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#06B6D4',
              backgroundColor: 'transparent',
            }}
          >
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#06B6D4', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={12} color="#fff" />
            </View>
            <Text style={{ color: '#06B6D4', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 }}>Add Interface</Text>
          </Pressable>
        </View>

        {/* MAC address info row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0B1220', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: '#1E293B' }}>
          <Info size={13} color="#475569" />
          <Text style={{ color: '#475569', fontSize: 12 }}>MAC: </Text>
          <Text style={{ color: '#64748B', fontSize: 12, fontFamily: 'monospace' }}>{node.mac_address || 'Auto-generated'}</Text>
        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          style={{
            backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 14,
            alignItems: 'center', marginTop: 4,
            shadowColor: '#2563EB', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}>Save Changes</Text>
        </Pressable>
      </ScrollView>
    </Animated.View>
  );
}
