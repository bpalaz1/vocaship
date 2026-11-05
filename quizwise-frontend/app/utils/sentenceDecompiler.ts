/**
 * sentenceDecompiler.ts
 * X-Ray Cümle Röntgeni: İngilizce cümleleri sözdizimsel (syntax) bloklarına
 * (Özne, Yüklem, Nesne, Zarf/Koşul, Bağlaçlar) ayrıştıran $0.00 maliyetli
 * kural tabanlı motor.
 */

export type GrammarRole =
  | "subject"
  | "verb"
  | "object"
  | "adverbial"
  | "conjunction"
  | "punctuation";

export interface TokenGrammarTag {
  token: string;
  role: GrammarRole;
  roleTitleTr: string;
  explanationTr?: string;
}

export interface DecompiledComponent {
  role: GrammarRole;
  titleTr: string;
  badgeColorClass: string;
  cardColorClass: string;
  text: string;
  explanationTr: string;
}

export interface DecompiledSentence {
  originalSentence: string;
  components: DecompiledComponent[];
  tokenTags: TokenGrammarTag[];
  conjunctions: string[];
  turkishSkeleton: string;
  structureFormula: string;
}

// Yaygın Bağlaçlar ve Cümle Bağlayıcıları
const CONJUNCTIONS = new Set([
  "and", "but", "or", "nor", "for", "yet", "so",
  "although", "because", "since", "unless", "while", "whereas",
  "if", "when", "whenever", "where", "wherever", "after", "before",
  "as", "as soon as", "though", "even though", "provided that",
  "that", "which", "who", "whom", "whose", "in order that", "so that",
]);

// Yaygın Ana Eylem Fiilleri (Active & Stative Verbs)
const COMMON_VERBS = new Set([
  "include", "includes", "included",
  "enable", "enables", "enabled",
  "require", "requires", "required",
  "substantiate", "substantiates", "substantiated",
  "give", "gives", "gave", "given",
  "mitigate", "mitigates", "mitigated",
  "result", "results", "resulted",
  "ensure", "ensures", "ensured",
  "allow", "allows", "allowed",
  "provide", "provides", "provided",
  "maintain", "maintains", "maintained",
  "protect", "protects", "protected",
  "lead", "leads", "led",
  "cause", "causes", "caused",
  "contain", "contains", "contained",
  "show", "shows", "showed", "shown",
  "mean", "means", "meant",
  "indicate", "indicates", "indicated",
  "describe", "describes", "described",
  "reduce", "reduces", "reduced",
  "increase", "increases", "increased",
  "prevent", "prevents", "prevented",
  "manage", "manages", "managed",
  "create", "creates", "created",
  "build", "builds", "built",
  "help", "helps", "helped",
  "improve", "improves", "improved",
]);

// İsim olarak sıkça kullanılıp fiille karışabilen kelimeler
const COMMON_NOUNS_NOT_VERBS = new Set([
  "focus", "records", "claims", "procedures", "contracts", "plans", "tools",
  "steps", "rules", "disputes", "diaries", "conditions", "members", "programs",
]);

// Modal ve Yardımcı Fiiller
const MODAL_AUX_VERBS = new Set([
  "is", "am", "are", "was", "were", "be", "being", "been",
  "has", "have", "had", "having",
  "do", "does", "did",
  "can", "could", "will", "would", "shall", "should", "may", "might", "must",
]);

// Yaygın Edatlar (Prepositions - Zarf Tümleci Başlatıcıları)
const PREPOSITIONS = new Set([
  "in", "on", "at", "by", "for", "with", "about", "against", "between",
  "into", "through", "during", "before", "after", "above", "below", "to",
  "from", "up", "upon", "down", "in front of", "under", "within", "without",
  "throughout", "across", "along", "behind", "beyond", "despite", "towards",
]);

// Önceden Parse Edilmiş Vaka Cümleleri Kataloğu (Yüksek Doğruluklu Referans)
const PRE_DECOMPILED_CATALOG: Record<string, Partial<DecompiledSentence>> = {
  "managing delay claims requires strict adherence to notification procedures": {
    structureFormula: "Özne (Gerund) + Yüklem + Nesne / Edat Öbeği",
    turkishSkeleton: "Gecikme taleplerini yönetmek [Özne] ➔ bildirim prosedürlerine sıkı sıkıya bağlı kalmayı [Nesne] ➔ gerektirir [Yüklem].",
    components: [
      {
        role: "subject",
        titleTr: "Özne (Subject)",
        badgeColorClass: "bg-blue-950/60 border border-blue-500/40 text-blue-200",
        cardColorClass: "border-blue-500/30 bg-blue-950/20",
        text: "Managing delay claims",
        explanationTr: "Cümlenin eylemini yapan 'Gerund' (fiilimsi) özne öbeği: Gecikme taleplerini yönetmek.",
      },
      {
        role: "verb",
        titleTr: "Yüklem (Verb Phrase)",
        badgeColorClass: "bg-emerald-950/60 border border-emerald-500/40 text-emerald-200",
        cardColorClass: "border-emerald-500/30 bg-emerald-950/20",
        text: "requires",
        explanationTr: "Geniş zaman (Simple Present) 3. tekil şahıs ana eylem fiili: Gerektirir / İster.",
      },
      {
        role: "object",
        titleTr: "Nesne / Tamlayıcı (Object / Complement)",
        badgeColorClass: "bg-amber-950/60 border border-amber-500/40 text-amber-200",
        cardColorClass: "border-amber-500/30 bg-amber-950/20",
        text: "strict adherence to notification procedures",
        explanationTr: "Neyi gerektirir? sorusuna yanıt veren nesne öbeği: Bildirim prosedürlerine sıkı bağlılığı.",
      },
    ],
  },
};

/**
 * Kural Tabanlı Cümle Röntgeni ve Sözdizim Ayrıştırıcısı
 */
export function decompileSentence(sentence: string): DecompiledSentence {
  const cleanKey = sentence
    .replace(/[.,;:!?]/g, "")
    .trim()
    .toLowerCase();

  // 1. Katalogda varsa doğrudan kusursuz referansı döndür
  const catalogMatch = PRE_DECOMPILED_CATALOG[cleanKey];
  if (catalogMatch && catalogMatch.components) {
    const tokens = sentence.trim().split(/\s+/);
    return {
      originalSentence: sentence,
      components: catalogMatch.components as DecompiledComponent[],
      tokenTags: tokens.map((token) => ({
        token,
        role: "subject",
        roleTitleTr: "Öge",
      })),
      conjunctions: [],
      turkishSkeleton:
        catalogMatch.turkishSkeleton ||
        "[Özne] ➔ [Zarf / Koşul] ➔ [Nesne] ➔ [Yüklem]",
      structureFormula:
        catalogMatch.structureFormula || "S + V + O + A (İngilizce Sözdizimi)",
    };
  }

  // 2. Dinamik Kural Tabanlı Sözdizim Ayrıştırma Motoru
  const rawWords = sentence.trim().split(/\s+/).filter(Boolean);
  const foundConjunctions: string[] = [];

  // A. Cümle başındaki zarf veya koşul öbeğini ara (virgülle ayrılmış giriş öbeği)
  let adverbialPrefix = "";
  let remainingWords = [...rawWords];

  const commaIndex = rawWords.findIndex((w) => w.includes(","));
  if (commaIndex !== -1 && commaIndex <= 8) {
    const prefixCandidate = rawWords.slice(0, commaIndex + 1).join(" ");
    const firstWordClean = rawWords[0].replace(/[^\w]/g, "").toLowerCase();

    if (PREPOSITIONS.has(firstWordClean) || CONJUNCTIONS.has(firstWordClean) || firstWordClean === "if" || firstWordClean === "under") {
      adverbialPrefix = prefixCandidate;
      remainingWords = rawWords.slice(commaIndex + 1);
    }
  }

  // B. Kalan cümlede Ana Fiili (Verb Phrase) bul
  let verbStartIndex = -1;
  let verbEndIndex = -1;

  for (let i = 0; i < remainingWords.length; i++) {
    const wClean = remainingWords[i].replace(/[^\w]/g, "").toLowerCase();

    // Modal veya yardımcı fiil başlangıcı (örn: must give, is considered, will mitigate, has become)
    if (MODAL_AUX_VERBS.has(wClean)) {
      verbStartIndex = i;
      verbEndIndex = i;
      if (i + 1 < remainingWords.length) {
        verbEndIndex = i + 1;
      }
      break;
    }

    // Bilinen ana fiiller
    if (COMMON_VERBS.has(wClean)) {
      verbStartIndex = i;
      verbEndIndex = i;
      break;
    }

    // Basit zaman fiilleri (3. tekil -s, geçmiş zaman -ed) ancak isim olmayanlar
    if (!COMMON_NOUNS_NOT_VERBS.has(wClean) && (wClean.endsWith("ed") || wClean.endsWith("s"))) {
      if (i > 0) {
        verbStartIndex = i;
        verbEndIndex = i;
        break;
      }
    }
  }

  // Eğer fiil net saptanamadıysa cümlenin 1/3'ünü özne kabul et
  if (verbStartIndex === -1) {
    verbStartIndex = Math.max(1, Math.min(2, Math.floor(remainingWords.length / 3)));
    verbEndIndex = verbStartIndex;
  }

  const subjectTokens = remainingWords.slice(0, verbStartIndex);
  const verbTokens = remainingWords.slice(verbStartIndex, verbEndIndex + 1);
  const objectTokens = remainingWords.slice(verbEndIndex + 1);

  const subjectText = subjectTokens.join(" ");
  const verbText = verbTokens.join(" ");
  const objectText = objectTokens.join(" ");

  // Bileşenler listesini hazırla
  const components: DecompiledComponent[] = [];

  if (adverbialPrefix) {
    components.push({
      role: "adverbial",
      titleTr: "Zarf / Koşul Öbeği (Adverbial Clause)",
      badgeColorClass: "bg-purple-950/60 border border-purple-500/40 text-purple-200",
      cardColorClass: "border-purple-500/30 bg-purple-950/20",
      text: adverbialPrefix,
      explanationTr: "Cümlenin nerede, ne zaman veya hangi koşul altında gerçekleştiğini bildiren giriş öbeği.",
    });
  }

  if (subjectText) {
    components.push({
      role: "subject",
      titleTr: "Özne (Subject)",
      badgeColorClass: "bg-blue-950/60 border border-blue-500/40 text-blue-200",
      cardColorClass: "border-blue-500/30 bg-blue-950/20",
      text: subjectText,
      explanationTr: "Eylemi gerçekleştiren veya durumun merkezinde yer alan ana fail ya da kavram.",
    });
  }

  if (verbText) {
    components.push({
      role: "verb",
      titleTr: "Yüklem (Verb Phrase)",
      badgeColorClass: "bg-emerald-950/60 border border-emerald-500/40 text-emerald-200",
      cardColorClass: "border-emerald-500/30 bg-emerald-950/20",
      text: verbText,
      explanationTr: "Cümlenin zamanını (Tense), modal kipini ve temel aksiyonunu yüklenen ana çekirdek.",
    });
  }

  if (objectText) {
    components.push({
      role: "object",
      titleTr: "Nesne / Tamlayıcı (Object / Complement)",
      badgeColorClass: "bg-amber-950/60 border border-amber-500/40 text-amber-200",
      cardColorClass: "border-amber-500/30 bg-amber-950/20",
      text: objectText,
      explanationTr: "Fiilin etkilediği öge, durum veya amaca dair açıklamayı tamamlayan parça.",
    });
  }

  // Bağlaç tespiti
  for (const w of rawWords) {
    const c = w.replace(/[^\w]/g, "").toLowerCase();
    if (CONJUNCTIONS.has(c) && !foundConjunctions.includes(c)) {
      foundConjunctions.push(c);
    }
  }

  // Token etiketleme
  const tokenTags: TokenGrammarTag[] = rawWords.map((t) => {
    const clean = t.replace(/[^\w]/g, "").toLowerCase();
    if (CONJUNCTIONS.has(clean)) {
      return { token: t, role: "conjunction", roleTitleTr: "Bağlaç" };
    }
    if (adverbialPrefix && adverbialPrefix.includes(t)) {
      return { token: t, role: "adverbial", roleTitleTr: "Zarf / Koşul" };
    }
    if (subjectText.includes(t)) {
      return { token: t, role: "subject", roleTitleTr: "Özne" };
    }
    if (verbText.includes(t)) {
      return { token: t, role: "verb", roleTitleTr: "Yüklem" };
    }
    return { token: t, role: "object", roleTitleTr: "Nesne" };
  });

  const turkishSkeleton = adverbialPrefix
    ? `[${adverbialPrefix.replace(/,/g, "")}] ➔ [${subjectText}] ➔ [${objectText}] ➔ [${verbText}]`
    : `[${subjectText}] ➔ [${objectText}] ➔ [${verbText}]`;

  const structureFormula = adverbialPrefix
    ? "A (Zarf / Koşul) + S (Özne) + V (Yüklem) + O (Nesne)"
    : "S (Özne) + V (Yüklem) + O (Nesne)";

  return {
    originalSentence: sentence,
    components,
    tokenTags,
    conjunctions: foundConjunctions,
    turkishSkeleton,
    structureFormula,
  };
}
