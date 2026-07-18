// Packet trace engine — realistic Cisco IOS-style terminal output for
// both on-connect link-up events and full source→destination path traces.
// VLAN-aware: traces report blocked hops when VLAN IDs mismatch.
import type { CableType, DeviceType, NetworkEdge, NetworkNode } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockIp(seed: string, idx: number): string {
  const h = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `192.168.${(h % 10) + 1}.${(idx % 250) + 1}`;
}

function randomMac(): string {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0'),
  ).join(':');
}

function ms(): string { return (Math.random() * 4 + 0.2).toFixed(1); }

function cableDesc(cable: CableType): string {
  const map: Record<CableType, string> = {
    ethernet:  'FastEthernet (100BASE-TX)',
    fiber:     'Fiber Optic (1000BASE-LX)',
    serial:    'Serial (HDLC)',
    console:   'Console (RS-232)',
    crossover: 'Crossover Ethernet',
    coaxial:   'Coaxial (10BASE-2)',
    sfp:       'SFP (1000BASE-SX)',
    dac_cable: 'DAC Twinax (10GbE)',
    usb:       'USB Management',
    wireless:  'Wireless (802.11ac)',
  };
  return map[cable] ?? cable;
}

/** Layer role used to generate the right IOS prompt and interface names */
function deviceRole(type: DeviceType): 'router' | 'switch' | 'host' | 'firewall' | 'ap' | 'server' {
  const routers: DeviceType[] = ['router','core_router','edge_router','isr_router','asr_router','bgp_router','mpls_router','virtual_router','multilayer_switch','l3_switch'];
  const switches: DeviceType[] = ['hub','l2_switch','managed_switch','poe_switch','stackable_switch','industrial_switch','access_switch','distribution_switch','stp_switch','vlan_switch','bridge','repeater','patch_panel','media_converter'];
  const hosts: DeviceType[] = ['pc','laptop','tablet','smartphone','printer','thin_client','workstation','kiosk'];
  const firewalls: DeviceType[] = ['firewall','ngfw','waf','ids','ips','utm'];
  const aps: DeviceType[] = ['access_point','wireless_controller','mesh_ap','outdoor_ap'];
  if (routers.includes(type)) return 'router';
  if (switches.includes(type)) return 'switch';
  if (hosts.includes(type)) return 'host';
  if (firewalls.includes(type)) return 'firewall';
  if (aps.includes(type)) return 'ap';
  return 'server';
}

function prompt(node: NetworkNode): string {
  const name = (node.hostname ?? node.label).replace(/\s+/g, '-');
  const role = deviceRole(node.type);
  if (role === 'switch')   return `${name}#`;
  if (role === 'host')     return `${name}>`;
  if (role === 'firewall') return `${name}(config)#`;
  if (role === 'ap')       return `${name}#`;
  if (role === 'server')   return `${name}$`;
  return `${name}#`;
}

function ingressIf(node: NetworkNode, idx: number): string {
  const role = deviceRole(node.type);
  if (role === 'router' || role === 'firewall') return `GigabitEthernet0/${idx % 4}`;
  if (role === 'switch') return `FastEthernet0/${(idx % 24) + 1}`;
  if (role === 'ap') return `dot11radio0`;
  if (role === 'server' || role === 'host') return `eth${idx % 2}`;
  return `Fa0/${idx % 4}`;
}

// ─── BFS path finder ─────────────────────────────────────────────────────────

export interface TracePath {
  nodeIds: string[];        // ordered node IDs src → dst
  edgeIds: string[];        // edges traversed (same order)
}

/** BFS over the adjacency list to find a path from srcId to dstId */
export function findTracePath(
  srcId: string,
  dstId: string,
  nodes: NetworkNode[],
  edges: NetworkEdge[],
): TracePath | null {
  if (srcId === dstId) return { nodeIds: [srcId], edgeIds: [] };

  // Build adjacency: nodeId → [{neighborId, edgeId}]
  const adj = new Map<string, { neighborId: string; edgeId: string }[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.source)?.push({ neighborId: e.target, edgeId: e.id });
    adj.get(e.target)?.push({ neighborId: e.source, edgeId: e.id });
  }

  // BFS
  const visited = new Set<string>([srcId]);
  const queue: { nodeId: string; path: string[]; edgePath: string[] }[] = [
    { nodeId: srcId, path: [srcId], edgePath: [] },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const { neighborId, edgeId } of (adj.get(cur.nodeId) ?? [])) {
      if (visited.has(neighborId)) continue;
      const newPath = [...cur.path, neighborId];
      const newEdgePath = [...cur.edgePath, edgeId];
      if (neighborId === dstId) {
        return { nodeIds: newPath, edgeIds: newEdgePath };
      }
      visited.add(neighborId);
      queue.push({ nodeId: neighborId, path: newPath, edgePath: newEdgePath });
    }
  }
  return null; // no path
}

export function generateTraceOutput(
  src: NetworkNode,
  tgt: NetworkNode,
  edge: NetworkEdge,
  nodeIndex: number,
): string[] {
  const ifName = ingressIf(src, nodeIndex);
  const mac    = randomMac();

  return [
    ``,
    `%LINK-3-UPDOWN: Interface ${ifName}, changed state to up`,
    `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${ifName}, changed state to up`,
    ``,
    `! Link established: ${src.label} <--> ${tgt.label}`,
    `! Cable  : ${cableDesc(edge.cable_type)}`,
    `! Iface  : ${ifName}`,
    `! MAC    : ${mac}`,
    ``,
    `${prompt(src)} show interface ${ifName}`,
    `${ifName} is up, line protocol is up`,
    `  Hardware is iGbE, address is ${mac} (bia ${mac})`,
    `  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec`,
    `  reliability 255/255, txload 1/255, rxload 1/255`,
    `  Encapsulation: ${edge.cable_type === 'serial' ? 'HDLC' : 'ARPA'}`,
    ``,
  ];
}

// ─── Full path-trace output (runs when tracer fires src→dst) ─────────────────

export function generatePathTraceOutput(
  path: TracePath,
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  packetType: 'icmp' | 'tcp' | 'udp',
): string[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const edgeMap = new Map(edges.map((e) => [e.id, e]));

  const src = nodeMap.get(path.nodeIds[0]);
  const dst = nodeMap.get(path.nodeIds[path.nodeIds.length - 1]);
  if (!src || !dst) return ['! Trace error: invalid path'];

  const srcIp = src.ip_address || mockIp(src.id, 0);
  const dstIp = dst.ip_address || mockIp(dst.id, path.nodeIds.length - 1);

  const lines: string[] = [
    ``,
    `! ═══════════════════════════════════════════════════`,
    `! PacketFlow Trace  ·  ${packetType.toUpperCase()}  ·  ${new Date().toLocaleTimeString()}`,
    `! Source : ${src.label} (${srcIp})`,
    `! Dest   : ${dst.label} (${dstIp})`,
    `! Hops   : ${path.nodeIds.length - 1}`,
    `! ═══════════════════════════════════════════════════`,
    ``,
  ];

  // --- Ping ---
  if (packetType === 'icmp') {
    lines.push(
      `${prompt(src)} ping ${dstIp}`,
      ``,
      `Type escape sequence to abort.`,
      `Sending 5, 100-byte ICMP Echos to ${dstIp}, timeout is 2 seconds:`,
      `!!!!!`,
      `Success rate is 100 percent (5/5), round-trip min/avg/max = ${ms()}/${ms()}/${ms()} ms`,
      ``,
    );
  } else if (packetType === 'tcp') {
    const dstPort = deviceRole(dst.type) === 'server' ? 80 : 22;
    lines.push(
      `${prompt(src)} telnet ${dstIp} ${dstPort}`,
      `Trying ${dstIp}, ${dstPort} ... Open`,
      `Connection to ${dstIp} closed.`,
      ``,
    );
  } else {
    lines.push(
      `${prompt(src)} debug ip udp`,
      `UDP: rcvd src=${srcIp}(1024), dst=${dstIp}(53), if=Fa0/0`,
      `UDP: sent src=${srcIp}(1024), dst=${dstIp}(53), if=Fa0/0`,
      ``,
    );
  }

  // --- Traceroute ---
  lines.push(
    `${prompt(src)} traceroute ${dstIp}`,
    ``,
    `Type escape sequence to abort.`,
    `Tracing the route to ${dstIp} (${dst.label})`,
    `VRF info: (vrf in name/id, vrf out name/id)`,
  );

  for (let i = 0; i < path.nodeIds.length - 1; i++) {
    const hopNode = nodeMap.get(path.nodeIds[i + 1]);
    const hopEdge = edgeMap.get(path.edgeIds[i]);
    if (!hopNode || !hopEdge) continue;
    const hopIp  = hopNode.ip_address || mockIp(hopNode.id, i + 1);
    const iface  = ingressIf(hopNode, i);
    const cable  = cableDesc(hopEdge.cable_type);
    const vlanTag = hopEdge.vlan_id ? ` VLAN ${hopEdge.vlan_id}` : '';

    // VLAN break detection: compare with previous hop's VLAN
    const prevEdge = i > 0 ? edgeMap.get(path.edgeIds[i - 1]) : null;
    const prevVlan = prevEdge?.vlan_id;
    const curVlan  = hopEdge.vlan_id;
    if (
      prevVlan !== undefined && curVlan !== undefined &&
      prevVlan !== curVlan
    ) {
      // Inter-VLAN routing: if this hop is a router, it routes between VLANs
      if (hopNode.type === 'router') {
        lines.push(
          `  ${i + 1}  ${hopIp} [${hopNode.label}]  ${ms()} msec  ${ms()} msec  ${ms()} msec`,
          `     via ${iface} (${cable}) — INTER-VLAN ROUTING VLAN ${prevVlan} → VLAN ${curVlan}`,
          `     ${prompt(hopNode)} ip route VLAN${prevVlan} VLAN${curVlan}`,
          `     %LINEPROTO-5: Line protocol on Interface Vlan${prevVlan}, changed state to up`,
          `     %LINEPROTO-5: Line protocol on Interface Vlan${curVlan}, changed state to up`,
        );
        // Router handled the VLAN transition — continue trace on new VLAN
        continue;
      }
      // Non-router node: packet blocked
      lines.push(
        `  ${i + 1}  * * *  [BLOCKED — VLAN mismatch: ${prevVlan} → ${curVlan}]`,
        `     Packet dropped at ${hopNode.label} (${iface}). Check trunk/access VLAN config.`,
      );
      lines.push(``, `! Trace failed — VLAN boundary at hop ${i + 1}. Add a router for inter-VLAN routing.`, ``);
      return lines;
    }

    lines.push(
      `  ${i + 1}  ${hopIp} [${hopNode.label}]  ${ms()} msec  ${ms()} msec  ${ms()} msec`,
      `     via ${iface} (${cable})${vlanTag}`,
    );
  }

  lines.push(
    ``,
    `${prompt(src)} `,
    ``,
    `! Trace complete — ${path.nodeIds.length - 1} hop(s), destination reachable.`,
    ``,
  );

  return lines;
}
