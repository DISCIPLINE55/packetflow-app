import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  accentColor: string;
}

// Slide 1: Star topology — Router at center, 4 devices branching out
function TopologyIllustration() {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      <Defs>
        <LinearGradient id="gBlue" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#2563EB" />
          <Stop offset="1" stopColor="#06B6D4" />
        </LinearGradient>
      </Defs>
      {/* Connections from center */}
      <Line x1={110} y1={80} x2={55} y2={40} stroke="#1E3A5F" strokeWidth={2} strokeDasharray="4,3" />
      <Line x1={110} y1={80} x2={165} y2={40} stroke="#1E3A5F" strokeWidth={2} strokeDasharray="4,3" />
      <Line x1={110} y1={80} x2={50} y2={148} stroke="#1E3A5F" strokeWidth={2} strokeDasharray="4,3" />
      <Line x1={110} y1={80} x2={170} y2={148} stroke="#1E3A5F" strokeWidth={2} strokeDasharray="4,3" />
      {/* Data flow dots */}
      <Circle cx={82} cy={60} r={3} fill="#3B82F6" opacity={0.8} />
      <Circle cx={138} cy={60} r={3} fill="#06B6D4" opacity={0.8} />
      <Circle cx={80} cy={114} r={3} fill="#3B82F6" opacity={0.8} />
      <Circle cx={140} cy={114} r={3} fill="#06B6D4" opacity={0.8} />
      {/* Center router */}
      <Circle cx={110} cy={80} r={26} fill="#111827" stroke="url(#gBlue)" strokeWidth={2.5} />
      <Circle cx={110} cy={80} r={14} fill="none" stroke="#3B82F6" strokeWidth={1.5} />
      <Circle cx={110} cy={80} r={5} fill="#3B82F6" />
      <Line x1={110} y1={54} x2={110} y2={66} stroke="#3B82F6" strokeWidth={1.5} />
      <Line x1={110} y1={94} x2={110} y2={106} stroke="#3B82F6" strokeWidth={1.5} />
      <Line x1={84} y1={80} x2={96} y2={80} stroke="#3B82F6" strokeWidth={1.5} />
      <Line x1={124} y1={80} x2={136} y2={80} stroke="#3B82F6" strokeWidth={1.5} />
      {/* Top-left switch */}
      <Rect x={32} y={20} width={46} height={28} rx={5} fill="#111827" stroke="#8B5CF6" strokeWidth={1.8} />
      <Rect x={39} y={28} width={6} height={12} rx={1.5} fill="#8B5CF6" />
      <Rect x={49} y={28} width={6} height={12} rx={1.5} fill="#8B5CF6" />
      <Rect x={59} y={28} width={6} height={12} rx={1.5} fill="#8B5CF6" opacity={0.5} />
      {/* Top-right switch */}
      <Rect x={142} y={20} width={46} height={28} rx={5} fill="#111827" stroke="#8B5CF6" strokeWidth={1.8} />
      <Rect x={149} y={28} width={6} height={12} rx={1.5} fill="#8B5CF6" />
      <Rect x={159} y={28} width={6} height={12} rx={1.5} fill="#8B5CF6" />
      <Rect x={169} y={28} width={6} height={12} rx={1.5} fill="#8B5CF6" opacity={0.5} />
      {/* Bottom-left PC */}
      <Rect x={26} y={134} width={48} height={34} rx={4} fill="#111827" stroke="#10B981" strokeWidth={1.8} />
      <Rect x={32} y={139} width={36} height={22} rx={2} fill="#10B981" opacity={0.15} />
      <Rect x={36} y={141} width={28} height={16} rx={1} fill="#10B981" opacity={0.2} />
      <Rect x={38} y={170} width={18} height={4} rx={1} fill="#10B981" opacity={0.4} />
      {/* Bottom-right firewall */}
      <Path d="M170 132 L194 140 L194 158 Q194 168 170 172 Q146 168 146 158 L146 140 Z" fill="#111827" stroke="#EF4444" strokeWidth={1.8} />
      <Path d="M170 142 Q174 146 172 152 Q170 148 168 150 Q171 153 170 160 Q166 156 168 152 Q164 150 166 147 Q168 150 170 150 Q169 146 170 142Z" fill="#EF4444" opacity={0.8} />
      {/* Labels */}
      <SvgText x={110} y={115} textAnchor="middle" fill="#3B82F6" fontSize={9} fontWeight="700">ROUTER</SvgText>
      <SvgText x={55} y={57} textAnchor="middle" fill="#8B5CF6" fontSize={8}>SW-1</SvgText>
      <SvgText x={165} y={57} textAnchor="middle" fill="#8B5CF6" fontSize={8}>SW-2</SvgText>
      <SvgText x={50} y={178} textAnchor="middle" fill="#10B981" fontSize={8}>PC-1</SvgText>
      <SvgText x={170} y={183} textAnchor="middle" fill="#EF4444" fontSize={8}>FW-1</SvgText>
    </Svg>
  );
}

// Slide 2: Drag-and-drop — device palette sidebar + canvas with nodes being dragged
function DragDropIllustration() {
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      {/* Sidebar panel */}
      <Rect x={8} y={10} width={60} height={180} rx={8} fill="#0D1829" stroke="#1E293B" strokeWidth={1.5} />
      <SvgText x={38} y={28} textAnchor="middle" fill="#475569" fontSize={8} fontWeight="700">DEVICES</SvgText>
      {/* Device items in sidebar */}
      {[
        { y: 36, color: '#3B82F6', label: 'Router' },
        { y: 64, color: '#8B5CF6', label: 'Switch' },
        { y: 92, color: '#EF4444', label: 'Firewall' },
        { y: 120, color: '#10B981', label: 'PC' },
        { y: 148, color: '#F59E0B', label: 'Server' },
      ].map(({ y, color, label }) => (
        <React.Fragment key={y}>
          <Rect x={14} y={y} width={48} height={22} rx={5} fill="#111827" stroke={color} strokeWidth={1} opacity={0.85} />
          <Circle cx={26} cy={y + 11} r={6} fill={color} opacity={0.3} />
          <Circle cx={26} cy={y + 11} r={3} fill={color} />
          <SvgText x={52} y={y + 14} textAnchor="middle" fill="#94A3B8" fontSize={7.5}>{label}</SvgText>
        </React.Fragment>
      ))}
      {/* Canvas area */}
      <Rect x={78} y={10} width={134} height={180} rx={8} fill="#0B1220" stroke="#1E293B" strokeWidth={1.5} />
      {/* Grid dots */}
      {[0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2, 3, 4, 5, 6].map((j) => (
        <Circle key={`${i}-${j}`} cx={90 + j * 18} cy={22 + i * 28} r={1} fill="#1E293B" />
      )))}
      {/* Connection line on canvas */}
      <Line x1={125} y1={75} x2={165} y2={130} stroke="#22D3EE" strokeWidth={1.5} strokeDasharray="5,3" />
      {/* Node 1 — router being placed (glowing) */}
      <Circle cx={125} cy={75} r={20} fill="#0D1829" stroke="#3B82F6" strokeWidth={2.5} />
      <Circle cx={125} cy={75} r={20} fill="none" stroke="#3B82F6" strokeWidth={8} opacity={0.1} />
      <Circle cx={125} cy={75} r={10} fill="none" stroke="#3B82F6" strokeWidth={1.5} />
      <Circle cx={125} cy={75} r={4} fill="#3B82F6" />
      <Line x1={125} y1={56} x2={125} y2={65} stroke="#3B82F6" strokeWidth={1.5} />
      <Line x1={125} y1={85} x2={125} y2={94} stroke="#3B82F6" strokeWidth={1.5} />
      <Line x1={106} y1={75} x2={115} y2={75} stroke="#3B82F6" strokeWidth={1.5} />
      <Line x1={135} y1={75} x2={144} y2={75} stroke="#3B82F6" strokeWidth={1.5} />
      {/* Node 2 — switch */}
      <Rect x={145} y={114} width={42} height={26} rx={5} fill="#0D1829" stroke="#8B5CF6" strokeWidth={2} />
      <Rect x={151} y={120} width={6} height={14} rx={1.5} fill="#8B5CF6" />
      <Rect x={161} y={120} width={6} height={14} rx={1.5} fill="#8B5CF6" />
      <Rect x={171} y={120} width={6} height={14} rx={1.5} fill="#8B5CF6" opacity={0.5} />
      {/* Drag arrow */}
      <Path d="M68 95 L78 80 L80 88 L85 75 L90 86 L88 93 L78 88 Z" fill="#22D3EE" opacity={0.7} />
    </Svg>
  );
}

// Slide 3: Terminal/simulate — CLI window with ping output
function SimulateIllustration() {
  const lines = [
    { text: '> enable', color: '#94A3B8' },
    { text: '# ping 192.168.1.2', color: '#F8FAFC' },
    { text: 'Sending 5 ICMP echoes...', color: '#64748B' },
    { text: '!!!!!', color: '#22C55E' },
    { text: 'Success rate 100%', color: '#22C55E' },
    { text: '# show ip route', color: '#F8FAFC' },
    { text: 'C 192.168.1.0/24', color: '#3B82F6' },
    { text: '■', color: '#22C55E' },
  ];
  return (
    <Svg width={220} height={200} viewBox="0 0 220 200">
      {/* Terminal window */}
      <Rect x={10} y={10} width={200} height={180} rx={10} fill="#0A0F1A" stroke="#1E293B" strokeWidth={1.5} />
      {/* Title bar */}
      <Rect x={10} y={10} width={200} height={28} rx={10} fill="#111827" />
      <Rect x={10} y={28} width={200} height={10} fill="#111827" />
      {/* Traffic light dots */}
      <Circle cx={28} cy={24} r={5} fill="#EF4444" opacity={0.9} />
      <Circle cx={44} cy={24} r={5} fill="#F59E0B" opacity={0.9} />
      <Circle cx={60} cy={24} r={5} fill="#22C55E" opacity={0.9} />
      {/* Title */}
      <SvgText x={110} y={28} textAnchor="middle" fill="#475569" fontSize={9} fontWeight="700">TERMINAL</SvgText>
      {/* Terminal lines */}
      {lines.map(({ text, color }, i) => (
        <SvgText key={i} x={20} y={58 + i * 16} fill={color} fontSize={10} fontFamily="monospace">
          {text}
        </SvgText>
      ))}
      {/* Network mini-map */}
      <Rect x={140} y={100} width={62} height={52} rx={6} fill="#111827" stroke="#1E293B" strokeWidth={1} />
      <Circle cx={158} cy={118} r={6} fill="none" stroke="#3B82F6" strokeWidth={1.5} />
      <Circle cx={158} cy={118} r={2} fill="#3B82F6" />
      <Circle cx={174} cy={130} r={5} fill="none" stroke="#8B5CF6" strokeWidth={1.5} />
      <Rect x={183} y={112} width={10} height={7} rx={1.5} fill="none" stroke="#22C55E" strokeWidth={1.2} />
      <Line x1={158} y1={124} x2={169} y2={130} stroke="#22D3EE" strokeWidth={1} />
      <Line x1={158} y1={124} x2={185} y2={117} stroke="#22D3EE" strokeWidth={1} />
    </Svg>
  );
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Design Network Topologies',
    subtitle: 'Build professional network diagrams with routers, switches, firewalls and more.',
    illustration: <TopologyIllustration />,
    accentColor: '#3B82F6',
  },
  {
    id: '2',
    title: 'Drag & Drop Devices',
    subtitle: 'Drag devices onto your canvas, connect them with cables and configure every detail.',
    illustration: <DragDropIllustration />,
    accentColor: '#06B6D4',
  },
  {
    id: '3',
    title: 'Simulate Your Network',
    subtitle: 'Run CLI commands, ping devices and watch your topology come to life.',
    illustration: <SimulateIllustration />,
    accentColor: '#22C55E',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goToNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex((i) => i + 1);
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  const skip = () => router.replace('/(auth)/sign-in');
  const accent = SLIDES[activeIndex].accentColor;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1220' }}>
      <StatusBar style="light" />

      {/* Skip */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 }}>
        <Pressable onPress={skip} className="active:opacity-50">
          <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '600' }}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: 'center', paddingHorizontal: 32, paddingTop: 8 }}>
            {/* Illustration card */}
            <View style={{
              width: 240, height: 240,
              borderRadius: 28,
              backgroundColor: '#111827',
              borderWidth: 1.5,
              borderColor: `${item.accentColor}30`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 36,
              shadowColor: item.accentColor,
              shadowOpacity: 0.2,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 6 },
            }}>
              {item.illustration}
            </View>
            <Text style={{ color: '#F8FAFC', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12, letterSpacing: -0.3 }}>
              {item.title}
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 24 }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              height: 6,
              width: i === activeIndex ? 28 : 6,
              borderRadius: 3,
              backgroundColor: i === activeIndex ? accent : '#1E293B',
            }}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <Pressable
          onPress={goToNext}
          className="active:opacity-85"
          style={{
            borderRadius: 18,
            paddingVertical: 16,
            alignItems: 'center',
            backgroundColor: accent,
            shadowColor: accent,
            shadowOpacity: 0.4,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 5 },
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 }}>
            {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}


