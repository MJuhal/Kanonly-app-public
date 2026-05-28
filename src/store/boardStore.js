import { create } from 'zustand';
import { loadData, saveData } from './persistence';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function padTicketId(num) {
  return String(num).padStart(4, '0');
}

function getInitialData() {
  const boardId = generateId();
  const col1 = generateId();
  const col2 = generateId();
  const col3 = generateId();

  const t1 = { id: generateId(), displayId: padTicketId(1), title: 'Diseñar mockups en Figma', description: '', links: [], images: [], columnId: col1, priority: 'high', createdAt: Date.now() };
  const t2 = { id: generateId(), displayId: padTicketId(2), title: 'Configurar proyecto Vite + React', description: '', links: [], images: [], columnId: col1, priority: 'medium', createdAt: Date.now() };
  const t3 = { id: generateId(), displayId: padTicketId(3), title: 'Implementar drag and drop', description: '', links: [], images: [], columnId: col2, priority: 'high', createdAt: Date.now() };
  const t4 = { id: generateId(), displayId: padTicketId(4), title: 'Persistencia con Tauri', description: '', links: [], images: [], columnId: col3, priority: 'low', createdAt: Date.now() };

  return {
    boards: [
      { id: boardId, name: 'Nombre Tablero 1', createdAt: Date.now(), ticketCounter: 4 },
    ],
    columns: [
      { id: col1, title: 'TO DO', boardId, order: 0, ticketIds: [t1.id, t2.id] },
      { id: col2, title: 'IN PROGRESS', boardId, order: 1, ticketIds: [t3.id] },
      { id: col3, title: 'COMPLETE', boardId, order: 2, ticketIds: [t4.id] },
    ],
    tickets: [t1, t2, t3, t4],
    notes: [],
    selectedBoardId: boardId,
    selectedTicketId: null,
    selectedNoteId: null,
    view: 'home',
    history: [],
    initialized: false,
    loadError: null,
  };
}

function buildSnapshot(state) {
  return {
    boards: JSON.parse(JSON.stringify(state.boards)),
    columns: JSON.parse(JSON.stringify(state.columns)),
    tickets: JSON.parse(JSON.stringify(state.tickets)),
    notes: JSON.parse(JSON.stringify(state.notes)),
  };
}

export const useBoardStore = create((set, get) => {
  const initial = getInitialData();

  const persist = (fn, skipHistory = false) => {
    set((state) => {
      let nextState = typeof fn === 'function' ? fn(state) : fn;

      if (!skipHistory && state.initialized && nextState !== state) {
        const snapshot = buildSnapshot(state);
        const newHistory = [...state.history, snapshot];
        if (newHistory.length > 3) newHistory.shift();
        nextState = { ...nextState, history: newHistory };
      }

      const { selectedTicketId, selectedNoteId, initialized, history, ...toSave } = nextState;
      saveData(toSave);
      return nextState;
    });
  };

  // Cargar datos persistentes de forma asíncrona
  loadData().then((data) => {
    if (data) {
      const boardsWithCounter = (data.boards || []).map((b) => {
        if (typeof b.ticketCounter === 'number') return b;
        const boardTickets = (data.tickets || []).filter((t) => {
          const col = (data.columns || []).find((c) => c.id === t.columnId);
          return col && col.boardId === b.id;
        });
        const maxId = boardTickets.reduce((max, t) => {
          const num = parseInt(t.displayId || t.id, 10);
          return Math.max(max, isNaN(num) ? 0 : num);
        }, 0);
        return { ...b, ticketCounter: maxId };
      });

      set((state) => ({
        ...state,
        boards: boardsWithCounter,
        columns: data.columns || state.columns,
        tickets: data.tickets || state.tickets,
        notes: data.notes || [],
        selectedTicketId: null,
        selectedNoteId: null,
        initialized: true,
        loadError: null,
      }));
    } else {
      // Clean install — no data yet, keep defaults
      set((state) => ({ ...state, initialized: true, loadError: null }));
    }
  }).catch((err) => {
    set((state) => ({ ...state, initialized: true, loadError: String(err) }));
  });

  return {
    ...initial,

    undo: () => {
      set((state) => {
        if (state.history.length === 0) return state;
        const lastSnapshot = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);

        const newState = {
          ...state,
          boards: lastSnapshot.boards,
          columns: lastSnapshot.columns,
          tickets: lastSnapshot.tickets,
          notes: lastSnapshot.notes,
          history: newHistory,
          selectedTicketId: null,
          selectedNoteId: null,
        };

        const { selectedTicketId, selectedNoteId, initialized, history, ...toSave } = newState;
        saveData(toSave);
        return newState;
      });
    },

    setView: (view) => set({ view, selectedTicketId: null, selectedNoteId: null }),

    selectBoard: (boardId) => set({ selectedBoardId: boardId, view: 'boards' }),

    updateBoard: (boardId, updates) => {
      persist((state) => ({
        ...state,
        boards: state.boards.map((b) =>
          b.id === boardId ? { ...b, ...updates } : b
        ),
      }));
    },

    createBoard: (name) => {
      const newBoard = { id: generateId(), name, createdAt: Date.now(), ticketCounter: 0 };
      persist((state) => ({
        ...state,
        boards: [...state.boards, newBoard],
        selectedBoardId: newBoard.id,
        view: 'boards',
      }));
      return newBoard.id;
    },

    deleteBoard: (boardId) => {
      persist((state) => {
        const remaining = state.boards.filter((b) => b.id !== boardId);
        const nextSelected = remaining[0]?.id || null;
        return {
          ...state,
          boards: remaining,
          columns: state.columns.filter((c) => c.boardId !== boardId),
          tickets: state.tickets.filter((t) => {
            const col = state.columns.find((c) => c.id === t.columnId);
            return col && col.boardId !== boardId;
          }),
          selectedBoardId: nextSelected,
        };
      });
    },

    createColumn: (boardId, title, color) => {
      const boardCols = get().columns.filter((c) => c.boardId === boardId);
      const newCol = {
        id: generateId(),
        title,
        boardId,
        order: boardCols.length,
        ticketIds: [],
        color: color || null,
      };
      persist((state) => ({
        ...state,
        columns: [...state.columns, newCol],
      }));
      return newCol.id;
    },

    deleteColumn: (columnId) => {
      persist((state) => ({
        ...state,
        columns: state.columns.filter((c) => c.id !== columnId),
        tickets: state.tickets.filter((t) => t.columnId !== columnId),
      }));
    },

    updateColumn: (columnId, updates) => {
      persist((state) => ({
        ...state,
        columns: state.columns.map((c) =>
          c.id === columnId ? { ...c, ...updates } : c
        ),
      }));
    },

    createTicket: (columnId, title) => {
      const state = get();
      const column = state.columns.find((c) => c.id === columnId);
      if (!column) return null;

      const boardId = column.boardId;
      const boardIndex = state.boards.findIndex((b) => b.id === boardId);
      const board = state.boards[boardIndex];
      const nextNum = (board?.ticketCounter || 0) + 1;

      const newTicket = {
        id: generateId(),
        displayId: padTicketId(nextNum),
        title,
        description: '',
        links: [],
        images: [],
        columnId,
        priority: 'medium',
        createdAt: Date.now(),
        deadline: null,
        comments: [],
      };

      persist((s) => {
        const newBoards = [...s.boards];
        const idx = newBoards.findIndex((b) => b.id === boardId);
        if (idx >= 0) {
          newBoards[idx] = { ...newBoards[idx], ticketCounter: nextNum };
        }

        return {
          ...s,
          boards: newBoards,
          tickets: [...s.tickets, newTicket],
          columns: s.columns.map((c) =>
            c.id === columnId ? { ...c, ticketIds: [...c.ticketIds, newTicket.id] } : c
          ),
        };
      });
      return newTicket.id;
    },

    updateTicket: (ticketId, updates) => {
      persist((state) => ({
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === ticketId ? { ...t, ...updates } : t
        ),
      }));
    },

    deleteTicket: (ticketId) => {
      persist((state) => ({
        ...state,
        tickets: state.tickets.filter((t) => t.id !== ticketId),
        columns: state.columns.map((c) => ({
          ...c,
          ticketIds: c.ticketIds.filter((id) => id !== ticketId),
        })),
        selectedTicketId:
          state.selectedTicketId === ticketId ? null : state.selectedTicketId,
      }));
    },

    duplicateTicket: (ticketId) => {
      const state = get();
      const original = state.tickets.find((t) => t.id === ticketId);
      if (!original) return null;

      const column = state.columns.find((c) => c.id === original.columnId);
      if (!column) return null;

      const boardId = column.boardId;
      const board = state.boards.find((b) => b.id === boardId);
      const nextNum = (board?.ticketCounter || 0) + 1;

      const newTicket = {
        ...original,
        id: generateId(),
        displayId: padTicketId(nextNum),
        title: `${original.title} (copia)`,
        createdAt: Date.now(),
        comments: (original.comments || []).map((c) => ({ ...c, id: generateId() })),
      };

      persist((s) => {
        const newBoards = [...s.boards];
        const idx = newBoards.findIndex((b) => b.id === boardId);
        if (idx >= 0) {
          newBoards[idx] = { ...newBoards[idx], ticketCounter: nextNum };
        }
        return {
          ...s,
          boards: newBoards,
          tickets: [...s.tickets, newTicket],
          columns: s.columns.map((c) =>
            c.id === original.columnId
              ? { ...c, ticketIds: [...c.ticketIds, newTicket.id] }
              : c
          ),
        };
      });
      return newTicket.id;
    },

    reorderColumns: (boardId, orderedColumnIds) => {
      persist((state) => ({
        ...state,
        columns: state.columns.map((c) =>
          c.boardId === boardId
            ? { ...c, order: orderedColumnIds.indexOf(c.id) }
            : c
        ),
      }));
    },

    moveTicket: (ticketId, targetColumnId, targetIndex) => {
      persist((state) => {
        const ticket = state.tickets.find((t) => t.id === ticketId);
        if (!ticket) return state;

        const sourceColumnId = ticket.columnId;

        if (sourceColumnId === targetColumnId) {
          const col = state.columns.find((c) => c.id === sourceColumnId);
          const ids = col.ticketIds.filter((id) => id !== ticketId);
          const insertIndex = targetIndex ?? ids.length;
          ids.splice(insertIndex, 0, ticketId);

          return {
            ...state,
            columns: state.columns.map((c) =>
              c.id === sourceColumnId ? { ...c, ticketIds: ids } : c
            ),
          };
        }

        const sourceCol = state.columns.find((c) => c.id === sourceColumnId);
        const sourceTicketIds = sourceCol.ticketIds.filter((id) => id !== ticketId);

        const targetCol = state.columns.find((c) => c.id === targetColumnId);
        const targetTicketIds = [...targetCol.ticketIds];
        const insertIndex = targetIndex ?? targetTicketIds.length;
        targetTicketIds.splice(insertIndex, 0, ticketId);

        return {
          ...state,
          tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, columnId: targetColumnId } : t
          ),
          columns: state.columns.map((c) => {
            if (c.id === sourceColumnId) {
              return { ...c, ticketIds: sourceTicketIds };
            }
            if (c.id === targetColumnId) {
              return { ...c, ticketIds: targetTicketIds };
            }
            return c;
          }),
        };
      });
    },

    selectTicket: (ticketId) => set({ selectedTicketId: ticketId, selectedNoteId: null }),
    closeTicketDetail: () => set({ selectedTicketId: null }),

    addComment: (ticketId, text) => {
      persist((state) => ({
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                comments: [
                  ...(t.comments || []),
                  { id: generateId(), text, createdAt: Date.now(), updatedAt: Date.now() },
                ],
              }
            : t
        ),
      }));
    },

    updateComment: (ticketId, commentId, text) => {
      persist((state) => ({
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                comments: (t.comments || []).map((c) =>
                  c.id === commentId ? { ...c, text, updatedAt: Date.now() } : c
                ),
              }
            : t
        ),
      }));
    },

    deleteComment: (ticketId, commentId) => {
      persist((state) => ({
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === ticketId
            ? { ...t, comments: (t.comments || []).filter((c) => c.id !== commentId) }
            : t
        ),
      }));
    },

    // Notas
    createNote: (title) => {
      const state = get();
      const maxSort = state.notes.reduce((max, n) => Math.max(max, n.sortOrder || 0), -1);
      const newNote = {
        id: generateId(),
        title,
        description: '',
        links: [],
        images: [],
        priority: 'medium',
        comments: [],
        createdAt: Date.now(),
        sortOrder: maxSort + 1,
      };
      persist((s) => ({
        ...s,
        notes: [...s.notes, newNote],
      }));
      return newNote.id;
    },

    reorderNotes: (orderedIds) => {
      persist((state) => ({
        ...state,
        notes: state.notes.map((n) => {
          const idx = orderedIds.indexOf(n.id);
          return idx >= 0 ? { ...n, sortOrder: idx } : n;
        }),
      }));
    },

    updateNote: (noteId, updates) => {
      persist((state) => ({
        ...state,
        notes: state.notes.map((n) =>
          n.id === noteId ? { ...n, ...updates } : n
        ),
      }));
    },

    deleteNote: (noteId) => {
      persist((state) => ({
        ...state,
        notes: state.notes.filter((n) => n.id !== noteId),
        selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId,
      }));
    },

    addNoteComment: (noteId, text) => {
      persist((state) => ({
        ...state,
        notes: state.notes.map((n) =>
          n.id === noteId
            ? {
                ...n,
                comments: [
                  ...(n.comments || []),
                  { id: generateId(), text, createdAt: Date.now(), updatedAt: Date.now() },
                ],
              }
            : n
        ),
      }));
    },

    updateNoteComment: (noteId, commentId, text) => {
      persist((state) => ({
        ...state,
        notes: state.notes.map((n) =>
          n.id === noteId
            ? {
                ...n,
                comments: (n.comments || []).map((c) =>
                  c.id === commentId ? { ...c, text, updatedAt: Date.now() } : c
                ),
              }
            : n
        ),
      }));
    },

    deleteNoteComment: (noteId, commentId) => {
      persist((state) => ({
        ...state,
        notes: state.notes.map((n) =>
          n.id === noteId
            ? { ...n, comments: (n.comments || []).filter((c) => c.id !== commentId) }
            : n
        ),
      }));
    },

    selectNote: (noteId) => set({ selectedNoteId: noteId, selectedTicketId: null }),
    closeNoteDetail: () => set({ selectedNoteId: null }),
  };
});
