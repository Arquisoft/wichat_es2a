// src/utils/config.js

const STORAGE_KEY = 'config';

// Valores por defecto de configuración
const defaultConfig = {
  numQuestions: 10,
  timerSettings: { easy: 120, medium: 30, hard: 10 }
};

/**
 * Carga la configuración desde localStorage.
 * Si no existe o está corrupta, devuelve defaultConfig.
 */
export function loadConfig() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultConfig;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Configuración corrupta en localStorage, usando valores por defecto:', err);
    return defaultConfig;
  }
}

/**
 * Guarda la configuración en localStorage.
 * @param {{ numQuestions: number, timerSettings: { easy: number, medium: number, hard: number } }} config
 */
export function saveConfig(config) {
  try {
    const str = JSON.stringify(config);
    window.localStorage.setItem(STORAGE_KEY, str);
  } catch (err) {
    console.error('Error al guardar config en localStorage:', err);
  }
}

// Exportar también los valores por defecto si se necesitan directamente
export { defaultConfig };
