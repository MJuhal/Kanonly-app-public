# KANONLY — Free Open Source Demo

<p align="center">
  <img src="public/logo-text.svg" alt="KANONLY" width="200">
</p>

<p align="center">
  <a href="https://www.kanonly.me/">
    <img src="https://img.shields.io/badge/download-kanonly.me-blue?style=for-the-badge" alt="Download">
  </a>
  <a href="https://github.com/MJuhal/Kanonly-app-public">
    <img src="https://img.shields.io/badge/repo-public-green?style=for-the-badge" alt="Public Repo">
  </a>
</p>

This is the **free, open-source demo** of KANONLY — a privacy-first, offline Kanban desktop app for Windows. This repository exists for **transparency and trust**: anyone can inspect the code, compile it, and use a limited version of the app.

> 🇦🇷 Made in Buenos Aires by [Martin Juhal](https://www.martinjuhal.com).

---

## ⚠️ This is a Limited Demo

This public repo contains a **fully functional but limited** version of KANONLY. The complete app with all features is available at [**kanonly.me**](https://www.kanonly.me/).

| Feature | This Repo (Free) | Full App (Donation) |
|---------|------------------|---------------------|
| Boards | **1 only** | Unlimited |
| Tickets per board | **10 max** | Unlimited |
| Notes | ❌ Not included | ✅ Unlimited notes |
| Ticket comments | ❌ Not included | ✅ Full comments |
| Column colors | ❌ Not included | ✅ 10-color picker |
| Drag & drop | ✅ Included | ✅ Included |
| Rich-text editor | ✅ Included | ✅ Included |
| Undo (Ctrl+Z) | ✅ Included | ✅ Included |
| Auto-backup (SQLite) | ✅ Included | ✅ Included |
| Bilingual (ES/EN) | ✅ Included | ✅ Included |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Shell | Tauri v2 (Rust) |
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Drag & Drop | @dnd-kit |
| Database | SQLite (bundled) |

---

## 🚀 Build from Source

### Prerequisites

- [Rust](https://rustup.rs/) (v1.77.2+)
- [Node.js](https://nodejs.org/) (v20+)

### Development

```bash
# Install frontend dependencies
npm install

# Run the app in development mode
npm run tauri dev
```

### Production Build

```bash
# Build for production
npm run tauri build
```

The installer will be generated in `src-tauri/target/release/bundle/`.

---

## 📁 Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── store/              # Zustand stores
│   ├── i18n/               # Translations (ES/EN)
│   └── ...
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # Entry point
│   │   ├── lib.rs          # Tauri commands
│   │   └── db/             # SQLite models & queries
│   └── ...
└── public/                 # Static assets
```

> **Note:** This repo does not include Pro-specific modules (license system, upgrade modal, JWT validation, or commercial fonts). Those are kept in the private source repository.

---

## 🤝 Contributing

This is a **source-available** demo. Contributions are welcome for:

- Bug fixes
- UI/UX improvements
- Documentation
- Translations

Please open an issue before submitting major changes.

---

## 📄 License

[PolyForm Noncommercial License 1.0.0](LICENSE)

- ✅ Read, study, and learn from the code
- ✅ Fork for personal use
- ✅ Contribute improvements
- ❌ Commercial use without permission

---

## 💬 Why a Limited Public Repo?

As a solo indie developer, I believe in **transparency**: you should be able to see exactly what the app does before installing it. At the same time, I need a sustainable way to keep improving KANONLY. By open-sourcing a functional but limited demo, I can offer both trust and a reason to support the project.

**Get the full app:** 👉 [kanonly.me](https://www.kanonly.me/)

---

Built with ❤️ by [Martin Juhal](https://www.martinjuhal.com)
