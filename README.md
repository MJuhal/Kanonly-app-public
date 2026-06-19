# KANONLY — Free & Source-Available (v1.7.0)

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

This is the **free, source-available version** of **KANONLY** — a privacy-first, offline Kanban desktop app for Windows. This repository exists for **transparency and trust**: anyone can inspect the code, compile it, and use the app with all features unlocked.

> 🇦🇷 Made in Buenos Aires by [Martin Juhal](https://www.martinjuhal.com).

---

## ✨ Features

- **Unlimited Kanban boards** with customizable columns
- **Unlimited standalone notes** with rich-text editing
- **Drag & drop** for tickets and columns
- **Rich-text editor** with bold, italic, underline, inline code, code blocks
- **Emoji icons** for boards and notes
- **Comments** on tickets and notes with timestamps
- **Column colors** — 10-color picker for each column header
- **Ticket priorities** (low / medium / high)
- **Deadlines** with date picker
- **Image attachments** (base64 embedded)
- **Global search** across tickets
- **Undo (Ctrl+Z)** up to 3 previous states
- **Auto-persistence** via SQLite (bundled)
- **Bilingual UI** — auto-detects Spanish / English
- **Dark UI** optimized for focus

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

---

## 🤝 Contributing

This is a **source-available** project. Contributions are welcome for:

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

## 💬 Why a Public Repo?

As a solo indie developer, I believe in **transparency**: you should be able to see exactly what the app does before installing it. This public repository mirrors the full application and is provided free of charge.

**Download the app:** 👉 [kanonly.me](https://www.kanonly.me/)

---

Built with ❤️ by [Martin Juhal](https://www.martinjuhal.com)
