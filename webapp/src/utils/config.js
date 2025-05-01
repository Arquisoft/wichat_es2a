// src/utils/config.js

const STORAGE_KEY = 'config';

// Valores por defecto de configuración
const defaultConfig = {
  numQuestions: 10,
  mathTime: 30,                                  // Tiempo por pregunta en modo matemáticas (segundos)
  timerSettings: { easy: 120, medium: 30, hard: 10 }
};

/**
 * Carga la configuración desde localStorage.
 * Si no existe o está corrupta, devuelve defaultConfig.
 * Los valores parciales se completan con defaults.
 */
export function loadConfig() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultConfig;
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      numQuestions: typeof parsed.numQuestions === 'number' ? parsed.numQuestions : defaultConfig.numQuestions,
      mathTime:      typeof parsed.mathTime === 'number'      ? parsed.mathTime      : defaultConfig.mathTime,
      timerSettings: {
        easy:   parsed.timerSettings?.easy   ?? defaultConfig.timerSettings.easy,
        medium: parsed.timerSettings?.medium ?? defaultConfig.timerSettings.medium,
        hard:   parsed.timerSettings?.hard   ?? defaultConfig.timerSettings.hard
      }
    };
  } catch (err) {
    console.warn('Configuración corrupta en localStorage, usando valores por defecto:', err);
    return defaultConfig;
  }
}

/**
 * Guarda la configuración en localStorage.
 * @param {{ numQuestions: number, mathTime: number, timerSettings: { easy: number, medium: number, hard: number } }} config
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
