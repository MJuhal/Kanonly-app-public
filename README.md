# KANONLY

A clean, offline-first Kanban board desktop app built with **Tauri v2** (Rust + React).

![KANONLY Logo](public/logo-text.svg)

## Features

- **Kanban Boards** — Create unlimited boards with customizable columns
- **Drag & Drop** — Intuitive card movement between columns
- **Notes** — Rich-text notes with priorities
- **Offline First** — All data stored locally in SQLite
- **Keyboard Shortcuts** — `Ctrl+Z` for undo
- **Bilingual** — Auto-detects Spanish / English
- **Lightweight** — Native desktop performance

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Shell | Tauri v2 (Rust) |
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Drag & Drop | @dnd-kit |
| Database | SQLite (bundled) |

## Prerequisites

- [Rust](https://rustup.rs/) (v1.77.2+)
- [Node.js](https://nodejs.org/) (v20+)

## Development

```bash
# Install frontend dependencies
npm install

# Run the app in development mode
npm run tauri dev
```

## Building

```bash
# Build for production
npm run tauri build
```

The installer will be generated in `src-tauri/target/release/bundle/`.

## Project Structure

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

## License

[Define your license here]

---

Built with ❤️ by [Martin Juhal](https://www.martinjuhal.com)
