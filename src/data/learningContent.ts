// Static learning content — lessons, flashcard decks, quizzes
// This data is bundled with the app; user progress is synced to Supabase.

export type LessonStep =
  | { type: 'heading'; body: string }
  | { type: 'text'; body: string }
  | { type: 'code'; body: string; language?: string }
  | { type: 'tip'; body: string }
  | { type: 'warning'; body: string }
  | { type: 'diagram'; body: string }; // ASCII/text diagram

export interface Lesson {
  id: string;
  category: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // e.g. "8 min"
  icon: string;     // lucide icon name
  accentColor: string;
  content: LessonStep[];
  flashcardDeckId: string;
  quizId: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardDeck {
  id: string;
  lessonId: string;
  title: string;
  cards: Flashcard[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

// ─── Lessons ───────────────────────────────────────────────────────────────

export const LESSONS: Lesson[] = [
  {
    id: 'lesson-osi',
    category: 'Networking Fundamentals',
    title: 'OSI Model',
    description: 'Understand the 7-layer OSI reference model and how data flows through each layer.',
    difficulty: 'beginner',
    duration: '10 min',
    icon: 'Layers',
    accentColor: '#3B82F6',
    flashcardDeckId: 'deck-osi',
    quizId: 'quiz-osi',
    content: [
      { type: 'heading', body: 'What is the OSI Model?' },
      { type: 'text', body: 'The Open Systems Interconnection (OSI) model is a conceptual framework that standardizes communication functions into seven distinct layers. It allows different systems to communicate regardless of their underlying architecture.' },
      { type: 'diagram', body: '7 ─ Application\n6 ─ Presentation\n5 ─ Session\n4 ─ Transport\n3 ─ Network\n2 ─ Data Link\n1 ─ Physical' },
      { type: 'heading', body: 'Layer 1 — Physical' },
      { type: 'text', body: 'Handles raw bit transmission over a physical medium (cables, radio, fiber). Defines voltages, pin layout, and timing.' },
      { type: 'heading', body: 'Layer 2 — Data Link' },
      { type: 'text', body: 'Frames data for node-to-node delivery on the same network. MAC addresses live here. Ethernet and Wi-Fi operate at this layer.' },
      { type: 'heading', body: 'Layer 3 — Network' },
      { type: 'text', body: 'Routes packets between different networks using logical addresses. IP (v4 and v6) is the key protocol.' },
      { type: 'code', body: 'Source IP  → 192.168.1.10\nDest IP    → 10.0.0.5\nTTL        → 64\nProtocol   → TCP (6)', language: 'text' },
      { type: 'heading', body: 'Layer 4 — Transport' },
      { type: 'text', body: 'Provides end-to-end communication, segmentation, and reliability. TCP (connection-oriented) and UDP (connectionless) operate here.' },
      { type: 'tip', body: 'Remember: TCP = "Three-way handshake" — SYN → SYN-ACK → ACK.' },
      { type: 'heading', body: 'Layers 5–7' },
      { type: 'text', body: 'Session (5) manages connections. Presentation (6) handles encoding and encryption. Application (7) is where user-facing protocols like HTTP, FTP, and DNS live.' },
      { type: 'warning', body: 'Do not confuse the OSI model with the TCP/IP model — TCP/IP has only 4 layers.' },
    ],
  },
  {
    id: 'lesson-subnetting',
    category: 'Networking Fundamentals',
    title: 'IP Subnetting',
    description: 'Master CIDR notation, subnet masks, and how to divide networks into smaller segments.',
    difficulty: 'intermediate',
    duration: '14 min',
    icon: 'Network',
    accentColor: '#10B981',
    flashcardDeckId: 'deck-subnetting',
    quizId: 'quiz-subnetting',
    content: [
      { type: 'heading', body: 'Why Subnet?' },
      { type: 'text', body: 'Subnetting divides a large network into smaller, more manageable segments. It reduces broadcast traffic, improves security, and makes better use of IP address space.' },
      { type: 'heading', body: 'CIDR Notation' },
      { type: 'text', body: 'CIDR (Classless Inter-Domain Routing) expresses a network address with its prefix length.' },
      { type: 'code', body: '192.168.1.0/24\n  Address:  192.168.1.0\n  Mask:     255.255.255.0\n  Hosts:    254 usable\n  Range:    .1 → .254', language: 'text' },
      { type: 'heading', body: 'Common Subnet Masks' },
      { type: 'diagram', body: '/8  → 255.0.0.0      16M hosts\n/16 → 255.255.0.0    65K hosts\n/24 → 255.255.255.0    254 hosts\n/30 → 255.255.255.252   2 hosts' },
      { type: 'heading', body: 'Calculating Subnets' },
      { type: 'text', body: 'Given /26 from a /24 block:\n• Hosts per subnet: 2^(32-26) - 2 = 62\n• Subnets: 4\n• Ranges: .0–.63, .64–.127, .128–.191, .192–.255' },
      { type: 'tip', body: 'The first and last addresses in each subnet are the network and broadcast addresses — never assign them to hosts.' },
      { type: 'heading', body: 'Private Address Ranges' },
      { type: 'code', body: '10.0.0.0/8\n172.16.0.0/12\n192.168.0.0/16', language: 'text' },
    ],
  },
  {
    id: 'lesson-vlans',
    category: 'Switching',
    title: 'VLANs & Trunking',
    description: 'Learn how VLANs segment Layer 2 traffic and how 802.1Q trunks carry multiple VLANs.',
    difficulty: 'intermediate',
    duration: '12 min',
    icon: 'GitBranch',
    accentColor: '#8B5CF6',
    flashcardDeckId: 'deck-vlans',
    quizId: 'quiz-vlans',
    content: [
      { type: 'heading', body: 'What is a VLAN?' },
      { type: 'text', body: 'A Virtual LAN logically separates devices on the same physical switch into independent broadcast domains — as if they were on separate physical switches.' },
      { type: 'heading', body: 'Access vs Trunk Ports' },
      { type: 'text', body: 'Access ports carry traffic for a single VLAN. Trunk ports carry traffic for multiple VLANs between switches, tagged using 802.1Q.' },
      { type: 'code', body: '! Cisco IOS — configure trunk port\ninterface GigabitEthernet0/1\n  switchport mode trunk\n  switchport trunk allowed vlan 10,20,30\n  switchport trunk native vlan 1', language: 'cisco-ios' },
      { type: 'heading', body: '802.1Q Tag' },
      { type: 'text', body: '802.1Q inserts a 4-byte tag after the source MAC in an Ethernet frame. The tag includes a 12-bit VLAN ID (1–4094).' },
      { type: 'tip', body: 'The native VLAN sends untagged — ensure it matches on both ends of a trunk or you risk security vulnerabilities.' },
      { type: 'heading', body: 'Inter-VLAN Routing' },
      { type: 'text', body: 'VLANs cannot communicate by default. Use a Layer 3 switch or router-on-a-stick (sub-interfaces) to route between VLANs.' },
      { type: 'code', body: '! Router-on-a-stick\ninterface GigabitEthernet0/0.10\n  encapsulation dot1Q 10\n  ip address 192.168.10.1 255.255.255.0', language: 'cisco-ios' },
    ],
  },
  {
    id: 'lesson-routing',
    category: 'Routing',
    title: 'Static & Dynamic Routing',
    description: 'Compare static routes with OSPF and EIGRP dynamic routing protocols.',
    difficulty: 'intermediate',
    duration: '13 min',
    icon: 'Route',
    accentColor: '#F59E0B',
    flashcardDeckId: 'deck-routing',
    quizId: 'quiz-routing',
    content: [
      { type: 'heading', body: 'Static Routing' },
      { type: 'text', body: 'Static routes are manually configured and do not adapt to topology changes. Best for small, stable networks or as a default route.' },
      { type: 'code', body: 'ip route 10.0.0.0 255.255.255.0 192.168.1.1\n! or with next-hop interface:\nip route 10.0.0.0 255.255.255.0 GigabitEthernet0/1', language: 'cisco-ios' },
      { type: 'heading', body: 'Default Route' },
      { type: 'code', body: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', language: 'cisco-ios' },
      { type: 'heading', body: 'OSPF Basics' },
      { type: 'text', body: 'OSPF (Open Shortest Path First) is a link-state protocol that builds a topology map using LSAs. It uses Dijkstra\'s algorithm to find the shortest path.' },
      { type: 'code', body: 'router ospf 1\n  network 192.168.1.0 0.0.0.255 area 0\n  network 10.0.0.0 0.0.0.3 area 0', language: 'cisco-ios' },
      { type: 'tip', body: 'OSPF uses cost as its metric (cost = 100 Mbps / bandwidth). Lower cost = preferred path.' },
      { type: 'heading', body: 'EIGRP Basics' },
      { type: 'text', body: 'EIGRP is Cisco proprietary (now open). It uses a composite metric (bandwidth + delay) and the DUAL algorithm for fast convergence.' },
      { type: 'warning', body: 'Mismatched OSPF area types or EIGRP AS numbers are the most common configuration mistakes.' },
    ],
  },
  {
    id: 'lesson-acl',
    category: 'Security',
    title: 'Access Control Lists',
    description: 'Write standard and extended ACLs to filter network traffic on Cisco routers.',
    difficulty: 'advanced',
    duration: '11 min',
    icon: 'Shield',
    accentColor: '#EF4444',
    flashcardDeckId: 'deck-acl',
    quizId: 'quiz-acl',
    content: [
      { type: 'heading', body: 'ACL Fundamentals' },
      { type: 'text', body: 'ACLs are ordered lists of permit/deny rules applied to router interfaces. Packets are checked sequentially — first match wins. An implicit deny all exists at the end.' },
      { type: 'heading', body: 'Standard ACLs (1–99)' },
      { type: 'text', body: 'Filter based on source IP only. Place as close to the destination as possible.' },
      { type: 'code', body: 'access-list 10 deny   192.168.1.0 0.0.0.255\naccess-list 10 permit any\n\ninterface GigabitEthernet0/1\n  ip access-group 10 in', language: 'cisco-ios' },
      { type: 'heading', body: 'Extended ACLs (100–199)' },
      { type: 'text', body: 'Filter on source/dest IP, protocol, and ports. Place as close to the source as possible.' },
      { type: 'code', body: 'access-list 100 permit tcp 10.0.0.0 0.0.0.255 any eq 80\naccess-list 100 permit tcp 10.0.0.0 0.0.0.255 any eq 443\naccess-list 100 deny   ip any any', language: 'cisco-ios' },
      { type: 'heading', body: 'Named ACLs' },
      { type: 'code', body: 'ip access-list extended BLOCK_TELNET\n  deny   tcp any any eq 23\n  permit ip any any', language: 'cisco-ios' },
      { type: 'warning', body: 'Never apply an ACL that blocks your own management traffic — you will lock yourself out!' },
      { type: 'tip', body: 'Use "ip access-list" named ACLs — they are easier to edit than numbered ones.' },
    ],
  },
  {
    id: 'lesson-stp',
    category: 'Switching',
    title: 'Spanning Tree Protocol',
    description: 'How STP prevents Layer 2 loops and elects root bridges in a switched network.',
    difficulty: 'intermediate',
    duration: '10 min',
    icon: 'TreePine',
    accentColor: '#06B6D4',
    flashcardDeckId: 'deck-stp',
    quizId: 'quiz-stp',
    content: [
      { type: 'heading', body: 'Why STP?' },
      { type: 'text', body: 'Redundant switch paths cause broadcast storms and MAC table instability. STP (IEEE 802.1D) blocks redundant paths while keeping them available for failover.' },
      { type: 'heading', body: 'Root Bridge Election' },
      { type: 'text', body: 'The switch with the lowest Bridge ID (priority + MAC address) becomes the Root Bridge. Default priority is 32768.' },
      { type: 'tip', body: 'Manually set the root bridge: "spanning-tree vlan 1 priority 4096"' },
      { type: 'heading', body: 'Port States' },
      { type: 'diagram', body: 'Blocking → Listening → Learning → Forwarding\n(Disabled — admin off)' },
      { type: 'heading', body: 'Port Roles' },
      { type: 'text', body: 'Root Port: best path to root. Designated Port: best port on each segment. Non-Designated (Blocked): redundant paths.' },
      { type: 'heading', body: 'Rapid STP (802.1w)' },
      { type: 'text', body: 'RSTP converges in 1–2 seconds vs 30–50 for classic STP. Uses port roles and a negotiation handshake instead of timers.' },
      { type: 'code', body: 'spanning-tree mode rapid-pvst', language: 'cisco-ios' },
    ],
  },
];

// ─── Flashcard Decks ────────────────────────────────────────────────────────

export const FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-osi',
    lessonId: 'lesson-osi',
    title: 'OSI Model Flashcards',
    cards: [
      { id: 'f-osi-1', front: 'What layer does IP operate at?', back: 'Layer 3 — Network layer. IP addresses are assigned and routing decisions are made here.' },
      { id: 'f-osi-2', front: 'What layer does TCP operate at?', back: 'Layer 4 — Transport layer. TCP provides reliable, ordered delivery with error checking.' },
      { id: 'f-osi-3', front: 'What is the PDU name at Layer 2?', back: 'Frame. Layer 2 wraps packets into frames with source/destination MAC addresses.' },
      { id: 'f-osi-4', front: 'What is the PDU name at Layer 4?', back: 'Segment (TCP) or Datagram (UDP).' },
      { id: 'f-osi-5', front: 'Which layer handles SSL/TLS encryption?', back: 'Layer 6 — Presentation layer (or sometimes considered part of Layer 5 in TCP/IP model).' },
      { id: 'f-osi-6', front: 'What devices operate at Layer 1?', back: 'Hubs, repeaters, and cables. They transmit raw bits without any intelligence.' },
      { id: 'f-osi-7', front: 'What devices operate at Layer 3?', back: 'Routers and Layer 3 switches. They forward packets between different networks.' },
      { id: 'f-osi-8', front: 'How many layers in the OSI model?', back: '7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
    ],
  },
  {
    id: 'deck-subnetting',
    lessonId: 'lesson-subnetting',
    title: 'Subnetting Flashcards',
    cards: [
      { id: 'f-sub-1', front: 'How many usable hosts in a /24?', back: '254 — (2^8) - 2 = 254. Subtract network and broadcast addresses.' },
      { id: 'f-sub-2', front: 'What is the subnet mask for /26?', back: '255.255.255.192 — the last octet is 11000000 = 192.' },
      { id: 'f-sub-3', front: 'What is a private IP range for class C?', back: '192.168.0.0/16 — ranges from 192.168.0.0 to 192.168.255.255.' },
      { id: 'f-sub-4', front: 'How many subnets does a /28 give from a /24?', back: '16 subnets, each with 14 usable hosts.' },
      { id: 'f-sub-5', front: 'What is CIDR?', back: 'Classless Inter-Domain Routing — a method to allocate IP addresses using variable-length subnet masking.' },
      { id: 'f-sub-6', front: 'What is the broadcast address of 192.168.1.0/25?', back: '192.168.1.127 — the last address in the 0–127 range.' },
    ],
  },
  {
    id: 'deck-vlans',
    lessonId: 'lesson-vlans',
    title: 'VLANs Flashcards',
    cards: [
      { id: 'f-vlan-1', front: 'What protocol tags VLAN frames?', back: '802.1Q — adds a 4-byte tag with a 12-bit VLAN ID after the source MAC address.' },
      { id: 'f-vlan-2', front: 'What is the native VLAN?', back: 'The VLAN that sends untagged traffic on a trunk port. Default is VLAN 1.' },
      { id: 'f-vlan-3', front: 'Difference between access and trunk port?', back: 'Access = one VLAN, untagged. Trunk = multiple VLANs, tagged (except native VLAN).' },
      { id: 'f-vlan-4', front: 'What is router-on-a-stick?', back: 'A single router interface divided into sub-interfaces, each handling a different VLAN for inter-VLAN routing.' },
      { id: 'f-vlan-5', front: 'Valid VLAN ID range?', back: '1–4094. VLANs 1 and 1002–1005 are reserved by Cisco.' },
    ],
  },
  {
    id: 'deck-routing',
    lessonId: 'lesson-routing',
    title: 'Routing Flashcards',
    cards: [
      { id: 'f-rt-1', front: 'What is an administrative distance?', back: 'A value (0–255) indicating the trustworthiness of a routing source. Lower = more trusted. Static = 1, OSPF = 110, EIGRP = 90.' },
      { id: 'f-rt-2', front: 'What algorithm does OSPF use?', back: 'Dijkstra\'s Shortest Path First (SPF) algorithm, using link cost as the metric.' },
      { id: 'f-rt-3', front: 'What is a default route?', back: '0.0.0.0/0 — a catch-all route used when no more specific match exists in the routing table.' },
      { id: 'f-rt-4', front: 'OSPF metric is based on?', back: 'Cost = 100,000,000 / bandwidth (in bps). Lower cost = preferred.' },
      { id: 'f-rt-5', front: 'EIGRP uses which algorithm?', back: 'DUAL (Diffusing Update ALgorithm) — ensures loop-free, fast convergence.' },
      { id: 'f-rt-6', front: 'What is convergence?', back: 'The state where all routers in a network have a consistent, accurate view of the topology.' },
    ],
  },
  {
    id: 'deck-acl',
    lessonId: 'lesson-acl',
    title: 'ACL Flashcards',
    cards: [
      { id: 'f-acl-1', front: 'Standard ACL number range?', back: '1–99 (and 1300–1999 for extended range). Filters on source IP only.' },
      { id: 'f-acl-2', front: 'Extended ACL number range?', back: '100–199 (and 2000–2699). Filters on src/dst IP, protocol, and ports.' },
      { id: 'f-acl-3', front: 'What is the wildcard mask for /24?', back: '0.0.0.255 — the inverse of the subnet mask 255.255.255.0.' },
      { id: 'f-acl-4', front: 'Where to place standard ACLs?', back: 'As close to the destination as possible — they only filter by source IP so placing near source would block too broadly.' },
      { id: 'f-acl-5', front: 'What does the implicit deny do?', back: 'Any packet not matched by an ACL entry is silently dropped. Always add "permit any" if needed.' },
    ],
  },
  {
    id: 'deck-stp',
    lessonId: 'lesson-stp',
    title: 'STP Flashcards',
    cards: [
      { id: 'f-stp-1', front: 'How is the root bridge elected?', back: 'Lowest Bridge ID wins. Bridge ID = priority (default 32768) + MAC address.' },
      { id: 'f-stp-2', front: 'STP port states in order?', back: 'Blocking → Listening → Learning → Forwarding (BLLoF).' },
      { id: 'f-stp-3', front: 'What is RSTP convergence time?', back: '~1–2 seconds, compared to 30–50 seconds for classic STP (802.1D).' },
      { id: 'f-stp-4', front: 'What is PortFast?', back: 'A Cisco feature that skips Listening/Learning and immediately puts an access port into Forwarding state. Use on end-device ports only.' },
      { id: 'f-stp-5', front: 'What is BPDU Guard?', back: 'Disables a PortFast-enabled port if it receives a BPDU — protects against rogue switches.' },
    ],
  },
];

// ─── Quizzes ────────────────────────────────────────────────────────────────

export const QUIZZES: Quiz[] = [
  {
    id: 'quiz-osi',
    lessonId: 'lesson-osi',
    title: 'OSI Model Quiz',
    questions: [
      { id: 'q-osi-1', question: 'At which OSI layer does IP addressing occur?', options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'], correctIndex: 2, explanation: 'Layer 3 (Network) handles logical addressing using IP.' },
      { id: 'q-osi-2', question: 'What is the PDU at the Data Link layer called?', options: ['Packet', 'Frame', 'Segment', 'Bit'], correctIndex: 1, explanation: 'Layer 2 PDU is called a Frame. It contains MAC addresses.' },
      { id: 'q-osi-3', question: 'Which protocol operates at the Transport layer?', options: ['IP', 'ARP', 'TCP', 'HTTP'], correctIndex: 2, explanation: 'TCP and UDP operate at Layer 4 (Transport).' },
      { id: 'q-osi-4', question: 'A hub operates at which OSI layer?', options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 7'], correctIndex: 0, explanation: 'Hubs are Layer 1 devices — they repeat electrical signals with no intelligence.' },
      { id: 'q-osi-5', question: 'Which layer handles data formatting and encryption?', options: ['Application', 'Session', 'Transport', 'Presentation'], correctIndex: 3, explanation: 'Layer 6 (Presentation) handles encoding, compression, and encryption.' },
    ],
  },
  {
    id: 'quiz-subnetting',
    lessonId: 'lesson-subnetting',
    title: 'Subnetting Quiz',
    questions: [
      { id: 'q-sub-1', question: 'How many usable hosts does a /28 network provide?', options: ['14', '16', '30', '62'], correctIndex: 0, explanation: '2^(32-28) - 2 = 16 - 2 = 14 usable hosts.' },
      { id: 'q-sub-2', question: 'What is the subnet mask for /26?', options: ['255.255.255.0', '255.255.255.192', '255.255.255.128', '255.255.255.224'], correctIndex: 1, explanation: '/26 = 64 addresses. 256-64=192 → 255.255.255.192.' },
      { id: 'q-sub-3', question: 'Which is a valid private IP range?', options: ['172.32.0.0/12', '192.169.0.0/16', '172.16.0.0/12', '10.0.0.0/16'], correctIndex: 2, explanation: 'RFC 1918 private ranges: 10/8, 172.16/12, 192.168/16.' },
      { id: 'q-sub-4', question: 'Network 192.168.5.0/24 is split into /26 subnets. How many subnets?', options: ['2', '4', '8', '16'], correctIndex: 1, explanation: 'Borrowing 2 bits from host portion: 2^2 = 4 subnets.' },
    ],
  },
  {
    id: 'quiz-vlans',
    lessonId: 'lesson-vlans',
    title: 'VLANs Quiz',
    questions: [
      { id: 'q-vlan-1', question: 'What protocol is used for VLAN tagging?', options: ['802.1X', '802.11', '802.1Q', '802.3'], correctIndex: 2, explanation: '802.1Q inserts a 4-byte VLAN tag into Ethernet frames.' },
      { id: 'q-vlan-2', question: 'Which port type carries traffic for multiple VLANs?', options: ['Access port', 'Trunk port', 'Routed port', 'Hybrid port'], correctIndex: 1, explanation: 'Trunk ports carry multiple VLANs tagged with 802.1Q.' },
      { id: 'q-vlan-3', question: 'Traffic on the native VLAN is sent...', options: ['Tagged', 'Untagged', 'Encrypted', 'Dropped'], correctIndex: 1, explanation: 'Native VLAN traffic is sent untagged on trunk ports.' },
      { id: 'q-vlan-4', question: 'What is required for hosts in different VLANs to communicate?', options: ['A hub', 'STP', 'Layer 3 routing', 'A second switch'], correctIndex: 2, explanation: 'VLANs are separate broadcast domains; Layer 3 routing is needed.' },
    ],
  },
  {
    id: 'quiz-routing',
    lessonId: 'lesson-routing',
    title: 'Routing Quiz',
    questions: [
      { id: 'q-rt-1', question: 'Which routing protocol has administrative distance 110?', options: ['EIGRP', 'OSPF', 'RIP', 'BGP'], correctIndex: 1, explanation: 'OSPF AD = 110. EIGRP = 90, RIP = 120, BGP = 20.' },
      { id: 'q-rt-2', question: 'A default route matches which destination?', options: ['255.255.255.255', '127.0.0.1', '0.0.0.0/0', '192.168.0.0/16'], correctIndex: 2, explanation: '0.0.0.0/0 is the default route — matches all destinations.' },
      { id: 'q-rt-3', question: 'OSPF uses which algorithm to calculate best paths?', options: ['Bellman-Ford', 'DUAL', 'Dijkstra SPF', 'Floyd-Warshall'], correctIndex: 2, explanation: 'OSPF uses Dijkstra\'s Shortest Path First algorithm.' },
      { id: 'q-rt-4', question: 'Which is the most specific match in a routing table?', options: ['0.0.0.0/0', '/8 route', '/16 route', '/28 route'], correctIndex: 3, explanation: 'Longest prefix match wins — /28 is more specific than shorter prefixes.' },
    ],
  },
  {
    id: 'quiz-acl',
    lessonId: 'lesson-acl',
    title: 'ACL Quiz',
    questions: [
      { id: 'q-acl-1', question: 'What does the implicit deny at the end of an ACL do?', options: ['Logs packets', 'Permits all remaining', 'Drops all unmatched packets', 'Resets the ACL'], correctIndex: 2, explanation: 'If no rule matches, packets are silently dropped by the implicit deny.' },
      { id: 'q-acl-2', question: 'Standard ACLs should be placed...', options: ['Close to source', 'Close to destination', 'On loopback', 'On WAN links only'], correctIndex: 1, explanation: 'Standard ACLs only match source IP, so place near destination to avoid over-blocking.' },
      { id: 'q-acl-3', question: 'Which wildcard mask matches exactly one host?', options: ['0.0.0.255', '255.255.255.0', '0.0.0.0', '255.255.255.255'], correctIndex: 2, explanation: 'Wildcard 0.0.0.0 means all bits must match exactly — single host.' },
      { id: 'q-acl-4', question: 'Extended ACL 150 filters traffic based on?', options: ['Source IP only', 'Destination IP only', 'Source IP, Dest IP, protocol, ports', 'Protocol only'], correctIndex: 2, explanation: 'Extended ACLs (100–199) can match src/dst IP, protocol type, and port numbers.' },
    ],
  },
  {
    id: 'quiz-stp',
    lessonId: 'lesson-stp',
    title: 'STP Quiz',
    questions: [
      { id: 'q-stp-1', question: 'How is the Root Bridge determined?', options: ['Highest MAC wins', 'Lowest Bridge ID wins', 'Highest priority wins', 'Manually assigned only'], correctIndex: 1, explanation: 'Lowest Bridge ID (priority + MAC) wins the Root Bridge election.' },
      { id: 'q-stp-2', question: 'In which STP state does a port learn MAC addresses?', options: ['Blocking', 'Listening', 'Learning', 'Forwarding'], correctIndex: 2, explanation: 'Learning state: port learns MACs but does not yet forward frames.' },
      { id: 'q-stp-3', question: 'RSTP provides convergence in approximately?', options: ['30–50 seconds', '5–10 seconds', '1–2 seconds', '10–15 minutes'], correctIndex: 2, explanation: 'RSTP (802.1w) converges in ~1–2 seconds using negotiation instead of timers.' },
      { id: 'q-stp-4', question: 'PortFast should only be used on...', options: ['Trunk ports', 'Uplink ports', 'End-device access ports', 'Root ports'], correctIndex: 2, explanation: 'PortFast skips STP states — only safe on ports connecting to end devices, never switches.' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export const CATEGORIES = [...new Set(LESSONS.map((l) => l.category))];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
export function getDeckById(id: string): FlashcardDeck | undefined {
  return FLASHCARD_DECKS.find((d) => d.id === id);
}
export function getQuizById(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}
export function getLessonsByCategory(category: string): Lesson[] {
  return LESSONS.filter((l) => l.category === category);
}
