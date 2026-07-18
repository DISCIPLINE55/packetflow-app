import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { CABLE_COLORS, CABLE_LABELS } from '@/lib/constants';
import type { CableType } from '@/types';

// All cable options with icon char, description, and OSI hint
const CABLE_OPTIONS: {
  type: CableType;
  icon: string;
  description: string;
  osi: string;
}[] = [
  { type: 'ethernet',   icon: '⚡', description: 'Cat5e/Cat6 — up to 10 Gbps',    osi: 'L1 / L2' },
  { type: 'fiber',      icon: '💡', description: 'Single/multi-mode — up to 100G', osi: 'L1' },
  { type: 'serial',     icon: '📡', description: 'T1/E1 WAN links, V.35',          osi: 'L1 / L2' },
  { type: 'console',    icon: '⌨️', description: 'Rollover / out-of-band mgmt',    osi: 'L1' },
  { type: 'crossover',  icon: '✕',  description: 'Direct host-to-host link',       osi: 'L1 / L2' },
  { type: 'coaxial',    icon: '〇', description: 'RG-6 / DOCSIS cable plant',      osi: 'L1' },
  { type: 'sfp',        icon: '◈',  description: 'SFP/SFP+/QSFP transceiver',    osi: 'L1' },
  { type: 'dac_cable',  icon: '⛓', description: 'Direct-attach copper twinax',   osi: 'L1' },
  { type: 'usb',        icon: '⊙',  description: 'USB-A/C console or power',      osi: 'L1' },
  { type: 'wireless',   icon: '📶', description: 'Wi-Fi 802.11 a/b/g/n/ac/ax',   osi: 'L1 / L2' },
];

interface CablePickerModalProps {
  visible: boolean;
  onPick: (cable: CableType) => void;
  onCancel: () => void;
}

export function CablePickerModal({ visible, onPick, onCancel }: CablePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}
        onPress={onCancel}
      >
        {/* Stop propagation so tapping the sheet doesn't close it */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View
            entering={SlideInDown.springify().damping(18)}
            exiting={SlideOutDown.duration(200)}
            style={{
              backgroundColor: '#0D1829',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: '#1E2D45',
              paddingBottom: 32,
              shadowColor: '#000',
              shadowOpacity: 0.6,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: -6 },
            }}
          >
            {/* Handle */}
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#1E293B' }} />
            </View>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14 }}>
              <View>
                <Text style={{ color: '#F8FAFC', fontSize: 17, fontWeight: '800' }}>Select Cable Type</Text>
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>Choose the link medium between the two devices</Text>
              </View>
              <Pressable
                onPress={onCancel}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Grid of cable options */}
            <View style={{ paddingHorizontal: 12, gap: 6 }}>
              {/* Two-column grid */}
              {Array.from({ length: Math.ceil(CABLE_OPTIONS.length / 2) }, (_, row) => (
                <View key={row} style={{ flexDirection: 'row', gap: 8 }}>
                  {CABLE_OPTIONS.slice(row * 2, row * 2 + 2).map((opt) => {
                    const color = CABLE_COLORS[opt.type] ?? '#3B82F6';
                    const label = CABLE_LABELS[opt.type] ?? opt.type;
                    return (
                      <Pressable
                        key={opt.type}
                        onPress={() => onPick(opt.type)}
                        className="active:opacity-70"
                        style={{
                          flex: 1,
                          backgroundColor: '#111827',
                          borderRadius: 14,
                          borderWidth: 1.5,
                          borderColor: `${color}35`,
                          padding: 12,
                          gap: 4,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View style={{
                            width: 32, height: 32, borderRadius: 10,
                            backgroundColor: `${color}18`,
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 1, borderColor: `${color}30`,
                          }}>
                            <Text style={{ fontSize: 16 }}>{opt.icon}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#F1F5F9', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                              {label}
                            </Text>
                            <Text style={{ color: color, fontSize: 10, fontWeight: '600', marginTop: 1 }}>
                              {opt.osi}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ color: '#64748B', fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                          {opt.description}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {/* Pad last row if odd count */}
                  {row * 2 + 2 > CABLE_OPTIONS.length && <View style={{ flex: 1 }} />}
                </View>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
