/**
 * Vocaship Natural Neural TTS Engine (Prosody-Optimized)
 * Yüksek kaliteli doğal nöral sesler (Natural / Online), doğal duraklamalar
 * ve mülakat temposuna ayarlanmış konuşma hızı.
 */

import { PersonaInfo } from "../context/PersonaContext";

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

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
  // Chrome ve Safari için asenkron ses yükleyici
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Cümle İçi Doğal Duraklama (Prosody Optimization)
 * Noktalama işaretlerinden sonra doğal nefes duraklamaları oluşturur
 * ve sektörel kısaltmaları (EVM, SPI, EOT, FIDIC vb.) tane tane seslendirilecek hale getirir.
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

  // Kısaltmaların anlaşılır telaffuzu
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

  // Noktalama işaretlerinin arkasına doğal nefes aralığı ekle
  cleaned = cleaned
    .replace(/([.?!])\s+/g, "$1  ")
    .replace(/([,;:])\s+/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

/**
 * Karakterin cinsiyetine ve profiline uygun en kaliteli Natural / Online nöral sesi seçer.
 * Mekanik sesleri eler, öncelikli nöral listeye bakar.
 */
export function getBestVoiceForPersona(persona: PersonaInfo): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = getVoicesList();
  if (!voices || voices.length === 0) return null;

  // Öncelikle İngilizce ses havuzunu al
  const englishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const voicePool = englishVoices.length > 0 ? englishVoices : voices;

  const isFemale = persona.gender === "female";
  const isSeniorMale =
    ["mr_harrison", "julian", "marcus", "legal_contracts_male", "corp_legal_contracts"].includes(
      persona.id
    ) || persona.category === "legal_contracts";

  let priorityList: string[] = [];

  if (isFemale) {
    // 1. Kadın Karakterler (Sarah, Dr. Evelyn, Mia, Ruby)
    priorityList = [
      "Microsoft Jenny Online (Natural)",
      "Microsoft Aria Online (Natural)",
      "Google US English",
      "Samantha",
      "Jenny",
      "Aria",
      "Victoria",
      "Zira",
    ];
  } else if (isSeniorMale) {
    // 3. Kıdemli / Otoriter Erkek (Mr. Harrison, Julian, Marcus)
    priorityList = [
      "Microsoft Christopher Online (Natural)",
      "Microsoft Ryan Online (Natural)",
      "Daniel",
      "Christopher",
      "Ryan",
      "Oliver",
      "George",
      "Arthur",
    ];
  } else {
    // 2. Genç / Dinamik Erkek (Leo, Alex, Sparky)
    priorityList = [
      "Microsoft Guy Online (Natural)",
      "Google US English",
      "Guy",
      "Alex",
      "David",
      "James",
    ];
  }

  // 1. Öncelikli listede tam veya kısmi eşleşme ara
  for (const prio of priorityList) {
    const match = voicePool.find((v) =>
      v.name.toLowerCase().includes(prio.toLowerCase())
    );
    if (match) return match;
  }

  // 2. Persona'nın ttsSettings içinde belirtilen tercihleri
  if (persona.ttsSettings?.preferredVoices) {
    for (const pref of persona.ttsSettings.preferredVoices) {
      const match = voicePool.find((v) =>
        v.name.toLowerCase().includes(pref.toLowerCase())
      );
      if (match) return match;
    }
  }

  // 3. İçinde "Natural" veya "Online" geçen herhangi bir İngilizce ses
  const naturalFallback = voicePool.find(
    (v) =>
      v.name.toLowerCase().includes("natural") ||
      v.name.toLowerCase().includes("online")
  );
  if (naturalFallback) return naturalFallback;

  // 4. Standart en-US veya en-GB sesi
  const standardEn = voicePool.find(
    (v) => v.lang === "en-US" || v.lang === "en-GB"
  );
  if (standardEn) return standardEn;

  // 5. Son Güvenli Fallback
  return voicePool[0] || null;
}

/**
 * Arayüzde ses/aksan adını kullanıcı dostu minik bir etiket olarak gösterir.
 * Örn: "🎙️ Jenny (Natural US)"
 */
export function getActiveVoiceDisplay(persona: PersonaInfo): string {
  if (persona.id === "sparky") {
    return "🎙️ Sparky (Canlı Çocuksu Ton)";
  }
  if (persona.id === "chuck") {
    return "🎙️ Chuck (Eğlenceli Sempatik Ton)";
  }

  const isFemale = persona.gender === "female";
  const isSeniorMale =
    ["mr_harrison", "julian", "marcus", "legal_contracts_male", "corp_legal_contracts"].includes(
      persona.id
    ) || persona.category === "legal_contracts";

  const matched = getBestVoiceForPersona(persona);
  if (matched) {
    const n = matched.name;
    if (n.includes("Jenny")) return "🎙️ Jenny (Natural US)";
    if (n.includes("Aria")) return "🎙️ Aria (Natural US)";
    if (n.includes("Guy")) return "🎙️ Guy (Natural US)";
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
 * Karakterin cinsiyet tonu, prosody-optimize metni, hızı ve perdesine göre seslendirir.
 */
export function speakPersonaText(
  text: string,
  persona: PersonaInfo,
  options?: SpeakOptions
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options?.onError?.(new Error("SpeechSynthesis is not supported"));
    options?.onEnd?.();
    return null;
  }

  try {
    // Mevcut konuşmayı durdur
    window.speechSynthesis.cancel();

    // Cümle içi duraklama ve kısaltma optimizasyonu
    const optimizedText = optimizeProsodyForSpeech(text);
    if (!optimizedText) {
      options?.onEnd?.();
      return null;
    }

    const utterance = new SpeechSynthesisUtterance(optimizedText);
    utterance.lang = "en-US";

    // 1. Doğal Nöral Ses Seçimi
    const matchedVoice = getBestVoiceForPersona(persona);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // 2. Doğal Hız ve Perde Kalibrasyonu
    const isSparky = persona.id === "sparky" || persona.id === "ruby" || persona.id === "kids_female";
    const isChuck = persona.id === "chuck";
    const isKids = isSparky || isChuck || persona.category === "kids";
    const isFemale = persona.gender === "female";
    const isSeniorMale =
      ["mr_harrison", "julian", "marcus", "legal_contracts_male", "corp_legal_contracts"].includes(
        persona.id
      ) || persona.category === "legal_contracts";

    // Belirlenen standart doğal tempolar:
    // Sparky (Neşeli Tilki): Pitch 1.24, Rate 0.94 (Yüksek/canlı çocuksu ton)
    // Chuck (Komik Tavuk): Pitch 1.14, Rate 0.98 (Eğlenceli/sempatik ton)
    // Kadın (Sarah): Pitch 1.0, Rate 0.84 (Kendinden emin lider)
    // Genç Erkek (Leo/Alex): Pitch 0.98, Rate 0.85 (Dinamik ve arkadaş canlısı)
    // Kıdemli Erkek (Mr. Harrison): Pitch 0.88, Rate 0.82 (Tok ve otoriter)
    const calibratedPitch = isSparky
      ? 1.24
      : isChuck
      ? 1.14
      : isKids
      ? 1.18
      : isFemale
      ? 1.0
      : isSeniorMale
      ? 0.88
      : 0.98;
    const calibratedRate = isSparky
      ? 0.94
      : isChuck
      ? 0.98
      : isKids
      ? 0.90
      : isFemale
      ? 0.84
      : isSeniorMale
      ? 0.82
      : 0.85;

    utterance.pitch = options?.pitch ?? persona.ttsSettings?.pitch ?? calibratedPitch;
    utterance.rate = options?.rate ?? persona.ttsSettings?.rate ?? calibratedRate;

    // 3. Olay Dinleyicileri (Event Handlers)
    let hasEnded = false;

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      if (!hasEnded) {
        hasEnded = true;
        options?.onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      console.warn("TTS SpeechSynthesis playback notice:", e);
      if (!hasEnded) {
        hasEnded = true;
        options?.onError?.(e);
        options?.onEnd?.();
      }
    };

    // 4. Seslendirmeyi Başlat
    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn("TTS speak exception:", err);
    options?.onError?.(err);
    options?.onEnd?.();
    return null;
  }
}

/**
 * Mevcut konuşmayı anında keser.
 */
export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
