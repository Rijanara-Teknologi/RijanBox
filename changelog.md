# RijanBox - Changelog

## [1.2.1] - 2026-02-28
### Added
- **In-App Update Readiness** — Real-time GitHub release tracking with a dedicated update banner on startup and a manual "Check for Updates" button in About settings.
- **Expanded Emoji Picker** — Restructured emoji data into `emojis.json` to prevent IDE crashes and expanded library to over 200+ high-quality unicode emojis.
- **Webview Drag and Drop** — Fixed a global event conflict allowing files to be dragged and dropped directly into chat services like WhatsApp Web.
- **Local Favicons** — Offline-capable local favicon caching system to speed up the Homescreen and Catalog image loading.
- **Catalog Expansion** — Added 14 new popular services (Claude, DeepSeek, Perplexity, YouTube, Linear, Monday, DingTalk, Bilibili, AliExpress, etc.).

### Fixed
- **Webview Audio** — Enabled background notification sounds without requiring user gestures via `autoplay-policy` override.
- **External Link Handling** — Refined global link interceptor and added a right-click "Open in external browser" fallback.
- **UI Consistency** — Corrected rename modal width and fixed various untranslated update button labels in ID/EN.

## [1.1.0] - 2026-02-25
### Added
- **Service Hibernation** — Save RAM by right-clicking a service and selecting "Hibernate".
- **DNS AdBlocker** — Built-in DNS-over-HTTPS with 5 providers (NextDNS, AdGuard, etc.).
- **Homescreen UI** — Brand new welcome screen with statistics, quotes, and quick terminal.
- **Link Opening Behavior** — Toggle between opening links in-app or in your default browser.
- **PIN Length Limit** — Enforced 4-8 digits for PIN security with better validation.
- **Bilingual Documentation** — Comprehensive `id-docs.md` and `en-docs.md` in `docs` folder.

### Fixed
- **Sidebar Tooltips** — Icon tooltips now correctly switch between English and Indonesian.
- **Rename Modal** — Input field now stretches full-width for better visibility.
- **Translation Gaps** — Fixed various untranslated labels in Security and Theme settings.
- **PIN Status** — Real-time localized status indicator ("Active" / "Inactive").

### Improved
- **README.md** — Refreshed layout with screenshots and localized documentation links.
- **Navigation** — Consistent "Back to Home" button in settings.


## [2026-02-24] - Feature Update: Custom Icons, Cross-Platform & UX Improvements

### Added
- **Custom service icons** — Right-click service → "Ganti Ikon" to change icon
  - Emoji picker with 80 curated emojis
  - Upload custom image (PNG, JPG, GIF, SVG, WebP, ICO) via native file dialog
- **Service rename** — Right-click service → "Ubah Nama" to rename
- **Service reorder** — Right-click service → "Pindah Ke Atas / Ke Bawah"
- **PIN setup prompt** — Lock button now prompts to create PIN if none is configured
- **Modern user agent** — Chrome 130 UA for better service compatibility (WhatsApp, etc.)

### Fixed
- Settings icon changed from sun/brightness to **gear** icon ⚙️
- Tray icon now uses `icon.png` consistently across the app
- App name displays as "RijanBox" in notifications and taskbar (Windows AppUserModelId)

### Improved
- **Cross-platform system tray** — Proper behavior on Windows, macOS, and Linux
  - macOS: 16px template image, single-click restore, dock hide when minimized
  - Windows/Linux: 32px icon, double-click restore
- **Cross-platform auto-start** — `setLoginItemSettings` applied on startup for all OS
- **Close-to-tray on macOS** — Uses `before-quit` event for proper behavior
  - Dock icon hides when window is closed to tray
  - Dock shows again when window is restored via `activate`
- **Start minimized** — Works correctly with system tray on all platforms

### i18n
- Added translations: `contextMenu.changeIcon`, `iconPicker.emoji`, `iconPicker.upload`, `iconPicker.uploadText` (ID & EN)

---

## [2026-02-24] - Initial Build (Full Application)

### Session Info
- **Started:** 17:11 WIB
- **Focus:** Complete application build — all 10 core features

### Changes Made

#### Added
- `package.json` — Electron project configuration with build scripts
- `tsconfig.json` — TypeScript config (ES2020, strict mode)
- `.gitignore` — Node.js + Electron gitignore
- `LICENSE` — MIT License
- `README.md` — Project documentation
- `src/main/main.ts` — Electron main process entry point
- `src/main/store.ts` — Persistent config storage (electron-store)
- `src/main/security.ts` — PIN hashing (scrypt) and verification
- `src/main/tray.ts` — System tray icon and context menu
- `src/main/ipc-handlers.ts` — All IPC handlers (PIN, services, settings, notifications)
- `src/preload/preload.ts` — Secure context bridge (contextIsolation)
- `src/renderer/index.html` — Main UI shell with all panels
- `src/renderer/styles/main.css` — Design system (light/dark themes, animations)
- `src/renderer/app.js` — Renderer application logic
- `src/data/services-catalog.json` — 52 predefined services
- `src/data/i18n/id.json` — Indonesian translations
- `src/data/i18n/en.json` — English translations
- `assets/icon.svg` — Application icon
- `assets/tray-icon.svg` — System tray icon
- `planning.md` — Development planning document
- `changelog.md` — This file

### Features Completed
1. ✅ Gratis & Opensource (MIT License)
2. ✅ Unlimited akun sosial media (session partitioning)
3. ✅ PIN + Auto-lock (scrypt hashing, configurable timer)
4. ✅ Service catalog + Custom URL (52 services, search, categories)
5. ✅ Custom icon / Auto favicon (Google Favicons API)
6. ✅ Push notification (title-based detection, native notifications)
7. ✅ System tray (Open, Settings, Lock, Exit)
8. ✅ Settings (Language ID/EN, Theme light/dark/auto, Auto-start)
9. ✅ Keyboard shortcuts (10 shortcuts registered)
10. ✅ Per-service mute (toggle via context menu)

### Summary
Seluruh aplikasi RijanBox dibangun dari awal dalam satu sesi. Arsitektur menggunakan Electron + TypeScript untuk main process, vanilla JS untuk renderer, dan CSS design system dengan light/dark theme. Semua 10 fitur inti telah diimplementasikan.

### Next Session Notes
- Jalankan `npm install` untuk install dependencies
- Jalankan `npm run build` kemudian `npm start` untuk verifikasi
- Convert SVG icons ke PNG untuk kompatibilitas electron-builder
- Test di Windows, kemudian macOS dan Linux jika tersedia
- Fix bugs yang muncul saat testing awal
