# KANONLY Free Demo — Documentación Técnica

**Autor:** Martin Juhal  
**Versión:** 1.5.0 (Demo Pública)  
**Fecha:** Mayo 2026  
**Licencia:** PolyForm Noncommercial 1.0.0

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Persistencia](#6-persistencia)
7. [Componentes Principales](#7-componentes-principales)
8. [Flujos de Usuario](#8-flujos-de-usuario)
9. [Diferencias con la Versión Completa](#9-diferencias-con-la-versión-completa)
10. [Build y Distribución](#10-build-y-distribución)

---

## 1. Resumen Ejecutivo

Esta es la **versión demo pública** de KANONLY. Contiene el núcleo funcional de la app (tableros Kanban, tickets, editor WYSIWYG, drag & drop) pero con **límites intencionales** para incentivar el soporte al desarrollador.

### Límites de la versión demo

- **1 tablero** (máximo)
- **10 tickets** por tablero (máximo)
- **Sin sistema de notas**
- **Sin comentarios** en tickets
- **Sin colores de columna**

Todo lo demás funciona igual que en la versión completa: drag & drop, rich text, búsqueda, undo, persistencia SQLite, internacionalización.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React | 19.2.6 |
| Build | Vite | 8.0.12 |
| Styling | Tailwind CSS | 4.3.0 |
| Desktop | Tauri | 2.11.2 |
| State | Zustand | 5.0.13 |
| DnD | @dnd-kit | 6.3.1 / 10.0.0 |
| Database | SQLite (rusqlite) | 0.32 |
| Backend | Rust | 1.77.2+ |

---

## 3. Arquitectura

SPA empaquetada con Tauri. Frontend en React/Zustand, backend Rust como proxy de I/O SQLite.

```
+--------------------------------------------------+
|  React 19 + Tailwind + Zustand + @dnd-kit        |
+--------------------------------------------------+
|  Tauri WebView2                                   |
+--------------------------------------------------+
|  Rust: load_all_data / save_all_data / get_data_path |
+--------------------------------------------------+
|  SQLite (bundled)                                 |
+--------------------------------------------------+
```

---

## 4. Estructura del Proyecto

```
Kanonly-app-public/
├── src/
│   ├── components/
│   │   ├── ui/                   # Button, Input, Modal
│   │   ├── App.jsx               # Layout + routing + Ctrl+Z
│   │   ├── BoardView.jsx         # Vista Kanban
│   │   ├── BoardsView.jsx        # Grid de tableros (1 max)
│   │   ├── Column.jsx            # Columna sortable/droppable
│   │   ├── CreateBoardModal.jsx
│   │   ├── CreateColumnModal.jsx # Sin selector de color
│   │   ├── CreateTicketModal.jsx
│   │   ├── HomeView.jsx          # Sin sección de notas
│   │   ├── RichTextEditor.jsx
│   │   ├── Sidebar.jsx           # Solo tableros, sin notas
│   │   ├── TicketCard.jsx
│   │   └── TicketDetail.jsx      # Sin comentarios
│   ├── store/
│   │   ├── boardStore.js         # Estado global + undo
│   │   ├── licenseStore.js       # Stub (siempre FREE)
│   │   └── persistence.js        # SQLite / localStorage
│   └── i18n/                     # ES / EN
├── src-tauri/
│   └── src/
│       ├── lib.rs                # Sin módulo license
│       └── db/                   # SQLite CRUD
└── public/
```

**Nota:** No existen en este repo:
- `src/components/NotesView.jsx`
- `src/components/NoteDetail.jsx`
- `src/components/CreateNoteModal.jsx`
- `src/components/UpgradeModal.jsx`
- `src-tauri/src/license.rs`
- Fuentes comerciales (Neutra Text OTF)

---

## 5. Modelo de Datos

El schema SQLite es idéntico al de la versión completa, pero la UI no expone todas las entidades.

### Entidades expuestas en UI

**Board**
| Campo | Tipo |
|-------|------|
| `id` | string |
| `name` | string |
| `createdAt` | number |
| `ticketCounter` | number |

**Column**
| Campo | Tipo |
|-------|------|
| `id` | string |
| `title` | string |
| `boardId` | string |
| `order` | number |
| `ticketIds` | string[] |
| `color` | string \| null *(no editable en demo)* |

**Ticket**
| Campo | Tipo |
|-------|------|
| `id` | string |
| `displayId` | string |
| `title` | string |
| `description` | string (HTML) |
| `images` | string[] (base64) |
| `columnId` | string |
| `priority` | string |
| `createdAt` | number |
| `deadline` | number \| null |
| `comments` | Comment[] *(no editable en demo)* |

### Entidades ocultas en UI

**Note** — existe en schema SQLite pero no hay componentes para ver/crear/editar notas.

---

## 6. Persistencia

Igual que la versión completa: SQLite via Rust en producción, `localStorage` en desarrollo (browser).

Migraciones automáticas con `ALTER TABLE` al iniciar.

---

## 7. Componentes Principales

| Componente | Responsabilidad |
|-----------|-----------------|
| **App.jsx** | Layout global, switch de vistas, Ctrl+Z. |
| **Sidebar.jsx** | Solo sección de Tableros. Sin notas, sin badge PRO. Botón "+" deshabilitado si hay 1 tablero. |
| **BoardsView.jsx** | Grid de tableros. Contador "X / 1". Botón "Nuevo tablero" deshabilitado al límite. |
| **BoardView.jsx** | Vista Kanban. Header + columnas + búsqueda. |
| **Column.jsx** | Columna sortable/droppable. Sin color picker. Botón "+" deshabilitado si el tablero tiene 10 tickets. |
| **TicketDetail.jsx** | Panel lateral. Título, WYSIWYG, prioridad, deadline, imágenes. **Sin sección de comentarios.** |
| **CreateColumnModal.jsx** | Solo input de título. Sin selector de color. |
| **RichTextEditor.jsx** | Editor WYSIWYG completo (igual que en PRO). |

---

## 8. Flujos de Usuario

### 8.1 Tableros
- Crear: Click en "+" en sidebar o en BoardsView. **Máximo 1.**
- Abrir: Click en tablero.
- Eliminar: 🗑️ en sidebar (solo si hay >1, imposible en demo).

### 8.2 Columnas
- Crear: Click en "+ Nueva Columna".
- Reordenar: Drag horizontal del grip.
- Eliminar: 🗑️ en header.

### 8.3 Tickets
- Crear: Click en "+" dentro de columna. **Máximo 10 por tablero.**
- Mover: Drag entre columnas.
- Editar: Click en tarjeta → TicketDetail.
- Eliminar: 🗑️ en TicketDetail.

### 8.4 Editor WYSIWYG
- Negrita, cursiva, subrayado, código inline, bloques de código, imágenes base64.
- Atajos: Ctrl+B, Ctrl+I, Ctrl+U.

---

## 9. Diferencias con la Versión Completa

| Aspecto | Demo Pública | Versión Completa (Privada) |
|---------|-------------|---------------------------|
| **Notas** | Sin UI | NotesView, NoteDetail, CreateNoteModal |
| **Comentarios** | No renderizados en TicketDetail | CRUD completo en tickets y notas |
| **Colores de columna** | No hay picker | 10 colores en CreateColumnModal y Column |
| **Límite tableros** | 1 | Ilimitado |
| **Límite tickets** | 10 por tablero | Ilimitado |
| **Licencias** | Stub (`isPro: false`) | JWT validation con `jsonwebtoken` |
| **UpgradeModal** | No existe | Modal de donación completo |
| **Fuentes** | Solo Roboto (Google Fonts) | Roboto + Neutra Text (local OTF) |

---

## 10. Build y Distribución

```bash
npm install
npm run tauri dev      # Modo desarrollo
npm run tauri build    # Build de producción + instalador
```

Output:
```
src-tauri/target/release/bundle/
├── nsis/KANONLY_1.5.0_x64-setup.exe
└── msi/KANONLY_1.5.0_x64_en-US.msi
```

### Requisitos

- Visual Studio Build Tools con workload C++.
- WebView2 Runtime (NSIS lo instala silenciosamente si falta).

---

*Documento actualizado para KANONLY v1.5.0 Demo Pública — Mayo 2026.*
