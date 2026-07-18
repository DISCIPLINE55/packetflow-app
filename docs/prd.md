# Requirements Document

## 1. Application Overview

**Application Name**: PacketFlow

**Description**: A mobile application for learning and designing computer networks, providing a professional Cisco Packet Tracer-like experience optimized for mobile devices. Users can design network topologies, simulate network behavior, and learn networking concepts through an intuitive drag-and-drop interface.

**Target Platform**: iOS and Android (React Native with Expo)

**Design References**: Two wireframe images provided showing all screens in dark and light themes, defining layout, spacing, navigation, typography, and component hierarchy.

---

## 2. Users and Usage Scenarios

**Target Users**:
- Networking students learning network design and configuration
- IT professionals practicing network topology design
- Educators teaching computer networking concepts
- Network engineers prototyping network architectures

**Core Usage Scenarios**:
- Design network topologies by dragging and dropping devices onto an infinite canvas
- Configure device properties (hostname, IP address, interfaces, routing tables)
- Connect devices using various cable types (Ethernet, Fiber, Serial)
- Simulate network behavior and test configurations
- Save and manage multiple network projects
- Access projects across devices via cloud sync
- Learn networking through hands-on practice

---

## 3. Page Structure and Functional Description

### Page Hierarchy

```
PacketFlow App
├── Splash Screen
├── Onboarding Flow
│   └── Onboarding Slider (3 slides)
├── Authentication Flow
│   ├── Login
│   ├── Register
│   └── Forgot Password
├── Main App (Bottom Navigation)
│   ├── Dashboard Tab
│   │   ├── Dashboard Home
│   │   ├── Notifications
│   │   └── Help
│   ├── Projects Tab
│   │   └── Projects List
│   ├── Saved Tab
│   └── Profile Tab
│       ├── Profile View
│       ├── Settings
│       └── About
└── Canvas Workspace (Separate Navigation)
    ├── Canvas Editor
    ├── Device Drawer (Sidebar)
    ├── Node Detail Sheet
    ├── Connection Tool
    └── Terminal/Console
```

### 3.1 Splash Screen

**Purpose**: Display app branding during initial load

**Elements**:
- PacketFlow logo centered
- Tagline: \"Design. Simulate. Learn.\"
- Loading progress bar at bottom

**Behavior**: Auto-navigate to Onboarding (first launch) or Dashboard (returning users) after loading completes

### 3.2 Onboarding Flow

**Purpose**: Introduce new users to app capabilities

**Screens**: 3-slide horizontal slider

**Slide Content**:
- Slide 1: \"Design Network Topologies\" with illustration
- Slide 2: Feature highlight
- Slide 3: Feature highlight

**Controls**:
- Skip button (top-right) - navigate directly to Login
- Next button - advance to next slide
- Dots indicator showing current slide position
- Get Started button on final slide - navigate to Login

**Behavior**: Show only on first app launch, skip for returning users

### 3.3 Login Screen

**Purpose**: Authenticate existing users

**Form Fields**:
- Email address input
- Password input (with show/hide toggle)
- Remember Me checkbox

**Actions**:
- Login button - authenticate user with email/password
- Forgot Password link - navigate to Forgot Password screen
- Sign Up link - navigate to Register screen

**OAuth Options**:
- Google Sign In button
- GitHub Sign In button (if supported by backend)

**Behavior**: On successful login, navigate to Dashboard; on failure, display error message

### 3.4 Register Screen

**Purpose**: Create new user account

**Form Fields**:
- Full Name input
- Email address input
- Password input (with strength indicator)
- Confirm Password input

**Actions**:
- Create Account button - register new user
- Login link - navigate to Login screen

**Validation**: Email format, password strength, password match confirmation

**Behavior**: On successful registration, send verification email and navigate to Dashboard

### 3.5 Forgot Password Screen

**Purpose**: Initiate password reset process

**Form Fields**:
- Email address input

**Actions**:
- Send Reset Link button - send password reset email
- Back to Login link

**Behavior**: Display confirmation message after sending reset email

### 3.6 Dashboard (Home Tab)

**Purpose**: Central hub showing user's projects and quick actions

**Sections**:
- Welcome header with user name
- Quick Actions: New Project, Open Recent, Browse Templates
- Recent Projects section (grid of project cards, max 6 displayed)
- Statistics section: Total Projects, Devices Used, Hours Spent
- Notifications icon (top-right)
- Profile shortcut (top-right)

**Project Card Elements**:
- Project thumbnail/preview
- Project name
- Last modified date
- Device count
- 3-dot menu (Rename, Duplicate, Delete, Archive)

**Floating Action Button (FAB)**: Create New Project

**Navigation**: Tap project card to open in Canvas; tap FAB to create new project and open Canvas

### 3.7 Projects Screen (Projects Tab)

**Purpose**: Manage all user projects

**Features**:
- Search bar at top
- Tab switcher: Recent / Shared
- Sort options: Date Modified, Name, Device Count
- Filter options: All, Favorites, Archived

**Project List**: Grid or list view of project cards with same elements as Dashboard

**Actions**:
- Tap project to open in Canvas
- 3-dot menu per project: Rename, Duplicate, Favorite, Share, Archive, Delete
- + button (bottom-right) to create new project

**Empty State**: Display message and Create Project button when no projects exist

### 3.8 Canvas Workspace

**Purpose**: Main network topology design and editing interface

**Canvas Features**:
- Infinite scrollable workspace
- Grid background (toggleable)
- Pinch-to-zoom gesture support
- Pan gesture support
- Snap-to-grid when dragging devices

**Device Interaction**:
- Drag devices from Device Drawer onto canvas
- Tap device to select (highlight border)
- Long-press device to show context menu (Edit, Duplicate, Delete)
- Multi-select: Tap and drag to create selection box around multiple devices
- Move selected devices by dragging
- Delete selected devices via toolbar or keyboard

**Connection Creation**:
- Tap Connection Tool in toolbar
- Tap first device, then tap second device to create connection line
- Connection line renders as Bezier curve
- Display X button to cancel connection in progress
- Tap connection line to select and show properties

**Toolbar (Top)**:
- Back button - return to Dashboard
- Project name (editable)
- Undo button
- Redo button
- Settings button
- Share button

**Bottom Toolbar**:
- Tools button - open Device Drawer
- Zoom controls: Zoom In, Zoom Out, Fit to Screen
- Console button - toggle Terminal panel

**Mini Controls (Floating)**:
- Mini-map showing canvas overview
- Zoom level indicator

**Bottom Navigation (Canvas Mode)**:
- Tools tab - open Device Drawer
- Canvas tab (active)
- Console tab - open Terminal
- Profile tab - navigate to Profile

**Auto-Save**: Automatically save project changes every 30 seconds

### 3.9 Device Drawer (Sidebar)

**Purpose**: Browse and add network devices to canvas

**Layout**: Slide-in panel from left or bottom

**Search Bar**: Filter devices by name or type

**Device Categories** (collapsible sections):
- Routers: Router, Core Router
- Switches: Layer 2 Switch, Layer 3 Switch, Hub, Bridge
- End Devices: PC, Laptop, Server, Printer
- Network Devices: Firewall, Access Point, Cloud
- Cables: Ethernet, Fiber, Serial

**Device Items**: Display device icon, name, and brief description

**Interaction**: Tap device to add to canvas center; drag device to place at specific position

**Close**: Tap outside drawer or close button to dismiss

### 3.10 Node Detail Sheet

**Purpose**: View and edit device properties

**Trigger**: Tap device on canvas, then tap Edit in context menu

**Layout**: Bottom sheet modal

**Form Fields**:
- Device Name input
- Device Type dropdown (Router, Switch, PC, etc.)
- IP Address input
- Subnet Mask input
- Gateway input
- MAC Address (auto-generated, read-only)
- Description textarea

**Interfaces Section**:
- List of interfaces (e.g., Eth0, Eth1, Serial0)
- Each interface shows: Name, Status (Up/Down), Connected To
- + Add Interface button

**Actions**:
- Save button - apply changes and close sheet
- Cancel button - discard changes and close sheet

**Validation**: IP address format, subnet mask format

### 3.11 Connection Tool

**Purpose**: Create connections between devices

**Activation**: Tap Connection Tool button in toolbar

**Workflow**:
1. Tap first device - highlight device and show connection point
2. Tap second device - create connection line between devices
3. Connection line renders as Bezier curve with cable type indicator
4. X button appears during connection creation to cancel

**Connection Properties**: Tap existing connection line to view/edit cable type and connection status

### 3.12 Terminal/Console

**Purpose**: Execute commands and view simulation output

**Layout**: Expandable/collapsible panel at bottom of Canvas

**States**:
- Collapsed: Show header bar with Console title and expand button
- Expanded: Show full console interface (resizable height)

**Console Interface**:
- Output area: Display command results and simulation logs in green monospace text on dark background
- Command input field at bottom
- Send button next to input field

**Features**:
- Command history: Use up/down arrows to navigate previous commands
- Auto-scroll: Automatically scroll to latest output
- Copy button: Copy console output to clipboard
- Clear button: Clear all console output
- Export button: Export console logs as text file

**Supported Commands**: ping, traceroute, show ip route, show interfaces, configure terminal (basic simulation)

### 3.13 Settings Screen

**Purpose**: Configure app preferences

**Sections**:

**General**:
- Theme toggle: Light / Dark / System
- Language selector
- Font Size slider
- Auto Save toggle

**Simulation**:
- Animation Speed slider
- Show Link Labels toggle
- Show Grid toggle
- Animations toggle

**Account**:
- Manage Account button
- Change Password button
- Delete Account button (red)

**About**:
- App Version (read-only)
- Terms of Service link
- Privacy Policy link
- Help & Support link

**Actions**: Changes save automatically; navigate back to previous screen

### 3.14 Profile Screen (Profile Tab)

**Purpose**: View and manage user profile

**Profile Header**:
- Avatar: Colored circle with user initials
- User full name
- Email address
- Subscription badge: Free or Pro

**Statistics Section**:
- Total Projects count
- Devices Used count
- Hours Spent count

**Menu Options**:
- Edit Profile - navigate to Edit Profile screen
- Change Password - navigate to Change Password screen
- Notifications - navigate to Notifications screen
- Subscription - navigate to Subscription/Upgrade screen
- Log Out button (red color) - sign out and return to Login

### 3.15 Notifications Screen

**Purpose**: Display app notifications and updates

**Layout**: List of notification items

**Notification Item**:
- Icon (based on notification type)
- Title
- Message
- Timestamp
- Read/Unread indicator

**Actions**: Tap notification to view details or navigate to related content; swipe to dismiss

**Empty State**: Display \"No notifications\" message when list is empty

### 3.16 Help Screen

**Purpose**: Provide user assistance and documentation

**Sections**:
- Getting Started guide
- FAQ (collapsible questions)
- Video Tutorials links
- Contact Support button
- Community Forum link

### 3.17 About Screen

**Purpose**: Display app information

**Content**:
- App logo
- App name and version
- Developer information
- Copyright notice
- Open Source Licenses button
- Terms of Service link
- Privacy Policy link

---

## 4. Business Rules and Logic

### 4.1 Authentication Rules

- Email/password authentication via Supabase
- Google Sign In via OAuth
- Remember Me: Store authentication token locally for 30 days
- Password requirements: Minimum 8 characters, at least one uppercase, one lowercase, one number
- Email verification required for new accounts
- Password reset link expires after 24 hours

### 4.2 Project Management Rules

- Each user can create unlimited projects (Free tier)
- Project names must be unique per user
- Projects auto-save every 30 seconds when changes detected
- Deleted projects move to trash and permanently delete after 30 days
- Archived projects hidden from main list but accessible via filter
- Shared projects allow view-only access unless owner grants edit permission

### 4.3 Canvas Interaction Rules

- Devices snap to grid when grid is enabled (default: enabled)
- Grid spacing: 20px
- Zoom range: 25% to 400%
- Maximum devices per project: 100 (Free tier)
- Connection lines automatically route around devices
- Multi-select: Shift+tap to add devices to selection
- Undo/Redo stack: Maximum 50 actions

### 4.4 Device Configuration Rules

- Each device must have unique hostname within project
- IP addresses must be valid IPv4 format
- Subnet masks must be valid CIDR notation
- Interfaces auto-generate based on device type (e.g., Router has 4 Ethernet ports by default)
- MAC addresses auto-generate using standard format (XX:XX:XX:XX:XX:XX)
- Device properties persist when device is moved or duplicated

### 4.5 Connection Rules

- Connections require two devices
- Cable type must be compatible with device interfaces (e.g., Ethernet cable connects to Ethernet port)
- Each interface can have only one active connection
- Connection status: Active (green), Inactive (gray), Error (red)
- Deleting a device automatically deletes all connected cables

### 4.6 Simulation Rules

- Simulation runs in background when Console is active
- Commands execute against selected device (if none selected, execute on first device)
- Ping command simulates ICMP packets with latency calculation
- Traceroute shows hop-by-hop path through network topology
- Show commands display device configuration in console output
- Invalid commands display error message in console

### 4.7 Data Sync Rules

- Projects sync to Supabase backend when online
- Offline changes queue locally and sync when connection restored
- Conflict resolution: Last write wins (display warning to user)
- Images and large files upload to Supabase Storage
- Real-time collaboration: Multiple users can view same project simultaneously (edit conflicts handled by last write wins)

### 4.8 Theme Rules

- Theme setting: Light, Dark, or System (follows device theme)
- Theme applies globally across all screens
- Theme persists across app sessions
- Color values defined in Design System section

---

## 5. Exception and Boundary Conditions

| Scenario | Handling |
|----------|----------|
| User enters invalid email format | Display inline error message below email field |
| User enters mismatched passwords during registration | Display error message below Confirm Password field |
| User attempts to login with incorrect credentials | Display \"Invalid email or password\" error message |
| User loses internet connection while editing project | Display offline indicator; queue changes for sync when online |
| User attempts to add more than 100 devices (Free tier) | Display upgrade prompt to Pro tier |
| User attempts to connect incompatible cable type to device | Display error message and prevent connection |
| User attempts to assign duplicate IP address within project | Display warning message (allow but warn) |
| User attempts to delete device with active connections | Display confirmation dialog; delete device and all connections on confirm |
| User attempts to undo when undo stack is empty | Disable undo button |
| User attempts to zoom beyond min/max limits | Prevent further zoom; display current zoom percentage |
| User attempts to save project with empty name | Display error message and prevent save |
| Backend API request fails | Display error toast; retry automatically up to 3 times |
| User session expires | Display session expired message; redirect to Login screen |
| User attempts to access project that was deleted by another device | Display \"Project not found\" error; remove from local cache |
| User uploads image exceeding size limit | Display error message with size limit information |

---

## 6. Acceptance Criteria

1. User opens app and completes onboarding flow (first launch only)
2. User registers new account with email and password
3. User logs in successfully and lands on Dashboard
4. User taps \"New Project\" FAB on Dashboard
5. User drags Router device from Device Drawer onto Canvas
6. User drags PC device from Device Drawer onto Canvas
7. User taps Connection Tool and connects Router to PC with Ethernet cable
8. User taps Router device and edits properties (hostname, IP address)
9. User taps Console button to open Terminal
10. User types \"ping [PC IP address]\" command in Console and views output
11. User taps Save button (auto-save also active)
12. User navigates back to Dashboard and sees saved project in Recent Projects

---

## 7. Out of Scope for This Release

- Advanced routing protocols (OSPF, BGP, EIGRP)
- VLAN configuration and trunking
- ACL (Access Control List) configuration
- NAT (Network Address Translation) simulation
- VPN configuration
- Real packet capture and analysis
- Integration with physical network devices
- Multi-user real-time collaborative editing (view-only sharing supported)
- Custom device creation and scripting
- Import/export to Cisco Packet Tracer format
- Network performance metrics and monitoring
- Automated network testing and validation
- AI-powered network design suggestions
- Voice and video call simulation
- IoT device simulation
- Cloud provider integration (AWS, Azure, GCP)
- Network security scanning and vulnerability assessment
- Certification exam preparation mode
- Offline mode for all features (basic offline editing supported)
- Desktop/web version (mobile-only for this release)