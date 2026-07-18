import { create } from 'zustand';

// IOS-style modes
type CliMode = 'user' | 'privileged' | 'global_config' | 'interface_config' | 'vlan_config';

interface TerminalLine {
  id: string;
  text: string;
  type: 'output' | 'input' | 'error' | 'system';
  timestamp: Date;
}

interface TerminalStore {
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
  isExpanded: boolean;
  currentInput: string;
  // IOS state
  cliMode: CliMode;
  hostname: string;
  currentIface: string;
  enablePassword: string;

  addLine: (text: string, type?: TerminalLine['type']) => void;
  clearLines: () => void;
  setExpanded: (v: boolean) => void;
  setInput: (text: string) => void;
  historyUp: () => string;
  historyDown: () => string;
  executeCommand: (command: string) => void;
  exportLogs: () => string;
  getPrompt: () => string;
}

function getPromptFor(mode: CliMode, hostname: string, iface: string): string {
  switch (mode) {
    case 'user': return `${hostname}>`;
    case 'privileged': return `${hostname}#`;
    case 'global_config': return `${hostname}(config)#`;
    case 'interface_config': return `${hostname}(config-if)#`;
    case 'vlan_config': return `${hostname}(config-vlan)#`;
    default: return `${hostname}>`;
  }
}

interface CmdResult {
  lines: string[];
  newMode?: CliMode;
  newHostname?: string;
  newIface?: string;
}

function processIosCommand(
  rawCmd: string,
  mode: CliMode,
  hostname: string,
  currentIface: string,
  enablePassword: string
): CmdResult {
  const trimmed = rawCmd.trim();
  if (!trimmed) return { lines: [] };

  // abbreviation expansion: match Cisco-style partial commands
  const lower = trimmed.toLowerCase();
  const parts = trimmed.split(/\s+/);
  const lparts = lower.split(/\s+/);
  const cmd0 = lparts[0];
  const rest = parts.slice(1).join(' ');
  const lrest = lparts.slice(1).join(' ');

  // ──── ANY MODE ────
  if (cmd0 === 'exit' || cmd0 === 'end') {
    if (mode === 'interface_config' || mode === 'vlan_config') {
      return { lines: [''], newMode: 'global_config' };
    }
    if (mode === 'global_config') {
      return { lines: [''], newMode: 'privileged' };
    }
    if (mode === 'privileged') {
      return { lines: [''], newMode: 'user' };
    }
    return { lines: [''] };
  }

  if (cmd0 === '?' || cmd0 === 'help') {
    const cmds = mode === 'user'
      ? ['  enable          — Enter privileged EXEC mode', '  ping            — Send echo messages', '  traceroute      — Trace route to destination', '  show            — Show running system information', '  exit            — Exit current mode', '  ?               — Show available commands']
      : mode === 'privileged'
      ? ['  configure terminal (conf t) — Enter global configuration mode',
         '  show ip route            — Routing table',
         '  show ip ospf neighbor    — OSPF neighbors',
         '  show ip ospf database    — OSPF LSDB',
         '  show ip ospf interface   — OSPF interface details',
         '  show ip protocols        — Routing protocols summary',
         '  show ip interface brief  — Interface status (ip int br)',
         '  show running-config      — Current config',
         '  show version             — IOS version',
         '  show vlan                — VLAN table',
         '  show cdp neighbor        — CDP neighbor table',
         '  show spanning-tree       — STP topology',
         '  show ip bgp              — BGP RIB',
         '  show ip eigrp neighbor   — EIGRP neighbors',
         '  ping <ip>                — ICMP echo',
         '  traceroute <ip>          — Path trace',
         '  debug ip ospf events     — OSPF debug',
         '  debug ip packet          — IP packet debug',
         '  write memory             — Save config',
         '  copy run start           — Copy running-config',
         '  reload                   — Restart device',
         '  ?                        — Show available commands']
      : mode === 'global_config'
      ? ['  interface <name>          — Enter interface config',
         '  ip route <net> <mask> <nh> — Static route',
         '  hostname <name>           — Set hostname',
         '  router ospf <id>          — OSPF process',
         '  router bgp <asn>          — BGP process',
         '  vlan <id>                 — Create VLAN & enter vlan-config',
         '  no <command>              — Negate command',
         '  banner motd # <text> #    — Login banner',
         '  exit                      — Return to privileged EXEC',
         '  ?                        — Show available commands']
      : mode === 'interface_config'
      ? ['  ip address <ip> <mask>        — Set interface IP',
         '  no ip address                 — Remove IP',
         '  no shutdown                   — Enable interface',
         '  shutdown                      — Disable interface',
         '  duplex (full|half|auto)       — Set duplex',
         '  speed (10|100|1000|auto)      — Set speed',
         '  description <text>            — Set description',
         '  switchport mode (access|trunk) — Set switchport mode',
         '  switchport access vlan <id>   — Assign to VLAN',
         '  switchport trunk allowed vlan — Trunk VLAN list',
         '  ip ospf cost <cost>           — Set OSPF cost',
         '  ip ospf priority <pri>        — Set OSPF priority',
         '  exit                          — Return to global config',
         '  ?                            — Show available commands']
      : mode === 'vlan_config'
      ? ['  name <vlan-name>  — Set VLAN name',
         '  state active      — Set VLAN state active',
         '  exit              — Return to global config',
         '  ?                — Show available commands']
      : [];
    return { lines: ['', ...cmds, ''] };
  }

  // ──── USER EXEC MODE ────
  if (mode === 'user') {
    if (cmd0 === 'enable') {
      // simplified: accept any password or blank
      return { lines: [''], newMode: 'privileged' };
    }
    if (cmd0 === 'ping') {
      return { lines: buildPing(rest) };
    }
    if (cmd0 === 'traceroute' || cmd0 === 'trace') {
      return { lines: buildTraceroute(rest) };
    }
    if (cmd0 === 'show') {
      return { lines: buildShow(lrest, hostname) };
    }
    return { lines: [`% Unknown command: '${parts[0]}'. Type '?' for help.`] };
  }

  // ──── PRIVILEGED EXEC MODE ────
  if (mode === 'privileged') {
    if (cmd0 === 'configure' || (cmd0 === 'conf' && lparts[1]?.startsWith('t'))) {
      return { lines: ['Enter configuration commands, one per line. End with CNTL/Z.'], newMode: 'global_config' };
    }
    if (cmd0 === 'show') {
      return { lines: buildShow(lrest, hostname) };
    }
    if (cmd0 === 'ping') return { lines: buildPing(rest) };
    if (cmd0 === 'traceroute' || cmd0 === 'trace') return { lines: buildTraceroute(rest) };
    if (cmd0 === 'clear') return { lines: ['__CLEAR__'] };
    if (lparts[0] === 'write' && lparts[1]?.startsWith('m')) {
      return { lines: ['Building configuration...', '[OK]'] };
    }
    if (lparts[0] === 'copy' && lparts[1] === 'run') {
      return { lines: ['Destination filename [startup-config]? ', 'Building configuration...', '[OK]'] };
    }
    if (cmd0 === 'reload') {
      return { lines: ['Proceed with reload? [confirm]', 'System Bootstrap, Version 12.4', 'Simulation reloaded.'], newMode: 'user' };
    }
  if (lparts[0] === 'debug') {
    const debugSubject = lparts.slice(1).join(' ');
    if (debugSubject.startsWith('ip ospf')) {
      const ospfEvent = lparts[3] ?? 'events';
      return { lines: [
        `OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.2 on FastEthernet0/0 from LOADING to FULL, Loading Done`,
        `OSPF-5-ADJCHG: Process 1, Nbr 10.1.1.2 on Serial0/0 from LOADING to FULL, Loading Done`,
        `%OSPF-4-NONEIGHBOR: Received packet from non-neighbor 10.10.10.2 on FastEthernet0/1`,
        `IP OSPF ${ospfEvent} debugging is on`,
      ] };
    }
    if (debugSubject.startsWith('ip packet')) {
      return { lines: [`IP packet debugging is on`] };
    }
    if (debugSubject.startsWith('ip rip')) {
      return { lines: [`RIP protocol debugging is on`] };
    }
    if (debugSubject.startsWith('ip bgp')) {
      return { lines: [`BGP debugging is on`] };
    }
    return { lines: [`${parts.slice(1).join(' ')} debugging is on`] };
  }
    return { lines: [`% Unknown command: '${parts[0]}'. Type '?' for help.`] };
  }

  // ──── GLOBAL CONFIG MODE ────
  if (mode === 'global_config') {
    if (cmd0 === 'hostname' && parts[1]) {
      return { lines: [''], newHostname: parts[1] };
    }
    if (cmd0 === 'interface' || cmd0 === 'int') {
      const ifaceName = parts.slice(1).join('');
      if (!ifaceName) return { lines: ['% Incomplete command.'] };
      return { lines: [''], newMode: 'interface_config', newIface: ifaceName };
    }
    if (lparts[0] === 'ip' && lparts[1] === 'route') {
      const net = parts[2] ?? '0.0.0.0';
      const mask = parts[3] ?? '0.0.0.0';
      const nh = parts[4] ?? '192.168.1.1';
      return { lines: [`% Route ${net}/${mask} via ${nh} added.`] };
    }
    if (lparts[0] === 'enable' && lparts[1] === 'password') {
      return { lines: [''] };
    }
    if (lparts[0] === 'vlan') {
      const vlanId = parts[1] ?? '1';
      return { lines: [`VLAN ${vlanId} created.`], newMode: 'vlan_config' };
    }
    // BGP process config
    if (lparts[0] === 'router' && lparts[1] === 'bgp') {
      const asn = parts[2] ?? '65001';
      return { lines: [`% Entering BGP configuration for AS ${asn}.`, `% Use 'neighbor', 'network', 'redistribute' commands.`] };
    }
    // OSPF process config
    if (lparts[0] === 'router' && lparts[1] === 'ospf') {
      const pid = parts[2] ?? '1';
      return { lines: [`% Entering OSPF process ${pid} configuration.`] };
    }
    if (lparts[0] === 'no') {
      return { lines: [`% Negating: ${rest}`] };
    }
    if (lparts[0] === 'banner') {
      return { lines: ['Banner set.'] };
    }
    return { lines: [`% Unknown config command: '${parts[0]}'. Type '?' for help.`] };
  }

  // ──── INTERFACE CONFIG MODE ────
  if (mode === 'interface_config') {
    if (lparts[0] === 'ip' && lparts[1] === 'address') {
      const ip = parts[2] ?? '192.168.1.1';
      const mask = parts[3] ?? '255.255.255.0';
      return { lines: [`% ${currentIface}: IP address ${ip} ${mask} configured.`] };
    }
    if (lparts[0] === 'no' && lparts[1] === 'ip') {
      return { lines: [`% ${currentIface}: IP address removed.`] };
    }
    if (lparts[0] === 'no' && lparts[1] === 'shutdown') {
      return { lines: [`%LINK-5-CHANGED: Interface ${currentIface}, changed state to up`, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${currentIface}, changed state to up`] };
    }
    if (cmd0 === 'shutdown') {
      return { lines: [`%LINK-5-CHANGED: Interface ${currentIface}, changed state to administratively down`, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${currentIface}, changed state to down`] };
    }
    if (cmd0 === 'description') {
      return { lines: [`% ${currentIface}: description set to "${rest}"`] };
    }
    if (cmd0 === 'duplex') {
      return { lines: [`% ${currentIface}: duplex set to ${rest}`] };
    }
    if (cmd0 === 'speed') {
      return { lines: [`% ${currentIface}: speed set to ${rest}`] };
    }
    // VLAN switchport commands
    if (lparts[0] === 'switchport' && lparts[1] === 'mode') {
      const swMode = parts[2] ?? 'access';
      return { lines: [`% ${currentIface}: switchport mode set to ${swMode}.`] };
    }
    if (lparts[0] === 'switchport' && lparts[1] === 'access' && lparts[2] === 'vlan') {
      const vlanId = parts[3] ?? '1';
      return { lines: [`% ${currentIface}: assigned to VLAN ${vlanId}.`] };
    }
    if (lparts[0] === 'switchport' && lparts[1] === 'trunk') {
      return { lines: [`% ${currentIface}: trunk configuration updated.`] };
    }
    if (lparts[0] === 'switchport' && lparts[1] === 'nonegotiate') {
      return { lines: [`% ${currentIface}: DTP negotiation disabled.`] };
    }
    return { lines: [`% Unknown interface command: '${parts[0]}'. Type '?' for help.`] };
  }

  // ──── VLAN CONFIG MODE ────
  if (mode === 'vlan_config') {
    if (cmd0 === 'name') {
      return { lines: [`% VLAN name set to "${rest}"`] };
    }
    return { lines: [`% Unknown vlan command: '${parts[0]}'.`] };
  }

  return { lines: [`% Unknown command: '${parts[0]}'.`] };
}

function buildPing(target: string): string[] {
  if (!target) return ['Usage: ping <ip_address>'];
  const lat = () => Math.floor(Math.random() * 40) + 1;
  const l = lat();
  return [
    `Type escape sequence to abort.`,
    `Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:`,
    `!!!!!`,
    `Success rate is 100 percent (5/5), round-trip min/avg/max = ${l-1}/${l}/${l+2} ms`,
  ];
}

function buildTraceroute(target: string): string[] {
  if (!target) return ['Usage: traceroute <ip_address>'];
  const lat = () => Math.floor(Math.random() * 15) + 1;
  return [
    `Type escape sequence to abort.`,
    `Tracing the route to ${target}:`,
    `  1  192.168.1.254  ${lat()} msec  ${lat()} msec  ${lat()} msec`,
    `  2  10.0.0.1       ${lat()} msec  ${lat()} msec  ${lat()} msec`,
    `  3  ${target}      ${lat()} msec  ${lat()} msec  ${lat()} msec`,
    `Trace complete.`,
  ];
}

function buildShow(lrest: string, hostname: string): string[] {
  if (lrest.startsWith('ip route')) {
    return [
      `Codes: C - connected, S - static, I - IGRP, R - RIP, O - OSPF`,
      ``,
      `C   192.168.1.0/24 is directly connected, FastEthernet0/0`,
      `C   10.0.0.0/30    is directly connected, Serial0/0`,
      `S*  0.0.0.0/0 [1/0] via 192.168.1.254`,
    ];
  }
  if (lrest.startsWith('ip interface brief') || lrest === 'ip int br') {
    return [
      `Interface              IP-Address      OK? Method Status                Protocol`,
      `FastEthernet0/0        192.168.1.1     YES NVRAM  up                    up`,
      `FastEthernet0/1        unassigned      YES NVRAM  administratively down  down`,
      `Serial0/0              10.0.0.1        YES NVRAM  up                    up`,
      `Loopback0              127.0.0.1       YES NVRAM  up                    up`,
    ];
  }
  if (lrest === 'interfaces' || lrest.startsWith('interface')) {
    return [
      `FastEthernet0/0 is up, line protocol is up`,
      `  Hardware is Fast Ethernet, address is 0060.5c3b.1234`,
      `  Internet address is 192.168.1.1/24`,
      `  MTU 1500 bytes, BW 100000 Kbit, DLY 100 usec`,
      `  Full-duplex, 100Mb/s`,
      `FastEthernet0/1 is administratively down, line protocol is down`,
      `Serial0/0 is up, line protocol is up`,
      `  Internet address is 10.0.0.1/30`,
      `  MTU 1500 bytes, BW 1544 Kbit`,
    ];
  }
  if (lrest.startsWith('running-config') || lrest === 'run') {
    return [
      `Building configuration...`,
      ``,
      `Current configuration : 742 bytes`,
      `!`,
      `version 12.4`,
      `service timestamps debug uptime`,
      `service timestamps log uptime`,
      `!`,
      `hostname ${hostname}`,
      `!`,
      `enable secret 5 $1$XXXX$encrypted`,
      `!`,
      `interface FastEthernet0/0`,
      ` ip address 192.168.1.1 255.255.255.0`,
      ` no shutdown`,
      `!`,
      `interface Serial0/0`,
      ` ip address 10.0.0.1 255.255.255.252`,
      ` no shutdown`,
      `!`,
      `ip route 0.0.0.0 0.0.0.0 192.168.1.254`,
      `!`,
      `end`,
    ];
  }
  if (lrest.startsWith('version')) {
    return [
      `Cisco IOS Software, Version 12.4(24)T`,
      `Copyright (c) 1986-2024 by Cisco Systems, Inc.`,
      ``,
      `ROM: System Bootstrap, Version 12.4(13r)T, RELEASE SOFTWARE`,
      ``,
      `${hostname} uptime is 2 hours, 14 minutes`,
      `System returned to ROM by power-on`,
      ``,
      `Cisco 2811 (revision 53.50) with 249856K/12288K bytes of memory.`,
      `Processor board ID FHK1234`,
      `2 FastEthernet interfaces`,
      `2 Serial(sync/async) interfaces`,
      `Configuration register is 0x2102`,
    ];
  }
  if (lrest.startsWith('vlan brief') || lrest === 'vlan') {
    return buildVlanBrief();
  }
  if (lrest.startsWith('vlan')) {
    return buildVlanBrief();
  }
  if (lrest.startsWith('cdp neighbor')) {
    return [
      `Capability Codes: R - Router, T - Trans Bridge, S - Switch`,
      ``,
      `Device ID    Local Intf   Holdtime  Capability  Platform    Port ID`,
      `Switch-1     Fa0/0        120        S           WS-C2960    Fa0/1`,
      `Router-Edge  Se0/0        150        R           C2811       Se0/0`,
    ];
  }
  if (lrest.startsWith('ip ospf neighbor') || lrest === 'ip ospf neigh') {
    return buildOspfNeighbors();
  }
  if (lrest.startsWith('ip ospf database') || lrest === 'ip ospf data') {
    return buildOspfDatabase();
  }
  if (lrest.startsWith('ip ospf interface') || lrest === 'ip ospf int') {
    return buildOspfInterface();
  }
  if (lrest.startsWith('ip ospf') || lrest === 'ip ospf') {
    return [
      `OSPF is enabled. Process ID 1`,
      `  Router ID: 10.0.0.1`,
      `  Number of areas in this router is 1: 1 normal, 0 stub, 0 nssa`,
      `  Number of LSAs in router's database: 8`,
      `  External flood list length 0`,
    ];
  }
  if (lrest.startsWith('ip protocols') || lrest === 'ip proto') {
    return buildIpProtocols();
  }
  if (lrest.startsWith('ip bgp')) {
    const bgpSub = lrest.slice('ip bgp'.length).trim();
    if (bgpSub.startsWith('neighbor')) {
      return buildBgpNeighbors();
    }
    if (bgpSub.startsWith('summary')) {
      return buildBgpSummary();
    }
    // show ip bgp [network]
    return buildBgpRib(bgpSub);
  }
  if (lrest.startsWith('ip eigrp neighbor')) {
    return [
      `EIGRP-IPv4 Neighbors for AS(100)`,
      `H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq`,
      `                                                   (sec)         (ms)       Cnt Num`,
      `1   10.1.1.2               Se0/0                    11 02:14:22    2   200  0  14`,
      `0   192.168.1.2            Fa0/0                    12 02:14:30    1   200  0  10`,
    ];
  }
  if (lrest.startsWith('spanning-tree') || lrest === 'span') {
    return [
      `VLAN0001`,
      `  Spanning tree enabled protocol ieee`,
      `  Root ID    Priority    32769`,
      `             Address     0060.5c3b.1234`,
      `             This bridge is the root`,
      `             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec`,
      `  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)`,
      `             Address     0060.5c3b.1234`,
      `  Interface           Role Sts Cost      Prio.Nbr Type`,
      `  ------------------- ---- --- --------- -------- ----------------`,
      `  Fa0/1               Desg FWD 19        128.1    P2p`,
      `  Fa0/2               Desg FWD 19        128.2    P2p`,
    ];
  }
  return [`% Unknown show command. Type '?' for available show subcommands.`];
}

function buildVlanBrief(): string[] {
  return [
    `VLAN Name                             Status    Ports`,
    `---- -------------------------------- --------- -------------------------------`,
    `1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4`,
    `10   Management                       active    Fa0/5, Fa0/6`,
    `20   Servers                          active    Fa0/7, Fa0/8`,
    `30   VoIP                             active    Fa0/9, Fa0/10`,
    `100  DMZ                              active    Fa0/11`,
    `999  NATIVE                           active    `,
    `1002 fddi-default                     act/unsup `,
    `1003 token-ring-default               act/unsup `,
  ];
}

function buildBgpRib(filter: string): string[] {
  const network = filter && filter !== '' ? filter : undefined;
  const base = [
    `BGP table version is 12, local router ID is 10.0.0.1`,
    `Status codes: s suppressed, d damped, h history, * valid, > best, = multipath,`,
    `              i internal, r RIB-failure, S Stale, m multipath, b backup-path`,
    `Origin codes: i - IGP, e - EGP, ? - incomplete`,
    ``,
    `   Network          Next Hop            Metric LocPrf Weight Path`,
    `*> 0.0.0.0/0        192.168.1.254            0             0 65001 i`,
    `*> 10.0.0.0/8       10.10.0.1                0             0 65002 65003 i`,
    `*> 172.16.0.0/16    10.10.0.1               10             0 65002 i`,
    `*> 192.168.10.0/24  10.10.0.2                0         100 32768 i`,
    `*  192.168.20.0/24  192.168.1.254            5             0 65001 65004 i`,
  ];
  if (network) {
    return [
      `BGP routing table entry for ${network}, version 7`,
      `Paths: (2 available, best #1, table Default-IP-Routing-Table)`,
      `  Advertised to update-groups:`,
      `     1         2`,
      `  65001`,
      `    192.168.1.254 from 192.168.1.254 (192.168.1.254)`,
      `      Origin IGP, metric 0, localpref 100, weight 0, valid, external, best`,
      `      Community: 65001:100`,
      `      Last update: 00:12:34`,
    ];
  }
  return base;
}

function buildBgpNeighbors(): string[] {
  return [
    `BGP neighbor is 192.168.1.254, remote AS 65001, external link`,
    `  BGP version 4, remote router ID 192.168.1.254`,
    `  BGP state = Established, up for 01:23:45`,
    `  Last read 00:00:14, last write 00:00:08, hold time is 180, keepalive interval is 60 seconds`,
    `  Neighbor sessions:`,
    `    1 active, is not multisession capable`,
    `  Neighbor capabilities:`,
    `    Route refresh: advertised and received (new)`,
    `    Address family IPv4 Unicast: advertised and received`,
    `  Message statistics:`,
    `    InQ depth is 0`,
    `    OutQ depth is 0`,
    `                         Sent       Rcvd`,
    `    Opens:                  1          1`,
    `    Notifications:          0          0`,
    `    Updates:               14          8`,
    `    Keepalives:            92         91`,
    `    Route Refresh:          0          0`,
    `    Total:                107        100`,
    `  Prefixes accepted: 5, Prefixes advertised: 3`,
    ``,
    `BGP neighbor is 10.10.0.1, remote AS 65002, external link`,
    `  BGP version 4, remote router ID 10.10.0.1`,
    `  BGP state = Established, up for 00:48:22`,
    `  Address family IPv4 Unicast: advertised and received`,
    `  Prefixes accepted: 2, Prefixes advertised: 3`,
  ];
}

function buildBgpSummary(): string[] {
  return [
    `BGP router identifier 10.0.0.1, local AS number 65000`,
    `BGP table version is 12, main routing table version 12`,
    `5 network entries using 740 bytes of memory`,
    `8 path entries using 640 bytes of memory`,
    `4/3 BGP path/bestpath attribute entries using 576 bytes of memory`,
    `2 BGP AS-PATH entries using 48 bytes of memory`,
    `0 BGP route-map cache entries using 0 bytes of memory`,
    `0 BGP filter-list cache entries using 0 bytes of memory`,
    `BGP using 2004 total bytes of memory`,
    `BGP activity 5/0 prefixes, 8/0 paths, scan interval 60 secs`,
    ``,
    `Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ  Up/Down   State/PfxRcd`,
    `192.168.1.254   4 65001     100     107       12    0    0 01:23:45          5`,
    `10.10.0.1       4 65002      60      65       12    0    0 00:48:22          2`,
  ];
}

function buildOspfNeighbors(): string[] {
  return [
    `Neighbor ID     Pri   State           Dead Time   Address         Interface`,
    `10.1.1.2          1   FULL/DR         00:00:39    10.1.1.2        FastEthernet0/0`,
    `10.2.2.2          1   FULL/BDR        00:00:36    10.2.2.1        Serial0/0`,
    `10.3.3.3          1   FULL/  -        00:00:37    10.3.3.1        Serial0/1`,
  ];
}

function buildOspfDatabase(): string[] {
  return [
    `            OSPF Router with ID (10.0.0.1) (Process ID 1)`,
    ``,
    `                Router Link States (Area 0)`,
    ``,
    `Link ID         ADV Router      Age         Seq#       Checksum Link count`,
    `10.0.0.1        10.0.0.1        123         0x80000003 0x002BCA 3`,
    `10.1.1.2        10.1.1.2        234         0x80000004 0x001FA2 2`,
    `10.2.2.2        10.2.2.2        345         0x80000002 0x003D11 2`,
    ``,
    `                Net Link States (Area 0)`,
    ``,
    `Link ID         ADV Router      Age         Seq#       Checksum`,
    `192.168.1.1     10.0.0.1        120         0x80000001 0x00A3B1`,
    ``,
    `                Summary Net Link States (Area 0)`,
    ``,
    `Link ID         ADV Router      Age         Seq#       Checksum`,
    `172.16.0.0      10.0.0.1        456         0x80000001 0x00F210`,
  ];
}

function buildOspfInterface(): string[] {
  return [
    `FastEthernet0/0 is up, line protocol is up`,
    `  Internet Address 192.168.1.1/24, Area 0, Attached via Network Statement`,
    `  Process ID 1, Router ID 10.0.0.1, Network Type BROADCAST, Cost: 10`,
    `  Transmit Delay is 1 sec, State DR, Priority 1`,
    `  Designated Router (ID) 10.0.0.1, Interface address 192.168.1.1`,
    `  Backup Designated router (ID) 10.1.1.2, Interface address 192.168.1.2`,
    `  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5`,
    `    oob-resync timeout 40`,
    `    Hello due in 00:00:04`,
    `  Supports Link-local Signaling (LLS)`,
    `  Index 1/1, flood queue length 0`,
    `  Next 0x0(0)/0x0(0)`,
    `  Last flood scan length is 1, maximum is 1`,
    ``,
    `Serial0/0 is up, line protocol is up`,
    `  Internet Address 10.0.0.1/30, Area 0, Attached via Network Statement`,
    `  Process ID 1, Router ID 10.0.0.1, Network Type POINT_TO_POINT, Cost: 64`,
    `  Transmit Delay is 1 sec, State POINT_TO_POINT`,
    `  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5`,
    `    Hello due in 00:00:07`,
  ];
}

function buildIpProtocols(): string[] {
  return [
    `*** IP Routing is NSF aware ***`,
    ``,
    `Routing Protocol is "ospf 1"`,
    `  Outgoing update filter list for all interfaces is not set`,
    `  Incoming update filter list for all interfaces is not set`,
    `  Router ID 10.0.0.1`,
    `  Number of areas in this router is 1: 1 normal, 0 stub, 0 nssa`,
    `  Maximum path: 4`,
    `  Routing for Networks:`,
    `    192.168.1.0 0.0.0.255 area 0`,
    `    10.0.0.0 0.0.0.3 area 0`,
    `  Routing Information Sources:`,
    `    Gateway         Distance      Last Update`,
    `    10.1.1.2             110      00:02:14`,
    `    10.2.2.2             110      00:02:14`,
    `  Distance: (default is 110)`,
    ``,
    `Routing Protocol is "static"`,
    `  Outgoing update filter list for all interfaces is not set`,
    `  Incoming update filter list for all interfaces is not set`,
  ];
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  lines: [
    { id: 'sys_1', text: 'PacketFlow IOS Simulator — v12.4', type: 'system', timestamp: new Date() },
    { id: 'sys_2', text: "Type '?' or 'help' for available commands.", type: 'system', timestamp: new Date() },
    { id: 'sys_3', text: '', type: 'system', timestamp: new Date() },
  ],
  history: [],
  historyIndex: -1,
  isExpanded: false,
  currentInput: '',
  cliMode: 'user',
  hostname: 'Router',
  currentIface: 'FastEthernet0/0',
  enablePassword: '',

  getPrompt: () => {
    const { cliMode, hostname, currentIface } = get();
    return getPromptFor(cliMode, hostname, currentIface);
  },

  addLine: (text, type = 'output') =>
    set((s) => ({
      lines: [
        ...s.lines,
        { id: `line_${Date.now()}_${Math.random()}`, text, type, timestamp: new Date() },
      ],
    })),

  clearLines: () => set({
    lines: [
      { id: 'sys_clr', text: 'Console cleared.', type: 'system', timestamp: new Date() },
    ],
  }),

  setExpanded: (isExpanded) => set({ isExpanded }),

  setInput: (currentInput) => set({ currentInput }),

  historyUp: () => {
    const { history, historyIndex } = get();
    const newIndex = Math.min(historyIndex + 1, history.length - 1);
    set({ historyIndex: newIndex });
    return history[newIndex] ?? '';
  },

  historyDown: () => {
    const { history, historyIndex } = get();
    const newIndex = Math.max(historyIndex - 1, -1);
    set({ historyIndex: newIndex });
    return newIndex === -1 ? '' : (history[newIndex] ?? '');
  },

  executeCommand: (command) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    const { cliMode, hostname, currentIface, enablePassword } = get();
    const prompt = getPromptFor(cliMode, hostname, currentIface);

    set((s) => ({
      history: [trimmed, ...s.history].slice(0, 100),
      historyIndex: -1,
      currentInput: '',
    }));

    get().addLine(`${prompt} ${trimmed}`, 'input');

    const result = processIosCommand(trimmed, cliMode, hostname, currentIface, enablePassword);

    if (result.lines[0] === '__CLEAR__') {
      get().clearLines();
      return;
    }

    // Apply state changes
    if (result.newMode) set({ cliMode: result.newMode });
    if (result.newHostname) set({ hostname: result.newHostname });
    if (result.newIface) set({ currentIface: result.newIface });

    for (const line of result.lines) {
      const isError = line.startsWith('%');
      get().addLine(line, isError ? 'error' : 'output');
    }
  },

  exportLogs: () => {
    const { lines } = get();
    return lines.map((l) => `[${l.timestamp.toISOString()}] ${l.text}`).join('\n');
  },
}));
