"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Sparkles, Camera, CheckCircle2, Loader2, Link2, Volume2 } from "lucide-react";

export const RPM_AVATAR_GLB_STORAGE_KEY = "vocaship_user_avatar_glb";
export const RPM_AVATAR_META_STORAGE_KEY = "vocaship_user_avatar_meta";

export type RPMAvatarVoiceGender = "female" | "male" | "child";

export interface RPMAvatarMetadata {
  glbUrl: string;
  name: string;
  gender: RPMAvatarVoiceGender;
  createdAt: string;
}

interface RPMCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGlbUrl?: string | null;
  initialGender?: RPMAvatarVoiceGender;
  initialName?: string;
  onAvatarExported: (glbUrl: string, meta: RPMAvatarMetadata) => void;
}

const RPM_STUDIO_IFRAME_URL = "https://readyplayer.me/avatar?frameApi";

export default function RPMCreatorModal({
  isOpen,
  onClose,
  initialGlbUrl,
  initialGender = "male",
  initialName = "Benim Avatarım",
  onAvatarExported,
}: RPMCreatorModalProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [avatarName, setAvatarName] = useState<string>(initialName || "Benim Avatarım");
  const [voiceGender, setVoiceGender] = useState<RPMAvatarVoiceGender>(initialGender);
  const [manualGlbInput, setManualGlbInput] = useState<string>(initialGlbUrl || "");
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIframeLoaded(false);
      setAvatarName(initialName || "Benim Avatarım");
      setVoiceGender(initialGender || "male");
      setManualGlbInput(initialGlbUrl || "");
    }
  }, [isOpen, initialGlbUrl, initialGender, initialName]);

  // Ready Player Me Frame API 'message' dinleyicisi
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      let json: any = null;
      try {
        json = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        // Bazı eski RPM sürümleri doğrudan .glb string URL dönebilir
        if (
          typeof event.data === "string" &&
          event.data.startsWith("http") &&
          event.data.includes(".glb")
        ) {
          finalizeExport(event.data);
        }
        return;
      }

      if (!json) return;

      // Ready Player Me kaynağından gelen mesajları kontrol et
      if (json.source && json.source !== "readyplayerme") return;

      // 1. Frame hazır olduğunda (v1.frame.ready) event.source.postMessage ile abone ol
      if (json.eventName === "v1.frame.ready") {
        const subscribePayload = JSON.stringify({
          target: "readyplayerme",
          type: "subscribe",
          eventName: "v1.**",
        });

        try {
          if (event.source && typeof (event.source as Window).postMessage === "function") {
            (event.source as Window).postMessage(subscribePayload, "*");
          } else {
            iframeRef.current?.contentWindow?.postMessage(subscribePayload, "*");
          }
        } catch {
          iframeRef.current?.contentWindow?.postMessage(subscribePayload, "*");
        }
      }

      // 2. Kullanıcı fotoğrafını çekip avatarı tamamladığında (v1.avatar.exported)
      if (json.eventName === "v1.avatar.exported") {
        const exportedUrl =
          event.data?.url || json?.data?.url || json?.url;
        if (exportedUrl && typeof exportedUrl === "string") {
          localStorage.setItem("vocaship_user_avatar_glb", exportedUrl);
          finalizeExport(exportedUrl);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen, avatarName, voiceGender]);

  const finalizeExport = (rawGlbUrl: string) => {
    const cleanUrl = rawGlbUrl.trim();
    if (!cleanUrl) return;

    // Morph target (viseme + ARKit ağız/göz kırpma) parametrelerini URL'ye ekle (RPM destekliyorsa)
    const enhancedGlbUrl =
      cleanUrl.includes("readyplayer.me") && !cleanUrl.includes("morphTargets")
        ? `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}morphTargets=ARKit,Oculus+Visemes`
        : cleanUrl;

    const meta: RPMAvatarMetadata = {
      glbUrl: enhancedGlbUrl,
      name: avatarName.trim() || "Benim Avatarım",
      gender: voiceGender,
      createdAt: new Date().toISOString(),
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(RPM_AVATAR_GLB_STORAGE_KEY, enhancedGlbUrl);
        localStorage.setItem(RPM_AVATAR_META_STORAGE_KEY, JSON.stringify(meta));
      }
    } catch (err) {
      console.warn("Could not save RPM GLB URL to localStorage:", err);
    }

    onAvatarExported(enhancedGlbUrl, meta);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="rpm-creator-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        data-testid="rpm-creator-modal"
        className="relative w-full max-w-5xl h-[90vh] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ÜST BAR: Başlık, İsim & Ses Tonu Seçimi ve Kapat Butonu */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>Ready Player Me • 3D Avatar Stüdyosu</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Fotoğraftan 3D&apos;ye
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Kameranızla selfie çekin veya fotoğraf yükleyin; sağ üstteki &ldquo;Next / Done&rdquo; butonuna bastığınızda 3D avatarınız otomatik sahneye aktarılır.
              </p>
            </div>
          </div>

          {/* Sağ Kontroller: Cinsiyet Sesi & Kapat */}
          <div className="flex items-center gap-2">
            {/* Ses Tonu Seçici */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 ml-1.5 mr-1" />
              <button
                type="button"
                onClick={() => setVoiceGender("female")}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  voiceGender === "female"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                👩 Kadın Sesi
              </button>
              <button
                type="button"
                onClick={() => setVoiceGender("male")}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  voiceGender === "male"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                👨 Erkek Sesi
              </button>
              <button
                type="button"
                onClick={() => setVoiceGender("child")}
                className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
                  voiceGender === "child"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🧒 Çocuk Sesi
              </button>
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
        </div>

        {/* ORTA ALAN: READY PLAYER ME IFRAME STÜDYOSU */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 z-10">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs font-bold text-slate-200">
                Ready Player Me 3D Avatar Stüdyosu Yükleniyor...
              </p>
              <p className="text-[11px] text-slate-500">
                Kamera izni vererek fotoğrafınızdan saniyeler içinde 3D avatar oluşturabilirsiniz.
              </p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            data-testid="rpm-studio-iframe"
            src="https://readyplayer.me/avatar?frameApi"
            title="Ready Player Me 3D Avatar Creator"
            allow="camera *; microphone *; clipboard-write"
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-full border-0 rounded-b-2xl"
          />
        </div>

        {/* ALT BAR: Hızlı GLB Bağlantısı Yapıştırma / Hazır 3D Model Yükleme */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs z-20">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">
              Stüdyoda tasarımınızı bitirip <strong className="text-emerald-300">Next / Done</strong> butonuna bastığınızda avatarınız otomatik kaydedilir.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowManualInput((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Link2 className="w-3 h-3 text-emerald-400" />
              <span>.GLB Linki Yapıştır</span>
            </button>
          </div>

          {showManualInput && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualGlbInput.trim()) {
                  finalizeExport(manualGlbInput.trim());
                }
              }}
              className="w-full pt-2 flex items-center gap-2"
            >
              <input
                type="url"
                value={manualGlbInput}
                onChange={(e) => setManualGlbInput(e.target.value)}
                placeholder="https://models.readyplayer.me/....glb"
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Avatarı Kaydet</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

