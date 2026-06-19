import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-shell';

const STORE_URL = 'https://www.microsoft.com/store/productId/9P5QJSF0R1BF';

export function useUpdateCheck() {
  const [state, setState] = useState({
    hasUpdate: false,
    checking: false,
    error: null,
  });

  useEffect(() => {
    // El check nativo de updates fue removido al convertir KANONLY en 100% gratis
    // y eliminar la dependencia de Microsoft Store APIs en el backend.
    setState({ hasUpdate: false, checking: false, error: null });
  }, []);

  const openStore = async () => {
    await open(STORE_URL);
  };

  return { ...state, openStore };
}
