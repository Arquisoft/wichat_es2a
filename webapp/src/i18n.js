import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend) // Cargar archivos de traducción
  .use(LanguageDetector) // Detectar idioma del navegador
  .use(initReactI18next)
  .init({
    fallbackLng: "en", // Idioma por defecto
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
