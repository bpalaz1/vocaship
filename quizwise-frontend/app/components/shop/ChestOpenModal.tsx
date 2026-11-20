"use client";

import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Sparkles,
  Coins,
  Lock,
  UserCheck,
  Trophy,
  Gamepad2,
  BookOpen,
  Mic,
  Check,
  Gift,
  Award,
} from "lucide-react";
import {
  BASE_CHEST_ITEMS,
  EPIC_MUSEUM_ITEMS,
  BaseCollectionFilter,
  getBaseCollectionGroup,
  CHESTS,
  ChestItem,
  checkChestAccess,
  drawItemFromChest,
  ItemRarity,
} from "../../data/chestItems";
import { MuseumCategory } from "../../data/museumItems";
import { usePersona } from "../../context/PersonaContext";
import { useProfile } from "../../context/ProfileContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getLocalizedChestInfo,
  getLocalizedItemText,
  getLocalizedBuffLabel,
} from "../../data/collectionLocales";
import {
  getUnifiedAchievementStats,
  UnifiedAchievementStats,
} from "../../utils/rewardEngine";
import MuseumArtwork from "./MuseumArtwork";

export interface ChestOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGold: number;
  userLearnedWords?: number;
  onGoldChange?: (newGold: number) => void;
  onAvatarEquipped?: (avatarUrl: string, name: string) => void;
}

interface MasteryTierConfig {
  tier: number;
  minWords: number;
  maxWords: number;
  title: string;
  icon: string;
  rewardGold: number;
}

const MASTERY_TIERS: MasteryTierConfig[] = [
  { tier: 1, minWords: 0, maxWords: 100, title: "Tohum", icon: "🌱", rewardGold: 100 },
  { tier: 2, minWords: 100, maxWords: 200, title: "Filiz", icon: "🌿", rewardGold: 100 },
  { tier: 3, minWords: 200, maxWords: 300, title: "Bronz", icon: "🥉", rewardGold: 100 },
  { tier: 4, minWords: 300, maxWords: 400, title: "Safir I", icon: "💎", rewardGold: 250 },
  { tier: 5, minWords: 400, maxWords: 500, title: "Safir II", icon: "🔹", rewardGold: 250 },
  { tier: 6, minWords: 500, maxWords: 600, title: "Safir III", icon: "💠", rewardGold: 250 },
  { tier: 7, minWords: 600, maxWords: 700, title: "Zümrüt I", icon: "🟢", rewardGold: 500 },
  { tier: 8, minWords: 700, maxWords: 800, title: "Zümrüt II", icon: "❇️", rewardGold: 500 },
  { tier: 9, minWords: 800, maxWords: 900, title: "Üstat", icon: "⚡", rewardGold: 500 },
  { tier: 10, minWords: 900, maxWords: 1000, title: "Grandmaster", icon: "👑", rewardGold: 500 },
];

const CLAIMED_TIERS_STORAGE_KEY = "vocaship_claimed_honeycomb_tiers";

function getRecommendedChestId(learnedWords: number): string {
  // Kullanıcının aktif kademesine uygun erişebildiği en yüksek sandığı seç
  let best = CHESTS[0].id;
  for (const chest of CHESTS) {
    if (learnedWords >= chest.requiredWords) {
      best = chest.id;
    }
  }
  return best;
}

export default function ChestOpenModal({
  isOpen,
  onClose,
  userGold,
  userLearnedWords = 145,
  onGoldChange,
  onAvatarEquipped,
}: ChestOpenModalProps) {
  const { saveUser3DAvatar, setPersona } = usePersona();
  const { userProfile, updateProfile } = useProfile();
  const { language, t } = useLanguage();

  // Aktif Sekme: 'open' (Ustalık Peteği & Sandık) | 'collection' (50 Karakter & Eser) | 'epics' (100 Epik Eser)
  const [activeTab, setActiveTab] = useState<"open" | "collection" | "epics">("open");

  // Seçili Sandık (Aktif kelime kademesine göre başlar)
  const [selectedChestId, setSelectedChestId] = useState<string>(() =>
    getRecommendedChestId(userLearnedWords)
  );

  // Kullanıcı Durumları (Tek Para Birimi: Altın & Ortak 4 Aktivite İstatistiği)
  const [gold, setGold] = useState<number>(userGold);
  const [stats, setStats] = useState<UnifiedAchievementStats>({
    sm2LearnedWords: userLearnedWords,
    arenaVictories: 0,
    arenaBestStreak: 0,
    readingCompletedStories: 0,
    speakingCompletedSessions: 0,
  });
  const [unlockedItemIds, setUnlockedItemIds] = useState<string[]>([
    "fox_sparky",
    "wooden_dict_pen",
  ]);
  const [claimedTierIds, setClaimedTierIds] = useState<number[]>([]);
  const [selectedAvatarItemId, setSelectedAvatarItemId] = useState<string>("");
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);

  // Sandık Açılış Animasyon Durumu
  const [openingState, setOpeningState] = useState<"idle" | "shaking" | "revealed">("idle");
  const [revealedItem, setRevealedItem] = useState<ChestItem | null>(null);

  // Kategori Filtreleri
  const [collectionCategoryFilter, setCollectionCategoryFilter] =
    useState<BaseCollectionFilter>("all");
  const [epicCategoryFilter, setEpicCategoryFilter] = useState<
    MuseumCategory | "all"
  >("all");

  useEffect(() => {
    setGold(userGold);
  }, [userGold]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncAll = () => {
      const unified = getUnifiedAchievementStats();
      const effectiveWords = Math.max(unified.sm2LearnedWords, userLearnedWords);
      setStats({
        ...unified,
        sm2LearnedWords: effectiveWords,
      });

      try {
        const savedChest = localStorage.getItem("vocaship_unlocked_chest_items");
        const savedMuseum = localStorage.getItem("vocaship_unlocked_museum_items");
        const chestArr = savedChest ? JSON.parse(savedChest) : [];
        const museumArr = savedMuseum ? JSON.parse(savedMuseum) : [];
        const combined = Array.from(
          new Set([
            "fox_sparky",
            "wooden_dict_pen",
            ...(Array.isArray(chestArr) ? chestArr : []),
            ...(Array.isArray(museumArr) ? museumArr : []),
          ])
        );
        setUnlockedItemIds(combined);

        const savedClaimed = localStorage.getItem(CLAIMED_TIERS_STORAGE_KEY);
        const claimedArr = savedClaimed ? JSON.parse(savedClaimed) : [];
        if (Array.isArray(claimedArr)) {
          setClaimedTierIds(
            claimedArr.map((v) => Number(v)).filter((n) => !Number.isNaN(n))
          );
        }

        const savedAvatarId = localStorage.getItem("vocaship_selected_avatar_id") || "";
        setSelectedAvatarItemId(savedAvatarId);
      } catch {}
    };

    syncAll();
    if (isOpen) {
      const unified = getUnifiedAchievementStats();
      const effectiveWords = Math.max(unified.sm2LearnedWords, userLearnedWords);
      setSelectedChestId(getRecommendedChestId(effectiveWords));
    }
    window.addEventListener("vocaship_unified_stats_updated", syncAll);
    return () => {
      window.removeEventListener("vocaship_unified_stats_updated", syncAll);
    };
  }, [userLearnedWords, isOpen]);

  const learnedWords = stats.sm2LearnedWords;
  const sm2ProgressPct = Math.min(100, Math.round((learnedWords / 1000) * 100));

  // İlk alınabilir tamamlanmış kademe ödülü
  const claimableTiers = useMemo(
    () =>
      MASTERY_TIERS.filter(
        (tier) => learnedWords >= tier.maxWords && !claimedTierIds.includes(tier.tier)
      ),
    [learnedWords, claimedTierIds]
  );

  if (!isOpen) return null;

  const currentChest =
    CHESTS.find((c) => c.id === selectedChestId) || CHESTS[0];

  const access = checkChestAccess(currentChest, learnedWords, gold, unlockedItemIds);

  const showNotice = (msg: string) => {
    setNoticeBanner(msg);
    setTimeout(() => {
      setNoticeBanner((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Kademe Ödülü Alma (+100 / +250 / +500 Altın & Kademe Rozeti)
  const handleClaimTierReward = (cell: MasteryTierConfig) => {
    if (learnedWords < cell.maxWords || claimedTierIds.includes(cell.tier)) return;

    const nextClaimed = Array.from(new Set([...claimedTierIds, cell.tier]));
    setClaimedTierIds(nextClaimed);

    const nextGold = gold + cell.rewardGold;
    setGold(nextGold);
    if (onGoldChange) onGoldChange(nextGold);

    try {
      localStorage.setItem(CLAIMED_TIERS_STORAGE_KEY, JSON.stringify(nextClaimed));
      localStorage.setItem("vocaship_gold", nextGold.toString());
      window.dispatchEvent(
        new CustomEvent("vocaship_gold_updated", {
          detail: { gold: nextGold, added: cell.rewardGold },
        })
      );
    } catch {}

    const tierLabel = t(`honey_t${cell.tier}`, cell.title);
    showNotice(
      `🏆 ${t("honey_tier_claimed_toast", "{tier} Kademe Rozeti & +{gold} Altın kasana eklendi!", {
        tier: tierLabel,
        gold: cell.rewardGold,
      })}`
    );

    try {
      confetti({ particleCount: 80, spread: 75 });
    } catch {}
  };

  // Kayıpsız Sandık Açılışı (50 Karakter/Eser Havuzundan Garantili Yeni Ödül — Mükerrer Çıkmaz)
  const handleOpenChest = () => {
    if (!access.canOpen || openingState !== "idle") return;

    const drawnItem = drawItemFromChest(currentChest, unlockedItemIds);
    if (!drawnItem) return;

    const nextGold = Math.max(0, gold - currentChest.costGold);
    setGold(nextGold);
    if (onGoldChange) onGoldChange(nextGold);
    try {
      localStorage.setItem("vocaship_gold", nextGold.toString());
      window.dispatchEvent(
        new CustomEvent("vocaship_gold_updated", {
          detail: { gold: nextGold, added: -currentChest.costGold },
        })
      );
    } catch {}

    setOpeningState("shaking");
    setRevealedItem(null);

    setTimeout(() => {
      const nextUnlocked = Array.from(new Set([...unlockedItemIds, drawnItem.id]));
      setUnlockedItemIds(nextUnlocked);
      try {
        localStorage.setItem(
          "vocaship_unlocked_chest_items",
          JSON.stringify(nextUnlocked)
        );
      } catch {}

      setRevealedItem(drawnItem);
      setOpeningState("revealed");

      try {
        confetti({
          particleCount: drawnItem.rarity === "legendary" ? 120 : 65,
          spread: 80,
        });
      } catch {}
    }, 750);
  };

  // Avatar Olarak Seç (Yalnızca avatar_url görselini günceller, hiçbir karakter adı yazmaz)
  const handleEquipAvatar = (item: ChestItem) => {
    const avatarVisual = item.icon || "🦊";
    setSelectedAvatarItemId(item.id);
    updateProfile({
      avatar_url: avatarVisual,
    });

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vocaship_equipped_title");
        localStorage.setItem("vocaship_selected_avatar_id", item.id);
        if (item.passiveBuff) {
          localStorage.setItem(
            "vocaship_equipped_buff",
            JSON.stringify(item.passiveBuff)
          );
        }
        window.dispatchEvent(
          new CustomEvent("vocaship_profile_updated", {
            detail: {
              avatar_url: avatarVisual,
            },
          })
        );
      } catch {}
    }

    showNotice(`✅ ${t("chest_equipped_btn", "Seçili Avatar ✓")}`);

    if (onAvatarEquipped) {
      onAvatarEquipped(avatarVisual, "");
    }
  };

  const rarityColors: Record<ItemRarity, { text: string }> = {
    common: { text: "text-slate-300" },
    rare: { text: "text-cyan-300" },
    epic: { text: "text-purple-300" },
    legendary: { text: "text-amber-300" },
  };

  const getLocalizedRarity = (r: ItemRarity) =>
    t(`rarity_${r}` as any, r.toUpperCase()).toUpperCase();

  const getChestShortName = (chest: (typeof CHESTS)[number]) => {
    const fallbackMap: Record<number, string> = {
      1: "Doğa Sandığı",
      2: "Kahraman Sandığı",
      3: "Kozmik Sandık",
      4: "Kadim Sandık",
    };
    return t(`chest_short_tier_${chest.tier}`, fallbackMap[chest.tier] || chest.name.tr);
  };

  const formatAccessMessage = (
    chest: (typeof CHESTS)[number],
    acc: ReturnType<typeof checkChestAccess>
  ) => {
    if (acc.allUnlocked) return t("chest_unlock_all_done_msg");
    if (acc.wordLock) {
      return t("chest_unlock_words_msg", undefined, {
        req: chest.requiredWords,
        cur: learnedWords,
      });
    }
    if (acc.goldLock) {
      return t("chest_unlock_gold_msg", undefined, {
        need: chest.costGold - gold,
        cur: gold,
        cost: chest.costGold,
      });
    }
    return t("chest_ready_label", undefined, {
      cost: chest.costGold,
      count: acc.remainingLockedCount,
    });
  };

  // 50 Karakter & Eser Havuzu Sayaçları
  const totalCount = BASE_CHEST_ITEMS.length;
  const unlockedCount = BASE_CHEST_ITEMS.filter((i) =>
    unlockedItemIds.includes(i.id)
  ).length;
  const collectionPercent = Math.min(
    100,
    Math.round((unlockedCount / Math.max(1, totalCount)) * 100)
  );

  // 100 Epik Eser Havuzu Sayaçları
  const totalEpicCount = EPIC_MUSEUM_ITEMS.length;
  const unlockedEpicCount = EPIC_MUSEUM_ITEMS.filter((i) =>
    unlockedItemIds.includes(i.id)
  ).length;

  const BASE_CATEGORY_TABS: { id: BaseCollectionFilter; label: string }[] = [
    { id: "all", label: t("chest_filter_all", undefined, { count: totalCount }) },
    { id: "mascots", label: `🐾 ${t("chest_filter_mascots")}` },
    { id: "equipment", label: `🎒 ${t("chest_filter_equipment")}` },
    { id: "future", label: `🚀 ${t("chest_filter_future")}` },
  ];

  const EPIC_CATEGORY_TABS: { id: MuseumCategory | "all"; label: string }[] = [
    { id: "all", label: t("chest_filter_all", undefined, { count: totalEpicCount }) },
    { id: "heroes", label: `⚔️ ${t("chest_cat_heroes")}` },
    { id: "creatures", label: `🐉 ${t("chest_cat_creatures")}` },
    { id: "relics", label: `🗡️ ${t("chest_cat_relics")}` },
    { id: "monuments", label: `🏰 ${t("chest_cat_monuments")}` },
  ];

  const locRevealed = revealedItem
    ? getLocalizedItemText(
        revealedItem.id,
        revealedItem.name.tr,
        revealedItem.description.tr,
        language
      )
    : null;

  // 10 Kademeli Hücre Stil Yardımcıları
  const getTierStyle = (cell: MasteryTierConfig) => {
    const isCompleted = learnedWords >= cell.maxWords;
    const isCurrent =
      learnedWords >= cell.minWords && learnedWords < cell.maxWords;

    if (!isCompleted && !isCurrent) {
      return {
        card: "bg-slate-950/75 border-slate-800 text-slate-500",
        glow: "",
        isLit: false,
      };
    }

    if (cell.maxWords <= 300) {
      return {
        card: "bg-slate-800/95 border-slate-600 text-slate-100",
        glow: "shadow-[0_0_12px_rgba(148,163,184,0.22)]",
        isLit: true,
      };
    }

    if (cell.maxWords <= 600) {
      return {
        card: "bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-700 border-cyan-400 text-white",
        glow: "shadow-[0_0_16px_rgba(6,182,212,0.4)]",
        isLit: true,
      };
    }

    return {
      card: "bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 border-amber-300 text-slate-950",
      glow: "shadow-[0_0_18px_rgba(16,185,129,0.45)]",
      isLit: true,
    };
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in select-none overflow-y-auto"
    >
      <div
        data-theme-preserve="dark"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1680px] mx-auto rounded-3xl bg-slate-900 border border-indigo-500/30 px-4 sm:px-6 py-5 sm:py-6 shadow-2xl shadow-indigo-950/70 text-slate-100 space-y-5 animate-in zoom-in-95 duration-200 relative my-auto overflow-hidden max-h-[94vh] overflow-y-auto"
      >
        {/* Atmosferik Arka Plan Işıkları */}
        <div className="absolute top-0 right-1/4 w-80 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. ÜST HEADER & 5 KOMPAKT İSTATİSTİK KARTI */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-4 pb-4 border-b border-slate-800 relative z-10">
          {/* Sol Üst: SM-2 Rozeti & Ustalık Peteği Başlığı */}
          <div className="space-y-1.5 pr-8 lg:pr-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 text-[11px] font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("honey_badge", "SM-2 Kelime Hakimiyet Peteği")}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {t("honey_reward_hub_title", "Ustalık Peteği & Ödül Merkezi (1000 Kelime)")}
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/35">
                %{sm2ProgressPct} {t("dash_completed", "Tamamlandı")}
              </span>
            </div>
          </div>

          {/* Sağ Üst: 5 Kontrastlı İstatistik Kartı + Kapat Butonu */}
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap shrink-0">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 flex-1 lg:flex-none">
              {/* KELİME */}
              <div className="px-2.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-center min-w-[74px] shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span>{t("honey_word_lbl", "KELİME")}</span>
                </span>
                <span className="text-sm font-black font-mono text-slate-900 block mt-0.5">
                  {learnedWords}
                </span>
              </div>

              {/* OKUMA */}
              <div className="px-2.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-center min-w-[74px] shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1">
                  <BookOpen className="w-3 h-3 text-emerald-600" />
                  <span>{t("nav_reading_short", "OKUMA")}</span>
                </span>
                <span className="text-sm font-black font-mono text-emerald-700 block mt-0.5">
                  {stats.readingCompletedStories}
                </span>
              </div>

              {/* SPEAKING */}
              <div className="px-2.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-center min-w-[74px] shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1">
                  <Mic className="w-3 h-3 text-rose-500" />
                  <span>SPEAKING</span>
                </span>
                <span className="text-sm font-black font-mono text-rose-600 block mt-0.5">
                  {stats.speakingCompletedSessions}
                </span>
              </div>

              {/* OYUN */}
              <div className="px-2.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-center min-w-[74px] shadow-sm">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1">
                  <Gamepad2 className="w-3 h-3 text-indigo-600" />
                  <span>{t("honey_stat_game", "OYUN")}</span>
                </span>
                <span className="text-sm font-black font-mono text-indigo-700 block mt-0.5">
                  {stats.arenaVictories}
                </span>
              </div>

              {/* ALTIN (Altın Vurgulu Rozet) */}
              <div className="px-2.5 py-2 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400 border border-amber-500 text-slate-950 text-center min-w-[82px] shadow-md shadow-amber-500/20 col-span-2 sm:col-span-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-950 flex items-center justify-center gap-1">
                  <span>🪙</span>
                  <span>{t("games_gold_unit", "ALTIN")}</span>
                </span>
                <span className="text-sm font-black font-mono text-slate-950 block mt-0.5">
                  {gold}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 lg:static p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              aria-label={t("lib_close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bildirim Şeridi */}
        {noticeBanner && (
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2 relative z-10 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{noticeBanner}</span>
          </div>
        )}

        {/* 2. 10 KADEMELİ USTALIK YOLU (100K - 1000K) */}
        <div className="space-y-3 relative z-10 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 w-full">
            {MASTERY_TIERS.map((cell) => {
              const isCompleted = learnedWords >= cell.maxWords;
              const isCurrent =
                learnedWords >= cell.minWords && learnedWords < cell.maxWords;
              const isClaimed = claimedTierIds.includes(cell.tier);
              const canClaim = isCompleted && !isClaimed;
              const style = getTierStyle(cell);

              return (
                <div
                  key={cell.tier}
                  className={`relative rounded-2xl p-2 border text-center transition-all duration-200 flex flex-col items-center justify-between min-h-[108px] ${
                    style.card
                  } ${style.glow} ${
                    isCurrent
                      ? "ring-2 ring-amber-400 border-amber-400 scale-[1.03] shadow-lg shadow-amber-500/25"
                      : canClaim
                      ? "ring-2 ring-emerald-400 border-emerald-400 shadow-lg shadow-emerald-500/20"
                      : ""
                  }`}
                >
                  <span className="text-xl block leading-none mt-0.5">{cell.icon}</span>

                  <div className="space-y-0.5 my-1">
                    <span className="text-[11px] font-black leading-tight block">
                      {t(`honey_t${cell.tier}`, cell.title)}
                    </span>
                    <span className="text-[9px] font-mono opacity-80 block">
                      {cell.maxWords} {t("honey_w_abbr", "K.")}
                    </span>
                  </div>

                  {canClaim ? (
                    <button
                      type="button"
                      onClick={() => handleClaimTierReward(cell)}
                      title={t("honey_claim_tier_btn", "+{gold} Altın & Kademe Rozeti Al", {
                        gold: cell.rewardGold,
                      })}
                      className="w-full py-1 px-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-[9px] shadow-md transition active:scale-95 cursor-pointer animate-pulse"
                    >
                      {t("honey_claim_short", "+{gold} 🪙 Al", { gold: cell.rewardGold })}
                    </button>
                  ) : (
                    <span
                      className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-black tracking-wide ${
                        isCurrent
                          ? "bg-amber-400 text-slate-950"
                          : isCompleted
                          ? "bg-emerald-500/90 text-slate-950"
                          : "bg-slate-900 text-slate-500 border border-slate-800"
                      }`}
                    >
                      {isCurrent
                        ? t("honey_active", "AKTİF")
                        : isCompleted
                        ? `✓ ${t("honey_done", "TAMAM")}`
                        : t("honey_lock_short", "KİLİT")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tek Tıkla Kademe Ödülü Alma Şeridi (Tamamlanmış & Alınmamış Basamak Varsa) */}
          {claimableTiers.length > 0 && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-emerald-500/15 border border-amber-400/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-amber-200 font-bold">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {claimableTiers[0].icon}{" "}
                  {t(`honey_t${claimableTiers[0].tier}`, claimableTiers[0].title)} (
                  {claimableTiers[0].maxWords} {t("honey_w_abbr", "K.")}) —{" "}
                  {t("dash_completed", "Tamamlandı")}!
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleClaimTierReward(claimableTiers[0])}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>
                  {t("honey_claim_tier_btn", "+{gold} Altın & Kademe Rozeti Al", {
                    gold: claimableTiers[0].rewardGold,
                  })}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Sekme Geçişleri */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 relative z-10 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("open")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "open"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🎁 {t("chest_tab_open")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("collection")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "collection"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>{t("chest_tab_collection")}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950/60 text-amber-300 border border-amber-500/30">
              {unlockedCount}/{totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("epics")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "epics"
                ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>{t("chest_tab_epics")}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950/60 text-purple-200 border border-purple-400/40">
              {unlockedEpicCount}/{totalEpicCount}
            </span>
          </button>
        </div>

        {/* 3. ALT PANEL (AÇIK/BEYAZ KART): SOLDA GENEL KOLEKSİYON DÜZEYİ, SAĞDA SANDIK AÇMA ALANI */}
        {activeTab === "open" && (
          <div className="w-full rounded-3xl bg-slate-50 border-2 border-slate-200 p-4 sm:p-5 text-slate-900 shadow-xl relative z-10 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* SOL TARAF (5/12): GENEL KOLEKSİYON DÜZEYİ + ÖDÜL ÖNİZLEME */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700">
                      {t("honey_collection_level_hdr", "GENEL KOLEKSİYON DÜZEYİ")}
                    </span>
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                      %{collectionPercent}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-900">
                      {unlockedCount} / {totalCount}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {t("honey_collection_unlocked_sub", "Eser & Karakter Açık")}
                    </span>
                  </div>

                  {/* İlerleme Çubuğu */}
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.max(4, collectionPercent)}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {t(
                        "honey_no_duplicate_note",
                        "Garantili yeni ödül • Mükerrer kart çıkmaz"
                      )}
                    </span>
                  </p>
                </div>

                {/* Sandık Açıldığında Yeni Ödül Kartı veya Koleksiyon Kısayolu */}
                {openingState === "revealed" && revealedItem ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-amber-50 border-2 border-amber-400 text-center space-y-2.5 animate-in zoom-in-95 duration-300 shadow-md">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black uppercase">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{t("chest_new_unlocked")}</span>
                    </div>

                    <MuseumArtwork
                      item={revealedItem}
                      size="lg"
                      isSilhouette={false}
                      showPedestal={true}
                      className="mx-auto"
                    />

                    <div>
                      <span className="text-[10px] uppercase font-bold font-mono text-slate-500 block">
                        {getLocalizedRarity(revealedItem.rarity)} • Tier {revealedItem.chestTier}
                      </span>
                      {revealedItem.passiveBuff && (
                        <p className="text-[11px] font-mono font-bold text-indigo-700 mt-0.5">
                          {getLocalizedBuffLabel(
                            revealedItem.passiveBuff.type,
                            revealedItem.passiveBuff.label,
                            language
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleEquipAvatar(revealedItem)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{t("chest_equip_avatar", "Avatar Olarak Seç")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpeningState("idle");
                          setRevealedItem(null);
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                      >
                        {t("btn_confirm")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("collection")}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>
                      {t("honey_open_collection_btn", "Koleksiyonu Gör & Kuşan")} ({unlockedCount}/
                      {totalCount})
                    </span>
                  </button>
                )}
              </div>

              {/* SAĞ TARAF (7/12): AKTİF KADEMEYE UYGUN SANDIK AÇMA ALANI */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-3.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t("honey_chest_zone_hdr", "SANDIK AÇMA ALANI")}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-600">
                    🪙 {gold} {t("games_gold_unit")}
                  </span>
                </div>

                {/* 4 Tematik Sandık Kartı */}
                <div className="grid grid-cols-2 gap-2.5">
                  {CHESTS.map((chest) => {
                    const isSelected = chest.id === selectedChestId;
                    const chestAccess = checkChestAccess(
                      chest,
                      learnedWords,
                      gold,
                      unlockedItemIds
                    );

                    return (
                      <button
                        key={chest.id}
                        type="button"
                        onClick={() => {
                          setSelectedChestId(chest.id);
                          setOpeningState("idle");
                          setRevealedItem(null);
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? "bg-amber-50 border-amber-500 ring-2 ring-amber-300/60 shadow-md"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xl leading-none">{chest.icon}</span>
                          <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                            {chest.costGold} 🪙
                          </span>
                        </div>
                        <div className="mt-2 space-y-0.5">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {getChestShortName(chest)}
                          </h4>
                          <span className="text-[10px] font-mono font-semibold text-slate-600 block">
                            {chest.requiredWords}+ {t("honey_word_lbl", "Kelime")} •{" "}
                            {t("chest_locked_count", undefined, {
                              count: chestAccess.remainingLockedCount,
                            })}
                          </span>
                        </div>
                        {chestAccess.wordLock && (
                          <span className="absolute top-2 right-2 text-[11px]" title="Kilitli">
                            🔒
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Seçili Sandık Durumu & Açılış Butonu */}
                <div className="space-y-2.5 pt-1">
                  <div
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 ${
                      access.allUnlocked
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : access.wordLock
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : access.goldLock
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-emerald-50 border-emerald-300 text-emerald-800"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {access.wordLock ? (
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                      ) : access.goldLock ? (
                        <Coins className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{formatAccessMessage(currentChest, access)}</span>
                    </span>
                    <span className="text-lg shrink-0">
                      {openingState === "shaking" ? "✨" : currentChest.icon}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!access.canOpen || openingState !== "idle"}
                    onClick={handleOpenChest}
                    className={`w-full py-3 px-5 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${
                      access.canOpen && openingState === "idle"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 cursor-pointer"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                    }`}
                  >
                    <span>
                      {access.allUnlocked
                        ? `${t("chest_owned_badge")} ✓`
                        : openingState === "shaking"
                        ? t("chest_unlocking_anim")
                        : `${currentChest.icon} ${getChestShortName(currentChest)} • ${t(
                            "chest_open_btn",
                            undefined,
                            { cost: currentChest.costGold }
                          )}`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEKME 2: 50 KARAKTER & ESER KOLEKSİYONU */}
        {activeTab === "collection" && (
          <div className="space-y-3 animate-in fade-in duration-200 relative z-10">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {BASE_CATEGORY_TABS.map((tab) => {
                const count =
                  tab.id === "all"
                    ? totalCount
                    : BASE_CHEST_ITEMS.filter(
                        (i) => getBaseCollectionGroup(i) === tab.id
                      ).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCollectionCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      collectionCategoryFilter === tab.id
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.id !== "all" && (
                      <span className="text-[10px] opacity-75 font-mono">
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {BASE_CHEST_ITEMS.filter(
                (item) =>
                  collectionCategoryFilter === "all" ||
                  getBaseCollectionGroup(item) === collectionCategoryFilter
              ).map((item) => {
                const isOwned = unlockedItemIds.includes(item.id);
                const isEquipped =
                  selectedAvatarItemId === item.id ||
                  (!selectedAvatarItemId && userProfile?.avatar_url === item.icon);

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border text-center flex flex-col justify-between space-y-2 relative transition ${
                      isEquipped
                        ? "bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/50"
                        : isOwned
                        ? "bg-slate-950/90 border-slate-800 hover:border-indigo-500/50"
                        : "bg-slate-950/40 border-slate-800/60 opacity-75"
                    }`}
                  >
                    <div className="relative mx-auto">
                      <MuseumArtwork
                        item={item}
                        size="md"
                        showPedestal={false}
                        isSilhouette={!isOwned}
                      />
                    </div>

                    <div className="space-y-1">
                      <span
                        className={`text-[9px] font-bold uppercase font-mono block ${
                          isOwned ? rarityColors[item.rarity].text : "text-slate-500"
                        }`}
                      >
                        {isOwned ? getLocalizedRarity(item.rarity) : t("chest_locked_btn")}
                      </span>
                      {item.passiveBuff && (
                        <p className="text-[9px] text-indigo-300/90 leading-tight line-clamp-2">
                          {getLocalizedBuffLabel(
                            item.passiveBuff.type,
                            item.passiveBuff.label,
                            language
                          )}
                        </p>
                      )}
                    </div>

                    <div className="pt-1">
                      {isOwned ? (
                        <button
                          type="button"
                          onClick={() => handleEquipAvatar(item)}
                          className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            isEquipped
                              ? "bg-amber-500 text-slate-950 font-black"
                              : "bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white"
                          }`}
                        >
                          {isEquipped
                            ? t("chest_equipped_btn", "Seçili Avatar ✓")
                            : t("chest_equip_btn", "Avatar Yap")}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono block py-1">
                          Tier {item.chestTier}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEKME 3: EPİK ESERLER & KAHRAMANLAR (100 ÖĞE) */}
        {activeTab === "epics" && (
          <div className="space-y-3 animate-in fade-in duration-200 relative z-10">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {EPIC_CATEGORY_TABS.map((tab) => {
                const count =
                  tab.id === "all"
                    ? totalEpicCount
                    : EPIC_MUSEUM_ITEMS.filter((i) => i.category === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEpicCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      epicCategoryFilter === tab.id
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.id !== "all" && (
                      <span className="text-[10px] opacity-75 font-mono">
                        ({count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {EPIC_MUSEUM_ITEMS.filter(
                (item) =>
                  epicCategoryFilter === "all" ||
                  item.category === epicCategoryFilter
              ).map((item) => {
                const isOwned = unlockedItemIds.includes(item.id);
                const isEquipped =
                  selectedAvatarItemId === item.id ||
                  (!selectedAvatarItemId && userProfile?.avatar_url === item.icon);
                const tierChest =
                  CHESTS.find((c) => c.tier === item.chestTier) || CHESTS[0];
                const locTierChest = getLocalizedChestInfo(
                  tierChest.id,
                  {
                    name: tierChest.name.tr,
                    badge: tierChest.badge,
                    description: tierChest.description,
                  },
                  language
                );

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border text-center flex flex-col justify-between space-y-2 relative transition ${
                      isEquipped
                        ? "bg-amber-500/10 border-amber-400 ring-1 ring-amber-400/50"
                        : isOwned
                        ? "bg-slate-950/90 border-purple-500/35 hover:border-purple-400/70"
                        : "bg-slate-950/50 border-slate-800/70"
                    }`}
                  >
                    <div className="relative mx-auto">
                      <MuseumArtwork
                        item={item}
                        size="md"
                        showPedestal={true}
                        isSilhouette={!isOwned}
                      />
                    </div>

                    <div className="space-y-1">
                      <span
                        className={`text-[9px] font-bold uppercase font-mono block ${
                          isOwned ? rarityColors[item.rarity].text : "text-slate-500"
                        }`}
                      >
                        {isOwned ? getLocalizedRarity(item.rarity) : t("chest_locked_btn")}
                      </span>
                      {isOwned && item.passiveBuff && (
                        <p className="text-[9px] text-purple-300/90 leading-tight line-clamp-2">
                          {getLocalizedBuffLabel(
                            item.passiveBuff.type,
                            item.passiveBuff.label,
                            language
                          )}
                        </p>
                      )}
                    </div>

                    <div className="pt-1">
                      {isOwned ? (
                        <button
                          type="button"
                          onClick={() => handleEquipAvatar(item)}
                          className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            isEquipped
                              ? "bg-amber-500 text-slate-950 font-black"
                              : "bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/40 text-white"
                          }`}
                        >
                          {isEquipped
                            ? t("chest_equipped_btn", "Seçili Avatar ✓")
                            : t("chest_equip_btn", "Avatar Yap")}
                        </button>
                      ) : (
                        <div className="space-y-0.5 py-0.5">
                          <span className="text-[9px] text-amber-300/85 font-semibold block truncate">
                            {locTierChest.name}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono block">
                            {t("chest_milestone_label", undefined, {
                              req: tierChest.requiredWords,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
