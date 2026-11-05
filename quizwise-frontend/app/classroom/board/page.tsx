"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Maximize2,
  Minimize2,
  Timer,
  Users,
  QrCode,
  Sparkles,
  Volume2,
  CheckCircle2,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  FileText,
  X,
  Shuffle,
  Check,
  ChevronRight,
  Flame,
  Award,
  BookOpen,
  Mic
} from "lucide-react";
import confetti from "canvas-confetti";
import ClassLiveQRModal from "../../components/classroom/ClassLiveQRModal";
import BoardPdfViewer from "../../components/board/BoardPdfViewer";
import LiveWhisperPanel from "../../components/board/LiveWhisperPanel";
import BoardStoryWeaveModal from "../../components/board/BoardStoryWeaveModal";

// =========================================================================
// BRANŞ VE AKILLI TAHTA TERİM VERİ MODELLERİ
// =========================================================================

export interface BoardTerm {
  id: string;
  word: string;
  phonetic: string;
  academic_definition: string;
  turkish_meaning: string;
  example: string;
  category: "science" | "history" | "math" | "english";
}

const BRANCHES = [
  { id: "science", label: "Science & Biology", icon: "🔬" },
  { id: "history", label: "History & Geography", icon: "🌍" },
  { id: "math", label: "Math & Logic", icon: "📐" },
  { id: "english", label: "Core English", icon: "📚" },
] as const;

type BranchId = (typeof BRANCHES)[number]["id"];

const BOARD_DATA: Record<BranchId, BoardTerm[]> = {
  science: [
    {
      id: "sci_1",
      word: "Mitochondria",
      phonetic: "/ˌmaɪ.təˈkɒn.dri.ən/",
      academic_definition: "Organelles that generate most of the chemical energy needed to power the cell's biochemical reactions.",
      turkish_meaning: "Mitokondri (Hücrenin enerji santrali)",
      example: "Mitochondria convert glucose into usable ATP through cellular respiration.",
      category: "science",
    },
    {
      id: "sci_2",
      word: "Photosynthesis",
      phonetic: "/ˌfoʊ.toʊˈsɪn.θə.sɪs/",
      academic_definition: "The biological process by which green plants synthesize nutrients from carbon dioxide and water using sunlight.",
      turkish_meaning: "Fotosentez (Işıkla besin sentezi)",
      example: "Chlorophyll in chloroplasts absorbs light energy to initiate photosynthesis.",
      category: "science",
    },
    {
      id: "sci_3",
      word: "Osmosis",
      phonetic: "/ɒzˈmoʊ.sɪs/",
      academic_definition: "The spontaneous net movement of solvent molecules through a selectively permeable membrane into a region of higher solute concentration.",
      turkish_meaning: "Ozmoz (Seçici geçirgen zardan su geçişi)",
      example: "Plant roots absorb groundwater primarily through the mechanism of osmosis.",
      category: "science",
    },
    {
      id: "sci_4",
      word: "Homeostasis",
      phonetic: "/ˌhoʊ.mi.oʊˈsteɪ.sɪs/",
      academic_definition: "The state of steady internal, physical, and chemical conditions maintained by living systems.",
      turkish_meaning: "Homeostaz (İç denge / dinamik kararlılık)",
      example: "Sweating and shivering are autonomic responses to preserve thermal homeostasis.",
      category: "science",
    },
    {
      id: "sci_5",
      word: "Ribosome",
      phonetic: "/ˈraɪ.bə.soʊm/",
      academic_definition: "Macromolecular machines found within all living cells that perform biological protein synthesis.",
      turkish_meaning: "Ribozom (Protein sentez fabrikası)",
      example: "Ribosomes translate messenger RNA sequences into amino acid polypeptide chains.",
      category: "science",
    },
    {
      id: "sci_6",
      word: "Metabolism",
      phonetic: "/məˈtæb.əl.ɪ.zəm/",
      academic_definition: "The chemical reactions in the body's cells that change food into energy through anabolism and catabolism.",
      turkish_meaning: "Metabolizma (Madde ve enerji dönüşümleri)",
      example: "Enzymatic catalysts significantly regulate metabolic pathways.",
      category: "science",
    },
  ],
  history: [
    {
      id: "his_1",
      word: "Renaissance",
      phonetic: "/rəˈneɪ.səns/",
      academic_definition: "A fervent period of European cultural, artistic, political and economic rebirth following the Middle Ages.",
      turkish_meaning: "Rönesans (Yeniden Doğuş Dönemi)",
      example: "The Renaissance marked the revival of classical antiquity and humanistic philosophy.",
      category: "history",
    },
    {
      id: "his_2",
      word: "Feudalism",
      phonetic: "/ˈfjuː.dəl.ɪ.zəm/",
      academic_definition: "A dominant medieval social system in which nobility held lands from the Crown in exchange for military service.",
      turkish_meaning: "Feodalizm (Derebeylik düzeni)",
      example: "Under feudalism, serfs were legally bound to cultivate the lord's estate.",
      category: "history",
    },
    {
      id: "his_3",
      word: "Industrialization",
      phonetic: "/ɪnˌdʌs.tri.ə.laɪˈzeɪ.ʃən/",
      academic_definition: "The process by which an economy is transformed from primarily agricultural to one based on the manufacturing of goods.",
      turkish_meaning: "Sanayileşme (Makineleşme süreci)",
      example: "Steam-powered engines accelerated industrialization across 18th-century Britain.",
      category: "history",
    },
    {
      id: "his_4",
      word: "Sovereignty",
      phonetic: "/ˈsɒv.rɪn.ti/",
      academic_definition: "The supreme authority and supreme power within a territory to govern political affairs without external control.",
      turkish_meaning: "Egemenlik / Hükümranlık",
      example: "National sovereignty was codified systematically in the Treaty of Westphalia.",
      category: "history",
    },
    {
      id: "his_5",
      word: "Archipelago",
      phonetic: "/ˌɑː.kɪˈpel.ə.ɡoʊ/",
      academic_definition: "An extensive group or chain of islands closely scattered in a body of water.",
      turkish_meaning: "Takımada (Adalar topluluğu)",
      example: "Indonesia is geographically classified as the world's largest archipelago.",
      category: "history",
    },
    {
      id: "his_6",
      word: "Colonization",
      phonetic: "/ˌkɒl.ə.naɪˈzeɪ.ʃən/",
      academic_definition: "The action or process of settling among and establishing control over the indigenous people of an area.",
      turkish_meaning: "Sömürgeleştirme / Kolonizasyon",
      example: "Maritime trade routes expanded rapidly during the European colonization era.",
      category: "history",
    },
  ],
  math: [
    {
      id: "mat_1",
      word: "Hypotenuse",
      phonetic: "/haɪˈpɒt.ən.juːz/",
      academic_definition: "The longest side of a right-angled triangle, opposite the right angle.",
      turkish_meaning: "Hipotenüs (Dik açının karşısındaki kenar)",
      example: "By Pythagorean theorem, the square of the hypotenuse equals the sum of the other squares.",
      category: "math",
    },
    {
      id: "mat_2",
      word: "Derivative",
      phonetic: "/dɪˈrɪv.ə.tɪv/",
      academic_definition: "A mathematical tool measuring the sensitivity to change of a function value with respect to a change in its argument.",
      turkish_meaning: "Türev (Anlık değişim oranı)",
      example: "The derivative of position with respect to elapsed time equals instantaneous velocity.",
      category: "math",
    },
    {
      id: "mat_3",
      word: "Probability",
      phonetic: "/ˌprɒb.əˈbɪl.ə.ti/",
      academic_definition: "A branch of mathematics that quantifies the likelihood of an event occurring on a scale from 0 to 1.",
      turkish_meaning: "Olasılık (İhtimal hesabı)",
      example: "Independent trials govern the binomial distribution in classical probability theory.",
      category: "math",
    },
    {
      id: "mat_4",
      word: "Logarithm",
      phonetic: "/ˈlɒɡ.ə.rɪð.əm/",
      academic_definition: "The exponent or power to which a specified base must be raised to yield a given number.",
      turkish_meaning: "Logaritma (Üslü işlem tersi)",
      example: "The decibel audio scale is fundamentally based on a base-10 logarithm.",
      category: "math",
    },
    {
      id: "mat_5",
      word: "Algorithm",
      phonetic: "/ˈæl.ɡə.rɪð.əm/",
      academic_definition: "A finite sequence of rigorous and unambiguous instructions typically used to solve a class of specific computational problems.",
      turkish_meaning: "Algoritma (Adım adım çözüm kuralı)",
      example: "Euclid's algorithm efficiently computes the greatest common divisor between two integers.",
      category: "math",
    },
    {
      id: "mat_6",
      word: "Polynomial",
      phonetic: "/ˌpɒl.ɪˈnəʊ.mi.əl/",
      academic_definition: "An algebraic expression consisting of variables and coefficients that involves only the operations of addition, subtraction, multiplication, and non-negative integer exponentiation.",
      turkish_meaning: "Polinom (Çok terimli cebirsel ifade)",
      example: "The fundamental theorem of algebra guarantees roots for any non-constant polynomial.",
      category: "math",
    },
  ],
  english: [
    {
      id: "eng_1",
      word: "Ephemeral",
      phonetic: "/ɪˈfem.ər.əl/",
      academic_definition: "Lasting for a very short period of time; fleeting, transitory or momentary.",
      turkish_meaning: "Geçici / Fani / Kısa ömürlü",
      example: "Morning mist over the valley is remarkably ephemeral once the sun emerges.",
      category: "english",
    },
    {
      id: "eng_2",
      word: "Ubiquitous",
      phonetic: "/juːˈbɪk.wɪ.təs/",
      academic_definition: "Present, appearing, or found everywhere simultaneously; omnipresent.",
      turkish_meaning: "Her yerde bulunan / Çok yaygın",
      example: "Smartphones have become a ubiquitous feature of contemporary modern culture.",
      category: "english",
    },
    {
      id: "eng_3",
      word: "Resilience",
      phonetic: "/rɪˈzɪl.jəns/",
      academic_definition: "The capacity to withstand or recover quickly from difficulties, shocks, or adverse circumstances.",
      turkish_meaning: "Dirençlilik / Psikolojik sağlamlık",
      example: "Economic resilience enables communities to navigate financial downturns without systemic collapse.",
      category: "english",
    },
    {
      id: "eng_4",
      word: "Paradigm",
      phonetic: "/ˈpær.ə.daɪm/",
      academic_definition: "A typical example, standard pattern, or comprehensive conceptual framework within which theories are formulated.",
      turkish_meaning: "Paradigma (Düşünce kalıbı / model)",
      example: "Quantum mechanics caused a profound paradigm shift in modern theoretical physics.",
      category: "english",
    },
    {
      id: "eng_5",
      word: "Pragmatic",
      phonetic: "/præɡˈmæt.ɪk/",
      academic_definition: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
      turkish_meaning: "Pragmatik / Uygulamacı / Faydacı",
      example: "The negotiating team adopted a pragmatic approach to resolve the contractual stalemate.",
      category: "english",
    },
    {
      id: "eng_6",
      word: "Articulate",
      phonetic: "/ɑːˈtɪk.jə.lət/",
      academic_definition: "Having or showing the ability to speak fluently, coherently and persuasively in public discourse.",
      turkish_meaning: "Kendini iyi ifade eden / Düzgün konuşan",
      example: "An articulate spokesperson addressed the press briefing with precision and clarity.",
      category: "english",
    },
  ],
};

const CLASS_STUDENTS = [
  "Ahmet Kaya",
  "Zeynep Başar",
  "Can Mert",
  "Selin Yılmaz",
  "Burak P.",
  "Elif Demir",
  "Mert Öztürk",
  "Ayşe Çelik",
  "Kaan Arslan",
  "Deniz Kurt",
];

export default function SmartBoardConsolePage() {
  const [selectedBranch, setSelectedBranch] = useState<BranchId>("science");
  const [boardViewMode, setBoardViewMode] = useState<"cards" | "pdf">("cards");
  const [rightPanelTab, setRightPanelTab] = useState<"whisper" | "terms">("whisper");
  const [activeTermId, setActiveTermId] = useState<string>("sci_1");
  const [coveredTerms, setCoveredTerms] = useState<BoardTerm[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modallar
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isColdCallModalOpen, setIsColdCallModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isStoryWeaveOpen, setIsStoryWeaveOpen] = useState(false);
  const [wovenStory, setWovenStory] = useState<{ story: string; usedWords: string[] } | null>(null);

  // Kronometre State'i
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerInitial, setTimerInitial] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  // Cold-Call State'i
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Seslendirme (Web Speech API)
  const speakTerm = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Terime dokunulduğunda
  const handleSelectTerm = (term: BoardTerm) => {
    setActiveTermId(term.id);
    speakTerm(term.word);

    // Sağ panele "Bugün İşlenen Terimler" olarak ekle (tekrarsız)
    setCoveredTerms((prev) => {
      if (prev.some((t) => t.id === term.id || t.word.toLowerCase() === term.word.toLowerCase())) return prev;
      return [term, ...prev];
    });
  };

  // Live Whisper mikrofonundan yakalanan terim
  const handleLiveTermCaught = (term: BoardTerm) => {
    setCoveredTerms((prev) => {
      if (prev.some((t) => t.word.toLowerCase() === term.word.toLowerCase())) return prev;
      return [term, ...prev];
    });
  };

  // Fullscreen Toggle
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

  // Kronometre Mekanizması
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            // Bitiş sesi ve konfeti
            confetti({ particleCount: 30, spread: 50 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const handleStartTimerPreset = (secs: number) => {
    setIsTimerRunning(false);
    setTimerInitial(secs);
    setTimerSeconds(secs);
    setTimeout(() => setIsTimerRunning(true), 50);
  };

  // Cold-Call Rastgele Öğrenci Seçici (Slot Ruleti)
  const handleTriggerColdCall = () => {
    setIsColdCallModalOpen(true);
    setIsSpinning(true);
    setSelectedStudent(null);

    let count = 0;
    const maxSpins = 24;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * CLASS_STUDENTS.length);
      setSelectedStudent(CLASS_STUDENTS[randIdx]);
      count++;
      if (count >= maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({ particleCount: 70, spread: 70 });
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance(CLASS_STUDENTS[randIdx]);
          u.lang = "tr-TR";
          window.speechSynthesis.speak(u);
        }
      }
    }, 90);
  };

  const currentBranchTerms = BOARD_DATA[selectedBranch];
  const activeTerm = currentBranchTerms.find((t) => t.id === activeTermId) || currentBranchTerms[0];

  return (
    <div
      data-testid="smartboard-console"
      className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative"
    >
      {/* ========================================================================= */}
      {/* 1. ÜST KONSOL ŞERİDİ (BoardOS & Branş Sekmeleri & Kontroller)              */}
      {/* ========================================================================= */}
      <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 z-20">
        {/* Sol: Geri Dönüş & BoardOS Rozeti */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/classroom"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 transition cursor-pointer active:scale-95"
            title="Sınıf Portalı'na Dön"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Sınıf Portalı</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="text-xs font-black tracking-wider uppercase font-mono">
              Vocaship BoardOS
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-mono">
              v3.4
            </span>
          </div>
        </div>

        {/* Orta: Görünüm Modu ve 4 Dokunmatik Branş Sekmesi */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
          {/* Görünüm Modu Seçici (Kartlar vs PDF) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/90 border border-slate-800 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setBoardViewMode("cards")}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none active:scale-95 ${
                boardViewMode === "cards"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Branş Terim Kartları Modu"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Branş Kartları</span>
            </button>

            <button
              type="button"
              onClick={() => setBoardViewMode("pdf")}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none active:scale-95 ${
                boardViewMode === "pdf"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
                  : "text-slate-400 hover:text-white"
              }`}
              title="İnteraktif PDF Sunum ve Çizim Katmanı"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">PDF Sunum</span>
            </button>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-800 shrink-0" />

          {/* 4 Dokunmatik Branş Sekmesi */}
          <nav className="flex items-center gap-1 sm:gap-2">
          {BRANCHES.map((b) => {
            const isSelected = selectedBranch === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setSelectedBranch(b.id);
                  const firstOfBranch = BOARD_DATA[b.id][0];
                  if (firstOfBranch) {
                    setActiveTermId(firstOfBranch.id);
                  }
                }}
                className={`min-h-[44px] px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 select-none ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span className="text-base sm:text-lg leading-none">{b.icon}</span>
                <span>{b.label}</span>
              </button>
            );
          })}
          </nav>
        </div>

        {/* Sağ: Sınıf PIN Bilgisi & Tam Ekran Butonu */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Sınıf:</span>
            <span className="text-amber-400 font-bold">10-A • VRG-4821</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition cursor-pointer active:scale-95 shadow-sm"
            title={isFullscreen ? "Pencere Moduna Dön" : "Tam Ekran Yap"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. DUAL-WORKSPACE ANA SAHNE (70% SOL / 30% SAĞ)                            */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* ======================================================================= */}
        {/* SOL PANEL (%70) - İNTERAKTİF SAHNE (PDF SUNUM VEYA BÜYÜK TAHTA KARTLARI) */}
        {/* ======================================================================= */}
        <section
          className={`flex-1 min-w-0 h-full flex flex-col justify-between ${
            boardViewMode === "pdf"
              ? "p-2 sm:p-3 overflow-hidden"
              : "p-4 sm:p-6 overflow-y-auto space-y-4"
          }`}
        >
          {boardViewMode === "pdf" ? (
            <div className="flex-1 min-h-0 h-full">
              <BoardPdfViewer
                onTermCovered={handleSelectTerm}
                activeBranch={selectedBranch}
              />
            </div>
          ) : (
            <>
              {/* Üst Bilgi Satırı */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                <span className="flex items-center gap-2 font-bold text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Dokunmatik Terim Kartları (Karta dokunarak anında seslendir ve işle)</span>
                </span>
                <span className="font-mono text-indigo-400">
                  {currentBranchTerms.length} Terim Mevcut
                </span>
              </div>

              {/* 6 Büyük Tahta Kartı (3x2 Dokunmatik Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 my-auto">
                {currentBranchTerms.map((term) => {
                  const isSelected = term.id === activeTermId;
                  const isCovered = coveredTerms.some((c) => c.id === term.id);

                  return (
                    <div
                      key={term.id}
                      data-testid={`board-card-${term.id}`}
                      onClick={() => handleSelectTerm(term)}
                      className={`p-5 rounded-3xl min-h-[160px] cursor-pointer touch-manipulation select-none transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-xl ${
                        isSelected
                          ? "scale-[1.03] ring-4 ring-indigo-500/60 border-2 border-indigo-400 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 z-10"
                          : "bg-slate-900/90 border-2 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {/* Kart Üst Başlık & Rozetler */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakTerm(term.word);
                          }}
                          className="p-2 rounded-xl bg-slate-950/80 hover:bg-indigo-600 text-indigo-300 hover:text-white transition shadow-sm cursor-pointer"
                          title="Seslendir"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {isCovered && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>İşlendi</span>
                          </span>
                        )}
                      </div>

                      {/* Kelime & Fonetik */}
                      <div className="space-y-1 my-2">
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                          {term.word}
                        </h3>
                        <p className="text-xs sm:text-sm font-mono text-amber-300 font-semibold">
                          {term.phonetic}
                        </p>
                      </div>

                      {/* Akademik Tanım & Türkçe Karşılık */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {term.academic_definition}
                        </p>
                        <div className="text-[11px] font-bold text-indigo-400 truncate">
                          🇹🇷 {term.turkish_meaning}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alt Seçili Terim Detay Çubuğu (Geniş Projektör Görünümü) */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                    Örnek Cümle & Bağlam
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium italic">
                    &ldquo;{activeTerm.example}&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => speakTerm(activeTerm.example)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition shrink-0 active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Cümleyi Dinlet</span>
                </button>
              </div>
            </>
          )}
        </section>

        {/* ======================================================================= */}
        {/* SAĞ PANEL (%30) - CANLI DERS ASİSTANI & KONTROL PANELİ                  */}
        {/* ======================================================================= */}
        <aside className="w-full md:w-[360px] lg:w-[380px] xl:w-[420px] shrink-0 h-full border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between p-4 sm:p-5 space-y-3.5">
          {/* 1. Canlı Durum Başlığı ve Asistan Sekmeleri */}
          <div className="pb-3 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-sm font-black text-white">Canlı Ders Asistanı</h4>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {coveredTerms.length} Toplam Terim
              </span>
            </div>

            {/* Asistan Sekme Seçici: Whisper vs Ders Günlüğü */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/90 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setRightPanelTab("whisper")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer select-none active:scale-95 ${
                  rightPanelTab === "whisper"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Canlı Whisper</span>
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab("terms")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer select-none active:scale-95 ${
                  rightPanelTab === "terms"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Günlük ({coveredTerms.length})</span>
              </button>
            </div>
          </div>

          {/* 2. Orta İçerik: Canlı Whisper Paneli VEYA Bugün İşlenen Terimler */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {rightPanelTab === "whisper" ? (
              <LiveWhisperPanel
                onTermCaught={handleLiveTermCaught}
                activeBranch={selectedBranch}
                alreadyCoveredIds={coveredTerms.map((t) => t.id)}
              />
            ) : (
              <div className="h-full flex flex-col space-y-2">
                <span className="text-xs font-bold text-slate-400 block">
                  Bugün İşlenen Terimler:
                </span>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {coveredTerms.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 border-2 border-dashed border-slate-800 rounded-2xl">
                      <span className="text-3xl">👆</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Tahtadaki terim kartlarına dokunduğunuzda veya mikrofon ile ders anlattığınızda işlenen kelimeler burada canlı ders günlüğüne kaydedilir.
                      </p>
                    </div>
                  ) : (
                    coveredTerms.map((t, idx) => (
                      <div
                        key={`${t.id}_${idx}`}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-right-2 duration-200"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">
                              {t.word}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              {t.turkish_meaning}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => speakTerm(t.word)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
                          title="Telaffuz Dinle"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Ders Eylem Butonları */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            {/* Sınıfça Hikaye Dokuma (Crowdsourced Story Engine) */}
            <button
              type="button"
              onClick={() => setIsStoryWeaveOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white text-xs sm:text-sm font-black flex items-center justify-between shadow-lg shadow-indigo-600/30 transition active:scale-98 cursor-pointer select-none touch-manipulation group"
              title="Kolektif İnteraktif Hikaye Dokuma Motorunu Başlat"
            >
              <div className="flex items-center gap-2">
                <span className="text-base group-hover:rotate-12 transition-transform">🪄</span>
                <span>Sınıfça Hikaye Dokuma</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold shadow-sm">
                Canlı AI
              </span>
            </button>

            {/* Dersi Bitir & AI Özet Çıkar (Özet Modalı) */}
            <button
              type="button"
              onClick={() => setIsSummaryModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Dersi Bitir & AI Özet Çıkar</span>
            </button>
          </div>
        </aside>
      </main>

      {/* ========================================================================= */}
      {/* 3. ÖĞRETMEN YAN YÜZEN ÇUBUĞU (FLOATING QUICK-DOCK)                          */}
      {/* ========================================================================= */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-slate-900/95 border-2 border-slate-700/80 p-2 rounded-3xl shadow-2xl z-40 backdrop-blur-xl">
        {/* ⏱️ Kronometre Butonu */}
        <button
          type="button"
          onClick={() => setIsTimerModalOpen(true)}
          className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-indigo-600 text-amber-400 hover:text-white flex flex-col items-center justify-center transition shadow-md active:scale-90 cursor-pointer"
          title="Akıllı Kronometre"
        >
          <Timer className="w-5 h-5" />
          <span className="text-[8px] font-bold mt-0.5">Süre</span>
        </button>

        {/* 🎯 Cold-Call (Rastgele Öğrenci Seçici) */}
        <button
          type="button"
          onClick={handleTriggerColdCall}
          className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white flex flex-col items-center justify-center transition shadow-md active:scale-90 cursor-pointer"
          title="Rastgele Öğrenci Seç (Cold-Call)"
        >
          <Shuffle className="w-5 h-5" />
          <span className="text-[8px] font-bold mt-0.5">Seçici</span>
        </button>

        {/* 📱 Sınıfı Bağla (QR Kod) */}
        <button
          type="button"
          onClick={() => setIsQRModalOpen(true)}
          className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white flex flex-col items-center justify-center transition shadow-md active:scale-90 cursor-pointer"
          title="Sınıf Bağlantı QR Kodu"
        >
          <QrCode className="w-5 h-5" />
          <span className="text-[8px] font-bold mt-0.5">Bağlan</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALLAR VE DİYALOGLAR                                                 */}
      {/* ========================================================================= */}

      {/* 1. Sınıf QR Bağlantı Modalı */}
      <ClassLiveQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        classCode="VRG-4821"
        className="10-A İngilizce (İleri Düzey)"
        gradeLevel="C1 Pro"
      />

      {/* 2. Kronometre Modalı */}
      {isTimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsTimerModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl z-10 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-black text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>Akıllı Tahta Kronometresi</span>
              </span>
              <button
                type="button"
                onClick={() => setIsTimerModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Büyük Geri Sayım Göstergesi */}
            <div className="py-4">
              <span className="text-6xl font-black font-mono text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                {Math.floor(timerSeconds / 60)}:
                {String(timerSeconds % 60).padStart(2, "0")}
              </span>
            </div>

            {/* Hızlı Süre Seçenekleri */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "30s", val: 30 },
                { label: "1 dk", val: 60 },
                { label: "2 dk", val: 120 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => handleStartTimerPreset(p.val)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                    timerInitial === p.val
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Başlat / Durdur / Sıfırla */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isTimerRunning
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? "Durdur" : "Başlat"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(timerInitial);
                }}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Sıfırla"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cold-Call Rastgele Öğrenci Seçici Modalı */}
      {isColdCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsColdCallModalOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl z-10 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-black text-white flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-rose-400" />
                <span>Rastgele Öğrenci (Cold-Call)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsColdCallModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-6 space-y-2">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
                🎯
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {selectedStudent || "Seçiliyor..."}
              </h3>
              <p className="text-xs text-slate-400">
                {isSpinning ? "Sınıf çarkı dönüyor..." : "Tebrikler! Sıradaki soru bu öğrencinin."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerColdCall}
              disabled={isSpinning}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              <span>Tekrar Seç</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. AI Dersi Bitir & Özet Çıkar Modalı */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsSummaryModalOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Ders Sonu AI Özeti</h3>
                  <p className="text-xs text-slate-400">
                    Bugün işlenen {coveredTerms.length} terim için otomatik pedagojik özet
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Özet Metni */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                Otomatik Üretilen Ders Bülteni
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Bugünkü canlı oturumda 10-A sınıfı ile birlikte temel biyoloji ve hücre fizyolojisi terminolojisi derinlemesine incelendi. Özellikle <strong>mitochondria</strong> ve <strong>photosynthesis</strong> mekanizmaları üzerinden enerji dönüşüm kavramları pekiştirildi.
              </p>
            </div>

            {/* İşlenen Terim Hapları */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 block">İşlenen Anahtar Terimler:</span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {coveredTerms.map((t) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold"
                  >
                    {t.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  confetti({ particleCount: 60, spread: 60 });
                  setIsSummaryModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                Sınıfa Ödev Olarak Gönder & Bitir ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. KOLEKTİF İNTERAKTİF HİKAYE DOKUMA MODALI (CROWDSOURCED STORY ENGINE)    */}
      {/* ========================================================================= */}
      <BoardStoryWeaveModal
        isOpen={isStoryWeaveOpen}
        onClose={() => setIsStoryWeaveOpen(false)}
        targetWords={coveredTerms.map((t) => t.word)}
        activeBranch={selectedBranch}
        onStoryComplete={(finalStory, usedWords) => {
          setWovenStory({ story: finalStory, usedWords });
        }}
      />
    </div>
  );
}

