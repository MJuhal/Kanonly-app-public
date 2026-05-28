# KANONLY v1.5 — Documentacion Tecnica y de Usuario

**Autor:** Martin Juhal  
**Version:** 1.5  
**Fecha:** Mayo 2026  
**Licencia:** Propietaria

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Persistencia](#6-persistencia)
7. [Componentes Principales](#7-componentes-principales)
8. [Flujos de Usuario y Features](#8-flujos-de-usuario-y-features)
9. [Guia de Build y Distribucion](#9-guia-de-build-y-distribucion)
10. [Decisiones Tecnicas Clave](#10-decisiones-tecnicas-clave)
11. [Novedades de la v1.5](#11-novedades-de-la-v15)

---

## 1. Resumen Ejecutivo

**KANONLY** es una aplicacion de gestion de proyectos tipo Kanban de escritorio para Windows, disenada para equipos y profesionales individuales que necesitan organizar tareas de forma visual, rapida y sin dependencias de servicios en la nube.

La aplicacion combina la familiaridad de los tableros Kanban con un editor de texto enriquecido (WYSIWYG), sistema de comentarios, notas independientes, busqueda global, y persistencia totalmente local mediante archivos JSON. No requiere conexion a internet ni backend externo.

### Caracteristicas Principales

- **Tableros Kanban ilimitados** con columnas y tickets drag-and-drop
- **Editor WYSIWYG** con formato enriquecido (negrita, cursiva, tachado, codigo inline, bloques de codigo)
- **Comentarios** en tickets con autor fijo y timestamps
- **Notas independientes** fuera del flujo Kanban
- **Busqueda global** en titulos, descripciones e IDs
- **Deshacer (Ctrl+Z)** hasta 3 estados anteriores
- **Persistencia local** via JSON con backup automatico
- **Pantalla de bienvenida** con acceso rapido a tableros y notas recientes
- **Internacionalizacion (i18n)** con auto-deteccion de idioma del sistema (es/en)
- **Fuente tipografica personalizada** (Neutra Text)
- **Instalador Windows** de ~3.4 MB con WebView2 embebido

---

## 2. Stack Tecnologico

| Capa | Tecnologia | Version | Proposito |
|------|-----------|---------|-----------|
| Frontend Framework | React | 19.2.6 | Renderizado declarativo de la UI |
| Build Tool | Vite | 8.0.12 | Bundling, dev server y HMR |
| Styling | Tailwind CSS | 4.3.0 | Utility-first CSS framework |
| PostCSS Plugin | @tailwindcss/postcss | 4.3.0 | Integracion Tailwind con Vite |
| Desktop Shell | Tauri | 2.11.2 | Runtime desktop nativo sobre WebView2 |
| State Management | Zustand | 5.0.13 | Store global ligero y reactivo |
| Drag & Drop Core | @dnd-kit/core | 6.3.1 | Motor de drag-and-drop accesible |
| Drag & Drop Sortable | @dnd-kit/sortable | 10.0.0 | Reordenamiento de listas sortables |
| Iconografia | lucide-react | 0.16.0 | Iconos SVG consistentes |
| Backend | Rust | 1.77.2+ | Comandos Tauri para I/O de archivos |
| Tauri CLI | @tauri-apps/cli | 2.11.2 | Tooling de build y bundling |
| Tauri API | @tauri-apps/api | 2.11.0 | Bridge JS ↔ Rust |

### Requisitos de Desarrollo

- Node.js 20+ con npm
- Rust toolchain (`stable-x86_64-pc-windows-msvc`)
- Visual Studio Build Tools con workload de C++ (requerido por Tauri en Windows)
- Windows 10/11

---

## 3. Arquitectura del Sistema

KANONLY sigue un patron de **Single-Page Application (SPA)** empaquetada como aplicacion de escritorio nativa mediante Tauri.

```
+-------------------------------------------------------------+
|                      CAPA DE PRESENTACION                    |
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
|  |  - serde para serializacion/deserializacion JSON      |  |
|  |  - std::fs para operaciones de archivo                |  |
|  +-------------------------------------------------------+  |
|                         |                                    |
+-------------------------------------------------------------+
|                      CAPA DE PERSISTENCIA                    |
|  +-------------------------------------------------------+  |
|  |  Filesystem Local                                     |  |
|  |  - data/boards.json                                   |  |
|  |  - data/notes.json                                    |  |
|  |  - data/{boardId}/columns.json                        |  |
|  |  - data/{boardId}/tickets/{ticketId}.json             |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

### Principios Arquitectonicos

1. **Frontend-Heavy**: Toda la logica de negocio reside en React/Zustand. El backend Rust es un simple proxy de I/O.
2. **Sin Dependencias de Red**: La aplicacion funciona 100% offline. No hay API REST, ni base de datos remota, ni autenticacion.
3. **Fallback Multi-Entorno**: En modo desarrollo (navegador), los datos se persisten en `localStorage`. En produccion (Tauri), en el filesystem via Rust.
4. **Datos Human-Readable**: Toda la persistencia es JSON pretty-printed, permitiendo recuperacion manual o migracion directa.

---

## 4. Estructura del Proyecto

```
miikanban/
├── public/                         # Assets estaticos (logo, iconos)
│   └── my-logo.png
│
├── src/
│   ├── components/
│   │   ├── ui/                     # Primitivas de UI reutilizables
│   │   │   ├── Button.jsx          # Boton con variantes de estilo
│   │   │   ├── Input.jsx           # Campo de texto estilizado
│   │   │   └── Modal.jsx           # Contenedor modal generico
│   │   │
│   │   ├── App.jsx                 # Componente raiz: layout + routing + Ctrl+Z global
│   │   ├── BoardView.jsx           # Vista Kanban: header + columnas scrollables + DnD
│   │   ├── BoardsView.jsx          # Grid de tableros con metricas (tickets, fecha)
│   │   ├── Column.jsx              # Columna sortable (drag horizontal) + droppable
│   │   ├── ConfirmModal.jsx        # Modal de confirmacion custom (reemplaza native confirm)
│   │   ├── CreateBoardModal.jsx    # Modal de creacion de tablero
│   │   ├── CreateColumnModal.jsx   # Modal de creacion de columna
│   │   ├── CreateNoteModal.jsx     # Modal de creacion de nota
│   │   ├── CreateTicketModal.jsx   # Modal de creacion de ticket
│   │   ├── MarkdownEditor.jsx      # Editor de markdown (legacy, deprecado)
│   │   ├── MarkdownPreview.jsx     # Renderizado de HTML con syntax highlighting
│   │   ├── NoteDetail.jsx          # Panel lateral de edicion de notas
│   │   ├── NotesView.jsx           # Lista vertical de notas
│   │   ├── RichTextEditor.jsx      # Editor WYSIWYG contentEditable
│   │   ├── Sidebar.jsx             # Barra lateral de navegacion
│   │   ├── TicketCard.jsx          # Tarjeta de ticket draggable
│   │   └── TicketDetail.jsx        # Panel lateral de edicion de tickets
│   │
│   ├── lib/
│   │   └── htmlHelpers.js          # Helpers: isHtml, markdownToHtml, stripHtml
│   │
│   ├── store/
│   │   ├── boardStore.js           # Zustand store: estado global + acciones + undo
│   │   └── persistence.js          # Capa de persistencia: Tauri vs localStorage
│   │
│   ├── types/
│   │   └── index.js                # JSDoc typedefs (Ticket, Column, Board, AppData)
│   │
│   ├── index.css                   # Tailwind directives + estilos rich-text
│   └── main.jsx                    # Entry point: renderiza <App />
│
├── src-tauri/                      # Backend Rust (Tauri)
│   ├── icons/                      # Iconos generados (32x32, 128x128, ico, icns)
│   ├── src/
│   │   ├── lib.rs                  # Logica principal: structs, comandos Tauri, I/O
│   │   └── main.rs                 # Entry point Rust
│   ├── Cargo.toml                  # Dependencias Rust
│   └── tauri.conf.json             # Configuracion de Tauri (window, bundle, security)
│
├── index.html                      # HTML entry point
├── vite.config.js                  # Configuracion de Vite
├── package.json                    # Dependencias npm y scripts
├── eslint.config.js                # Configuracion de ESLint
└── DOCUMENTATION.md                # Este documento
```

---

## 5. Modelo de Datos

La aplicacion maneja 5 entidades principales. Todas las entidades usan identificadores unicos generados aleatoriamente en base36.

### 5.1 Board (Tablero)

Representa un proyecto o contexto de trabajo.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | string | Identificador unico global (random base36) |
| `name` | string | Nombre del tablero |
| `createdAt` | number | Timestamp UNIX de creacion |
| `ticketCounter` | number | Contador secuencial para generar displayIds |

### 5.2 Column (Columna)

Representa un estado del flujo de trabajo (ej: "To Do", "In Progress").

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | string | Identificador unico global |
| `title` | string | Nombre de la columna |
| `boardId` | string | Referencia al tablero padre |
| `order` | number | Posicion en el eje horizontal (0, 1, 2...) |
| `ticketIds` | string[] | Array ordenado de IDs de tickets en esta columna |

### 5.3 Ticket (Tarea)

Unidad central de trabajo dentro de un tablero.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | string | Identificador unico global |
| `displayId` | string | ID legible secuencial por tablero (ej: "0001", "0002") |
| `title` | string | Titulo de la tarea |
| `description` | string | Descripcion en HTML (WYSIWYG) |
| `links` | string[] | URLs extraidas o adjuntas (legacy) |
| `images` | string[] | Imagenes en base64 embebidas |
| `columnId` | string | Referencia a la columna actual |
| `priority` | string | `"low"` \| `"medium"` \| `"high"` |
| `createdAt` | number | Timestamp UNIX de creacion |
| `deadline` | number \| null | Timestamp UNIX de fecha limite |
| `comments` | Comment[] | Array de comentarios |

### 5.4 Comment (Comentario)

Mensaje asociado a un ticket.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | string | Identificador unico global |
| `text` | string | Contenido en HTML |
| `createdAt` | number | Timestamp de creacion |
| `updatedAt` | number | Timestamp de ultima edicion |

> Nota: El autor es siempre "MARTIN JUHAL" (hardcoded en UI). No hay campo `author` en el modelo.

### 5.5 Note (Nota)

Documento de texto libre, independiente de los tableros.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `id` | string | Identificador unico global |
| `title` | string | Titulo de la nota |
| `description` | string | Contenido en HTML (WYSIWYG) |
| `links` | string[] | URLs adjuntas (legacy) |
| `images` | string[] | Imagenes en base64 |
| `priority` | string | `"low"` \| `"medium"` \| `"high"` |
| `createdAt` | number | Timestamp de creacion |

### Diagrama de Relaciones

```
Board 1 ----* Column 1 ----* Ticket 1 ----* Comment
         |              |
         |              +----* Ticket 2
         |
         +----* Column 2 ----* Ticket 3

Note 1 (independiente)
Note 2 (independiente)
```

---

## 6. Persistencia

### 6.1 Flujo de Guardado

```
Usuario modifica datos
        |
        v
+---------------+
|  boardStore   |  Zustand action (createTicket, updateTicket, etc.)
+---------------+
        |
        v
+---------------+
|   persist()   |  Wrapper que:
|               |  1. Crea snapshot para undo (max 3)
|               |  2. Llama saveData(toSave)
+---------------+
        |
        v
+---------------+
| persistence.js|  Detecta entorno:
|               |  - Tauri -> invoke('save_all_data', data)
|               |  - Browser -> localStorage.setItem()
+---------------+
        |
        v
+---------------+
|   Rust (lib)  |  save_all_data(data: AppData)
|               |  1. Crea directorio data/
|               |  2. Escribe boards.json, notes.json
|               |  3. Por cada board:
|               |     - Crea data/{boardId}/
|               |     - Escribe columns.json
|               |     - Escribe tickets/{ticketId}.json (uno por archivo)
|               |  4. Elimina archivos obsoletos (cleanup)
+---------------+
```

### 6.2 Estructura de Archivos en Disco

```
data/
├── boards.json              # Lista de todos los tableros
├── notes.json               # Lista de todas las notas
├── {boardId-1}/
│   ├── columns.json         # Columnas de este tablero
│   └── tickets/
│       ├── abc123.json      # Ticket individual
│       ├── def456.json
│       └── ...
├── {boardId-2}/
│   ├── columns.json
│   └── tickets/
│       └── ...
└── [carpetas de boards eliminados se limpian automaticamente]
```

### 6.3 Flujo de Carga

1. Al iniciar, `boardStore.js` llama `loadData()` de forma asincrona.
2. `loadData()` detecta Tauri y llama `invoke('load_all_data')`.
3. Rust lee `boards.json`, luego itera cada board para cargar sus `columns.json` y los archivos `.json` dentro de `tickets/`.
4. Tambien carga `notes.json`.
5. Si Tauri falla o no esta disponible, fallback a `localStorage.getItem('miikanban-data')`.
6. Si no hay datos, se inicializa con un tablero demo de 4 tickets en 3 columnas.
7. Se marca `initialized = true` y la UI deja de mostrar el splash.

### 6.4 Undo (Ctrl+Z)

El sistema de undo opera a nivel de store completo (no por campo):

- Cada mutacion persistente crea un snapshot de `boards`, `columns`, `tickets` y `notes`.
- Se mantienen maximo 3 snapshots en cola FIFO.
- Al presionar `Ctrl+Z`, se restaura el ultimo snapshot y se elimina de la historia.
- Se deshabilita automaticamente cuando el foco esta en un editor de texto (`contentEditable`, `input`, `textarea`) para permitir el undo nativo del navegador.
- El undo restaura el estado completo y re-guarda en disco.

---

## 7. Componentes Principales

| Componente | Responsabilidad |
|-----------|-----------------|
| **App.jsx** | Entry point de la aplicacion. Maneja el layout global (Sidebar + Main), el switch de vistas (`boards` / `notes` / `board`), y el listener global de `Ctrl+Z`. Renderiza `TicketDetail` o `NoteDetail` como panel lateral condicional. |
| **Sidebar.jsx** | Navegacion lateral fija. Secciones: "Tableros" (lista de boards + CTA crear) y "Notas" (lista recortada a 4 + CTA crear). Footer con logo del creador. |
| **BoardView.jsx** | Vista Kanban activa. Header sticky con nombre del board y barra de busqueda. Area scrollable horizontal con columnas. Contiene toda la logica de DnD (`DndContext`, `SortableContext`). |
| **BoardsView.jsx** | Grid de tarjetas mostrando todos los tableros. Cada tarjeta muestra nombre, cantidad de tickets y fecha de ultima modificacion. Click abre el board. |
| **NotesView.jsx** | Lista vertical de notas. Cada item muestra titulo, preview de descripcion (HTML stripped), y fecha. Click abre el panel de edicion. |
| **Column.jsx** | Columna sortable (reordenamiento horizontal via `useSortable`) y droppable (recepcion de tickets). Header con titulo editable y handle de drag. |
| **TicketCard.jsx** | Tarjeta draggable de ticket. Muestra `displayId`, titulo, prioridad (indicador de color), deadline, e imagen miniatura si existe. |
| **TicketDetail.jsx** | Panel lateral de edicion de ticket. Formulario con: titulo (debounce 500ms), editor WYSIWYG para descripcion, selector de prioridad custom, datepicker de deadline, lista de imagenes (base64), seccion de comentarios con editor. |
| **NoteDetail.jsx** | Panel lateral de edicion de nota. Mismo patron que TicketDetail pero sin columnas ni comentarios. |
| **RichTextEditor.jsx** | Editor WYSIWYG basado en `contentEditable`. Toolbar con botones de formato que usan `document.execCommand`. Atajos de teclado: `Ctrl+B` (bold), `Ctrl+I` (italic), `Ctrl+U` (underline). Emite `innerHTML` al padre via `onInput`. Placeholder CSS cuando esta vacio. |
| **MarkdownPreview.jsx** | Renderizado de HTML con estilos Tailwind. Soporta bloques de codigo con boton "Copiar" usando `navigator.clipboard`. |
| **ConfirmModal.jsx** | Modal de confirmacion reutilizable que reemplaza al `confirm()` nativo del navegador. Usado para eliminaciones. |
| **CreateBoardModal / CreateColumnModal / CreateTicketModal / CreateNoteModal** | Modales de creacion con formulario simple (titulo/nombre). Cierran al crear o al cancelar. |

---

## 8. Flujos de Usuario y Features

### 8.1 Gestion de Tableros

- **Crear tablero:** Click en "+ Nuevo Tablero" en el sidebar → modal pide nombre → se crea con 0 columnas.
- **Ver listado:** Click en el header "Tableros" del sidebar → muestra `BoardsView` con grid de tarjetas.
- **Abrir tablero:** Click en un tablero del sidebar o del grid → muestra `BoardView`.
- **Eliminar tablero:** No hay UI directa en v1.0 (posible via eliminacion manual de archivos JSON).

### 8.2 Gestion de Columnas

- **Crear columna:** Click en "+ Nueva Columna" en el header del board → modal pide nombre.
- **Reordenar columnas:** Drag horizontal del header de la columna (icono grip).
- **Eliminar columna:** No hay UI directa en v1.0.

### 8.3 Gestion de Tickets

- **Crear ticket:** Click en "+" dentro de una columna → modal pide titulo → se asigna `displayId` secuencial automatico.
- **Mover ticket:** Drag vertical dentro de la misma columna (reordenar) o entre columnas (cambiar estado).
- **Editar ticket:** Click en la tarjeta → abre `TicketDetail` lateral.
- **Eliminar ticket:** Dentro de `TicketDetail`, click en eliminar → `ConfirmModal` → borrado permanente.

### 8.4 Editor WYSIWYG

El editor soporta:
- **Negrita** (`<b>`, `<strong>`)
- **Cursiva** (`<i>`, `<em>`)
- **Tachado** (`<s>`, `<strike>`)
- **Codigo inline** (`<code>`)
- **Bloques de codigo** (`<pre><code>`)
- **Enlaces** (auto-detectados en descripcion y comentarios)
- **Imagenes** (carga via file input, almacenadas como base64)

Migracion automatica: los tickets creados antes de v1.0 con sintaxis markdown (`**bold**`, `*italic*`, `~~strike~~`) se convierten a HTML la primera vez que se abren.

### 8.5 Comentarios

- Cada ticket tiene una seccion de comentarios en su panel de detalle.
- El autor se muestra como "MARTIN JUHAL" (fijo).
- Se muestra fecha de creacion y, si fue editado, fecha de modificacion.
- Las URLs en comentarios se convierten automaticamente a hipervinculos clickeables.
- Edicion inline: click en "Editar" → el comentario se convierte en editor → "Guardar" o "Cancelar".

### 8.6 Notas

- Seccion independiente accesible desde el sidebar.
- Las notas usan el mismo editor WYSIWYG que los tickets.
- No tienen columnas, comentarios, ni displayId.

### 8.7 Busqueda

- Campo de busqueda en el header de `BoardView`.
- Busca coincidencias parciales en: `title`, `description`, `id`, `displayId`.
- Los tickets que no coinciden se ocultan de las columnas.
- Busqueda manual (no debounce) para control del usuario.

### 8.8 Atajos de Teclado

| Atajo | Accion | Scope |
|-------|--------|-------|
| `Ctrl + Z` | Deshacer ultima accion (max 3) | Global (excepto en editores de texto) |
| `Ctrl + B` | Negrita en editor WYSIWYG | Dentro de RichTextEditor |
| `Ctrl + I` | Cursiva en editor WYSIWYG | Dentro de RichTextEditor |

---

## 9. Guia de Build y Distribucion

### 9.1 Entorno de Desarrollo

```bash
# 1. Clonar o navegar al proyecto
cd miikanban

# 2. Instalar dependencias del frontend
npm install

# 3. Ejecutar en modo desarrollo (abre Tauri dev con hot reload)
npm run tauri-dev
```

El modo dev levanta Vite en `http://localhost:5173` y Tauri lo empaqueta en una ventana nativa con WebView2.

### 9.2 Build de Produccion

```bash
# 1. Build del frontend (Vite)
npm run build

# 2. Build del bundle de Tauri (Rust + NSIS installer)
npm run tauri-build
```

El output se genera en:

```
src-tauri/target/release/bundle/
├── nsis/
│   └── KANONLY_0.1.0_x64-setup.exe    # Instalador NSIS (~3.4 MB)
└── msi/
    └── KANONLY_0.1.0_x64_en-US.msi    # Instalador MSI (~4.5 MB)
```

### 9.3 Requisitos del Build en Windows

- **Visual Studio Build Tools** con la carga de trabajo **"Desarrollo para el escritorio con C++"**.
- **WebView2 Runtime**: El instalador NSIS incluye el bootstrapper (`embedBootstrapper`) que lo instala silenciosamente si falta.

### 9.4 Instalacion

1. Ejecutar `KANONLY_0.1.0_x64-setup.exe`.
2. El instalador NSIS instala en `C:\Program Files\KANONLY\` (modo `perMachine`).
3. Si WebView2 no esta instalado, el bootstrapper lo descarga e instala automaticamente.
4. Se crea acceso directo en el menu Inicio.

### 9.5 Datos del Usuario en Produccion

En la version instalada, los datos se almacenan en:

```
%LOCALAPPDATA%\com.miikanban.app\
    └── data/
        ├── boards.json
        ├── notes.json
        └── {boardId}/
            ├── columns.json
            └── tickets/
                └── {ticketId}.json
```

> Los datos son portables: copiar la carpeta `data/` a otro equipo con KANONLY instalado migra todo el estado.

---

## 10. Decisiones Tecnicas Clave

### 10.1 Tauri sobre Electron

| Criterio | Tauri | Electron |
|----------|-------|----------|
| Tamano de bundle | ~3.4 MB | 100-200 MB |
| Memoria RAM | Baja (WebView2 del OS) | Alta (Chromium embebido) |
| Seguridad | CSP por defecto, sandbox fuerte | Mayor superficie de ataque |
| Dependencias del OS | Requiere WebView2 | Self-contained |
| Lenguaje backend | Rust | Node.js |

Se eligio Tauri porque el target es Windows exclusivo (WebView2 viene preinstalado en Windows 11 y la mayoria de Windows 10), y el ahorro de tamano y memoria es significativo.

### 10.2 Zustand sobre Redux

El estado de la aplicacion es relativamente simple (4 arrays de entidades). Zustand ofrece:
- Menor boilerplate (no actions, no reducers, no action types).
- API basada en hooks nativa de React.
- Persistencia facil de integrar via middleware.
- Tamano de bundle insignificante (~1 KB).

Redux habria agregado complejidad innecesaria para este scope.

### 10.3 IDs Duales: `id` vs `displayId`

En versiones anteriores se usaban IDs secuenciales numericos globales, lo que causaba colisiones al borrar y recrear tickets. La solucion:
- `id`: string random unico global (usado internamente para referencias, DnD, persistencia).
- `displayId`: numero secuencial por board con padding a 4 digitos (usado en UI para referencia humana, ej: `#0001`).

Esto permite referencias legibles para el usuario sin sacrificar la unicidad tecnica.

### 10.4 WYSIWYG sobre Markdown

Inicialmente la app usaba markdown para descripciones. Se migro a WYSIWYG porque:
- Los usuarios finales no necesitan aprender sintaxis markdown.
- El formato es inmediato y visual.
- Se implemento migracion automatica: al abrir un ticket con markdown, se detecta y convierte a HTML via regex.
- La solucion usa `contentEditable` + `document.execCommand`, evitando librerias pesadas como TipTap, Quill o Slate.

### 10.5 JSON sobre Base de Datos

No se utiliza SQLite, IndexedDB ni ninguna base de datos:
- **Zero-config**: No hay esquemas, migraciones ni conexiones.
- **Human-readable**: Los archivos JSON se pueden abrir, editar y respaldar manualmente.
- **Portabilidad**: Copiar la carpeta `data/` equivale a hacer backup completo.
- **Suficiente**: Para el volumen de datos de una herramienta Kanban personal, JSON plano es performante.

El backend Rust maneja el sharding logico (un archivo por ticket, un archivo por lista de columnas) para evitar archivos JSON monoliticos que crecerian indefinidamente.

### 10.6 Snake_case en Rust, camelCase en JS

Los structs de Rust usan `snake_case` (idiomatico Rust) pero se serializan a `camelCase` via `#[serde(rename_all = "camelCase")]`. Esto mantiene la convencion de cada lenguaje sin requerir transformacion manual en el bridge.

---

## Apendice A: Versiones de Dependencias (package.json)

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@tauri-apps/api": "^2.11.0",
    "lucide-react": "^0.16.0",
    "react": "^19.2.6",
    "react-dom": "^19.2.6",
    "uuid": "^14.0.0",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.0",
    "@tauri-apps/cli": "^2.11.2",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.5.0",
    "eslint": "^10.3.0",
    "postcss": "^8.5.15",
    "tailwindcss": "^4.3.0",
    "vite": "^8.0.12"
  }
}
```

## Apendice B: Configuracion de Tauri (tauri.conf.json)

```json
{
  "productName": "KANONLY",
  "identifier": "com.miikanban.app",
  "version": "1.5.0",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [{
      "title": "KANONLY",
      "width": 1400,
      "height": 900,
      "resizable": true
    }]
  },
  "bundle": {
    "targets": "all",
    "windows": {
      "webviewInstallMode": { "type": "embedBootstrapper", "silent": true },
      "nsis": { "installMode": "perMachine" }
    }
  }
}
```

---

## 11. Novedades de la v1.5

### 11.1 Pantalla de Bienvenida (Home View)
- Nueva vista inicial que se muestra al abrir la app
- Hero card con mensaje "HOLA / BIENVENIDO A LA V1.5" con degradé lineal personalizado
- Secciones "TABLEROS RECIENTES" y "NOTAS RECIENTES" con cards clickeables
- Navegación a Home via click en el logo "KANONLY" del sidebar

### 11.2 Fuente Neutra Text
- Fuente tipográfica personalizada cargada via @font-face en el CSS
- Archivos .otf servidos estáticamente desde `public/Fonts/`
- Aplicada globalmente a toda la interfaz

### 11.3 Degradé en Hero Card
- Degradé lineal aplicado al fondo de la card de bienvenida
- Stops: #000000 (0%) → #111111 (57%) → transparente (100%)

### 11.4 Sidebar Rediseñada
- Botones de creación "+" movidos al header de cada sección (inline)
- Eliminados los botones de texto "+ CREAR NUEVO TABLERO" y "+ CREAR NOTA"
- Headers de sección ahora son filas flex con nombre + icono "+"

### 11.5 Botones de Acción Destacados
- Botones "NUEVO TABLERO" y "NUEVA NOTA" en estilo pastilla blanca (`bg-white`, texto `#111111`)
- Mayor contraste visual para facilitar el flujo de creación

### 11.6 Internacionalización (i18n)
- Sistema propio sin dependencias externas
- Auto-detección del idioma del sistema operativo via `navigator.language`
- Soporte para español e inglés con fallback a español
- Todos los strings visibles de la UI traducidos

### 11.7 Cards Full-Width en Home
- Cards de tableros y notas recientes ocupan el 100% del ancho disponible
- Responsive: se adaptan al ancho de la ventana

---

*Documento generado automaticamente a partir del analisis del codigo fuente de KANONLY v1.5.*
