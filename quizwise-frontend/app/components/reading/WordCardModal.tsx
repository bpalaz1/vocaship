"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Volume2, Plus, Check, X, Loader2, ArrowLeft, Languages, Folder } from "lucide-react";
import { API_BASE } from "../../config";
import { useLanguage } from "../../context/LanguageContext";
import { playNeuralTTS } from "../../utils/tts";
import PronunciationCoach from "../PronunciationCoach";
import { rewardReadingWordAdded } from "../../utils/rewardEngine";
import { getCachedWordEntry, setCachedWordEntry } from "../../utils/wordMemoryCache";
import { fetchDecksList, fetchFoldersList, FolderItem } from "../../utils/activeDeckStore";

interface Deck {
    id: string;
    title: string;
    folder_id?: string | null;
}

interface WordCardModalProps {
    word: string;
    contextSentence: string;
    decks: Deck[];
    selectedDeckId: string;
    initialTranslation?: string;
    onClose: () => void;
    onCardSaved: (word: string) => void;
}

export const TRANSLATION_LANGUAGES = [
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "de", label: "Almanca", flag: "🇩🇪" },
    { code: "es", label: "İspanyolca", flag: "🇪🇸" },
    { code: "fr", label: "Fransızca", flag: "🇫🇷" },
    { code: "it", label: "İtalyanca", flag: "🇮🇹" },
    { code: "ru", label: "Rusça", flag: "🇷🇺" },
];

// Yaygın hikaye kelimeleri ve birleşik ifadeler için anında yerel Türkçe sözlük
const QUICK_LOOKUP: Record<string, { tr: string; phonetic?: string; en_def?: string }> = {
    "interest": { tr: "faiz / ilgi, çıkar", phonetic: "/ˈɪn.trəst/", en_def: "A feeling of wanting to know about something, or money paid regularly at a particular rate for the use of borrowed money." },
    "well-known": { tr: "tanınmış, ünlü, bilinen", phonetic: "/ˌwel ˈnəʊn/", en_def: "Known widely or thoroughly." },
    "craftsman": { tr: "zanaatkar, usta", phonetic: "/ˈkrɑːfts.mən/", en_def: "A person who is skilled in a particular craft." },
    "mechanism": { tr: "mekanizma, düzenek", phonetic: "/ˈmek.ə.nɪ.zəm/", en_def: "A system of parts working together in a machine." },
    "deliberately": { tr: "kasten, bilerek", phonetic: "/dɪˈlɪb.ər.ət.li/", en_def: "Consciously and intentionally; on purpose." },
    "inherit": { tr: "miras almak", phonetic: "/ɪnˈher.ɪt/", en_def: "Receive money, property, or title as an heir at the death of the previous holder." },
    "antique": { tr: "antika, tarihi", phonetic: "/ænˈtiːk/", en_def: "A collectible object that has a high value because of its age." },
    "silent": { tr: "sessiz, sakin", phonetic: "/ˈsaɪ.lənt/", en_def: "Not making or accompanied by any sound." },
    "chimed": { tr: "çaldı (çan/saat)", phonetic: "/tʃaɪmd/", en_def: "Made a ringing sound, typically to indicate the time." },
    "delicate": { tr: "narin, hassas", phonetic: "/ˈdel.ɪ.kət/", en_def: "Very fine in texture or structure; of intricate workmanship." },
    "parchment": { tr: "parşömen", phonetic: "/ˈpɑːtʃ.mənt/", en_def: "A stiff, flat, thin material made from the prepared skin of an animal." },
    "departure": { tr: "ayrılış, vefat", phonetic: "/dɪˈpɑː.tʃər/", en_def: "The action of leaving, especially to start a journey." },
    "sunny": { tr: "güneşli", phonetic: "/ˈsʌn.i/", en_def: "Bright with sunlight." },
    "bench": { tr: "bank, oturak", phonetic: "/bentʃ/", en_def: "A long seat for several people, typically made of wood or stone." },
    "squirrel": { tr: "sincap", phonetic: "/ˈskwɪr.əl/", en_def: "An agile tree-dwelling rodent with a bushy tail." },
    "pocket": { tr: "cep", phonetic: "/ˈpɒk.ɪt/", en_def: "A small bag sewn into or on clothing so as to form part of it." },
    "proliferation": { tr: "hızlı artış, yayılma", phonetic: "/prəˌlɪf.ərˈeɪ.ʃən/", en_def: "Rapid increase in the number or amount of something." },
    "sentience": { tr: "duyarlılık, hissetme yetisi", phonetic: "/ˈsen.ti.əns/", en_def: "The capacity to experience feelings and sensations." },
    "mitigate": { tr: "hafifletmek, azaltmak", phonetic: "/ˈmɪt.ɪ.ɡeɪt/", en_def: "Make something bad less severe, serious, or painful." },
    "ephemeral": { tr: "kısa ömürlü, geçici", phonetic: "/ɪˈfem.ər.əl/", en_def: "Lasting for a very short time." },
    "resilient": { tr: "dirençli, esnek", phonetic: "/rɪˈzɪl.jənt/", en_def: "Able to recoil or spring back into shape after bending, or recover quickly." },
    "detrimental": { tr: "zararlı, hasar veren", phonetic: "/ˌdet.rɪˈmen.təl/", en_def: "Tending to cause harm." },
    "coherent": { tr: "tutarlı, uyumlu", phonetic: "/kəʊˈhɪə.rənt/", en_def: "Logical and consistent." },
    "ubiquitous": { tr: "her yerde bulunan", phonetic: "/juːˈbɪk.wɪ.təs/", en_def: "Present, appearing, or found everywhere." },
    "rate": { tr: "oran, kur", phonetic: "/reɪt/", en_def: "A measure, quantity, or frequency." },
    "capital": { tr: "sermaye, anapara", phonetic: "/ˈkæp.ɪ.təl/", en_def: "Wealth in the form of money or other assets." },
    "revenue": { tr: "gelir, hasılat", phonetic: "/ˈrev.ən.juː/", en_def: "Income, especially when of a company or organization." },
    "inflation": { tr: "enflasyon, pahalılık", phonetic: "/ɪnˈfleɪ.ʃən/", en_def: "A general increase in prices and fall in purchasing power." },
    "animal": { tr: "hayvan", phonetic: "/ˈæn.ɪ.məl/", en_def: "A living organism that feeds on organic matter." },
    "dog": { tr: "köpek", phonetic: "/dɒɡ/", en_def: "A domesticated carnivorous mammal." },
    "cat": { tr: "kedi", phonetic: "/kæt/", en_def: "A small domesticated carnivorous mammal." },
    "apple": { tr: "elma", phonetic: "/ˈæp.əl/", en_def: "A round fruit with red or green skin and crisp flesh." },
    "orange": { tr: "portakal, turuncu", phonetic: "/ˈɒr.ɪndʒ/", en_def: "A round juicy citrus fruit with a tough bright orange skin." },
    "routine": { tr: "rutin, alışılmış düzen", phonetic: "/ruːˈtiːn/", en_def: "A sequence of actions regularly followed." },
    "repair": { tr: "tamir etmek, onarmak", phonetic: "/rɪˈpeər/", en_def: "Fix or mend something damaged, faulty, or broken." }
};

export default function WordCardModal({
    word,
    contextSentence,
    decks,
    selectedDeckId,
    initialTranslation,
    onClose,
    onCardSaved,
}: WordCardModalProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [nativeLang, setNativeLang] = useState<string>("tr");
    const [data, setData] = useState<{
        phonetic?: string;
        translation?: string;
        definition?: string;
        meanings?: Array<{
            translation?: string;
            definition?: string;
            part_of_speech?: string;
        }>;
    } | null>(null);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [allDecks, setAllDecks] = useState<Deck[]>(decks);
    const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
    const [targetDeck, setTargetDeck] = useState(selectedDeckId || (decks[0]?.id ?? ""));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        let active = true;
        const loadFoldersAndDecks = async () => {
            try {
                const [fRes, dRes] = await Promise.all([
                    fetch(`${API_BASE}/api/v1/folders`).catch(() => null),
                    fetch(`${API_BASE}/api/v1/decks`).catch(() => null),
                ]);
                let fList: FolderItem[] = fRes && fRes.ok ? await fRes.json().catch(() => []) : [];
                let dList: Deck[] = dRes && dRes.ok ? await dRes.json().catch(() => []) : [];
                if (!Array.isArray(fList) || fList.length === 0) {
                    fList = await fetchFoldersList().catch(() => []);
                }
                if (!Array.isArray(dList) || dList.length === 0) {
                    const fallbackDecks = await fetchDecksList().catch(() => []);
                    dList = fallbackDecks.length > 0 ? fallbackDecks : decks;
                }
                if (!active) return;
                setFolders(fList);
                setAllDecks(dList);
                if (selectedDeckId && dList.some((d) => d.id === selectedDeckId)) {
                    setTargetDeck(selectedDeckId);
                } else if (dList.length > 0) {
                    setTargetDeck((prev) => (prev && dList.some((d) => d.id === prev) ? prev : dList[0].id));
                }
            } catch {}
        };
        loadFoldersAndDecks();
        return () => {
            active = false;
        };
    }, [decks, selectedDeckId]);

    const folderNameById = useMemo(() => {
        const map: Record<string, string> = {};
        for (const f of folders) map[f.id] = f.name;
        return map;
    }, [folders]);

    const filteredDecks = useMemo(() => {
        if (selectedFolderId === "all") return allDecks;
        if (selectedFolderId === "none") return allDecks.filter((d) => !d.folder_id);
        return allDecks.filter((d) => d.folder_id === selectedFolderId);
    }, [allDecks, selectedFolderId]);

    useEffect(() => {
        if (filteredDecks.length === 0) {
            setTargetDeck("");
            return;
        }
        if (!filteredDecks.some((d) => d.id === targetDeck)) {
            setTargetDeck(filteredDecks[0].id);
        }
    }, [filteredDecks, targetDeck]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const cleanWord = word.toLowerCase().trim();

        // 1. Hikayeden gelen geçerli bir Türkçe karşılık varsa ve Türkçe seçiliyse öncelikli kullan
        if (
            nativeLang === "tr" &&
            initialTranslation &&
            !initialTranslation.toLowerCase().includes("anlam bulunamad")
        ) {
            setLoading(false);
            setData({
                phonetic: QUICK_LOOKUP[cleanWord]?.phonetic || `/${cleanWord}/`,
                translation: initialTranslation,
                definition: QUICK_LOOKUP[cleanWord]?.en_def || "",
                meanings: [
                    {
                        translation: initialTranslation,
                        definition: QUICK_LOOKUP[cleanWord]?.en_def || "",
                    }
                ],
            });
            return;
        }

        // 2. Hafıza Öncelikli (0ms): Ortak çok dilli yerel sözlük + localStorage önbelleğini kontrol et
        const memHit = getCachedWordEntry(cleanWord, "en", nativeLang);
        if (memHit) {
            setLoading(false);
            setData({
                phonetic: memHit.phonetic || `/${cleanWord}/`,
                translation: memHit.translation,
                definition: memHit.definition || "",
                meanings: [
                    {
                        translation: memHit.translation,
                        definition: memHit.definition || "",
                    }
                ],
            });
            return;
        }

        // 3. Türkçe için ek hikaye yerel sözlüğünü kontrol et
        if (nativeLang === "tr" && QUICK_LOOKUP[cleanWord]) {
            const item = QUICK_LOOKUP[cleanWord];
            setLoading(false);
            setData({
                phonetic: item.phonetic || `/${cleanWord}/`,
                translation: item.tr,
                definition: item.en_def || "",
                meanings: [
                    {
                        translation: item.tr,
                        definition: item.en_def || "",
                    }
                ],
            });
            return;
        }

        // 4. Hafızada yoksa Backend (/ai/lookup -> /ai/enrich) ve ardından MyMemory + DictionaryAPI yedeğini çalıştır
        async function fetchMeaning() {
            setData(null);
            setLoading(true);

            let resolvedTranslation = "";
            let resolvedDefinition = "";
            let resolvedPhonetic = "";
            let resolvedPartOfSpeech = "";
            let resolvedExampleTarget = "";
            let resolvedExampleNative = "";
            let resolvedSource = "memory_cache";

            const extractFromPayload = (json: any) => {
                if (!json || typeof json !== "object") return;
                const firstMeaning = Array.isArray(json.meanings) ? json.meanings[0] : null;
                const rawTr =
                    json.turkish_meaning ||
                    json.meaning ||
                    json.translation ||
                    (typeof firstMeaning === "string"
                        ? firstMeaning
                        : firstMeaning?.translation || firstMeaning?.definition) ||
                    "";
                const rawDef =
                    (typeof firstMeaning === "object" && firstMeaning?.definition) ||
                    json.definition ||
                    "";
                if (rawTr && String(rawTr).trim().toLowerCase() !== cleanWord.toLowerCase()) {
                    resolvedTranslation = String(rawTr).trim();
                }
                if (rawDef) resolvedDefinition = String(rawDef).trim();
                if (json.phonetic) resolvedPhonetic = String(json.phonetic).trim();
                if (typeof firstMeaning === "object" && firstMeaning?.part_of_speech) {
                    resolvedPartOfSpeech = String(firstMeaning.part_of_speech);
                }
                if (Array.isArray(json.example_sentences) && json.example_sentences[0]) {
                    resolvedExampleTarget = json.example_sentences[0].target || json.example_sentences[0].en || "";
                    resolvedExampleNative = json.example_sentences[0].native || json.example_sentences[0].tr || "";
                }
                if (json.source) resolvedSource = String(json.source);
            };

            const authToken =
                typeof window !== "undefined"
                    ? localStorage.getItem("vorego_auth_token") || localStorage.getItem("token")
                    : null;
            const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
            if (authToken) authHeaders["Authorization"] = `Bearer ${authToken}`;

            try {
                // 4a. /api/v1/ai/lookup
                const lookupRes = await fetch(`${API_BASE}/api/v1/ai/lookup`, {
                    method: "POST",
                    headers: authHeaders,
                    signal: controller.signal,
                    body: JSON.stringify({
                        word: cleanWord,
                        target_lang: "en",
                        native_lang: nativeLang,
                        context_hint: contextSentence || undefined,
                    }),
                }).catch(() => null);

                if (lookupRes && lookupRes.ok) {
                    extractFromPayload(await lookupRes.json().catch(() => null));
                }

                // 4b. Boşsa /api/v1/ai/enrich dene
                if (!resolvedTranslation) {
                    const enrichRes = await fetch(`${API_BASE}/api/v1/ai/enrich`, {
                        method: "POST",
                        headers: authHeaders,
                        signal: controller.signal,
                        body: JSON.stringify({
                            word: cleanWord,
                            context: contextSentence || undefined,
                            target_lang: nativeLang,
                        }),
                    }).catch(() => null);

                    if (enrichRes && enrichRes.ok) {
                        extractFromPayload(await enrichRes.json().catch(() => null));
                    }
                }

                // 4c. Ücretsiz MyMemory Translation API yedeği (hiçbir zaman "Anlam bulunamadı" bırakma)
                if (!resolvedTranslation) {
                    const langPair = `en|${nativeLang || "tr"}`;
                    const fallbackRes = await fetch(
                        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=${langPair}`,
                        { signal: controller.signal }
                    ).catch(() => null);

                    if (fallbackRes && fallbackRes.ok) {
                        const fallbackData = await fallbackRes.json().catch(() => null);
                        const translatedText = fallbackData?.responseData?.translatedText;
                        if (
                            translatedText &&
                            typeof translatedText === "string" &&
                            !translatedText.toUpperCase().includes("MYMEMORY WARNING")
                        ) {
                            resolvedTranslation = translatedText.trim();
                            resolvedSource = "mymemory";
                        }
                    }
                }

                // 4d. Fonetik veya İngilizce tanım eksikse DictionaryAPI üzerinden gerçek IPA çek
                if (!resolvedPhonetic || resolvedPhonetic === `/${cleanWord}/` || !resolvedDefinition) {
                    const dictRes = await fetch(
                        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`,
                        { signal: controller.signal }
                    ).catch(() => null);

                    if (dictRes && dictRes.ok) {
                        const dictJson = await dictRes.json().catch(() => null);
                        const entry = Array.isArray(dictJson) ? dictJson[0] : null;
                        if (entry) {
                            const ipa =
                                entry.phonetic ||
                                entry.phonetics?.find((p: any) => p?.text)?.text ||
                                "";
                            if (ipa && (!resolvedPhonetic || resolvedPhonetic === `/${cleanWord}/`)) {
                                resolvedPhonetic = ipa;
                            }
                            const dictDef = entry.meanings?.[0]?.definitions?.[0]?.definition || "";
                            if (dictDef && !resolvedDefinition) {
                                resolvedDefinition = dictDef;
                            }
                            if (!resolvedPartOfSpeech && entry.meanings?.[0]?.partOfSpeech) {
                                resolvedPartOfSpeech = entry.meanings[0].partOfSpeech;
                            }
                        }
                    }
                }

                if (!isMounted) return;

                if (resolvedTranslation) {
                    setCachedWordEntry({
                        word: cleanWord,
                        targetLang: "en",
                        nativeLang,
                        phonetic: resolvedPhonetic || `/${cleanWord}/`,
                        translation: resolvedTranslation,
                        definition: resolvedDefinition,
                        exampleTarget: resolvedExampleTarget,
                        exampleNative: resolvedExampleNative,
                        source: resolvedSource,
                    });
                }

                setData({
                    phonetic: resolvedPhonetic || `/${cleanWord}/`,
                    translation: resolvedTranslation,
                    definition: resolvedDefinition,
                    meanings: [
                        {
                            translation: resolvedTranslation,
                            definition: resolvedDefinition,
                            part_of_speech: resolvedPartOfSpeech,
                        },
                    ],
                });
            } catch (err: any) {
                if (err?.name === "AbortError") return;
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (cleanWord) fetchMeaning();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [word, contextSentence, nativeLang, initialTranslation, t]);

    const speak = () => {
        playNeuralTTS(word, { rate: 0.9 });
    };

    const handleSaveToDeck = async () => {
        if (!targetDeck) {
            alert(t("read_select_deck_alert", "Lütfen bir deste seçin!"));
            return;
        }
        setSaving(true);
        try {
            const wordKey = word.trim().toLowerCase();
            const fallbackTr = QUICK_LOOKUP[wordKey]?.tr;
            let currentTranslation = data?.meanings?.[0]?.translation || data?.translation || "";
            if (!currentTranslation || currentTranslation.trim().toLowerCase() === wordKey) {
                currentTranslation = fallbackTr || currentTranslation || word;
            }
            const currentDefinition = data?.meanings?.[0]?.definition || data?.definition || currentTranslation;

            const payload = {
                deck_id: targetDeck,
                word: word.trim(),
                phonetic: data?.phonetic || null,
                target_lang: "en",
                native_lang: nativeLang,
                meanings: [
                    {
                        part_of_speech: data?.meanings?.[0]?.part_of_speech || "",
                        translation: currentTranslation,
                        definition: currentDefinition,
                        target_lang: "en",
                        native_lang: nativeLang,
                    },
                ],
                example_sentences: contextSentence
                    ? [{ en: contextSentence.trim(), tr: "", target: contextSentence.trim(), native: "" }]
                    : [],
                collocations: [],
            };

            const res = await fetch(`${API_BASE}/api/v1/decks/cards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setSaved(true);
                rewardReadingWordAdded(word.trim());
                onCardSaved(word.toLowerCase().trim());

                setTimeout(() => {
                    onClose();
                }, 600);
            } else {
                const errJson = await res.json().catch(() => null);
                alert(t("read_card_add_failed", "Kart eklenemedi:") + " " + (errJson?.detail ? JSON.stringify(errJson.detail) : res.statusText));
            }
        } catch (err: any) {
            alert(t("read_server_conn_err", "Sunucuya bağlanılamadı:") + " " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative space-y-4"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                    title={t("read_close_back_story", "Kapat ve Hikayeye Dön")}
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 pr-8">
                    <h3 className="text-2xl font-bold text-white capitalize">{word}</h3>
                    <button
                        onClick={speak}
                        className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition cursor-pointer"
                        title={t("listen_pronunciation", "Telaffuz Dinle")}
                    >
                        <Volume2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Çeviri Dili Seçici */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t("label_translation_lang", "Çeviri Dili:")}</span>
                    </span>
                    <select
                        value={nativeLang}
                        onChange={(e) => setNativeLang(e.target.value)}
                        className="bg-slate-100 border border-slate-300 text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                    >
                        {TRANSLATION_LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                {l.flag} {l.label}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 text-indigo-300 my-4 text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>{t("translating_loading", "Çevriliyor...")}</span>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        <p className="text-xs font-mono text-indigo-300">{data?.phonetic}</p>
                        <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/50 space-y-2.5">
                            <div>
                                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                                    {t("label_meaning_heading", "ANLAMI")}
                                </span>
                                <p className="text-lg font-bold text-emerald-400 mt-0.5">
                                    {data?.meanings?.[0]?.translation || data?.translation || t("meaning_not_found", "Anlam bulunamadı")}
                                </p>
                            </div>

                            {/* İngilizce tanımı ('definition') ise ayrı bir alanda küçük italik metin olarak göster, asla 'TÜRKÇE KARŞILIĞI' alanına basma */}
                            {Boolean(
                                (data?.meanings?.[0]?.definition || data?.definition) &&
                                (data?.meanings?.[0]?.definition !== (data?.meanings?.[0]?.translation || data?.translation))
                            ) && (
                                <div className="pt-2 border-t border-slate-700/60">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">
                                        {t("label_en_definition", "İngilizce Tanım (Definition):")}
                                    </span>
                                    <p className="text-xs text-slate-300 italic leading-relaxed">
                                        {data?.meanings?.[0]?.definition || data?.definition}
                                    </p>
                                </div>
                            )}
                        </div>
                        {contextSentence ? (
                            <div className="space-y-2">
                                <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-300 italic border border-slate-700/30 line-clamp-3">
                                    "{contextSentence}"
                                </div>
                                <PronunciationCoach
                                    targetSentence={contextSentence}
                                    compact
                                    className="w-full"
                                />
                            </div>
                        ) : (
                            <PronunciationCoach
                                targetSentence={word}
                                compact
                                className="w-full"
                            />
                        )}
                    </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                    <div>
                        <label className="text-xs text-slate-400 flex items-center gap-1.5 mb-1.5">
                            <Folder className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t("read_folder_filter_lbl", "Klasör Seçimi")}</span>
                        </label>
                        <select
                            value={selectedFolderId}
                            onChange={(e) => setSelectedFolderId(e.target.value)}
                            className="w-full bg-slate-100 border border-slate-300 text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        >
                            <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">{t("read_all_folders_opt", "Tüm Klasörler / Genel")}</option>
                            <option value="none" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">{t("read_general_no_folder", "Genel (Klasörsüz)")}</option>
                            {folders.map((f) => (
                                <option key={f.id} value={f.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                    📁 {f.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5">{t("label_target_deck", "Hedef Deste")}</label>
                        <select
                            value={targetDeck}
                            onChange={(e) => setTargetDeck(e.target.value)}
                            className="w-full bg-slate-100 border border-slate-300 text-slate-900 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        >
                            {filteredDecks.length === 0 ? (
                                <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">{t("read_no_decks_in_folder", "Bu klasörde deste bulunamadı")}</option>
                            ) : (
                                filteredDecks.map((d) => {
                                    const fLabel =
                                        d.folder_id && folderNameById[d.folder_id]
                                            ? `📁 ${folderNameById[d.folder_id]}`
                                            : t("read_general_badge", "Genel");
                                    return (
                                        <option key={d.id} value={d.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                            {d.title} ({fLabel})
                                        </option>
                                    );
                                })
                            )}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                        <button
                            onClick={handleSaveToDeck}
                            disabled={saving || saved || loading}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg ${saved
                                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                                }`}
                        >
                            {saved ? (
                                <>
                                    <Check className="w-4 h-4" /> {t("saved_to_deck", "Desteye Eklendi!")}
                                </>
                            ) : saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> {t("saving", "Kaydediliyor...")}
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" /> {t("btn_add_card_to_deck", "Desteme Kart Olarak Ekle")}
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition border border-slate-700/60"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> {t("btn_back_to_story", "Hikayeye Geri Dön")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}