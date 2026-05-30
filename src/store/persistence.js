import { invoke } from '@tauri-apps/api/core';

const STORAGE_KEY = 'miikanban-data';

let isTauri = false;
try {
  isTauri = !!window.__TAURI_INTERNALS__;
} catch {
  isTauri = false;
}

// Debounce para saveData: acumula cambios y guarda solo después de inactividad
let saveTimeout = null;
let latestPayload = null;
const SAVE_DEBOUNCE_MS = 150;

export async function loadData() {
  if (isTauri) {
    const data = await invoke('load_all_data');
    if (data && data.boards && data.boards.length > 0) {
      return {
        boards: data.boards,
        columns: data.columns,
        tickets: data.tickets,
        ticketCounter: data.ticketCounter || data.tickets.length,
      };
    }
    return null;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.ticketCounter !== 'number') {
        parsed.ticketCounter = parsed.tickets?.length || 0;
      }
      return parsed;
    }
  } catch (e) {
    // Silently ignore localStorage errors in production
  }

  return null;
}

export async function saveData(state) {
  const payload = {
    boards: state.boards,
    columns: state.columns,
    tickets: state.tickets,
    ticketCounter: state.ticketCounter,
  };

  latestPayload = payload;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    if (isTauri) {
      try {
        await invoke('save_all_data', { data: latestPayload });
        latestPayload = null;
        return;
      } catch (e) {
        // Silently handle Tauri save fallback
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latestPayload));
    } catch (e) {
      // Silently ignore localStorage save errors
    }
    latestPayload = null;
  }, SAVE_DEBOUNCE_MS);
}

export async function getDataPath() {
  if (isTauri) {
    try {
      return await invoke('get_data_path');
    } catch (e) {
      // Silently ignore data path errors
    }
  }
  return null;
}
