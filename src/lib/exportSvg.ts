// Generates a standalone SVG string from canvas topology data.
// Used for PNG/SVG export without needing react-native-view-shot.

import { CABLE_COLORS } from '@/lib/constants';
import type { NetworkEdge, NetworkNode } from '@/types';

const NODE_SIZE = 56;
const PADDING = 80;

// Device emoji/abbreviation for the SVG fallback
function deviceLabel(type: string): string {
  const map: Record<string, string> = {
    router: '🔀',
    switch: '⏹',
    firewall: '🔥',
    server: '🖥',
    pc: '💻',
    laptop: '💻',
    hub: '○',
    access_point: '📶',
    cloud: '☁',
    phone: '📱',
    tablet: '📱',
    printer: '🖨',
    camera: '📷',
    iot_device: '📡',
    load_balancer: '⚖',
    dns_server: '🌐',
    dhcp_server: '⚙',
    vpn_gateway: '🔒',
    storage: '🗄',
  };
  return map[type] ?? '◆';
}

function deviceColor(type: string): string {
  const map: Record<string, string> = {
    router: '#3B82F6',
    switch: '#22C55E',
    firewall: '#EF4444',
    server: '#8B5CF6',
    pc: '#06B6D4',
    laptop: '#06B6D4',
    hub: '#64748B',
    access_point: '#F59E0B',
    cloud: '#94A3B8',
    phone: '#10B981',
    tablet: '#10B981',
    printer: '#A78BFA',
    camera: '#F97316',
    iot_device: '#22D3EE',
    load_balancer: '#EC4899',
    dns_server: '#6366F1',
    dhcp_server: '#14B8A6',
    vpn_gateway: '#F59E0B',
    storage: '#78716C',
  };
  return map[type] ?? '#3B82F6';
}

export function topologyToSvg(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  projectName: string,
): string {
  if (nodes.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
      <rect width="400" height="200" fill="#0B1220"/>
      <text x="200" y="100" text-anchor="middle" fill="#64748B" font-size="16" font-family="sans-serif">Empty topology</text>
    </svg>`;
  }

  // Compute bounding box
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - PADDING;
  const minY = Math.min(...ys) - PADDING;
  const maxX = Math.max(...xs) + NODE_SIZE + PADDING;
  const maxY = Math.max(...ys) + NODE_SIZE + PADDING + 30;
  const W = maxX - minX;
  const H = maxY - minY + 40; // +40 for title

  const offsetX = -minX;
  const offsetY = -minY + 40;

  // Edge paths
  const edgeSvg = edges.map((e) => {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    if (!src || !tgt) return '';
    const x1 = src.x + NODE_SIZE / 2 + offsetX;
    const y1 = src.y + NODE_SIZE / 2 + offsetY;
    const x2 = tgt.x + NODE_SIZE / 2 + offsetX;
    const y2 = tgt.y + NODE_SIZE / 2 + offsetY;
    const cpx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
    const cpy = (y1 + y2) / 2 - (x2 - x1) * 0.15;
    const color = (CABLE_COLORS as Record<string, string>)[e.cable_type] ?? '#94A3B8';
    return `<path d="M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}" stroke="${color}" stroke-width="2.5" fill="none" opacity="0.85"/>`;
  }).join('\n');

  // Node circles + labels
  const nodeSvg = nodes.map((n) => {
    const cx = n.x + NODE_SIZE / 2 + offsetX;
    const cy = n.y + NODE_SIZE / 2 + offsetY;
    const r = NODE_SIZE / 2;
    const color = deviceColor(n.type);
    const emoji = deviceLabel(n.type);
    const label = n.label.length > 12 ? n.label.slice(0, 12) + '…' : n.label;
    return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}22" stroke="${color}" stroke-width="2"/>
    <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="22" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${emoji}</text>
    <text x="${cx}" y="${cy + r + 16}" text-anchor="middle" font-size="11" font-family="ui-monospace,monospace" fill="#CBD5E1">${label}</text>
    <text x="${cx}" y="${cy + r + 28}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#64748B">${n.type}</text>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0B1220"/>
  <!-- title -->
  <text x="16" y="26" font-size="14" font-weight="bold" font-family="ui-monospace,monospace" fill="#F8FAFC">${projectName}</text>
  <text x="${W - 16}" y="26" text-anchor="end" font-size="11" font-family="sans-serif" fill="#475569">${nodes.length} devices · ${edges.length} links</text>
  <!-- edges -->
  ${edgeSvg}
  <!-- nodes -->
  ${nodeSvg}
</svg>`;
}
