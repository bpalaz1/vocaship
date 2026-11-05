"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Camera, Sparkles, CheckCircle2, Volume2, RefreshCw, Box } from "lucide-react";

export const VOCASHIP_CUSTOM_3D_AVATAR_KEY = "vocaship_custom_3d_avatar";
export const VOCASHIP_CUSTOM_AVATAR_KEY = "vocaship_custom_avatar";
export const VOCASHIP_CUSTOM_3D_META_KEY = "vocaship_custom_3d_meta";

export type VoiceGenderOption = "female" | "male" | "child";

export interface Transform3DAvatarMeta {
  url: string;
  name: string;
  gender: VoiceGenderOption;
  createdAt: string;
}

interface Transform3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string | null;
  initialName?: string;
  initialGender?: VoiceGenderOption;
  onAvatarCreated: (url: string, meta: Transform3DAvatarMeta) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Tarayıcı tarafında da yedek olarak çalışabilen 3D Low-Poly Faceted Origami Canvas dönüştürücü.
 * Backend çevrimdışı olsa bile sıfır maliyetle anında 3D poligon portre üretir.
 */
async function renderClientSideLowPoly3D(sourceDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 480;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(sourceDataUrl);
        return;
      }

      // Merkez kare kırpma
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

      const imgData = ctx.getImageData(0, 0, size, size).data;

      // Arka planı koyu stüdyo tonuna temizle
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, size, size);

      const step = 18;
      const cols = Math.floor(size / step) + 1;
      const rows = Math.floor(size / step) + 1;
      const vertices: { x: number; y: number }[][] = [];

      for (let r = 0; r <= rows; r++) {
        const rowPts: { x: number; y: number }[] = [];
        for (let c = 0; c <= cols; c++) {
          let bx = Math.min(size - 1, c * step);
          let by = Math.min(size - 1, r * step);
          if (r > 0 && r < rows && c > 0 && c < cols) {
            const jx = Math.sin(r * 3.7 + c * 5.3) * (step * 0.34);
            const jy = Math.cos(r * 4.1 - c * 2.9) * (step * 0.34);
            bx = Math.max(0, Math.min(size - 1, Math.round(bx + jx)));
            by = Math.max(0, Math.min(size - 1, Math.round(by + jy)));
          }
          rowPts.push({ x: bx, y: by });
        }
        vertices.push(rowPts);
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p00 = vertices[r][c];
          const p10 = vertices[r][c + 1];
          const p01 = vertices[r + 1][c];
          const p11 = vertices[r + 1][c + 1];

          const tris = [
            [p00, p10, p11],
            [p00, p11, p01],
          ];

          tris.forEach((tri, tIdx) => {
            const cx = Math.max(
              0,
              Math.min(size - 1, Math.round((tri[0].x + tri[1].x + tri[2].x) / 3))
            );
            const cy = Math.max(
              0,
              Math.min(size - 1, Math.round((tri[0].y + tri[1].y + tri[2].y) / 3))
            );
            const pIdx = (cy * size + cx) * 4;
            const rCol = imgData[pIdx];
            const gCol = imgData[pIdx + 1];
            const bCol = imgData[pIdx + 2];

            const shade = tIdx === 0 ? 1.09 : 0.91;
            const dist =
              Math.hypot(cx - size / 2, cy - size / 2) / (size * 0.72);
            const vignette = Math.max(0.4, 1 - Math.pow(dist, 1.85) * 0.52);
            const factor = shade * vignette;

            const fr = Math.min(255, Math.round(rCol * factor));
            const fg = Math.min(255, Math.round(gCol * factor));
            const fb = Math.min(255, Math.round(bCol * factor));

            ctx.beginPath();
            ctx.moveTo(tri[0].x, tri[0].y);
            ctx.lineTo(tri[1].x, tri[1].y);
            ctx.lineTo(tri[2].x, tri[2].y);
            ctx.closePath();
            ctx.fillStyle = `rgb(${fr}, ${fg}, ${fb})`;
            ctx.fill();
            ctx.lineWidth = 0.65;
            ctx.strokeStyle = `rgba(${Math.round(fr * 0.85)}, ${Math.min(
              255,
              Math.round(fg * 0.92 + 10)
            )}, ${Math.min(255, Math.round(fb * 0.96 + 16))}, 0.55)`;
            ctx.stroke();
          });
        }
      }

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}

export default function Transform3DModal({
  isOpen,
  onClose,
  initialUrl,
  initialName = "3D Avatarım",
  initialGender = "male",
  onAvatarCreated,
}: Transform3DModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [transformedUrl, setTransformedUrl] = useState<string | null>(initialUrl || null);
  const [avatarName, setAvatarName] = useState<string>(initialName || "3D Avatarım");
  const [voiceGender, setVoiceGender] = useState<VoiceGenderOption>(initialGender || "male");
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTransformedUrl(initialUrl || null);
      setAvatarName(initialName || "3D Avatarım");
      setVoiceGender(initialGender || "male");
      setErrorMsg(null);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, initialUrl, initialName, initialGender]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 60);
    } catch {
      setErrorMsg("Kameraya erişilemedi. Lütfen bir fotoğraf dosyası seçin.");
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 512;
    canvas.height = video.videoHeight || 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setSourcePreview(dataUrl);
    setTransformedUrl(null);
    canvas.toBlob((blob) => {
      if (blob) {
        setSelectedFile(new File([blob], "camera_selfie.jpg", { type: "image/jpeg" }));
      }
    }, "image/jpeg");
    stopCamera();
  };

  const handleFilePicked = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Lütfen geçerli bir resim dosyası (PNG, JPG, WEBP) seçin.");
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    setTransformedUrl(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSourcePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTransformTo3D = async () => {
    if (!selectedFile && !sourcePreview) {
      setErrorMsg("Lütfen önce bir portre fotoğrafı yükleyin veya kamerayla çekin.");
      return;
    }

    setIsTransforming(true);
    setErrorMsg(null);

    try {
      let fileToUpload = selectedFile;
      if (!fileToUpload && sourcePreview) {
        const resBlob = await fetch(sourcePreview);
        const blob = await resBlob.blob();
        fileToUpload = new File([blob], "portrait.png", { type: "image/png" });
      }

      if (fileToUpload) {
        const formData = new FormData();
        formData.append("file", fileToUpload);

        const res = await fetch(`${API_BASE}/api/v1/speaking/transform-avatar-3d`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const finalUrl = data.data_url || data.url || data.avatar_url;
          if (finalUrl) {
            setTransformedUrl(finalUrl);
            setIsTransforming(false);
            return;
          }
        }
      }

      // Yedek: İstemci tarafı Low-Poly 3D Faceted Origami dönüşümü
      if (sourcePreview) {
        const local3D = await renderClientSideLowPoly3D(sourcePreview);
        setTransformedUrl(local3D);
      }
    } catch {
      if (sourcePreview) {
        const local3D = await renderClientSideLowPoly3D(sourcePreview);
        setTransformedUrl(local3D);
      } else {
        setErrorMsg("3D dönüşüm sırasında bir hata oluştu.");
      }
    } finally {
      setIsTransforming(false);
    }
  };

  const handleUseAvatar = () => {
    const finalAvatarUrl = transformedUrl || sourcePreview;
    if (!finalAvatarUrl) return;

    const meta: Transform3DAvatarMeta = {
      url: finalAvatarUrl,
      name: avatarName.trim() || "3D Avatarım",
      gender: voiceGender,
      createdAt: new Date().toISOString(),
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(VOCASHIP_CUSTOM_AVATAR_KEY, finalAvatarUrl);
        localStorage.setItem(VOCASHIP_CUSTOM_3D_AVATAR_KEY, finalAvatarUrl);
        localStorage.setItem(VOCASHIP_CUSTOM_3D_META_KEY, JSON.stringify(meta));
      }
    } catch (err) {
      console.warn("Could not store 3D avatar in localStorage:", err);
    }

    onAvatarCreated(finalAvatarUrl, meta);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="transform-3d-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        data-testid="transform-3d-modal"
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ÜST BAŞLIK */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide text-white">
                🧊 3D Poligon Avatar Stüdyosu (Fotoğraftan 3D&apos;ye)
              </h2>
              <p className="text-[11px] text-slate-400">
                Portre fotoğrafınızı hacimsel stüdyo ışıklı 3D Low-Poly Faceted Origami heykelsi avatara dönüştürün.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GÖVDE */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* İsim ve Ses Tonu Seçimi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Avatar İsmi
              </label>
              <input
                type="text"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                placeholder="Örn: 3D Mentorüm"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ses Tonu</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setVoiceGender("female")}
                  className={`py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    voiceGender === "female"
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  👩 Kadın
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender("male")}
                  className={`py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    voiceGender === "male"
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  👨 Erkek
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender("child")}
                  className={`py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    voiceGender === "child"
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🧒 Çocuk
                </button>
              </div>
            </div>
          </div>

          {/* Yükleme / Kamera / 3D Önizleme Sahnesi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Sol: Fotoğraf Yükleme veya Kamera */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFilePicked(e.dataTransfer.files[0]);
                }
              }}
              className={`relative h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition overflow-hidden ${
                dragActive
                  ? "border-cyan-400 bg-cyan-950/30"
                  : "border-slate-700 bg-slate-950/70 hover:border-slate-600"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFilePicked(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {isCameraActive ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={captureFromCamera}
                    className="absolute bottom-2 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                  >
                    📸 Fotoğrafı Çek
                  </button>
                </div>
              ) : sourcePreview ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={sourcePreview}
                    alt="Yüklenen Portre"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-bold cursor-pointer"
                    >
                      Değiştir
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold cursor-pointer"
                    >
                      Kamera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-cyan-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200">
                      Selfie / Portre Fotoğrafınızı Sürükleyin
                    </p>
                    <p className="text-[11px] text-slate-500">
                      veya bilgisayarınızdan / kameranızdan seçin
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
                    >
                      Dosya Seç
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Kamera</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sağ: 3D Low-Poly Faceted Origami Önizleme & Dönen Küp Animasyonu */}
            <div className="relative h-64 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner">
              {isTransforming ? (
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border-2 border-cyan-400 flex items-center justify-center animate-spin shadow-[0_0_25px_rgba(34,211,238,0.45)]">
                    <Box className="w-7 h-7 text-cyan-300" />
                  </div>
                  <p className="text-xs font-bold text-cyan-300 animate-pulse">
                    3D Poligon Yüzeyler Hesaplanıyor...
                  </p>
                  <p className="text-[10px] text-slate-500 max-w-[200px]">
                    Hacimsel stüdyo ışığı ve keskin origami poligon fasetleri uygulanıyor
                  </p>
                </div>
              ) : transformedUrl ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    data-testid="transformed-3d-avatar-preview"
                    src={transformedUrl}
                    alt="3D Poligon Avatar Önizleme"
                    className="w-full h-full object-cover rounded-xl border border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.25)]"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/50 text-cyan-300 text-[10px] font-black">
                    🧊 3D Low-Poly Hazır
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-2 px-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-400">
                    3D Poligon Önizleme Sahnesi
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Fotoğraf seçtikten sonra <strong className="text-cyan-300">&ldquo;✨ 3D Poligon Avatara Dönüştür&rdquo;</strong> butonuna basın.
                  </p>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Alt Aksiyon Butonları */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              data-testid="run-transform-3d-btn"
              disabled={(!selectedFile && !sourcePreview) || isTransforming}
              onClick={handleTransformTo3D}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              {isTransforming ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>✨ 3D Poligon Avatara Dönüştür</span>
            </button>

            <button
              type="button"
              data-testid="use-transformed-3d-avatar-btn"
              disabled={!transformedUrl && !sourcePreview}
              onClick={handleUseAvatar}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Bu Avatarı Kullan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

