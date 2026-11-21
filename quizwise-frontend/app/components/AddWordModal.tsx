"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, RotateCw, Volume2, Check, Languages, Zap, Database } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import CheckoutModal from "./payments/CheckoutModal";
import { API_BASE } from "../config";
import {
  GUEST_MAX_WORDS,
  getGuestAddedWordCount,
  incrementGuestAddedWordCount,
} from "../utils/guestShowcase";
import {
  buildWordCacheKey,
  getCachedWordEntry,
  setCachedWordEntry,
} from "../utils/wordMemoryCache";

export const DEFAULT_SUPPORTED_LANGUAGES: (SupportedLanguageItem & {
  ttsLocale: string;
})[] = [
  { code: "en", label: "İNGİLİZCE", flag: "🇬🇧", ttsLocale: "en-US" },
  { code: "tr", label: "TÜRKÇE", flag: "🇹🇷", ttsLocale: "tr-TR" },
  { code: "de", label: "ALMANCA", flag: "🇩🇪", ttsLocale: "de-DE" },
  { code: "es", label: "İSPANYOLCA", flag: "🇪🇸", ttsLocale: "es-ES" },
  { code: "fr", label: "FRANSIZCA", flag: "🇫🇷", ttsLocale: "fr-FR" },
  { code: "it", label: "İTALYANCA", flag: "🇮🇹", ttsLocale: "it-IT" },
  { code: "ru", label: "RUSÇA", flag: "🇷🇺", ttsLocale: "ru-RU" },
];

export interface UseAddWordControllerOptions {
  decks: DeckItem[];
  onSaved?: (savedDeckId: string) => void | Promise<void>;
}

export function useAddWordController({
  decks,
  onSaved,
}: UseAddWordControllerOptions) {
  const { t } = useLanguage();
  const { user, isGuest, openRegistrationGate } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDeckForWord, setSelectedDeckForWord] = useState("");
  const [termLang, setTermLang] = useState("en");
  const [defLang, setDefLang] = useState("tr");
  const [wordInput, setWordInput] = useState("");
  const [contextHint, setContextHint] = useState("");
  const [isAutoLookingUp, setIsAutoLookingUp] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichedData | null>(null);
  const [isProUpgradeOpen, setIsProUpgradeOpen] = useState(false);
  const [proUpgradeReason, setProUpgradeReason] = useState<string | undefined>(undefined);

  const lastAutoWordRef = useRef("");
  const autoLookupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef(0);
  const prevLangPairRef = useRef(`${termLang}:${defLang}`);

  const cancelPendingRequests = useCallback(() => {
    if (autoLookupTimerRef.current) {
      clearTimeout(autoLookupTimerRef.current);
      autoLookupTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const openModal = useCallback(
    (preferredDeckId?: string) => {
      if (!user && isGuest && getGuestAddedWordCount() >= GUEST_MAX_WORDS) {
        openRegistrationGate(
          "Harika gidiyorsun! Öğrendiğin kelimeleri kalıcı olarak kaydetmek için 10 saniyede ücretsiz hesabını aç."
        );
        return;
      }
      cancelPendingRequests();
      requestSeqRef.current += 1;
      if (preferredDeckId) {
        setSelectedDeckForWord(preferredDeckId);
      } else if (decks.length > 0) {
        setSelectedDeckForWord((prev) => prev || decks[0].id);
      }
      setEnrichedData(null);
      setWordInput("");
      setContextHint("");
      setIsManualMode(false);
      setIsAutoLookingUp(false);
      setIsEnriching(false);
      lastAutoWordRef.current = "";
      setIsOpen(true);
    },
    [decks, cancelPendingRequests, user, isGuest, openRegistrationGate]
  );

  const closeModal = useCallback(() => {
    cancelPendingRequests();
    requestSeqRef.current += 1;
    setIsAutoLookingUp(false);
    setIsEnriching(false);
    setIsOpen(false);
  }, [cancelPendingRequests]);

  const performLookup = useCallback(
    async (
      rawWord: string,
      tLang: string,
      nLang: string,
      options?: {
        forceAi?: boolean;
        hint?: string;
        showAlertOnError?: boolean;
        isButtonTrigger?: boolean;
      }
    ) => {
      const cleaned = rawWord.trim().replace(/\s+/g, " ");
      if (cleaned.length < 2) return;

      const cleanHint = (options?.hint || "").trim();
      const forceAi = Boolean(options?.forceAi);
      const cacheKey = buildWordCacheKey(cleaned, tLang, nLang);

      // 1. HAFIZA ÖNCELİKLİ (0ms): Önce tarayıcı belleği & yerel sözlük havuzunu kontrol et
      if (!forceAi && !cleanHint) {
        const localHit = getCachedWordEntry(cleaned, tLang, nLang);
        if (localHit) {
          cancelPendingRequests();
          requestSeqRef.current += 1;
          lastAutoWordRef.current = cacheKey;
          setIsAutoLookingUp(false);
          setIsEnriching(false);
          setEnrichedData({
            word: localHit.word,
            phonetic: localHit.phonetic,
            translation: localHit.translation,
            exampleEn: localHit.exampleTarget,
            exampleTr: localHit.exampleNative,
            source: localHit.source,
            targetLang: tLang,
            nativeLang: nLang,
          });
          return;
        }
      }

      // 2. Hafızada yoksa eski dilin/kelimenin sonucunu anında temizle ki ekranda yanlış dil kalmasın
      cancelPendingRequests();
      const seq = ++requestSeqRef.current;
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setEnrichedData((prev) => {
        if (
          prev &&
          prev.targetLang === tLang &&
          prev.nativeLang === nLang &&
          prev.word.trim().toLowerCase() === cleaned.toLowerCase() &&
          !forceAi
        ) {
          return prev;
        }
        return null;
      });

      if (options?.isButtonTrigger) {
        setIsEnriching(true);
      } else {
        setIsAutoLookingUp(true);
      }

      try {
        const endpoint = forceAi ? "/api/v1/ai/enrich" : "/api/v1/ai/lookup";
        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            word: cleaned,
            target_lang: tLang,
            native_lang: nLang,
            context_hint: cleanHint || undefined,
            force_ai: forceAi,
          }),
        });

        if (seq !== requestSeqRef.current) return;

        if (!res.ok) {
          if (options?.showAlertOnError) {
            const err = await res.json().catch(() => null);
            alert(err?.detail || t("err_word_verify", "Kelime doğrulanamadı."));
          }
          return;
        }

        const data = await res.json();
        if (seq !== requestSeqRef.current) return;

        const translation = (
          data?.meanings?.[0]?.translation ||
          data?.translation ||
          data?.meanings?.[0]?.definition ||
          ""
        ).trim();
        const exampleTarget = (
          data?.example_sentences?.[0]?.target ||
          data?.example_sentences?.[0]?.en ||
          ""
        ).trim();
        const exampleNative = exampleTarget
          ? (
              data?.example_sentences?.[0]?.native ||
              data?.example_sentences?.[0]?.tr ||
              data?.example_sentences?.[0]?.source ||
              ""
            ).trim()
          : "";
        const phonetic = (data?.phonetic || "").trim();
        const resolvedWord = (data?.word || cleaned).trim();

        lastAutoWordRef.current = cacheKey;

        // AI veya sunucu sonucunu tarayıcı hafızasına kaydet (bir sonraki sorguda 0ms & 0 AI)
        if (translation && !cleanHint) {
          setCachedWordEntry({
            word: resolvedWord,
            targetLang: tLang,
            nativeLang: nLang,
            phonetic,
            translation,
            definition: (data?.meanings?.[0]?.definition || "").trim(),
            exampleTarget,
            exampleNative,
            source: data?.source || "memory_cache",
          });
        }

        setEnrichedData({
          word: resolvedWord,
          phonetic,
          translation,
          exampleEn: exampleTarget,
          exampleTr: exampleNative,
          source: data?.source,
          targetLang: tLang,
          nativeLang: nLang,
        });
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        if (options?.showAlertOnError && seq === requestSeqRef.current) {
          alert(t("err_ai_conn", "AI servisine bağlanılamadı."));
        }
      } finally {
        if (seq === requestSeqRef.current) {
          setIsAutoLookingUp(false);
          setIsEnriching(false);
        }
      }
    },
    [cancelPendingRequests, t]
  );

  // Kelime yazıldığında 300ms debounce ile, hedef/terim dili değiştiğinde ANINDA (0ms) hafıza öncelikli arama
  useEffect(() => {
    if (!isOpen) return;

    const currentLangPair = `${termLang}:${defLang}`;
    const langChanged = prevLangPairRef.current !== currentLangPair;
    prevLangPairRef.current = currentLangPair;

    const activeTerm = wordInput.trim();

    if (activeTerm.length < 2) {
      cancelPendingRequests();
      requestSeqRef.current += 1;
      setIsAutoLookingUp(false);
      lastAutoWordRef.current = "";
      if (!isManualMode) {
        setEnrichedData(null);
      }
      return;
    }

    if (isManualMode && !langChanged) return;

    const cacheKey = buildWordCacheKey(activeTerm, termLang, defLang);

    // 1. HAFIZA KONTROLÜ (0ms): Kelime + seçili dil hafızada varsa debounce beklemeden ANINDA doldur
    const instantHit = getCachedWordEntry(activeTerm, termLang, defLang);
    if (instantHit) {
      cancelPendingRequests();
      requestSeqRef.current += 1;
      lastAutoWordRef.current = cacheKey;
      setIsAutoLookingUp(false);
      setIsEnriching(false);
      setIsManualMode(false);
      setEnrichedData({
        word: instantHit.word,
        phonetic: instantHit.phonetic,
        translation: instantHit.translation,
        exampleEn: instantHit.exampleTarget,
        exampleTr: instantHit.exampleNative,
        source: instantHit.source,
        targetLang: termLang,
        nativeLang: defLang,
      });
      return;
    }

    // 2. Dil değiştiyse önceki dilin verisini HEMEN sil (asla ekranda eski dil kalmasın!)
    if (langChanged) {
      setIsManualMode(false);
      setEnrichedData(null);
      lastAutoWordRef.current = "";
      void performLookup(activeTerm, termLang, defLang, {
        forceAi: false,
        showAlertOnError: false,
      });
      return;
    }

    // 3. Yeni kelime yazılıyorsa eski kelimenin kartını temizle ve 300ms debounce başlat
    if (lastAutoWordRef.current === cacheKey) return;

    setEnrichedData((prev) => {
      if (
        prev &&
        prev.word.trim().toLowerCase() === activeTerm.toLowerCase() &&
        prev.targetLang === termLang &&
        prev.nativeLang === defLang
      ) {
        return prev;
      }
      return null;
    });

    cancelPendingRequests();
    autoLookupTimerRef.current = setTimeout(() => {
      void performLookup(activeTerm, termLang, defLang, {
        forceAi: false,
        showAlertOnError: false,
      });
    }, 300);

    return () => {
      if (autoLookupTimerRef.current) {
        clearTimeout(autoLookupTimerRef.current);
        autoLookupTimerRef.current = null;
      }
    };
  }, [isOpen, wordInput, termLang, defLang, isManualMode, cancelPendingRequests, performLookup]);

  // Modal kapanınca bekleyen zamanlayıcı ve istekleri temizle
  useEffect(() => {
    return () => {
      cancelPendingRequests();
    };
  }, [cancelPendingRequests]);

  const triggerAutoLookup = useCallback(
    (term: string) => {
      const cleaned = term.trim();
      if (cleaned.length < 2) return;
      void performLookup(cleaned, termLang, defLang, {
        forceAi: false,
        showAlertOnError: false,
      });
    },
    [performLookup, termLang, defLang]
  );

  const runFetchAi = useCallback(
    async (searchWord: string, forceRefresh = false) => {
      if (!user && isGuest) {
        setIsOpen(false);
        openRegistrationGate(
          "AI destekli kelime zenginleştirme özelliğini kullanmak için ücretsiz hesabını oluştur."
        );
        return;
      }
      const targetDeck = selectedDeckForWord || decks[0]?.id || "";
      const cleaned = searchWord.trim();
      if (!targetDeck || !cleaned) return;
      setIsManualMode(false);
      await performLookup(cleaned, termLang, defLang, {
        forceAi: forceRefresh || Boolean(contextHint.trim()),
        hint: contextHint,
        showAlertOnError: true,
        isButtonTrigger: true,
      });
    },
    [selectedDeckForWord, decks, termLang, defLang, contextHint, performLookup, user, isGuest, openRegistrationGate]
  );

  const handleManualInputMode = useCallback(() => {
    const targetDeck = selectedDeckForWord || decks[0]?.id || "";
    if (!targetDeck) {
      alert(t("err_select_deck_first", "Lütfen önce bir deste oluşturun veya seçin."));
      return;
    }
    if (!wordInput.trim()) {
      alert(t("err_enter_word_first", "Lütfen bir kelime yazın."));
      return;
    }
    cancelPendingRequests();
    requestSeqRef.current += 1;
    setIsAutoLookingUp(false);
    setIsEnriching(false);
    setIsManualMode(true);
    setEnrichedData({
      word: wordInput.trim(),
      phonetic: "",
      translation: contextHint.trim() || "",
      exampleEn: "",
      exampleTr: "",
      targetLang: termLang,
      nativeLang: defLang,
    });
  }, [selectedDeckForWord, decks, wordInput, contextHint, termLang, defLang, cancelPendingRequests, t]);

  const handleSaveCard = useCallback(async () => {
    const targetDeck = selectedDeckForWord || decks[0]?.id || "";
    if (!enrichedData || !targetDeck) return;
    if (!user && isGuest && getGuestAddedWordCount() >= GUEST_MAX_WORDS) {
      setIsOpen(false);
      openRegistrationGate(
        "Harika gidiyorsun! Öğrendiğin kelimeleri kalıcı olarak kaydetmek için 10 saniyede ücretsiz hesabını aç."
      );
      return;
    }
    setIsSavingCard(true);
    try {
      const cleanWord = enrichedData.word.trim();
      const cleanPhonetic = enrichedData.phonetic.trim();
      const cleanTranslation = enrichedData.translation.trim();
      const cleanExTarget = enrichedData.exampleEn.trim();
      const cleanExNative = cleanExTarget ? enrichedData.exampleTr.trim() : "";

      const res = await fetch(`${API_BASE}/api/v1/decks/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deck_id: targetDeck,
          word: cleanWord,
          phonetic: cleanPhonetic || null,
          target_lang: termLang,
          native_lang: defLang,
          meanings: [
            {
              part_of_speech: "",
              translation: cleanTranslation,
              definition: cleanTranslation,
              target_lang: termLang,
              native_lang: defLang,
            },
          ],
          example_sentences: cleanExTarget
            ? [
                {
                  en: cleanExTarget,
                  tr: cleanExNative,
                  target: cleanExTarget,
                  native: cleanExNative,
                },
              ]
            : [],
          collocations: [],
        }),
      });
      if (!user && isGuest) {
        incrementGuestAddedWordCount();
        if (typeof window !== "undefined") {
          try {
            const storageKey = `vocaship_deck_cards_${targetDeck}`;
            const existingRaw = localStorage.getItem(storageKey);
            const existingList = existingRaw ? JSON.parse(existingRaw) : [];
            const newLocalCard = {
              id: `guest_card_${Date.now()}`,
              word: cleanWord,
              phonetic: cleanPhonetic,
              meanings: [{ translation: cleanTranslation, part_of_speech: "" }],
              example_sentences: cleanExTarget
                ? [{ target: cleanExTarget, native: cleanExNative }]
                : [],
            };
            localStorage.setItem(
              storageKey,
              JSON.stringify([...(Array.isArray(existingList) ? existingList : []), newLocalCard])
            );
          } catch {}
        }
        setWordInput("");
        setContextHint("");
        setEnrichedData(null);
        setIsManualMode(false);
        lastAutoWordRef.current = "";
        setIsOpen(false);
        if (onSaved) {
          await onSaved(targetDeck);
        }
        return;
      }

      if (res.ok) {
        // Kaydedilen kelimeyi tarayıcı hafızasına da işle (0ms tekrar erişim)
        if (cleanTranslation) {
          setCachedWordEntry({
            word: cleanWord,
            targetLang: termLang,
            nativeLang: defLang,
            phonetic: cleanPhonetic,
            translation: cleanTranslation,
            exampleTarget: cleanExTarget,
            exampleNative: cleanExNative,
            source: "database",
          });
        }
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(`vocaship_deck_cards_${targetDeck}`);
          } catch {}
        }
        setWordInput("");
        setContextHint("");
        setEnrichedData(null);
        setIsManualMode(false);
        lastAutoWordRef.current = "";
        setIsOpen(false);
        if (onSaved) {
          await onSaved(targetDeck);
        }
      } else if (res.status === 403) {
        try {
          const errData = await res.json();
          const errStr = JSON.stringify(errData || {});
          if (errStr.includes("QUOTA_EXCEEDED")) {
            setProUpgradeReason(
              "Ücretsiz planda 50 kalıcı kelime kartı sınırına ulaştınız. PRO'ya geçerek sınırsız kelime ve deste oluşturabilirsiniz."
            );
            setIsProUpgradeOpen(true);
            setIsOpen(false);
          }
        } catch {}
      }
    } finally {
      setIsSavingCard(false);
    }
  }, [selectedDeckForWord, decks, enrichedData, termLang, defLang, onSaved, user, isGuest, openRegistrationGate]);

  return {
    isOpen,
    openModal,
    closeModal,
    selectedDeckForWord,
    setSelectedDeckForWord,
    termLang,
    setTermLang,
    defLang,
    setDefLang,
    wordInput,
    setWordInput,
    contextHint,
    setContextHint,
    isAutoLookingUp,
    triggerAutoLookup,
    isEnriching,
    handleManualInputMode,
    runFetchAi,
    enrichedData,
    setEnrichedData,
    handleSaveCard,
    isSavingCard,
    lastAutoWordRef,
    isProUpgradeOpen,
    setIsProUpgradeOpen,
    proUpgradeReason,
  };
}

export interface DeckItem {
  id: string;
  title: string;
  card_count?: number;
}

export interface SupportedLanguageItem {
  code: string;
  label: string;
  flag: string;
}

export interface EnrichedData {
  word: string;
  phonetic: string;
  translation: string;
  exampleEn: string;
  exampleTr: string;
  source?: string;
  targetLang?: string;
  nativeLang?: string;
}

export interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: DeckItem[];
  selectedDeckForWord: string;
  setSelectedDeckForWord: (id: string) => void;
  termLang: string;
  setTermLang: (lang: string) => void;
  defLang: string;
  setDefLang: (lang: string) => void;
  supportedLanguages: SupportedLanguageItem[];
  wordInput: string;
  setWordInput: (val: string) => void;
  isAutoLookingUp: boolean;
  triggerAutoLookup: (term: string) => void;
  isEnriching: boolean;
  contextHint: string;
  setContextHint: (val: string) => void;
  handleManualInputMode: () => void;
  runFetchAi: (word: string, forceRefresh?: boolean) => void;
  enrichedData: EnrichedData | null;
  setEnrichedData: (data: EnrichedData | null) => void;
  speakText?: (text: string, lang: string) => void;
  handleSaveCard?: () => void;
  isSavingCard?: boolean;
  lastAutoWordRef?: React.MutableRefObject<string>;
  activeDeckId?: string | null;
  isProUpgradeOpen?: boolean;
  setIsProUpgradeOpen?: (open: boolean) => void;
  proUpgradeReason?: string;
}

export default function AddWordModal({
  isOpen,
  onClose,
  decks,
  selectedDeckForWord,
  setSelectedDeckForWord,
  termLang,
  setTermLang,
  defLang,
  setDefLang,
  supportedLanguages,
  wordInput,
  setWordInput,
  isAutoLookingUp,
  triggerAutoLookup,
  isEnriching,
  contextHint,
  setContextHint,
  handleManualInputMode,
  runFetchAi,
  enrichedData,
  setEnrichedData,
  speakText,
  handleSaveCard,
  isSavingCard,
  lastAutoWordRef,
  activeDeckId,
  isProUpgradeOpen = false,
  setIsProUpgradeOpen,
  proUpgradeReason,
}: AddWordModalProps) {
  const { t } = useLanguage();

  if (!isOpen) {
    return isProUpgradeOpen ? (
      <CheckoutModal
        isOpen={isProUpgradeOpen}
        onClose={() => setIsProUpgradeOpen?.(false)}
        mode="pro_plan"
        reasonMessage={proUpgradeReason}
      />
    ) : null;
  }

  const isSelectingActiveDeck = Boolean(
    activeDeckId && selectedDeckForWord === activeDeckId
  );

  const termLangObj = supportedLanguages.find((l) => l.code === termLang);
  const defLangObj = supportedLanguages.find((l) => l.code === defLang);
  const termLangDisplay = termLangObj
    ? t(`lang_opt_${termLangObj.code}`, termLangObj.label)
    : t("lang_opt_en", "İngilizce");
  const defLangDisplay = defLangObj
    ? t(`lang_opt_${defLangObj.code}`, defLangObj.label)
    : defLang.toUpperCase();

  const isLoadingNow = isAutoLookingUp || isEnriching;

  // Aktif dil çiftiyle uyumlu sonuç varsa göster (eski dilin anlamı asla ekranda kalmaz)
  const validEnriched =
    enrichedData &&
    (!enrichedData.nativeLang || enrichedData.nativeLang === defLang) &&
    (!enrichedData.targetLang || enrichedData.targetLang === termLang)
      ? enrichedData
      : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              {validEnriched
                ? t("modal_confirm_word_title", "Kelimeyi Onayla & Kaydet")
                : t("modal_add_word_title", "Kelime Ekle")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* 1. Hedef Deste Seçici (Her zaman erişilebilir) */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                {t("label_target_deck_select", "Hedef Deste *")}
              </label>
              {isSelectingActiveDeck && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {t("currently_open_tag", "(Şu an açık)")}
                </span>
              )}
            </div>
            <select
              value={selectedDeckForWord}
              onChange={(e) => setSelectedDeckForWord(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 outline-none"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                  {activeDeckId === d.id ? ` ${t("currently_open_tag", "(Şu an açık)")}` : ""} (
                  {t("label_card_count_suffix", "{count} kart", {
                    count: d.card_count || 0,
                  })}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* 2. Dil Seçici — HER ZAMAN GÖRÜNÜR (Dil değiştiğinde anında yeni dil karşılığı gelir) */}
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center space-x-1.5 text-xs text-indigo-400 font-semibold mb-2">
              <Languages className="w-4 h-4" />
              <span>{t("section_lang_options", "DİL SEÇENEKLERİ")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {t("label_term_lang", "TERİM DİLİ")}
                </label>
                <select
                  value={termLang}
                  onChange={(e) => setTermLang(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-bold focus:border-indigo-500 outline-none cursor-pointer"
                >
                  {supportedLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {t(`lang_opt_${l.code}`, l.label)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {t("label_def_lang", "TANIM DİLİ")}
                </label>
                <select
                  value={defLang}
                  onChange={(e) => setDefLang(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-bold focus:border-indigo-500 outline-none cursor-pointer"
                >
                  {supportedLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {t(`lang_opt_${l.code}`, l.label)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Kelime Inputu (300ms Debounce + Hafıza Öncelikli Anında Arama) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label className="block text-xs font-medium text-slate-300">
                {t("label_word_term_input", "Kelime / Terim ({lang}) *", {
                  lang: termLangDisplay,
                })}
              </label>
              <div className="flex items-center gap-2">
                {speakText && wordInput.trim() && (
                  <button
                    type="button"
                    onClick={() => speakText(wordInput.trim(), termLang)}
                    className="text-indigo-400 hover:text-white transition cursor-pointer"
                    title={t("listen_pronunciation", "Telaffuz Dinle")}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {isLoadingNow && (
                  <span className="flex items-center space-x-1 text-[11px] text-indigo-400 font-medium animate-pulse">
                    <RotateCw className="w-3 h-3 animate-spin" />
                    <span>{t("searching_memory", "Hafızada aranıyor...")}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={t("placeholder_word_input", "Örn: bullet, resilient, deliberate")}
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && wordInput.trim().length >= 2 && !validEnriched) {
                    e.preventDefault();
                    triggerAutoLookup(wordInput.trim());
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white focus:border-indigo-500 outline-none font-semibold"
              />
              {isLoadingNow && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* 4. Yüklenme Göstergesi (Yeni dil veya önbellekte olmayan kelime getirilirken eski veri gösterilmez) */}
          {isLoadingNow && !validEnriched && (
            <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 text-xs text-indigo-300">
              <RotateCw className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              <span className="font-medium">
                {defLangObj?.flag}{" "}
                {t("fetching_lang_meaning", "{lang} karşılığı getiriliyor...", {
                  lang: defLangDisplay,
                })}
              </span>
            </div>
          )}

          {/* 5. Bulunan / Düzenlenebilir Kart Alanları */}
          {validEnriched ? (
            <div className="space-y-3.5 pt-1 animate-in fade-in duration-150">
              {validEnriched.source && (
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  {validEnriched.source === "common_vocab" ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      {t("source_common_vocab", "⚡ Hızlı Sözlük Havuzundan Anında Getirildi (0ms)")}
                    </span>
                  ) : validEnriched.source === "memory_cache" ? (
                    <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      {t("source_memory_cache", "⚡ Hafızadan Anında Getirildi (0ms)")}
                    </span>
                  ) : validEnriched.source === "database" ? (
                    <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      {t("source_database", "💾 Deste Hafızasından Getirildi (0ms)")}
                    </span>
                  ) : (
                    <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t("source_ai_cached", "✨ AI ile Getirildi ve Hafızaya Kaydedildi")}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => runFetchAi(wordInput || validEnriched.word, true)}
                    disabled={isLoadingNow}
                    className="text-[11px] text-indigo-400 hover:text-indigo-200 font-semibold transition cursor-pointer shrink-0 disabled:opacity-40"
                    title={t("btn_refresh_ai", "AI ile Yenile")}
                  >
                    ↻ {t("btn_refresh_ai", "Yenile")}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t("label_phonetic_field", "Fonetik")}
                  </label>
                  <input
                    type="text"
                    value={validEnriched.phonetic}
                    onChange={(e) =>
                      setEnrichedData({ ...validEnriched, phonetic: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-indigo-400 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {t("label_hint_def_optional", "İpucu / Bağlam (Opsiyonel)")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("placeholder_hint_def", "Özel bağlam...")}
                    value={contextHint}
                    onChange={(e) => setContextHint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">
                    {t("label_meaning_heading", "TANIM / ÇEVİRİ")} ({defLangObj?.flag}{" "}
                    {defLangDisplay}) *
                  </label>
                  {speakText && validEnriched.translation && (
                    <button
                      type="button"
                      onClick={() => speakText(validEnriched.translation, defLang)}
                      className="text-emerald-400 hover:text-white transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={validEnriched.translation}
                  onChange={(e) =>
                    setEnrichedData({ ...validEnriched, translation: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-400 outline-none font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-slate-400">
                    {t("label_example_field", "Örnek Cümle")} ({termLangObj?.flag} {termLangDisplay})
                  </label>
                  {speakText && validEnriched.exampleEn && (
                    <button
                      type="button"
                      onClick={() => speakText(validEnriched.exampleEn, termLang)}
                      className="text-indigo-400 hover:text-white transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={validEnriched.exampleEn}
                  onChange={(e) =>
                    setEnrichedData({ ...validEnriched, exampleEn: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 resize-none focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t("label_example_tr_field", "Cümlenin Çevirisi")} ({defLangObj?.flag}{" "}
                  {defLangDisplay})
                </label>
                <textarea
                  rows={2}
                  value={validEnriched.exampleTr}
                  onChange={(e) =>
                    setEnrichedData({ ...validEnriched, exampleTr: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-400 resize-none focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setWordInput("");
                    setContextHint("");
                    setEnrichedData(null);
                    if (lastAutoWordRef) {
                      lastAutoWordRef.current = "";
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {t("btn_search_diff_word", "← Farklı Kelime Ara")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCard}
                  disabled={isSavingCard || !validEnriched.translation.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-medium text-sm disabled:opacity-40 transition cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  {isSavingCard ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{t("btn_save_to_deck", "Desteye Kaydet")}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Kelime henüz girilmediyse veya yükleniyorsa İpucu + Eylem Butonları */
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t("label_hint_def_optional", "İpucu / Tanım (İsteğe bağlı)")}
                </label>
                <input
                  type="text"
                  placeholder={t(
                    "placeholder_hint_def",
                    "Kendiniz yazacaksanız buraya doğrudan anlamı da yazabilirsiniz"
                  )}
                  value={contextHint}
                  onChange={(e) => setContextHint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {t("btn_cancel", "İptal")}
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleManualInputMode}
                    disabled={!wordInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                  >
                    {t("btn_write_myself", "Kendim Yazacağım")} ✍️
                  </button>
                  <button
                    type="button"
                    onClick={() => runFetchAi(wordInput)}
                    disabled={isLoadingNow || !wordInput.trim()}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-xs transition disabled:opacity-40 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    {isLoadingNow ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{t("btn_fetch_ai", "AI ile Getir")}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
