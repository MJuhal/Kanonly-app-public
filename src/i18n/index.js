import { translations } from './translations';

function detectLanguage() {
  const lang = navigator.language || navigator.userLanguage || 'es';
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('en')) return 'en';
  return 'es';
}

const currentLang = detectLanguage();

export function t(key, vars = {}) {
  const dict = translations[currentLang] || translations.es;
  let text = dict[key] || translations.es[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replace(`{{${k}}}`, v);
  });
  return text;
}

export { currentLang };
