"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Coins,
  Shield,
  Lock,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Award,
  BookOpen,
  Volume2,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  STORE_CHARACTERS,
  StoreCharacter,
  getCharacterLocale,
  checkCharacterMilestone,
} from "../../data/characters";
import { unlockCharacter } from "../../actions/unlockCharacter";

export interface ChestShopProps {
  userCoins?: number;
  userLevel?: string;
  completedStoriesCount?: number;
  unlockedCharacterIds?: string[];
  activeAvatarId?: string;
  onCoinsChange?: (newCoins: number) => void;
  onSetAvatar?: (charId: string, icon: string) => void;
  onCharacterUnlocked?: (charId: string) => void;
}

export default function ChestShop({
  userCoins: initialCoins = 1200,
  userLevel = "B1",
  completedStoriesCount = 11,
  unlockedCharacterIds: initialUnlocked = ["char_squire"],
  activeAvatarId = "char_squire",
  onCoinsChange,
  onSetAvatar,
  onCharacterUnlocked,
}: ChestShopProps) {
  const { currentLang = "tr", t } = useLanguage();

  const [userCoins, setUserCoins] = useState<number>(initialCoins);
  const [unlockedIds, setUnlockedIds] = useState<string[]>(initialUnlocked);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(activeAvatarId);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  // Bilgilendirme ve Uyarı Balonları
  const [activeInfoModal, setActiveInfoModal] = useState<{
    char: StoreCharacter;
    reason: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Yeni Açılan Karakter Kutlama Modalı
  const [celebrationChar, setCelebrationChar] = useState<{
    char: StoreCharacter;
    quote: string;
  } | null>(null);

  useEffect(() => {
    setUserCoins(initialCoins);
  }, [initialCoins]);

  useEffect(() => {
    if (initialUnlocked?.length) {
      setUnlockedIds((prev) => Array.from(new Set([...prev, ...initialUnlocked])));
    }
  }, [initialUnlocked]);

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Karakter Satın Alma / Kilit Açma İşlemi (Anti-Tamper Korumalı)
  const handleUnlock = async (char: StoreCharacter) => {
    // 1. Milestone Kontrolü
    const milestone = checkCharacterMilestone(char, userLevel, completedStoriesCount);
    if (!milestone.isUnlocked) {
      setActiveInfoModal({ char, reason: milestone.missingReason });
      showToast(
        `🔒 ${t("shop_milestone_locked", "Bu karakter henüz kilitli!")} ${milestone.missingReason}`,
        "error"
      );
      return;
    }

    // 2. Altın Kontrolü
    if (userCoins < char.priceGold) {
      showToast(
        `🪙 ${t("shop_insufficient_gold", "Yetersiz Altın!")} ${char.priceGold} 🪙 gerekiyor.`,
        "error"
      );
      return;
    }

    try {
      setUnlockingId(char.id);
      const result = await unlockCharacter({
        characterId: char.id,
        userLevel,
        completedStoriesCount,
        language: currentLang,
        userCoins,
      });

      if (result.success) {
        setUserCoins(result.remainingCoins);
        if (onCoinsChange) onCoinsChange(result.remainingCoins);

        const updatedUnlocked = Array.from(new Set([...unlockedIds, char.id]));
        setUnlockedIds(updatedUnlocked);
        if (onCharacterUnlocked) onCharacterUnlocked(char.id);

        // Kutlama modalını tetikle
        const loc = getCharacterLocale(char, currentLang);
        setCelebrationChar({
          char,
          quote: result.unlockQuote || loc.unlockQuote,
        });

        showToast(
          `🎉 ${loc.name} ${t("shop_unlocked_success", "başarıyla açıldı!")}`,
          "success"
        );
      }
    } catch (err: any) {
      console.error("Karakter açma hatası:", err);
      showToast(err.message || "Karakter kilidi açılamadı!", "error");
    } finally {
      setUnlockingId(null);
    }
  };

  const handleSelectAvatar = (char: StoreCharacter) => {
    setSelectedAvatarId(char.id);
    if (onSetAvatar) {
      onSetAvatar(char.id, char.icon);
    }
    const loc = getCharacterLocale(char, currentLang);
    showToast(`🌟 ${loc.name} ${t("shop_avatar_selected", "aktif avatar yapıldı!")}`, "success");
  };

  return (
    <div className="space-y-6" data-testid="chest-shop-container">
      {/* Toast Bildirimi */}
      {toastMessage && (
        <div
          data-testid="shop-toast"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : toastMessage.type === "error"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : "bg-slate-900/90 border-slate-700 text-slate-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMessage.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* 1. ÜST İSTATİSTİK VE KULLANICI BİLGİ ÇUBUĞU */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-indigo-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t("shop_gold_balance", "Altın Bakiyeniz")}
            </span>
            <span
              data-testid="shop-user-coins"
              className="text-lg font-black text-amber-300 font-mono flex items-center gap-1"
            >
              {userCoins} 🪙
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Kullanıcı Seviyesi */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30">
            <Award className="w-4 h-4 text-indigo-400" />
            <div className="text-left">
              <span className="text-[9px] uppercase font-bold text-indigo-300 block">
                {t("shop_user_level", "Mevcut Seviyeniz")}
              </span>
              <span data-testid="shop-user-level" className="text-xs font-black text-white font-mono">
                {userLevel.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Tamamlanan Hikayeler */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <span className="text-[9px] uppercase font-bold text-emerald-300 block">
                {t("shop_completed_stories", "Tamamlanan Okuma")}
              </span>
              <span data-testid="shop-stories-count" className="text-xs font-black text-white font-mono">
                {completedStoriesCount} {t("stories_count_suffix", "Hikaye")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KARAKTER KARTLARI IZGARASI (TR / EN / DE DİNAMİK YERELLEŞTİRME & MILESTONE LOCKS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {STORE_CHARACTERS.map((char) => {
          const loc = getCharacterLocale(char, currentLang);
          const isUnlocked = unlockedIds.includes(char.id);
          const isActiveAvatar = selectedAvatarId === char.id;
          const milestone = checkCharacterMilestone(char, userLevel, completedStoriesCount);
          const canAfford = userCoins >= char.priceGold;
          const isLocked = !isUnlocked && !milestone.isUnlocked;

          return (
            <div
              key={char.id}
              data-testid={`character-card-${char.id}`}
              className={`rounded-3xl border transition-all duration-300 p-4 flex flex-col justify-between relative overflow-hidden backdrop-blur-md ${
                isUnlocked
                  ? "bg-white border-indigo-300 shadow-md hover:shadow-lg hover:-translate-y-1 text-slate-800"
                  : isLocked
                  ? "bg-slate-100/90 border-slate-200/90 opacity-70 grayscale-[30%] text-slate-500"
                  : "bg-white border-slate-200 hover:border-amber-400 hover:-translate-y-0.5 shadow-sm text-slate-800"
              }`}
            >
              {/* Arka Plan Hafif Gradient */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-xl pointer-events-none" />

              {/* Üst Rozetler */}
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 relative z-10">
                <span
                  className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    char.rarity === "legendary"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : char.rarity === "epic"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : char.rarity === "rare"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {char.rarity}
                </span>

                {isActiveAvatar && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{t("shop_active_badge", "Aktif")}</span>
                  </span>
                )}
              </div>

              {/* Vektörel SVG Rozet Alanı */}
              <div className="flex flex-col items-center justify-center my-2 relative">
                <div className="w-20 h-20 rounded-2xl p-1 bg-slate-950/80 border border-slate-800 flex items-center justify-center shadow-inner relative group-hover:scale-105 transition-transform duration-300">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: char.avatarSvg }}
                  />

                  {/* Kilitli Karakter Katmanı */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                      <Lock className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    </div>
                  )}
                </div>

                {/* Karakter İkonu & Unvan */}
                <span className="text-xs font-mono text-indigo-300 font-bold mt-2">
                  {char.icon} {loc.title}
                </span>
              </div>

              {/* Çok Dilli İsim ve Biyografi */}
              <div className="space-y-1 text-center my-2">
                <h3 className="text-sm font-extrabold text-white truncate">
                  {loc.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                  {loc.bio}
                </p>
              </div>

              {/* Milestone Kilidi Göstergesi (Seviye veya Tamamlanan Hikaye Koşulu) */}
              {isLocked ? (
                <div
                  data-testid={`milestone-lock-badge-${char.id}`}
                  onClick={() =>
                    setActiveInfoModal({ char, reason: milestone.missingReason })
                  }
                  className="p-2 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 space-y-1 cursor-pointer hover:bg-rose-950/50 transition my-2"
                  title="Eksik koşulları görüntülemek için tıkla"
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-rose-400" />
                      <span>{t("shop_milestone_locked_label", "Kilitli")}</span>
                    </span>
                    <HelpCircle className="w-3 h-3 text-rose-400 opacity-70" />
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium leading-tight">
                    🔒 {t("shop_unlock_requirement", "Açmak için")}:{" "}
                    <span className="font-bold text-amber-300">
                      {char.requiredLevel || "A1"} {t("shop_level_suffix", "Seviyesi")}
                    </span>{" "}
                    {t("shop_or", "veya")}{" "}
                    <span className="font-bold text-emerald-300">
                      {char.requiredStoriesCount || 0} {t("shop_stories_suffix", "Hikaye")}
                    </span>
                  </p>
                  <div className="text-[9px] font-mono text-slate-400 flex justify-between pt-0.5 border-t border-rose-500/20">
                    <span>{t("shop_current_progress", "Mevcut İlerleme")}:</span>
                    <span className="text-emerald-400 font-bold">
                      {completedStoriesCount}/{char.requiredStoriesCount || 0}
                    </span>
                  </div>
                </div>
              ) : (
                /* Unlocked Quote Rozeti */
                <div className="p-2 rounded-2xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-300 italic my-2 min-h-[42px] flex items-center justify-center text-center">
                  &quot;{loc.unlockQuote}&quot;
                </div>
              )}

              {/* Alt Eylem Butonu */}
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => handleSelectAvatar(char)}
                    disabled={isActiveAvatar}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isActiveAvatar
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95"
                    }`}
                  >
                    {isActiveAvatar ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t("shop_avatar_active_btn", "Seçili Avatar")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t("shop_set_as_avatar_btn", "Avatar Yap")}</span>
                      </>
                    )}
                  </button>
                ) : isLocked ? (
                  <button
                    type="button"
                    disabled
                    onClick={() =>
                      setActiveInfoModal({ char, reason: milestone.missingReason })
                    }
                    className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800/70 text-slate-500 border border-slate-700/60 cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t("shop_locked_btn", "Kilitli (Koşul Eksik)")}</span>
                  </button>
                ) : (
                  /* Milestone Tamamlandı, Satın Alma Aktif */
                  <button
                    type="button"
                    onClick={() => handleUnlock(char)}
                    disabled={unlockingId === char.id || !canAfford}
                    className={`w-full py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                      canAfford
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-95"
                        : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    }`}
                  >
                    {unlockingId === char.id ? (
                      <span className="animate-spin text-sm">⏳</span>
                    ) : (
                      <>
                        <Coins className="w-3.5 h-3.5" />
                        <span>
                          {canAfford
                            ? `${char.priceGold} 🪙 • ${t("shop_unlock_now", "Kilidi Aç")}`
                            : `${t("shop_need_gold", "Yetersiz")} (${char.priceGold} 🪙)`}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. EKSİK KOŞUL / MILESTONE BİLGİLENDİRME MODALI */}
      {activeInfoModal && (
        <div
          data-testid="milestone-info-modal"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveInfoModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  {getCharacterLocale(activeInfoModal.char, currentLang).name}
                </h3>
                <span className="text-[11px] font-bold text-rose-300">
                  {t("shop_milestone_locked_title", "Seviye Kilidi Açılmadı")}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold block">
                {t("shop_required_condition", "Bu karakteri açmak için gereken şart:")}
              </span>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-bold">
                🔒 {activeInfoModal.reason}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t(
                  "shop_milestone_hint",
                  "Okuma Odasında daha fazla hikaye tamamlayarak veya SM-2 kelime tekrarları yaparak seviyenizi yükseltebilirsiniz!"
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveInfoModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              {t("shop_close_modal", "Anladım")}
            </button>
          </div>
        </div>
      )}

      {/* 4. KUTLAMA MODALI (KARAKTER AÇILDIĞINDA) */}
      {celebrationChar && (
        <div
          data-testid="celebration-modal"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setCelebrationChar(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-950 border-2 border-amber-400/60 p-6 shadow-2xl text-center space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-950 border-2 border-amber-400/80 p-2 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: celebrationChar.char.avatarSvg }}
              />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t("shop_celebration_badge", "Yeni Karakter Açıldı!")}</span>
              </span>
              <h3 className="text-lg font-black text-white">
                {getCharacterLocale(celebrationChar.char, currentLang).name}
              </h3>
              <p className="text-xs font-bold text-indigo-300">
                {getCharacterLocale(celebrationChar.char, currentLang).title}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 text-xs text-slate-200 font-semibold italic">
              &quot;{celebrationChar.quote}&quot;
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleSelectAvatar(celebrationChar.char);
                  setCelebrationChar(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                {t("shop_set_as_avatar_now", "Hemen Avatar Yap")}
              </button>
              <button
                type="button"
                onClick={() => setCelebrationChar(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                {t("shop_close", "Kapat")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

