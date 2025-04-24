
const STORAGE_KEY = 'config';

/**
 * Carga la configuración desde localStorage.
 * @returns {{ numQuestions: number, timerSettings: {easy:number,medium:number,hard:number} } | null}
 */
export function loadConfig() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    console.warn('config.json corrupto en localStorage:', raw);
    return null;
  }
}

/**
 * Guarda la configuración en localStorage.
 * @param {{ numQuestions: number, timerSettings: {easy:number,medium:number,hard:number} }} config
 */
export function saveConfig(config) {
  try {
    const str = JSON.stringify(config);
    console.log('Guardando config en localStorage: \n', str);
    window.localStorage.setItem(STORAGE_KEY, str);
  } catch (err) {
    console.error('Error al guardar config en localStorage:', err);
  }
}
