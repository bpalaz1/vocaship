"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Camera, Check, Sparkles, Volume2 } from "lucide-react";

export type CustomAvatarVoiceGender = "female" | "male" | "child";

export interface CustomUserAvatarData {
  name: string;
  gender: CustomAvatarVoiceGender;
  imageDataUrl: string;
  updatedAt: string;
}

export const CUSTOM_AVATAR_STORAGE_KEY = "vocaship_custom_avatar";

interface CustomAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CustomUserAvatarData | null;
  onSave: (data: CustomUserAvatarData) => void;
}

/**
 * Yüklenen görseli localStorage kotasını aşmaması için yüksek kaliteli 512x512 kare/portre DataURL'ye sıkıştırır.
 */
function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.onload = () => {
      const resultStr = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(resultStr);
      img.onload = () => {
        try {
          const maxDim = 512;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(resultStr);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.88);
          resolve(compressed);
        } catch {
          resolve(resultStr);
        }
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  });
}

export default function CustomAvatarModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: CustomAvatarModalProps) {
  const [name, setName] = useState<string>(initialData?.name || "Benim Mentorüm");
  const [gender, setGender] = useState<CustomAvatarVoiceGender>(
    initialData?.gender || "female"
  );
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.imageDataUrl || ""
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "Benim Mentorüm");
      setGender(initialData?.gender || "female");
      setImagePreview(initialData?.imageDataUrl || "");
      setErrorMsg(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Lütfen geçerli bir görsel dosyası (PNG, JPG, WEBP) seçin.");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setImagePreview(dataUrl);
    } catch {
      setErrorMsg("Görsel işlenirken bir hata oluştu. Lütfen başka bir fotoğraf deneyin.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    await handleFileSelect(droppedFile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setErrorMsg("Lütfen önce bir avatar fotoğrafı yükleyin.");
      return;
    }

    const cleanName = name.trim() || "Benim Mentorüm";
    const avatarData: CustomUserAvatarData = {
      name: cleanName,
      gender,
      imageDataUrl: imagePreview,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOM_AVATAR_STORAGE_KEY, JSON.stringify(avatarData));
      }
    } catch (err) {
      console.warn("Could not persist custom avatar to localStorage:", err);
    }

    onSave(avatarData);
    onClose();
  };

  return (
    <div
      data-testid="custom-avatar-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        data-testid="custom-avatar-modal"
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 space-y-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Arka Plan Parıltısı */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Başlık & Kapatma */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Kendi Avatarını Oluştur &amp; Konuş
              </h2>
              <p className="text-[11px] text-slate-400">
                Fotoğrafını yükle, ses tonunu seç ve canlı konuşmaya başla
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* 1. FOTOĞRAF YÜKLEYİCİ (Dosya Seç veya Sürükle-Bırak + Önizleme) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>1. Avatar Fotoğrafı</span>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                >
                  Fotoğrafı Değiştir
                </button>
              )}
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-4 min-h-[180px] overflow-hidden ${
                isDragging
                  ? "border-emerald-400 bg-emerald-500/10"
                  : imagePreview
                  ? "border-emerald-500/60 bg-slate-950/70"
                  : "border-slate-700 hover:border-emerald-500/50 bg-slate-950/50 hover:bg-slate-950/80"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                className="hidden"
                data-testid="custom-avatar-file-input"
              />

              {imagePreview ? (
                <div className="flex flex-col items-center space-y-2.5">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-xl shadow-emerald-500/20">
                    <img
                      src={imagePreview}
                      alt="Özel Avatar Önizleme"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-semibold">
                    Fotoğraf hazır • Değiştirmek için tıklayın veya sürükleyin
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-2 py-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">
                      {isProcessing
                        ? "Fotoğraf işleniyor..."
                        : "Fotoğraf Seç veya Buraya Sürükle-Bırak"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      PNG, JPG veya WEBP • Portre veya kare fotoğraflar önerilir
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. İSİM GİRİŞİ */}
          <div className="space-y-1.5">
            <label
              htmlFor="custom-avatar-name"
              className="text-xs font-bold text-slate-300 block"
            >
              2. Avatar / Mentor İsmi
            </label>
            <input
              id="custom-avatar-name"
              data-testid="custom-avatar-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Benim Mentorüm"
              maxLength={32}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* 3. CİNSİYET VE SES TONU SEÇİCİ */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>3. Ses Tonu &amp; Cinsiyet Seçimi</span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                <span>
                  {gender === "female"
                    ? "Kadın Nöral Ses (Pitch: 1.05)"
                    : gender === "male"
                    ? "Tok Erkek Nöral Ses (Pitch: 0.92)"
                    : "Neşeli Çocuk Sesi (Pitch: 1.20)"}
                </span>
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                data-testid="gender-select-female"
                onClick={() => setGender("female")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  gender === "female"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40 shadow-md"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span className="text-lg">👩</span>
                <span>Kadın</span>
              </button>

              <button
                type="button"
                data-testid="gender-select-male"
                onClick={() => setGender("male")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  gender === "male"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40 shadow-md"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span className="text-lg">👨</span>
                <span>Erkek</span>
              </button>

              <button
                type="button"
                data-testid="gender-select-child"
                onClick={() => setGender("child")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  gender === "child"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40 shadow-md"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span className="text-lg">🧒</span>
                <span>Çocuk</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* 4. KAYDET & AVATARIM YAP BUTONU */}
          <div className="pt-1 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              data-testid="save-custom-avatar-btn"
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Kaydet &amp; Avatarım Yap</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

