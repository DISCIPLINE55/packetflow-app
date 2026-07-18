import type { CableType, DeviceCatalogItem, DeviceType, NetworkEdge, NetworkNode } from '@/types';

export const GRID_SIZE = 40;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const DEFAULT_ZOOM = 1;
export const UNDO_STACK_SIZE = 50;
export const AUTO_SAVE_INTERVAL = 30000; // 30s

export const DEVICE_CATALOG: DeviceCatalogItem[] = [
  // ── LAYER 1 — PHYSICAL ──────────────────────────────────────────────────
  { type: 'hub', label: 'Hub', description: 'Layer 1 shared collision domain', category: 'switches', defaultInterfaces: [{ name: 'Fa0/1', status: 'down' }, { name: 'Fa0/2', status: 'down' }, { name: 'Fa0/3', status: 'down' }, { name: 'Fa0/4', status: 'down' }] },
  { type: 'repeater', label: 'Repeater', description: 'L1 signal amplifier/regenerator', category: 'switches', defaultInterfaces: [{ name: 'Port0', status: 'down' }, { name: 'Port1', status: 'down' }] },
  { type: 'patch_panel', label: 'Patch Panel', description: '24-port structured cabling panel', category: 'switches', defaultInterfaces: Array.from({ length: 8 }, (_, i) => ({ name: `P${i + 1}`, status: 'down' as const })) },
  { type: 'media_converter', label: 'Media Converter', description: 'Copper ↔ Fiber media converter', category: 'switches', defaultInterfaces: [{ name: 'Rj45', status: 'down' }, { name: 'Sfp', status: 'down' }] },
  { type: 'modem', label: 'Modem', description: 'Analog/DSL modulator-demodulator', category: 'network', defaultInterfaces: [{ name: 'Line0', status: 'down' }, { name: 'Eth0', status: 'down' }] },
  { type: 'dsl_modem', label: 'DSL Modem', description: 'ADSL/VDSL broadband modem', category: 'network', defaultInterfaces: [{ name: 'DSL0', status: 'down' }, { name: 'Eth0', status: 'down' }] },
  { type: 'cable_modem', label: 'Cable Modem', description: 'DOCSIS cable broadband modem', category: 'network', defaultInterfaces: [{ name: 'Coax0', status: 'down' }, { name: 'Eth0', status: 'down' }] },
  { type: 'fiber_tap', label: 'Fiber Tap', description: 'Passive fiber optical tap/splitter', category: 'switches', defaultInterfaces: [{ name: 'In', status: 'down' }, { name: 'Out', status: 'down' }, { name: 'Tap', status: 'down' }] },
  { type: 'network_tap', label: 'Network TAP', description: 'Passive inline network test access', category: 'network', defaultInterfaces: [{ name: 'PortA', status: 'down' }, { name: 'PortB', status: 'down' }, { name: 'Monitor', status: 'down' }] },
  { type: 'sfp_module', label: 'SFP Module', description: 'Small form-factor pluggable transceiver', category: 'switches', defaultInterfaces: [{ name: 'Sfp0', status: 'down' }] },

  // ── LAYER 2 — DATA LINK ─────────────────────────────────────────────────
  { type: 'bridge', label: 'Bridge', description: 'L2 segment bridge', category: 'switches', defaultInterfaces: [{ name: 'Fa0/0', status: 'down' }, { name: 'Fa0/1', status: 'down' }] },
  { type: 'l2_switch', label: 'L2 Switch', description: 'Layer 2 Ethernet switch', category: 'switches', defaultInterfaces: [{ name: 'Fa0/1', status: 'down' }, { name: 'Fa0/2', status: 'down' }, { name: 'Fa0/3', status: 'down' }, { name: 'Fa0/4', status: 'down' }] },
  { type: 'managed_switch', label: 'Managed Switch', description: 'SNMP-managed L2 switch', category: 'switches', defaultInterfaces: [{ name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }, { name: 'Gi0/3', status: 'down' }, { name: 'Gi0/4', status: 'down' }] },
  { type: 'poe_switch', label: 'PoE Switch', description: 'Power-over-Ethernet 802.3af/at switch', category: 'switches', defaultInterfaces: [{ name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }, { name: 'Gi0/3', status: 'down' }, { name: 'Gi0/4', status: 'down' }] },
  { type: 'stackable_switch', label: 'Stackable Switch', description: 'StackWise/VSS stackable chassis', category: 'switches', defaultInterfaces: [{ name: 'Gi1/0/1', status: 'down' }, { name: 'Gi1/0/2', status: 'down' }, { name: 'Gi1/0/3', status: 'down' }, { name: 'Stack0', status: 'down' }] },
  { type: 'industrial_switch', label: 'Industrial Switch', description: 'Hardened DIN-rail L2 switch', category: 'switches', defaultInterfaces: [{ name: 'Fe0/1', status: 'down' }, { name: 'Fe0/2', status: 'down' }, { name: 'Fe0/3', status: 'down' }, { name: 'Fe0/4', status: 'down' }] },
  { type: 'access_switch', label: 'Access Switch', description: 'Wiring-closet 48-port access layer', category: 'switches', defaultInterfaces: [{ name: 'Fa0/1', status: 'down' }, { name: 'Fa0/2', status: 'down' }, { name: 'Fa0/3', status: 'down' }, { name: 'Gi0/1', status: 'down' }] },
  { type: 'distribution_switch', label: 'Distribution Switch', description: 'Aggregation/distribution layer switch', category: 'switches', defaultInterfaces: [{ name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }, { name: 'Te0/1', status: 'down' }, { name: 'Te0/2', status: 'down' }] },
  { type: 'stp_switch', label: 'STP Switch', description: 'Switch with Spanning Tree root role', category: 'switches', defaultInterfaces: [{ name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }, { name: 'Gi0/3', status: 'down' }] },
  { type: 'vlan_switch', label: 'VLAN Switch', description: '802.1Q VLAN trunk switch', category: 'switches', defaultInterfaces: [{ name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }, { name: 'Tr0/1', status: 'down' }] },

  // ── LAYER 3 — NETWORK ───────────────────────────────────────────────────
  { type: 'router', label: 'Router', description: 'Layer 3 routing device', category: 'routers', defaultInterfaces: [{ name: 'Fa0/0', status: 'down' }, { name: 'Fa0/1', status: 'down' }, { name: 'Se0/0', status: 'down' }, { name: 'Se0/1', status: 'down' }] },
  { type: 'core_router', label: 'Core Router', description: 'High-capacity backbone router', category: 'routers', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }, { name: 'Gi0/3', status: 'down' }] },
  { type: 'edge_router', label: 'Edge Router', description: 'ISP-facing WAN edge router', category: 'routers', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Se0/0', status: 'down' }, { name: 'Se0/1', status: 'down' }] },
  { type: 'isr_router', label: 'ISR Router', description: 'Cisco ISR G2 integrated services router', category: 'routers', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }, { name: 'Se0/0/0', status: 'down' }] },
  { type: 'asr_router', label: 'ASR Router', description: 'Cisco ASR 1000 aggregation services', category: 'routers', defaultInterfaces: [{ name: 'Gi0/0/0', status: 'down' }, { name: 'Gi0/0/1', status: 'down' }, { name: 'Te0/0/0', status: 'down' }] },
  { type: 'bgp_router', label: 'BGP Router', description: 'Internet BGP border gateway router', category: 'routers', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }, { name: 'Se0/0', status: 'down' }] },
  { type: 'mpls_router', label: 'MPLS Router', description: 'Label-switching MPLS P/PE router', category: 'routers', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }] },
  { type: 'multilayer_switch', label: 'Multilayer Switch', description: 'L3 routed inter-VLAN switch', category: 'switches', defaultInterfaces: [{ name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }, { name: 'Gi0/3', status: 'down' }, { name: 'Gi0/4', status: 'down' }] },
  { type: 'virtual_router', label: 'Virtual Router', description: 'Software VRF/virtual router instance', category: 'routers', defaultInterfaces: [{ name: 'vEth0', status: 'down' }, { name: 'vEth1', status: 'down' }] },
  { type: 'load_balancer', label: 'Load Balancer', description: 'L4–L7 traffic load balancer', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }] },

  // ── LAYER 4-7 — SECURITY & APPLICATION ─────────────────────────────────
  { type: 'firewall', label: 'Firewall', description: 'Stateful packet inspection firewall', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }] },
  { type: 'ngfw', label: 'NGFW', description: 'Next-generation firewall with deep inspection', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }, { name: 'Gi0/3', status: 'down' }] },
  { type: 'waf', label: 'WAF', description: 'Web application firewall (L7)', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }] },
  { type: 'ids', label: 'IDS', description: 'Intrusion detection system (passive)', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Monitor', status: 'down' }] },
  { type: 'ips', label: 'IPS', description: 'Intrusion prevention system (inline)', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }] },
  { type: 'utm', label: 'UTM', description: 'Unified threat management appliance', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }] },
  { type: 'proxy', label: 'Proxy Server', description: 'Forward/reverse HTTP proxy', category: 'network', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Eth1', status: 'down' }] },
  { type: 'ssl_accelerator', label: 'SSL Accelerator', description: 'TLS/SSL offload appliance', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }] },
  { type: 'vpn_concentrator', label: 'VPN Concentrator', description: 'IPSec/SSL VPN gateway', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Tun0', status: 'down' }] },
  { type: 'radius_server', label: 'RADIUS Server', description: 'AAA authentication server (802.1X)', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },

  // ── WIRELESS ────────────────────────────────────────────────────────────
  { type: 'access_point', label: 'Access Point', description: 'Wireless 802.11 access point', category: 'network', defaultInterfaces: [{ name: 'Fa0', status: 'down' }, { name: 'Wlan0', status: 'down' }] },
  { type: 'wireless_controller', label: 'Wireless Controller', description: 'Cisco WLC centralised AP management', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }] },
  { type: 'mesh_ap', label: 'Mesh AP', description: 'Wi-Fi 6/6E mesh backhaul node', category: 'network', defaultInterfaces: [{ name: 'Wlan0', status: 'down' }, { name: 'Wlan1', status: 'down' }] },
  { type: 'outdoor_ap', label: 'Outdoor AP', description: 'IP67 ruggedised outdoor access point', category: 'network', defaultInterfaces: [{ name: 'Fa0', status: 'down' }, { name: 'Wlan0', status: 'down' }] },
  { type: 'wan_optimizer', label: 'WAN Optimizer', description: 'WAN acceleration / deduplication', category: 'network', defaultInterfaces: [{ name: 'Gi0/0', status: 'down' }, { name: 'Gi0/1', status: 'down' }] },

  // ── SERVERS ─────────────────────────────────────────────────────────────
  { type: 'server', label: 'Server', description: 'Generic network server', category: 'servers', defaultInterfaces: [{ name: 'Fa0', status: 'down' }, { name: 'Fa1', status: 'down' }] },
  { type: 'web_server', label: 'Web Server', description: 'HTTP/HTTPS Apache/Nginx server', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'db_server', label: 'DB Server', description: 'MySQL/PostgreSQL/MSSQL database', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'dns_server', label: 'DNS Server', description: 'Domain Name System resolver', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'dhcp_server', label: 'DHCP Server', description: 'Dynamic Host Configuration server', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'ftp_server', label: 'FTP Server', description: 'File Transfer Protocol server', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'mail_server', label: 'Mail Server', description: 'SMTP/IMAP/POP3 mail relay', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'file_server', label: 'File Server', description: 'SMB/NFS shared file storage', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'auth_server', label: 'Auth Server', description: 'LDAP/AD authentication server', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'backup_server', label: 'Backup Server', description: 'Tape/disk backup & restore server', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'vm_host', label: 'VM Host', description: 'VMware/Hyper-V hypervisor host', category: 'servers', defaultInterfaces: [{ name: 'vmnic0', status: 'down' }, { name: 'vmnic1', status: 'down' }] },
  { type: 'nas_storage', label: 'NAS', description: 'Network-attached storage appliance', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Eth1', status: 'down' }] },
  { type: 'san_storage', label: 'SAN', description: 'Fibre Channel / iSCSI storage array', category: 'servers', defaultInterfaces: [{ name: 'Fc0', status: 'down' }, { name: 'Fc1', status: 'down' }] },
  { type: 'syslog_server', label: 'Syslog Server', description: 'Centralised RFC 5424 log collector', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'ntp_server', label: 'NTP Server', description: 'Stratum 1/2 time sync server', category: 'servers', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },

  // ── END DEVICES ─────────────────────────────────────────────────────────
  { type: 'pc', label: 'PC', description: 'Desktop workstation', category: 'end_devices', defaultInterfaces: [{ name: 'Fa0', status: 'down' }] },
  { type: 'laptop', label: 'Laptop', description: 'Portable PC with Wi-Fi', category: 'end_devices', defaultInterfaces: [{ name: 'Fa0', status: 'down' }, { name: 'Wlan0', status: 'down' }] },
  { type: 'tablet', label: 'Tablet', description: 'Wi-Fi / LTE tablet device', category: 'end_devices', defaultInterfaces: [{ name: 'Wlan0', status: 'down' }] },
  { type: 'smartphone', label: 'Smartphone', description: 'Wi-Fi / 5G mobile phone', category: 'end_devices', defaultInterfaces: [{ name: 'Wlan0', status: 'down' }] },
  { type: 'printer', label: 'Printer', description: 'Network laser/inkjet printer', category: 'end_devices', defaultInterfaces: [{ name: 'Fa0', status: 'down' }] },
  { type: 'thin_client', label: 'Thin Client', description: 'Diskless VDI/RDP thin client', category: 'end_devices', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'workstation', label: 'Workstation', description: 'High-performance engineering station', category: 'end_devices', defaultInterfaces: [{ name: 'Gi0', status: 'down' }] },
  { type: 'kiosk', label: 'Kiosk', description: 'Self-service touch kiosk', category: 'end_devices', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },

  // ── CLOUD / WAN ─────────────────────────────────────────────────────────
  { type: 'cloud', label: 'Cloud', description: 'Cloud / Internet symbol', category: 'network', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Eth1', status: 'down' }] },
  { type: 'internet', label: 'Internet', description: 'Public Internet boundary', category: 'network', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'wan_cloud', label: 'WAN Cloud', description: 'MPLS/SD-WAN provider cloud', category: 'network', defaultInterfaces: [{ name: 'Se0', status: 'down' }, { name: 'Se1', status: 'down' }] },
  { type: 'mpls_cloud', label: 'MPLS Cloud', description: 'MPLS label-switched WAN fabric', category: 'network', defaultInterfaces: [{ name: 'Se0', status: 'down' }, { name: 'Se1', status: 'down' }] },
  { type: 'satellite', label: 'Satellite', description: 'VSAT / LEO satellite link', category: 'network', defaultInterfaces: [{ name: 'Sat0', status: 'down' }] },
  { type: 'cellular_tower', label: 'Cellular Tower', description: '4G/5G base station', category: 'network', defaultInterfaces: [{ name: 'Air0', status: 'down' }, { name: 'Eth0', status: 'down' }] },

  // ── IoT / PHYSICAL ──────────────────────────────────────────────────────
  { type: 'ip_camera', label: 'IP Camera', description: 'PoE network surveillance camera', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'voip_phone', label: 'VoIP Phone', description: 'SIP/H.323 IP desk phone', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'ip_phone', label: 'IP Phone', description: 'Cisco Unified IP phone', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Pc', status: 'down' }] },
  { type: 'smart_tv', label: 'Smart TV', description: 'Network-connected Smart TV', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Wlan0', status: 'down' }] },
  { type: 'iot_sensor', label: 'IoT Sensor', description: 'Temperature/humidity/pressure sensor', category: 'iot', defaultInterfaces: [{ name: 'Wlan0', status: 'down' }] },
  { type: 'iot_gateway', label: 'IoT Gateway', description: 'Edge gateway for IoT sensors', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Wlan0', status: 'down' }] },
  { type: 'pos_terminal', label: 'POS Terminal', description: 'Point-of-sale payment terminal', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'atm_machine', label: 'ATM', description: 'Automated teller machine', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'industrial_controller', label: 'Industrial Controller', description: 'PLC/DCS industrial automation', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'plc', label: 'PLC', description: 'Programmable logic controller', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Com0', status: 'down' }] },
  { type: 'scada', label: 'SCADA', description: 'Supervisory control & data acquisition', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },
  { type: 'ups', label: 'UPS', description: 'Smart network-managed UPS', category: 'iot', defaultInterfaces: [{ name: 'Eth0', status: 'down' }] },

  // ── SDN / VIRTUAL ────────────────────────────────────────────────────────
  { type: 'sdn_controller', label: 'SDN Controller', description: 'OpenDaylight/ONOS SDN controller', category: 'sdn', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Eth1', status: 'down' }] },
  { type: 'openflow_switch', label: 'OpenFlow Switch', description: 'OpenFlow 1.3 programmable switch', category: 'sdn', defaultInterfaces: [{ name: 'Gi0/1', status: 'down' }, { name: 'Gi0/2', status: 'down' }] },
  { type: 'virtual_switch', label: 'Virtual Switch', description: 'VMware vSwitch / OVS hypervisor', category: 'sdn', defaultInterfaces: [{ name: 'vEth0', status: 'down' }, { name: 'vEth1', status: 'down' }] },
  { type: 'nfv_host', label: 'NFV Host', description: 'ETSI NFV virtualisation host', category: 'sdn', defaultInterfaces: [{ name: 'Eth0', status: 'down' }, { name: 'Eth1', status: 'down' }] },
  { type: 'docker_host', label: 'Docker Host', description: 'Container host with bridge networking', category: 'sdn', defaultInterfaces: [{ name: 'docker0', status: 'down' }, { name: 'Eth0', status: 'down' }] },
  { type: 'kubernetes_node', label: 'K8s Node', description: 'Kubernetes worker / control-plane node', category: 'sdn', defaultInterfaces: [{ name: 'cni0', status: 'down' }, { name: 'Eth0', status: 'down' }] },
];

export const DEVICE_CATEGORY_LABELS: Record<string, string> = {
  routers: 'ROUTERS',
  switches: 'SWITCHES / L1',
  end_devices: 'END DEVICES',
  network: 'NETWORK / SECURITY',
  servers: 'SERVERS',
  iot: 'IoT / PHYSICAL',
  sdn: 'SDN / VIRTUAL',
};

// Structured category list used by DeviceDrawer
export const DEVICE_CATEGORIES: { label: string; types: DeviceType[] }[] = [
  { label: 'Routers', types: ['router', 'core_router', 'edge_router', 'isr_router', 'asr_router', 'bgp_router', 'mpls_router', 'virtual_router'] },
  { label: 'Switches / L1', types: ['l2_switch', 'managed_switch', 'poe_switch', 'stackable_switch', 'industrial_switch', 'access_switch', 'distribution_switch', 'stp_switch', 'vlan_switch', 'multilayer_switch', 'hub', 'bridge', 'repeater', 'patch_panel', 'media_converter', 'fiber_tap', 'network_tap', 'sfp_module'] },
  { label: 'Security', types: ['firewall', 'ngfw', 'waf', 'ids', 'ips', 'utm', 'proxy', 'ssl_accelerator', 'vpn_concentrator', 'radius_server'] },
  { label: 'Wireless', types: ['access_point', 'wireless_controller', 'mesh_ap', 'outdoor_ap', 'wan_optimizer'] },
  { label: 'Servers', types: ['server', 'web_server', 'db_server', 'dns_server', 'dhcp_server', 'ftp_server', 'mail_server', 'file_server', 'auth_server', 'backup_server', 'vm_host', 'nas_storage', 'san_storage', 'syslog_server', 'ntp_server'] },
  { label: 'End Devices', types: ['pc', 'laptop', 'tablet', 'smartphone', 'printer', 'thin_client', 'workstation', 'kiosk'] },
  { label: 'Cloud / WAN', types: ['cloud', 'internet', 'wan_cloud', 'mpls_cloud', 'satellite', 'cellular_tower', 'modem', 'dsl_modem', 'cable_modem', 'load_balancer'] },
  { label: 'IoT / Physical', types: ['ip_camera', 'voip_phone', 'ip_phone', 'smart_tv', 'iot_sensor', 'iot_gateway', 'pos_terminal', 'atm_machine', 'industrial_controller', 'plc', 'scada', 'ups'] },
  { label: 'SDN / Virtual', types: ['sdn_controller', 'openflow_switch', 'virtual_switch', 'nfv_host', 'docker_host', 'kubernetes_node'] },
];

export const CABLE_LABELS: Record<string, string> = {
  ethernet: 'Ethernet (UTP)',
  fiber: 'Fiber Optic',
  serial: 'Serial (WAN)',
  console: 'Console (Rollover)',
  crossover: 'Crossover',
  coaxial: 'Coaxial',
  sfp: 'SFP / SFP+',
  dac_cable: 'DAC Cable',
  usb: 'USB',
  wireless: 'Wireless (Wi-Fi)',
};

export const CABLE_COLORS: Record<string, string> = {
  ethernet: '#3B82F6',
  fiber: '#22D3EE',
  serial: '#F59E0B',
  console: '#A78BFA',
  crossover: '#34D399',
  coaxial: '#FB923C',
  sfp: '#06B6D4',
  dac_cable: '#818CF8',
  usb: '#F472B6',
  wireless: '#4ADE80',
};

// Cable compatibility: maps device type → allowed cable types
// Used to warn users when they pick an incompatible cable
export const CABLE_COMPAT: Record<string, CableType[]> = {
  // Routers — serial WAN links, Ethernet, fiber uplinks
  router:          ['ethernet', 'fiber', 'serial', 'console', 'sfp', 'dac_cable'],
  core_router:     ['ethernet', 'fiber', 'serial', 'sfp', 'dac_cable'],
  edge_router:     ['ethernet', 'fiber', 'serial', 'sfp'],
  isr_router:      ['ethernet', 'serial', 'fiber', 'console'],
  asr_router:      ['fiber', 'sfp', 'dac_cable', 'ethernet'],
  bgp_router:      ['fiber', 'sfp', 'ethernet', 'serial'],
  mpls_router:     ['fiber', 'sfp', 'ethernet', 'serial'],
  multilayer_switch:['ethernet', 'fiber', 'sfp', 'dac_cable'],
  l3_switch:       ['ethernet', 'fiber', 'sfp', 'dac_cable'],
  virtual_router:  ['ethernet', 'fiber'],
  load_balancer:   ['ethernet', 'fiber', 'sfp'],
  // L2 Switches — Ethernet, fiber uplinks, SFP
  l2_switch:       ['ethernet', 'fiber', 'sfp', 'crossover'],
  managed_switch:  ['ethernet', 'fiber', 'sfp', 'crossover'],
  poe_switch:      ['ethernet', 'fiber', 'sfp'],
  stackable_switch:['ethernet', 'fiber', 'sfp', 'dac_cable'],
  industrial_switch:['ethernet', 'fiber', 'sfp', 'coaxial'],
  access_switch:   ['ethernet', 'fiber', 'sfp'],
  distribution_switch:['ethernet', 'fiber', 'sfp', 'dac_cable'],
  stp_switch:      ['ethernet', 'fiber', 'sfp'],
  vlan_switch:     ['ethernet', 'fiber', 'sfp'],
  // L1
  hub:             ['ethernet', 'crossover', 'coaxial'],
  repeater:        ['ethernet', 'coaxial'],
  bridge:          ['ethernet', 'fiber'],
  patch_panel:     ['ethernet'],
  modem:           ['ethernet', 'coaxial', 'serial'],
  dsl_modem:       ['ethernet', 'serial'],
  cable_modem:     ['ethernet', 'coaxial'],
  media_converter: ['ethernet', 'fiber'],
  sfp_module:      ['sfp', 'dac_cable', 'fiber'],
  fiber_tap:       ['fiber'],
  network_tap:     ['ethernet', 'fiber'],
  // Security
  firewall:        ['ethernet', 'fiber', 'sfp'],
  ngfw:            ['ethernet', 'fiber', 'sfp'],
  waf:             ['ethernet', 'fiber'],
  ids:             ['ethernet', 'fiber'],
  ips:             ['ethernet', 'fiber'],
  utm:             ['ethernet', 'fiber'],
  proxy:           ['ethernet', 'fiber'],
  ssl_accelerator: ['ethernet', 'fiber'],
  vpn_concentrator:['ethernet', 'fiber', 'serial'],
  radius_server:   ['ethernet', 'fiber'],
  // Wireless
  access_point:    ['ethernet', 'wireless'],
  wireless_controller:['ethernet', 'fiber'],
  mesh_ap:         ['ethernet', 'wireless'],
  outdoor_ap:      ['ethernet', 'wireless', 'fiber'],
  wan_optimizer:   ['ethernet', 'fiber', 'serial'],
  // Servers
  server:          ['ethernet', 'fiber', 'sfp'],
  web_server:      ['ethernet', 'fiber'],
  db_server:       ['ethernet', 'fiber'],
  dns_server:      ['ethernet', 'fiber'],
  dhcp_server:     ['ethernet', 'fiber'],
  ftp_server:      ['ethernet', 'fiber'],
  mail_server:     ['ethernet', 'fiber'],
  ntp_server:      ['ethernet', 'fiber'],
  syslog_server:   ['ethernet', 'fiber'],
  snmp_server:     ['ethernet', 'fiber'],
  // End devices
  pc:              ['ethernet', 'crossover', 'usb'],
  laptop:          ['ethernet', 'wireless', 'usb'],
  printer:         ['ethernet', 'usb', 'wireless'],
  ip_phone:        ['ethernet'],
  smartphone:      ['wireless', 'usb'],
  tablet:          ['wireless', 'usb'],
  thin_client:     ['ethernet'],
  // Cloud/WAN
  cloud:           ['ethernet', 'fiber', 'serial', 'sfp'],
  wan_cloud:       ['fiber', 'serial', 'sfp'],
  mpls_cloud:      ['fiber', 'serial', 'sfp'],
  internet:        ['fiber', 'ethernet'],
  // IoT
  iot_sensor:      ['ethernet', 'wireless', 'usb'],
  iot_gateway:     ['ethernet', 'wireless', 'fiber'],
  plc:             ['ethernet', 'serial', 'coaxial'],
  rtu:             ['serial', 'ethernet'],
  // SDN
  sdn_controller:  ['ethernet', 'fiber'],
  openflow_switch: ['ethernet', 'fiber', 'sfp'],
};

export function getCableCompatWarning(
  sourceType: DeviceType,
  targetType: DeviceType,
  cable: CableType
): string | null {
  const srcCompat = CABLE_COMPAT[sourceType];
  const tgtCompat = CABLE_COMPAT[targetType];
  const srcOk = !srcCompat || srcCompat.includes(cable);
  const tgtOk = !tgtCompat || tgtCompat.includes(cable);
  if (srcOk && tgtOk) return null;
  const incompatDevice = !srcOk ? sourceType.replace(/_/g, ' ') : targetType.replace(/_/g, ' ');
  return `⚠️ ${cable.replace(/_/g, ' ')} cable is not typically used with ${incompatDevice}. Proceed anyway?`;
}

export function generateMac(): string {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
  ).join(':');
}

export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateEdgeId(): string {
  return `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getDeviceLabel(type: DeviceType): string {
  return DEVICE_CATALOG.find((d) => d.type === type)?.label ?? type;
}

// ── Topology Templates ──────────────────────────────────────────────────────

export interface TopologyTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  tags: string[];
  isCustom?: boolean;
  build: (cx: number, cy: number) => { nodes: Omit<NetworkNode, 'interfaces'>[]; edges: Omit<NetworkEdge, 'id'>[] };
}

export const TOPOLOGY_TEMPLATES: TopologyTemplate[] = [
  {
    id: 'home_network',
    name: 'Home Network',
    description: 'ISP → Router → Switch → End devices with Wi-Fi AP',
    color: '#10B981',
    tags: ['Router', 'Switch', 'PC', 'Laptop', 'Access Point'],
    build: (cx, cy) => ({
      nodes: [
        { id: 'tmpl_cloud', type: 'cloud', label: 'ISP', hostname: 'ISP', x: cx - 20, y: cy - 200, ip_address: '203.0.113.1', subnet_mask: '255.255.255.0', gateway: '', mac_address: generateMac(), dns: '8.8.8.8', description: 'Internet Service Provider' },
        { id: 'tmpl_router', type: 'router', label: 'Home Router', hostname: 'Home-Router', x: cx - 20, y: cy - 100, ip_address: '192.168.1.1', subnet_mask: '255.255.255.0', gateway: '203.0.113.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Home gateway router' },
        { id: 'tmpl_switch', type: 'l2_switch', label: 'Switch', hostname: 'SW-1', x: cx - 20, y: cy, ip_address: '192.168.1.2', subnet_mask: '255.255.255.0', gateway: '192.168.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Home LAN switch' },
        { id: 'tmpl_ap', type: 'access_point', label: 'Wi-Fi AP', hostname: 'AP-1', x: cx + 160, y: cy, ip_address: '192.168.1.10', subnet_mask: '255.255.255.0', gateway: '192.168.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Wireless access point' },
        { id: 'tmpl_pc', type: 'pc', label: 'Desktop PC', hostname: 'PC-1', x: cx - 160, y: cy + 120, ip_address: '192.168.1.101', subnet_mask: '255.255.255.0', gateway: '192.168.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Desktop computer' },
        { id: 'tmpl_laptop', type: 'laptop', label: 'Laptop', hostname: 'Laptop-1', x: cx - 20, y: cy + 120, ip_address: '192.168.1.102', subnet_mask: '255.255.255.0', gateway: '192.168.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Wireless laptop' },
        { id: 'tmpl_printer', type: 'printer', label: 'Printer', hostname: 'Printer-1', x: cx + 140, y: cy + 120, ip_address: '192.168.1.103', subnet_mask: '255.255.255.0', gateway: '192.168.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Network printer' },
      ],
      edges: [
        { source: 'tmpl_cloud', target: 'tmpl_router', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_router', target: 'tmpl_switch', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_router', target: 'tmpl_ap', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_switch', target: 'tmpl_pc', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_switch', target: 'tmpl_laptop', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_switch', target: 'tmpl_printer', cable_type: 'ethernet', status: 'active' },
      ],
    }),
  },
  {
    id: 'enterprise_lan',
    name: 'Enterprise LAN',
    description: 'Core Router → Firewall → L3 Switch → Access Switches + Servers',
    color: '#3B82F6',
    tags: ['Core Router', 'Firewall', 'L3 Switch', 'L2 Switches', 'Servers'],
    build: (cx, cy) => ({
      nodes: [
        { id: 'tmpl_cr', type: 'core_router', label: 'Core Router', hostname: 'Core-R1', x: cx - 20, y: cy - 260, ip_address: '10.0.0.1', subnet_mask: '255.255.255.0', gateway: '', mac_address: generateMac(), dns: '8.8.8.8', description: 'Core backbone router' },
        { id: 'tmpl_fw', type: 'firewall', label: 'Firewall', hostname: 'FW-1', x: cx - 20, y: cy - 160, ip_address: '10.0.0.2', subnet_mask: '255.255.255.252', gateway: '10.0.0.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Perimeter firewall' },
        { id: 'tmpl_l3sw', type: 'l3_switch', label: 'L3 Core Switch', hostname: 'L3-SW1', x: cx - 20, y: cy - 60, ip_address: '172.16.0.1', subnet_mask: '255.255.0.0', gateway: '10.0.0.2', mac_address: generateMac(), dns: '8.8.8.8', description: 'Distribution layer switch' },
        { id: 'tmpl_sw1', type: 'l2_switch', label: 'Access SW-1', hostname: 'ACC-SW1', x: cx - 180, y: cy + 60, ip_address: '172.16.1.1', subnet_mask: '255.255.255.0', gateway: '172.16.0.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Floor 1 access switch' },
        { id: 'tmpl_sw2', type: 'l2_switch', label: 'Access SW-2', hostname: 'ACC-SW2', x: cx + 140, y: cy + 60, ip_address: '172.16.2.1', subnet_mask: '255.255.255.0', gateway: '172.16.0.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Floor 2 access switch' },
        { id: 'tmpl_srv1', type: 'server', label: 'App Server', hostname: 'SRV-APP', x: cx - 180, y: cy + 180, ip_address: '172.16.1.10', subnet_mask: '255.255.255.0', gateway: '172.16.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Application server' },
        { id: 'tmpl_srv2', type: 'server', label: 'DB Server', hostname: 'SRV-DB', x: cx - 60, y: cy + 180, ip_address: '172.16.1.11', subnet_mask: '255.255.255.0', gateway: '172.16.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Database server' },
        { id: 'tmpl_pc2', type: 'pc', label: 'Workstation', hostname: 'WS-1', x: cx + 140, y: cy + 180, ip_address: '172.16.2.10', subnet_mask: '255.255.255.0', gateway: '172.16.2.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'User workstation' },
      ],
      edges: [
        { source: 'tmpl_cr', target: 'tmpl_fw', cable_type: 'fiber', status: 'active' },
        { source: 'tmpl_fw', target: 'tmpl_l3sw', cable_type: 'fiber', status: 'active' },
        { source: 'tmpl_l3sw', target: 'tmpl_sw1', cable_type: 'fiber', status: 'active' },
        { source: 'tmpl_l3sw', target: 'tmpl_sw2', cable_type: 'fiber', status: 'active' },
        { source: 'tmpl_sw1', target: 'tmpl_srv1', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_sw1', target: 'tmpl_srv2', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_sw2', target: 'tmpl_pc2', cable_type: 'ethernet', status: 'active' },
      ],
    }),
  },
  {
    id: 'dmz',
    name: 'DMZ Architecture',
    description: 'Dual-firewall DMZ with public servers, internal LAN separation',
    color: '#EF4444',
    tags: ['Dual Firewall', 'DMZ', 'Web Server', 'Internal LAN', 'Cloud'],
    build: (cx, cy) => ({
      nodes: [
        { id: 'tmpl_inet', type: 'cloud', label: 'Internet', hostname: 'Internet', x: cx - 20, y: cy - 280, ip_address: '0.0.0.0', subnet_mask: '0.0.0.0', gateway: '', mac_address: generateMac(), dns: '8.8.8.8', description: 'Public Internet' },
        { id: 'tmpl_fw_ext', type: 'firewall', label: 'External FW', hostname: 'FW-EXT', x: cx - 20, y: cy - 180, ip_address: '203.0.113.2', subnet_mask: '255.255.255.0', gateway: '203.0.113.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Internet-facing firewall' },
        { id: 'tmpl_web', type: 'server', label: 'Web Server', hostname: 'WEB-SRV', x: cx - 180, y: cy - 60, ip_address: '192.168.100.10', subnet_mask: '255.255.255.0', gateway: '192.168.100.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Public web server (DMZ)' },
        { id: 'tmpl_mail', type: 'server', label: 'Mail Server', hostname: 'MAIL-SRV', x: cx + 140, y: cy - 60, ip_address: '192.168.100.11', subnet_mask: '255.255.255.0', gateway: '192.168.100.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Mail server (DMZ)' },
        { id: 'tmpl_fw_int', type: 'firewall', label: 'Internal FW', hostname: 'FW-INT', x: cx - 20, y: cy + 40, ip_address: '10.10.0.1', subnet_mask: '255.255.255.0', gateway: '192.168.100.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Internal network firewall' },
        { id: 'tmpl_int_sw', type: 'l3_switch', label: 'Internal Switch', hostname: 'INT-SW1', x: cx - 20, y: cy + 140, ip_address: '10.10.1.1', subnet_mask: '255.255.0.0', gateway: '10.10.0.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Internal LAN switch' },
        { id: 'tmpl_db', type: 'server', label: 'DB Server', hostname: 'DB-SRV', x: cx - 160, y: cy + 260, ip_address: '10.10.1.10', subnet_mask: '255.255.255.0', gateway: '10.10.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Internal database server' },
        { id: 'tmpl_int_pc', type: 'pc', label: 'Internal PC', hostname: 'INT-PC1', x: cx + 120, y: cy + 260, ip_address: '10.10.1.20', subnet_mask: '255.255.255.0', gateway: '10.10.1.1', mac_address: generateMac(), dns: '8.8.8.8', description: 'Internal workstation' },
      ],
      edges: [
        { source: 'tmpl_inet', target: 'tmpl_fw_ext', cable_type: 'fiber', status: 'active' },
        { source: 'tmpl_fw_ext', target: 'tmpl_web', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_fw_ext', target: 'tmpl_mail', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_fw_ext', target: 'tmpl_fw_int', cable_type: 'fiber', status: 'active' },
        { source: 'tmpl_fw_int', target: 'tmpl_int_sw', cable_type: 'fiber', status: 'active' },
        { source: 'tmpl_int_sw', target: 'tmpl_db', cable_type: 'ethernet', status: 'active' },
        { source: 'tmpl_int_sw', target: 'tmpl_int_pc', cable_type: 'ethernet', status: 'active' },
      ],
    }),
  },
];
