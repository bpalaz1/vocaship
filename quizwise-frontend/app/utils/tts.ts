/**
 * Vocaship Natural Neural TTS Engine (Prosody-Optimized & Word-by-Word Vocaship Live Speaking Engine)
 * Yüksek kaliteli doğal nöral sesler (Natural / Online), doğal nefes duraklamaları,
 * kelime kelime (onboundary) canlı altyazı takibi ve milisaniyelik Video Loop (Talking / Idle) senkronizasyonu.
 */

import { PersonaInfo } from "../context/PersonaContext";

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (wordIndex: number, charIndex: number) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let activeSpeechToken = 0;
let activeFallbackTimer: ReturnType<typeof setTimeout> | null = null;

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
 * Karakterin cinsiyet tonu, prosody-optimize metni, hızı ve perdesine göre seslendirir.
 * Ses çalmaya başladığı milisaniyede onStart(), kelime geçişlerinde onBoundary(),
 * ses bittiği milisaniyede onEnd() tetiklenir.
 */
export function speakPersonaText(
  text: string,
  persona: PersonaInfo,
  options?: SpeakOptions
): SpeechSynthesisUtterance | null {
  clearSpeechTimers();
  const currentToken = ++activeSpeechToken;

  const optimizedText = optimizeProsodyForSpeech(text);
  if (!optimizedText) {
    options?.onEnd?.();
    return null;
  }

  const wordCount = optimizedText.split(/\s+/).filter(Boolean).length;
  const calibratedRate = getCalibratedRateForPersona(persona);
  const effectiveRate = options?.rate ?? persona.ttsSettings?.rate ?? calibratedRate;
  const estimatedDurationMs = Math.min(
    14000,
    Math.max(2200, Math.round((wordCount * 330) / Math.max(0.65, effectiveRate)))
  );

  // Ses çalmaya başladığı milisaniyede anında talking moduna geçsin ve ilk kelimeyi vurgulasın
  options?.onStart?.();
  options?.onBoundary?.(0, 0);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("vocaship:tts-start"));
  }
  let hasEnded = false;

  const finishSpeaking = () => {
    if (hasEnded || currentToken !== activeSpeechToken) return;
    hasEnded = true;
    clearSpeechTimers();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vocaship:tts-end"));
    }
    options?.onEnd?.();
  };

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    activeFallbackTimer = setTimeout(finishSpeaking, estimatedDurationMs);
    return null;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(optimizedText);
    utterance.lang = "en-US";

    const matchedVoice = getBestVoiceForPersona(persona);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    const isSparky = persona.id === "sparky" || persona.id === "ruby" || persona.id === "kids_female";
    const isChuck = persona.id === "chuck";
    const isKids = isSparky || isChuck || persona.category === "kids";
    const isFemale = persona.gender === "female";
    const isMale = persona.gender === "male";
    const isSeniorMale =
      ["mr_harrison", "julian", "marcus", "legal_contracts_male", "corp_legal_contracts"].includes(
        persona.id
      ) || persona.category === "legal_contracts";

    const calibratedPitch = isSparky
      ? 1.24
      : isChuck
      ? 1.14
      : isKids
      ? 1.18
      : isFemale
      ? 1.02
      : isSeniorMale
      ? 0.85
      : isMale
      ? 0.88 // Leo, Alex ve tüm erkek karakterlerde tok, maskülen perde garantisi
      : 0.95;

    let targetPitch = options?.pitch ?? persona.ttsSettings?.pitch ?? calibratedPitch;
    // Eğer erkek karakter konuşuyorsa ve cihazda kadın fallback sesine düşülmüşse sesi kalınlaştır (pitch: 0.88)
    if (isMale && targetPitch > 0.90) {
      targetPitch = 0.88;
    }

    utterance.pitch = targetPitch;
    utterance.rate = effectiveRate;

    utterance.onstart = () => {
      if (currentToken === activeSpeechToken) {
        options?.onStart?.();
        options?.onBoundary?.(0, 0);
      }
    };

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (currentToken !== activeSpeechToken) return;
      if (typeof event.charIndex === "number") {
        const wIdx = getWordIndexFromCharIndex(optimizedText, event.charIndex);
        options?.onBoundary?.(wIdx, event.charIndex);
      }
    };

    // Ses bittiğinde milisaniyelik gecikme olmadan anında idle moduna dönsün
    utterance.onend = () => {
      if (currentToken === activeSpeechToken) {
        finishSpeaking();
      }
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      if (currentToken !== activeSpeechToken) return;
      if (e?.error === "canceled" || e?.error === "interrupted") {
        finishSpeaking();
        return;
      }
      // Tarayıcı ses motoru yanıt vermezse tahmini süre sonunda idle'a dön
      activeFallbackTimer = setTimeout(finishSpeaking, estimatedDurationMs);
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch {
    finishSpeaking();
    return null;
  }
}

/**
 * Mevcut konuşmayı anında keser (Barge-in / Interruption).
 * Hem Web Speech API (speechSynthesis.cancel) hem de aktif HTML5 Audio akışlarını (audio.pause) sıfır gecikmeyle durdurur.
 */
export function stopSpeech() {
  activeSpeechToken++;
  clearSpeechTimers();
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
        }
      });
    } catch {}
    window.dispatchEvent(new CustomEvent("vocaship:barge-in"));
  }
}
