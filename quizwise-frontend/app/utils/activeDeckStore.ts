import { API_BASE } from "../config";

export const ACTIVE_DECK_STORAGE_KEY = "vocaship_selected_deck_id";
export const DECKS_CACHE_STORAGE_KEY = "vocaship_decks_cache";
export const ACTIVE_DECK_EVENT = "vocaship_active_deck_changed";

export interface DeckItem {
  id: string;
  title: string;
  description?: string;
  card_count?: number;
}

export interface GameWordPair {
  id?: string;
  word: string;
  meaning: string;
  phonetic?: string;
  clue?: string;
}

export interface FlashcardItem {
  id: string;
  word: string;
  phonetic?: string;
  meanings: Array<{ definition: string; translation: string }>;
  example_sentences?: Array<{ en: string; tr?: string }>;
}

export const PRESET_DECKS: DeckItem[] = [
  {
    id: "preset_core3000",
    title: "🌐 En Sık Çıkan 3000 Temel Kelime",
    description: "A1-A2 Başlangıç ve günlük yaşam için en kritik temel kelimeler",
    card_count: 50,
  },
  {
    id: "preset_adv5000",
    title: "📚 İleri Düzey 5000 Kelime Dağarcığı",
    description: "C1-C2 Akademik ve profesyonel yetkinlik için ileri düzey 5000 kelime seçkisi",
    card_count: 50,
  },
  {
    id: "preset_c1_pro",
    title: "💼 C1 Profesyonel İş & Kariyer",
    description: "Proje Kontrol ve Yönetim terminolojisi içeren 50 ileri seviye terim",
    card_count: 50,
  },
  {
    id: "preset_academic",
    title: "🎓 Akademik Sınav Paketi (YDS & IELTS)",
    description: "Akademik makalelerde ve sınavlarda en sık çıkan kritik fiiller ve bağlaçlar",
    card_count: 45,
  },
];

export const PRESET_CARDS: Record<string, GameWordPair[]> = {
  preset_core3000: [
    { word: "opportunity", meaning: "Fırsat, olanak", phonetic: "/ˌɒp.əˈtjuː.nə.ti/", clue: "Yararlanılabilecek elverişli durum" },
    { word: "achieve", meaning: "Başarmak, elde etmek", phonetic: "/əˈtʃiːv/", clue: "Bir amaca veya hedefe ulaşmak" },
    { word: "challenge", meaning: "Zorluk, meydan okuma", phonetic: "/ˈtʃæl.ɪndʒ/", clue: "Çaba ve dayanıklılık gerektiren durum" },
    { word: "discover", meaning: "Keşfetmek, bulmak", phonetic: "/dɪˈskʌv.ər/", clue: "Bilinmeyen bir şeyi ilk kez açığa çıkarmak" },
    { word: "improve", meaning: "Geliştirmek, iyileştirmek", phonetic: "/ɪmˈpruːv/", clue: "Daha iyi bir seviyeye getirmek" },
    { word: "decision", meaning: "Karar", phonetic: "/dɪˈsɪʒ.ən/", clue: "Seçenekler arasında yapılan nihai tercih" },
    { word: "encourage", meaning: "Cesaretlendirmek, teşvik etmek", phonetic: "/ɪnˈkʌr.ɪdʒ/", clue: "Birine moral ve destek vermek" },
    { word: "essential", meaning: "Gerekli, zorunlu, hayati", phonetic: "/ɪˈsen.ʃəl/", clue: "Olmazsa olmaz nitelikte olan" },
    { word: "experience", meaning: "Deneyim, tecrübe", phonetic: "/ɪkˈspɪə.ri.əns/", clue: "Zamanla edinilen bilgi ve görgü" },
    { word: "journey", meaning: "Yolculuk, seyahat", phonetic: "/ˈdʒɜː.ni/", clue: "Bir yerden bir yere kat edilen mesafe" },
    { word: "knowledge", meaning: "Bilgi, birikim", phonetic: "/ˈnɒl.ɪdʒ/", clue: "Öğrenme veya deneyimle kazanılan gerçekler" },
    { word: "success", meaning: "Başarı", phonetic: "/səkˈses/", clue: "Hedeflenen sonuca ulaşma durumu" },
  ],
  preset_adv5000: [
    { word: "ubiquitous", meaning: "Her yerde bulunan, çok yaygın", phonetic: "/juːˈbɪk.wɪ.təs/", clue: "Neredeyse her ortamda karşımıza çıkan" },
    { word: "ephemeral", meaning: "Geçici, kısa ömürlü", phonetic: "/ɪˈfem.ər.əl/", clue: "Çok kısa süren ve hemen yok olan" },
    { word: "pragmatic", meaning: "Uygulamacı, faydacı, pratik", phonetic: "/præɡˈmæt.ɪk/", clue: "Teoriden ziyade pratik sonuca odaklanan" },
    { word: "paradox", meaning: "Çelişki, görünüşte mantıksız durum", phonetic: "/ˈpær.ə.dɒks/", clue: "Kendi içinde tutarsız gibi görünen gerçeklik" },
    { word: "eloquent", meaning: "Güzel ve ikna edici konuşan", phonetic: "/ˈel.ə.kwənt/", clue: "Sözcükleri etkileyici ve akıcı kullanan" },
    { word: "scrutinize", meaning: "En ince ayrıntısına kadar incelemek", phonetic: "/ˈskruː.tɪ.naɪz/", clue: "Büyük dikkatle ve detaylıca teftiş etmek" },
    { word: "meticulous", meaning: "Titiz, kılı kırk yaran", phonetic: "/məˈtɪk.jə.ləs/", clue: "Detaylara aşırı özen gösteren" },
    { word: "ambiguous", meaning: "Muğlak, belirsiz, birden fazla anlama gelen", phonetic: "/æmˈbɪɡ.ju.əs/", clue: "Net olmayan ve yanlış anlaşılmaya açık" },
    { word: "resilient", meaning: "Dirençli, çabuk toparlanan", phonetic: "/rɪˈzɪl.jənt/", clue: "Zorluklar karşısında güçlü kalan" },
    { word: "lucid", meaning: "Açık, anlaşılır, berrak", phonetic: "/ˈluː.sɪd/", clue: "Kolayca kavranabilen, net fikirler" },
  ],
  preset_c1_pro: [
    { word: "mitigate", meaning: "Hafifletmek, etkisini azaltmak", phonetic: "/ˈmɪt.ɪ.ɡeɪt/", clue: "Zararlı bir etkinin şiddetini düşürmek" },
    { word: "contingency", meaning: "Beklenmedik durum payı, yedek plan", phonetic: "/kənˈtɪn.dʒən.si/", clue: "Öngörülemeyen riskler için ayrılan yedek süre/bütçe" },
    { word: "volatility", meaning: "Dalgalanma, değişkenlik", phonetic: "/ˌvɒl.əˈtɪl.ə.ti/", clue: "Fiyatlarda veya durumlarda ani iniş çıkışlar" },
    { word: "substantiate", meaning: "Kanıtlamak, somut gerekçelere dayandırmak", phonetic: "/səbˈstæn.ʃi.eɪt/", clue: "Bir iddiayı somut delillerle doğrulamak" },
    { word: "coherent", meaning: "Tutarlı, mantıklı ve uyumlu", phonetic: "/kəʊˈhɪə.rənt/", clue: "Parçaları birbiriyle mantıksal bütünlük taşıyan" },
    { word: "detrimental", meaning: "Zararlı, hasar verici", phonetic: "/ˌdet.rɪˈmen.təl/", clue: "Süreçlere ve performansa negatif etkisi olan" },
    { word: "leverage", meaning: "Kaldıraç olarak kullanmak, avantaja çevirmek", phonetic: "/ˈliː.vər.ɪdʒ/", clue: "Mevcut gücü kullanarak üstünlük sağlamak" },
    { word: "discrepancy", meaning: "Farklılık, tutarsızlık, çelişki", phonetic: "/dɪˈskrep.ən.si/", clue: "İki veri veya rapor arasındaki uyumsuzluk" },
    { word: "benchmark", meaning: "Kıyaslama noktası, referans standart", phonetic: "/ˈbentʃ.mɑːk/", clue: "Performans ölçümünde baz alınan standart" },
    { word: "arbitration", meaning: "Tahkim, hakemlik süreci", phonetic: "/ˌɑː.bɪˈtreɪ.ʃən/", clue: "Uyuşmazlıkların mahkeme dışı çözümü" },
  ],
  preset_academic: [
    { word: "hypothesize", meaning: "Varsayımda bulunmak, hipotez öne sürmek", phonetic: "/haɪˈpɒθ.ə.saɪz/", clue: "Bilimsel bir teori veya varsayım geliştirmek" },
    { word: "synthesize", meaning: "Bileştirmek, sentezlemek", phonetic: "/ˈsɪn.θə.saɪz/", clue: "Farklı fikirleri bir araya getirerek yeni bir bütün oluşturmak" },
    { word: "empirical", meaning: "Deneysel, gözleme ve deneyime dayalı", phonetic: "/ɪmˈpɪr.ɪ.kəl/", clue: "Teoriye değil fiili kanıtlara dayanan" },
    { word: "paradigm", meaning: "Model, kuramsal çerçeve", phonetic: "/ˈpær.ə.daɪm/", clue: "Bir dönemin kabul gören bilimsel düşünce sistemi" },
    { word: "correlation", meaning: "Karşılıklı ilişki, korelasyon", phonetic: "/ˌkɒr.əˈleɪ.ʃən/", clue: "İki değişken arasındaki istatistiksel bağlantı" },
    { word: "facilitate", meaning: "Kolaylaştırmak, olanak sağlamak", phonetic: "/fəˈsɪl.ɪ.teɪt/", clue: "Bir sürecin daha rahat ilerlemesini sağlamak" },
    { word: "predominant", meaning: "Baskın, hakim olan", phonetic: "/prɪˈdɒm.ɪ.nənt/", clue: "En çok dikkat çeken veya sayıca üstün olan" },
    { word: "comprehensive", meaning: "Kapsamlı, etraflı", phonetic: "/ˌkɒm.prɪˈhen.sɪv/", clue: "Konunun bütün yönlerini içine alan" },
  ],
};

export const DEFAULT_GAME_WORDS: GameWordPair[] = PRESET_CARDS.preset_c1_pro;

/**
 * Aktif seçili deste kimliğini döndürür
 */
export function getActiveDeckId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(ACTIVE_DECK_STORAGE_KEY);
    if (stored && stored.trim() !== "") return stored.trim();
  } catch {}
  return null;
}

/**
 * Aktif çalışma destesini kaydeder ve tüm sekmelere / sayfalara duyurur
 */
export function setActiveDeckId(deckId: string): void {
  if (typeof window === "undefined" || !deckId) return;
  try {
    localStorage.setItem(ACTIVE_DECK_STORAGE_KEY, deckId);
    // Aynı sekmedeki dinleyiciler için CustomEvent
    window.dispatchEvent(
      new CustomEvent(ACTIVE_DECK_EVENT, { detail: { deckId } })
    );
  } catch (err) {
    console.warn("Deste kimliği kaydedilemedi:", err);
  }
}

/**
 * Aktif desteyi dinlemek için abone olur (Aynı sekme CustomEvent + Başka sekme StorageEvent)
 */
export function subscribeToActiveDeck(callback: (deckId: string) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{ deckId: string }>;
    if (customEvent.detail && customEvent.detail.deckId) {
      callback(customEvent.detail.deckId);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === ACTIVE_DECK_STORAGE_KEY && e.newValue) {
      callback(e.newValue);
    }
  };

  window.addEventListener(ACTIVE_DECK_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(ACTIVE_DECK_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

/**
 * Kullanıcının destelerini backend'den çeker, localStorage'a önbelleğe alır
 */
export async function fetchDecksList(): Promise<DeckItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/decks`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(DECKS_CACHE_STORAGE_KEY, JSON.stringify(data));
          } catch {}
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("fetchDecksList network error:", err);
  }

  // Önbelleği dene
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(DECKS_CACHE_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // Hazır desteler ile dön
  return PRESET_DECKS;
}

/**
 * Verilen deste ID'sine (veya aktif desteye) ait kartları döndürür
 */
export async function getActiveDeckCards(deckId?: string): Promise<GameWordPair[]> {
  const targetId = deckId || getActiveDeckId() || PRESET_DECKS[0].id;

  // Preset deste kontrolü
  if (PRESET_CARDS[targetId] && PRESET_CARDS[targetId].length > 0) {
    return PRESET_CARDS[targetId];
  }

  // Backend'den kartları çek
  try {
    const res = await fetch(`${API_BASE}/api/v1/decks/${targetId}/cards`);
    if (res.ok) {
      const cards = await res.json();
      if (Array.isArray(cards) && cards.length > 0) {
        return cards.map((c: any) => {
          let meaning = "Tanım";
          if (c.meanings && Array.isArray(c.meanings) && c.meanings.length > 0) {
            const first = c.meanings[0];
            meaning =
              typeof first === "string"
                ? first
                : first.meaning || first.translation || first.definition || "Tanım";
          } else if (c.turkish_meaning) {
            meaning = c.turkish_meaning;
          } else if (c.meaning) {
            meaning = c.meaning;
          } else if (c.definition) {
            meaning = c.definition;
          }

          return {
            id: c.id ? String(c.id) : undefined,
            word: String(c.word || "").trim(),
            meaning: meaning.trim(),
            phonetic: c.phonetic,
            clue: c.clue || c.hint || (c.example_sentences && c.example_sentences[0]?.en),
          };
        }).filter((item) => item.word && item.meaning);
      }
    }
  } catch (err) {
    console.warn(`Deck ${targetId} kartları backend'den alınamadı:`, err);
  }

  // Fallback: Eğer bulunamazsa varsayılan kelimeler
  return DEFAULT_GAME_WORDS;
}

/**
 * Standart GameWordPair listesini GoldQuestGame için FlashcardItem formatına dönüştürür
 */
export function toFlashcardItems(cards: GameWordPair[]): FlashcardItem[] {
  return cards.map((c, i) => ({
    id: c.id || `card_${i}_${c.word}`,
    word: c.word,
    phonetic: c.phonetic,
    meanings: [{ definition: c.meaning, translation: c.meaning }],
    example_sentences: [{ en: `Example sentence using "${c.word}".` }],
  }));
}

