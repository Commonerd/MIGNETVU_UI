import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "./locales/en.json";
import esTranslations from "./locales/es.json";
import koTranslations from "./locales/ko.json";
import jaTranslations from "./locales/ja.json";
import ruTranslations from "./locales/ru.json";
import zhTranslations from "./locales/zh.json";

// 지원하는 언어 목록
const supportedLanguages = ["en", "es", "ko", "ja", "ru", "zh"];

// 사용자의 언어 감지
const userLanguage = navigator.language; // 'en-US', 'ko-KR' 등
const languageCode = userLanguage.split("-")[0]; // 'en', 'ko' 등

// 지원하는 언어인지 확인하고 기본 언어로 설정
const defaultLanguage = supportedLanguages.includes(languageCode)
  ? languageCode
  : "en"; // 기본값은 영어

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    es: { translation: esTranslations },
    ko: { translation: koTranslations },
    ja: { translation: jaTranslations },
    ru: { translation: ruTranslations },
    zh: { translation: zhTranslations },
  },
  lng: defaultLanguage, // 감지한 언어 설정
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
