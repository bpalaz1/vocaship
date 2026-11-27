"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
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
import {
  LiveKitBoardProvider,
  TeamsParticipantGallery,
  useLiveKitBoard,
} from "../../components/board/LiveKitClassroomStage";
import { API_BASE } from "../../config";
import { useProfile } from "../../context/ProfileContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  useBoardRealtimeSync,
  BoardStrokeEvent,
  BoardShapeEvent,
  BoardTextEvent,
  BoardPdfStateEvent,
} from "../../hooks/useBoardRealtimeSync";

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

interface DrawAction {
  strokeId: string;
  kind: "freehand" | "shape" | "text";
  tool: BoardDrawingTool;
  color: string;
  lineWidthRatio: number;
  pageNum: number;
  points?: Array<{ x: number; y: number }>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  text?: string;
  x?: number;
  y?: number;
}

function SmartBoardConsoleContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useProfile();

  // Yalnızca URL'deki classId kullanılır (asla sessionId veya sahte oda kullanılmaz)
  const roomKey = (searchParams.get("classId") || "").trim();

  useEffect(() => {
    if (!roomKey) {
      const timer = setTimeout(() => {
        router.replace("/classroom");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [roomKey, router]);

  if (!roomKey) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base sm:text-lg font-bold">Sınıf kimliği (classId) bulunamadı</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Geçerli bir sınıf seçilmeden canlı ders odasına girilemez. Sınıflarım sayfasına yönlendiriliyorsunuz...
        </p>
        <Link
          href="/classroom"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
        >
          ← Sınıflarım Sayfasına Dön
        </Link>
      </div>
    );
  }

  const sessionId = searchParams.get("sessionId") || searchParams.get("session_id") || "";
  const activeClassName = searchParams.get("className") || searchParams.get("class_name") || t("brd_default_room", "Ders / Tahta Odası");
  const roleParam = searchParams.get("role");
  const teacherIdParam = searchParams.get("teacherId") || searchParams.get("teacher_id");
  const isOwnerMismatch = Boolean(
    teacherIdParam && userProfile?.id && String(teacherIdParam) !== String(userProfile.id)
  );
  const isStudentViewer =
    roleParam === "student" || roleParam === "attendee" || isOwnerMismatch;
  const isTeacher = !isStudentViewer;

  return (
    <LiveKitBoardProvider
      classId={roomKey}
      userId={userProfile.id || undefined}
      userName={userProfile.full_name || userProfile.username || undefined}
      role={isTeacher ? "teacher" : "student"}
    >
      <SmartBoardConsoleInner
        classId={roomKey}
        sessionId={sessionId}
        activeClassName={activeClassName}
        isTeacher={isTeacher}
      />
    </LiveKitBoardProvider>
  );
}

function SmartBoardConsoleInner({
  classId,
  sessionId,
  activeClassName,
  isTeacher,
}: {
  classId: string;
  sessionId: string;
  activeClassName: string;
  isTeacher: boolean;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useProfile();
  const {
    isConnected: isLiveKitConnected,
    roomName: liveKitRoomName,
    isMicEnabled: isMicActive,
    isCameraEnabled: isCameraActive,
    isScreenShareEnabled: isScreenSharing,
    participantsCount: liveParticipantsCount,
    mediaError: lkMediaError,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    publishBoardData,
    subscribeBoardData,
  } = useLiveKitBoard();

  const roomSuffix = (liveKitRoomName || `vocaship-room-${classId.toLowerCase()}`).slice(-6);

  const [liveSessionId, setLiveSessionId] = useState<string>(sessionId);
  const [liveJoinCode, setLiveJoinCode] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [currentPdfPage, setCurrentPdfPage] = useState<number>(1);
  const pdfPageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const remoteScreenStreamRef = useRef<MediaStream | null>(null);
  const lastShapeEndRef = useRef<{ x: number; y: number } | null>(null);

  // 2. Ekran & PDF Materyali Durumları
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfTextContext, setPdfTextContext] = useState<string>("");
  const [pdfPageImages, setPdfPageImages] = useState<string[]>([]);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const pdfWrapperRef = useRef<HTMLDivElement | null>(null);
  const [localMediaError, setLocalMediaError] = useState<string | null>(null);
  const mediaError = lkMediaError || localMediaError;
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

    const roleParam = searchParams.get("role");
    const boardRole: "teacher" | "student" =
      roleParam === "student" || roleParam === "attendee" ? "student" : "teacher";

    const syncLocalActiveClass = (resolvedSessionId: string) => {
      try {
        const activeSession = {
          classId,
          sessionId: resolvedSessionId,
          className: activeClassName || t("brd_default_room", "Ders / Tahta Odası"),
          role: boardRole,
          userId: userProfile?.id || undefined,
          startedAt: new Date().toISOString(),
        };
        localStorage.setItem("vocaship_active_class", JSON.stringify(activeSession));
        window.dispatchEvent(new Event("vocaship_active_class_change"));
      } catch (e) {
        console.warn("Aktif oturum kaydedilemedi:", e);
      }
    };

    syncLocalActiveClass(liveSessionId || sessionId || "");

    if (!isTeacher) {
      return () => {
        cancelled = true;
      };
    }

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
    if (!localMediaError) return;
    const timer = setTimeout(() => setLocalMediaError(null), 4000);
    return () => clearTimeout(timer);
  }, [localMediaError]);

  // Sayfadan çıkışta konuşma tanımayı temizle (Kamera/Mikrofon LiveKitRoom tarafından yönetilir)
  useEffect(() => {
    return () => {
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

  // Canlı medya kontrolleri artık %100 LiveKit (useLiveKitBoard) üzerinden yönetiliyor.

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

  const lastLoadedPdfVersionRef = useRef<number>(0);
  const serverPdfMetaRef = useRef<{ pdfUrl: string; fileName: string; version: number } | null>(null);
  const strokesByPageRef = useRef<Record<number, DrawAction[]>>({});
  const activeStrokeRef = useRef<DrawAction | null>(null);
  const lastViewportEmitTsRef = useRef<number>(0);
  const viewportTrailingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestScaleRef = useRef<number>(1.0);
  const latestPageRef = useRef<number>(1);
  latestScaleRef.current = scale;
  latestPageRef.current = currentPdfPage;

  // Güvenli yayın sarmalayıcı: öğrenci asla çizim/viewport/PDF paketi yayınlayamaz
  const teacherPublish = useCallback(
    (payload: Record<string, any>, options?: { reliable?: boolean }) => {
      if (!isTeacher) return;
      publishBoardData(payload, options);
    },
    [isTeacher, publishBoardData]
  );

  // Normalize edilmiş (0..1) tek bir DrawAction'ı canvas'a çizer
  const renderNormalizedAction = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, action: DrawAction) => {
      const w = canvas.width || 1;
      const h = canvas.height || 1;
      ctx.save();
      if (action.kind === "freehand" && action.points && action.points.length > 0) {
        if (action.tool === "highlighter") {
          ctx.globalCompositeOperation = "multiply";
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = action.color || "#facc15";
        } else if (action.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = "#000000";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle =
            action.color || (action.tool === "pen_blue" ? "#3b82f6" : "#ef4444");
        }
        ctx.lineWidth = Math.max(1.5, (action.lineWidthRatio || 0.004) * w);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        const p0 = action.points[0];
        ctx.moveTo(p0.x * w, p0.y * h);
        if (action.points.length === 1) {
          ctx.lineTo(p0.x * w + 0.1, p0.y * h + 0.1);
        } else {
          for (let i = 1; i < action.points.length; i++) {
            ctx.lineTo(action.points[i].x * w, action.points[i].y * h);
          }
        }
        ctx.stroke();
      } else if (action.kind === "shape" && action.start && action.end) {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.92;
        ctx.strokeStyle = action.color || "#38bdf8";
        ctx.lineWidth = Math.max(2, (action.lineWidthRatio || 0.003) * w);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const sx = action.start.x * w;
        const sy = action.start.y * h;
        const ex = action.end.x * w;
        const ey = action.end.y * h;
        if (action.tool === "line") {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        } else if (action.tool === "rect") {
          ctx.strokeRect(sx, sy, ex - sx, ey - sy);
        } else if (action.tool === "arrow") {
          const headLen = Math.max(10, 0.014 * w);
          const angle = Math.atan2(ey - sy, ex - sx);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.lineTo(
            ex - headLen * Math.cos(angle - Math.PI / 6),
            ey - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(ex, ey);
          ctx.lineTo(
            ex - headLen * Math.cos(angle + Math.PI / 6),
            ey - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        } else if (action.tool === "circle") {
          const rx = Math.abs(ex - sx) / 2;
          const ry = Math.abs(ey - sy) / 2;
          ctx.beginPath();
          ctx.ellipse(
            Math.min(sx, ex) + rx,
            Math.min(sy, ey) + ry,
            Math.max(rx, 1),
            Math.max(ry, 1),
            0,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        }
      } else if (action.kind === "text" && action.text && typeof action.x === "number" && typeof action.y === "number") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
        const fontPx = Math.max(14, Math.round((action.lineWidthRatio || 0.022) * w));
        ctx.font = `bold ${fontPx}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = action.color || "#f8fafc";
        ctx.fillText(action.text, action.x * w, action.y * h);
      }
      ctx.restore();
    },
    []
  );

  // Sayfa bazlı hafızadaki (strokesByPage) tüm çizimleri canvas'a yeniden çizer
  const redrawAllStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const allPages = Object.keys(strokesByPageRef.current)
      .map(Number)
      .sort((a, b) => a - b);
    for (const pNum of allPages) {
      const actions = strokesByPageRef.current[pNum] || [];
      for (const act of actions) {
        renderNormalizedAction(ctx, canvas, act);
      }
    }
  }, [renderNormalizedAction]);

  // Eğitmen görünüm (scroll / pan / zoom / sayfa) oranlarını 50ms throttle ile yayınlar
  const emitViewportThrottled = useCallback(
    (overrides?: { pageNum?: number; zoom?: number }) => {
      if (!isTeacher) return;
      const sendNow = () => {
        const el = scrollContainerRef.current;
        const maxScrollY = el ? Math.max(1, el.scrollHeight - el.clientHeight) : 1;
        const maxScrollX = el ? Math.max(1, el.scrollWidth - el.clientWidth) : 1;
        const scrollRatioY = el ? Math.max(0, Math.min(1, el.scrollTop / maxScrollY)) : 0;
        const scrollRatioX = el ? Math.max(0, Math.min(1, el.scrollLeft / maxScrollX)) : 0;
        lastViewportEmitTsRef.current = Date.now();
        teacherPublish(
          {
            type: "BOARD_VIEWPORT",
            pageNum: overrides?.pageNum ?? latestPageRef.current,
            zoom: overrides?.zoom ?? latestScaleRef.current,
            scrollRatioX,
            scrollRatioY,
          },
          { reliable: true }
        );
      };

      const elapsed = Date.now() - lastViewportEmitTsRef.current;
      if (elapsed >= 50) {
        if (viewportTrailingTimerRef.current) {
          clearTimeout(viewportTrailingTimerRef.current);
          viewportTrailingTimerRef.current = null;
        }
        sendNow();
      } else {
        if (viewportTrailingTimerRef.current) {
          clearTimeout(viewportTrailingTimerRef.current);
        }
        viewportTrailingTimerRef.current = setTimeout(() => {
          viewportTrailingTimerRef.current = null;
          sendNow();
        }, 55);
      }
    },
    [isTeacher, teacherPublish]
  );

  // Öğrenci ekranında gelen viewport (scrollRatioX / scrollRatioY) konumunu uygular
  const applyStudentViewportScroll = useCallback(
    (scrollRatioX?: number, scrollRatioY?: number) => {
      const applyOnce = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        if (typeof scrollRatioY === "number" && Number.isFinite(scrollRatioY)) {
          const maxY = Math.max(0, el.scrollHeight - el.clientHeight);
          el.scrollTop = Math.max(0, Math.min(maxY, scrollRatioY * maxY));
        }
        if (typeof scrollRatioX === "number" && Number.isFinite(scrollRatioX)) {
          const maxX = Math.max(0, el.scrollWidth - el.clientWidth);
          el.scrollLeft = Math.max(0, Math.min(maxX, scrollRatioX * maxX));
        }
      };
      requestAnimationFrame(applyOnce);
      setTimeout(applyOnce, 80);
    },
    []
  );

  const renderPdfFromArrayBuffer = useCallback(
    async (arrayBuffer: ArrayBuffer, fileName: string, targetPage = 1) => {
      setPdfFileName(fileName);
      setPdfUrl("remote-synced");
      setScale(1.0);
      setPan({ x: 0, y: 0 });
      setIsPdfLoading(true);
      try {
        const pdfjs = await loadPdfJs();
        if (!pdfjs) return { pages: [] as string[], text: "" };
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        const pages: string[] = [];
        let collectedText = "";

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          try {
            const textContent = await page.getTextContent();
            const pageStr = textContent.items
              .map((it: any) => it.str)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();
            if (pageStr) {
              collectedText += `\n[Sayfa ${i}]: ` + pageStr;
            }
          } catch {}

          const viewport = page.getViewport({ scale: 1.5 });
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = viewport.width;
          tempCanvas.height = viewport.height;
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            await page.render({ canvasContext: tempCtx, viewport }).promise;
            pages.push(tempCanvas.toDataURL("image/jpeg", 0.78));
          }
        }

        if (pages.length > 0) {
          const clamped = Math.max(1, Math.min(pages.length, targetPage));
          setPdfPageImages(pages);
          setCurrentPdfPage(clamped);
          setTimeout(() => {
            const el = pdfPageRefs.current[clamped - 1];
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 120);
        }
        return { pages, text: collectedText.trim() };
      } catch (err) {
        console.warn("PDF.js render hatası:", err);
        return { pages: [] as string[], text: "" };
      } finally {
        setIsPdfLoading(false);
      }
    },
    []
  );

  const fetchAndRenderServerPdf = useCallback(
    async (pdfPathOrUrl: string, fileName: string, pageNum = 1, version = 0) => {
      if (version && version === lastLoadedPdfVersionRef.current) {
        setCurrentPdfPage(pageNum);
        const el = pdfPageRefs.current[Math.max(0, pageNum - 1)];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      const fullUrl = pdfPathOrUrl.startsWith("http")
        ? pdfPathOrUrl
        : `${API_BASE}${pdfPathOrUrl.startsWith("/") ? "" : "/"}${pdfPathOrUrl}`;
      try {
        const res = await fetch(fullUrl);
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        if (version) lastLoadedPdfVersionRef.current = version;
        await renderPdfFromArrayBuffer(buf, fileName || "Ders Dokümanı.pdf", pageNum);
      } catch (err) {
        console.warn("Sunucu PDF indirme hatası:", err);
      }
    },
    [renderPdfFromArrayBuffer]
  );

  // Öğrenci hem sayfaya ilk girdiğinde hem de LiveKit odasına bağlandığında (RoomEvent.Connected)
  // GET /board-state çağırıp aktif PDF varsa hemen render eder
  useEffect(() => {
    if (isTeacher || !classId) return;
    let active = true;
    const syncInitialBoardState = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/classroom/classes/${encodeURIComponent(classId.trim().toLowerCase())}/board-state`
        );
        if (!res.ok || !active) return;
        const data = await res.json();
        if (active && data?.has_pdf && data?.pdf_url) {
          await fetchAndRenderServerPdf(
            data.pdf_url,
            data.active_pdf_filename || "Ders Dokümanı.pdf",
            data.page_num || 1,
            data.version || 0
          );
        }
      } catch {}
    };
    syncInitialBoardState();
    return () => {
      active = false;
    };
  }, [isTeacher, classId, isLiveKitConnected, fetchAndRenderServerPdf]);

  // PDF Dosyası Yükleme: Yerel render + Backend /board-pdf upload + LiveKit DataChannel broadcast
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);

    let extractedFullText = "";
    try {
      const arrayBuffer = await file.arrayBuffer();
      const rendered = await renderPdfFromArrayBuffer(arrayBuffer, file.name, 1);
      if (rendered.text.length > 10) {
        extractedFullText = rendered.text;
      }

      // Sunucuya PDF'i yükle ve LiveKit DataChannel ile tüm öğrencilere bildir
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(
        `${API_BASE}/api/v1/classroom/classes/${encodeURIComponent(classId)}/board-pdf`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        const ver = data.version || Date.now();
        lastLoadedPdfVersionRef.current = ver;
        serverPdfMetaRef.current = {
          pdfUrl: data.pdf_url,
          fileName: data.active_pdf_filename || file.name,
          version: ver,
        };
        await publishBoardData({
          type: "PDF_UPDATED",
          pdfUrl: data.pdf_url,
          fileName: data.active_pdf_filename || file.name,
          pageNum: 1,
          version: ver,
        });
      }
    } catch (err) {
      console.warn("PDF yükleme/yayınlama hatası:", err);
    }

    if (!extractedFullText) {
      extractedFullText = await extractTextFromPdf(file);
    }
    setPdfTextContext(extractedFullText);
  };

  const handleClearPdf = () => {
    if (!isTeacher) return;
    if (pdfUrl && pdfUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfFile(null);
    setPdfUrl(null);
    setPdfFileName(null);
    setPdfTextContext("");
    setPdfPageImages([]);
    setCurrentPdfPage(1);
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    strokesByPageRef.current = {};
    serverPdfMetaRef.current = null;
    handleClearCanvas();
    broadcastPdfClear();
    fetch(
      `${API_BASE}/api/v1/classroom/classes/${encodeURIComponent(classId)}/board-state`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clear_pdf: true }),
      }
    ).catch(() => {});
    teacherPublish({ type: "PDF_CLEARED" });
  };

  const handleGoToPdfPage = (pageNum: number) => {
    if (!isTeacher) return;
    if (pdfPageImages.length === 0) return;
    const clamped = Math.max(1, Math.min(pdfPageImages.length, pageNum));
    setCurrentPdfPage(clamped);
    const el = pdfPageRefs.current[clamped - 1];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    broadcastPdfPage(clamped);
    fetch(
      `${API_BASE}/api/v1/classroom/classes/${encodeURIComponent(classId)}/board-state`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_num: clamped }),
      }
    ).catch(() => {});
    teacherPublish({ type: "PDF_PAGE", pageNum: clamped });
    emitViewportThrottled({ pageNum: clamped });
    if (serverPdfMetaRef.current) {
      teacherPublish({
        type: "PDF_UPDATED",
        pdfUrl: serverPdfMetaRef.current.pdfUrl,
        fileName: serverPdfMetaRef.current.fileName,
        pageNum: clamped,
        version: serverPdfMetaRef.current.version,
      });
    }
  };

  // Zoom Kontrolleri (Yalnızca Eğitmen)
  const handleZoomIn = () => {
    if (!isTeacher) return;
    setScale((prev) => {
      const next = Math.min(2.5, +(prev + 0.15).toFixed(2));
      emitViewportThrottled({ zoom: next });
      return next;
    });
  };

  const handleZoomOut = () => {
    if (!isTeacher) return;
    setScale((prev) => {
      const next = Math.max(0.8, +(prev - 0.15).toFixed(2));
      emitViewportThrottled({ zoom: next });
      return next;
    });
  };

  const handleResetZoom = () => {
    if (!isTeacher) return;
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    emitViewportThrottled({ zoom: 1.0 });
  };

  // Çizimleri Temizle (Aktif sayfa bazlı)
  const handleClearCanvas = () => {
    if (!isTeacher) return;
    strokesByPageRef.current[currentPdfPage] = [];
    redrawAllStrokes();
    broadcastClear();
    teacherPublish({ type: "CLEAR_PAGE", pageNum: currentPdfPage });
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

  // Canlı Öğretmen -> Öğrenci Tahta Senkronizasyonu (Supabase Realtime: board-room-${classId})
  const {
    isRealtimeConnected,
    broadcastDrawStroke,
    broadcastDrawShape,
    broadcastDrawText,
    broadcastLaser,
    broadcastClear,
    broadcastPdfState,
    broadcastPdfPage,
    broadcastPdfClear,
    startWebRtcBroadcast,
    stopWebRtcBroadcast,
  } = useBoardRealtimeSync({
    classId,
    isTeacher,
    onRemoteStroke: (payload: BoardStrokeEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const sx = payload.canvasWidth > 0 ? canvas.width / payload.canvasWidth : 1;
      const sy = payload.canvasHeight > 0 ? canvas.height / payload.canvasHeight : 1;
      ctx.save();
      setupContextForTool(ctx, payload.tool);
      ctx.beginPath();
      ctx.moveTo(payload.from.x * sx, payload.from.y * sy);
      ctx.lineTo(payload.to.x * sx, payload.to.y * sy);
      ctx.stroke();
      ctx.restore();
    },
    onRemoteShape: (payload: BoardShapeEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const sx = payload.canvasWidth > 0 ? canvas.width / payload.canvasWidth : 1;
      const sy = payload.canvasHeight > 0 ? canvas.height / payload.canvasHeight : 1;
      const startX = payload.start.x * sx;
      const startY = payload.start.y * sy;
      const currX = payload.end.x * sx;
      const currY = payload.end.y * sy;

      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 3;
      ctx.strokeStyle = payload.color || "#ef4444";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (payload.tool === "line") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
      } else if (payload.tool === "rect") {
        ctx.beginPath();
        ctx.strokeRect(startX, startY, currX - startX, currY - startY);
      } else if (payload.tool === "arrow") {
        const headLen = 16;
        const angle = Math.atan2(currY - startY, currX - startX);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currX, currY);
        ctx.lineTo(currX - headLen * Math.cos(angle - Math.PI / 6), currY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(currX, currY);
        ctx.lineTo(currX - headLen * Math.cos(angle + Math.PI / 6), currY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (payload.tool === "circle") {
        const radiusX = Math.abs(currX - startX) / 2;
        const radiusY = Math.abs(currY - startY) / 2;
        const centerX = Math.min(startX, currX) + radiusX;
        const centerY = Math.min(startY, currY) + radiusY;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.max(radiusX, 1), Math.max(radiusY, 1), 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    },
    onRemoteText: (payload: BoardTextEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const sx = payload.canvasWidth > 0 ? canvas.width / payload.canvasWidth : 1;
      const sy = payload.canvasHeight > 0 ? canvas.height / payload.canvasHeight : 1;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      ctx.font = "bold 24px Inter, system-ui, sans-serif";
      ctx.fillStyle = payload.color || "#f8fafc";
      ctx.fillText(payload.text, payload.x * sx, payload.y * sy);
      ctx.restore();
    },
    onRemoteLaser: ({ nx, ny }) => {
      const ws = workspaceRef.current;
      if (!ws) return;
      const rect = ws.getBoundingClientRect();
      setLaserTrail((prev) => [
        ...prev.slice(-18),
        { x: nx * rect.width, y: ny * rect.height, ts: Date.now() },
      ]);
    },
    onRemoteClear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    onRemoteCanvasSnapshot: (dataUrl: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = dataUrl;
    },
    onRemotePdfState: (payload: BoardPdfStateEvent) => {
      setPdfFileName(payload.pdfFileName || "Ders Dokümanı.pdf");
      const targetPage = payload.currentPage || 1;
      let nextPages = Array.isArray(payload.pdfPageImages) ? [...payload.pdfPageImages] : [];
      if (nextPages.length === 0 && payload.activePageImage) {
        const total = Math.max(targetPage, payload.totalPages || 1);
        nextPages = Array.from({ length: total }, (_, idx) =>
          idx === targetPage - 1 ? payload.activePageImage! : ""
        ).filter(Boolean);
        // Tek sayfa görüntüsünü aktif göster
        nextPages = [payload.activePageImage];
      }
      setPdfPageImages(nextPages);
      setPdfUrl(nextPages.length > 0 ? "remote-synced" : null);
      setCurrentPdfPage(nextPages.length === 1 ? 1 : targetPage);
      if (typeof payload.zoom === "number" && payload.zoom >= 0.5 && payload.zoom <= 3) {
        setScale(payload.zoom);
      }
      setTimeout(() => {
        syncCanvasSize();
        const el = pdfPageRefs.current[(nextPages.length === 1 ? 1 : targetPage) - 1];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    onRemotePdfPage: (page: number) => {
      setCurrentPdfPage(page);
      const el = pdfPageRefs.current[page - 1];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    onRemotePdfClear: () => {
      setPdfFile(null);
      setPdfUrl(null);
      setPdfFileName(null);
      setPdfPageImages([]);
      setCurrentPdfPage(1);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    onRemoteScreenStream: () => {},
    getSyncState: () => ({
      pdfFileName,
      pdfPageImages: [],
      currentPage: currentPdfPage,
      canvasDataUrl: null,
      screenStream: null,
    }),
  });

  // Öğrenci odaya bağlandığında geç katılan tam senkronizasyon (REQUEST_FULL_SYNC) ister
  useEffect(() => {
    if (isTeacher || !isLiveKitConnected) return;
    publishBoardData({ type: "REQUEST_FULL_SYNC" }, { reliable: true });
  }, [isTeacher, isLiveKitConnected, publishBoardData]);

  // LiveKit DataChannel Dinleyicisi (Öğretmen: REQUEST_FULL_SYNC yanıtlar, Öğrenci: tüm çizim/lazer/viewport/PDF uygular)
  useEffect(() => {
    return subscribeBoardData((msg: any) => {
      if (!msg || typeof msg !== "object") return;

      // 1. EĞİTMEN: Geç katılan öğrencinin tam senkronizasyon isteğini yanıtla
      if (isTeacher) {
        if (msg.type === "REQUEST_FULL_SYNC") {
          const el = scrollContainerRef.current;
          const maxY = el ? Math.max(1, el.scrollHeight - el.clientHeight) : 1;
          const maxX = el ? Math.max(1, el.scrollWidth - el.clientWidth) : 1;
          teacherPublish(
            {
              type: "FULL_SYNC_STATE",
              pdfUrl: serverPdfMetaRef.current?.pdfUrl || null,
              fileName: serverPdfMetaRef.current?.fileName || pdfFileName,
              version: serverPdfMetaRef.current?.version || 0,
              pageNum: latestPageRef.current,
              zoom: latestScaleRef.current,
              scrollRatioX: el ? Math.max(0, Math.min(1, el.scrollLeft / maxX)) : 0,
              scrollRatioY: el ? Math.max(0, Math.min(1, el.scrollTop / maxY)) : 0,
              strokesByPage: strokesByPageRef.current,
            },
            { reliable: true }
          );
        }
        return;
      }

      // 2. ÖĞRENCİ: Eğitmenden gelen tüm canlı komutları uygula
      if (msg.type === "FULL_SYNC_STATE") {
        if (msg.strokesByPage && typeof msg.strokesByPage === "object") {
          strokesByPageRef.current = msg.strokesByPage;
        }
        if (typeof msg.zoom === "number" && msg.zoom >= 0.5 && msg.zoom <= 3) {
          setScale(msg.zoom);
        }
        if (typeof msg.pageNum === "number" && msg.pageNum >= 1) {
          setCurrentPdfPage(msg.pageNum);
        }
        const finishSync = () => {
          syncCanvasSize();
          redrawAllStrokes();
          applyStudentViewportScroll(msg.scrollRatioX, msg.scrollRatioY);
        };
        if (msg.pdfUrl) {
          fetchAndRenderServerPdf(
            msg.pdfUrl,
            msg.fileName || "Ders Dokümanı.pdf",
            msg.pageNum || 1,
            msg.version || 0
          ).then(() => setTimeout(finishSync, 140));
        } else {
          setTimeout(finishSync, 60);
        }
      } else if (msg.type === "BOARD_VIEWPORT") {
        if (typeof msg.pageNum === "number" && msg.pageNum >= 1) {
          setCurrentPdfPage(msg.pageNum);
        }
        if (typeof msg.zoom === "number" && msg.zoom >= 0.5 && msg.zoom <= 3) {
          setScale(msg.zoom);
        }
        applyStudentViewportScroll(msg.scrollRatioX, msg.scrollRatioY);
      } else if (msg.type === "PDF_UPDATED" && msg.pdfUrl) {
        fetchAndRenderServerPdf(
          msg.pdfUrl,
          msg.fileName || "Ders Dokümanı.pdf",
          msg.pageNum || 1,
          msg.version || 0
        ).then(() => setTimeout(redrawAllStrokes, 150));
      } else if (msg.type === "PDF_PAGE" && typeof msg.pageNum === "number") {
        setCurrentPdfPage(msg.pageNum);
        const el = pdfPageRefs.current[Math.max(0, msg.pageNum - 1)];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (msg.type === "PDF_CLEARED") {
        setPdfFile(null);
        setPdfUrl(null);
        setPdfFileName(null);
        setPdfPageImages([]);
        setCurrentPdfPage(1);
        strokesByPageRef.current = {};
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        }
      } else if (msg.type === "DRAW_MOVE" && msg.from && msg.to) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        renderNormalizedAction(ctx, canvas, {
          strokeId: msg.strokeId || "live",
          kind: "freehand",
          tool: msg.tool || "pen_red",
          color: msg.color || "#ef4444",
          lineWidthRatio: msg.lineWidthRatio || 0.004,
          pageNum: msg.pageNum || 1,
          points: [msg.from, msg.to],
        });
      } else if (msg.type === "DRAW_COMMIT" && msg.action) {
        const act = msg.action as DrawAction;
        const pNum = act.pageNum || 1;
        const existing = strokesByPageRef.current[pNum] || [];
        if (!existing.some((x) => x.strokeId === act.strokeId)) {
          strokesByPageRef.current[pNum] = [...existing, act];
        }
        redrawAllStrokes();
      } else if (msg.type === "LASER_MOVE" && msg.visible !== false) {
        const ws = workspaceRef.current;
        if (!ws) return;
        const rect = ws.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && typeof msg.x === "number" && typeof msg.y === "number") {
          setLaserTrail((prev) => [
            ...prev.slice(-18),
            { x: msg.x * rect.width, y: msg.y * rect.height, ts: Date.now() },
          ]);
        }
      } else if (msg.type === "CLEAR_PAGE") {
        const pNum = typeof msg.pageNum === "number" ? msg.pageNum : 1;
        strokesByPageRef.current[pNum] = [];
        redrawAllStrokes();
      } else if (msg.type === "BOARD_CLEAR") {
        strokesByPageRef.current = {};
        redrawAllStrokes();
      } else if (msg.type === "DRAW_STROKE" && msg.stroke) {
        const payload = msg.stroke as BoardStrokeEvent;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const scaleX = payload.canvasWidth ? canvas.width / payload.canvasWidth : 1;
        const scaleY = payload.canvasHeight ? canvas.height / payload.canvasHeight : 1;
        ctx.save();
        ctx.beginPath();
        setupContextForTool(ctx, payload.tool);
        ctx.moveTo(payload.from.x * scaleX, payload.from.y * scaleY);
        ctx.lineTo(payload.to.x * scaleX, payload.to.y * scaleY);
        ctx.stroke();
        ctx.restore();
      }
    });
  }, [
    isTeacher,
    pdfFileName,
    subscribeBoardData,
    teacherPublish,
    fetchAndRenderServerPdf,
    syncCanvasSize,
    redrawAllStrokes,
    renderNormalizedAction,
    applyStudentViewportScroll,
  ]);

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
        if (isTeacher) {
          const w = canvasRef.current.width || 1;
          const h = canvasRef.current.height || 1;
          const textAction: DrawAction = {
            strokeId: `txt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            kind: "text",
            tool: "text",
            color: shapeColor || "#f8fafc",
            lineWidthRatio: 24 / w,
            pageNum: currentPdfPage,
            text,
            x: textInputBox.canvasX / w,
            y: textInputBox.canvasY / h,
          };
          const existing = strokesByPageRef.current[currentPdfPage] || [];
          strokesByPageRef.current[currentPdfPage] = [...existing, textAction];
          teacherPublish({ type: "DRAW_COMMIT", action: textAction }, { reliable: true });
        }
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
    const rx = clientX - rect.left;
    const ry = clientY - rect.top;
    setLaserTrail((prev) => [
      ...prev.slice(-18),
      { x: rx, y: ry, ts: Date.now() },
    ]);
    if (isTeacher && rect.width > 0 && rect.height > 0) {
      const nx = rx / rect.width;
      const ny = ry / rect.height;
      broadcastLaser(nx, ny);
      teacherPublish(
        {
          type: "LASER_MOVE",
          x: nx,
          y: ny,
          pageNum: currentPdfPage,
          visible: true,
        },
        { reliable: false }
      );
    }
  };

  // Mouse & Touch Çizim Olayları (Canlı Önizleme / Snapshot Buffer destekli)
  const startDrawing = (clientX: number, clientY: number) => {
    if (!isTeacher) return;
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

      const w = canvas.width || 1;
      const h = canvas.height || 1;
      const toolColor =
        activeTool === "highlighter"
          ? "#facc15"
          : activeTool === "pen_blue"
          ? "#3b82f6"
          : "#ef4444";
      const baseWidth =
        activeTool === "highlighter"
          ? 22
          : activeTool === "eraser"
          ? 32
          : 4;
      const normPt = { x: coords.x / w, y: coords.y / h };
      activeStrokeRef.current = {
        strokeId: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind: "freehand",
        tool: activeTool,
        color: toolColor,
        lineWidthRatio: baseWidth / w,
        pageNum: currentPdfPage,
        points: [normPt],
      };
      teacherPublish(
        {
          type: "DRAW_MOVE",
          strokeId: activeStrokeRef.current.strokeId,
          tool: activeTool,
          color: toolColor,
          lineWidthRatio: baseWidth / w,
          pageNum: currentPdfPage,
          from: normPt,
          to: normPt,
        },
        { reliable: true }
      );
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
      lastShapeEndRef.current = coords;

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

      const w = canvas.width || 1;
      const h = canvas.height || 1;
      const fromNorm = { x: lastCoordRef.current.x / w, y: lastCoordRef.current.y / h };
      const toNorm = { x: coords.x / w, y: coords.y / h };
      if (activeStrokeRef.current) {
        activeStrokeRef.current.points = [
          ...(activeStrokeRef.current.points || []),
          toNorm,
        ];
        teacherPublish(
          {
            type: "DRAW_MOVE",
            strokeId: activeStrokeRef.current.strokeId,
            tool: activeStrokeRef.current.tool,
            color: activeStrokeRef.current.color,
            lineWidthRatio: activeStrokeRef.current.lineWidthRatio,
            pageNum: currentPdfPage,
            from: fromNorm,
            to: toNorm,
          },
          { reliable: true }
        );
      }

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
      const w = canvas.width || 1;
      const h = canvas.height || 1;

      if (isTeacher && activeStrokeRef.current) {
        const committed = activeStrokeRef.current;
        const pNum = committed.pageNum || currentPdfPage;
        const existing = strokesByPageRef.current[pNum] || [];
        strokesByPageRef.current[pNum] = [...existing, committed];
        teacherPublish({ type: "DRAW_COMMIT", action: committed }, { reliable: true });
        activeStrokeRef.current = null;
      } else if (
        isTeacher &&
        startCoordRef.current &&
        lastShapeEndRef.current &&
        (activeTool === "line" ||
          activeTool === "circle" ||
          activeTool === "rect" ||
          activeTool === "arrow")
      ) {
        const shapeAction: DrawAction = {
          strokeId: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind: "shape",
          tool: activeTool,
          color: shapeColor,
          lineWidthRatio: 3 / w,
          pageNum: currentPdfPage,
          start: { x: startCoordRef.current.x / w, y: startCoordRef.current.y / h },
          end: { x: lastShapeEndRef.current.x / w, y: lastShapeEndRef.current.y / h },
        };
        const existing = strokesByPageRef.current[currentPdfPage] || [];
        strokesByPageRef.current[currentPdfPage] = [...existing, shapeAction];
        teacherPublish({ type: "DRAW_COMMIT", action: shapeAction }, { reliable: true });
      }
    }
    isDrawingRef.current = false;
    lastCoordRef.current = null;
    startCoordRef.current = null;
    lastShapeEndRef.current = null;
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

          {!isTeacher && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wide shrink-0">
              <span>🟢 Canlı Ders İzleniyor</span>
              {isRealtimeConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
          )}

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-slate-200 text-xs font-bold shrink-0"
            title={`Oda: ${liveKitRoomName || `vocaship-room-${classId.toLowerCase()}`}`}
          >
            <span>👥 {liveParticipantsCount} Kişi Odada • #{roomSuffix}</span>
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
          {isTeacher && (
            <>
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
            </>
          )}

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
              onScroll={() => {
                if (isTeacher) emitViewportThrottled();
              }}
              onMouseDown={isTeacher ? handlePanMouseDown : undefined}
              onMouseMove={isTeacher ? handlePanMouseMove : undefined}
              onMouseUp={isTeacher ? handlePanMouseUp : undefined}
              onMouseLeave={isTeacher ? handlePanMouseUp : undefined}
              onTouchStart={isTeacher ? handlePanTouchStart : undefined}
              onTouchMove={isTeacher ? handlePanTouchMove : undefined}
              onTouchEnd={isTeacher ? handlePanTouchEnd : undefined}
              className={`w-full flex-1 min-h-0 relative rounded-2xl border border-slate-800 shadow-2xl bg-slate-900 select-none ${
                !isTeacher
                  ? "overflow-hidden pointer-events-none"
                  : activeTool === "pan"
                  ? isPanning
                    ? "overflow-auto cursor-grabbing"
                    : "overflow-auto cursor-grab"
                  : "overflow-auto"
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
                      ref={(el) => {
                        pdfPageRefs.current[idx] = el;
                      }}
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
                    if (isTeacher && activeTool !== "none" && activeTool !== "pan") {
                      startDrawing(e.clientX, e.clientY);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (isTeacher && activeTool !== "none" && activeTool !== "pan") {
                      drawMove(e.clientX, e.clientY);
                    }
                  }}
                  onMouseUp={isTeacher ? stopDrawing : undefined}
                  onMouseLeave={isTeacher ? stopDrawing : undefined}
                  onTouchStart={(e) => {
                    if (isTeacher && activeTool !== "none" && activeTool !== "pan" && e.touches.length === 1) {
                      e.preventDefault();
                      startDrawing(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (isTeacher && activeTool !== "none" && activeTool !== "pan" && e.touches.length === 1) {
                      e.preventDefault();
                      drawMove(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                  onTouchEnd={isTeacher ? stopDrawing : undefined}
                  className={`absolute inset-0 w-full h-full z-10 mix-blend-normal ${
                    !isTeacher || activeTool === "none" || activeTool === "pan"
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
                {isTeacher
                  ? t("brd_empty_title", "PDF Aç veya Pencere Yansıt")
                  : "Eğitmen Tahta Paylaşımı Bekleniyor"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2">
                {isTeacher
                  ? t("brd_empty_desc", "PDF dosyanızı açın ya da bilgisayarınızdaki Word, Excel veya PowerPoint penceresini tahtaya yansıtıp üzerine çizim yapın.")
                  : "Eğitmeniniz PDF yüklediğinde, çizim yaptığında veya ekranını yansıttığında bu alanda canlı olarak görünecektir."}
              </p>

              {isTeacher && (
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
              )}
            </div>
          )}
          </div>
        </section>

        {/* SAĞ: TEAMS TARZI BİRLEŞİK KATILIMCI GALERİSİ & DERS EYLEMLERİ */}
        <aside className="hidden md:flex w-80 shrink-0 bg-slate-900 border-l border-slate-800 p-3 flex-col gap-3 h-full overflow-hidden select-none z-20">
          {/* 1. ÜST BLOK (SABİT): LESSON ACTIONS (Yalnızca Eğitmen İçin) */}
          {isTeacher && (
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
          )}

          {/* 2. ALT BLOK (KAYDIRILABİLİR): TEK BİRLEŞİK TEAMS KATILIMCI GALERİSİ (15+ KAMERA) */}
          <TeamsParticipantGallery role={isTeacher ? "teacher" : "student"} />

          {/* 3. ALT DURUM BİLGİSİ */}
          <div className="shrink-0 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>{t("brd_zero_audio_badge", "🔒 Sıfır Ses Kaydı • LiveKit SFU Aktif")}</span>
          </div>
        </aside>
      </main>



      {/* ========================================================================= */}
      {/* 4. ALT SABİT DOCK ÇUBUĞU (FIXED DOCK - ÖĞRETMEN & ÖĞRENCİ CANLI MEDYA)   */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-2 bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl backdrop-blur-md pointer-events-auto max-w-[96vw] overflow-x-auto scrollbar-none">
        {/* Canlı Medya (Öğretmen & Öğrenci): 🎤 Mikrofon */}
        <button
          type="button"
          onClick={toggleMicrophone}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 ${
            isMicActive
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md ring-2 ring-emerald-400/40"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
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
          <span className="hidden sm:inline">{t("brd_mic_short", "Mikrofon")}</span>
        </button>

        {/* Canlı Medya (Öğretmen & Öğrenci): 📷 Kamera */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 ${
            isCameraActive
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md ring-2 ring-emerald-400/40"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
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
          <span className="hidden sm:inline">{t("brd_cam_short", "Kamera")}</span>
        </button>

        {isTeacher && (
        <>
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
        </>
        )}

        {/* PDF Sayfa Senkron Kontrolü (Yalnızca Eğitmen) */}
        {isTeacher && pdfPageImages.length > 1 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/90 border border-slate-700/70 text-[11px] font-mono text-slate-200">
            <button
              type="button"
              onClick={() => handleGoToPdfPage(currentPdfPage - 1)}
              disabled={currentPdfPage <= 1}
              className="px-1.5 py-0.5 rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
            >
              ‹
            </button>
            <span>
              {currentPdfPage}/{pdfPageImages.length}
            </span>
            <button
              type="button"
              onClick={() => handleGoToPdfPage(currentPdfPage + 1)}
              disabled={currentPdfPage >= pdfPageImages.length}
              className="px-1.5 py-0.5 rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
            >
              ›
            </button>
          </div>
        )}

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

        {/* Zoom Kontrolleri (Yalnızca Eğitmen) */}
        {isTeacher && (
        <>
        <div className="w-px h-5 bg-slate-700 mx-0.5" />

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
        </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODALLAR: ESNEK SAYAÇ & MANUEL MATERYAL GÖNDERİMİ                       */}
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
        classId={classId}
        classCode={liveJoinCode || classId}
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
