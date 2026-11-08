"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Sparkles,
  Camera,
  Upload,
  Check,
  Loader2,
  RefreshCw,
  User,
  Wand2,
  Palette,
  Volume2
} from "lucide-react";
import confetti from "canvas-confetti";
import { API_BASE } from "../../config";

export interface AvatarStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  onAvatarChanged?: (newAvatarUrl: string) => void;
}

interface PresetCharacter {
  id: string;
  name: string;
  title: string;
  gender: "male" | "female";
  image: string;
  icon: string;
  badge: string;
  desc: string;
}

const PRESET_CHARACTERS: PresetCharacter[] = [
  {
    id: "sparky",
    name: "Sparky",
    title: "Sevimli Tilki",
    gender: "male",
    image: "/avatars/sparky.png",
    icon: "🦊",
    badge: "Kids A1-A2",
    desc: "Neşeli, enerjik ve çocuk dostu maskot",
  },
  {
    id: "leo",
    name: "Leo",
    title: "Günlük Pratik Koçu",
    gender: "male",
    image: "/avatars/leo.png",
    icon: "🧑‍🏫",
    badge: "Genel A2-B1",
    desc: "Samimi sohbet ve pratik İngilizce mentoru",
  },
  {
    id: "alex",
    name: "Alex",
    title: "Doğa & Kültür Koçu",
    gender: "male",
    image: "/avatars/alex.png",
    icon: "🧔",
    badge: "Macera B1-B2",
    desc: "Kültürel gizemler ve problem çözme rehberi",
  },
  {
    id: "sarah",
    name: "Sarah",
    title: "Senior Project Controls Director",
    gender: "female",
    image: "/avatars/sarah.png",
    icon: "👩‍💼",
    badge: "İş Dünyası C1",
    desc: "C-Level yöneticilik ve kurumsal İngilizce lideri",
  },
  {
    id: "mr_harrison",
    name: "Mr. Harrison",
    title: "Senior Legal Arbitrator",
    gender: "male",
    image: "/avatars/mr_harrison.png",
    icon: "👨‍⚖️",
    badge: "Hukuk C1-C2",
    desc: "FIDIC sözleşmeleri ve uluslararası tahkim uzmanı",
  },
];

export default function AvatarStudioModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onAvatarChanged,
}: AvatarStudioModalProps) {
  const [activeTab, setActiveTab] = useState<"preset" | "ai_custom">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("leo");

  // Tab 2 (Kendi Fotoğrafın & 3D Oyun Karakteri Dönüşümü)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [genderChoice, setGenderChoice] = useState<"male" | "female">("male");
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [transformedResultUrl, setTransformedResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quotaNotice, setQuotaNotice] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Modal kapandığında kamerayı durdur
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleStartCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 512, height: 512, facingMode: "user" },
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setErrorMessage("Kamera erişimi başlatılamadı. Lütfen fotoğraf yükleme seçeneğini kullanın.");
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, 512, 512);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera_snapshot.jpg", { type: "image/jpeg" });
        setUploadedFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setTransformedResultUrl(null);
        stopCamera();
      }
    }, "image/jpeg", 0.95);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP).");
      return;
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setTransformedResultUrl(null);
    stopCamera();
  };

  // 3D Oyun Karakterine Dönüştür
  const handleTransformTo3D = async () => {
    if (!uploadedFile) {
      setErrorMessage("Lütfen önce bir fotoğraf yükleyin veya kamerayla çekin.");
      return;
    }

    setIsTransforming(true);
    setErrorMessage(null);
    setQuotaNotice(false);

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("gender", genderChoice);

    try {
      const targetEndpoint = `${API_BASE}/api/v1/avatar/transform`;
      const fallbackEndpoint = `${API_BASE}/avatar/transform`;

      let res = await fetch(targetEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // İkinci rotayı dene
        res = await fetch(fallbackEndpoint, {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) {
        let detailMsg = `Dönüştürme başarısız (HTTP ${res.status})`;
        let isQuota = res.status === 429;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            detailMsg = errData.detail;
            if (
              detailMsg.includes("429") ||
              detailMsg.includes("RESOURCE_EXHAUSTED") ||
              detailMsg.includes("kota")
            ) {
              isQuota = true;
            }
          }
        } catch (_) {}

        if (isQuota) {
          setQuotaNotice(true);
          return;
        }

        setErrorMessage(detailMsg);
        return;
      }

      const data = await res.json();
      const finalUrl = data.transformed_avatar_url || data.data_url || data.url || data.avatar_url;

      if (!finalUrl) {
        setErrorMessage("Görsel verisi alınamadı. Lütfen tekrar deneyin.");
        return;
      }

      setTransformedResultUrl(finalUrl);

      try {
        confetti({ particleCount: 50, spread: 65, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err: any) {
      console.error("3D Avatar Dönüştürme Hatası:", err);
      const msg = err?.message || "";
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("kota")) {
        setQuotaNotice(true);
      } else {
        setErrorMessage(
          msg ||
          "AI görsel dönüşümü sırasında bir sorun oluştu. Lütfen tekrar deneyin veya hazır karakterlerden seçin."
        );
      }
    } finally {
      setIsTransforming(false);
    }
  };

  // Avatarı Kaydet & Uygula
  const handleApplyAvatar = (urlToApply: string) => {
    try {
      localStorage.setItem("vocaship_custom_avatar", urlToApply);
      localStorage.setItem("vocaship_avatar_type", activeTab === "preset" ? "preset" : "3d_custom");
      window.dispatchEvent(
        new CustomEvent("vocaship:avatar-updated", { detail: { url: urlToApply } })
      );
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    if (onAvatarChanged) {
      onAvatarChanged(urlToApply);
    }

    try {
      confetti({ particleCount: 40, spread: 60 });
    } catch (e) {}

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="avatar-studio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl bg-slate-950 border-2 border-indigo-500/40 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Üst Bar */}
        <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shadow-inner">
              <Palette className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Avatar Stüdyosu</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  3D Studio
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Profil karakterinizi belirleyin veya kendi fotoğrafınızı 3D oyun karakterine dönüştürün
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Sekme Seçici */}
        <div className="bg-slate-900/60 p-2 border-b border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("preset");
              stopCamera();
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
              activeTab === "preset"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hazır Karakterler</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai_custom")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 ${
              activeTab === "ai_custom"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-300" />
            <span>Fotoğraf Yükle & 3D Karakter Yap</span>
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="flex-1 min-h-[340px] max-h-[60vh] overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {quotaNotice ? (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-medium space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <span className="text-lg leading-none">💡</span>
                <div className="space-y-1">
                  <p className="font-bold text-amber-300">
                    Google AI Görsel Motoru Kota Bilgilendirmesi (429)
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Google Gemini görsel üretim modeli şu an yoğun veya ücretsiz kota sınırında. Ekran kilitlenmeden, dilerseniz Vocaship&apos;in popüler 3D hazır karakterlerinden birini anında seçip profilinize uygulayabilirsiniz.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("preset");
                    setQuotaNotice(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Hazır Karakterlere Göz At (Sparky, Leo, Alex, Sarah, Mr. Harrison) ➔</span>
                </button>
              </div>
            </div>
          ) : errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* =================================================================== */}
          {/* SEKME 1: HAZIR KARAKTERLER                                          */}
          {/* =================================================================== */}
          {activeTab === "preset" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Aşağıdaki karakterlerden birini seçerek anında profilinize uygulayabilirsiniz:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_CHARACTERS.map((char) => {
                  const isSelected = selectedPresetId === char.id;
                  return (
                    <div
                      key={char.id}
                      onClick={() => setSelectedPresetId(char.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 relative overflow-hidden group select-none ${
                        isSelected
                          ? "bg-indigo-950/70 border-indigo-400 shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-500/30"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {/* Avatar Görseli */}
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0">
                        <Image
                          src={char.image}
                          alt={char.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Bilgiler */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors truncate">
                            {char.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                            {char.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                          {char.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {char.desc}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="absolute right-2 top-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* SEKME 2: KENDİ FOTOĞRAFINI YÜKLE & 3D ÇİZGİ FİLME DÖNÜŞTÜR           */}
          {/* =================================================================== */}
          {activeTab === "ai_custom" && (
            <div className="space-y-4">
              {/* Cinsiyet Seçimi */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Karakter Cinsiyeti & Ses Tonu:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGenderChoice("male")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                      genderChoice === "male"
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>👨 Erkek Karakter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenderChoice("female")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                      genderChoice === "female"
                        ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>👩 Kadın Karakter</span>
                  </button>
                </div>
              </div>

              {/* Kamera veya Dosya Yükleme Alanı */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                {!previewUrl && !isCameraActive && (
                  <div className="p-6 rounded-3xl bg-slate-900/80 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Bir Portre Fotoğrafı Seçin</h4>
                      <p className="text-xs text-slate-400">
                        Yüzünüzün net göründüğü bir selfie veya vesikalık fotoğraf yükleyin
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Fotoğraf Yükle</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Kamera Aç</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Aktif Kamera Ekranı */}
                {isCameraActive && (
                  <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-indigo-500/50 flex flex-col items-center p-3">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-64 h-64 object-cover rounded-2xl"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Fotoğraf Çek</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Yüklenen Fotoğraf Önizlemesi & Dönüşüm Durumu */}
                {previewUrl && !isCameraActive && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-5 p-4 rounded-3xl bg-slate-900 border border-slate-800">
                    {/* Orijinal Fotoğraf */}
                    <div className="flex flex-col items-center space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Kaynak Fotoğraf
                      </span>
                      <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-black border-2 border-slate-700 shadow-md">
                        <Image
                          src={previewUrl}
                          alt="Kaynak"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setUploadedFile(null);
                          setTransformedResultUrl(null);
                        }}
                        className="text-[11px] text-slate-500 hover:text-rose-400 underline transition cursor-pointer"
                      >
                        Farklı Fotoğraf Seç
                      </button>
                    </div>

                    <div className="text-indigo-400 font-mono text-xl hidden sm:block">➔</div>

                    {/* AI Çıktısı */}
                    <div className="flex flex-col items-center space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>3D Oyun Karakteri</span>
                      </span>
                      <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/50 flex items-center justify-center shadow-lg">
                        {transformedResultUrl ? (
                          <Image
                            src={transformedResultUrl}
                            alt="3D Oyun Karakteri"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : isTransforming ? (
                          <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-indigo-300">
                                3D Oyun Karakteriniz Çiziliyor...
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Google GenAI
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-3 text-slate-500 text-xs">
                            <Wand2 className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                            <span>Dönüştürmek için aşağıdaki butona basın</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dönüştür Butonu */}
                {previewUrl && !transformedResultUrl && (
                  <button
                    type="button"
                    disabled={isTransforming}
                    onClick={handleTransformTo3D}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {isTransforming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>✨ AI 3D Karakterini Çiziyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>✨ 3D Oyun Karakterine Dönüştür</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Alt Aksiyon Butonları */}
        <footer className="h-16 shrink-0 bg-slate-900 border-t border-slate-800 px-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            İptal
          </button>

          {activeTab === "preset" ? (
            <button
              type="button"
              onClick={() => {
                const found = PRESET_CHARACTERS.find((c) => c.id === selectedPresetId);
                if (found) {
                  handleApplyAvatar(found.image);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Seçili Karakteri Uygula</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!transformedResultUrl}
              onClick={() => {
                if (transformedResultUrl) {
                  handleApplyAvatar(transformedResultUrl);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>3D Karakteri Profilime Kaydet ➔</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

