import {
  DECKS_CACHE_STORAGE_KEY,
  FOLDERS_CACHE_STORAGE_KEY,
  DeckItem,
  FolderItem,
  GameWordPair,
} from "./activeDeckStore";

export const GUEST_MAX_WORDS = 10;
const GUEST_WORD_COUNT_KEY = "vocaship_guest_added_words";

export const GUEST_SHOWCASE_FOLDER: FolderItem = {
  id: "guest_folder_showcase",
  name: "Vitrin Desteleri",
  color: "#10b981",
};

export const GUEST_SHOWCASE_DECKS: DeckItem[] = [
  {
    id: "guest_deck_daily",
    title: "Günlük Temel Kelimeler",
    description: "Günlük konuşma ve okuma için temel 5 örnek kelime kartı",
    folder_id: "guest_folder_showcase",
    native_lang: "tr",
    target_lang: "en",
    card_count: 5,
  },
  {
    id: "guest_deck_business",
    title: "İş & Akademik Kelimeler",
    description: "Profesyonel iletişim ve akademik metinler için 5 örnek kelime",
    folder_id: "guest_folder_showcase",
    native_lang: "tr",
    target_lang: "en",
    card_count: 5,
  },
];

export const GUEST_SHOWCASE_CARDS: Record<string, GameWordPair[]> = {
  guest_deck_daily: [
    {
      id: "gc_daily_1",
      word: "resilient",
      phonetic: "/rɪˈzɪl.jənt/",
      meaning: "dirençli, çabuk toparlanan",
      clue: "She remained resilient despite all the challenges.",
    },
    {
      id: "gc_daily_2",
      word: "curious",
      phonetic: "/ˈkjʊə.ri.əs/",
      meaning: "meraklı, öğrenmeye istekli",
      clue: "Curious minds always discover new horizons.",
    },
    {
      id: "gc_daily_3",
      word: "achieve",
      phonetic: "/əˈtʃiːv/",
      meaning: "başarmak, elde etmek",
      clue: "Daily practice helps you achieve fluency.",
    },
    {
      id: "gc_daily_4",
      word: "grateful",
      phonetic: "/ˈɡreɪt.fəl/",
      meaning: "minnettar, müteşekkir",
      clue: "I am grateful for your thoughtful guidance.",
    },
    {
      id: "gc_daily_5",
      word: "improve",
      phonetic: "/ɪmˈpruːv/",
      meaning: "geliştirmek, ilerletmek",
      clue: "Reading short stories will improve your vocabulary.",
    },
  ],
  guest_deck_business: [
    {
      id: "gc_biz_1",
      word: "strategy",
      phonetic: "/ˈstræt.ə.dʒi/",
      meaning: "strateji, uzun vadeli plan",
      clue: "We need a clear strategy for the global launch.",
    },
    {
      id: "gc_biz_2",
      word: "collaborate",
      phonetic: "/kəˈlæb.ə.reɪt/",
      meaning: "iş birliği yapmak",
      clue: "Teams collaborate closely across different time zones.",
    },
    {
      id: "gc_biz_3",
      word: "efficient",
      phonetic: "/ɪˈfɪʃ.ənt/",
      meaning: "verimli, etkin",
      clue: "Spaced repetition is the most efficient way to memorize.",
    },
    {
      id: "gc_biz_4",
      word: "deadline",
      phonetic: "/ˈded.laɪn/",
      meaning: "son teslim tarihi",
      clue: "We finished the project two days ahead of the deadline.",
    },
    {
      id: "gc_biz_5",
      word: "insight",
      phonetic: "/ˈɪn.saɪt/",
      meaning: "içgörü, derin kavrayış",
      clue: "The report offers valuable insight into user behavior.",
    },
  ],
};

export function ensureGuestShowcaseDecks(): {
  folders: FolderItem[];
  decks: DeckItem[];
} {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        FOLDERS_CACHE_STORAGE_KEY,
        JSON.stringify([GUEST_SHOWCASE_FOLDER])
      );
      localStorage.setItem(
        DECKS_CACHE_STORAGE_KEY,
        JSON.stringify(GUEST_SHOWCASE_DECKS)
      );
      for (const [deckId, cards] of Object.entries(GUEST_SHOWCASE_CARDS)) {
        const key = `vocaship_deck_cards_${deckId}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(cards));
        }
      }
    } catch {}
  }
  return {
    folders: [GUEST_SHOWCASE_FOLDER],
    decks: GUEST_SHOWCASE_DECKS,
  };
}

export function getGuestAddedWordCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GUEST_WORD_COUNT_KEY);
    const parsed = parseInt(raw || "0", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function incrementGuestAddedWordCount(): number {
  if (typeof window === "undefined") return 0;
  const next = getGuestAddedWordCount() + 1;
  try {
    localStorage.setItem(GUEST_WORD_COUNT_KEY, String(next));
  } catch {}
  return next;
}
