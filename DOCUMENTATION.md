# KANONLY v1.7.0 — Documentación Técnica (Repositorio Público)

**Autor:** Martin Juhal  
**Versión:** 1.7.0  
**Fecha:** Junio 2026  
**Licencia:** PolyForm Noncommercial 1.0.0

> Este es el repositorio público de KANONLY. A partir de la v1.7.0, el código público es idéntico al repositorio privado y la aplicación es 100% gratuita sin límites.

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Persistencia](#6-persistencia)
7. [Componentes Principales](#7-componentes-principales)
8. [Flujos de Usuario y Features](#8-flujos-de-usuario-y-features)
9. [Guía de Build y Distribución](#9-guía-de-build-y-distribución)
10. [Decisiones Técnicas Clave](#10-decisiones-técnicas-clave)
11. [Novedades de la v1.5](#11-novedades-de-la-v15)

---

## 1. Resumen Ejecutivo

**KANONLY** es una aplicación de gestión de proyectos tipo Kanban de escritorio para Windows, diseñada para equipos y profesionales individuales que necesitan organizar tareas de forma visual, rápida y sin dependencias de servicios en la nube.

La aplicación combina tableros Kanban con un editor de texto enriquecido (WYSIWYG), sistema de comentarios, notas independientes con DnD, colores de columna, búsqueda global, y persistencia totalmente local mediante SQLite. No requiere conexión a internet ni backend externo.

### Características Principales

- **Tableros Kanban ilimitados** con columnas y tickets drag-and-drop
- **Notas independientes** con reordenamiento DnD
- **Editor WYSIWYG** con formato enriquecido (negrita, cursiva, tachado, código inline, bloques de código)
- **Comentarios** en tickets con timestamps
- **Colores de columna** — selector de 10 colores por columna
- **Búsqueda global** en títulos, descripciones e IDs
- **Deshacer (Ctrl+Z)** hasta 3 estados anteriores
- **Persistencia local** vía SQLite con backup automático
- **Pantalla de bienvenida** con acceso rápido a tableros y notas recientes
- **Internacionalización (i18n)** con auto-detección de idioma del sistema (es/en)
- **Fuentes tipográficas** Roboto (cuerpo) + Neutra Text (títulos)
- **Instalador Windows** con WebView2 embebido

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Frontend Framework | React | 19.2.6 | Renderizado declarativo de la UI |
| Build Tool | Vite | 8.0.12 | Bundling, dev server y HMR |
| Styling | Tailwind CSS | 4.3.0 | Utility-first CSS framework |
| PostCSS Plugin | @tailwindcss/postcss | 4.3.0 | Integración Tailwind con Vite |
| Desktop Shell | Tauri | 2.11.2 | Runtime desktop nativo sobre WebView2 |
| State Management | Zustand | 5.0.13 | Store global ligero y reactivo |
| Drag & Drop Core | @dnd-kit/core | 6.3.1 | Motor de drag-and-drop accesible |
| Drag & Drop Sortable | @dnd-kit/sortable | 10.0.0 | Reordenamiento de listas sortables |
| Iconografía | lucide-react | 1.16.0 | Iconos SVG consistentes |
| Database | SQLite (rusqlite) | 0.32 | Base de datos local embebida |
| Backend | Rust | 1.77.2+ | Comandos Tauri + I/O SQLite |
| Tauri CLI | @tauri-apps/cli | 2.11.2 | Tooling de build y bundling |
| Tauri API | @tauri-apps/api | 2.11.0 | Bridge JS ↔ Rust |

### Requisitos de Desarrollo

- Node.js 20+ con npm
- Rust toolchain (`stable-x86_64-pc-windows-msvc`)
- Visual Studio Build Tools con workload de C++ (requerido por Tauri en Windows)
- Windows 10/11

---

## 3. Arquitectura del Sistema

KANONLY sigue un patrón de **Single-Page Application (SPA)** empaquetada como aplicación de escritorio nativa mediante Tauri.

```
+-------------------------------------------------------------+
|                      CAPA DE PRESENTACIÓN                    |
|  +-------------------------------------------------------+  |
|  |  React 19 + Vite 8 + Tailwind CSS 4                   |  |
|  |  - Componentes funcionales con hooks                  |  |
|  |  - Zustand para estado global                         |  |
|  |  - @dnd-kit para drag-and-drop                        |  |
|  +-------------------------------------------------------+  |
|                         |                                    |
|              Tauri WebView2 (Chromium Edge)                  |
|                         |                                    |
+-------------------------------------------------------------+
|                      CAPA DE BRIDGE                          |
|  +-------------------------------------------------------+  |
|  |  @tauri-apps/api (invoke)                             |  |
|  |  - load_all_data()                                    |  |
|  |  - save_all_data(data)                                |  |
|  |  - get_data_path()                                    |  |
|  +-------------------------------------------------------+  |
|                         |                                    |
+-------------------------------------------------------------+
|                      CAPA DE BACKEND                         |
|  +-------------------------------------------------------+  |
|  |  Rust (Tauri Runtime)                                 |  |
|  |  - rusqlite para persistencia SQLite                  |  |
|  +-------------------------------------------------------+  |
|                         |                                    |
+-------------------------------------------------------------+
|                      CAPA DE PERSISTENCIA                    |
|  +-------------------------------------------------------+  |
|  |  SQLite Local (bundled)                               |  |
|  |  - Tablas: boards, columns, tickets, notes, comments  |  |
|  |  - Migraciones automáticas vía ALTER TABLE            |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

### Principios Arquitectónicos

1. **Frontend-Heavy**: Toda la lógica de negocio reside en React/Zustand. El backend Rust es un proxy de I/O para SQLite.
2. **Sin Dependencias de Red**: La aplicación funciona 100% offline. No hay API REST, ni base de datos remota, ni autenticación.
3. **Fallback Multi-Entorno**: En modo desarrollo (navegador), los datos se persisten en `localStorage`. En producción (Tauri), en SQLite vía Rust.
4. **100% Gratuito**: No hay licencias, pagos ni planes. Todos los usuarios tienen acceso completo a todas las funcionalidades.

---

## 4. Estructura del Proyecto

```
miikanban/
├── public/                         # Assets estáticos (logo, iconos, fuentes)
│   ├── logo-text.svg
│   └── my-logo.png
│
├── src/
│   ├── components/
│   │   ├── ui/                     # Primitivas de UI reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Modal.jsx
│   │   │
│   │   ├── App.jsx                 # Entry point: layout + routing + Ctrl+Z
│   │   ├── BoardView.jsx           # Vista Kanban: header + columnas + DnD
│   │   ├── BoardsView.jsx          # Grid de tableros con métricas
│   │   ├── Column.jsx              # Columna sortable + droppable + color picker
│   │   ├── ConfirmModal.jsx        # Modal de confirmación reutilizable
│   │   ├── CreateBoardModal.jsx    # Modal de creación de tablero
│   │   ├── CreateColumnModal.jsx   # Modal de creación de columna (con color)
│   │   ├── CreateNoteModal.jsx     # Modal de creación de nota
│   │   ├── CreateTicketModal.jsx   # Modal de creación de ticket
│   │   ├── HomeView.jsx            # Pantalla de bienvenida
│   │   ├── NoteDetail.jsx          # Panel lateral de edición de notas
│   │   ├── NotesView.jsx           # Lista vertical de notas con DnD reorder
│   │   ├── RichTextEditor.jsx      # Editor WYSIWYG contentEditable
│   │   ├── Sidebar.jsx             # Barra lateral de navegación
│   │   ├── TicketCard.jsx          # Tarjeta de ticket draggable
│   │   └── TicketDetail.jsx        # Panel lateral de edición de tickets
│   │
│   ├── lib/
│   │   └── htmlHelpers.js          # Helpers: isHtml, markdownToHtml
│   │
│   ├── store/
│   │   ├── boardStore.js           # Zustand store: estado global + acciones + undo
│   │   └── persistence.js          # Capa de persistencia: Tauri vs localStorage
│   │
│   ├── i18n/
│   │   ├── index.js                # Sistema de traducciones
│   │   └── translations.js         # Strings ES/EN
│   │
│   ├── index.css                   # Tailwind + fuentes (Roboto + Neutra Text)
│   └── main.jsx                    # Entry point
│
├── src-tauri/                      # Backend Rust (Tauri)
│   ├── src/
│   │   ├── main.rs                 # Entry point Rust
│   │   ├── lib.rs                  # Comandos Tauri + setup
│   │   └── db/                     # Módulo SQLite
│   │       ├── mod.rs              # CRUD y migraciones
│   │       ├── models.rs           # Structs AppData
│   │       ├── queries.rs          # Queries SQL
│   │       └── schema.rs           # Schema + migraciones
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── Cargo.lock
│
├── web/                            # Landing page (privada)
├── index.html
├── vite.config.js
├── package.json
└── DOCUMENTATION.md                # Este documento
```

---

## 5. Modelo de Datos

La aplicación maneja 5 entidades principales. Todos los IDs son strings aleatorios en base36.

### 5.1 Board (Tablero)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único global |
| `name` | string | Nombre del tablero |
| `icon` | string \| null | Emoji opcional |
| `createdAt` | number | Timestamp UNIX |
| `ticketCounter` | number | Contador para displayIds |

### 5.2 Column (Columna)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único |
| `title` | string | Nombre de la columna |
| `boardId` | string | Referencia al tablero |
| `order` | number | Posición horizontal |
| `ticketIds` | string[] | IDs ordenados de tickets |
| `color` | string \| null | Color del título (hex) |

### 5.3 Ticket (Tarea)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID único global |
| `displayId` | string | ID legible secuencial (ej: "0001") |
| `title` | string | Título |
| `icon` | string \| null | Emoji opcional |
| `description` | string | HTML del editor WYSIWYG |
| `links` | string[] | URLs adjuntas (legacy) |
| `images` | string[] | Imágenes base64 |
| `columnId` | string | Columna actual |
| `priority` | string | `"low"` \| `"medium"` \| `"high"` |
| `createdAt` | number | Timestamp |
| `deadline` | number \| null | Fecha límite |
| `comments` | Comment[] | Comentarios del ticket |

### 5.4 Comment (Comentario)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID único |
| `text` | string | HTML del contenido |
| `createdAt` | number | Timestamp creación |
| `updatedAt` | number | Timestamp última edición |

### 5.5 Note (Nota)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID único |
| `title` | string | Título |
| `icon` | string \| null | Emoji opcional |
| `description` | string | HTML del editor |
| `links` | string[] | URLs (legacy) |
| `images` | string[] | Imágenes base64 |
| `priority` | string | `"low"` \| `"medium"` \| `"high"` |
| `createdAt` | number | Timestamp |
| `sortOrder` | number | Orden para DnD |
| `comments` | Comment[] | Comentarios de la nota (v1.5+) |

---

## 6. Persistencia

### 6.1 Flujo de Guardado

```
Usuario modifica datos
        |
        v
+---------------+
|  boardStore   |  Zustand action
+---------------+
        |
        v
+---------------+
|   persist()   |  Wrapper:
|               |  1. Snapshot para undo (max 3)
|               |  2. Llama saveData(toSave)
+---------------+
        |
        v
+---------------+
| persistence.js|  Detecta entorno:
|               |  - Tauri -> invoke('save_all_data', data)
|               |  - Browser -> localStorage
+---------------+
        |
        v
+---------------+
|   Rust (db)   |  save_all_data(data)
|               |  INSERT/UPDATE en SQLite
+---------------+
```

### 6.2 Esquema SQLite

Tablas principales:
- `boards` — tableros
- `columns` — columnas (con `color` y `sort_order`)
- `tickets` — tickets (con `comments` serializados como JSON)
- `notes` — notas (con `comments` y `sort_order`)

Migraciones automáticas: al iniciar, se ejecutan `ALTER TABLE` para agregar columnas nuevas si no existen (ej: `color`, `sort_order`).

### 6.3 Flujo de Carga

1. `boardStore.js` llama `loadData()` de forma asíncrona.
2. Si detecta JSON legacy, migra a SQLite automáticamente.
3. `loadData()` invoca `load_all_data()` en Rust.
4. Rust lee todas las tablas SQLite y devuelve `AppData`.
5. Fallback a `localStorage` si Tauri no está disponible.
6. Si no hay datos, inicializa con tablero demo de 4 tickets en 3 columnas.

### 6.4 Undo (Ctrl+Z)

- Cada mutación persistente crea snapshot de `boards`, `columns`, `tickets`, `notes`.
- Máximo 3 snapshots FIFO.
- Deshabilitado cuando el foco está en editores de texto para permitir undo nativo.

---

## 7. Componentes Principales

| Componente | Responsabilidad |
|-----------|-----------------|
| **App.jsx** | Layout global (Sidebar + Main), switch de vistas, listener Ctrl+Z. |
| **Sidebar.jsx** | Navegación lateral. Tableros, notas, logo. |
| **EmojiPicker.jsx** | Selector de emojis para tableros y notas. Grid por categorías. |
| **BoardView.jsx** | Vista Kanban. Header con búsqueda. Área scrollable horizontal con columnas. DnD context. |
| **BoardsView.jsx** | Grid de tarjetas de tableros con métricas. |
| **NotesView.jsx** | Lista vertical de notas con DnD reorder. |
| **Column.jsx** | Columna sortable + droppable. Header con color picker (10 colores). |
| **TicketCard.jsx** | Tarjeta draggable. Muestra displayId, título, prioridad, deadline. |
| **TicketDetail.jsx** | Panel lateral de ticket. Título, WYSIWYG, prioridad, deadline, imágenes, comentarios. |
| **NoteDetail.jsx** | Panel lateral de nota. Igual que TicketDetail pero sin columnas, con comentarios. |
| **RichTextEditor.jsx** | Editor WYSIWYG contentEditable. Toolbar + atajos Ctrl+B/I/U. Resize manual. |


---

## 8. Flujos de Usuario y Features

### 8.1 Gestión de Tableros

- Crear tablero: Click en "+" en sidebar → modal de nombre.
- Ver listado: Click en "Tableros" → `BoardsView`.
- Abrir tablero: Click en tarjeta → `BoardView`.
- Eliminar tablero: Click en 🗑️ en sidebar (solo si hay más de 1).

### 8.2 Gestión de Columnas

- Crear columna: Click en "+ Nueva Columna" → modal con selector de color.
- Reordenar columnas: Drag horizontal del grip.
- Cambiar color: Click en 🎨 en header → selector de 10 colores.
- Eliminar columna: Click en 🗑️ (con confirmación si tiene tickets).

### 8.3 Gestión de Tickets

- Crear ticket: Click en "+" dentro de columna → modal de título.
- Mover ticket: Drag entre columnas o reordenar dentro de una.
- Editar ticket: Click en tarjeta → `TicketDetail`.
- Eliminar ticket: 🗑️ en `TicketDetail` → confirmación.

### 8.4 Gestión de Notas

- Sección independiente en sidebar.
- Reordenamiento DnD en `NotesView`.
- Comentarios en notas (igual que tickets, v1.5+).

### 8.5 Editor WYSIWYG

Soporta: negrita, cursiva, tachado, código inline, bloques de código, enlaces auto-detectados, imágenes base64.

### 8.6 Atajos de Teclado

| Atajo | Acción | Scope |
|-------|--------|-------|
| `Ctrl + Z` | Deshacer (max 3) | Global (excepto editores) |
| `Ctrl + B` | Negrita | RichTextEditor |
| `Ctrl + I` | Cursiva | RichTextEditor |
| `Ctrl + U` | Subrayado | RichTextEditor |

---

## 9. Guía de Build y Distribución

### 9.1 Desarrollo

```bash
cd miikanban
npm install
npm run tauri dev
```

### 9.2 Producción

```bash
npm run build
npm run tauri build
```

Output:
```
src-tauri/target/release/bundle/
├── nsis/KANONLY_1.5.0_x64-setup.exe
└── msi/KANONLY_1.5.0_x64_en-US.msi
```

### 9.3 Requisitos

- Visual Studio Build Tools con workload C++.
- WebView2 Runtime (el NSIS lo instala silenciosamente si falta).

---

## 10. Decisiones Técnicas Clave

### 10.1 Tauri sobre Electron

Bundle ~3.4 MB vs 100-200 MB. Menor RAM. WebView2 nativo de Windows.

### 10.2 SQLite sobre JSON

Migración en v1.5: SQLite ofrece consultas estructuradas, mejor performance con grandes volúmenes, y transacciones. Migración automática desde JSON legacy.

### 10.4 contentEditable + execCommand

Evita librerías pesadas (TipTap, Quill). Menor bundle. Suficiente para el scope.

---

## 11. Novedades

### v1.7.0 — KANONLY 100% FREE (Junio 2026)
- **Eliminación completa del sistema de licencias PRO**.
- Removidos: `licenseStore.js`, `UpgradeModal.jsx`, `license.rs`, `store_purchase.rs`, `tauri-plugin-iap`, feature `tester-pro`, `dev_pro.flag`.
- Eliminados los límites FREE de 2 tableros y 10 notas: ahora todos los usuarios tienen tableros y notas ilimitados.
- Ya no se muestra ningún badge FREE/PRO ni modales de upgrade en la UI.
- Dependencias de Microsoft Store APIs (`windows` crate) removidas del backend.
- Versión 1.7.0 preparada para subir a Microsoft Store como app completamente gratuita.

### v1.6.3 — Native Store IAP Fix (Mayo 2026) *[Obsoleto en v1.7.0]*
- Reemplazo de `tauri-plugin-iap` por código nativo Rust para compra y validación de licencias.
- Fix crítico de detección de licencia PRO tras compra.

### v1.6.2 — Build MSIX (Mayo 2026)
- Script de empaquetado MSIX mejorado.
- MSIX sin firmar para Microsoft Partner Center.

### v1.6.1 — Microsoft Store IAP (Mayo 2026) *[Obsoleto en v1.7.0]*
- Migración a Microsoft Store In-App Purchase (add-on `ProUpgrade`).
- Eliminación del sistema JWT/PayPal legacy.

### v1.5.0 — Donation model + v1.5 features (Mayo 2026) *[Obsoleto en v1.7.0]*
- UpgradeModal rework: "DONACIÓN" / "DONATION".
- Column colors, comments, DnD fixes, Roboto font, auto-lang detection.

### 11.1 SQLite y Migración Automática
- Reemplazo de persistencia JSON por SQLite via rusqlite.
- Migración automática de datos JSON legacy al iniciar.

### 11.2 Column Colors
- Nuevo campo `color` en tabla `columns`.
- Selector de 10 colores en `CreateColumnModal` y `Column.jsx`.

### 11.3 Comentarios en Notas
- Campo `comments` en notas.
- CRUD completo en `NoteDetail.jsx` replicando `TicketDetail.jsx`.

### 11.4 DnD Reorder de Notas
- Campo `sort_order` en notas.
- `@dnd-kit` en `NotesView.jsx` para reordenar.

### 11.5 Fuente Roboto + Neutra Text
- Roboto (Google Fonts) para texto de cuerpo.
- Neutra Text (local OTF) solo para títulos via `.font-neutra`.

### 11.6 Auto-detección de Idioma
- `navigator.language` → ES si español, EN por defecto.
- Persistencia en `localStorage`.

---

*Documento actualizado para KANONLY v1.7.0 — Junio 2026.*
