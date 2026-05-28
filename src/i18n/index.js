import { translations } from './translations';

function detectLanguage() {
  // Si el usuario ya tiene una preferencia guardada, respetarla
  const saved = localStorage.getItem('kanonly-lang');
  if (saved && (saved === 'es' || saved === 'en')) {
    return saved;
  }

  const lang = navigator.language || navigator.userLanguage || 'en';
  if (lang.startsWith('es')) return 'es';
  // Cualquier otro idioma que no sea español → inglés
  return 'en';
}

const currentLang = detectLanguage();

// Guardar preferencia detectada para futuras sesiones
localStorage.setItem('kanonly-lang', currentLang);

export function t(key, vars = {}) {
  const dict = translations[currentLang] || translations.es;
  let text = dict[key] || translations.es[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replace(`{{${k}}}`, v);
  });
  return text;
}

export { currentLang };
