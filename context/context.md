# 📦 **RijanBox - Development Planning Document**

## 🎯 **Visi & Misi**

> **Visi:** Menciptakan aplikasi multi-messenger open source yang ringan, aman, dan elegan dengan fokus pada pengalaman pengguna yang minimalis namun powerful.

> **Misi:** Menyediakan solusi terpusat untuk mengelola semua akun sosial media tanpa batas, dengan keamanan maksimal dan antarmuka yang bersih.

---

## 🏗️ **Arsitektur Teknis Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                      RIJANBOX ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Main Process │◄──►│  IPC Bridge  │◄──►│Renderer Process│      │
│  │  (Electron)   │    │  (Communication)│  │  (UI/WebView) │       │
│  └──────┬───────┘    └──────────────┘    └──────┬───────┘       │
│         │                                        │               │
│         ▼                                        ▼               │
│  ┌──────────────┐                        ┌──────────────┐       │
│  │ Session Manager│                       │ Service Manager│      │
│  │ (Partitioned) │                        │ (Catalog + Custom)│   │
│  └──────┬───────┘                        └──────┬───────┘       │
│         │                                        │               │
│         ▼                                        ▼               │
│  ┌──────────────┐                        ┌──────────────┐       │
│  │ Security Lock │                        │ Notification  │      │
│  │ (PIN + Auto)  │                        │   System      │      │
│  └──────────────┘                        └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📅 **FASE PENGEMBANGAN (12 MINGGU)**

---

### **🔷 FASE 1: Foundation & Core Setup (Minggu 1-2)**

#### **Tujuan:**
Membangun fondasi aplikasi yang stabil dan siap untuk pengembangan fitur.

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **Project Structure** | Struktur folder yang modular dan scalable |
| **Electron Base** | Konfigurasi Electron dasar dengan security best practices |
| **Build System** | Setup build untuk Windows, macOS, dan Linux |
| **Version Control** | Git repository dengan branching strategy yang jelas |
| **Design System** | Material Design tokens (warna, typography, spacing) |

#### **Keputusan Teknis:**
- Gunakan **Electron terbaru** untuk security patches otomatis
- Implementasi **contextIsolation** dan **nodeIntegration: false** sejak awal
- Siapkan **auto-updater** untuk distribusi update di masa depan
- Gunakan **TypeScript** untuk type safety dan maintainability

#### **Milestone:**
✅ Aplikasi dapat dibuka dan ditutup dengan baik di 3 platform utama

---

### **🔷 FASE 2: Session Management System (Minggu 3-4)**

#### **Tujuan:**
Membuat sistem yang memungkinkan unlimited akun dengan sesi terisolasi.

#### **Konsep Session Partitioning:**

```
┌─────────────────────────────────────────────────────────┐
│                  SESSION ARCHITECTURE                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Service 1 (WhatsApp Personal)                          │
│   └── Partition: persist:whatsapp-001                    │
│       └── Cookies, localStorage, IndexedDB (Isolated)    │
│                                                          │
│   Service 2 (WhatsApp Work)                              │
│   └── Partition: persist:whatsapp-002                    │
│       └── Cookies, localStorage, IndexedDB (Isolated)    │
│                                                          │
│   Service 3 (Telegram)                                   │
│   └── Partition: persist:telegram-001                    │
│       └── Cookies, localStorage, IndexedDB (Isolated)    │
│                                                          │
│   ... Unlimited Services                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **Session Manager** | Modul untuk membuat dan mengelola partition session |
| **Service Instance** | Setiap service berjalan dalam container terpisah |
| **Session Persistence** | Data login tersimpan dan tidak hilang saat restart |
| **Service State** | Tracking status setiap service (active, inactive, error) |

#### **Milestone:**
✅ Dapat menambahkan 10+ akun WhatsApp berbeda dengan login terpisah tanpa konflik

---

### **🔷 FASE 3: Service Catalog & Custom URL (Minggu 5-6)**

#### **Tujuan:**
Menyediakan katalog service yang bisa dicari dan opsi custom URL.

#### **Konsep Service Catalog:**

```
┌─────────────────────────────────────────────────────────┐
│                   SERVICE CATALOG                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  🔍 Search Services...                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ WhatsApp│ │Telegram │ │ Instagram│ │ Twitter │        │
│  │  Meta   │ │  MTProto │ │  Meta    │ │  X Corp │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │  Gmail  │ │  Slack  │ │ Discord │ │  Zoom   │        │
│  │ Google  │ │ Salesforce│ │ Discord │ │ Zoom   │        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ➕ Add Custom URL                               │   │
│  │     [Enter URL]  [Upload Icon]  [Add Service]    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **Service Database** | JSON/SQLite database berisi predefined services |
| **Search Function** | Pencarian service dengan filter kategori |
| **Custom URL Handler** | Input URL custom dengan validasi |
| **Favicon Fetcher** | Auto-extract favicon dari URL yang diinput |
| **Icon Manager** | Upload custom icon atau gunakan default favicon |

#### **Struktur Data Service:**
```
Service Object:
├── id (unique identifier)
├── name (display name)
├── url (base URL)
├── category (messaging, social, email, etc)
├── icon (path or URL)
├── favicon (auto-fetched)
├── notification_enabled (boolean)
├── muted (boolean)
├── partition_id (session partition)
└── created_at (timestamp)
```

#### **Milestone:**
✅ Katalog 50+ service populer + kemampuan add custom URL dengan favicon otomatis

---

### **🔷 FASE 4: Security & PIN Lock System (Minggu 7)**

#### **Tujuan:**
Mengamankan aplikasi dengan PIN dan auto-lock berdasarkan interval.

#### **Konsep Security Flow:**

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY FLOW                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   APP START                                              │
│       │                                                  │
│       ▼                                                  │
│   ┌─────────────────┐                                   │
│   │ Check if Locked │                                   │
│   └────────┬────────┘                                   │
│            │                                             │
│     ┌──────┴──────┐                                     │
│     │             │                                     │
│    YES           NO                                     │
│     │             │                                     │
│     ▼             ▼                                     │
│  ┌─────────┐  ┌──────────┐                              │
│  │ Show PIN│  │ Show Main│                              │
│  │  Screen │  │ Interface│                              │
│  └────┬────┘  └──────────┘                              │
│       │                                                  │
│       ▼                                                  │
│  ┌─────────────┐                                        │
│  │ Verify PIN  │                                        │
│  └──────┬──────┘                                        │
│         │                                               │
│    ┌────┴────┐                                         │
│    │         │                                         │
│  Valid    Invalid                                      │
│    │         │                                         │
│    ▼         ▼                                         │
│  Unlock   Show Error                                   │
│  Interface  + Retry                                    │
│                                                          │
│   AUTO-LOCK TRIGGERS:                                    │
│   ├── Idle timeout (configurable)                       │
│   ├── App minimize                                      │
│   ├── System lock                                       │
│   └── Manual lock button                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **PIN Setup** | First-time PIN creation dengan confirmation |
| **PIN Verification** | Secure comparison (hashed, not plaintext) |
| **Auto-Lock Timer** | Configurable idle timeout (1-60 menit) |
| **Lock Triggers** | Minimize, system sleep, manual trigger |
| **Secure Storage** | PIN stored menggunakan OS-level encryption |
| **Lock Screen UI** | Minimalist overlay dengan PIN input |

#### **Security Considerations:**
- PIN tidak pernah disimpan dalam plaintext
- Gunakan **electron.safeStorage** untuk enkripsi level OS
- Maximum retry limit dengan cooldown period
- Option untuk reset PIN dengan confirmation

#### **Milestone:**
✅ Aplikasi terkunci otomatis setelah 5 menit idle, terbuka hanya dengan PIN yang benar

---

### **🔷 FASE 5: Notification System (Minggu 8)**

#### **Tujuan:**
Push notification real-time untuk setiap service dengan notifikasi badge.

#### **Konsep Notification Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                 NOTIFICATION SYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│   │  Service 1  │    │  Service 2  │    │  Service 3  │ │
│   │  WhatsApp   │    │  Telegram   │    │    Gmail    │ │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│          │                  │                  │         │
│          └──────────────────┼──────────────────┘         │
│                             │                            │
│                             ▼                            │
│                  ┌──────────────────┐                   │
│                  │ Notification Hub │                   │
│                  │  (Aggregator)    │                   │
│                  └────────┬─────────┘                   │
│                           │                             │
│              ┌────────────┼────────────┐               │
│              │            │            │               │
│              ▼            ▼            ▼               │
│       ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│       │  Native  │ │  Badge   │ │  Sound   │          │
│       │  Popup   │ │  Counter │ │  Alert   │          │
│       └──────────┘ └──────────┘ └──────────┘          │
│                                                          │
│   PER-SERVICE MUTE:                                      │
│   ├── Global mute toggle                                │
│   ├── Individual service mute                           │
│   └── Schedule mute (optional future)                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **Notification Hub** | Central aggregator untuk semua notifikasi |
| **Native Integration** | Windows Toast, macOS Notification Center, Linux libnotify |
| **Badge Counter** | Angka notifikasi pada icon aplikasi dan systray |
| **Per-Service Mute** | Toggle mute per individual service |
| **Notification Preview** | Show message preview atau hide sensitive content |
| **Click Action** | Klik notifikasi langsung buka service terkait |

#### **Milestone:**
✅ Notifikasi muncul otomatis saat ada pesan baru, bisa di-mute per service

---

### **🔷 FASE 6: System Tray & Background Mode (Minggu 9)**

#### **Tujuan:**
Aplikasi dapat berjalan di background dengan akses cepat dari system tray.

#### **Konsep System Tray:**

```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEM TRAY MENU                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │  📦 RijanBox                                    │   │
│   ├─────────────────────────────────────────────────┤   │
│   │  🖥️  Open RijanBox                              │   │
│   │  ⚙️  Settings                                   │   │
│   │  🔒  Lock Now                                   │   │
│   ├─────────────────────────────────────────────────┤   │
│   │  📊 Active Services: 5                          │   │
│   │  🔔 Notifications: 12                           │   │
│   ├─────────────────────────────────────────────────┤   │
│   │  ❌ Exit RijanBox                               │   │
│   └─────────────────────────────────────────────────┤   │
│                                                          │
│   BEHAVIOR OPTIONS:                                      │
│   ├── Close to tray (default)                           │
│   ├── Start minimized to tray                           │
│   └── Show notification count on tray icon              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **Tray Icon** | Icon dengan badge counter notifikasi |
| **Tray Menu** | Menu kontekstal dengan aksi cepat |
| **Minimize Behavior** | Close button minimize to tray, bukan exit |
| **Startup Options** | Config untuk start minimized atau normal |
| **Exit Confirmation** | Confirm sebelum exit penuh dari aplikasi |

#### **Milestone:**
✅ Klik close = minimize to tray, exit hanya dari tray menu dengan konfirmasi

---

### **🔷 FASE 7: Settings & Preferences (Minggu 10)**

#### **Tujuan:**
Halaman pengaturan lengkap untuk kustomisasi aplikasi.

#### **Konsep Settings Page:**

```
┌─────────────────────────────────────────────────────────┐
│                      SETTINGS PAGE                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐ ┌─────────────────────────────────────┐ │
│  │            │ │                                     │ │
│  │  🏠 General│ │  LANGUAGE                           │ │
│  │            │ │  [🇮🇩 Indonesian ▼]                 │ │
│  │  🔐 Security│ │                                     │ │
│  │            │ │  STARTUP                            │ │
│  │  🎨 Appearance│ │  ☐ Start RijanBox on login        │ │
│  │            │ │  ☐ Start minimized                  │ │
│  │  🔔 Notifications│ │                                     │ │
│  │            │ │  THEME                              │ │
│  │  ⚡ Shortcuts│ │  ○ Light  ○ Dark  ○ Auto (System) │ │
│  │            │ │                                     │ │
│  │  📦 Services│ │  AUTO-LOCK                        │ │
│  │            │ │  [5 minutes ▼] idle before lock    │ │
│  │            │ │                                     │ │
│  └────────────┘ │                                     │ │
│                 └─────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **Language Selector** | Indonesian / English (i18n ready) |
| **Theme Toggle** | Light / Dark / Auto (follow system) |
| **Auto-Start** | Toggle start on login dengan opsi minimized |
| **Auto-Lock Interval** | Dropdown 1-60 menit atau never |
| **Service Management** | List semua service dengan edit/delete |
| **Settings Persistence** | Semua preferensi tersimpan lokal |

#### **Milestone:**
✅ Semua pengaturan dapat diubah dan tersimpan permanen, bahasa bisa diganti

---

### **🔷 FASE 8: Keyboard Shortcuts (Minggu 11)**

#### **Tujuan:**
Navigasi cepat menggunakan keyboard untuk power users.

#### **Shortcut Mapping:**

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + L` | Lock aplikasi sekarang |
| `Ctrl/Cmd + ,` | Buka Settings |
| `Ctrl/Cmd + N` | Tambah service baru |
| `Ctrl/Cmd + 1-9` | Switch ke service 1-9 |
| `Ctrl/Cmd + K` | Quick search services |
| `Ctrl/Cmd + M` | Mute/unmute service aktif |
| `Ctrl/Cmd + W` | Tutup service aktif |
| `Ctrl/Cmd + Q` | Exit aplikasi |
| `Ctrl/Cmd + T` | Toggle sidebar |
| `F11` | Fullscreen mode |

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **Global Shortcuts** | Shortcut yang bekerja di seluruh aplikasi |
| **Service Shortcuts** | Shortcut spesifik saat service aktif |
| **Shortcut Customization** | (Future) User bisa remap shortcut |
| **Shortcut Helper** | Overlay menampilkan semua shortcut (Ctrl+/) |

#### **Milestone:**
✅ Semua shortcut utama berfungsi dan ada cheat sheet accessible

---

### **🔷 FASE 9: Polish, Testing & Release (Minggu 12)**

#### **Tujuan:**
Finalisasi, testing menyeluruh, dan persiapan release.

#### **Testing Checklist:**

| Area | Test Items |
|------|------------|
| **Functional** | Semua 10 fitur inti bekerja sesuai spesifikasi |
| **Cross-Platform** | Windows 10/11, macOS 12+, Linux (Ubuntu, Fedora) |
| **Security** | PIN encryption, session isolation, no data leak |
| **Performance** | Memory usage <500MB dengan 10 services, startup <3 detik |
| **Notification** | Notifikasi muncul di semua platform dengan benar |
| **Auto-Lock** | Lock trigger bekerja pada semua kondisi |
| **System Tray** | Tray icon dan menu berfungsi di semua OS |
| **Settings** | Semua preferensi tersimpan dan applied dengan benar |

#### **Deliverables:**

| Komponen | Deskripsi |
|----------|-----------|
| **Build Pipeline** | Automated build untuk 3 platform |
| **Installer** | .exe (Windows), .dmg (macOS), .deb/.AppImage (Linux) |
| **Documentation** | README, user guide, contributor guide |
| **License** | MIT/GPL license untuk open source |
| **Repository** | Public GitHub repository |
| **Release Notes** | Changelog untuk versi 1.0.0 |

#### **Milestone:**
✅ Release v1.0.0 di GitHub dengan installer untuk 3 platform

---

## 🎨 **DESIGN PRINCIPLES**

### **Material Design Minimalist**

```
┌─────────────────────────────────────────────────────────┐
│                   UI DESIGN GUIDELINES                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  COLOR PALETTE:                                          │
│  ├── Primary: Deep Blue (#1976D2)                       │
│  ├── Secondary: Teal (#009688)                          │
│  ├── Background: White / Dark Gray                      │
│  ├── Surface: Light Gray / Darker Gray                  │
│  └── Error: Red (#D32F2F)                               │
│                                                          │
│  TYPOGRAPHY:                                             │
│  ├── Headings: Inter / Roboto (Bold)                    │
│  ├── Body: Inter / Roboto (Regular)                     │
│  └── Monospace: JetBrains Mono (untuk code/paths)       │
│                                                          │
│  SPACING:                                                │
│  ├── Base unit: 8px                                     │
│  ├── Small: 8px, Medium: 16px, Large: 24px              │
│  └── Consistent padding throughout                      │
│                                                          │
│  COMPONENTS:                                             │
│  ├── Flat buttons dengan subtle shadow                  │
│  ├── Rounded corners (8px radius)                       │
│  ├── Minimal icons (Material Icons / Lucide)            │
│  └── Smooth transitions (200-300ms)                     │
│                                                          │
│  LAYOUT:                                                 │
│  ├── Sidebar navigation (collapsible)                   │
│  ├── Main content area (service webview)                │
│  ├── Top bar (search, notifications, profile)           │
│  └── Settings as modal or separate page                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **Dark Mode Implementation:**
- Auto-detect system preference
- Manual override option
- Smooth transition antara light/dark
- Semua komponen memiliki dark variant

---

## 📊 **FEATURE PRIORITIZATION MATRIX**

| Fitur | Priority | Complexity | Phase |
|-------|----------|------------|-------|
| Session Management | 🔴 Critical | High | 2 |
| Service Catalog | 🔴 Critical | Medium | 3 |
| PIN Lock System | 🔴 Critical | Medium | 4 |
| Notification System | 🔴 Critical | High | 5 |
| System Tray | 🟠 High | Low | 6 |
| Settings Page | 🟠 High | Medium | 7 |
| Keyboard Shortcuts | 🟡 Medium | Low | 8 |
| Custom Icons | 🟡 Medium | Low | 3 |
| Auto-Lock Timer | 🟠 High | Low | 4 |
| Per-Service Mute | 🟠 High | Low | 5 |
| Language i18n | 🟡 Medium | Medium | 7 |
| Theme Toggle | 🟡 Medium | Low | 7 |

---

## 🚀 **POST-LAUNCH ROADMAP**

### **Versi 1.1 (Month 4-5)**
- Workspace grouping (kelompokkan services by project)
- Service search within app (Ctrl+K)
- Import/Export settings

### **Versi 1.2 (Month 6-7)**
- Biometric unlock (Touch ID, Windows Hello)
- Service-specific proxy settings
- Backup & restore data

### **Versi 2.0 (Month 8-12)**
- Mobile companion app (status sync)
- Cloud sync untuk settings (encrypted)
- Plugin system untuk custom functionality

---

## ⚠️ **RISK MITIGATION**

| Risk | Impact | Mitigation |
|------|--------|------------|
| Session data corruption | High | Auto-backup session data, recovery mode |
| Memory leak dengan banyak services | High | Implement service suspension untuk inactive services |
| Notification not working on some OS | Medium | Fallback notification system, thorough testing |
| Security vulnerability | Critical | Regular security audit, dependabot for updates |
| Platform-specific bugs | Medium | CI/CD dengan testing di 3 platform |

---

## 📋 **SUMMARY CHECKLIST - 10 CORE FEATURES**

| # | Fitur | Status |
|---|-------|--------|
| 1 | ✅ Gratis dan Opensource | MIT License, Public GitHub |
| 2 | ✅ Unlimited akun sosial media | Session partitioning system |
| 3 | ✅ PIN + Auto-lock interval | Security module dengan configurable timer |
| 4 | ✅ Service catalog + Custom URL | Predefined 50+ services + URL input |
| 5 | ✅ Custom icon + Auto favicon | Icon manager dengan favicon fetcher |
| 6 | ✅ Push notification | Native OS notification integration |
| 7 | ✅ System tray (Open, Settings, Exit) | Tray icon dengan context menu |
| 8 | ✅ Settings (Language, Auto-start, Theme) | Complete preferences page |
| 9 | ✅ Keyboard shortcuts | 10+ shortcuts untuk navigasi |
| 10 | ✅ Per-service mute | Individual mute toggle per service |

---

## 🎯 **NEXT STEPS**

1. **Setup Repository** - Buat GitHub repo dengan license MIT
2. **Design Mockup** - Buat wireframe UI untuk semua halaman
3. **Development Environment** - Setup Electron + TypeScript + Build tools
4. **Start Phase 1** - Begin foundation development
5. **Weekly Sprints** - 2-week sprint cycle dengan demo setiap akhir fase

---

Dokumen ini adalah blueprint lengkap untuk mengembangkan **RijanBox**. Setiap fase memiliki deliverables yang jelas dan milestone yang terukur. Fokus pada **kesederhanaan, keamanan, dan performa** tanpa fitur berlebihan yang tidak diperlukan.
