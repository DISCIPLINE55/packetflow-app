// PDF export — generates a rich HTML document with:
//   1. Topology SVG diagram
//   2. Device inventory table (hostname, type, IP, MAC, description)
//   3. Cable legend (type, color, count, VLANs)
//   4. QR code linking to the read-only /view topology viewer
// Web: opens a print-ready window (window.open + window.print)
// Native: writes HTML to cache, shares via expo-sharing

import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { topologyToSvg } from '@/lib/exportSvg';
import { CABLE_COLORS } from '@/lib/constants';
import type { NetworkEdge, NetworkNode } from '@/types';

const APP_BASE_URL = 'https://packetflow.app';

// ─── QR code via Google Charts API (renders when HTML is open in browser) ────
function buildQrSection(projectId: string): string {
  const viewUrl = `${APP_BASE_URL}/view/${projectId}`;
  const qrUrl   = `https://chart.googleapis.com/chart?cht=qr&chs=160x160&choe=UTF-8&chl=${encodeURIComponent(viewUrl)}`;
  return `
  <div class="section" style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap">
    <div>
      <div class="section-title">Read-Only Viewer QR Code</div>
      <img src="${qrUrl}" alt="QR Code" width="160" height="160"
           style="border:2px solid #1e293b;border-radius:10px;background:#fff;display:block"/>
      <p style="font-size:11px;color:#475569;margin:6px 0 0;word-break:break-all;max-width:180px">${viewUrl}</p>
    </div>
  </div>`;
}

// ─── Cable legend ─────────────────────────────────────────────────────────────
function buildCableLegend(edges: NetworkEdge[]): string {
  const counts = new Map<string, number>();
  const vlans  = new Map<string, Set<number>>();
  for (const e of edges) {
    counts.set(e.cable_type, (counts.get(e.cable_type) ?? 0) + 1);
    if (e.vlan_id) {
      if (!vlans.has(e.cable_type)) vlans.set(e.cable_type, new Set());
      vlans.get(e.cable_type)!.add(e.vlan_id);
    }
  }
  if (counts.size === 0) return '<tr><td colspan="3" style="color:#64748b;text-align:center">No links</td></tr>';
  return Array.from(counts.entries()).map(([type, count]) => {
    const color = (CABLE_COLORS as Record<string, string>)[type] ?? '#94A3B8';
    const vlanList = vlans.get(type);
    const vlanStr  = vlanList ? Array.from(vlanList).map((v) => `V${v}`).join(', ') : '—';
    return `
    <tr>
      <td style="padding:8px 12px">
        <span style="display:inline-block;width:32px;height:4px;background:${color};border-radius:2px;vertical-align:middle;margin-right:8px"></span>
        ${type}
      </td>
      <td style="padding:8px 12px;text-align:center">${count}</td>
      <td style="padding:8px 12px;color:#a5b4fc;font-size:12px">${vlanStr}</td>
    </tr>`;
  }).join('\n');
}

// ─── Device table ─────────────────────────────────────────────────────────────
function buildDeviceTable(nodes: NetworkNode[]): string {
  if (nodes.length === 0) return '<tr><td colspan="5" style="color:#64748b;text-align:center">No devices</td></tr>';
  return nodes.map((n, i) => `
    <tr style="background:${i % 2 === 0 ? '#0f172a' : '#111827'}">
      <td style="padding:8px 12px;color:#f8fafc;font-weight:600">${n.hostname || n.label}</td>
      <td style="padding:8px 12px;color:#94a3b8">${n.type}</td>
      <td style="padding:8px 12px;font-family:monospace;color:#67e8f9">${n.ip_address || '—'}</td>
      <td style="padding:8px 12px;font-family:monospace;color:#94a3b8;font-size:11px">${n.mac_address || '—'}</td>
      <td style="padding:8px 12px;color:#64748b;font-size:12px">${n.description || '—'}</td>
    </tr>`).join('\n');
}

// ─── Full HTML document ───────────────────────────────────────────────────────
function buildHtml(
  projectName: string,
  projectId: string,
  nodes: NetworkNode[],
  edges: NetworkEdge[],
): string {
  const svgStr = topologyToSvg(nodes, edges, projectName);
  const now    = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${projectName} — PacketFlow Topology</title>
  <style>
    @media print { .no-print { display:none; } }
    body { margin:0; padding:24px; font-family:ui-monospace,monospace; background:#0b1220; color:#f1f5f9; }
    h1   { font-size:22px; font-weight:800; margin:0 0 4px; color:#f8fafc; }
    .meta{ font-size:12px; color:#475569; margin-bottom:24px; }
    .section { margin-bottom:32px; }
    .section-title { font-size:11px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase;
                     color:#475569; border-bottom:1px solid #1e293b; padding-bottom:6px; margin-bottom:12px; }
    .diagram { border:1px solid #1e293b; border-radius:12px; overflow:hidden;
               display:flex; align-items:center; justify-content:center; padding:16px; background:#060d1a; }
    table  { width:100%; border-collapse:collapse; font-size:13px; }
    th     { background:#1e293b; color:#94a3b8; font-size:10px; font-weight:700; letter-spacing:0.8px;
             text-transform:uppercase; padding:8px 12px; text-align:left; }
    td     { border-bottom:1px solid #1e293b; }
    .btn   { display:inline-block; margin:0 0 24px; padding:10px 20px; background:#2563eb;
             color:#fff; border:none; font-size:14px; font-weight:700; cursor:pointer; border-radius:10px; }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:16px">
    <button class="btn" onclick="window.print()">🖨 Print / Save as PDF</button>
  </div>

  <h1>${projectName}</h1>
  <p class="meta">PacketFlow Export  ·  ${now}  ·  ${nodes.length} devices  ·  ${edges.length} links</p>

  <div class="section">
    <div class="section-title">Topology Diagram</div>
    <div class="diagram">${svgStr}</div>
  </div>

  ${buildQrSection(projectId)}

  <div class="section">
    <div class="section-title">Device Inventory</div>
    <table>
      <thead>
        <tr>
          <th>Hostname</th>
          <th>Type</th>
          <th>IP Address</th>
          <th>MAC Address</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>${buildDeviceTable(nodes)}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Cable Legend</div>
    <table>
      <thead>
        <tr>
          <th>Cable Type</th>
          <th>Count</th>
          <th>VLANs</th>
        </tr>
      </thead>
      <tbody>${buildCableLegend(edges)}</tbody>
    </table>
  </div>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function exportPdf(
  projectName: string,
  projectId: string,
  nodes: NetworkNode[],
  edges: NetworkEdge[],
): Promise<void> {
  const html = buildHtml(projectName, projectId, nodes, edges);

  if (process.env.EXPO_OS === 'web') {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 400);
    }
    return;
  }

  // Native: write to cache dir then share (iOS share sheet offers "Print", "Save to Files", etc.)
  const fileName = `${projectName.replace(/\s+/g, '_')}_topology.html`;
  const file = new File(Paths.cache, fileName);
  await file.write(html);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/html',
      dialogTitle: 'Export as PDF',
      UTI: 'public.html',
    });
  }
}
