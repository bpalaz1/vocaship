"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";
import {
  Sparkles,
  Coins,
  Shield,
  Rocket,
  Crown,
  Lock,
  Check,
  CheckCircle2,
  RefreshCw,
  Zap,
  Info,
  Gift,
  Award,
  ChevronRight,
  Flame,
  ArrowRight,
  UserCheck,
  X
} from "lucide-react";

// Web Audio API Basit Ses Efektleri (Harici MP3 gerektirmez)
const playSoundEffect = (type: "shake" | "open" | "legendary" | "click") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "shake") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "open") {
      // 3 tonlu melodik açılış
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } else if (type === "legendary") {
      // Efsanevi Fanfare
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.6);
      });
    }
  } catch (e) {
    // Ses desteği yoksa sessizce devam et
  }
};

interface CharacterItem {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: string;
  image_url?: string | null;
  description: string;
  chest_theme?: string | null;
  is_unlocked: boolean;
  unlocked_at?: string | null;
}

interface ChestItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  description: string;
  theme: string;
  titleKey: string;
  descKey: string;
  available_characters: string[];
  rarity_rates: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

export default function ShopPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [chests, setChests] = useState<ChestItem[]>([]);
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [userCoins, setUserCoins] = useState<number>(300);
  const [activeAvatar, setActiveAvatar] = useState<string>("🌟");
  const [activeAvatarId, setActiveAvatarId] = useState<string>("char_default");
  const [totalUnlocked, setTotalUnlocked] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [settingAvatarId, setSettingAvatarId] = useState<string | null>(null);

  // Karakter ismi çeviri yardımcısı (Örn: "Köy Okçusu" -> "char_village_archer")
  const getCharacterName = (char: CharacterItem) => {
    if (char.id === "char_archer" || char.name === "Köy Okçusu") {
      return t("char_village_archer", "Köy Okçusu");
    }
    return t(char.id, char.name);
  };

  // Filtreleme Sekmesi
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "unlocked" | "legendary" | "epic" | "rare" | "common"
  >("all");

  // Sandık Açılış Modal Durumları
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [openingPhase, setOpeningPhase] = useState<"shake" | "burst" | "reveal">("shake");
  const [currentOpeningChest, setCurrentOpeningChest] = useState<ChestItem | null>(null);
  const [revealedResult, setRevealedResult] = useState<{
    character: CharacterItem;
    remainingCoins: number;
    isDuplicate: boolean;
    coinsRefunded: number;
    message: string;
  } | null>(null);

  // 1. Verileri Çek
  const fetchShopData = async () => {
    try {
      const [shopRes, charsRes] = await Promise.all([
        fetch(`${API_BASE}/gamification/shop`),
        fetch(`${API_BASE}/gamification/my-characters`),
      ]);

      if (shopRes.ok) {
        const shopData = await shopRes.json();
        const rawChests = shopData.chests || [];
        const enrichedChests: ChestItem[] = rawChests.map((c: any) => ({
          ...c,
          titleKey: `chest_${c.id}_title`,
          descKey: `chest_${c.id}_desc`,
        }));
        setChests(enrichedChests);
        setUserCoins(shopData.user_coins ?? 300);
      }

      if (charsRes.ok) {
        const charsData = await charsRes.json();
        setCharacters(charsData.characters || []);
        setActiveAvatar(charsData.active_avatar || "🌟");
        setActiveAvatarId(charsData.active_avatar_id || "char_default");
        setTotalUnlocked(charsData.total_unlocked || 1);
        if (charsData.total_coins !== undefined) {
          setUserCoins(charsData.total_coins);
        }
      }
    } catch (err) {
      console.error("Mağaza verileri yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  // 2. Sandık Açma İşlemi (Sandık Açma Motoru)
  const handleOpenChest = async (chest: ChestItem) => {
    if (userCoins < chest.price) {
      alert(
        `Yetersiz Altın! ${chest.name} açmak için ${chest.price} 🪙 gerekiyor. Kelime çalışarak veya Gold Quest oynayarak altın kazanabilirsin!`
      );
      return;
    }

    setCurrentOpeningChest(chest);
    setIsOpening(true);
    setOpeningPhase("shake");
    playSoundEffect("shake");

    // Sallanma efekti süresi
    const shakeTimer = setTimeout(async () => {
      playSoundEffect("shake");
    }, 450);

    try {
      const res = await fetch(`${API_BASE}/gamification/open-chest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chest_id: chest.id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Sandık açılamadı");
      }

      const data = await res.json();

      // Patlama aşaması
      setTimeout(() => {
        setOpeningPhase("burst");
        if (data.unlocked_character.rarity === "legendary") {
          playSoundEffect("legendary");
        } else {
          playSoundEffect("open");
        }
      }, 950);

      // Kart Reveal aşaması
      setTimeout(() => {
        setOpeningPhase("reveal");
        setRevealedResult({
          character: data.unlocked_character,
          remainingCoins: data.remaining_coins,
          isDuplicate: data.is_duplicate,
          coinsRefunded: data.coins_refunded,
          message: data.message,
        });
        setUserCoins(data.remaining_coins);

        // Header'daki profili ve Navbar'ı yenile
        window.dispatchEvent(new CustomEvent("quizwise_profile_update"));
      }, 1500);
    } catch (err: any) {
      clearTimeout(shakeTimer);
      setIsOpening(false);
      alert(err.message || "Sandık açılırken hata oluştu!");
    }
  };

  // 3. Avatar Belirleme
  const handleSetAvatar = async (character: CharacterItem) => {
    if (!character.is_unlocked && character.id !== "char_squire") {
      alert("Bu karakter henüz açılmamış! Önce sandıklardan çıkartmalısın.");
      return;
    }

    playSoundEffect("click");
    setSettingAvatarId(character.id);

    try {
      const res = await fetch(`${API_BASE}/gamification/set-avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character_id: character.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveAvatar(data.active_avatar || character.icon);
        setActiveAvatarId(data.active_avatar_id || character.id);

        // Navbar'ı bilgilendir
        window.dispatchEvent(new CustomEvent("quizwise_profile_update"));
      } else {
        const err = await res.json();
        alert(err.detail || "Avatar ayarlanamadı");
      }
    } catch (e) {
      console.error(e);
      alert("Avatar güncellenirken bir sorun oluştu.");
    } finally {
      setSettingAvatarId(null);
    }
  };

  // Modal Kapandığında Listeleri Yenile
  const handleCloseRevealModal = () => {
    setIsOpening(false);
    setRevealedResult(null);
    setCurrentOpeningChest(null);
    fetchShopData();
  };

  // Karakter Filtreleme
  const filteredCharacters = useMemo(() => {
    return characters.filter((c) => {
      if (selectedFilter === "unlocked") return c.is_unlocked;
      if (selectedFilter === "legendary") return c.rarity === "legendary";
      if (selectedFilter === "epic") return c.rarity === "epic";
      if (selectedFilter === "rare") return c.rarity === "rare";
      if (selectedFilter === "common") return c.rarity === "common";
      return true;
    });
  }, [characters, selectedFilter]);

  const rarityColorMap = {
    common: {
      border: "border-slate-700/80 hover:border-blue-500/50",
      bg: "bg-slate-900/60",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      glow: "shadow-blue-500/5",
      titleKey: "rarity_common",
      title: "Yaygın",
    },
    rare: {
      border: "border-emerald-600/50 hover:border-emerald-400/80",
      bg: "bg-gradient-to-b from-emerald-950/30 to-slate-900/80",
      badge: "bg-emerald-500/25 text-emerald-300 border-emerald-500/40",
      glow: "shadow-emerald-500/20 shadow-md",
      titleKey: "rarity_rare",
      title: "Nadir",
    },
    epic: {
      border: "border-purple-500/60 hover:border-purple-400",
      bg: "bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-slate-900",
      badge: "bg-purple-500/30 text-purple-200 border-purple-400/50",
      glow: "shadow-purple-500/30 shadow-lg",
      titleKey: "rarity_epic",
      title: "Destansı",
    },
    legendary: {
      border: "border-amber-400/80 hover:border-amber-300 animate-pulse",
      bg: "bg-gradient-to-b from-amber-950/50 via-yellow-950/30 to-slate-900",
      badge: "bg-amber-500/30 text-amber-200 border-amber-400/60 font-black",
      glow: "shadow-amber-500/40 shadow-xl",
      titleKey: "rarity_legendary",
      title: "Efsanevi",
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-indigo-500 selection:text-white">
      {/* Üst Arkaplan Işık Efektleri */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent pointer-events-none blur-3xl -z-10" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-12">
        {/* ============================================================== */}
        {/* 1. BAŞLIK & CANLI OYUNCU ENVENTAR VE ALTIN SAYACI              */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>✨ Efsanevi Karakterler & Sandık Koleksiyonu</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{t("heading_shop")}</span>
                <span className="text-3xl">🎁</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {t("desc_shop")}
              </p>
            </div>

            {/* Sağ: İstatistik Hapları */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Altın Bakiyesi */}
              <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 shadow-lg shadow-amber-500/10">
                <span className="text-2xl animate-bounce">🪙</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400/80 block">
                    {t("my_gold")}
                  </span>
                  <span className="text-xl font-black font-mono text-amber-200">
                    {userCoins.toLocaleString()} 🪙
                  </span>
                </div>
              </div>

              {/* Aktif Avatar */}
              <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-2xl border border-indigo-500/30 shadow-inner">
                  {activeAvatar}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {t("active_avatar_label")}
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    {(() => {
                      const activeChar = characters.find((c) => c.id === activeAvatarId);
                      return activeChar ? getCharacterName(activeChar) : t("btn_active_avatar", "Seçili Avatar");
                    })()}
                  </span>
                </div>
              </div>

              {/* Koleksiyon Tamamlama Oranı */}
              <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <Award className="w-6 h-6 text-indigo-400" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-300/80 block">
                    {t("collection_label")}
                  </span>
                  <span className="text-sm font-black text-indigo-200">
                    {totalUnlocked} / {characters.length || 22} {t("characters_count")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. BÖLÜM: GİZEMLİ SANDIKLAR (CHEST SHOP)                       */}
        {/* ============================================================== */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Gift className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-black text-white">
                {t("vault_section_title", "Gizemli Sandıklar")}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {t("vault_section_desc", "Her sandık farklı temadaki nadir karakterleri içerir")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chests.map((chest) => {
              const canAfford = userCoins >= chest.price;

              return (
                <div
                  key={chest.id}
                  className={`group relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between border backdrop-blur-xl ${
                    chest.id === "legends"
                      ? "bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 hover:border-amber-400 shadow-xl shadow-amber-500/10"
                      : chest.id === "space"
                      ? "bg-gradient-to-b from-cyan-950/30 via-slate-900 to-slate-900 border-cyan-500/30 hover:border-cyan-400 shadow-lg shadow-cyan-500/10"
                      : "bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/30 hover:border-emerald-400 shadow-lg shadow-emerald-500/10"
                  } hover:-translate-y-1`}
                >
                  {/* Üst Rozet */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-white/10 text-white font-mono">
                      {chest.theme.toUpperCase()}
                    </span>
                    <span className="flex items-center space-x-1 text-sm font-black text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                      <span>🪙</span>
                      <span>{chest.price}</span>
                    </span>
                  </div>

                  {/* Sandık İkonu & Görseli */}
                  <div className="my-6 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-3">
                      <div className="text-7xl sm:text-8xl filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 select-none cursor-pointer">
                        {chest.icon}
                      </div>
                      <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black text-white">
                      {t(chest.titleKey || `chest_${chest.id}_title`, chest.name)}
                    </h3>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2 px-2">
                      {t(chest.descKey || `chest_${chest.id}_desc`, chest.description)}
                    </p>
                  </div>

                  {/* Düşme Oranları (Drop Rates) Çubuğu */}
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 mb-5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>{t("chest_win_chance", "Kazanma Şansları:")}</span>
                      <span className="text-amber-400">
                        {chest.rarity_rates.legendary}% {t("rarity_legendary", "Efsanevi")}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800">
                      <div
                        style={{ width: `${chest.rarity_rates.common}%` }}
                        className="bg-blue-500"
                        title={`${t("rarity_common", "Yaygın")}: %${chest.rarity_rates.common}`}
                      />
                      <div
                        style={{ width: `${chest.rarity_rates.rare}%` }}
                        className="bg-emerald-400"
                        title={`${t("rarity_rare", "Nadir")}: %${chest.rarity_rates.rare}`}
                      />
                      <div
                        style={{ width: `${chest.rarity_rates.epic}%` }}
                        className="bg-purple-500"
                        title={`${t("rarity_epic", "Destansı")}: %${chest.rarity_rates.epic}`}
                      />
                      <div
                        style={{ width: `${chest.rarity_rates.legendary}%` }}
                        className="bg-amber-400 animate-pulse"
                        title={`${t("rarity_legendary", "Efsanevi")}: %${chest.rarity_rates.legendary}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium pt-0.5">
                      <span className="text-blue-400">%{chest.rarity_rates.common} {t("rarity_common", "Yaygın")}</span>
                      <span className="text-emerald-400">%{chest.rarity_rates.rare} {t("rarity_rare", "Nadir")}</span>
                      <span className="text-purple-400">%{chest.rarity_rates.epic} {t("rarity_epic", "Destansı")}</span>
                    </div>
                  </div>

                  {/* Aç Butonu */}
                  <button
                    onClick={() => handleOpenChest(chest)}
                    disabled={!canAfford}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all duration-150 hover:scale-[1.02] active:scale-95 shadow-lg ${
                      canAfford
                        ? chest.id === "legends"
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                    }`}
                  >
                    <span>{canAfford ? t("btn_open_chest") : t("btn_insufficient_gold")}</span>
                    <span>({chest.price} 🪙)</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. BÖLÜM: KARAKTER KOLEKSİYONUM (ENVANTER)                    */}
        {/* ============================================================== */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <Crown className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-black text-white">{t("collection_label")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold font-mono">
                {totalUnlocked}/{characters.length}
              </span>
            </div>

            {/* Filtreleme Sekmeleri */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: t("filter_all") },
                { id: "unlocked", label: t("filter_unlocked") },
                { id: "legendary", label: t("rarity_legendary", "Efsanevi") },
                { id: "epic", label: t("rarity_epic", "Destansı") },
                { id: "rare", label: t("rarity_rare", "Nadir") },
                { id: "common", label: t("rarity_common", "Yaygın") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-150 hover:scale-[1.02] active:scale-95 ${
                    selectedFilter === tab.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Karakter Kartları Izgarası */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCharacters.map((char) => {
              const rarityStyle = rarityColorMap[char.rarity] || rarityColorMap.common;
              const isActive = activeAvatarId === char.id;

              return (
                <div
                  key={char.id}
                  className={`group relative rounded-2xl p-4 flex flex-col items-center justify-between border transition-all duration-200 ${
                    char.is_unlocked
                      ? `${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.glow} hover:-translate-y-1 cursor-pointer`
                      : "bg-slate-950/70 border-slate-800/80 opacity-60 grayscale hover:grayscale-0"
                  }`}
                  onClick={() => char.is_unlocked && handleSetAvatar(char)}
                >
                  {/* Aktif Avatar Rozeti */}
                  {isActive && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-black uppercase shadow-sm">
                        <Check className="w-3 h-3" />
                        <span>{t("active_label", "Aktif")}</span>
                      </span>
                    </div>
                  )}

                  {/* Rarity Rozeti */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${rarityStyle.badge}`}
                    >
                      {t(rarityStyle.titleKey, rarityStyle.title)}
                    </span>
                  </div>

                  {/* Karakter İkonu */}
                  <div className="my-5 relative flex items-center justify-center">
                    <div className="text-5xl group-hover:scale-110 transition-transform select-none">
                      {char.icon}
                    </div>
                    {!char.is_unlocked && (
                      <div className="absolute inset-0 bg-slate-950/80 rounded-xl flex items-center justify-center backdrop-blur-[2px]">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* İsim ve Açıklama */}
                  <div className="w-full text-center space-y-1">
                    <h4 className="text-xs font-black text-white truncate px-1">
                      {getCharacterName(char)}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight h-6">
                      {char.is_unlocked
                        ? char.description
                        : `${t(char.chest_theme ? `chest_${char.chest_theme}_title` : "vault_section_title", "Sandıktan")} ${t("from_chest_suffix", "çıkar.")}`}
                    </p>
                  </div>

                  {/* Alt İşlem Butonu */}
                  <div className="mt-3 w-full">
                    {char.is_unlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAvatar(char);
                        }}
                        disabled={isActive || settingAvatarId === char.id}
                        className={`w-full py-1.5 rounded-xl text-[11px] font-extrabold transition-all duration-150 ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                        }`}
                      >
                        {isActive
                          ? `✓ ${t("btn_active_avatar", "Aktif Avatar")}`
                          : settingAvatarId === char.id
                          ? t("saving", "Kaydediliyor...")
                          : t("btn_set_as_avatar", "Avatarım Yap")}
                      </button>
                    ) : (
                      <div className="py-1 text-center">
                        <span className="text-[10px] font-bold text-slate-400">
                          🔒 {t("locked", "Kilitli")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ============================================================== */}
      {/* 4. SANDIK AÇILMA MODALI (EFSANEVİ ANİMASYON)                    */}
      {/* ============================================================== */}
      {isOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            {/* 1. SALLANMA AŞAMASI (RUMBLE) */}
            {openingPhase === "shake" && currentOpeningChest && (
              <div className="space-y-6 flex flex-col items-center">
                <div className="relative">
                  <div className="text-9xl animate-bounce filter drop-shadow-[0_0_35px_rgba(251,191,36,0.6)] select-none">
                    {currentOpeningChest.icon}
                  </div>
                  <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-amber-300 animate-spin" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-300 animate-pulse">
                    {t("chest_opening", "Sandık Açılıyor...")}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {t("chest_opening_desc", "Büyülü mühür kırılıyor, yeni bir kahraman uyanıyor!")}
                  </p>
                </div>
              </div>
            )}

            {/* 2. PATLAMA AŞAMASI (BURST) */}
            {openingPhase === "burst" && (
              <div className="space-y-4 flex flex-col items-center animate-in zoom-in-50 duration-300">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-white animate-ping opacity-75" />
                <h3 className="text-3xl font-black text-white tracking-widest uppercase">
                  {t("chest_opened", "✨ AÇILDI! ✨")}
                </h3>
              </div>
            )}

            {/* 3. REVEAL AŞAMASI (KART VE KAZANILAN KARAKTER) */}
            {openingPhase === "reveal" && revealedResult && (
              <div
                className={`w-full rounded-3xl p-6 sm:p-8 border shadow-2xl backdrop-blur-2xl animate-in zoom-in-90 duration-300 relative ${
                  revealedResult.character.rarity === "legendary"
                    ? "bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-amber-400 shadow-amber-500/50"
                    : revealedResult.character.rarity === "epic"
                    ? "bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 border-purple-400 shadow-purple-500/40"
                    : revealedResult.character.rarity === "rare"
                    ? "bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-emerald-400 shadow-emerald-500/30"
                    : "bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 border-blue-400 shadow-blue-500/20"
                }`}
              >
                {/* Kapat Butonu */}
                <button
                  onClick={handleCloseRevealModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Üst Rarity Başlığı */}
                <div className="mb-4">
                  <span
                    className={`inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                      revealedResult.character.rarity === "legendary"
                        ? "bg-amber-400 text-slate-950 border-amber-300 animate-bounce"
                        : revealedResult.character.rarity === "epic"
                        ? "bg-purple-500 text-white border-purple-300"
                        : revealedResult.character.rarity === "rare"
                        ? "bg-emerald-400 text-slate-950 border-emerald-300"
                        : "bg-blue-500 text-white border-blue-300"
                    }`}
                  >
                    {revealedResult.character.rarity === "legendary"
                      ? `🌟 ${t("rarity_legendary", "Efsanevi").toUpperCase()} 🌟`
                      : revealedResult.character.rarity === "epic"
                      ? `⚡ ${t("rarity_epic", "Destansı").toUpperCase()} ⚡`
                      : revealedResult.character.rarity === "rare"
                      ? `💎 ${t("rarity_rare", "Nadir").toUpperCase()} 💎`
                      : t("rarity_common", "Yaygın").toUpperCase()}
                  </span>
                </div>

                {/* Karakter İkonu */}
                <div className="my-6 relative flex justify-center">
                  <div className="text-8xl sm:text-9xl filter drop-shadow-2xl animate-pulse select-none">
                    {revealedResult.character.icon}
                  </div>
                </div>

                {/* Karakter Bilgileri */}
                <div className="space-y-2 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {getCharacterName(revealedResult.character)}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                    {revealedResult.character.description}
                  </p>
                </div>

                {/* Kopya / İade Mesajı */}
                {revealedResult.isDuplicate && (
                  <div className="mb-6 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5">
                    <span>🪙</span>
                    <span>{t("duplicate_refund_msg", "Bu karaktere zaten sahiptiniz! +{coins} Altın iade edildi.", { coins: revealedResult.coinsRefunded })}</span>
                  </div>
                )}

                {/* Aksiyon Butonları */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleSetAvatar(revealedResult.character);
                      handleCloseRevealModal();
                    }}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{t("btn_set_as_avatar", "Avatarım Yap")}</span>
                  </button>

                  <button
                    onClick={handleCloseRevealModal}
                    className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/30"
                  >
                    <span>{t("btn_confirm_ok", "Harika, Tamam!")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
