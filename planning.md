# RijanBox - Development Planning

## Status Overview
- **Current Phase:** Fase 1 - Foundation & Core Setup (COMPLETE)
- **Overall Progress:** 90%
- **Last Updated:** 2026-02-24

## Phase Checklist

### Fase 1: Foundation & Core Setup ✅
- [x] Project structure (modular folders)
- [x] Electron base dengan security best practices (contextIsolation, nodeIntegration: false)
- [x] Build system (electron-builder untuk Windows, macOS, Linux)
- [x] TypeScript configuration
- [x] Design system (CSS variables, light/dark theme, Material Design)
- [x] Git ignore dan MIT License

### Fase 2: Session Management System ✅
- [x] Session Manager (partition-based isolation)
- [x] Service Instance (setiap service dalam webview terpisah)
- [x] Session Persistence (data login tersimpan via partition)
- [x] Service State tracking

### Fase 3: Service Catalog & Custom URL ✅
- [x] Service Database (52 predefined services dalam JSON)
- [x] Search Function (pencarian dengan filter kategori)
- [x] Custom URL Handler (input URL custom)
- [x] Favicon Fetcher (auto-extract favicon dari Google S2)
- [x] Icon Manager (favicon otomatis atau custom)

### Fase 4: Security & PIN Lock System ✅
- [x] PIN Setup (first-time creation dengan confirmation)
- [x] PIN Verification (secure hashing dengan scrypt)
- [x] Auto-Lock Timer (configurable 1-60 menit)
- [x] Lock Triggers (minimize, system lock, manual)
- [x] Secure Storage (PIN hashed, never plaintext)
- [x] Lock Screen UI (overlay dengan PIN input)

### Fase 5: Notification System ✅
- [x] Notification detection dari webview title changes
- [x] Native OS notifications via Electron Notification API
- [x] Badge counter pada sidebar items
- [x] Per-service mute toggle
- [x] Click notification -> switch to service

### Fase 6: System Tray & Background Mode ✅
- [x] Tray icon dengan context menu
- [x] Close to tray behavior
- [x] Tray menu (Open, Settings, Lock Now, Exit)
- [x] Double-click tray to restore

### Fase 7: Settings & Preferences ✅
- [x] Language selector (Indonesian/English)
- [x] Theme toggle (Light/Dark/Auto)
- [x] Auto-start on login
- [x] Start minimized option
- [x] Close to tray toggle
- [x] Auto-lock interval dropdown
- [x] PIN management (enable/change/disable)
- [x] Settings persistence via electron-store

### Fase 8: Keyboard Shortcuts ✅
- [x] Ctrl+1-9: Switch service
- [x] Ctrl+L: Lock app
- [x] Ctrl+,: Open settings
- [x] Ctrl+N: Add service
- [x] Ctrl+K: Search services
- [x] Ctrl+M: Toggle mute
- [x] Ctrl+T: Toggle sidebar
- [x] F11: Fullscreen

### Fase 9: Polish & Release
- [x] README.md
- [x] MIT License
- [x] planning.md & changelog.md
- [ ] npm install & build verification
- [ ] Icon assets (PNG format for electron-builder)
- [ ] Cross-platform testing

## Current Task
**Task:** npm install and build verification
**Started:** 2026-02-24
**Status:** In Progress
**Notes:** All source code files created. Need to install dependencies and verify build.

## Next Tasks
1. Run `npm install` dan verify dependencies
2. Run `npm run build` dan fix any TS errors
3. Run `npm start` dan verify app launches
4. Convert SVG icons to PNG format
5. Cross-platform testing

## Known Issues
- Icon files are SVG format; electron-builder may need PNG
- Tray icon uses nativeImage which prefers PNG/ICO format
- No automated tests yet (manual verification only)

## Technical Decisions
- **Electron** dipilih untuk cross-platform support
- **TypeScript** untuk main/preload, vanilla JS untuk renderer (simplicity)
- **electron-store** untuk persistent storage (no SQLite dependency)
- **scrypt** untuk PIN hashing (built-in crypto, no bcrypt dependency)
- **Google Favicons API** untuk auto-fetch service icons
- **Session partitioning** via Electron's `partition` attribute untuk isolasi akun
- **Frameless window** dengan custom titlebar untuk UI yang lebih bersih
- **CSS variables** untuk theming (light/dark) tanpa CSS framework
