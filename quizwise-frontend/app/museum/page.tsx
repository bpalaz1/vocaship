"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Trophy,
  Lock,
  Unlock,
  Coins,
  ArrowRight,
  Flame,
  Check,
  CheckCircle2,
  X,
  RotateCcw,
  Zap,
  Crown,
  ChevronRight,
  BookOpen,
  Mic,
  Home,
  Shield,
  Layers,
} from "lucide-react";
import {
  MUSEUM_ITEMS,
  MUSEUM_SALONS,
  MuseumItem,
  MuseumSalonId,
  getUnlockedMuseumItemIds,
  unlockMuseumItem,
  getMagicDust,
  updateMagicDust,
} from "../data/museumItems";
import MuseumArtwork from "../components/shop/MuseumArtwork";
import VocabHoneycombWidget from "../components/museum/VocabHoneycombWidget";
import { useProfile } from "../context/ProfileContext";
import { awardGamificationReward } from "../utils/gamificationEngine";

export default function MuseumPage() {
  const { userProfile, updateAvatar } = useProfile();

  // Koleksiyon & Kaynak State'leri
  const [unlockedIds, setUnlockedIds] = useState<string[]>(["hero_01"]);
  const [activeSalonId, setActiveSalonId] = useState<MuseumSalonId>(1);
  const [magicDust, setMagicDustState] = useState<number>(0);
  const [userGold, setUserGold] = useState<number>(240);
  const [learnedWordsCount, setLearnedWordsCount] = useState<number>(145);

  // Modallar & Geri Bildirim
  const [selectedItem, setSelectedItem] = useState<MuseumItem | null>(null);
  const [chestOpenModal, setChestOpenModal] = useState<{
    salonId: MuseumSalonId;
    reward: MuseumItem;
    isDuplicate: boolean;
    dustEarned: number;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verileri Başlat
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUnlockedIds(getUnlockedMuseumItemIds());
      setMagicDustState(getMagicDust());

      const savedGold = parseInt(localStorage.getItem("vocaship_gold") || "240", 10);
      setUserGold(isNaN(savedGold) ? 240 : savedGold);

      const savedWords = parseInt(localStorage.getItem("vocaship_learned_words") || "145", 10);
      setLearnedWordsCount(isNaN(savedWords) ? 145 : savedWords);
    }

    const handleDustUpdated = (e: any) => {
      setMagicDustState(e.detail?.dust ?? getMagicDust());
    };

    const handleGoldUpdated = (e: any) => {
      setUserGold(e.detail?.gold ?? 240);
    };

    window.addEventListener("vocaship_dust_updated", handleDustUpdated);
    window.addEventListener("vocaship_gold_updated", handleGoldUpdated);

    return () => {
      window.removeEventListener("vocaship_dust_updated", handleDustUpdated);
      window.removeEventListener("vocaship_gold_updated", handleGoldUpdated);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Salonların Kilit Durumu (Pacing Curve Kontrolü)
  const salonUnlockStatus = useMemo(() => {
    const s1Items = MUSEUM_ITEMS.filter((i) => i.salonId === 1);
    const s2Items = MUSEUM_ITEMS.filter((i) => i.salonId === 2);
    const s3Items = MUSEUM_ITEMS.filter((i) => i.salonId === 3);

    const s1UnlockedCount = s1Items.filter((i) => unlockedIds.includes(i.id)).length;
    const s2UnlockedCount = s2Items.filter((i) => unlockedIds.includes(i.id)).length;
    const s3UnlockedCount = s3Items.filter((i) => unlockedIds.includes(i.id)).length;

    const s1Percent = (s1UnlockedCount / 25) * 100;
    const s2Percent = (s2UnlockedCount / 25) * 100;
    const s3Percent = (s3UnlockedCount / 25) * 100;

    // Salon 1: Daima açık
    const s1Unlocked = true;
    // Salon 2: Salon 1 >= %60 (15 eser) VEYA 100 kelime
    const s2Unlocked = s1Percent >= 60 || learnedWordsCount >= 100;
    // Salon 3: Salon 2 >= %60 VEYA 300 kelime
    const s3Unlocked = s2Unlocked && (s2Percent >= 60 || learnedWordsCount >= 300);
    // Salon 4: Salon 3 >= %60 VEYA 600 kelime
    const s4Unlocked = s3Unlocked && (s3Percent >= 60 || learnedWordsCount >= 600);

    return {
      1: { isUnlocked: s1Unlocked, progress: s1UnlockedCount, total: 25 },
      2: { isUnlocked: s2Unlocked, progress: s2UnlockedCount, total: 25 },
      3: { isUnlocked: s3Unlocked, progress: s3UnlockedCount, total: 25 },
      4: {
        isUnlocked: s4Unlocked,
        progress: MUSEUM_ITEMS.filter((i) => i.salonId === 4 && unlockedIds.includes(i.id)).length,
        total: 25,
      },
    };
  }, [unlockedIds, learnedWordsCount]);

  // Aktif Salondaki 25 Eser
  const currentSalonItems = useMemo(() => {
    return MUSEUM_ITEMS.filter((item) => item.salonId === activeSalonId);
  }, [activeSalonId]);

  const activeSalonConfig = MUSEUM_SALONS.find((s) => s.id === activeSalonId) || MUSEUM_SALONS[0];

  // Salon Sandığı Açma İşlemi
  const handleOpenSalonChest = (salonId: MuseumSalonId) => {
    const salon = MUSEUM_SALONS.find((s) => s.id === salonId);
    if (!salon) return;

    if (userGold < salon.chestCostGold) {
      showToast(`⚠️ Yetersiz Altın! Bu sandığı açmak için ${salon.chestCostGold} Altın gerekir.`);
      return;
    }

    // Altın Harca
    const newGold = userGold - salon.chestCostGold;
    setUserGold(newGold);
    if (typeof window !== "undefined") {
      localStorage.setItem("vocaship_gold", String(newGold));
    }

    // Bu salondan rastgele bir eser seç
    const candidateItems = MUSEUM_ITEMS.filter((i) => i.salonId === salonId);
    const picked = candidateItems[Math.floor(Math.random() * candidateItems.length)];

    const isDuplicate = unlockedIds.includes(picked.id);

    if (isDuplicate) {
      // Mükerrer Eser: Sihirli Toza dönüştür (+25 veya +50)
      const dustEarned = picked.dustValue || 25;
      const nextDust = updateMagicDust(dustEarned);
      setMagicDustState(nextDust);

      setChestOpenModal({
        salonId,
        reward: picked,
        isDuplicate: true,
        dustEarned,
      });
    } else {
      // Yeni Eser: Kilidi Aç
      const updated = unlockMuseumItem(picked.id);
      setUnlockedIds(updated);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      setChestOpenModal({
        salonId,
        reward: picked,
        isDuplicate: false,
        dustEarned: 0,
      });
    }
  };

  // Sihirli Toz ile Sentezleme (100 Toz ile Kilitli Eser Açma)
  const handleSynthesizeItem = (item: MuseumItem) => {
    if (magicDust < 100) {
      showToast("⚠️ Yetersiz Sihirli Toz! Bir eseri sentezlemek için 100 Toz gerekir.");
      return;
    }

    // 100 Toz Harca
    const nextDust = updateMagicDust(-100);
    setMagicDustState(nextDust);

    // Kilidi Aç
    const updated = unlockMuseumItem(item.id);
    setUnlockedIds(updated);

    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {}

    showToast(`✨ Başarıyla Sentezlendi: "${item.title}" artık müzenizde açık!`);
  };

  // Avatar Yap / Kuşan
  const handleEquipAvatar = (item: MuseumItem) => {
    updateAvatar(item.avatarIcon);
    showToast(`👑 Avatar başarıyla güncellendi: "${item.title}"`);
  };

  // Toplam Müze İlerlemesi (100 Üzerinden)
  const totalUnlockedCount = unlockedIds.length;
  const totalProgressPercent = Math.min(100, Math.round((totalUnlockedCount / 100) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ======================================================================= */}
      {/* 1. ÜST NAVİGASYON ŞERİDİ                                               */}
      {/* ======================================================================= */}
      <nav className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Oyun Arenasına Dön"
            >
              <Home className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                  Vocaship Grand Müzesi
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">
                  100 Eserlik Bütünleşik Başarı & Sergi Salonu
                </p>
              </div>
            </div>
          </div>

          {/* Sağ Kaynak Göstergeleri: Altın & Sihirli Toz */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Altın */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-mono">{userGold}</span>
              <span className="text-[10px] text-amber-400/80 hidden sm:inline">Altın</span>
            </div>

            {/* Sihirli Toz */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-200 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-mono">{magicDust}</span>
              <span className="text-[10px] text-purple-300/80 hidden sm:inline">Toz</span>
            </div>

            <Link
              href="/games"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1"
            >
              <span>Arenaya Dön</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* TOAST BİLDİRİMİ */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 border border-indigo-400 flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. ANA İÇERİK ALANI                                                    */}
      {/* ======================================================================= */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8 flex-1">
        {/* ÜST: SM-2 KELİME HAKİMİYET PETEĞİ (HONEYCOMB) */}
        <VocabHoneycombWidget learnedWordsCount={learnedWordsCount} />

        {/* GENEL KOLEKSİYON İLERLEME ÇUBUĞU */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 font-mono">
              GENEL MÜZE TOPLAMA DÜZEYİ
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {totalUnlockedCount} / 100
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold font-mono">
                %{totalProgressPercent} Eser Açık
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-md space-y-1">
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 transition-all duration-500 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                style={{ width: `${totalProgressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right">
              Her 100 Sihirli Toz ile dilediğin eseri doğrudan sentezleyebilirsin.
            </p>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. 4 SALON SEÇİCİ SEKMELERİ (Pacing Curve Destekli)                    */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MUSEUM_SALONS.map((salon) => {
            const status = salonUnlockStatus[salon.id];
            const isSelected = activeSalonId === salon.id;

            return (
              <button
                key={salon.id}
                type="button"
                onClick={() => {
                  if (status.isUnlocked) {
                    setActiveSalonId(salon.id);
                  } else {
                    showToast(
                      `🔒 ${salon.title} henüz kilitli! Açmak için önceki salonun %60'ını topla veya ${salon.requiredLearnedWords} kelime öğren.`
                    );
                  }
                }}
                className={`p-4 rounded-3xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[120px] relative overflow-hidden group ${
                  isSelected
                    ? "bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/15 scale-[1.02]"
                    : status.isUnlocked
                    ? "bg-slate-900/70 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
                    : "bg-slate-950/60 border-slate-800/60 opacity-60 hover:opacity-80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{salon.icon}</span>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                        {salon.badge}
                      </span>
                      <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition">
                        {salon.title}
                      </h3>
                    </div>
                  </div>
                  {!status.isUnlocked && (
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                  <span className="font-mono text-slate-400">
                    {status.progress} / {status.total} Eser
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-bold">
                    {salon.chestCostGold} 🪙 / Sandık
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ===================================================================== */}
        {/* 4. AKTİF SALON BAŞLIĞI VE SANDIK AÇMA BUTONU                          */}
        {/* ===================================================================== */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <span>{activeSalonConfig.badge}</span>
              <span>•</span>
              <span>25 Epik Eser</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{activeSalonConfig.icon}</span>
              <span>{activeSalonConfig.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {activeSalonConfig.subtitle}
            </p>
          </div>

          {/* Sandık Açma Eylemi */}
          <button
            type="button"
            onClick={() => handleOpenSalonChest(activeSalonId)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Sandık Aç ({activeSalonConfig.chestCostGold} 🪙)</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* 5. 25 ESERLİK VİTRİN IZGARASI (GRID)                                  */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {currentSalonItems.map((item) => {
            const isUnlocked = unlockedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-between text-center gap-2 cursor-pointer group ${
                  isUnlocked
                    ? "bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-amber-400/60 shadow-lg hover:scale-105"
                    : "bg-slate-950/70 border-slate-850 opacity-70 hover:opacity-100 hover:border-slate-700"
                }`}
              >
                {/* Eser SVG Sanatı (Açık veya Karartılmış Silüet) */}
                <MuseumArtwork
                  item={item}
                  isSilhouette={!isUnlocked}
                  size="md"
                  showPedestal={true}
                />

                <div className="w-full space-y-0.5 pt-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                    {isUnlocked ? item.title : "???"}
                  </h4>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.2 rounded-full uppercase font-bold inline-block ${
                      isUnlocked
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-950 text-slate-500"
                    }`}
                  >
                    {isUnlocked ? item.rarity : "Kilitli"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ======================================================================= */}
      {/* 6. ESER DETAY / SENTEZLEME / KUŞANMA MODALI                            */}
      {/* ======================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative text-center">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Büyük Eser Görseli */}
            <div className="pt-2 flex justify-center">
              <MuseumArtwork
                item={selectedItem}
                isSilhouette={!unlockedIds.includes(selectedItem.id)}
                size="lg"
                showPedestal={true}
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                {selectedItem.rarity} • Salon {selectedItem.salonId}
              </span>
              <h3 className="text-xl font-black text-white">
                {unlockedIds.includes(selectedItem.id) ? selectedItem.title : "Gizemli Kilitli Eser"}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedItem.description}
              </p>
            </div>

            {/* Hikaye Anlatısı (Lore) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 font-bold block uppercase">
                📜 Kadim Hikaye (Lore)
              </span>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{selectedItem.storyLore}"
              </p>
            </div>

            {/* Butonlar: Kuşan veya 100 Toz ile Sentezle */}
            <div className="flex flex-col gap-2 pt-2">
              {unlockedIds.includes(selectedItem.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    handleEquipAvatar(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>👑 Kuşan / Profil Avatarı Yap</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={magicDust < 100}
                  onClick={() => {
                    handleSynthesizeItem(selectedItem);
                    setSelectedItem(null);
                  }}
                  className={`w-full py-3 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    magicDust >= 100
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>✨ 100 Toz ile Sentezle ve Aç ({magicDust}/100 Toz)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 7. SANDIK AÇILIŞ SONUCU MODALI                                         */}
      {/* ======================================================================= */}
      {chestOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative text-center">
            {/* Konfeti / Başlık */}
            <div className="space-y-1">
              <span className="text-4xl block animate-bounce">
                {chestOpenModal.isDuplicate ? "✨" : "🎉"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {chestOpenModal.isDuplicate ? "Mükerrer Eser Dönüşümü!" : "Yeni Eser Keşfedildi!"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {chestOpenModal.isDuplicate
                  ? `Bu eser koleksiyonunda zaten vardı. Sandık gücü bu eseri +${chestOpenModal.dustEarned} Sihirli Toza dönüştürdü!`
                  : `Tebrikler! Koleksiyonuna yeni bir parça eklendi.`}
              </p>
            </div>

            {/* Eser Görseli */}
            <div className="py-2 flex justify-center">
              <MuseumArtwork
                item={chestOpenModal.reward}
                isSilhouette={false}
                size="lg"
                showPedestal={true}
              />
            </div>

            <div className="space-y-0.5">
              <h4 className="text-base font-black text-amber-300">
                {chestOpenModal.reward.title}
              </h4>
              <p className="text-xs text-slate-400">
                {chestOpenModal.reward.description}
              </p>
            </div>

            {/* Eylem Butonları */}
            <div className="flex flex-col gap-2 pt-2">
              {!chestOpenModal.isDuplicate && (
                <button
                  type="button"
                  onClick={() => {
                    handleEquipAvatar(chestOpenModal.reward);
                    setChestOpenModal(null);
                  }}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>Hemen Kuşan / Avatar Yap</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setChestOpenModal(null)}
                className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                Müzeye Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

