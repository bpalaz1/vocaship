"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Minus,
  FileText,
  Upload,
  Timer,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Highlighter,
  PenTool,
  Eraser,
  Trash2,
  Hand,
  Check,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorUp,
  AlertCircle,
  Send,
  Square,
  Circle,
  Ruler,
  ChevronDown,
  Power,
  ArrowUpRight,
  Type,
  Camera,
  Crosshair,
} from "lucide-react";
import confetti from "canvas-confetti";
import BoardTimer from "./components/BoardTimer";
import SendMaterialModal from "../../components/classroom/SendMaterialModal";
import ClassLiveQRModal from "../../components/classroom/ClassLiveQRModal";
import { useProfile } from "../../context/ProfileContext";
import { useLanguage } from "../../context/LanguageContext";

export type BoardDrawingTool =
  | "pan"
  | "none"
  | "highlighter"
  | "pen_red"
  | "pen_blue"
  | "eraser"
  | "line"
  | "circle"
  | "rect"
  | "arrow"
  | "laser"
  | "text";

export interface BoardTerm {
  id?: string;
  word: string;
  phonetic?: string;
  academic_definition?: string;
  turkish_meaning?: string;
  example?: string;
  category?: string;
}

function SmartBoardConsoleContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId") || searchParams.get("class_id") || "cls-1";
  const sessionId = searchParams.get("sessionId") || searchParams.get("session_id") || "";
  const activeClassName = searchParams.get("className") || searchParams.get("class_name") || t("brd_default_room", "Ders / Tahta Odası");

  const [liveSessionId, setLiveSessionId] = useState<string>(sessionId);
  const [liveJoinCode, setLiveJoinCode] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 1. Profil Context (Dinamik Öğretmen Kartı / Stüdyo İçin)
  const { userProfile } = useProfile();
  const [isExpanded, setIsExpanded] = useState(true);

  // 2. Ekran & PDF Materyali Durumları
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfTextContext, setPdfTextContext] = useState<string>("");
  const [pdfPageImages, setPdfPageImages] = useState<string[]>([]);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const pdfWrapperRef = useRef<HTMLDivElement | null>(null);

  // 3. Canlı Stüdyo (Mikrofon, Kamera, Ekran Paylaşımı)
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraFullscreen, setIsCameraFullscreen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // 4. Zoom & Pan Durumları
  const [scale, setScale] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // 5. Araç Durumu & 🖐️ Gezin (Pan / Grab & Drag) Referansları
  const [activeTool, setActiveTool] = useState<BoardDrawingTool>("pan");

  // Lazer İşaretçi (1.2 saniye sonra kaybolan iz)
  const [laserTrail, setLaserTrail] = useState<Array<{ x: number; y: number; ts: number }>>([]);
  const isLaserDownRef = useRef(false);

  // Tahta Metin Kutusu
  const [textInputBox, setTextInputBox] = useState<{
    screenX: number;
    screenY: number;
    canvasX: number;
    canvasY: number;
    value: string;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
  }>({
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
  });

  const handlePanMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "pan") return;
    if ((e.target as HTMLElement).closest("button, input, select, a")) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsPanning(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScrollLeft: container.scrollLeft,
      startScrollTop: container.scrollTop,
    };
  };

  const handlePanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || activeTool !== "pan") return;
    const container = scrollContainerRef.current;
    if (!container) return;

    e.preventDefault();
    const dx = e.clientX - panStartRef.current.startX;
    const dy = e.clientY - panStartRef.current.startY;
    container.scrollLeft = panStartRef.current.startScrollLeft - dx;
    container.scrollTop = panStartRef.current.startScrollTop - dy;
  };

  const handlePanMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handlePanTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTool !== "pan") return;
    if ((e.target as HTMLElement).closest("button, input, select, a")) return;
    if (e.touches.length === 1) {
      const container = scrollContainerRef.current;
      if (!container) return;
      setIsPanning(true);
      panStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startScrollLeft: container.scrollLeft,
        startScrollTop: container.scrollTop,
      };
    }
  };

  const handlePanTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPanning || activeTool !== "pan") return;
    if (e.touches.length === 1) {
      const container = scrollContainerRef.current;
      if (!container) return;
      if (e.cancelable) e.preventDefault();
      const dx = e.touches[0].clientX - panStartRef.current.startX;
      const dy = e.touches[0].clientY - panStartRef.current.startY;
      container.scrollLeft = panStartRef.current.startScrollLeft - dx;
      container.scrollTop = panStartRef.current.startScrollTop - dy;
    }
  };

  const handlePanTouchEnd = () => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  useEffect(() => {
    if (!isPanning) return;
    const handleGlobalMouseUp = () => setIsPanning(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (activeTool !== "pan") return;
      const container = scrollContainerRef.current;
      if (!container) return;
      const dx = e.clientX - panStartRef.current.startX;
      const dy = e.clientY - panStartRef.current.startY;
      container.scrollLeft = panStartRef.current.startScrollLeft - dx;
      container.scrollTop = panStartRef.current.startScrollTop - dy;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isPanning, activeTool]);

  // 6. Şeffaf Çizim Katmanı (HTML5 Canvas Overlay)
  const [shapeColor, setShapeColor] = useState<string>("#ef4444");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastCoordRef = useRef<{ x: number; y: number } | null>(null);
  const startCoordRef = useRef<{ x: number; y: number } | null>(null);
  const shapeSnapshotRef = useRef<ImageData | null>(null);

  // Sürüklenebilir & Küçültülebilir Kamera Kartı Durumları
  const [cameraPos, setCameraPos] = useState<{ x: number; y: number } | null>(null);
  const [isCameraMinimized, setIsCameraMinimized] = useState<boolean>(false);
  const isDraggingCamRef = useRef<boolean>(false);
  const camDragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const camWidgetRef = useRef<HTMLDivElement | null>(null);

  const handleCameraPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // İç butonlara basılmışsa sürüklemeyi tetikleme
    if ((e.target as HTMLElement).closest("button")) return;

    isDraggingCamRef.current = true;
    const el = camWidgetRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      camDragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    const onPointerMove = (moveEvt: PointerEvent) => {
      if (!isDraggingCamRef.current) return;
      const w = camWidgetRef.current?.offsetWidth || 176;
      const h = camWidgetRef.current?.offsetHeight || 128;
      const maxX = Math.max(10, window.innerWidth - w - 10);
      const maxY = Math.max(10, window.innerHeight - h - 10);
      const nextX = Math.min(Math.max(10, moveEvt.clientX - camDragOffsetRef.current.x), maxX);
      const nextY = Math.min(Math.max(10, moveEvt.clientY - camDragOffsetRef.current.y), maxY);
      setCameraPos({ x: nextX, y: nextY });
    };

    const onPointerUp = () => {
      isDraggingCamRef.current = false;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // 6. Araç & Tahta Yönetim Modalları
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSendMaterialOpen, setIsSendMaterialOpen] = useState(false);
  const [isEndingLesson, setIsEndingLesson] = useState(false);
  const [highlightedWords, setHighlightedWords] = useState<string[]>([]);

  // 7. Canlı Ses Dinleme & KVKK Tamponu (Web Speech API)
  const [spokenTranscript, setSpokenTranscript] = useState<string>("");
  const [transcriptBuffer, setTranscriptBuffer] = useState<string>("");
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const spokenBufferRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Aktif Oturumu localStorage'a kaydet (Ders bitirilene kadar kalıcı oturum)
  useEffect(() => {
    if (typeof window === "undefined" || !classId) return;
    let cancelled = false;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const syncLocalActiveClass = (resolvedSessionId: string) => {
      try {
        const activeSession = {
          classId,
          sessionId: resolvedSessionId,
          className: activeClassName || t("brd_default_room", "Ders / Tahta Odası"),
          startedAt: new Date().toISOString(),
        };
        localStorage.setItem("vocaship_active_class", JSON.stringify(activeSession));
        window.dispatchEvent(new Event("vocaship_active_class_change"));
      } catch (e) {
        console.warn("Aktif oturum kaydedilemedi:", e);
      }
    };

    syncLocalActiveClass(liveSessionId || sessionId || "");

    fetch(`${apiUrl}/api/v1/classroom/classes/${encodeURIComponent(classId)}/start-live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacher_id: userProfile?.id || undefined,
        class_name: activeClassName || undefined,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (data.session_id) {
          setLiveSessionId(data.session_id);
          syncLocalActiveClass(data.session_id);
        }
        if (data.join_code) {
          setLiveJoinCode(data.join_code);
        }
      })
      .catch((e) => console.warn("Arka plan canlı oturum başlatma hatası:", e));

    return () => {
      cancelled = true;
    };
  }, [classId, activeClassName]);

  // Dersi Bitir ve Arşive Kaydet
  const handleCompleteLesson = async () => {
    setIsEndingLesson(true);
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      setIsCameraFullscreen(false);
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      let computedDuration: number | undefined = undefined;
      if (typeof window !== "undefined") {
        try {
          const rawActive = localStorage.getItem("vocaship_active_class");
          if (rawActive) {
            const parsed = JSON.parse(rawActive);
            if (parsed?.startedAt) {
              const diffMs = Date.now() - new Date(parsed.startedAt).getTime();
              if (Number.isFinite(diffMs) && diffMs > 0) {
                computedDuration = Math.max(1, Math.round(diffMs / 60000));
              }
            }
          }
          localStorage.removeItem("vocaship_active_class");
          window.dispatchEvent(new Event("vocaship_active_class_change"));
        } catch {}
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const effectiveSessionId = liveSessionId || sessionId;
      if (effectiveSessionId) {
        await fetch(`${apiUrl}/api/v1/classroom/sessions/${encodeURIComponent(effectiveSessionId)}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duration_minutes: computedDuration,
          }),
        }).catch((e) => console.warn("Session complete error:", e));
      }

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        router.push("/classroom?tab=calendar");
      }, 500);
    } catch (err) {
      console.error("Ders sonlandırma hatası:", err);
    } finally {
      setIsEndingLesson(false);
    }
  };

  // Hata mesajını 4 saniye sonra otomatik kaldır
  useEffect(() => {
    if (!mediaError) return;
    const timer = setTimeout(() => setMediaError(null), 4000);
    return () => clearTimeout(timer);
  }, [mediaError]);

  // Kamera stream video bağlantısı
  useEffect(() => {
    if (isCameraActive && cameraVideoRef.current && cameraStreamRef.current) {
      if (cameraVideoRef.current.srcObject !== cameraStreamRef.current) {
        cameraVideoRef.current.srcObject = cameraStreamRef.current;
      }
    }
  }, [isCameraActive]);

  // Ekran paylaşımı stream video bağlantısı
  useEffect(() => {
    if (isScreenSharing && screenVideoRef.current && screenStreamRef.current) {
      if (screenVideoRef.current.srcObject !== screenStreamRef.current) {
        screenVideoRef.current.srcObject = screenStreamRef.current;
      }
    }
  }, [isScreenSharing]);

  // Sayfadan çıkışta veya bileşen unmount edildiğinde medya akışlarını temizle
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      setIsCameraFullscreen(false);
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Canvas boyutunu içerik alanıyla senkronize et
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth || 1200;
    const h = Math.max(parent.scrollHeight, parent.clientHeight, 900);

    if (canvas.width !== w || canvas.height !== h) {
      const temp = document.createElement("canvas");
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tCtx = temp.getContext("2d");
      if (tCtx && canvas.width > 0 && canvas.height > 0) {
        tCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (ctx && temp.width > 0 && temp.height > 0) {
        ctx.drawImage(temp, 0, 0);
      }
    }
  }, []);

  useEffect(() => {
    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize);
    return () => window.removeEventListener("resize", syncCanvasSize);
  }, [syncCanvasSize, pdfUrl, pdfPageImages, isScreenSharing]);

  // Arka Planda Canlı Ses Dinleme (Web Speech API) - Kameraya ASLA dokunmaz!
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "tr-TR";

        rec.onresult = (e: any) => {
          let chunk = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
              chunk += e.results[i][0].transcript + " ";
            }
          }
          if (chunk && isMounted) {
            spokenBufferRef.current += chunk;
            setTranscriptBuffer((prev) => prev + chunk);
            setSpokenTranscript((prev) => prev + chunk);
          }
        };

        rec.onerror = (err: any) => {
          if (err.error === "not-allowed" || err.error === "permission-denied") {
            if (isMounted) setMicPermissionDenied(true);
          }
        };

        rec.onend = () => {
          if (isMounted && recognitionRef.current && isMicActive) {
            try {
              rec.start();
            } catch {}
          }
        };

        recognitionRef.current = rec;
      } catch (e) {
        console.warn("Speech recognition initialization notice:", e);
      }
    }

    return () => {
      isMounted = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      // DİKKAT: Burada KESİNLİKLE cameraStreamRef veya screenStreamRef stop() çağrılmaz!
    };
  }, [isMicActive]);

  // =========================================================================
  // CANLI STÜDYO KONTROLLERİ: MİKROFON, KAMERA, EKRAN PAYLAŞIMI
  // =========================================================================

  // 1. Mikrofon Başlat / Durdur (Kameradan tamamen izole)
  const toggleMicrophone = async () => {
    if (isMicActive) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsMicActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        setIsMicActive(true);
        setMicPermissionDenied(false);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {}
        }
      } catch (err) {
        console.warn("Mikrofon izni alınamadı:", err);
        setMicPermissionDenied(true);
        setMediaError("Mikrofon izni verilmedi.");
      }
    }
  };

  // 2. Kamera Başlat / Durdur (Mikrofondan tamamen izole)
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = null;
      }
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
      setIsCameraFullscreen(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        cameraStreamRef.current = stream;
        setIsCameraActive(true);
        setIsCameraFullscreen(true);
        setMediaError(null);
      } catch (err) {
        console.warn("Kamera izni alınamadı:", err);
        setMediaError("Kamera izni verilmedi.");
      }
    }
  };

  // Kamera Akışı Aktarma (Fullscreen <-> PiP geçişinde tracks durdurulmadan srcObject aktarılır)
  useEffect(() => {
    if (isCameraActive && cameraStreamRef.current) {
      if (isCameraFullscreen && fullscreenVideoRef.current) {
        if (fullscreenVideoRef.current.srcObject !== cameraStreamRef.current) {
          fullscreenVideoRef.current.srcObject = cameraStreamRef.current;
        }
      } else if (!isCameraFullscreen && cameraVideoRef.current) {
        if (cameraVideoRef.current.srcObject !== cameraStreamRef.current) {
          cameraVideoRef.current.srcObject = cameraStreamRef.current;
        }
      }
    }
  }, [isCameraFullscreen, isCameraActive]);

  // Esc tuşu ile tam ekrandan kamerayı sağ sütuna küçültme
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCameraFullscreen) {
        setIsCameraFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCameraFullscreen]);

  // 3. Ekran / Word / Excel / Pencere Paylaşımı Başlat / Durdur
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = stream;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            setIsScreenSharing(false);
            screenStreamRef.current = null;
            if (screenVideoRef.current) {
              screenVideoRef.current.srcObject = null;
            }
          };
        }
        setIsScreenSharing(true);
        setMediaError(null);
      } catch (err) {
        console.warn("Ekran paylaşımı başlatılamadı:", err);
        setMediaError(t("brd_screen_err", "Ekran paylaşımı izni verilmedi veya iptal edildi."));
      }
    }
  };

  useEffect(() => {
    if (isScreenSharing && screenStreamRef.current && screenVideoRef.current) {
      if (screenVideoRef.current.srcObject !== screenStreamRef.current) {
        screenVideoRef.current.srcObject = screenStreamRef.current;
      }
    }
  }, [isScreenSharing]);

  // Lazer izini 1.2 saniye sonra otomatik temizle
  useEffect(() => {
    if (laserTrail.length === 0) return;
    const timer = setInterval(() => {
      const cutoff = Date.now() - 1200;
      setLaserTrail((prev) => prev.filter((p) => p.ts >= cutoff));
    }, 80);
    return () => clearInterval(timer);
  }, [laserTrail.length]);

  // Fullscreen Kontrolü
  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  // PDF.js Kütüphanesini Dinamik Olarak CDN'den Yükle
  const loadPdfJs = async (): Promise<any> => {
    if (typeof window === "undefined") return null;
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        resolve(lib);
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  };

  // PDF Metin Çıkarıcı (Client-side regex fallback)
  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder("utf-8");
      const raw = textDecoder.decode(bytes);

      const matches = raw.match(/\(([^()]{2,})\)\s*(?:Tj|TJ|'|")/g) || [];
      let cleanText = matches
        .map((m) => m.replace(/^\(/, "").replace(/\)\s*(?:Tj|TJ|'|")$/, "").trim())
        .filter((s) => s.length > 2 && !/^[\d\s.,/\\-]+$/.test(s))
        .join(" ");

      if (cleanText.length < 50) {
        const words = raw.match(/[a-zA-ZçğıöşüÇĞİÖŞÜ]{4,}/g) || [];
        const pdfIgnore = new Set([
          "stream", "endstream", "obj", "endobj", "xref", "trailer", "startxref",
          "Catalog", "Pages", "Page", "Parent", "MediaBox", "Contents", "Resources",
          "Font", "Type", "TrueType", "Encoding", "Widths", "BaseFont", "Length",
          "Filter", "FlateDecode", "Length1", "Subtype",
        ]);
        const valid = words.filter((w) => !pdfIgnore.has(w));
        if (valid.length > 5) {
          cleanText = valid.slice(0, 300).join(" ");
        }
      }

      const cleanFileName = file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
      return `${cleanFileName}. ${cleanText}`.slice(0, 4000);
    } catch (e) {
      console.warn("PDF text parse notice:", e);
      return file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
    }
  };

  // PDF Dosyası Yükleme (page.getTextContent ile tam gövde metni ve 1:1 senkron sayfalar)
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPdfFileName(file.name);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setScale(1.0);
      setPan({ x: 0, y: 0 });
      setIsPdfLoading(true);

      let extractedFullText = "";
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await loadPdfJs();
        if (pdfjs) {
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;
          const pages: string[] = [];
          let collectedText = "";

          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);

            // 1. Gerçek sayfa metnini çıkar (page.getTextContent)
            const textContent = await page.getTextContent();
            const pageStr = textContent.items
              .map((it: any) => it.str)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();
            if (pageStr) {
              collectedText += `\n[Sayfa ${i}]: ` + pageStr;
            }

            // 2. Sayfayı yüksek kaliteli DOM görseline renderla (1:1 çizim senkronizasyonu için)
            const viewport = page.getViewport({ scale: 1.5 });
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            const tempCtx = tempCanvas.getContext("2d");
            if (tempCtx) {
              await page.render({ canvasContext: tempCtx, viewport }).promise;
              pages.push(tempCanvas.toDataURL("image/png"));
            }
          }

          if (collectedText.trim().length > 10) {
            extractedFullText = collectedText.trim();
          }
          if (pages.length > 0) {
            setPdfPageImages(pages);
          }
        }
      } catch (err) {
        console.warn("PDF.js render & extraction fallback:", err);
      } finally {
        setIsPdfLoading(false);
      }

      // PDF.js metin çıkaramadıysa regex fallback kullan
      if (!extractedFullText) {
        extractedFullText = await extractTextFromPdf(file);
      }
      setPdfTextContext(extractedFullText);
    }
  };

  const handleClearPdf = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfFile(null);
    setPdfUrl(null);
    setPdfFileName(null);
    setPdfTextContext("");
    setPdfPageImages([]);
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    handleClearCanvas();
  };

  // Zoom Kontrolleri
  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.8, +(prev - 0.15).toFixed(2)));
  };

  const handleResetZoom = () => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Çizimleri Temizle
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Canvas Koordinat Dönüşümü
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  // Çizim Konfigürasyonu (Fosforlu Kalem: Multiply + 0.25 Alpha + mix-blend-multiply)
  const setupContextForTool = (ctx: CanvasRenderingContext2D, tool: BoardDrawingTool) => {
    if (tool === "highlighter") {
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.25; // Yüksek şeffaflık; canlı çizim sırasında bile alttaki harfler net görünür
      ctx.lineWidth = 22;
      ctx.strokeStyle = "#facc15"; // Canlı fosforlu sarı
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else if (tool === "pen_red") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ef4444"; // Kırmızı not kalemi
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else if (tool === "pen_blue") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#3b82f6"; // Mavi not kalemi
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = 32;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else if (tool === "line" || tool === "circle" || tool === "rect" || tool === "arrow") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 3;
      ctx.strokeStyle = shapeColor;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const commitTextToCanvas = () => {
    if (!textInputBox) return;
    const text = textInputBox.value.trim();
    if (text && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
        ctx.font = "bold 24px Inter, system-ui, sans-serif";
        ctx.fillStyle = shapeColor || "#f8fafc";
        ctx.fillText(text, textInputBox.canvasX, textInputBox.canvasY);
        ctx.restore();
      }
    }
    setTextInputBox(null);
  };

  const handleSnapshot = () => {
    const drawingCanvas = canvasRef.current;
    const w = drawingCanvas?.width || 1280;
    const h = drawingCanvas?.height || 720;

    try {
      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = w;
      compositeCanvas.height = h;
      const ctx = compositeCanvas.getContext("2d");
      if (!ctx) return;

      // 1. Katman (Zemin)
      ctx.fillStyle = pdfUrl ? "#ffffff" : "#0f172a";
      ctx.fillRect(0, 0, w, h);

      // 2. Katman (Arka Plan İçeriği: Canlı Video veya PDF Canvas/Sayfaları)
      if (isScreenSharing && screenVideoRef.current && screenVideoRef.current.readyState >= 2) {
        ctx.drawImage(screenVideoRef.current, 0, 0, w, h);
      } else if (pdfUrl && pdfWrapperRef.current) {
        const wrapperRect = pdfWrapperRef.current.getBoundingClientRect();
        const mediaNodes = pdfWrapperRef.current.querySelectorAll("img, canvas");
        mediaNodes.forEach((node) => {
          const el = node as HTMLImageElement | HTMLCanvasElement;
          const r = el.getBoundingClientRect();
          if (wrapperRect.width > 0 && wrapperRect.height > 0 && r.width > 0 && r.height > 0) {
            const dx = ((r.left - wrapperRect.left) / wrapperRect.width) * w;
            const dy = ((r.top - wrapperRect.top) / wrapperRect.height) * h;
            const dw = (r.width / wrapperRect.width) * w;
            const dh = (r.height / wrapperRect.height) * h;
            try {
              ctx.drawImage(el, dx, dy, dw, dh);
            } catch {}
          }
        });
      }

      // 3. Katman (Çizimler)
      if (drawingCanvas) {
        ctx.drawImage(drawingCanvas, 0, 0, w, h);
      }

      const dataUrl = compositeCanvas.toDataURL("image/png");
      try {
        sessionStorage.setItem("vocaship_last_board_snapshot", dataUrl);
      } catch {}

      const link = document.createElement("a");
      link.download = "vocaship-board-snapshot.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.warn("Snapshot alınamadı:", err);
    }
  };

  const pushLaserPoint = (clientX: number, clientY: number) => {
    const ws = workspaceRef.current;
    if (!ws) return;
    const rect = ws.getBoundingClientRect();
    setLaserTrail((prev) => [
      ...prev.slice(-18),
      { x: clientX - rect.left, y: clientY - rect.top, ts: Date.now() },
    ]);
  };

  // Mouse & Touch Çizim Olayları (Canlı Önizleme / Snapshot Buffer destekli)
  const startDrawing = (clientX: number, clientY: number) => {
    if (activeTool === "none" || activeTool === "pan") return;

    if (activeTool === "laser") {
      isLaserDownRef.current = true;
      pushLaserPoint(clientX, clientY);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(clientX, clientY);

    if (activeTool === "text") {
      const ws = workspaceRef.current;
      const wsRect = ws?.getBoundingClientRect();
      setTextInputBox({
        screenX: wsRect ? Math.max(12, Math.min(wsRect.width - 220, clientX - wsRect.left)) : 40,
        screenY: wsRect ? Math.max(12, Math.min(wsRect.height - 60, clientY - wsRect.top)) : 40,
        canvasX: coords.x,
        canvasY: coords.y,
        value: "",
      });
      return;
    }

    startCoordRef.current = coords;
    isDrawingRef.current = true;

    const isShapeTool =
      activeTool === "line" ||
      activeTool === "circle" ||
      activeTool === "rect" ||
      activeTool === "arrow";
    if (isShapeTool) {
      try {
        shapeSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch {
        shapeSnapshotRef.current = null;
      }
    } else {
      setupContextForTool(ctx, activeTool);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      lastCoordRef.current = coords;
    }
  };

  const drawMove = (clientX: number, clientY: number) => {
    if (activeTool === "laser") {
      pushLaserPoint(clientX, clientY);
      return;
    }
    if (!isDrawingRef.current || activeTool === "none" || activeTool === "pan" || activeTool === "text") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(clientX, clientY);
    const isShapeTool =
      activeTool === "line" ||
      activeTool === "circle" ||
      activeTool === "rect" ||
      activeTool === "arrow";

    if (isShapeTool) {
      if (!startCoordRef.current) return;
      // 1. Önceki çizimleri bozmadan snapshot buffer'ı geri yükle
      if (shapeSnapshotRef.current) {
        ctx.putImageData(shapeSnapshotRef.current, 0, 0);
      }

      // 2. Canlı şekil önizlemesini çiz
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 3;
      ctx.strokeStyle = shapeColor;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const startX = startCoordRef.current.x;
      const startY = startCoordRef.current.y;
      const currX = coords.x;
      const currY = coords.y;

      if (activeTool === "line") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
      } else if (activeTool === "rect") {
        ctx.beginPath();
        ctx.strokeRect(startX, startY, currX - startX, currY - startY);
      } else if (activeTool === "arrow") {
        const headLen = 16;
        const angle = Math.atan2(currY - startY, currX - startX);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currX, currY);
        ctx.lineTo(currX - headLen * Math.cos(angle - Math.PI / 6), currY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(currX, currY);
        ctx.lineTo(currX - headLen * Math.cos(angle + Math.PI / 6), currY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (activeTool === "circle") {
        const radiusX = Math.abs(currX - startX) / 2;
        const radiusY = Math.abs(currY - startY) / 2;
        const centerX = Math.min(startX, currX) + radiusX;
        const centerY = Math.min(startY, currY) + radiusY;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.max(radiusX, 1), Math.max(radiusY, 1), 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      if (!lastCoordRef.current) {
        lastCoordRef.current = coords;
        return;
      }

      // Tek bir sürekli adım: moveTo önceki nokta, lineTo yeni nokta, stroke (üst üste binmeyi ve koyulaşmayı engeller)
      ctx.beginPath();
      setupContextForTool(ctx, activeTool);
      ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      lastCoordRef.current = coords;
    }
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.closePath();
      }
    }
    isDrawingRef.current = false;
    lastCoordRef.current = null;
    startCoordRef.current = null;
    shapeSnapshotRef.current = null;
  };

  return (
    <div
      data-testid="smartboard-console"
      id="classroom-board-workspace"
      data-board-stage="true"
      className="w-full h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfUpload}
      />

      {/* ========================================================================= */}
      {/* 1. ÜST KONSOL ŞERİDİ (SADELEŞTİRİLMİŞ TEK SATIR)                            */}
      {/* ========================================================================= */}
      <header className="h-14 sm:h-16 shrink-0 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-3 z-20">
        {/* Sol: Geri Dönüş [ ← Sınıflarım ] & Aktif Sınıf Başlığı */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            href="/classroom"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs font-bold text-slate-200 transition cursor-pointer active:scale-95 shadow-sm"
            title={t("brd_back_tip", "Sınıflarıma Dön (Ders arka planda devam eder)")}
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>{t("brd_back_btn", "← Sınıflarım")}</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400 shrink-0" />
            <span className="text-xs font-black tracking-wider uppercase font-mono truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              🟢 {t("brd_smart_board_lbl", "AKILLI TAHTA")} • {activeClassName}
            </span>
          </div>

          {liveJoinCode && (
            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wider font-mono transition active:scale-95 cursor-pointer shrink-0"
              title={t("brd_show_qr_title", "QR Kodu Büyüt")}
            >
              <span>📱 {t("brd_class_code_lbl", "Sınıf Kodu")}: {liveJoinCode}</span>
            </button>
          )}
        </div>

        {/* Sağ: Ders Materyali / PDF Yükle, Materyal Gönder & Tam Ekran */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Ekran Paylaşımı VEYA PDF Materyal Durumu */}
          {isScreenSharing ? (
            <div className="flex items-center gap-1.5 bg-indigo-950/90 border border-indigo-500/50 py-1.5 px-3 rounded-xl text-xs text-indigo-200">
              <MonitorUp className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
              <span className="font-bold hidden sm:inline">🖥️ Canlı Pencere Yansıtılıyor</span>
              <button
                type="button"
                onClick={toggleScreenShare}
                className="ml-1.5 px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[11px] font-bold text-rose-300 hover:text-white hover:bg-rose-600 transition cursor-pointer"
              >
                ⏹️ Paylaşımı Bitir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {pdfFileName ? (
                <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 py-1.5 px-3 rounded-xl text-xs">
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-white font-medium truncate max-w-[110px] sm:max-w-[160px]">
                    {pdfFileName}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearPdf}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                    title={t("brd_close_mat_tip", "Materyali Kapat")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer shadow-sm active:scale-95"
                  title={t("brd_upload_pdf_tip", "PDF Aç")}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">📄 PDF Aç</span>
                  <span className="sm:hidden">📄 PDF</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleScreenShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500/50 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer shadow-sm active:scale-95"
                title="Word, Excel, PowerPoint veya herhangi bir pencereyi tahtaya yansıt"
              >
                <MonitorUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">🖥️ Word / Excel / Pencere Yansıt</span>
                <span className="md:hidden">🖥️ Yansıt</span>
              </button>
            </div>
          )}

          {/* Materyal Gönder Butonu */}
          <button
            type="button"
            onClick={() => setIsSendMaterialOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 hover:text-white transition cursor-pointer shadow-sm active:scale-95"
            title={t("brd_send_mat_tip", "Öğrencilere Not ve Materyal Gönder")}
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{t("brd_send_mat", "📨 Materyal Gönder")}</span>
            <span className="sm:hidden">{t("brd_send_short", "📨 Gönder")}</span>
          </button>

          {/* Gerçek Tarayıcı Tam Ekran Butonu */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
              isFullscreen
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 ring-1 ring-amber-500/30"
                : "bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700"
            }`}
            title={isFullscreen ? t("brd_fs_exit_tip", "Tam Ekrandan Çık") : t("brd_fs_enter_tip", "Gerçek Tarayıcı Tam Ekran Moduna Geç")}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">{t("brd_fs_exit", "🗗 Tam Ekrandan Çık")}</span>
                <span className="sm:hidden">🗗</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">{t("brd_fs_enter", "⛶ Tam Ekran")}</span>
                <span className="sm:hidden">⛶</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. ANA ÇALIŞMA ALANI (PDF VEYA EKRAN PAYLAŞIMI + ŞEFFAF CANVAS) & SAĞ PANEL */}
      {/* ========================================================================= */}
      <main className="flex-1 flex overflow-hidden relative w-full h-[calc(100vh-56px)]">
        {/* SOL: DERS ÇALIŞMA SAHNESİ */}
        <section
          ref={workspaceRef}
          className="flex-1 min-w-0 bg-slate-950 flex flex-col relative overflow-hidden p-2 select-none"
        >
          <div className="w-full h-full flex flex-col relative min-w-0">
            {/* 🔴 Lazer İşaretçi Katmanı */}
            {laserTrail.length > 0 && (
              <svg className="pointer-events-none absolute inset-0 w-full h-full z-30">
                {laserTrail.map((pt, i) => {
                  const age = (Date.now() - pt.ts) / 1200;
                  const opacity = Math.max(0, 1 - age);
                  const isHead = i === laserTrail.length - 1;
                  return (
                    <circle
                      key={`${pt.ts}-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHead ? 7 : Math.max(2, 5 * opacity)}
                      fill={`rgba(244, 63, 94, ${opacity})`}
                      style={isHead ? { filter: "drop-shadow(0 0 10px rgba(244,63,94,0.95))" } : undefined}
                    />
                  );
                })}
              </svg>
            )}

            {/* 🔤 Tahta Metin Kutusu */}
            {textInputBox && (
              <div
                style={{ left: textInputBox.screenX, top: textInputBox.screenY }}
                className="absolute z-40 flex items-center gap-1.5 bg-slate-900/95 border border-indigo-500 rounded-xl p-1.5 shadow-2xl"
              >
                <input
                  type="text"
                  autoFocus
                  value={textInputBox.value}
                  onChange={(e) =>
                    setTextInputBox((prev) => (prev ? { ...prev, value: e.target.value } : null))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitTextToCanvas();
                    } else if (e.key === "Escape") {
                      setTextInputBox(null);
                    }
                  }}
                  placeholder="Metin yazın..."
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none w-44"
                />
                <button
                  type="button"
                  onClick={commitTextToCanvas}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextInputBox(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          {isScreenSharing ? (
            <div
              ref={scrollContainerRef}
              onMouseDown={handlePanMouseDown}
              onMouseMove={handlePanMouseMove}
              onMouseUp={handlePanMouseUp}
              onMouseLeave={handlePanMouseUp}
              onTouchStart={handlePanTouchStart}
              onTouchMove={handlePanTouchMove}
              onTouchEnd={handlePanTouchEnd}
              className={`w-full flex-1 min-h-0 overflow-auto relative rounded-2xl border border-indigo-500/40 shadow-2xl bg-black select-none ${
                activeTool === "pan"
                  ? isPanning
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : ""
              }`}
            >
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  width: scale > 1 ? `${scale * 100}%` : "100%",
                  minHeight: "100%",
                  position: "relative",
                  transition: isPanning ? "none" : "transform 0.15s ease-out",
                }}
                className="relative flex justify-center items-center min-h-[900px] w-full"
              >
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full min-h-[900px] object-contain bg-black"
                />

                {/* Şeffaf Çizim Katmanı */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={(e) => {
                    if (activeTool !== "none" && activeTool !== "pan") {
                      startDrawing(e.clientX, e.clientY);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (activeTool !== "none" && activeTool !== "pan") {
                      drawMove(e.clientX, e.clientY);
                    }
                  }}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => {
                    if (activeTool !== "none" && activeTool !== "pan" && e.touches.length === 1) {
                      e.preventDefault();
                      startDrawing(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (activeTool !== "none" && activeTool !== "pan" && e.touches.length === 1) {
                      e.preventDefault();
                      drawMove(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                  onTouchEnd={stopDrawing}
                  className={`absolute inset-0 w-full h-full z-10 mix-blend-normal ${
                    activeTool === "none" || activeTool === "pan"
                      ? "pointer-events-none"
                      : "pointer-events-auto cursor-crosshair"
                  }`}
                />
              </div>
            </div>
          ) : pdfUrl ? (
            <div
              ref={scrollContainerRef}
              onMouseDown={handlePanMouseDown}
              onMouseMove={handlePanMouseMove}
              onMouseUp={handlePanMouseUp}
              onMouseLeave={handlePanMouseUp}
              onTouchStart={handlePanTouchStart}
              onTouchMove={handlePanTouchMove}
              onTouchEnd={handlePanTouchEnd}
              className={`w-full flex-1 min-h-0 overflow-auto relative rounded-2xl border border-slate-800 shadow-2xl bg-slate-900 select-none ${
                activeTool === "pan"
                  ? isPanning
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : ""
              }`}
            >
              {isPdfLoading && (
                <div className="absolute inset-0 bg-slate-950/70 z-30 flex flex-col items-center justify-center gap-3 backdrop-blur-sm pointer-events-none">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                  <span className="text-xs text-indigo-300 font-mono">{t("brd_processing_pages", "Ders sayfaları işleniyor ve hizalanıyor...")}</span>
                </div>
              )}
              {/* Zoom & Scroll Kapsayıcısı - PDF ile Canvas'ı 1:1 bağlar */}
              <div
                ref={pdfWrapperRef}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  width: scale > 1 ? `${scale * 100}%` : "100%",
                  minHeight: "100%",
                  position: "relative",
                  transition: isPanning ? "none" : "transform 0.15s ease-out",
                }}
                className="relative flex flex-col items-center gap-4 py-4 min-h-[900px] w-full"
              >
                {pdfPageImages.length > 0 ? (
                  pdfPageImages.map((pageSrc, idx) => (
                    <div
                      key={idx}
                      className="relative shadow-2xl rounded-xl overflow-hidden bg-white max-w-4xl w-full select-none"
                    >
                      <img
                        src={pageSrc}
                        alt={`Ders Sayfası ${idx + 1}`}
                        className="w-full h-auto block select-none pointer-events-none"
                        onLoad={syncCanvasSize}
                      />
                    </div>
                  ))
                ) : (
                  <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0`}
                    className="w-full h-full min-h-[900px] border-none pointer-events-none"
                    title="Ders PDF Sunumu"
                  />
                )}

                {/* Şeffaf Çizim Katmanı (HTML5 Canvas Overlay) - Konteynerin içine çocuk (child) eleman olarak mutlak bağlı */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={(e) => {
                    if (activeTool !== "none" && activeTool !== "pan") {
                      startDrawing(e.clientX, e.clientY);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (activeTool !== "none" && activeTool !== "pan") {
                      drawMove(e.clientX, e.clientY);
                    }
                  }}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => {
                    if (activeTool !== "none" && activeTool !== "pan" && e.touches.length === 1) {
                      e.preventDefault();
                      startDrawing(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (activeTool !== "none" && activeTool !== "pan" && e.touches.length === 1) {
                      e.preventDefault();
                      drawMove(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                  onTouchEnd={stopDrawing}
                  className={`absolute inset-0 w-full h-full z-10 mix-blend-normal ${
                    activeTool === "none" || activeTool === "pan"
                      ? "pointer-events-none"
                      : "pointer-events-auto cursor-crosshair"
                  }`}
                />
              </div>
            </div>
          ) : (
            /* Boş Çalışma Alanı / PDF veya Pencere Yansıtma Çağrısı */
            <div className="w-full h-full rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-inner">
                <FileText className="w-10 h-10" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t("brd_empty_title", "PDF Aç veya Pencere Yansıt")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2">
                {t("brd_empty_desc", "PDF dosyanızı açın ya da bilgisayarınızdaki Word, Excel veya PowerPoint penceresini tahtaya yansıtıp üzerine çizim yapın.")}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>📄 PDF Aç</span>
                </button>
                <button
                  type="button"
                  onClick={toggleScreenShare}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MonitorUp className="w-4 h-4 text-emerald-400" />
                  <span>🖥️ Word / Excel / Pencere Yansıt</span>
                </button>
              </div>
            </div>
          )}
          </div>
        </section>

        {/* SAĞ: ÖĞRETMEN YALIN KONTROL KONSOLU (TEK DİKEY SÜTUN - ÇAKIŞMASIZ) */}
        <aside className="w-72 shrink-0 bg-slate-900 border-l border-slate-800 p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto select-none z-20">
          {/* 1. ÜST AKSİYON BUTONLARI (HER ZAMAN GÖRÜNÜR & TIKLANABİLİR) */}
          <div className="space-y-2 shrink-0">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {t("brd_actions_hdr", "Ders İçi Eylemler")}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {t("brd_live_console", "Canlı Konsol")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* BUTON 1: SÜRE (TIMER) */}
              <button
                type="button"
                onClick={() => setIsTimerOpen(true)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition group shadow-sm active:scale-95 cursor-pointer"
                title={t("brd_timer_tip", "⏱️ Süre / Sayaç Aç")}
              >
                <Timer className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>{t("brd_timer_btn", "⏱️ Süre")}</span>
              </button>

              {/* BUTON 2: 📧 NOT / MATERYAL GÖNDER */}
              <button
                type="button"
                onClick={() => setIsSendMaterialOpen(true)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition group shadow-sm active:scale-95 cursor-pointer"
                title={t("brd_send_mat_tip", "Öğrencilere Not ve Materyal Gönder")}
              >
                <Send className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>{t("brd_mat_btn", "📧 Materyal")}</span>
              </button>
            </div>

            {/* BUTON 3: ⚡ DERSİ BİTİR (END LESSON) */}
            <button
              type="button"
              disabled={isEndingLesson}
              onClick={handleCompleteLesson}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-between shadow-md shadow-emerald-600/20 transition group active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>{isEndingLesson ? t("brd_ending", "Tamamlanıyor...") : t("brd_end_lesson", "⚡ Dersi Bitir")}</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-700/80 text-emerald-100">
                {t("brd_archive_lbl", "Arşivle")}
              </span>
            </button>
          </div>

          {/* 2. ÖĞRETMEN STÜDYOSU KARTI (SAĞ SÜTUNA TAM OTURAN KALICI MODÜL) */}
          <div className="w-full rounded-2xl bg-slate-950/85 border border-slate-800/80 p-3 shadow-md flex flex-col gap-2.5 transition-all duration-200">
            {/* Kart Başlık Çubuğu / Daraltılmış Şerit */}
            <div
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center justify-between cursor-pointer select-none group gap-2"
              title={isExpanded ? t("brd_collapse_tip", "Daraltmak için tıklayın") : t("brd_expand_tip", "Genişletmek için tıklayın")}
            >
              {/* Sol: Yeşil Canlı Nokta & Başlık */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-mono font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                  {isExpanded ? t("brd_studio_title", "Öğretmen Stüdyosu") : t("brd_studio_live", "🟢 Öğretmen Stüdyosu (Canlı)")}
                </span>
              </div>

              {/* Sağ Kontroller */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Daraltılmış Modda Hızlı 🎤 ve 📷 Kontrolleri */}
                {!isExpanded && (
                  <div className="flex items-center gap-1 mr-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMicrophone();
                      }}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isMicActive
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/40"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                      title={isMicActive ? t("brd_mic_off_tip", "Mikrofonu Kapat") : t("brd_mic_on_tip", "Mikrofonu Aç")}
                    >
                      {isMicActive ? (
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCamera();
                      }}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isCameraActive
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/40"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                      title={isCameraActive ? t("brd_cam_off_tip", "Kamerayı Kapat") : t("brd_cam_on_tip", "Kamerayı Aç")}
                    >
                      {isCameraActive ? (
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <VideoOff className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Genişlet / Daralt İkonu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded((prev) => !prev);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title={isExpanded ? t("brd_collapse_tip", "Daralt") : t("brd_expand_tip", "Genişlet")}
                >
                  {isExpanded ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 group-hover:text-indigo-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Genişletilmiş Görünüm */}
            {isExpanded && (
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-850 animate-in fade-in duration-150">
                {/* Kamera Videosu veya Profil Avatarı (Kompakt max-h-36 w-full) */}
                <div className="relative w-full aspect-video max-h-36 rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center shadow-inner group">
                  <video
                    id="teacher-cam"
                    ref={(el) => {
                      cameraVideoRef.current = el;
                      if (el && cameraStreamRef.current && el.srcObject !== cameraStreamRef.current) {
                        el.srcObject = cameraStreamRef.current;
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover bg-black ${
                      isCameraActive ? "block" : "hidden"
                    }`}
                  />

                  {!isCameraActive && (
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-12 h-12 rounded-xl border border-indigo-400/40 overflow-hidden bg-slate-800 flex items-center justify-center text-xl shadow-md mb-1.5">
                        {userProfile.avatar_url &&
                        (userProfile.avatar_url.startsWith("http") ||
                          userProfile.avatar_url.startsWith("/") ||
                          userProfile.avatar_url.startsWith("data:")) ? (
                          <img
                            src={userProfile.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{userProfile.avatar_url || "👨‍🏫"}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{t("brd_cam_off_lbl", "Kamera Kapalı")}</span>
                    </div>
                  )}

                  {isCameraActive && (
                    <>
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-900/85 text-[9px] text-emerald-300 font-bold backdrop-blur-sm pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{t("brd_pip_lbl", "Canlı PiP")}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCameraFullscreen(true);
                        }}
                        className="absolute top-1.5 right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-white text-[10px] font-semibold backdrop-blur-sm border border-slate-700/80 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                        title={t("brd_cam_fs_tip", "Kamerayı Tam Ekran Yap")}
                      >
                        <Maximize2 className="w-3 h-3 text-indigo-400" />
                        <span>{t("brd_fs_enter", "⛶ Tam Ekran")}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Eğitmen & Aktif Ders Bilgisi (Kompakt Satırlar) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[170px]">
                      {userProfile.full_name || userProfile.username}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      @{userProfile.username}
                    </span>
                  </div>

                  <div className="w-full py-1.5 px-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] flex items-center justify-between gap-1.5">
                    <span className="text-slate-400 font-medium shrink-0">{t("brd_active_lesson_lbl", "Aktif Ders:")}</span>
                    <span className="font-bold text-indigo-300 truncate text-right">
                      {activeClassName}
                    </span>
                  </div>
                </div>

                {/* BİRLEŞİK MİKROFON & KAMERA BUTONLARI (Kompakt Tek Satırda) */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={toggleMicrophone}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                      isMicActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 ring-1 ring-emerald-400/40"
                        : "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                    title={isMicActive ? t("brd_mic_off_tip", "Mikrofonu Kapat") : t("brd_mic_on_tip", "Mikrofonu Aç")}
                  >
                    {isMicActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t("brd_on", "Açık")}</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t("brd_mic_short", "Mikrofon")}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                      isCameraActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 ring-1 ring-emerald-400/40"
                        : "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                    title={isCameraActive ? t("brd_cam_off_tip", "Kamerayı Kapat") : t("brd_cam_on_tip", "Kamerayı Aç")}
                  >
                    {isCameraActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t("brd_on", "Açık")}</span>
                      </>
                    ) : (
                      <>
                        <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t("brd_cam_short", "Kamera")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Kart küçültülmüşken kamera akışını kesintisiz canlı tutan gizli video elemanı */}
            {!isExpanded && isCameraActive && (
              <video
                ref={(el) => {
                  cameraVideoRef.current = el;
                  if (el && cameraStreamRef.current && el.srcObject !== cameraStreamRef.current) {
                    el.srcObject = cameraStreamRef.current;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="hidden"
              />
            )}
          </div>

          {/* 3. ALT DURUM BİLGİSİ */}
          <div className="mt-auto p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>{t("brd_zero_audio_badge", "🔒 Sıfır Ses Kaydı • Canlı Dinleme Aktif")}</span>
          </div>
        </aside>
      </main>



      {/* ========================================================================= */}
      {/* 4. ALT SABİT DOCK ÇUBUĞU (FIXED DOCK - ASLA KAYMAZ)                       */}
      {/* ========================================================================= */}
      {!isCameraFullscreen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-2 bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl backdrop-blur-md pointer-events-auto max-w-[96vw] overflow-x-auto scrollbar-none">
        {/* Canlı Stüdyo: 🎤 Mikrofon */}
        <button
          type="button"
          onClick={toggleMicrophone}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
            isMicActive
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md ring-2 ring-emerald-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={isMicActive ? t("brd_mic_off_tip", "Mikrofonu Kapat") : t("brd_mic_on_tip", "Mikrofonu Aç")}
        >
          {isMicActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Mic className="w-4 h-4 text-emerald-400" />
            </>
          ) : (
            <MicOff className="w-4 h-4" />
          )}
          <span className="hidden xl:inline">{t("brd_mic_short", "Mikrofon")}</span>
        </button>

        {/* Canlı Stüdyo: 📷 Kamera */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
            isCameraActive
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md ring-2 ring-emerald-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={isCameraActive ? t("brd_cam_off_tip", "Kamerayı Kapat") : t("brd_cam_on_tip", "Kamerayı Aç")}
        >
          {isCameraActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Video className="w-4 h-4 text-emerald-400" />
            </>
          ) : (
            <VideoOff className="w-4 h-4" />
          )}
          <span className="hidden xl:inline">{t("brd_cam_short", "Kamera")}</span>
        </button>

        {/* Canlı Stüdyo: 🖥️ Ekran Paylaş */}
        <button
          type="button"
          onClick={toggleScreenShare}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
            isScreenSharing
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={isScreenSharing ? t("brd_screen_stop_tip", "Ekran Paylaşımını Durdur") : t("brd_screen_start_tip", "Ekran Paylaş (Canlı Sahne)")}
        >
          {isScreenSharing ? (
            <>
              <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" />
              <MonitorUp className="w-4 h-4 text-white" />
            </>
          ) : (
            <Monitor className="w-4 h-4" />
          )}
          <span className="hidden xl:inline">{t("brd_screen_btn", "Ekran Paylaş")}</span>
        </button>

        <div className="w-px h-5 bg-slate-700 mx-0.5" />

        {/* 🖐️ Gezinme / Pan Modu */}
        <button
          type="button"
          onClick={() => setActiveTool("pan")}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "pan" || activeTool === "none"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={t("brd_tool_pan_tip", "🖐️ Gezinme & Pan Modu (Tut & Kaydır)")}
        >
          <Hand className="w-4 h-4" />
          <span className="hidden sm:inline">{t("brd_tool_pan_lbl", "Gezin")}</span>
        </button>

        {/* 🟡 Fosforlu Kalem (%80 Transparanlık) */}
        <button
          type="button"
          onClick={() => setActiveTool("highlighter")}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
            activeTool === "highlighter"
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-md ring-2 ring-amber-400/30"
              : "text-slate-400 hover:text-amber-300 hover:bg-slate-800"
          }`}
          title={t("brd_tool_hl_tip", "🟡 Fosforlu Kalem (%80 Şeffaf Vurgu)")}
        >
          <Highlighter className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">{t("brd_tool_hl_lbl", "Fosforlu")}</span>
        </button>

        {/* ✏️ Kırmızı Not Kalemi */}
        <button
          type="button"
          onClick={() => setActiveTool("pen_red")}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "pen_red"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-md"
              : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
          }`}
          title={t("brd_tool_pen_tip", "✏️ Kırmızı Not Kalemi")}
        >
          <PenTool className="w-4 h-4 text-rose-400" />
          <span className="hidden md:inline">{t("brd_tool_red_lbl", "Kırmızı")}</span>
        </button>

        {/* ✏️ Mavi Not Kalemi */}
        <button
          type="button"
          onClick={() => setActiveTool("pen_blue")}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "pen_blue"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-md"
              : "text-slate-400 hover:text-blue-400 hover:bg-slate-800"
          }`}
          title={t("brd_tool_blue_tip", "✏️ Mavi Not Kalemi")}
        >
          <PenTool className="w-4 h-4 text-blue-400" />
          <span className="hidden md:inline">{t("brd_tool_blue_lbl", "Mavi")}</span>
        </button>

        <div className="w-px h-5 bg-slate-700 mx-0.5" />

        {/* 📏 Çizgi Aracı */}
        <button
          type="button"
          onClick={() => setActiveTool("line")}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "line"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={t("brd_tool_line_tip", "📏 Düz Çizgi Aracı")}
        >
          <Ruler className="w-4 h-4" />
          <span className="hidden xl:inline">{t("brd_tool_line_lbl", "Çizgi")}</span>
        </button>

        {/* ⭕ Daire Aracı */}
        <button
          type="button"
          onClick={() => setActiveTool("circle")}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "circle"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={t("brd_tool_circle_tip", "⭕ Daire / Elips Vurgulama Aracı")}
        >
          <Circle className="w-4 h-4" />
          <span className="hidden xl:inline">{t("brd_tool_circle_lbl", "Daire")}</span>
        </button>

        {/* ⬜ Kare / Dikdörtgen Aracı */}
        <button
          type="button"
          onClick={() => setActiveTool("rect")}
          className={`min-h-[44px] px-2.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "rect"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={t("brd_tool_rect_tip", "⬜ Kare / Dikdörtgen Çerçeve Aracı")}
        >
          <Square className="w-4 h-4" />
          <span className="hidden xl:inline">{t("brd_tool_rect_lbl", "Kare")}</span>
        </button>

        {/* ↗️ Ok Çizici */}
        <button
          type="button"
          onClick={() => setActiveTool("arrow")}
          className={`min-h-[44px] px-2.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "arrow"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="↗️ Ok Çizici"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span className="hidden xl:inline">Ok</span>
        </button>

        {/* 🔴 Lazer İşaretçi */}
        <button
          type="button"
          onClick={() => setActiveTool("laser")}
          className={`min-h-[44px] px-2.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "laser"
              ? "bg-rose-600/25 text-rose-300 border border-rose-500/50 shadow-md ring-2 ring-rose-500/30"
              : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
          }`}
          title="🔴 Lazer İşaretçi (1.2 sn sonra kaybolur)"
        >
          <Crosshair className="w-4 h-4 text-rose-400" />
          <span className="hidden xl:inline">Lazer</span>
        </button>

        {/* 🔤 Tahta Metin Kutusu */}
        <button
          type="button"
          onClick={() => setActiveTool("text")}
          className={`min-h-[44px] px-2.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "text"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title="🔤 Tahta Metin Kutusu"
        >
          <Type className="w-4 h-4" />
          <span className="hidden xl:inline">Metin</span>
        </button>

        {/* Şekil Renk Paleti (Kırmızı, Mavi, Zümrüt Yeşili, Sarı) */}
        {(activeTool === "line" || activeTool === "circle" || activeTool === "rect" || activeTool === "arrow" || activeTool === "text") && (
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 animate-in fade-in zoom-in-95">
            {[
              { color: "#ef4444", label: t("brd_tool_red_lbl", "Kırmızı"), bg: "bg-rose-500" },
              { color: "#3b82f6", label: t("brd_tool_blue_lbl", "Mavi"), bg: "bg-blue-500" },
              { color: "#10b981", label: t("brd_tool_emerald_lbl", "Zümrüt Yeşili"), bg: "bg-emerald-500" },
              { color: "#facc15", label: t("brd_tool_yellow_lbl", "Sarı"), bg: "bg-amber-400" },
            ].map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => setShapeColor(p.color)}
                className={`w-3.5 h-3.5 rounded-full ${p.bg} transition-all cursor-pointer ${
                  shapeColor === p.color
                    ? "ring-2 ring-white scale-125 shadow-sm"
                    : "opacity-60 hover:opacity-100 hover:scale-110"
                }`}
                title={p.label}
              />
            ))}
          </div>
        )}

        {/* 🧹 Silgi */}
        <button
          type="button"
          onClick={() => setActiveTool("eraser")}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
            activeTool === "eraser"
              ? "bg-slate-700 text-white border border-slate-600 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={t("brd_tool_eraser_lbl", "Silgi")}
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden md:inline">{t("brd_tool_eraser_lbl", "Silgi")}</span>
        </button>

        {/* 🗑️ Çizimleri Temizle */}
        <button
          type="button"
          onClick={handleClearCanvas}
          className="min-h-[44px] px-2.5 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          title={t("brd_clear_draw_tip", "🗑️ Tüm Çizimleri Temizle")}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* 📸 Snapshot (PNG İndir) */}
        <button
          type="button"
          onClick={handleSnapshot}
          className="min-h-[44px] px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
          title="📸 Tahta Görüntüsünü PNG Olarak İndir"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span className="hidden lg:inline">Snapshot</span>
        </button>

        <div className="w-px h-5 bg-slate-700 mx-0.5" />

        {/* Zoom Kontrolleri */}
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={scale <= 0.8}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
          title={t("brd_zoom_out_tip", "➖ Uzaklaş (Scale -0.15)")}
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 font-mono font-bold text-xs transition cursor-pointer"
          title={t("brd_zoom_reset_tip", "Ölçeği Sıfırla (%100)")}
        >
          %{Math.round(scale * 100)}
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={scale >= 2.5}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
          title={t("brd_zoom_in_tip", "➕ Yakınlaş (Scale +0.15)")}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 5. KAMERA TAM EKRAN SAHNESİ (FULL-STAGE CAMERA OVERLAY)                   */}
      {/* ========================================================================= */}
      {isCameraActive && isCameraFullscreen && (
        <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 flex flex-col justify-between animate-in fade-in duration-200">
          {/* Arka Plan Video */}
          <video
            ref={(el) => {
              fullscreenVideoRef.current = el;
              if (el && cameraStreamRef.current && el.srcObject !== cameraStreamRef.current) {
                el.srcObject = cameraStreamRef.current;
              }
            }}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover bg-slate-950 pointer-events-none"
          />

          {/* Üst Bilgi Rozeti */}
          <div className="relative z-10 p-6 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-2xl text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold tracking-wide">
                {t("brd_live_broadcast", "🎥 CANLI EĞİTMEN YAYINI")}
              </span>
              <span className="text-slate-500 font-mono">•</span>
              <span className="text-xs text-indigo-300 font-semibold truncate max-w-xs sm:max-w-md">
                {activeClassName}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCameraFullscreen(false)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-bold backdrop-blur-md shadow-2xl transition active:scale-95 cursor-pointer"
              title={t("brd_min_cam_tip", "Kamerayı Sağ Panele Küçült [Esc]")}
            >
              <Minimize2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">{t("brd_min_cam", "Kamerayı Küçült")}</span>
            </button>
          </div>

          {/* Alt Kontrol Barı */}
          <div className="relative z-10 pb-8 flex items-center justify-center px-4 pointer-events-auto">
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-3xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl">
              {/* [ 🎤 Mikrofon Aç/Kapat ] */}
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  isMicActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30"
                    : "bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
                }`}
                title={isMicActive ? t("brd_mic_off_tip", "Mikrofonu Kapat") : t("brd_mic_on_tip", "Mikrofonu Aç")}
              >
                {isMicActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>{t("brd_mic_on_lbl", "Mikrofon Açık")}</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-4 h-4 text-slate-400" />
                    <span>{t("brd_mic_off_lbl", "Mikrofon Kapalı")}</span>
                  </>
                )}
              </button>

              {/* [ 📷 Kamerayı Kapat ] */}
              <button
                type="button"
                onClick={toggleCamera}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 text-xs sm:text-sm font-bold transition shadow-md active:scale-95 cursor-pointer"
                title={t("brd_cam_off_tip", "Kamerayı Kapat")}
              >
                <VideoOff className="w-4 h-4 text-rose-400" />
                <span>{t("brd_cam_off_tip", "Kamerayı Kapat")}</span>
              </button>

              {/* [ 📄 Tahtaya / PDF'e Geç (Kamerayı Küçült) ] */}
              <button
                type="button"
                onClick={() => setIsCameraFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
                title={t("brd_back_board_tip", "Kamerayı Sağ Panele Küçültüp Tahtaya Dön")}
              >
                <FileText className="w-4 h-4 text-white" />
                <span>{t("brd_back_board", "Tahtaya / PDF'e Geç")}</span>
              </button>

              {/* Ayırıcı Çizgi */}
              <div className="w-px h-6 bg-slate-700/80 mx-1 hidden sm:block" />

              {/* [ ⚡ Dersi Bitir ] */}
              <button
                type="button"
                onClick={handleCompleteLesson}
                disabled={isEndingLesson}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-xs sm:text-sm font-bold transition shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                title={t("brd_end_lesson_tip", "Aktif Dersi Sonlandır")}
              >
                <Power className="w-4 h-4 text-amber-400 hover:text-rose-400" />
                <span>{isEndingLesson ? t("brd_ending", "Tamamlanıyor...") : t("brd_end_btn", "Dersi Bitir")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODALLAR: ESNEK SAYAÇ & MANUEL MATERYAL GÖNDERİMİ                       */}
      {/* ========================================================================= */}
      <BoardTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />

      {isSendMaterialOpen && (
        <SendMaterialModal
          isOpen={isSendMaterialOpen}
          onClose={() => setIsSendMaterialOpen(false)}
          classId={classId}
          className={activeClassName}
          teacherId={userProfile.id || "00000000-0000-0000-0000-000000000001"}
        />
      )}

      <ClassLiveQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        classCode={liveJoinCode}
        className={activeClassName}
        activeSessionId={liveSessionId || sessionId || undefined}
      />
    </div>
  );
}

export default function SmartBoardConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SmartBoardConsoleContent />
    </Suspense>
  );
}
