import { BookmarkPlus, ChevronDown, ChevronRight, Layers, LayoutTemplate, Link as LinkIcon, Search, Star, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { DeviceIcon, getDeviceColor } from '@/components/DeviceIcon';
import { DEVICE_CATALOG, DEVICE_CATEGORIES, TOPOLOGY_TEMPLATES } from '@/lib/constants';
import { useCanvasStore } from '@/store/useCanvasStore';
import type { DeviceType } from '@/types';

interface DeviceDrawerProps {
  onClose: () => void;
  onAddDevice: (type: DeviceType) => void;
  onStartConnect: () => void;
}

type Tab = 'devices' | 'templates';

export function DeviceDrawer({ onClose, onAddDevice, onStartConnect }: DeviceDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('devices');
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Routers', 'Switches', 'End Devices'])
  );
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');

  const loadTemplate = useCanvasStore((s) => s.loadTemplate);
  const saveCanvasAsTemplate = useCanvasStore((s) => s.saveCanvasAsTemplate);
  const deleteCustomTemplate = useCanvasStore((s) => s.deleteCustomTemplate);
  const customTemplates = useCanvasStore((s) => s.customTemplates);
  const nodeCount = useCanvasStore((s) => s.nodes.length);
  const { panX, panY, zoom } = useCanvasStore();

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
      return next;
    });
  };

  const filtered = search.trim()
    ? DEVICE_CATALOG.filter(
        (d) =>
          d.label.toLowerCase().includes(search.toLowerCase()) ||
          d.description.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  // Canvas center (approx) for template placement
  const renderDeviceItem = (device: (typeof DEVICE_CATALOG)[0]) => {
    const color = getDeviceColor(device.type);
    return (
      <Pressable
        key={device.type}
        onPress={() => onAddDevice(device.type)}
        className="active:opacity-60"
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          paddingHorizontal: 16, paddingVertical: 11,
          marginHorizontal: 8, marginVertical: 2,
          backgroundColor: '#0D1829',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#1E2D45',
        }}
      >
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: `${color}18`,
          borderWidth: 1.5,
          borderColor: `${color}30`,
        }}>
          <DeviceIcon type={device.type} size={32} bgColor="transparent" color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#F1F5F9', fontSize: 14, fontWeight: '700', marginBottom: 2 }}>
            {device.label}
          </Text>
          <Text style={{ color: '#64748B', fontSize: 12 }}>
            {device.description}
          </Text>
        </View>
        <View style={{
          width: 26, height: 26, borderRadius: 13,
          backgroundColor: `${color}20`,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 1,
          borderColor: `${color}40`,
        }}>
          <Text style={{ color, fontSize: 18, lineHeight: 22, fontWeight: '800' }}>+</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: '#0D1829',
        borderTopLeftRadius: 26, borderTopRightRadius: 26,
        borderWidth: 1, borderColor: '#1E2D45',
        maxHeight: '75%',
        shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 24, shadowOffset: { width: 0, height: -6 },
      }}
    >
      {/* Handle */}
      <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#1E293B' }} />
      </View>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Layers size={18} color="#3B82F6" />
          <Text style={{ color: '#F8FAFC', fontSize: 17, fontWeight: '800' }}>Device Library</Text>
        </View>
        <Pressable
          onPress={onClose}
          className="active:opacity-60"
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={15} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Tab switcher */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#111827', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#1E293B' }}>
        {(['devices', 'templates'] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="active:opacity-80"
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 9,
              backgroundColor: activeTab === tab ? '#1E3A5F' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: '700',
              color: activeTab === tab ? '#60A5FA' : '#475569',
              textTransform: 'capitalize',
            }}>
              {tab === 'devices' ? '⚙  Devices' : '⬡  Templates'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'devices' ? (
        <>
          {/* Connect tool */}
          <Pressable
            onPress={onStartConnect}
            className="active:opacity-70"
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              marginHorizontal: 16, marginBottom: 10,
              paddingHorizontal: 14, paddingVertical: 11,
              backgroundColor: 'rgba(34,211,238,0.07)',
              borderWidth: 1, borderColor: 'rgba(34,211,238,0.3)',
              borderRadius: 14,
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(34,211,238,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <LinkIcon size={17} color="#22D3EE" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#22D3EE', fontWeight: '700', fontSize: 14 }}>Connection Tool</Text>
              <Text style={{ color: '#64748B', fontSize: 12, marginTop: 1 }}>Tap two devices to connect them</Text>
            </View>
          </Pressable>

          {/* Search */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#1E293B' }}>
            <Search size={14} color="#475569" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search devices..."
              placeholderTextColor="#475569"
              autoCapitalize="none"
              style={{ flex: 1, paddingVertical: 10, color: '#F1F5F9', fontSize: 14 }}
            />
          </View>

          {/* Device list */}
          <FlatList
            data={filtered ?? []}
            keyExtractor={(item) => item.type}
            renderItem={({ item }) => renderDeviceItem(item)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 28 }}
            ListHeaderComponent={
              !filtered ? (
                <>
                  {DEVICE_CATEGORIES.map((cat) => (
                    <View key={cat.label}>
                      <Pressable
                        onPress={() => toggleCategory(cat.label)}
                        className="active:opacity-70"
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 }}
                      >
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                          {cat.label}
                        </Text>
                        {expandedCategories.has(cat.label)
                          ? <ChevronDown size={14} color="#475569" />
                          : <ChevronRight size={14} color="#475569" />}
                      </Pressable>
                      {expandedCategories.has(cat.label) &&
                        DEVICE_CATALOG.filter((d) => cat.types.includes(d.type)).map(renderDeviceItem)}
                    </View>
                  ))}
                </>
              ) : null
            }
          />
        </>
      ) : (
        /* Templates tab */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}>
          {/* Save current canvas as template */}
          <Pressable
            onPress={() => {
              setSaveName('');
              setSaveDesc('');
              setSaveModalVisible(true);
            }}
            disabled={nodeCount === 0}
            style={{
              backgroundColor: nodeCount === 0 ? '#1E293B' : '#1E3A5F',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: nodeCount === 0 ? '#334155' : '#3B82F660',
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              opacity: nodeCount === 0 ? 0.5 : 1,
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#3B82F620', alignItems: 'center', justifyContent: 'center' }}>
              <BookmarkPlus size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#F1F5F9', fontSize: 14, fontWeight: '700' }}>Save Canvas as Template</Text>
              <Text style={{ color: '#64748B', fontSize: 11, marginTop: 1 }}>
                {nodeCount === 0 ? 'Add devices to the canvas first' : `${nodeCount} device${nodeCount !== 1 ? 's' : ''} on canvas`}
              </Text>
            </View>
          </Pressable>

          {/* Custom templates */}
          {customTemplates.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Star size={13} color="#8B5CF6" />
                <Text style={{ color: '#8B5CF6', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>MY TEMPLATES</Text>
              </View>
              {customTemplates.map((tmpl) => (
                <View
                  key={tmpl.id}
                  style={{
                    backgroundColor: '#1A1030',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#8B5CF630',
                    padding: 14,
                    gap: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: '#8B5CF618', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#8B5CF630' }}>
                      <LayoutTemplate size={18} color="#8B5CF6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#F1F5F9', fontSize: 14, fontWeight: '800' }}>{tmpl.name}</Text>
                      <Text style={{ color: '#64748B', fontSize: 11, marginTop: 1 }}>{tmpl.description}</Text>
                    </View>
                    <Pressable
                      onPress={() => deleteCustomTemplate(tmpl.id)}
                      hitSlop={8}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={15} color="#EF4444" />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                    {tmpl.tags.slice(0, 4).map((tag) => (
                      <View key={tag} style={{ backgroundColor: '#8B5CF615', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: '#8B5CF625' }}>
                        <Text style={{ color: '#A78BFA', fontSize: 10, fontWeight: '600' }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Pressable
                    onPress={() => {
                      const cx = (-panX / zoom) + 200;
                      const cy = (-panY / zoom) + 200;
                      loadTemplate(tmpl.id, cx, cy);
                      onClose();
                    }}
                    style={{ backgroundColor: '#8B5CF6', borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 2 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>Load Template</Text>
                  </Pressable>
                </View>
              ))}
            </>
          )}

          {/* Built-in templates */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: customTemplates.length > 0 ? 4 : 0 }}>
            <Layers size={13} color="#64748B" />
            <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>BUILT-IN TEMPLATES</Text>
          </View>
          {TOPOLOGY_TEMPLATES.map((tmpl) => (
            <Pressable
              key={tmpl.id}
              onPress={() => {
                const cx = (-panX / zoom) + 200;
                const cy = (-panY / zoom) + 200;
                loadTemplate(tmpl.id, cx, cy);
                onClose();
              }}
              className="active:opacity-70"
              style={{
                backgroundColor: '#111827',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: `${tmpl.color}30`,
                padding: 16,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${tmpl.color}18`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${tmpl.color}30` }}>
                  <LayoutTemplate size={20} color={tmpl.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#F1F5F9', fontSize: 15, fontWeight: '800' }}>{tmpl.name}</Text>
                  <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{tmpl.description}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {tmpl.tags.map((tag) => (
                  <View key={tag} style={{ backgroundColor: `${tmpl.color}15`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: `${tmpl.color}25` }}>
                    <Text style={{ color: tmpl.color, fontSize: 11, fontWeight: '600' }}>{tag}</Text>
                  </View>
                ))}
              </View>
              <View style={{ backgroundColor: tmpl.color, borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 2 }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>Load Template</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Save-as-template modal */}
      <Modal
        visible={saveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center', padding: 24 }}
          onPress={() => setSaveModalVisible(false)}
        >
          <Pressable
            style={{ backgroundColor: '#1E293B', borderRadius: 20, padding: 24, width: '100%', gap: 14, borderWidth: 1, borderColor: '#334155' }}
            onPress={() => {}}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <BookmarkPlus size={20} color="#8B5CF6" />
              <Text style={{ color: '#F1F5F9', fontSize: 17, fontWeight: '800', flex: 1 }}>Save as Template</Text>
              <Pressable onPress={() => setSaveModalVisible(false)} hitSlop={8}>
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>Template Name *</Text>
              <TextInput
                value={saveName}
                onChangeText={setSaveName}
                placeholder="e.g. Office Network"
                placeholderTextColor="#475569"
                style={{ backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 1, borderColor: '#334155', color: '#F1F5F9', padding: 12, fontSize: 14 }}
                autoFocus
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600' }}>Description (optional)</Text>
              <TextInput
                value={saveDesc}
                onChangeText={setSaveDesc}
                placeholder="Brief description of this topology"
                placeholderTextColor="#475569"
                style={{ backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 1, borderColor: '#334155', color: '#F1F5F9', padding: 12, fontSize: 14 }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={() => setSaveModalVisible(false)}
                style={{ flex: 1, backgroundColor: '#1E293B', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}
              >
                <Text style={{ color: '#94A3B8', fontWeight: '700', fontSize: 14 }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const name = saveName.trim();
                  if (!name) return;
                  saveCanvasAsTemplate(name, saveDesc.trim());
                  setSaveModalVisible(false);
                  setSaveName('');
                  setSaveDesc('');
                }}
                disabled={!saveName.trim()}
                style={{ flex: 1, backgroundColor: saveName.trim() ? '#8B5CF6' : '#4C3880', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Save Template</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Animated.View>
  );
}
