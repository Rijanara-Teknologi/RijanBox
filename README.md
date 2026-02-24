# RijanBox

<p align="center">
  <strong>Multi-Messenger Desktop App</strong><br>
  Kelola unlimited akun sosial media dalam satu aplikasi desktop yang aman, ringan, dan elegan.
</p>

---

## ✨ Fitur

- 🆓 **Gratis & Open Source** — MIT License
- ♾️ **Unlimited Akun** — Tambahkan banyak akun dengan sesi terpisah
- 🔐 **PIN Security** — Kunci aplikasi dengan PIN + auto-lock
- 📦 **52+ Service Catalog** — WhatsApp, Telegram, Discord, dan lainnya
- 🎨 **Custom Icon** — Auto-fetch favicon atau upload custom
- 🔔 **Push Notification** — Notifikasi real-time per service
- 🖥️ **System Tray** — Berjalan di background, akses cepat dari tray
- ⚙️ **Settings Lengkap** — Bahasa (ID/EN), tema, auto-start
- ⌨️ **Keyboard Shortcuts** — Navigasi cepat untuk power users
- 🔇 **Per-Service Mute** — Bisukan notifikasi per layanan

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build & Run
npm start

# Development mode
npm run dev
```

## 🏗️ Tech Stack

- **Electron** — Cross-platform desktop framework
- **TypeScript** — Type-safe main process
- **Vanilla CSS** — Custom design system with light/dark themes
- **electron-store** — Persistent encrypted storage

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1-9` | Switch ke service 1-9 |
| `Ctrl+L` | Lock aplikasi |
| `Ctrl+,` | Buka Settings |
| `Ctrl+N` | Tambah service baru |
| `Ctrl+K` | Cari service |
| `Ctrl+M` | Mute/Unmute service |
| `Ctrl+T` | Toggle sidebar |
| `F11` | Fullscreen |

## 📁 Struktur Proyek

```
rijanbox/
├── src/
│   ├── main/          # Electron main process
│   ├── preload/       # Secure IPC bridge
│   ├── renderer/      # UI (HTML, CSS, JS)
│   └── data/          # Catalog & i18n
├── assets/            # Icons
├── planning.md        # Development planning
├── changelog.md       # Development changelog
└── LICENSE            # MIT License
```

## 📄 License

MIT License © 2026 Rijanara
