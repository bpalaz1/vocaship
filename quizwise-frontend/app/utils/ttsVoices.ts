/**
 * Vocaship Central Edge-TTS Neural Voice Registry
 * 6 Doğal İnsan Nöral Ses Modeli (Kadın, Erkek ve Çocuk Modları)
 */

export interface NeuralVoiceOption {
  id: string;
  name: string;
  role: string;
  accent: string;
  avatar: string;
  badge?: string;
  isKid?: boolean;
}

export const NEURAL_VOICES: NeuralVoiceOption[] = [
  {
    id: "en-US-JennyNeural",
    name: "Jenny (Doğal Anlatıcı)",
    role: "Kadın Mentor",
    accent: "Akıcı Amerikan",
    avatar: "👩",
    badge: "Önerilen",
  },
  {
    id: "en-US-AriaNeural",
    name: "Aria (Akademik Mentor)",
    role: "Kadın Mentor",
    accent: "Net Amerikan",
    avatar: "👩‍🏫",
    badge: "Yeni",
  },
  {
    id: "en-US-GuyNeural",
    name: "Guy (Dinamik Genç)",
    role: "Erkek Mentor",
    accent: "Dengeli Amerikan",
    avatar: "👨",
  },
  {
    id: "en-GB-RyanNeural",
    name: "Ryan (İngiliz Aksanı)",
    role: "Erkek Mentor",
    accent: "Doğal British",
    avatar: "🎩",
  },
  {
    id: "en-US-AnaNeural",
    name: "Ana (Çocuk Modu - Kız)",
    role: "Kız Çocuğu",
    accent: "Neşeli & Samimi",
    avatar: "👧",
    isKid: true,
  },
  {
    id: "en-GB-MaisieNeural",
    name: "Oliver / Maisie (Çocuk Modu - Erkek)",
    role: "Erkek Çocuğu",
    accent: "British Çocuk",
    avatar: "👦",
    badge: "Yeni",
    isKid: true,
  },
];

export const DEFAULT_NEURAL_VOICE = "en-US-JennyNeural";
export const NEURAL_VOICE_STORAGE_KEY = "vocaship_neural_voice";

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

