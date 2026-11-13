"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Camera,
  Upload,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
  Crop,
} from "lucide-react";
import { useProfile } from "../../context/ProfileContext";

export interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 10 Standart İsimsiz Avatar (5 Kadın, 5 Erkek/Karakter)
// KESİNLİKLE hiçbir isim veya unvan içermez; yalnızca 1-10 arası sıra numarası taşır.
const STANDARD_AVATARS = [
  { id: 1, path: "/avatars/presets/avatar_01.svg" },
  { id: 2, path: "/avatars/presets/avatar_02.svg" },
  { id: 3, path: "/avatars/presets/avatar_03.svg" },
  { id: 4, path: "/avatars/presets/avatar_04.svg" },
  { id: 5, path: "/avatars/presets/avatar_05.svg" },
  { id: 6, path: "/avatars/presets/avatar_06.svg" },
  { id: 7, path: "/avatars/presets/avatar_07.svg" },
  { id: 8, path: "/avatars/presets/avatar_08.svg" },
  { id: 9, path: "/avatars/presets/avatar_09.svg" },
  { id: 10, path: "/avatars/presets/avatar_10.svg" },
];

export default function AvatarPickerModal({
  isOpen,
  onClose,
}: AvatarPickerModalProps) {
  const { userProfile, updateAvatar } = useProfile();

  const [activeTab, setActiveTab] = useState<"standard" | "upload" | "camera">("standard");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("/avatars/presets/avatar_01.svg");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Kamera Durumları
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Yükleme Durumları
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);

  // Referanslar
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modal açıldığında mevcut avatarı seç
  useEffect(() => {
    if (isOpen) {
      if (userProfile.avatar_url) {
        setSelectedAvatar(userProfile.avatar_url);
      }
      setSaveSuccess(false);
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, userProfile.avatar_url]);

  // Sekme değiştiğinde kamerayı durdur
  useEffect(() => {
    if (activeTab !== "camera") {
      stopCamera();
    }
  }, [activeTab]);

  // Bileşen kapandığında kamerayı kesinlikle durdur
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tarayıcınız kamera erişimini desteklemiyor.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: "user",
        },
        audio: false,
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Kamera başlatma hatası:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Kamera izni reddedildi. Lütfen tarayıcı izinlerinden kameraya izin verin.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("Cihazınızda kullanılabilir kamera bulunamadı.");
      } else {
        setCameraError(err.message || "Kamera başlatılamadı. Lütfen tekrar deneyin.");
      }
      setIsCameraActive(false);
    }
  };

  // Video elementine stream bağlama
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive, cameraStream]);

  // Selfie Yakalama (Kare ve dairesel merkezli kırpma)
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = 400;
    canvas.height = 400;

    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;

    // Dairesel kırpma için kareyi orantılı al
    ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedPhoto(dataUrl);
    setSelectedAvatar(dataUrl);
    stopCamera();
  };

  // Dosyadan Fotoğraf Yükleme
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setUploadedPhoto(result);
        setSelectedAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Avatarı Kaydet
  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    setIsSaving(true);
    try {
      await updateAvatar(selectedAvatar);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.warn("Avatar kayıt hatası:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dekoratif Işıltı Efektleri */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        {/* Modal Başlığı */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                Avatar Stüdyosu
              </h2>
              <p className="text-[11px] text-slate-400">
                10 standart portreden birini seçin veya kendi fotoğrafınızı yükleyin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canlı Dairesel Önizleme Alanı */}
        <div className="relative z-10 px-6 pt-5 pb-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3.5">
            {/* 36x36 / 72x72 Yuvarlak Önizleme */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-indigo-600/30 to-violet-600/20 border-2 border-indigo-400/60 shadow-xl flex items-center justify-center overflow-hidden shrink-0 relative group">
              {selectedAvatar && (selectedAvatar.startsWith("http") || selectedAvatar.startsWith("/") || selectedAvatar.startsWith("data:")) ? (
                <img
                  src={selectedAvatar}
                  alt="Seçili Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">{selectedAvatar || "🦊"}</span>
              )}
            </div>

            {/* Kullanıcı Bilgi Etiketi (Profil adı daima kendi username değeri kalır) */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-tight">
                {userProfile.full_name || "Kullanıcı"}
              </span>
              <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                @{userProfile.username || "kullanici"}
              </span>
              <span className="text-[10px] text-slate-400">
                Profil adınız seçtiğiniz avatardan etkilenmez
              </span>
            </div>
          </div>

          {/* Sekme Seçici Butonları */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("standard")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "standard"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              10 Standart
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "upload"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Yükle</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("camera");
                startCamera();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "camera"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Selfie</span>
            </button>
          </div>
        </div>

        {/* Gövde İçeriği */}
        <div className="relative z-10 p-6 min-h-[290px] flex flex-col justify-center">
          {/* ========================================================================= */}
          {/* 1. SEKME: 10 STANDART İSİMSİZ AVATAR VİTRİNİ                             */}
          {/* ========================================================================= */}
          {activeTab === "standard" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  Modern 2D Portreler (5 Kadın • 5 Erkek)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">10 Seçenek</span>
              </div>

              {/* 10 İsimsiz Şık Kutu Grid'i (Yalnızca 1-10 numara, ASLA isim yazmaz) */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
                {STANDARD_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.path;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.path)}
                      className={`relative aspect-square rounded-2xl p-1.5 border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg shadow-indigo-500/20 scale-105"
                          : "bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700"
                      }`}
                      title={`Standart Avatar #${avatar.id}`}
                    >
                      {/* Numara Rozeti (1 - 10) */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded-md bg-slate-900/80 border border-slate-800 text-[9px] font-mono font-bold text-slate-400">
                        #{avatar.id}
                      </span>

                      {/* Seçili İkon Onayı */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}

                      {/* 2D Vektörel Portre */}
                      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center p-1">
                        <img
                          src={avatar.path}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. SEKME: DOSYADAN / GALERİDEN FOTOĞRAF YÜKLE                             */}
          {/* ========================================================================= */}
          {activeTab === "upload" && (
            <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadedPhoto ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/60 shadow-2xl relative">
                    <img
                      src={uploadedPhoto}
                      alt="Yüklenen Fotoğraf"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Farklı Fotoğraf Seç</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-sm border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 transition cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Fotoğraf Yüklemek İçin Dokunun
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG veya WebP • Otomatik dairesel ortalanır
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. SEKME: CANLI SELFIE ÇEK                                                */}
          {/* ========================================================================= */}
          {activeTab === "camera" && (
            <div className="flex flex-col items-center justify-center py-2 text-center space-y-3">
              {/* Kamera Hata Durumu */}
              {cameraError && (
                <div className="w-full max-w-md p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 text-left">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Canlı Video veya Çekilen Fotoğraf */}
              {capturedPhoto ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/60 shadow-2xl relative">
                    <img
                      src={capturedPhoto}
                      alt="Çekilen Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedPhoto(null);
                        startCamera();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tekrar Çek</span>
                    </button>
                  </div>
                </div>
              ) : isCameraActive ? (
                <div className="flex flex-col items-center space-y-3">
                  {/* Dairesel Kılavuz Çerçeveli Video Akışı */}
                  <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-indigo-500/80 shadow-2xl bg-black">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    {/* Dairesel Hizalama Kılavuzu */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/30 transition cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Fotoğrafı Yakala (Snap)</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 py-4">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Kamerayı Başlat</span>
                  </button>
                  <p className="text-xs text-slate-400">
                    Selfie çekmek için tarayıcınızın kamera iznini onaylayın
                  </p>
                </div>
              )}

              {/* Gizli Canvas (Kare ortalama ve snapshot için) */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>

        {/* Alt Çubuk / Kaydet Butonu */}
        <div className="relative z-10 px-6 py-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Avatar başarıyla kaydedildi!
              </span>
            ) : (
              "Seçtiğiniz avatar anında tüm platforma yansır"
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleSaveAvatar}
              disabled={isSaving || !selectedAvatar}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Avatarı Kaydet</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

