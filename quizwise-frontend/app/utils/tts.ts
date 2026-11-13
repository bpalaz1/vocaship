/**
 * Vocaship Natural Neural TTS Engine (Prosody-Optimized & Word-by-Word Vocaship Live Speaking Engine)
 * Yüksek kaliteli doğal nöral sesler (Natural / Online), doğal nefes duraklamaları,
 * kelime kelime (onboundary) canlı altyazı takibi ve milisaniyelik Video Loop (Talking / Idle) senkronizasyonu.
 */

import { PersonaInfo } from "../context/PersonaContext";
import { API_BASE } from "../config";

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  emotion?: string;
  voice?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (wordIndex: number, charIndex: number) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let activeSpeechToken = 0;
let activeFallbackTimer: ReturnType<typeof setTimeout> | null = null;
let currentNeuralAudio: HTMLAudioElement | null = null;
let karaokeIntervalTimer: ReturnType<typeof setInterval> | null = null;

function clearSpeechTimers() {
  if (activeFallbackTimer) {
    clearTimeout(activeFallbackTimer);
    activeFallbackTimer = null;
  }
}

/**
 * Ses havuzunu güvenle yükler ve önbelleğe alır.
 */
export function getVoicesList(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Cümle İçi Doğal Nefes Duraklamaları (Prosody Optimization)
 */
export function optimizeProsodyForSpeech(text: string): string {
  if (!text) return "";

  let cleaned = text
    .replace(/^\[.*?\]:\s*/, "")
    .replace(/^AI Mentor:\s*/i, "")
    .replace(/^User:\s*/i, "")
    .replace(/[*_#`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  cleaned = cleaned
    .replace(/\bEVM\b/g, "E.V.M.")
    .replace(/\bSPI\b/g, "S.P.I.")
    .replace(/\bCPI\b/g, "C.P.I.")
    .replace(/\bEOT\b/g, "E.O.T.")
    .replace(/\bFIDIC\b/g, "F.I.D.I.C.")
    .replace(/\bSLA\b/g, "S.L.A.")
    .replace(/\bSLAs\b/g, "S.L.A.s")
    .replace(/\bCFO\b/g, "C.F.O.")
    .replace(/\bROI\b/g, "R.O.I.")
    .replace(/\bSaaS\b/g, "SaaS");

  cleaned = cleaned
    .replace(/([.?!])\s+/g, "$1  ")
    .replace(/([,;:])\s+/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

/**
 * Karakter indeksinden o an okunan kelimenin (0-tabanlı) sıra numarasını hesaplar.
 */
function getWordIndexFromCharIndex(text: string, charIndex: number): number {
  if (!text || charIndex <= 0) return 0;
  const prefix = text.slice(0, charIndex);
  const wordsBefore = prefix.trim().split(/\s+/).filter(Boolean);
  if (prefix.endsWith(" ")) {
    return wordsBefore.length;
  }
  return Math.max(0, wordsBefore.length - 1);
}

const FEMALE_VOICE_KEYWORDS = [
  "female",
  "zira",
  "jenny",
  "aria",
  "samantha",
  "victoria",
  "karen",
  "susan",
  "lisa",
  "hazel",
  "catherine",
  "fiona",
  "tessa",
  "veena",
  "eva",
  "ana",
  "helena",
  "stephanie",
  "zoe",
  "kate",
  "ayanda",
  "julie",
  "joana",
  "allison",
  "ava",
  "steffi",
  "monica",
  "paulina",
  "laura",
  "sara",
  "clara",
  "google us english" // Chrome default Google US English voice is female
];

/**
 * Karakterin cinsiyetine ve profiline uygun en kaliteli Natural / Online nöral sesi seçer.
 * Leo, Alex ve erkek karakterlerde kadın seslerinin atanması kesin olarak engellenir.
 */
export function getBestVoiceForPersona(persona: PersonaInfo): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = getVoicesList();
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const voicePool = englishVoices.length > 0 ? englishVoices : voices;

  const isFemale = persona.gender === "female";
  const isMale = persona.gender === "male";
  const isSeniorMale =
    ["mr_harrison", "julian", "marcus", "legal_contracts_male", "corp_legal_contracts"].includes(
      persona.id
    ) || persona.category === "legal_contracts";

  if (isMale) {
    // KESİNLİKLE KADIN SESLERİNİ ELE (zira, jenny, aria, samantha, google us english vb.)
    const strictlyMalePool = voicePool.filter(
      (v) => !FEMALE_VOICE_KEYWORDS.some((fk) => v.name.toLowerCase().includes(fk))
    );

    const maleSearchPool = strictlyMalePool.length > 0 ? strictlyMalePool : voicePool;

    // Erkek ses öncelik listesi
    const malePriorityList = isSeniorMale
      ? [
          "Microsoft Christopher Online (Natural)",
          "Microsoft Ryan Online (Natural)",
          "Microsoft David Desktop",
          "Microsoft David",
          "Google UK English Male",
          "Daniel",
          "Christopher",
          "Ryan",
          "Oliver",
          "George",
          "Arthur",
          "David",
          "Guy",
          "male",
        ]
      : [
          "Microsoft Guy Online (Natural)",
          "Microsoft Christopher Online (Natural)",
          "Microsoft Ryan Online (Natural)",
          "Microsoft David Desktop",
          "Microsoft David",
          "Google UK English Male",
          "Guy",
          "Alex",
          "David",
          "Daniel",
          "Christopher",
          "James",
          "Ryan",
          "male",
        ];

    // 1. Kullanıcının özel tercih ettiği sesler
    if (persona.ttsSettings?.preferredVoices) {
      for (const pref of persona.ttsSettings.preferredVoices) {
        if (FEMALE_VOICE_KEYWORDS.some((fk) => pref.toLowerCase().includes(fk))) continue;
        const match = maleSearchPool.find((v) =>
          v.name.toLowerCase().includes(pref.toLowerCase())
        );
        if (match) return match;
      }
    }

    // 2. Erkek öncelik listesi taraması
    for (const prio of malePriorityList) {
      const match = maleSearchPool.find((v) =>
        v.name.toLowerCase().includes(prio.toLowerCase())
      );
      if (match) return match;
    }

    // 3. İsmi içinde "male", "guy", "david" geçen herhangi bir İngilizce ses
    const genericMale = maleSearchPool.find(
      (v) =>
        v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("guy")
    );
    if (genericMale) return genericMale;

    // 4. Kadın olmayan herhangi bir İngilizce ses
    if (strictlyMalePool.length > 0) {
      return strictlyMalePool[0];
    }

    // Cihazda hiç erkek ses yoksa fallback (speakPersonaText pitch: 0.88 ile toklaştıracak)
    return voicePool[0] || null;
  }

  // KADIN KARAKTERLER (Sarah, Ruby, Sandy vb.)
  const femalePriorityList = [
    "Microsoft Jenny Online (Natural)",
    "Microsoft Aria Online (Natural)",
    "Google US English",
    "Samantha",
    "Jenny",
    "Aria",
    "Victoria",
    "Zira",
  ];

  if (persona.ttsSettings?.preferredVoices) {
    for (const pref of persona.ttsSettings.preferredVoices) {
      const match = voicePool.find((v) =>
        v.name.toLowerCase().includes(pref.toLowerCase())
      );
      if (match) return match;
    }
  }

  for (const prio of femalePriorityList) {
    const match = voicePool.find((v) =>
      v.name.toLowerCase().includes(prio.toLowerCase())
    );
    if (match) return match;
  }

  const naturalFallback = voicePool.find(
    (v) =>
      v.name.toLowerCase().includes("natural") ||
      v.name.toLowerCase().includes("online")
  );
  if (naturalFallback) return naturalFallback;

  return voicePool[0] || null;
}

/**
 * Arayüzde ses/aksan adını kullanıcı dostu minik bir etiket olarak gösterir.
 */
export function getActiveVoiceDisplay(persona: PersonaInfo): string {
  if (persona.id === "custom") {
    const pref = persona.ttsSettings?.preferredVoice;
    if (pref === "female") {
      return "🎙️ Kadın Nöral Ses (Pitch: 1.05)";
    }
    if (pref === "male") {
      return "🎙️ Tok Erkek Nöral Ses (Pitch: 0.92)";
    }
    if (pref === "child") {
      return "🎙️ Çocuk Nöral Ses (Pitch: 1.20)";
    }
  }
  if (persona.id === "sparky") {
    return "🎙️ Sparky (0.78x Tane Tane)";
  }
  if (persona.id === "chuck") {
    return "🎙️ Chuck (0.78x Tane Tane)";
  }
  if (persona.id === "sandy") {
    return "🎙️ Sandy (0.86x Doğal Mentor)";
  }

  const isFemale = persona.gender === "female";
  const isSeniorMale =
    ["mr_harrison", "julian", "marcus", "legal_contracts_male", "corp_legal_contracts"].includes(
      persona.id
    ) || persona.category === "legal_contracts";

  const matched = getBestVoiceForPersona(persona);
  if (matched) {
    const n = matched.name;
    if (n.includes("Jenny")) return "🎙️ Jenny (Natural US • 0.86x)";
    if (n.includes("Aria")) return "🎙️ Aria (Natural US • 0.86x)";
    if (n.includes("Guy")) return "🎙️ Guy (Natural US • 0.86x)";
    if (n.includes("Christopher")) return "🎙️ Christopher (Natural UK)";
    if (n.includes("Ryan")) return "🎙️ Ryan (Natural UK)";
    if (n.includes("Google US English"))
      return isFemale ? "🎙️ Google US (Natural)" : "🎙️ Google US (Male)";
    if (n.includes("Samantha")) return "🎙️ Samantha (Apple US)";
    if (n.includes("Daniel")) return "🎙️ Daniel (UK Natural)";

    const shortName = n
      .replace(/Microsoft\s*/i, "")
      .replace(/Online\s*\(Natural\)/i, "(Natural)")
      .replace(/Desktop/i, "")
      .replace(/- English.*$/i, "")
      .trim();
    return `🎙️ ${shortName}`;
  }

  if (isFemale) return "🎙️ Jenny (Natural US)";
  if (isSeniorMale) return "🎙️ Christopher (Natural UK)";
  return "🎙️ Guy (Natural US)";
}

/**
 * Seviyeye göre tane tane konuşma temposunu döndürür:
 * - Çocuk profilleri (Sparky & Chuck): 0.78x
 * - Yetişkin profilleri (Alex & Sarah / Sandy): 0.86x
 */
export function getCalibratedRateForPersona(persona: PersonaInfo): number {
  const isKids =
    persona.id === "sparky" ||
    persona.id === "chuck" ||
    persona.id === "ruby" ||
    persona.id === "kids_female" ||
    persona.category === "kids";

  if (isKids) {
    return 0.78;
  }
  return 0.86;
}

/**
 * Persona için en uygun Edge-TTS Nöral Ses modelini seçer.
 * Kadın: en-US-JennyNeural
 * Genç / Erkek: en-US-GuyNeural
 * Otoriter / İngiliz: en-GB-RyanNeural
 * Çocuk: en-US-AnaNeural
 */
export function getNeuralVoiceForPersona(persona?: PersonaInfo | null): string {
  if (!persona) return "en-US-JennyNeural";

  const isSparky = persona.id === "sparky" || persona.id === "ruby" || persona.id === "kids_female";
  const isChuck = persona.id === "chuck";
  const isKids = isSparky || isChuck || persona.category === "kids";
  if (isKids) {
    return "en-US-AnaNeural";
  }

  const isSeniorMale =
    ["mr_harrison", "julian", "marcus", "legal_contracts_male", "corp_legal_contracts"].includes(
      persona.id
    ) || persona.category === "legal_contracts";
  if (isSeniorMale) {
    return "en-GB-RyanNeural";
  }

  if (persona.gender === "male") {
    return "en-US-GuyNeural";
  }

  return "en-US-JennyNeural";
}

/**
 * Cümle içindeki duygu ve tonlamayı otomatik tespit eder (SSML prosody eşlemesi).
 */
export function detectSentenceEmotion(
  text: string
): "cheerful" | "sad" | "friendly" | "whisper" | "default" {
  if (!text) return "default";
  const trimmed = text.trim();

  // Yüksek enerji / kutlama / ünlem
  if (trimmed.endsWith("!") || /!(?:\s|$)/.test(trimmed)) {
    return "cheerful";
  }

  // Fısıltı / sır / gizem
  if (/\b(whisper|whispered|secret|quietly|silent|hush)\b/i.test(trimmed)) {
    return "whisper";
  }

  // Hüzün / empati / üç nokta
  if (
    trimmed.includes("...") ||
    /\b(sad|cried|crying|tear|tears|sorry|regret|grief|sorrow|unfortunate|lonely|depressed|heartbroken)\b/i.test(
      trimmed
    )
  ) {
    return "sad";
  }

  // Soru ve dostane diyalog
  if (trimmed.endsWith("?")) {
    return "friendly";
  }

  return "default";
}

/**
 * Edge-TTS Yüksek Kaliteli Nöral Ses Akışı Çalar.
 * /api/v1/tts/stream üzerinden canlı MP3 stream alır ve sıfır gecikmeyle oynatır.
 */
export function playNeuralTTS(
  text: string,
  options?: SpeakOptions
): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  // Mevcut konuşmayı anında kes (Barge-in)
  stopSpeech();
  const currentToken = ++activeSpeechToken;

  const optimizedText = optimizeProsodyForSpeech(text);
  if (!optimizedText) {
    options?.onEnd?.();
    return null;
  }

  const voice =
    options?.voice ||
    (typeof window !== "undefined"
      ? localStorage.getItem("vocaship_neural_voice") || "en-US-JennyNeural"
      : "en-US-JennyNeural");
  const emotion = options?.emotion || detectSentenceEmotion(optimizedText);

  // Hız biçimlendirme
  const speed = options?.rate ?? 1.0;
  const rateStr =
    speed === 1.0
      ? "0%"
      : speed > 1.0
      ? `+${Math.round((speed - 1) * 100)}%`
      : `-${Math.round((1 - speed) * 100)}%`;

  const audioUrl = `${API_BASE}/api/v1/tts/stream?text=${encodeURIComponent(
    optimizedText
  )}&voice=${encodeURIComponent(voice)}&emotion=${encodeURIComponent(
    emotion
  )}&rate=${encodeURIComponent(rateStr)}`;

  const audio = new Audio(audioUrl);
  audio.playbackRate = speed;
  currentNeuralAudio = audio;

  const tokens = optimizedText.split(/\s+/).filter(Boolean);

  audio.onplay = () => {
    if (currentToken !== activeSpeechToken) return;
    options?.onStart?.();
    options?.onBoundary?.(0, 0);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vocaship:tts-start"));
    }

    // Kelime kelime karaoke takibi simülasyonu
    if (tokens.length > 0 && options?.onBoundary) {
      const estimatedDurationSec = Math.max(1.2, (tokens.length * 0.35) / speed);
      const stepMs = Math.max(120, (estimatedDurationSec * 1000) / tokens.length);
      let currentWord = 0;
      if (karaokeIntervalTimer) clearInterval(karaokeIntervalTimer);
      karaokeIntervalTimer = setInterval(() => {
        if (currentToken !== activeSpeechToken) {
          if (karaokeIntervalTimer) clearInterval(karaokeIntervalTimer);
          return;
        }
        currentWord++;
        if (currentWord < tokens.length) {
          options?.onBoundary?.(currentWord, 0);
        } else {
          if (karaokeIntervalTimer) clearInterval(karaokeIntervalTimer);
        }
      }, stepMs);
    }
  };

  const finishSpeaking = () => {
    if (currentToken !== activeSpeechToken) return;
    if (karaokeIntervalTimer) {
      clearInterval(karaokeIntervalTimer);
      karaokeIntervalTimer = null;
    }
    if (currentNeuralAudio === audio) {
      currentNeuralAudio = null;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vocaship:tts-end"));
    }
    options?.onEnd?.();
  };

  audio.onended = () => {
    finishSpeaking();
  };

  audio.onerror = (e) => {
    if (currentToken !== activeSpeechToken) return;
    console.warn("Edge-TTS Audio error, falling back to Web Speech:", e);
    if (karaokeIntervalTimer) {
      clearInterval(karaokeIntervalTimer);
      karaokeIntervalTimer = null;
    }

    // Fallback: tarayıcı speechSynthesis'e güvenli geçiş
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utter = new SpeechSynthesisUtterance(optimizedText);
        utter.lang = "en-US";
        utter.rate = speed;
        utter.onend = () => finishSpeaking();
        utter.onerror = () => finishSpeaking();
        window.speechSynthesis.speak(utter);
        return;
      } catch {}
    }
    finishSpeaking();
    options?.onError?.(e);
  };

  audio.play().catch((err) => {
    console.warn("Edge-TTS audio play blocked or failed:", err);
    finishSpeaking();
  });

  return audio;
}

/**
 * Karakterin profil ve tonlamasına göre Edge-TTS nöral ses motorunu çalıştırır.
 */
export function speakPersonaText(
  text: string,
  persona: PersonaInfo,
  options?: SpeakOptions
): HTMLAudioElement | SpeechSynthesisUtterance | null {
  const neuralVoice = getNeuralVoiceForPersona(persona);
  const calibratedRate = getCalibratedRateForPersona(persona);
  const effectiveRate = options?.rate ?? persona.ttsSettings?.rate ?? calibratedRate;
  const emotion = options?.emotion || detectSentenceEmotion(text);

  return playNeuralTTS(text, {
    ...options,
    voice: options?.voice || neuralVoice,
    emotion,
    rate: effectiveRate,
  });
}

/**
 * Mevcut konuşmayı anında keser (Barge-in / Interruption).
 * Hem Edge-TTS nöral ses akışını hem de tarayıcı sesini anında durdurur.
 */
export function stopSpeech() {
  activeSpeechToken++;
  clearSpeechTimers();

  if (karaokeIntervalTimer) {
    clearInterval(karaokeIntervalTimer);
    karaokeIntervalTimer = null;
  }

  if (currentNeuralAudio) {
    try {
      currentNeuralAudio.onplay = null;
      currentNeuralAudio.onended = null;
      currentNeuralAudio.onerror = null;
      currentNeuralAudio.pause();
      currentNeuralAudio.currentTime = 0;
      currentNeuralAudio.src = "";
    } catch {}
    currentNeuralAudio = null;
  }

  if (typeof window !== "undefined") {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    try {
      const audioElements = document.querySelectorAll("audio");
      audioElements.forEach((audio) => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    } catch {}
    window.dispatchEvent(new CustomEvent("vocaship:barge-in"));
    window.dispatchEvent(new CustomEvent("vocaship:tts-end"));
  }
}
