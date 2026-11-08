"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Sparkles,
  Coins,
  Lock,
  Check,
  RotateCcw,
  Shield,
  Zap,
  Wand2,
  Layers,
  Award,
  Flame,
  UserCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  CHESTS,
  CHEST_ITEMS,
  ChestDefinition,
  ChestItem,
  DUST_REWARDS,
  DUST_CRAFT_COST,
  checkChestAccess,
  drawItemFromChest,
  ItemRarity,
} from "../../data/chestItems";
import { usePersona } from "../../context/PersonaContext";

export interface ChestOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  userGold: number;
  userLearnedWords?: number;
  onGoldChange?: (newGold: number) => void;
  onAvatarEquipped?: (avatarUrl: string, name: string) => void;
}

export default function ChestOpenModal({
  isOpen,
  onClose,
  userGold,
  userLearnedWords = 145,
  onGoldChange,
  onAvatarEquipped,
}: ChestOpenModalProps) {
  const { persona, saveUser3DAvatar, setPersona } = usePersona();

  // Aktif Sekme: 'open' | 'collection'
  const [activeTab, setActiveTab] = useState<"open" | "collection">("open");

  // Seçili Sandık
  const [selectedChestId, setSelectedChestId] = useState<string>("chest_tier_2");

  // Kullanıcı Durumları (LocalStorage senkronize)
  const [gold, setGold] = useState<number>(userGold);
  const [learnedWords, setLearnedWords] = useState<number>(userLearnedWords);
  const [magicDust, setMagicDust] = useState<number>(45);
  const [unlockedItemIds, setUnlockedItemIds] = useState<string[]>([
    "fox_sparky",
    "wooden_dict_pen",
  ]);

  // Sandık Açılış Animasyon Durumu
  const [openingState, setOpeningState] = useState<"idle" | "shaking" | "revealed">("idle");
  const [revealedItem, setRevealedItem] = useState<ChestItem | null>(null);
  const [duplicateDustGained, setDuplicateDustGained] = useState<number | null>(null);
  const [craftedSuccessId, setCraftedSuccessId] = useState<string | null>(null);

  // Filtre (Koleksiyon için)
  const [collectionTierFilter, setCollectionTierFilter] = useState<number | "all">("all");

  useEffect(() => {
    setGold(userGold);
  }, [userGold]);

  // LocalStorage'dan verileri yükle
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedDust = localStorage.getItem("vocaship_magic_dust");
      if (savedDust) setMagicDust(parseInt(savedDust, 10) || 0);

      const savedUnlocked = localStorage.getItem("vocaship_unlocked_chest_items");
      if (savedUnlocked) {
        const parsed = JSON.parse(savedUnlocked);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUnlockedItemIds(parsed);
        }
      }

      const savedWords = localStorage.getItem("vocaship_learned_words_count");
      if (savedWords) {
        setLearnedWords(parseInt(savedWords, 10) || userLearnedWords);
      }
    } catch {}
  }, [userLearnedWords]);

  if (!isOpen) return null;

  const currentChest =
    CHESTS.find((c) => c.id === selectedChestId) || CHESTS[0];

  const access = checkChestAccess(currentChest, learnedWords, gold);

  // Sandığı Aç
  const handleOpenChest = () => {
    if (!access.canOpen || openingState !== "idle") return;

    // Altın düş
    const nextGold = Math.max(0, gold - currentChest.costGold);
    setGold(nextGold);
    if (onGoldChange) onGoldChange(nextGold);
    try {
      localStorage.setItem("vocaship_gold", nextGold.toString());
    } catch {}

    // 1 saniyelik sarsıntı animasyonu
    setOpeningState("shaking");
    setRevealedItem(null);
    setDuplicateDustGained(null);

    setTimeout(() => {
      // Eşya çek
      const item = drawItemFromChest(currentChest);
      const isDuplicate = unlockedItemIds.includes(item.id);

      if (isDuplicate) {
        // Mükerrer kart: Sihirli Toza dönüştür
        const dustEarned = DUST_REWARDS[item.rarity];
        setDuplicateDustGained(dustEarned);
        const nextDust = magicDust + dustEarned;
        setMagicDust(nextDust);
        try {
          localStorage.setItem("vocaship_magic_dust", nextDust.toString());
        } catch {}
      } else {
        // Yeni eşya: Envantere ekle
        const nextUnlocked = [...unlockedItemIds, item.id];
        setUnlockedItemIds(nextUnlocked);
        try {
          localStorage.setItem(
            "vocaship_unlocked_chest_items",
            JSON.stringify(nextUnlocked)
          );
        } catch {}
      }

      setRevealedItem(item);
      setOpeningState("revealed");

      confetti({
        particleCount: item.rarity === "legendary" ? 120 : 60,
        spread: 80,
      });
    }, 950);
  };

  // Avatar Kuşan
  const handleEquipAvatar = (item: ChestItem) => {
    if (item.type !== "avatar") return;

    if (item.id === "fox_sparky") {
      setPersona("sparky");
    } else if (item.id === "chicken_chuck") {
      setPersona("chuck");
    } else if (item.id === "knight_leo") {
      setPersona("leo");
    } else if (item.id === "desert_nomad_alex") {
      setPersona("alex");
    } else if (item.id === "quantum_agent_sarah") {
      setPersona("sarah");
    } else if (item.id === "judge_harrison") {
      setPersona("mr_harrison");
    } else {
      // Özel koleksiyon avatarı
      saveUser3DAvatar(item.image, {
        url: item.image,
        name: item.name.tr,
        gender: "male",
        createdAt: new Date().toISOString(),
      });
    }

    if (onAvatarEquipped) {
      onAvatarEquipped(item.image, item.name.tr);
    }
  };

  // 100 Toz ile Sentezle (Crafting)
  const handleCraftItem = (item: ChestItem) => {
    if (magicDust < DUST_CRAFT_COST || unlockedItemIds.includes(item.id)) return;

    const nextDust = magicDust - DUST_CRAFT_COST;
    setMagicDust(nextDust);
    const nextUnlocked = [...unlockedItemIds, item.id];
    setUnlockedItemIds(nextUnlocked);
    setCraftedSuccessId(item.id);

    try {
      localStorage.setItem("vocaship_magic_dust", nextDust.toString());
      localStorage.setItem(
        "vocaship_unlocked_chest_items",
        JSON.stringify(nextUnlocked)
      );
    } catch {}

    confetti({ particleCount: 50, spread: 60 });
    setTimeout(() => setCraftedSuccessId(null), 2500);
  };

  const rarityColors: Record<ItemRarity, { border: string; glow: string; text: string; bg: string }> = {
    common: {
      border: "border-slate-500",
      glow: "shadow-[0_0_20px_rgba(148,163,184,0.3)]",
      text: "text-slate-300",
      bg: "bg-slate-500/15",
    },
    rare: {
      border: "border-cyan-500",
      glow: "shadow-[0_0_25px_rgba(6,182,212,0.4)]",
      text: "text-cyan-300",
      bg: "bg-cyan-500/15",
    },
    epic: {
      border: "border-purple-500",
      glow: "shadow-[0_0_30px_rgba(168,85,247,0.4)]",
      text: "text-purple-300",
      bg: "bg-purple-500/15",
    },
    legendary: {
      border: "border-amber-400",
      glow: "shadow-[0_0_40px_rgba(251,191,36,0.5)]",
      text: "text-amber-300",
      bg: "bg-amber-500/20",
    },
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in select-none overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl shadow-indigo-950/60 text-slate-100 space-y-5 animate-in zoom-in-95 duration-200 relative my-auto overflow-hidden"
      >
        {/* Dekoratif Işık Hüzmeleri */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Üst Bar: Başlık, Bakiyeler & Kapat */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-inner text-xl">
              🎁
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Sandık Mağazası & Gacha</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  50 Parça
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                1000 kelimelik yolculukta sandıkları aç, maskotları ve ekipmanları topla!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Altın Bakiyesi */}
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
              <span>🪙</span>
              <span>{gold}</span>
            </div>

            {/* Sihirli Toz Bakiyesi */}
            <div className="px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{magicDust} Toz</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* İki Sekmeli Navigasyon: [ 🎁 Sandık Aç ] | [ 🔮 Koleksiyon & Sentez (Crafting) ] */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("open")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "open"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🎁 Sandık Aç</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("collection")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "collection"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>🔮 Koleksiyon & Sentez (Crafting)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300">
              {unlockedItemIds.length}/50
            </span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* SEKME 1: SANDIK AÇILIŞ SAHNESİ                                        */}
        {/* ===================================================================== */}
        {activeTab === "open" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* 4 Sandık Seçici Butonları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHESTS.map((chest) => {
                const isSelected = chest.id === selectedChestId;
                const chestAccess = checkChestAccess(chest, learnedWords, gold);

                return (
                  <button
                    key={chest.id}
                    type="button"
                    onClick={() => {
                      setSelectedChestId(chest.id);
                      setOpeningState("idle");
                      setRevealedItem(null);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? "bg-slate-950 border-amber-500 ring-2 ring-amber-500/40 shadow-lg"
                        : "bg-slate-950/60 hover:bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-xl">{chest.icon}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-300">
                        {chest.costGold}🪙
                      </span>
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {chest.name.tr.replace(/^[^\s]+\s*/, "")}
                      </h4>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {chest.requiredWords} Kelime Barajı
                      </span>
                    </div>

                    {chestAccess.wordLock && (
                      <span className="absolute top-2 right-2 text-xs">🔒</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Orta Sahne: Seçili Sandık Görseli & Açılış Animasyonu */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] shadow-inner">
              {/* Çıkan Eşya Kartı */}
              {openingState === "revealed" && revealedItem ? (
                <div className="space-y-4 animate-in zoom-in-95 duration-300 max-w-sm">
                  {/* Mükerrer Kart Uyarısı */}
                  {duplicateDustGained !== null && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Zaten Sahipsin! ✦ +{duplicateDustGained} Sihirli Toza Dönüştü!</span>
                    </div>
                  )}

                  {/* Eşya Vitrini */}
                  <div
                    className={`w-28 h-28 mx-auto rounded-3xl p-3 border-2 ${
                      rarityColors[revealedItem.rarity].border
                    } ${rarityColors[revealedItem.rarity].glow} ${
                      rarityColors[revealedItem.rarity].bg
                    } flex items-center justify-center text-5xl relative`}
                  >
                    {revealedItem.type === "avatar" && revealedItem.image.startsWith("/") ? (
                      <img
                        src={revealedItem.image}
                        alt={revealedItem.name.tr}
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                    ) : (
                      <span>{revealedItem.icon}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-slate-400">
                      {revealedItem.type === "avatar" ? "👤 Maskot Avatarı" : "🛡️ Efsanevi Ekipman"}
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {revealedItem.name.tr}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xs mx-auto">
                      {revealedItem.description.tr}
                    </p>
                    {revealedItem.bonusEffect && (
                      <p className="text-[11px] font-mono text-emerald-400 font-bold">
                        ✦ {revealedItem.bonusEffect.tr}
                      </p>
                    )}
                  </div>

                  {/* Butonlar */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {revealedItem.type === "avatar" && (
                      <button
                        type="button"
                        onClick={() => handleEquipAvatar(revealedItem)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Avatarım Olarak Kuşan</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setOpeningState("idle");
                        setRevealedItem(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                    >
                      Tekrar Aç
                    </button>
                  </div>
                </div>
              ) : (
                /* Sandık ve Kilit Durumu */
                <div className="space-y-4 max-w-md">
                  <div
                    className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${
                      currentChest.accentGradient
                    } border-2 border-white/20 flex items-center justify-center text-5xl shadow-2xl transition-transform ${
                      openingState === "shaking" ? "animate-bounce" : "hover:scale-105"
                    }`}
                  >
                    <span>{currentChest.icon}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      {currentChest.name.tr}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {currentChest.description}
                    </p>
                  </div>

                  {/* Çifte Kilit Durum Rozeti (Dual-Gate Algorithm) */}
                  <div className="pt-1">
                    {access.wordLock ? (
                      <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4 text-rose-400" />
                        <span>{access.message}</span>
                      </div>
                    ) : access.goldLock ? (
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>{access.message}</span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>{access.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Açma Butonu */}
                  <button
                    type="button"
                    disabled={!access.canOpen || openingState !== "idle"}
                    onClick={handleOpenChest}
                    className={`w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                      access.canOpen
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30 ring-2 ring-amber-400/50"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <span>{openingState === "shaking" ? "Açılıyor..." : "Sandığı Aç"}</span>
                    <span>({currentChest.costGold} 🪙)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SEKME 2: 50 PARÇALIK KOLEKSİYON & SİHİRLİ TOZ SENTEZİ (CRAFTING)      */}
        {/* ===================================================================== */}
        {activeTab === "collection" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sentez Bilgi Çubuğu */}
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-purple-200">
                  Mükerrer kartlardan kazandığın <b>Sihirli Tozlarla</b> 100 Toz karşılığında istediğin eksik kartı anında sentezle!
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-purple-500/40 font-mono font-bold text-purple-300 shrink-0">
                <span>✦ Bakiyen: {magicDust} Toz</span>
              </div>
            </div>

            {/* Kategori Filtresi */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCollectionTierFilter("all")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  collectionTierFilter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                Tümü (50)
              </button>
              {CHESTS.map((c) => (
                <button
                  key={c.tier}
                  type="button"
                  onClick={() => setCollectionTierFilter(c.tier)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    collectionTierFilter === c.tier
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  {c.name.tr}
                </button>
              ))}
            </div>

            {/* 50 Kartlık Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {CHEST_ITEMS.filter(
                (item) =>
                  collectionTierFilter === "all" ||
                  item.chestTier === collectionTierFilter
              ).map((item) => {
                const isOwned = unlockedItemIds.includes(item.id);
                const isCraftedJustNow = craftedSuccessId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border text-center flex flex-col justify-between space-y-2 relative transition ${
                      isOwned
                        ? "bg-slate-950/90 border-slate-800"
                        : "bg-slate-950/40 border-slate-800/60 opacity-75"
                    }`}
                  >
                    {/* Görsel / İkon */}
                    <div
                      className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-2xl relative ${
                        isOwned
                          ? rarityColors[item.rarity].bg
                          : "bg-slate-900 border border-slate-800"
                      }`}
                    >
                      {item.type === "avatar" && item.image.startsWith("/") ? (
                        <img
                          src={item.image}
                          alt={item.name.tr}
                          className="w-full h-full object-contain filter drop-shadow"
                        />
                      ) : (
                        <span>{item.icon}</span>
                      )}

                      {!isOwned && (
                        <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                      )}
                    </div>

                    {/* Bilgi */}
                    <div className="space-y-0.5">
                      <span className={`text-[9px] font-bold uppercase font-mono ${rarityColors[item.rarity].text}`}>
                        {item.rarity}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate" title={item.name.tr}>
                        {item.name.tr}
                      </h4>
                    </div>

                    {/* Alt Eylemler */}
                    <div className="pt-1">
                      {isCraftedJustNow ? (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          ✓ Sentezlendi!
                        </span>
                      ) : isOwned ? (
                        item.type === "avatar" ? (
                          <button
                            type="button"
                            onClick={() => handleEquipAvatar(item)}
                            className="w-full py-1 px-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
                          >
                            Kuşan
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">
                            ✓ Sahipsin
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          disabled={magicDust < DUST_CRAFT_COST}
                          onClick={() => handleCraftItem(item)}
                          className="w-full py-1 px-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 disabled:opacity-40 border border-purple-500/40 text-purple-200 hover:text-white text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1"
                          title="100 Sihirli Toz ile Sentezle"
                        >
                          <Wand2 className="w-2.5 h-2.5" />
                          <span>100 Toz</span>
                        </button>
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
