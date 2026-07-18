export type SubscriptionTier = 'free' | 'pro';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type DeviceType =
  // ── Layer 1 — Physical ──────────────────────────────────────────────────
  | 'hub'
  | 'repeater'
  | 'patch_panel'
  | 'media_converter'
  | 'modem'
  | 'dsl_modem'
  | 'cable_modem'
  | 'fiber_tap'
  | 'network_tap'
  | 'sfp_module'
  // ── Layer 2 — Data Link ─────────────────────────────────────────────────
  | 'bridge'
  | 'l2_switch'
  | 'managed_switch'
  | 'poe_switch'
  | 'stackable_switch'
  | 'industrial_switch'
  | 'access_switch'
  | 'distribution_switch'
  | 'stp_switch'
  | 'vlan_switch'
  // ── Layer 3 — Network ───────────────────────────────────────────────────
  | 'router'
  | 'core_router'
  | 'edge_router'
  | 'isr_router'
  | 'asr_router'
  | 'bgp_router'
  | 'mpls_router'
  | 'multilayer_switch'
  | 'l3_switch'
  | 'virtual_router'
  | 'load_balancer'
  // ── Layer 4-7 — Security & Application ─────────────────────────────────
  | 'firewall'
  | 'ngfw'
  | 'waf'
  | 'ids'
  | 'ips'
  | 'utm'
  | 'proxy'
  | 'ssl_accelerator'
  | 'vpn_concentrator'
  | 'radius_server'
  // ── Wireless ────────────────────────────────────────────────────────────
  | 'access_point'
  | 'wireless_controller'
  | 'mesh_ap'
  | 'outdoor_ap'
  | 'wan_optimizer'
  // ── Servers ─────────────────────────────────────────────────────────────
  | 'server'
  | 'web_server'
  | 'db_server'
  | 'dns_server'
  | 'dhcp_server'
  | 'ftp_server'
  | 'mail_server'
  | 'file_server'
  | 'auth_server'
  | 'backup_server'
  | 'vm_host'
  | 'nas_storage'
  | 'san_storage'
  | 'syslog_server'
  | 'ntp_server'
  // ── End Devices ─────────────────────────────────────────────────────────
  | 'pc'
  | 'laptop'
  | 'tablet'
  | 'smartphone'
  | 'printer'
  | 'thin_client'
  | 'workstation'
  | 'kiosk'
  // ── Cloud / WAN ─────────────────────────────────────────────────────────
  | 'cloud'
  | 'internet'
  | 'wan_cloud'
  | 'mpls_cloud'
  | 'satellite'
  | 'cellular_tower'
  // ── IoT / Physical ──────────────────────────────────────────────────────
  | 'ip_camera'
  | 'voip_phone'
  | 'ip_phone'
  | 'smart_tv'
  | 'iot_sensor'
  | 'iot_gateway'
  | 'pos_terminal'
  | 'atm_machine'
  | 'industrial_controller'
  | 'plc'
  | 'scada'
  | 'ups'
  // ── SDN / Virtual ────────────────────────────────────────────────────────
  | 'sdn_controller'
  | 'openflow_switch'
  | 'virtual_switch'
  | 'nfv_host'
  | 'docker_host'
  | 'kubernetes_node';

export type CableType =
  | 'ethernet'
  | 'fiber'
  | 'serial'
  | 'console'
  | 'crossover'
  | 'coaxial'
  | 'sfp'
  | 'dac_cable'
  | 'usb'
  | 'wireless';
export type InterfaceStatus = 'up' | 'down';
export type ConnectionStatus = 'active' | 'inactive' | 'error';

export interface DeviceInterface {
  id: string;
  name: string;
  status: InterfaceStatus;
  connected_to?: string; // node id
  ip_address?: string;
}

export interface NetworkNode {
  id: string;
  type: DeviceType;
  label: string;
  x: number;
  y: number;
  hostname: string;
  ip_address: string;
  subnet_mask: string;
  gateway: string;
  mac_address: string;
  dns: string;
  description: string;
  interfaces: DeviceInterface[];
}

export interface NetworkEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  cable_type: CableType;
  status: ConnectionStatus;
  source_interface?: string;
  target_interface?: string;
  vlan_id?: number; // 1–4094, undefined = trunk / untagged
}

export interface TopologyData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  topology_data: TopologyData;
  device_count: number;
  is_favorite: boolean;
  is_archived: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  subscription_tier: SubscriptionTier;
  total_projects: number;
  total_devices: number;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface DeviceCatalogItem {
  type: DeviceType;
  label: string;
  description: string;
  category: 'routers' | 'switches' | 'end_devices' | 'network' | 'cables' | 'servers' | 'iot' | 'sdn';
  defaultInterfaces: Omit<DeviceInterface, 'id'>[];
}

export interface CanvasState {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  snapToGrid: boolean;
  isConnecting: boolean;
  connectingFromNodeId: string | null;
}
