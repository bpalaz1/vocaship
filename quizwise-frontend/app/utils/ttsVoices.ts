/**
 * VocaShip Central Edge-TTS Neural Voice Registry
 * 6 Doğal İnsan Nöral Ses Modeli (Kadın, Erkek ve Çocuk Modları)
 */

import type { Language } from "../context/LanguageContext";

export interface NeuralVoiceOption {
  id: string;
  name: string;
  role: string;
  accent: string;
  avatar: string;
  badge?: string;
  isKid?: boolean;
  locales?: Partial<Record<Language, { name: string; role: string; accent: string; badge?: string }>>;
}

export const NEURAL_VOICES: NeuralVoiceOption[] = [
  {
    id: "en-US-JennyNeural",
    name: "Jenny (Doğal Anlatıcı)",
    role: "Kadın Mentor",
    accent: "Akıcı Amerikan",
    avatar: "👩",
    badge: "Önerilen",
    locales: {
      en: { name: "Jenny (Natural Narrator)", role: "Female Mentor", accent: "Fluent US", badge: "Recommended" },
      de: { name: "Jenny (Natürliche Erzählerin)", role: "Mentorin", accent: "Fließend US", badge: "Empfohlen" },
      es: { name: "Jenny (Narradora Natural)", role: "Mentora", accent: "EE. UU. Fluido", badge: "Recomendada" },
      fr: { name: "Jenny (Narratrice Naturelle)", role: "Mentore", accent: "US Fluide", badge: "Recommandée" },
    },
  },
  {
    id: "en-US-AriaNeural",
    name: "Aria (Akademik Mentor)",
    role: "Kadın Mentor",
    accent: "Net Amerikan",
    avatar: "👩‍🏫",
    badge: "Yeni",
    locales: {
      en: { name: "Aria (Academic Mentor)", role: "Female Mentor", accent: "Clear US", badge: "New" },
      de: { name: "Aria (Akademische Mentorin)", role: "Mentorin", accent: "Klares US", badge: "Neu" },
      es: { name: "Aria (Mentora Académica)", role: "Mentora", accent: "EE. UU. Claro", badge: "Nuevo" },
      fr: { name: "Aria (Mentore Académique)", role: "Mentore", accent: "US Clair", badge: "Nouveau" },
    },
  },
  {
    id: "en-US-GuyNeural",
    name: "Guy (Dinamik Genç)",
    role: "Erkek Mentor",
    accent: "Dengeli Amerikan",
    avatar: "👨",
    locales: {
      en: { name: "Guy (Dynamic Speaker)", role: "Male Mentor", accent: "Balanced US" },
      de: { name: "Guy (Dynamischer Sprecher)", role: "Mentor", accent: "Ausgewogen US" },
      es: { name: "Guy (Voz Dinámica)", role: "Mentor", accent: "EE. UU. Equilibrado" },
      fr: { name: "Guy (Voix Dynamique)", role: "Mentor", accent: "US Équilibré" },
    },
  },
  {
    id: "en-GB-RyanNeural",
    name: "Ryan (İngiliz Aksanı)",
    role: "Erkek Mentor",
    accent: "Doğal British",
    avatar: "🎩",
    locales: {
      en: { name: "Ryan (British Accent)", role: "Male Mentor", accent: "Natural UK" },
      de: { name: "Ryan (Britischer Akzent)", role: "Mentor", accent: "Natürliches UK" },
      es: { name: "Ryan (Acento Británico)", role: "Mentor", accent: "UK Natural" },
      fr: { name: "Ryan (Accent Britannique)", role: "Mentor", accent: "UK Naturel" },
    },
  },
  {
    id: "en-US-AnaNeural",
    name: "Ana (Çocuk Modu - Kız)",
    role: "Kız Çocuğu",
    accent: "Neşeli & Samimi",
    avatar: "👧",
    isKid: true,
    locales: {
      en: { name: "Ana (Kids Mode - Girl)", role: "Girl Voice", accent: "Cheerful & Warm" },
      de: { name: "Ana (Kindermodus - Mädchen)", role: "Mädchenstimme", accent: "Fröhlich & Herzlich" },
      es: { name: "Ana (Modo Infantil - Niña)", role: "Voz Niña", accent: "Alegre y Cercana" },
      fr: { name: "Ana (Mode Enfant - Fille)", role: "Voix Fille", accent: "Joyeuse & Chaleureuse" },
    },
  },
  {
    id: "en-GB-MaisieNeural",
    name: "Oliver / Maisie (Çocuk Modu - Erkek)",
    role: "Erkek Çocuğu",
    accent: "British Çocuk",
    avatar: "👦",
    badge: "Yeni",
    isKid: true,
    locales: {
      en: { name: "Oliver / Maisie (Kids Mode)", role: "Young Voice", accent: "British Kid", badge: "New" },
      de: { name: "Oliver / Maisie (Kindermodus)", role: "Junge Stimme", accent: "Britisches Kind", badge: "Neu" },
      es: { name: "Oliver / Maisie (Modo Infantil)", role: "Voz Infantil", accent: "Infantil UK", badge: "Nuevo" },
      fr: { name: "Oliver / Maisie (Mode Enfant)", role: "Voix Enfant", accent: "Enfant UK", badge: "Nouveau" },
    },
  },
];

export function getLocalizedNeuralVoice(v: NeuralVoiceOption, lang: Language) {
  if (lang === "tr" || !v.locales) {
    return { name: v.name, role: v.role, accent: v.accent, badge: v.badge };
  }
  const loc = v.locales[lang] || v.locales.en;
  return {
    name: loc?.name || v.name,
    role: loc?.role || v.role,
    accent: loc?.accent || v.accent,
    badge: loc?.badge ?? v.badge,
  };
}

export const DEFAULT_NEURAL_VOICE = "en-US-JennyNeural";
export const NEURAL_VOICE_STORAGE_KEY = "vocaship_neural_voice";

const NEURAL_VOICE_SHORT_NAMES: Record<string, string> = {
  "en-US-JennyNeural": "Jenny",
  "en-US-AriaNeural": "Aria",
  "en-US-GuyNeural": "Guy",
  "en-GB-RyanNeural": "Ryan",
  "en-US-AnaNeural": "Ana",
  "en-GB-MaisieNeural": "Oliver",
};

/**
 * Verilen nöral ses ID'si için kısa konuşmacı adını döndürür (örn. Jenny, Aria, Guy, Ryan, Ana, Oliver).
 */
export function getNeuralVoiceShortName(voiceId?: string | null): string {
  if (voiceId && NEURAL_VOICE_SHORT_NAMES[voiceId]) {
    return NEURAL_VOICE_SHORT_NAMES[voiceId];
  }
  const found = NEURAL_VOICES.find((v) => v.id === voiceId);
  if (found) {
    return found.name.split(/[\s/(]/)[0] || "Jenny";
  }
  return "Jenny";
}

/**
 * LocalStorage'dan aktif nöral sesi okur.
 */
export function getStoredNeuralVoice(): string {
  if (typeof window === "undefined") return DEFAULT_NEURAL_VOICE;
  try {
    const stored = localStorage.getItem(NEURAL_VOICE_STORAGE_KEY);
    if (stored && NEURAL_VOICES.some((v) => v.id === stored)) {
      return stored;
    }
  } catch {}
  return DEFAULT_NEURAL_VOICE;
}

/**
 * Aktif nöral sesi günceller ve 'vocaship-voice-change' olayını tetikler.
 */
export function setStoredNeuralVoice(voiceId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NEURAL_VOICE_STORAGE_KEY, voiceId);
    window.dispatchEvent(new Event("vocaship-voice-change"));
  } catch (err) {
    console.warn("[ttsVoices] Ses kaydedilemedi:", err);
  }
}

