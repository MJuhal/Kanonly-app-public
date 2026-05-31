# KANONLY Free Open Source — Documentación Técnica

**Autor:** Martin Juhal  
**Versión:** 1.6.3  
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

Esta es la **versión free y open-source** de KANONLY. Contiene todas las features no-PRO del proyecto: tableros Kanban ilimitados, notas independientes, comentarios, colores de columna, emoji picker, editor WYSIWYG, drag & drop, y persistencia SQLite local.

La única diferencia con la versión de Microsoft Store es la ausencia del **sistema de licencias PRO** (Microsoft Store IAP), que vive en el repositorio privado.

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
│   │   ├── BoardsView.jsx        # Grid de tableros
│   │   ├── Column.jsx            # Columna sortable/droppable + color picker
│   │   ├── CreateBoardModal.jsx
│   │   ├── CreateColumnModal.jsx # Con selector de color
│   │   ├── CreateNoteModal.jsx   # Modal de creación de nota
│   │   ├── CreateTicketModal.jsx
│   │   ├── EmojiPicker.jsx       # Selector de emojis
│   │   ├── HomeView.jsx          # Con sección de notas recientes
│   │   ├── NoteDetail.jsx        # Panel lateral de notas
│   │   ├── NotesView.jsx         # Lista de notas con DnD
│   │   ├── RichTextEditor.jsx
│   │   ├── Sidebar.jsx           # Tableros + notas
│   │   ├── TicketCard.jsx
│   │   └── TicketDetail.jsx      # Con comentarios
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

**Nota:** No existen en este repo (viven en el repositorio privado):
- `src/components/UpgradeModal.jsx`
- `src-tauri/src/license.rs`
- `src-tauri/src/store_purchase.rs`
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
| `icon` | string \| null | Emoji opcional |
| `ticketCounter` | number |

**Column**
| Campo | Tipo |
|-------|------|
| `id` | string |
| `title` | string |
| `boardId` | string |
| `order` | number |
| `ticketIds` | string[] |
| `color` | string \| null |

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
| `comments` | Comment[] |

### Entidades adicionales

**Note**
| Campo | Tipo |
|-------|------|
| `id` | string |
| `title` | string |
| `icon` | string \| null | Emoji opcional |
| `description` | string (HTML) |
| `images` | string[] (base64) |
| `priority` | string |
| `createdAt` | number |
| `sortOrder` | number |
| `comments` | Comment[] |

---

## 6. Persistencia

Igual que la versión completa: SQLite via Rust en producción, `localStorage` en desarrollo (browser).

Migraciones automáticas con `ALTER TABLE` al iniciar.

---

## 7. Componentes Principales

| Componente | Responsabilidad |
|-----------|-----------------|
| **App.jsx** | Layout global, switch de vistas, Ctrl+Z. |
| **Sidebar.jsx** | Navegación lateral con tableros y notas. |
| **BoardsView.jsx** | Grid de tableros con métricas. |
| **BoardView.jsx** | Vista Kanban. Header + columnas + búsqueda. |
| **Column.jsx** | Columna sortable/droppable con color picker (10 colores). |
| **TicketDetail.jsx** | Panel lateral. Título, WYSIWYG, prioridad, deadline, imágenes, comentarios. |
| **CreateColumnModal.jsx** | Input de título + selector de color. |
| **RichTextEditor.jsx** | Editor WYSIWYG completo (igual que en PRO). |

---

## 8. Flujos de Usuario

### 8.1 Tableros
- Crear: Click en "+" en sidebar o en BoardsView.
- Abrir: Click en tablero.
- Eliminar: 🗑️ en sidebar (con confirmación).

### 8.2 Columnas
- Crear: Click en "+ Nueva Columna".
- Reordenar: Drag horizontal del grip.
- Eliminar: 🗑️ en header.

### 8.3 Tickets
- Crear: Click en "+" dentro de columna.
- Mover: Drag entre columnas o reordenar dentro de una.
- Editar: Click en tarjeta → TicketDetail.
- Eliminar: 🗑️ en TicketDetail.

### 8.4 Notas
- Sección independiente en sidebar.
- Reordenamiento DnD en `NotesView`.
- Comentarios en notas (igual que tickets).

### 8.4 Editor WYSIWYG
- Negrita, cursiva, subrayado, código inline, bloques de código, imágenes base64.
- Atajos: Ctrl+B, Ctrl+I, Ctrl+U.

---

## 9. Diferencias con la Versión Completa

| Aspecto | Versión Pública | Versión Completa (Privada) |
|---------|-----------------|---------------------------|
| **Tableros** | ✅ Ilimitados | ✅ Ilimitados |
| **Tickets** | ✅ Ilimitados | ✅ Ilimitados |
| **Notas** | ✅ Completas | ✅ Completas |
| **Comentarios** | ✅ CRUD completo | ✅ CRUD completo |
| **Colores de columna** | ✅ 10 colores | ✅ 10 colores |
| **Emoji icons** | ✅ Incluido | ✅ Incluido |
| **Licencias / Store IAP** | ❌ No incluido | ✅ Microsoft Store IAP nativo |
| **UpgradeModal** | ❌ No incluido | ✅ Modal de upgrade |
| **Fuentes** | Solo Roboto (Google Fonts) | Roboto + Neutra Text (local OTF) |

---

## 10. Build y Distribución

> **Nota:** La versión completa con sistema de licencias PRO está disponible en [Microsoft Store](https://apps.microsoft.com).
> Este repo contiene el código free y open-source sin el sistema de licencias.

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

*Documento actualizado para KANONLY v1.6.3 — Mayo 2026.*
