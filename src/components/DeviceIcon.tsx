import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import type { DeviceType } from '@/types';

interface DeviceIconProps {
  type: DeviceType;
  size?: number;
  color?: string;
  bgColor?: string;
}

const iconMap: Record<DeviceType, (color: string, bg: string) => React.ReactNode> = {
  // ── Routers ──────────────────────────────────────────────────────────────
  router: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={19} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={10} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={4} fill={c} />
      <Line x1={20} y1={1} x2={20} y2={10} stroke={c} strokeWidth={1.5} />
      <Line x1={20} y1={30} x2={20} y2={39} stroke={c} strokeWidth={1.5} />
      <Line x1={1} y1={20} x2={10} y2={20} stroke={c} strokeWidth={1.5} />
      <Line x1={30} y1={20} x2={39} y2={20} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  core_router: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={19} fill={bg} stroke={c} strokeWidth={2} />
      <Circle cx={20} cy={20} r={12} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={5} fill={c} />
      <Line x1={20} y1={1} x2={20} y2={8} stroke={c} strokeWidth={2} />
      <Line x1={20} y1={32} x2={20} y2={39} stroke={c} strokeWidth={2} />
      <Line x1={1} y1={20} x2={8} y2={20} stroke={c} strokeWidth={2} />
      <Line x1={32} y1={20} x2={39} y2={20} stroke={c} strokeWidth={2} />
    </Svg>
  ),
  edge_router: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={18} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={9} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={3} fill={c} />
      <Line x1={20} y1={2} x2={20} y2={11} stroke={c} strokeWidth={1.5} />
      <Line x1={20} y1={29} x2={20} y2={38} stroke={c} strokeWidth={1.5} />
      <Line x1={2} y1={20} x2={11} y2={20} stroke={c} strokeWidth={1.5} />
      <Line x1={29} y1={20} x2={38} y2={20} stroke={c} strokeWidth={1.5} />
      <Path d="M34 6 L30 10" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  ),
  isr_router: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={10} width={32} height={20} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={7} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={3} fill={c} />
      <Line x1={20} y1={10} x2={20} y2={13} stroke={c} strokeWidth={1.5} />
      <Line x1={20} y1={27} x2={20} y2={30} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  asr_router: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={8} width={36} height={24} rx={5} fill={bg} stroke={c} strokeWidth={2} />
      <Circle cx={20} cy={20} r={8} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={3} fill={c} />
      <Line x1={20} y1={8} x2={20} y2={12} stroke={c} strokeWidth={2} />
      <Line x1={20} y1={28} x2={20} y2={32} stroke={c} strokeWidth={2} />
    </Svg>
  ),
  bgp_router: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={18} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={11} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={4} fill={c} />
      <Line x1={20} y1={2} x2={20} y2={9} stroke={c} strokeWidth={2} />
      <Line x1={20} y1={31} x2={20} y2={38} stroke={c} strokeWidth={2} />
      <Line x1={2} y1={20} x2={9} y2={20} stroke={c} strokeWidth={2} />
      <Line x1={31} y1={20} x2={38} y2={20} stroke={c} strokeWidth={2} />
      <SvgText x={14} y={24} fill={c} fontSize={7} fontWeight="bold">BGP</SvgText>
    </Svg>
  ),
  mpls_router: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={18} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={10} fill="none" stroke={c} strokeWidth={1.5} strokeDasharray="3,2" />
      <Circle cx={20} cy={20} r={4} fill={c} />
      <Line x1={20} y1={2} x2={20} y2={10} stroke={c} strokeWidth={1.5} />
      <Line x1={20} y1={30} x2={20} y2={38} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  virtual_router: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={4} width={32} height={32} rx={8} fill={bg} stroke={c} strokeWidth={1.5} strokeDasharray="4,2" />
      <Circle cx={20} cy={20} r={9} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={3} fill={c} />
    </Svg>
  ),
  // ── Switches / L2 ────────────────────────────────────────────────────────
  l2_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={12} width={36} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={7} y={17} width={4} height={6} rx={1} fill={c} />
      <Rect x={14} y={17} width={4} height={6} rx={1} fill={c} />
      <Rect x={21} y={17} width={4} height={6} rx={1} fill={c} />
      <Rect x={28} y={17} width={4} height={6} rx={1} fill={c} />
    </Svg>
  ),
  multilayer_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={11} width={36} height={18} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={7} y={16} width={4} height={7} rx={1} fill={c} />
      <Rect x={14} y={16} width={4} height={7} rx={1} fill={c} />
      <Rect x={21} y={16} width={4} height={7} rx={1} fill={c} />
      <Rect x={28} y={16} width={4} height={7} rx={1} fill={c} />
      <Path d="M6 9 L10 6 L14 9" stroke={c} strokeWidth={1.5} fill="none" />
    </Svg>
  ),
  l3_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={11} width={36} height={18} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={7} y={16} width={4} height={7} rx={1} fill={c} />
      <Rect x={14} y={16} width={4} height={7} rx={1} fill={c} />
      <Rect x={21} y={16} width={4} height={7} rx={1} fill={c} />
      <Rect x={28} y={16} width={4} height={7} rx={1} fill={c} />
      <Path d="M6 9 L10 6 L14 9" stroke={c} strokeWidth={1.5} fill="none" />
      <Circle cx={32} cy={8} r={3} fill={c} opacity={0.7} />
    </Svg>
  ),
  managed_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={12} width={36} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={6} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={12} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={18} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={24} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={30} y={17} width={3} height={6} rx={1} fill={c} />
      <Circle cx={35} cy={16} r={2} fill={c} opacity={0.7} />
    </Svg>
  ),
  poe_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={12} width={36} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={6} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={12} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={18} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={24} y={17} width={3} height={6} rx={1} fill={c} />
      <Path d="M32 14 L30 19 L33 19 L31 26" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </Svg>
  ),
  stackable_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={7} width={36} height={10} rx={3} fill={bg} stroke={c} strokeWidth={1.2} />
      <Rect x={2} y={19} width={36} height={10} rx={3} fill={bg} stroke={c} strokeWidth={1.2} />
      <Rect x={7} y={10} width={3} height={4} rx={1} fill={c} />
      <Rect x={13} y={10} width={3} height={4} rx={1} fill={c} />
      <Rect x={7} y={22} width={3} height={4} rx={1} fill={c} />
      <Rect x={13} y={22} width={3} height={4} rx={1} fill={c} />
      <Line x1={32} y1={17} x2={32} y2={19} stroke={c} strokeWidth={2} />
    </Svg>
  ),
  industrial_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={4} width={28} height={32} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={10} y={8} width={5} height={8} rx={1} fill={c} />
      <Rect x={18} y={8} width={5} height={8} rx={1} fill={c} />
      <Rect x={10} y={20} width={5} height={8} rx={1} fill={c} />
      <Rect x={18} y={20} width={5} height={8} rx={1} fill={c} />
    </Svg>
  ),
  access_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={14} width={36} height={12} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={6} y={18} width={2} height={4} rx={1} fill={c} />
      <Rect x={10} y={18} width={2} height={4} rx={1} fill={c} />
      <Rect x={14} y={18} width={2} height={4} rx={1} fill={c} />
      <Rect x={18} y={18} width={2} height={4} rx={1} fill={c} />
      <Rect x={22} y={18} width={2} height={4} rx={1} fill={c} />
      <Rect x={26} y={18} width={2} height={4} rx={1} fill={c} />
    </Svg>
  ),
  distribution_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={10} width={36} height={20} rx={4} fill={bg} stroke={c} strokeWidth={2} />
      <Rect x={7} y={15} width={4} height={10} rx={1} fill={c} />
      <Rect x={14} y={15} width={4} height={10} rx={1} fill={c} />
      <Rect x={21} y={15} width={4} height={10} rx={1} fill={c} />
      <Rect x={28} y={15} width={4} height={10} rx={1} fill={c} />
    </Svg>
  ),
  stp_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={13} width={36} height={14} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={7} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={13} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={19} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={25} y={17} width={3} height={6} rx={1} fill={c} />
      <Path d="M20 5 L24 9 L20 13 L16 9 Z" fill={c} opacity={0.9} />
    </Svg>
  ),
  vlan_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={12} width={36} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={7} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={13} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={19} y={17} width={3} height={6} rx={1} fill={c} />
      <Rect x={25} y={17} width={3} height={6} rx={1} fill={c} />
      <SvgText x={28} y={14} fill={c} fontSize={7} fontWeight="bold">V</SvgText>
    </Svg>
  ),
  // ── L1 Physical ──────────────────────────────────────────────────────────
  hub: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={14} width={36} height={12} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={8} y={18} width={3} height={5} rx={1} fill={c} />
      <Rect x={15} y={18} width={3} height={5} rx={1} fill={c} />
      <Rect x={22} y={18} width={3} height={5} rx={1} fill={c} />
      <Rect x={29} y={18} width={3} height={5} rx={1} fill={c} />
    </Svg>
  ),
  bridge: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={14} width={36} height={12} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={8} y={18} width={4} height={5} rx={1} fill={c} />
      <Rect x={28} y={18} width={4} height={5} rx={1} fill={c} />
      <Line x1={20} y1={14} x2={20} y2={26} stroke={c} strokeWidth={2} />
    </Svg>
  ),
  repeater: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={14} width={28} height={12} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={14} cy={20} r={3} fill={c} />
      <Circle cx={26} cy={20} r={3} fill={c} />
      <Path d="M17 20 L23 20" stroke={c} strokeWidth={1.5} markerEnd="url(#a)" />
    </Svg>
  ),
  patch_panel: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={12} width={36} height={16} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      {[6, 10, 14, 18, 22, 26, 30].map((x, i) => (
        <Circle key={i} cx={x + 1} cy={20} r={2} fill={c} />
      ))}
    </Svg>
  ),
  media_converter: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={10} width={24} height={20} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={12} y={16} width={5} height={8} rx={1} fill={c} opacity={0.6} />
      <Rect x={23} y={16} width={5} height={8} rx={1} fill={c} />
      <Line x1={17} y1={20} x2={23} y2={20} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  modem: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={12} width={32} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M10 20 Q13 15 16 20 Q19 25 22 20 Q25 15 28 20 Q31 25 34 20" stroke={c} strokeWidth={1.5} fill="none" />
    </Svg>
  ),
  dsl_modem: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={12} width={32} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M9 20 Q12 14 15 20 Q18 26 21 20 Q24 14 27 20 Q30 26 33 20" stroke={c} strokeWidth={1.5} fill="none" />
      <SvgText x={13} y={34} fill={c} fontSize={7} fontWeight="bold">DSL</SvgText>
    </Svg>
  ),
  cable_modem: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={12} width={32} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={5} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={2} fill={c} />
    </Svg>
  ),
  fiber_tap: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={16} width={24} height={8} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Line x1={2} y1={20} x2={8} y2={20} stroke={c} strokeWidth={2} />
      <Line x1={32} y1={20} x2={38} y2={20} stroke={c} strokeWidth={2} />
      <Line x1={20} y1={16} x2={20} y2={8} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={6} r={2} fill={c} />
    </Svg>
  ),
  network_tap: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={14} width={24} height={12} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Line x1={2} y1={20} x2={8} y2={20} stroke={c} strokeWidth={2} />
      <Line x1={32} y1={20} x2={38} y2={20} stroke={c} strokeWidth={2} />
      <Line x1={20} y1={14} x2={20} y2={6} stroke={c} strokeWidth={1.5} />
      <SvgText x={14} y={23} fill={c} fontSize={6} fontWeight="bold">TAP</SvgText>
    </Svg>
  ),
  sfp_module: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={14} width={24} height={12} rx={2} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={12} y={18} width={6} height={4} rx={1} fill={c} opacity={0.7} />
      <Line x1={32} y1={20} x2={38} y2={20} stroke={c} strokeWidth={2} />
    </Svg>
  ),
  // ── Security / L4-7 ──────────────────────────────────────────────────────
  firewall: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M20 2 L36 10 L36 28 Q36 36 20 38 Q4 36 4 28 L4 10 Z" fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M20 10 Q26 14 24 20 Q22 16 18 18 Q22 22 20 30 Q14 26 16 20 Q12 18 14 14 Q16 18 20 18 Q18 14 20 10Z" fill={c} opacity={0.8} />
    </Svg>
  ),
  ngfw: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M20 2 L36 10 L36 28 Q36 36 20 38 Q4 36 4 28 L4 10 Z" fill={bg} stroke={c} strokeWidth={2} />
      <Path d="M20 10 Q26 14 24 20 Q22 16 18 18 Q22 22 20 30 Q14 26 16 20 Q12 18 14 14 Q16 18 20 18 Q18 14 20 10Z" fill={c} opacity={0.8} />
      <SvgText x={13} y={14} fill={c} fontSize={6} fontWeight="bold">NG</SvgText>
    </Svg>
  ),
  waf: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M20 2 L34 9 L34 27 Q34 35 20 37 Q6 35 6 27 L6 9 Z" fill={bg} stroke={c} strokeWidth={1.5} />
      <SvgText x={12} y={23} fill={c} fontSize={9} fontWeight="bold">WAF</SvgText>
    </Svg>
  ),
  ids: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={8} width={32} height={24} rx={5} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M20 13 L22 19 L28 19 L23 23 L25 29 L20 25 L15 29 L17 23 L12 19 L18 19 Z" fill={c} opacity={0.85} />
    </Svg>
  ),
  ips: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={8} width={32} height={24} rx={5} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M14 20 L19 15 L19 19 L26 19 L26 21 L19 21 L19 25 Z" fill={c} opacity={0.9} />
    </Svg>
  ),
  utm: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M20 2 L35 9 L35 27 Q35 36 20 38 Q5 36 5 27 L5 9 Z" fill={bg} stroke={c} strokeWidth={1.5} />
      <SvgText x={11} y={23} fill={c} fontSize={8} fontWeight="bold">UTM</SvgText>
    </Svg>
  ),
  proxy: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={10} width={32} height={20} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={13} cy={20} r={4} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={27} cy={20} r={4} fill="none" stroke={c} strokeWidth={1.5} />
      <Line x1={17} y1={20} x2={23} y2={20} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  ssl_accelerator: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={10} width={32} height={20} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M17 24 L17 19 L20 16 L23 19 L23 24 Z" fill="none" stroke={c} strokeWidth={1.5} />
      <Rect x={17} y={21} width={6} height={5} rx={1} fill={c} opacity={0.7} />
    </Svg>
  ),
  vpn_concentrator: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={10} width={32} height={20} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M10 20 Q15 13 20 20 Q25 27 30 20" stroke={c} strokeWidth={1.5} fill="none" strokeDasharray="3,2" />
      <Circle cx={20} cy={20} r={3} fill={c} />
    </Svg>
  ),
  radius_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={4} width={24} height={32} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={14} r={4} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={14} r={1.5} fill={c} />
      <SvgText x={11} y={28} fill={c} fontSize={7} fontWeight="bold">AAA</SvgText>
    </Svg>
  ),
  // ── Wireless ─────────────────────────────────────────────────────────────
  access_point: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={28} r={10} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={28} r={4} fill={c} />
      <Path d="M8 18 Q20 8 32 18" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M12 14 Q20 4 28 14" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </Svg>
  ),
  wireless_controller: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={14} width={32} height={12} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M10 11 Q20 4 30 11" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M14 8 Q20 3 26 8" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Circle cx={20} cy={20} r={3} fill={c} />
    </Svg>
  ),
  mesh_ap: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={16} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M8 14 Q20 6 32 14" stroke={c} strokeWidth={1.5} fill="none" />
      <Path d="M8 26 Q20 34 32 26" stroke={c} strokeWidth={1.5} fill="none" />
      <Circle cx={20} cy={20} r={4} fill={c} />
    </Svg>
  ),
  outdoor_ap: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={10} y={22} width={20} height={12} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M8 19 Q20 9 32 19" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Path d="M12 15 Q20 7 28 15" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Line x1={20} y1={8} x2={20} y2={4} stroke={c} strokeWidth={2} />
    </Svg>
  ),
  wan_optimizer: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={12} width={32} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M10 20 Q14 14 18 20 Q22 26 26 20 Q30 14 34 20" stroke={c} strokeWidth={1.5} fill="none" />
    </Svg>
  ),
  // ── Servers ──────────────────────────────────────────────────────────────
  server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={4} width={24} height={10} rx={2} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={8} y={16} width={24} height={10} rx={2} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={8} y={28} width={24} height={8} rx={2} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={28} cy={9} r={2} fill={c} />
      <Circle cx={28} cy={21} r={2} fill={c} />
      <Rect x={11} y={7} width={10} height={4} rx={1} fill={c} opacity={0.3} />
    </Svg>
  ),
  web_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={6} width={28} height={28} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={6} y={6} width={28} height={8} rx={4} fill={c} opacity={0.4} />
      <Circle cx={11} cy={10} r={2} fill={c} />
      <Circle cx={17} cy={10} r={2} fill={c} opacity={0.6} />
      <Rect x={10} y={18} width={20} height={2} rx={1} fill={c} opacity={0.5} />
      <Rect x={10} y={23} width={14} height={2} rx={1} fill={c} opacity={0.4} />
    </Svg>
  ),
  db_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Ellipse cx={20} cy={10} rx={14} ry={5} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={6} y={10} width={28} height={20} fill={bg} stroke={c} strokeWidth={1.5} />
      <Ellipse cx={20} cy={30} rx={14} ry={5} fill={bg} stroke={c} strokeWidth={1.5} />
      <Line x1={6} y1={18} x2={34} y2={18} stroke={c} strokeWidth={1} opacity={0.5} />
      <Line x1={6} y1={24} x2={34} y2={24} stroke={c} strokeWidth={1} opacity={0.5} />
    </Svg>
  ),
  dns_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={8} width={24} height={24} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <SvgText x={10} y={24} fill={c} fontSize={9} fontWeight="bold">DNS</SvgText>
    </Svg>
  ),
  dhcp_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={8} width={24} height={24} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <SvgText x={8} y={24} fill={c} fontSize={8} fontWeight="bold">DHCP</SvgText>
    </Svg>
  ),
  ftp_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={8} width={24} height={24} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <SvgText x={12} y={24} fill={c} fontSize={9} fontWeight="bold">FTP</SvgText>
    </Svg>
  ),
  mail_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={10} width={28} height={20} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M6 12 L20 22 L34 12" stroke={c} strokeWidth={1.5} fill="none" />
    </Svg>
  ),
  file_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={4} width={24} height={32} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={12} y={10} width={16} height={2} rx={1} fill={c} opacity={0.6} />
      <Rect x={12} y={15} width={12} height={2} rx={1} fill={c} opacity={0.5} />
      <Rect x={12} y={20} width={14} height={2} rx={1} fill={c} opacity={0.5} />
      <Rect x={12} y={25} width={10} height={2} rx={1} fill={c} opacity={0.4} />
    </Svg>
  ),
  auth_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={4} width={24} height={32} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M15 20 L17 22 L25 14" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Circle cx={20} cy={12} r={4} fill="none" stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  backup_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={6} width={24} height={28} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M20 14 L20 26 M14 20 Q17 13 20 14 Q23 13 26 20" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </Svg>
  ),
  vm_host: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={4} width={32} height={32} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={8} y={8} width={11} height={11} rx={2} fill={c} opacity={0.5} />
      <Rect x={21} y={8} width={11} height={11} rx={2} fill={c} opacity={0.5} />
      <Rect x={8} y={21} width={11} height={11} rx={2} fill={c} opacity={0.3} />
      <Rect x={21} y={21} width={11} height={11} rx={2} fill={c} opacity={0.3} />
    </Svg>
  ),
  nas_storage: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={6} width={28} height={28} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={10} y={11} width={20} height={5} rx={2} fill={c} opacity={0.5} />
      <Rect x={10} y={18} width={20} height={5} rx={2} fill={c} opacity={0.5} />
      <Rect x={10} y={25} width={20} height={5} rx={2} fill={c} opacity={0.3} />
      <Circle cx={27} cy={13} r={1.5} fill={c} />
    </Svg>
  ),
  san_storage: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={6} width={32} height={28} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Ellipse cx={20} cy={14} rx={10} ry={4} fill="none" stroke={c} strokeWidth={1.2} />
      <Ellipse cx={20} cy={20} rx={10} ry={4} fill="none" stroke={c} strokeWidth={1.2} />
      <Ellipse cx={20} cy={26} rx={10} ry={4} fill="none" stroke={c} strokeWidth={1.2} />
      <Line x1={10} y1={14} x2={10} y2={26} stroke={c} strokeWidth={1.2} />
      <Line x1={30} y1={14} x2={30} y2={26} stroke={c} strokeWidth={1.2} />
    </Svg>
  ),
  syslog_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={6} width={28} height={28} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={10} y={12} width={20} height={2} rx={1} fill={c} opacity={0.7} />
      <Rect x={10} y={17} width={16} height={2} rx={1} fill={c} opacity={0.6} />
      <Rect x={10} y={22} width={18} height={2} rx={1} fill={c} opacity={0.5} />
      <Rect x={10} y={27} width={12} height={2} rx={1} fill={c} opacity={0.4} />
    </Svg>
  ),
  ntp_server: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={16} fill={bg} stroke={c} strokeWidth={1.5} />
      <Line x1={20} y1={8} x2={20} y2={20} stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Line x1={20} y1={20} x2={28} y2={24} stroke={c} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={20} cy={20} r={2} fill={c} />
    </Svg>
  ),
  // ── End Devices ──────────────────────────────────────────────────────────
  pc: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={6} width={28} height={20} rx={2} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={9} y={9} width={22} height={14} rx={1} fill={c} opacity={0.3} />
      <Rect x={14} y={28} width={12} height={4} rx={1} fill={bg} stroke={c} strokeWidth={1} />
      <Rect x={8} y={32} width={24} height={3} rx={1} fill={bg} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  laptop: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={8} width={24} height={18} rx={2} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={11} y={11} width={18} height={12} rx={1} fill={c} opacity={0.3} />
      <Path d="M2 28 L8 26 L32 26 L38 28 Z" fill={bg} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  tablet: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={10} y={4} width={20} height={32} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={13} y={8} width={14} height={22} rx={1} fill={c} opacity={0.3} />
      <Circle cx={20} cy={33} r={1.5} fill={c} />
    </Svg>
  ),
  smartphone: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={12} y={3} width={16} height={34} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={15} y={7} width={10} height={22} rx={1} fill={c} opacity={0.3} />
      <Circle cx={20} cy={33} r={1.5} fill={c} />
      <Rect x={17} y={4.5} width={6} height={1.5} rx={1} fill={c} opacity={0.5} />
    </Svg>
  ),
  printer: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={4} width={24} height={8} rx={1} fill={bg} stroke={c} strokeWidth={1} />
      <Rect x={4} y={14} width={32} height={16} rx={2} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={8} y={30} width={24} height={8} rx={1} fill={bg} stroke={c} strokeWidth={1} />
      <Rect x={10} y={17} width={14} height={3} rx={1} fill={c} opacity={0.4} />
      <Circle cx={30} cy={22} r={2} fill={c} />
    </Svg>
  ),
  thin_client: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={12} y={8} width={16} height={24} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={15} y={12} width={10} height={14} rx={1} fill={c} opacity={0.3} />
      <Rect x={17} y={34} width={6} height={3} rx={1} fill={bg} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  workstation: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={6} width={32} height={22} rx={2} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={7} y={9} width={26} height={16} rx={1} fill={c} opacity={0.3} />
      <Rect x={13} y={30} width={14} height={4} rx={1} fill={bg} stroke={c} strokeWidth={1} />
      <Rect x={6} y={34} width={28} height={2} rx={1} fill={bg} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  kiosk: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={10} y={4} width={20} height={28} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={13} y={7} width={14} height={20} rx={1} fill={c} opacity={0.3} />
      <Rect x={16} y={34} width={8} height={4} rx={1} fill={bg} stroke={c} strokeWidth={1} />
      <Rect x={12} y={38} width={16} height={2} rx={1} fill={bg} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  // ── Cloud / WAN ──────────────────────────────────────────────────────────
  cloud: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M32 28 H12 A8 8 0 0 1 10 12 A10 10 0 0 1 30 12 A8 8 0 0 1 32 28 Z" fill={bg} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  internet: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={17} fill={bg} stroke={c} strokeWidth={1.5} />
      <Ellipse cx={20} cy={20} rx={8} ry={17} fill="none" stroke={c} strokeWidth={1} />
      <Line x1={3} y1={20} x2={37} y2={20} stroke={c} strokeWidth={1} />
      <Line x1={5} y1={13} x2={35} y2={13} stroke={c} strokeWidth={1} opacity={0.6} />
      <Line x1={5} y1={27} x2={35} y2={27} stroke={c} strokeWidth={1} opacity={0.6} />
    </Svg>
  ),
  wan_cloud: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M32 28 H12 A8 8 0 0 1 10 12 A10 10 0 0 1 30 12 A8 8 0 0 1 32 28 Z" fill={bg} stroke={c} strokeWidth={1.5} />
      <SvgText x={12} y={24} fill={c} fontSize={7} fontWeight="bold">WAN</SvgText>
    </Svg>
  ),
  mpls_cloud: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Path d="M32 28 H12 A8 8 0 0 1 10 12 A10 10 0 0 1 30 12 A8 8 0 0 1 32 28 Z" fill={bg} stroke={c} strokeWidth={1.5} strokeDasharray="4,2" />
      <SvgText x={10} y={24} fill={c} fontSize={7} fontWeight="bold">MPLS</SvgText>
    </Svg>
  ),
  satellite: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={5} fill={bg} stroke={c} strokeWidth={1.5} />
      <Line x1={20} y1={15} x2={20} y2={6} stroke={c} strokeWidth={1.5} />
      <Rect x={12} y={3} width={16} height={5} rx={1} fill={c} opacity={0.7} />
      <Rect x={6} y={18} width={8} height={4} rx={1} fill={bg} stroke={c} strokeWidth={1} />
      <Rect x={26} y={18} width={8} height={4} rx={1} fill={bg} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  cellular_tower: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Line x1={20} y1={38} x2={20} y2={8} stroke={c} strokeWidth={2} />
      <Line x1={20} y1={30} x2={10} y2={38} stroke={c} strokeWidth={1.5} />
      <Line x1={20} y1={30} x2={30} y2={38} stroke={c} strokeWidth={1.5} />
      <Path d="M12 12 Q20 6 28 12" stroke={c} strokeWidth={1.5} fill="none" />
      <Path d="M15 8 Q20 3 25 8" stroke={c} strokeWidth={1.5} fill="none" />
      <Circle cx={20} cy={8} r={2} fill={c} />
    </Svg>
  ),
  // ── IoT / Physical ────────────────────────────────────────────────────────
  ip_camera: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={14} width={22} height={14} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={17} cy={21} r={5} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={17} cy={21} r={2} fill={c} />
      <Path d="M28 17 L36 13 L36 29 L28 25 Z" fill={bg} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  voip_phone: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={6} width={24} height={28} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={12} y={10} width={16} height={8} rx={2} fill={c} opacity={0.3} />
      <Circle cx={16} cy={24} r={2} fill={c} opacity={0.7} />
      <Circle cx={20} cy={24} r={2} fill={c} opacity={0.7} />
      <Circle cx={24} cy={24} r={2} fill={c} opacity={0.7} />
      <Circle cx={20} cy={29} r={2} fill={c} />
    </Svg>
  ),
  ip_phone: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={6} width={28} height={28} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M12 10 Q14 8 18 10 L18 16 Q14 18 12 16 Z" fill={c} opacity={0.7} />
      <Rect x={14} y={20} width={12} height={10} rx={2} fill={c} opacity={0.3} />
    </Svg>
  ),
  smart_tv: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={8} width={32} height={22} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={7} y={11} width={26} height={16} rx={1} fill={c} opacity={0.3} />
      <Rect x={15} y={32} width={10} height={4} rx={1} fill={bg} stroke={c} strokeWidth={1} />
      <Rect x={10} y={36} width={20} height={2} rx={1} fill={bg} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  iot_sensor: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={14} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M12 20 Q16 12 20 20 Q24 28 28 20" stroke={c} strokeWidth={1.5} fill="none" />
      <Circle cx={20} cy={20} r={3} fill={c} />
    </Svg>
  ),
  iot_gateway: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={10} width={24} height={20} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M14 8 Q20 3 26 8" stroke={c} strokeWidth={1.5} fill="none" />
      <Rect x={13} y={16} width={6} height={8} rx={1} fill={c} opacity={0.4} />
      <Rect x={21} y={16} width={6} height={8} rx={1} fill={c} opacity={0.6} />
    </Svg>
  ),
  pos_terminal: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={10} y={6} width={20} height={28} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={13} y={9} width={14} height={10} rx={1} fill={c} opacity={0.3} />
      <Rect x={13} y={22} width={5} height={4} rx={1} fill={c} opacity={0.6} />
      <Rect x={20} y={22} width={5} height={4} rx={1} fill={c} opacity={0.6} />
      <Rect x={13} y={28} width={14} height={3} rx={1} fill={c} opacity={0.4} />
    </Svg>
  ),
  atm_machine: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={4} width={28} height={32} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={10} y={8} width={20} height={12} rx={2} fill={c} opacity={0.3} />
      <Rect x={10} y={24} width={8} height={6} rx={1} fill={c} opacity={0.5} />
      <Rect x={22} y={24} width={8} height={6} rx={1} fill={c} opacity={0.4} />
    </Svg>
  ),
  industrial_controller: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={8} width={32} height={24} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={8} y={12} width={8} height={8} rx={2} fill={c} opacity={0.5} />
      <Rect x={20} y={12} width={12} height={4} rx={1} fill={c} opacity={0.3} />
      <Rect x={20} y={18} width={12} height={4} rx={1} fill={c} opacity={0.3} />
    </Svg>
  ),
  plc: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={6} y={6} width={28} height={28} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={10} y={10} width={6} height={6} rx={1} fill={c} opacity={0.6} />
      <Rect x={10} y={18} width={6} height={6} rx={1} fill={c} opacity={0.4} />
      <Rect x={10} y={26} width={6} height={6} rx={1} fill={c} opacity={0.3} />
      <Line x1={20} y1={10} x2={30} y2={10} stroke={c} strokeWidth={1} />
      <Line x1={20} y1={14} x2={30} y2={14} stroke={c} strokeWidth={1} />
      <Line x1={20} y1={21} x2={30} y2={21} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  scada: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={6} width={32} height={22} rx={3} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M8 22 L12 16 L16 18 L20 12 L24 20 L28 14 L32 22" stroke={c} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <Rect x={10} y={30} width={20} height={4} rx={1} fill={bg} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  ups: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={8} y={4} width={24} height={32} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M20 12 L17 20 L21 20 L18 28" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  ),
  // ── SDN / Virtual ─────────────────────────────────────────────────────────
  sdn_controller: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={8} width={32} height={24} rx={5} fill={bg} stroke={c} strokeWidth={2} />
      <Circle cx={20} cy={20} r={6} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={2} fill={c} />
      <Line x1={14} y1={20} x2={8} y2={20} stroke={c} strokeWidth={1.5} />
      <Line x1={26} y1={20} x2={32} y2={20} stroke={c} strokeWidth={1.5} />
    </Svg>
  ),
  openflow_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={12} width={36} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={7} y={17} width={4} height={6} rx={1} fill={c} />
      <Rect x={14} y={17} width={4} height={6} rx={1} fill={c} />
      <Rect x={21} y={17} width={4} height={6} rx={1} fill={c} />
      <Rect x={28} y={17} width={4} height={6} rx={1} fill={c} />
      <SvgText x={8} y={11} fill={c} fontSize={6} fontWeight="bold">OF</SvgText>
    </Svg>
  ),
  virtual_switch: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={2} y={12} width={36} height={16} rx={4} fill={bg} stroke={c} strokeWidth={1.5} strokeDasharray="4,2" />
      <Rect x={7} y={17} width={4} height={6} rx={1} fill={c} opacity={0.7} />
      <Rect x={14} y={17} width={4} height={6} rx={1} fill={c} opacity={0.7} />
      <Rect x={21} y={17} width={4} height={6} rx={1} fill={c} opacity={0.7} />
      <Rect x={28} y={17} width={4} height={6} rx={1} fill={c} opacity={0.7} />
    </Svg>
  ),
  nfv_host: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={4} width={32} height={32} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Rect x={8} y={8} width={11} height={11} rx={2} fill={c} opacity={0.4} />
      <Rect x={21} y={8} width={11} height={11} rx={2} fill={c} opacity={0.4} />
      <Rect x={8} y={21} width={11} height={11} rx={2} fill={c} opacity={0.4} />
      <Rect x={21} y={21} width={11} height={11} rx={2} fill={c} opacity={0.4} />
      <SvgText x={9} y={17} fill={c} fontSize={6} fontWeight="bold">NFV</SvgText>
    </Svg>
  ),
  docker_host: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={10} width={32} height={20} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      {([0, 1, 2] as const).map((i) => (
        [0, 1, 2].map((j) => (
          <Rect key={`${i}${j}`} x={8 + i * 8} y={14 + j * 4} width={6} height={3} rx={1} fill={c} opacity={0.5} />
        ))
      ))}
    </Svg>
  ),
  kubernetes_node: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Polygon points="20,4 36,12 36,28 20,36 4,28 4,12" fill={bg} stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={5} fill="none" stroke={c} strokeWidth={1.5} />
      <Circle cx={20} cy={20} r={2} fill={c} />
      <Line x1={20} y1={15} x2={20} y2={9} stroke={c} strokeWidth={1} />
      <Line x1={24} y1={17} x2={29} y2={14} stroke={c} strokeWidth={1} />
      <Line x1={24} y1={23} x2={29} y2={26} stroke={c} strokeWidth={1} />
      <Line x1={20} y1={25} x2={20} y2={31} stroke={c} strokeWidth={1} />
      <Line x1={16} y1={23} x2={11} y2={26} stroke={c} strokeWidth={1} />
      <Line x1={16} y1={17} x2={11} y2={14} stroke={c} strokeWidth={1} />
    </Svg>
  ),
  load_balancer: (c, bg) => (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Rect x={4} y={14} width={32} height={12} rx={4} fill={bg} stroke={c} strokeWidth={1.5} />
      <Path d="M20 14 L14 8 M20 14 L26 8" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M20 26 L12 32 M20 26 L20 32 M20 26 L28 32" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  ),
};

const deviceColors: Record<DeviceType, string> = {
  // Routers
  router: '#3B82F6', core_router: '#2563EB', edge_router: '#1D4ED8',
  isr_router: '#3B82F6', asr_router: '#2563EB', bgp_router: '#1E40AF',
  mpls_router: '#4F46E5', virtual_router: '#6366F1',
  // Switches L2/L1
  l2_switch: '#8B5CF6', l3_switch: '#7C3AED', multilayer_switch: '#7C3AED',
  managed_switch: '#8B5CF6', poe_switch: '#9333EA', stackable_switch: '#7C3AED',
  industrial_switch: '#6D28D9', access_switch: '#8B5CF6', distribution_switch: '#7C3AED',
  stp_switch: '#8B5CF6', vlan_switch: '#6D28D9',
  hub: '#6366F1', bridge: '#4F46E5', repeater: '#818CF8',
  patch_panel: '#6B7280', media_converter: '#94A3B8', fiber_tap: '#06B6D4',
  network_tap: '#0891B2', sfp_module: '#22D3EE',
  // Security
  firewall: '#EF4444', ngfw: '#DC2626', waf: '#B91C1C',
  ids: '#F97316', ips: '#EA580C', utm: '#EF4444',
  proxy: '#F59E0B', ssl_accelerator: '#D97706', vpn_concentrator: '#B45309', radius_server: '#92400E',
  // Wireless
  access_point: '#06B6D4', wireless_controller: '#0891B2',
  mesh_ap: '#0284C7', outdoor_ap: '#0369A1', wan_optimizer: '#22D3EE',
  // Servers
  server: '#F59E0B', web_server: '#F59E0B', db_server: '#D97706',
  dns_server: '#F97316', dhcp_server: '#EA580C', ftp_server: '#EAB308',
  mail_server: '#CA8A04', file_server: '#A16207', auth_server: '#D97706',
  backup_server: '#92400E', vm_host: '#7C3AED', nas_storage: '#6D28D9',
  san_storage: '#4C1D95', syslog_server: '#F59E0B', ntp_server: '#D97706',
  // End Devices
  pc: '#10B981', laptop: '#059669', tablet: '#10B981', smartphone: '#34D399',
  printer: '#6B7280', thin_client: '#10B981', workstation: '#059669', kiosk: '#047857',
  // Cloud/WAN
  cloud: '#64748B', internet: '#475569', wan_cloud: '#64748B',
  mpls_cloud: '#334155', satellite: '#94A3B8', cellular_tower: '#64748B',
  modem: '#94A3B8', dsl_modem: '#64748B', cable_modem: '#475569',
  load_balancer: '#3B82F6',
  // IoT
  ip_camera: '#EC4899', voip_phone: '#8B5CF6', ip_phone: '#7C3AED',
  smart_tv: '#06B6D4', iot_sensor: '#10B981', iot_gateway: '#0D9488',
  pos_terminal: '#F59E0B', atm_machine: '#D97706', industrial_controller: '#B45309',
  plc: '#92400E', scada: '#78350F', ups: '#64748B',
  // SDN
  sdn_controller: '#22D3EE', openflow_switch: '#06B6D4',
  virtual_switch: '#8B5CF6', nfv_host: '#7C3AED',
  docker_host: '#2563EB', kubernetes_node: '#3B82F6',
};

export function DeviceIcon({ type, size = 40, color, bgColor = 'rgba(59,130,246,0.15)' }: DeviceIconProps) {
  const c = color ?? deviceColors[type] ?? '#3B82F6';
  const renderFn = iconMap[type];
  if (!renderFn) return null;
  return <>{renderFn(c, bgColor)}</>;
}

export function getDeviceColor(type: DeviceType): string {
  return deviceColors[type] ?? '#3B82F6';
}
