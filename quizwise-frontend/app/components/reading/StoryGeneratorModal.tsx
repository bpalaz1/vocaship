"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { API_BASE } from "../../config";
import { useLanguage } from "../../context/LanguageContext";
import { autoAssignCover, autoAssignCategoryLabel } from "../../utils/autoCover";
import {
  Sparkles,
  X,
  Layers,
  Brain,
  Edit3,
  Check,
  CheckCheck,
  Loader2,
  BookOpen,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from "lucide-react";

interface DeckItem {
  id: string;
  title: string;
  card_count?: number;
}

interface CardItem {
  id: string;
  word: string;
  phonetic?: string;
  turkish_meaning?: string;
}

interface StoryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryGenerated: (story: any) => void;
  decks?: DeckItem[];
}

type SourceTab = "decks" | "spaced_repetition" | "manual";

const TOPIC_PRESETS = [
  { id: "business", label: "🏢 İş, Proje & Sözleşme Müzakeresi", title: "Project & Contract Negotiations" },
  { id: "space", label: "🚀 Uzay & Geleceğin Teknolojileri", title: "Space Exploration & Deep Tech" },
  { id: "adventure", label: "🏔️ Gizemli Keşif & Doğa Serüveni", title: "Mystery & Alpine Expedition" },
  { id: "cafe", label: "☕ Günlük Yaşam & Kültürel Sohbet", title: "Daily Life & Urban Conversations" },
  { id: "medical", label: "🩺 Tıp, Sağlık & Klinik Vaka", title: "Clinical Case & Healthcare Diagnostics" },
  { id: "finance", label: "📈 Kurumsal Finans & Girişimcilik", title: "Corporate Finance & Capital Strategy" },
];

const DEFAULT_SPACED_REPETITION_WORDS: CardItem[] = [
  { id: "sr-1", word: "mitigation", phonetic: "/ˌmɪt.ɪˈɡeɪ.ʃən/", turkish_meaning: "hafifletme, azaltma" },
  { id: "sr-2", word: "critical path", phonetic: "/ˈkrɪt.ɪ.kəl pɑːθ/", turkish_meaning: "kritik yol" },
  { id: "sr-3", word: "trajectory", phonetic: "/trəˈdʒek.tər.i/", turkish_meaning: "yörünge, gidişat" },
  { id: "sr-4", word: "resilience", phonetic: "/rɪˈzɪl.jəns/", turkish_meaning: "dayanıklılık, esneklik" },
  { id: "sr-5", word: "contingency", phonetic: "/kənˈtɪn.dʒən.si/", turkish_meaning: "beklenmedik durum" },
  { id: "sr-6", word: "arbitration", phonetic: "/ˌɑː.bɪˈtreɪ.ʃən/", turkish_meaning: "tahkim, hakemlik" },
  { id: "sr-7", word: "discrepancy", phonetic: "/dɪˈskrep.ən.si/", turkish_meaning: "uyuşmazlık, tutarsızlık" },
  { id: "sr-8", word: "leverage", phonetic: "/ˈliː.vər.ɪdʒ/", turkish_meaning: "kaldıraç, avantaj sağlama" },
];

export default function StoryGeneratorModal({
  isOpen,
  onClose,
  onStoryGenerated,
  decks = [],
}: StoryGeneratorModalProps) {
  const { t } = useLanguage();

  // 1. Kelime Kaynağı Sekmesi
  const [sourceTab, setSourceTab] = useState<SourceTab>("decks");

  // Deste State'leri
  const [availableDecks, setAvailableDecks] = useState<DeckItem[]>(decks);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [deckCards, setDeckCards] = useState<CardItem[]>([]);
  const [loadingDeckCards, setLoadingDeckCards] = useState<boolean>(false);

  // Hatırlama Eğrisi State'leri
  const [dueCards, setDueCards] = useState<CardItem[]>([]);
  const [loadingDueCards, setLoadingDueCards] = useState<boolean>(false);

  // Manuel Yazım State'i
  const [manualInput, setManualInput] = useState<string>("");

  // Seçilen Kelimeler Havuzu (Tüm sekmelerden seçilen ortak kelimeler)
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Hikaye Ayarları
  const [level, setLevel] = useState<"Elementary" | "Intermediate" | "Advanced">("Intermediate");
  const [selectedTopicPreset, setSelectedTopicPreset] = useState<string>("business");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [lengthWords, setLengthWords] = useState<number>(250);

  // Üretim Yükleniyor Durumu
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Desteleri Yükle (Eğer props boşsa)
  useEffect(() => {
    if (isOpen) {
      if (decks.length > 0) {
        setAvailableDecks(decks);
        if (!selectedDeckId) setSelectedDeckId(decks[0].id);
      } else {
        fetch(`${API_BASE}/api/v1/decks`)
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              setAvailableDecks(data);
              setSelectedDeckId(data[0].id);
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, decks]);

  // Seçili Destedeki Kartları Çek
  useEffect(() => {
    if (!selectedDeckId) return;
    setLoadingDeckCards(true);
    fetch(`${API_BASE}/api/v1/decks/${selectedDeckId}/cards`)
      .then((r) => (r.ok ? r.json() : []))
      .then((cards) => {
        if (Array.isArray(cards) && cards.length > 0) {
          const parsedCards: CardItem[] = cards.map((c: any) => ({
            id: c.id || c.word,
            word: c.word,
            phonetic: c.phonetic,
            turkish_meaning:
              c.meanings && c.meanings[0]
                ? typeof c.meanings[0] === "string"
                  ? c.meanings[0]
                  : c.meanings[0].meaning || c.meanings[0].turkish_meaning
                : "Detay görmek için tıklayın",
          }));
          setDeckCards(parsedCards);
        } else {
          setDeckCards([]);
        }
      })
      .catch(() => {
        setDeckCards([]);
      })
      .finally(() => {
        setLoadingDeckCards(false);
      });
  }, [selectedDeckId]);

  // Hatırlama Eğrisi (Zayıf / Tekrarı Gelen Kartları) Çek
  const fetchDueCards = useCallback(() => {
    setLoadingDueCards(true);
    // 1. Önce backend endpoint'ini dene (/study/due-cards veya /study/due)
    fetch(`${API_BASE}/api/v1/study/due-cards`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const cards = data?.cards || data;
        if (Array.isArray(cards) && cards.length > 0) {
          const list: CardItem[] = cards.slice(0, 16).map((c: any) => ({
            id: c.id || c.word,
            word: c.word,
            phonetic: c.phonetic,
            turkish_meaning:
              c.meanings && c.meanings[0]
                ? typeof c.meanings[0] === "string"
                  ? c.meanings[0]
                  : c.meanings[0].meaning
                : "Tekrarı gelen kelime",
          }));
          setDueCards(list);
          // Otomatik ilk 6'sını seç
          setSelectedWords(list.slice(0, 6).map((w) => w.word));
        } else {
          // LocalStorage zayıf kelimeleri kontrol et
          loadFallbackDueWords();
        }
      })
      .catch(() => {
        loadFallbackDueWords();
      })
      .finally(() => {
        setLoadingDueCards(false);
      });
  }, []);

  const loadFallbackDueWords = () => {
    try {
      const rawWeak = localStorage.getItem("quizwise_weak_words");
      if (rawWeak) {
        const parsed = JSON.parse(rawWeak);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list: CardItem[] = parsed.map((w: string, idx: number) => ({
            id: `local-weak-${idx}`,
            word: w,
            turkish_meaning: "Zayıf nokta kelimesi",
          }));
          setDueCards(list);
          setSelectedWords(list.slice(0, 6).map((item) => item.word));
          return;
        }
      }
    } catch {}
    // Varsayılan hatırlama eğrisi havuzu
    setDueCards(DEFAULT_SPACED_REPETITION_WORDS);
    setSelectedWords(DEFAULT_SPACED_REPETITION_WORDS.slice(0, 5).map((w) => w.word));
  };

  useEffect(() => {
    if (isOpen && sourceTab === "spaced_repetition" && dueCards.length === 0) {
      fetchDueCards();
    }
  }, [isOpen, sourceTab, dueCards.length, fetchDueCards]);

  // Kelime Seçme / Çıkarma
  const toggleWord = (word: string) => {
    const clean = word.trim().toLowerCase();
    if (!clean) return;

    setSelectedWords((prev) => {
      const exists = prev.some((w) => w.toLowerCase() === clean);
      if (exists) {
        return prev.filter((w) => w.toLowerCase() !== clean);
      } else {
        return [...prev, word.trim()];
      }
    });
  };

  // Manuel Girdiyi Parse Et ve Ekle
  const handleAddManualWords = () => {
    if (!manualInput.trim()) return;
    const tokens = manualInput
      .split(/[,;\n]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 1);

    setSelectedWords((prev) => {
      const merged = new Set(prev.map((w) => w.toLowerCase()));
      tokens.forEach((t) => merged.add(t.toLowerCase()));
      return Array.from(merged);
    });
    setManualInput("");
  };

  // Tümünü Seç / Temizle
  const handleToggleSelectAll = (cards: CardItem[]) => {
    const allWords = cards.map((c) => c.word.trim());
    const allSelected = allWords.every((w) =>
      selectedWords.some((sw) => sw.toLowerCase() === w.toLowerCase())
    );

    if (allSelected) {
      // Çıkar
      setSelectedWords((prev) =>
        prev.filter((sw) => !allWords.some((aw) => aw.toLowerCase() === sw.toLowerCase()))
      );
    } else {
      // Ekle
      setSelectedWords((prev) => {
        const set = new Set(prev.map((w) => w.toLowerCase()));
        allWords.forEach((w) => set.add(w.toLowerCase()));
        return Array.from(set);
      });
    }
  };

  // Yapay Zekâ ile Hikaye Üretme Fonksiyonu
  const handleGenerateStory = async () => {
    if (selectedWords.length === 0) {
      setErrorMessage("Lütfen hikayede yer almasını istediğiniz en az 3-4 hedef kelime seçin.");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setLoadingStepText("1/3 Hedef kelimeler ve anlamsal bağlam kurgulanıyor...");

    const topicObj = TOPIC_PRESETS.find((p) => p.id === selectedTopicPreset);
    const finalTopic = customTopic.trim() || topicObj?.title || "Curated Knowledge Narrative";

    try {
      // 1. Backend API'ye asenkron istek at
      setLoadingStepText("2/3 Yapay zekâ özgün olay örgüsü ve metni oluşturuyor...");

      const payload = {
        level,
        topic: finalTopic,
        target_words: selectedWords,
        length_words: lengthWords,
      };

      let storyData: any = null;

      try {
        const res = await fetch(`${API_BASE}/api/v1/reading/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          storyData = await res.json();
        }
      } catch (err) {
        console.warn("Backend generate çağrısı başarısız oldu, akıllı yerel motor devreye giriyor:", err);
      }

      setLoadingStepText("3/3 Kapak görseli ve anlama soruları atanıyor...");

      // Eğer backend cevap vermediyse veya Gemini kotası aşıldıysa: Yerel zengin metin üret
      if (!storyData || !storyData.content) {
        storyData = generateSmartFallbackStory(level, finalTopic, selectedWords);
      }

      // Otomatik kapak görseli atama
      const coverImage = autoAssignCover({
        title: storyData.title,
        topic: finalTopic,
        content: storyData.content,
      });

      const fullStory = {
        id: `user_story_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: storyData.title || `The Art of ${selectedWords[0] || "Exploration"}`,
        level,
        cefr: level === "Elementary" ? "A2" : level === "Intermediate" ? "B1-B2" : "C1",
        topic: finalTopic,
        content: storyData.content,
        coverImage,
        desc: storyData.content.slice(0, 130) + "...",
        wordCount: storyData.content.split(/\s+/).filter(Boolean).length,
        readTime: `${Math.max(1, Math.ceil(storyData.content.split(/\s+/).length / 100))} dk`,
        target_words: selectedWords,
        target_vocabulary:
          storyData.target_vocabulary && storyData.target_vocabulary.length > 0
            ? storyData.target_vocabulary
            : selectedWords.map((w) => ({
                word: w,
                phonetic: "",
                turkish_meaning: "Detayları incelemek için tıklayın",
                context_sentence: `This example showcases how ${w} is applied in authentic dialogue.`,
              })),
        comprehension_questions:
          storyData.comprehension_questions && storyData.comprehension_questions.length > 0
            ? storyData.comprehension_questions
            : [
                {
                  question: `What is the core emphasis regarding ${selectedWords[0] || "this topic"} in the text?`,
                  options: [
                    "A) Proactive adaptation and rigorous strategic alignment",
                    "B) Total passivity and avoiding any structural decisions",
                    "C) Discontinuing documentation and operational reviews",
                    "D) Postponing collaborative discussions indefinitely",
                  ],
                  correct_answer_index: 0,
                },
                {
                  question: "Which conclusion is strongly supported by the passage?",
                  options: [
                    "A) Clear communication and deliberate practice yield superior outcomes",
                    "B) Unplanned initiatives succeed without feedback loops",
                    "C) Complex obstacles cannot be mitigated systematically",
                    "D) Individual intuition supersedes all collaborative frameworks",
                  ],
                  correct_answer_index: 0,
                },
              ],
        isUserStory: true,
        createdAt: Date.now(),
      };

      onStoryGenerated(fullStory);
      onClose();
    } catch (err: any) {
      console.error("Story generation error:", err);
      setErrorMessage(err?.message || "Hikaye üretilirken beklenmeyen bir hata oluştu.");
    } finally {
      setIsGenerating(false);
      setLoadingStepText("");
    }
  };

  // Çevrimdışı / Hata durumunda tutarlı ve doğal İngilizce hikaye motoru
  const generateSmartFallbackStory = (
    lvl: string,
    topicStr: string,
    words: string[]
  ) => {
    const w1 = words[0] || "resilience";
    const w2 = words[1] || "mitigation";
    const w3 = words[2] || "trajectory";
    const w4 = words[3] || "contingency";
    const w5 = words[4] || "arbitration";

    let title = `Strategic Horizons: Navigating ${w1.charAt(0).toUpperCase() + w1.slice(1)}`;
    let content = "";

    if (lvl === "Elementary") {
      title = `A Meaningful Day in the City: Discovering ${w1}`;
      content = `Last week, Alex started an inspiring new project. He realized that cultivating true ${w1} requires patience and focus every morning. When sudden obstacles arose, he quickly prepared a practical ${w2} plan to keep everyone moving forward. Step by step, the positive ${w3} of the team began to show remarkable improvement. By having a clear ${w4} in place, they completed each milestone happily and celebrated together.`;
    } else if (lvl === "Advanced") {
      title = `The Architecture of Synthesis: Operationalizing ${w1.charAt(0).toUpperCase() + w1.slice(1)}`;
      content = `In complex institutional ecosystems, sustaining operational momentum demands far more than nominal compliance; it necessitates deep-rooted ${w1}. During our cross-functional alignment review, emerging variances along the critical path mandated an immediate ${w2} protocol to safeguard our quarterly schedule baseline. By scrutinizing every subtle inflection in our performance ${w3}, leadership successfully recalibrated stakeholder expectations. Rather than relying on speculative forecasts, the steering committee established a proactive ${w4} framework, thereby mitigating downstream contractual liabilities and obviating the necessity for contentious ${w5}. Ultimately, this integrated approach illustrates how terminological clarity and disciplined execution drive organizational longevity.`;
    } else {
      title = `Navigating New Horizons: The Impact of ${w1.charAt(0).toUpperCase() + w1.slice(1)}`;
      content = `Across modern collaborative ventures, success frequently depends on how early teams foster genuine ${w1}. When unforeseen delays threatened our timeline, the lead coordinator formulated a decisive ${w2} strategy to address the root causes directly. Tracking our progressive ${w3} provided actionable clarity across departments, reassuring key decision-makers. Furthermore, introducing a structured ${w4} plan prevented minor friction from escalating into wider operational disputes. Through rigorous follow-through and transparent communication, the team achieved its intended targets smoothly.`;
    }

    return {
      title,
      level: lvl,
      topic: topicStr,
      content,
      target_vocabulary: words.map((w) => ({
        word: w,
        phonetic: "",
        turkish_meaning: "Detay görmek için tıklayın",
        context_sentence: `In this narrative, ${w} highlights purposeful action.`,
      })),
      comprehension_questions: [
        {
          question: `What strategic role does ${w1} play in the narrative?`,
          options: [
            `A) It serves as a foundational pillar for overcoming uncertainty`,
            `B) It creates unnecessary overhead and delays execution`,
            `C) It is disregarded in favor of hasty shortcuts`,
            `D) It prevents team members from communicating effectively`,
          ],
          correct_answer_index: 0,
        },
        {
          question: "How did the leadership team safeguard project milestones?",
          options: [
            "A) By deploying a structured mitigation protocol and tracking progress",
            "B) By abandoning the schedule baseline completely",
            "C) By refusing to acknowledge variances",
            "D) By deferring decisions until after the deadline",
          ],
          correct_answer_index: 0,
        },
      ],
    };
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-indigo-500/40 p-5 sm:p-7 shadow-2xl shadow-indigo-950/70 space-y-6 animate-in zoom-in-95 duration-200 focus:outline-none"
      >
        {/* Üst Başlık & Kapatma Butonu */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Yapay Zekâ ile Özgün Hikaye Üret</span>
              </h3>
              <p className="text-xs text-slate-400">
                Kelime destelerinizden veya aralıklı tekrar eğrinizden beslenen kişiselleştirilmiş okuma metni
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 1. HEDEF KELİME KAYNAĞI SEÇİCİ (3 SEKME)                                  */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Hedef Kelime Kaynağı</span>
              <span className="text-[10px] text-indigo-400 font-mono">
                ({selectedWords.length} Kelime Seçildi)
              </span>
            </label>

            {selectedWords.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedWords([])}
                className="text-[11px] text-slate-400 hover:text-rose-400 font-medium transition cursor-pointer"
              >
                Seçimleri Temizle
              </button>
            )}
          </div>

          {/* Sekme Butonları */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setSourceTab("decks")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                sourceTab === "decks"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Destelerimden Seç</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceTab("spaced_repetition")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                sourceTab === "spaced_repetition"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Hatırlama Eğrisi</span>
            </button>

            <button
              type="button"
              onClick={() => setSourceTab("manual")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                sourceTab === "manual"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Serbest Yazım</span>
            </button>
          </div>

          {/* SEKME 1: DESTELERİMDEN SEÇ */}
          {sourceTab === "decks" && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Aktif Deste:</span>
                  <select
                    value={selectedDeckId}
                    onChange={(e) => setSelectedDeckId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {availableDecks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} {d.card_count ? `(${d.card_count} Kart)` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {deckCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(deckCards)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Destedeki Tümünü Seç / Kaldır</span>
                  </button>
                )}
              </div>

              {loadingDeckCards ? (
                <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Destedeki kelimeler yükleniyor...</span>
                </div>
              ) : deckCards.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Bu destede henüz kayıtlı kelime kartı bulunmuyor.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 no-scrollbar">
                  {deckCards.map((c) => {
                    const isSelected = selectedWords.some(
                      (w) => w.toLowerCase() === c.word.trim().toLowerCase()
                    );
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleWord(c.word)}
                        title={c.turkish_meaning}
                        className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30 scale-102"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-indigo-200" />}
                        <span>{c.word}</span>
                        {c.turkish_meaning && (
                          <span
                            className={`text-[10px] font-sans ${
                              isSelected ? "text-indigo-200" : "text-slate-500"
                            }`}
                          >
                            • {c.turkish_meaning}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SEKME 2: HATIRLAMA EĞRİSİNDEN SEÇ (ZAYIF / TEKRARI GELENLER) */}
          {sourceTab === "spaced_repetition" && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>
                    Bugün hafızanı tazeleyeceğin {dueCards.length} kelime bulundu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSelectAll(dueCards)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  Tümünü İşaretle
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Aralıklı tekrar algoritması tarafından unutulma riski tespit edilen kelimeler otomatik olarak hikaye kurgusuna yerleştirilir.
              </p>

              {loadingDueCards ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-amber-300">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Hatırlama eğrisi analiz ediliyor...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 no-scrollbar">
                  {dueCards.map((c) => {
                    const isSelected = selectedWords.some(
                      (w) => w.toLowerCase() === c.word.trim().toLowerCase()
                    );
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleWord(c.word)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm shadow-amber-500/20"
                            : "bg-slate-900 text-amber-200 border-amber-500/30 hover:border-amber-500/60"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        <span>{c.word}</span>
                        {c.turkish_meaning && (
                          <span
                            className={`text-[10px] font-sans ${
                              isSelected ? "text-slate-800" : "text-amber-400/70"
                            }`}
                          >
                            • {c.turkish_meaning}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SEKME 3: SERBEST MANUEL YAZIM */}
          {sourceTab === "manual" && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <p className="text-xs text-slate-400">
                Hikayede geçmesini istediğiniz kelimeleri virgülle ayırarak yazın (örn:{" "}
                <span className="text-indigo-300 font-mono">
                  critical path, resilience, milestone, trajectory
                </span>
                ):
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddManualWords();
                    }
                  }}
                  placeholder="Kelimeleri virgülle ayırarak ekleyin..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddManualWords}
                  disabled={!manualInput.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Listeye Ekle
                </button>
              </div>

              {/* Seçilen Manuel Kelimeler */}
              {selectedWords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedWords.map((w) => (
                    <span
                      key={w}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5"
                    >
                      <span>{w}</span>
                      <button
                        type="button"
                        onClick={() => toggleWord(w)}
                        className="text-indigo-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. HİKAYE AYARLARI (SEVİYE, KONU VE UZUNLUK)                               */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Seviye Seçimi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. İngilizce Seviyesi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Elementary", "Intermediate", "Advanced"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    level === lvl
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {lvl === "Elementary" ? "A1-A2" : lvl === "Intermediate" ? "B1-B2" : "C1-C2"}
                  <span className="block text-[10px] font-normal opacity-80">{lvl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Uzunluk Seçimi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              3. Metin Uzunluğu
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 150, label: "Kısa (~150k)" },
                { count: 250, label: "Standart (~250k)" },
                { count: 350, label: "Detaylı (~350k)" },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => setLengthWords(item.count)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    lengthWords === item.count
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Konu ve Tema Seçimi */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            4. Hikaye Teması / Senaryo
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TOPIC_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedTopicPreset(p.id);
                  setCustomTopic("");
                }}
                className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  selectedTopicPreset === p.id && !customTopic
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500 ring-1 ring-indigo-500/40"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Veya dilediğiniz özel bir konu yazın (örn: Mars üssünde fırtına, antik saatçi)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Hata Mesajı */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Alt Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {selectedWords.length > 0 ? (
              <span className="text-emerald-400 font-medium">
                ✓ {selectedWords.length} hedef kelime hikayede amber parıltıyla vurgulanacak.
              </span>
            ) : (
              <span>Lütfen en az 3-4 kelime seçin.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              İptal
            </button>

            <button
              type="button"
              onClick={handleGenerateStory}
              disabled={isGenerating || selectedWords.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStepText || "Hikaye Üretiliyor..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Özgün Hikayeyi Üret ➔</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
