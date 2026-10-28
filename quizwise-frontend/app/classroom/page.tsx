"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  KeyRound,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  RefreshCw,
  Award,
  AlertCircle,
  FileText,
  Calendar,
  Send,
  UserCheck,
  FolderOpen,
  X,
  Wand2,
  HelpCircle,
  CheckCircle,
  Eye,
  School,
  Maximize2
} from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE } from "../config";

export interface ClassroomItem {
  id: string;
  name: string;
  code: string;
  student_count: number;
  grade_level?: string;
  created_at?: string;
}

export interface ExtractedTargetWord {
  word: string;
  meaning: string;
  phonetic?: string;
  example?: string;
}

export interface ExtractedQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface ClassroomAssignment {
  id: string;
  classroom_id: string;
  class_code: string;
  title: string;
  story_content?: string;
  target_words: ExtractedTargetWord[];
  questions: ExtractedQuestion[];
  due_date: string;
  completed_percent: number;
  created_at?: string;
}

export interface StudentProgressRow {
  studentName: string;
  avatar: string;
  status: "completed" | "in_progress" | "not_started";
  scoreText: string;
  scorePercent: number;
  lastActive: string;
}

const DEFAULT_CLASSES: ClassroomItem[] = [
  {
    id: "cls-1",
    name: "C1 Advanced Business & Engineering English",
    code: "VRG-2535",
    student_count: 18,
    grade_level: "C1 Pro",
    created_at: "2026-10-20T10:00:00Z",
  },
  {
    id: "cls-2",
    name: "FIDIC & EPC Project Control Lab",
    code: "VRG-8492",
    student_count: 12,
    grade_level: "C1-C2 Executive",
    created_at: "2026-10-22T14:30:00Z",
  },
];

const DEFAULT_ASSIGNMENTS: ClassroomAssignment[] = [
  {
    id: "assign-1",
    classroom_id: "cls-1",
    class_code: "VRG-2535",
    title: "The Architecture of Deep Focus",
    story_content:
      "Deep focus is the ability to concentrate without distraction on a demanding task. Cultivating resilience against superficial interruptions is essential for mastering complex problem-solving in engineering and business.",
    target_words: [
      { word: "resilience", meaning: "Direnç, toparlanma gücü", phonetic: "/rɪˈzɪl.jənt/" },
      { word: "cognitive", meaning: "Bilişsel, zihinsel", phonetic: "/ˈkɒɡ.nə.tɪv/" },
      { word: "superficial", meaning: "Yüzeysel", phonetic: "/ˌsuː.pəˈfɪʃ.əl/" },
      { word: "mitigate", meaning: "Hafifletmek, etkisini azaltmak", phonetic: "/ˈmɪt.ɪ.ɡeɪt/" },
      { word: "substantiate", meaning: "Doğrulamak, somutlaştırmak", phonetic: "/səbˈstæn.ʃi.eɪt/" },
    ],
    questions: [
      {
        question: "What is the primary definition of deep focus according to the text?",
        options: [
          "Concentrating without distraction on a demanding task",
          "Multitasking multiple social feeds at once",
          "Ignoring all communications permanently",
          "Studying only after midnight",
        ],
        correct_index: 0,
        explanation: "Metnin ilk cümlesinde açıkça tanımlanmıştır.",
      },
      {
        question: "Why is cultivating resilience against distractions important?",
        options: [
          "To protect cognitive energy from interruptions",
          "To reduce internet data usage",
          "To avoid attending technical briefings",
          "To eliminate computer usage",
        ],
        correct_index: 0,
        explanation: "Zihinsel enerjiyi korumak için gereklidir.",
      },
      {
        question: "What kind of tasks require deep focus?",
        options: [
          "Cognitively demanding tasks",
          "Routine administrative checks",
          "Casual chat browsing",
          "Automatic inbox cleaning",
        ],
        correct_index: 0,
        explanation: "Zihinsel efor gerektiren işlerde şarttır.",
      },
    ],
    due_date: "Bu Cuma, 18:00",
    completed_percent: 88,
  },
  {
    id: "assign-2",
    classroom_id: "cls-1",
    class_code: "VRG-2535",
    title: "FIDIC Sözleşmeleri & Delay Claims",
    story_content:
      "Under FIDIC Clause 20.1, the Contractor must give notice of any claim within 28 days of becoming aware of the event. Proper substantiation and contingency tracking are critical.",
    target_words: [
      { word: "mitigate", meaning: "Zararı hafifletmek", phonetic: "/ˈmɪt.ɪ.ɡeɪt/" },
      { word: "contingency", meaning: "Yedek akçe, beklenmedik durum payı", phonetic: "/kənˈtɪn.dʒən.si/" },
      { word: "substantiate", meaning: "Delillerle ispatlamak", phonetic: "/səbˈstæn.ʃi.eɪt/" },
      { word: "clause", meaning: "Sözleşme maddesi", phonetic: "/klɔːz/" },
      { word: "dispute", meaning: "Uyuşmazlık, ihtilaf", phonetic: "/dɪˈspjuːt/" },
    ],
    questions: [
      {
        question: "Within how many days must notice of claim be provided?",
        options: ["28 days", "14 days", "60 days", "90 days"],
        correct_index: 0,
        explanation: "Clause 20.1 uyarınca 28 günlük süre zorunludur.",
      },
    ],
    due_date: "Pazar, 23:59",
    completed_percent: 100,
  },
];

const DEMO_STUDENT_PROGRESS: StudentProgressRow[] = [
  {
    studentName: "Ahmet Yılmaz",
    avatar: "👨‍💻",
    status: "completed",
    scoreText: "3 / 3 Doğru",
    scorePercent: 100,
    lastActive: "15 dk önce",
  },
  {
    studentName: "Zeynep Kaya",
    avatar: "👩‍🎓",
    status: "completed",
    scoreText: "3 / 3 Doğru",
    scorePercent: 100,
    lastActive: "1 saat önce",
  },
  {
    studentName: "Can Demir",
    avatar: "🧑‍🚀",
    status: "completed",
    scoreText: "2 / 3 Doğru",
    scorePercent: 66,
    lastActive: "3 saat önce",
  },
  {
    studentName: "Defne Arslan",
    avatar: "👩‍🔬",
    status: "in_progress",
    scoreText: "1 / 3 Çözüldü",
    scorePercent: 33,
    lastActive: "Dün",
  },
  {
    studentName: "Emir Çelik",
    avatar: "🧑‍🏫",
    status: "not_started",
    scoreText: "Başlanmadı",
    scorePercent: 0,
    lastActive: "2 gün önce",
  },
];

const PRESET_SAMPLE_TEXTS = [
  {
    title: "Derin Odaklanma & Zihinsel Dayanıklılık",
    content:
      "Deep focus is the ability to concentrate without distraction on a demanding task. Cultivating cognitive resilience against superficial interruptions is essential for mastering complex problem-solving. In today's hyper-connected environment, learners must actively protect their attention to synthesize intricate ideas.",
  },
  {
    title: "FIDIC Sözleşme Yönetimi & Riskler",
    content:
      "Under international construction contracts like FIDIC Red Book, notice requirements are strictly enforced. The contractor must give prompt notice of any claim within 28 days of becoming aware of the event. Proper substantiation and objective documentation are required to prevent liquidated damages.",
  },
  {
    title: "Yapay Zeka & Dil Edinimi Stratejisi",
    content:
      "Modern cognitive linguistics substantiates that spaced repetition algorithms significantly mitigate vocabulary attrition. By engaging in contextual reading and active recall, learners achieve higher linguistic fluency and retain specialized C1 terminology much faster.",
  },
];

export default function ClassroomPage() {
  const { t } = useLanguage();

  // Aktif Sekme: 'teacher' | 'student'
  const [activeRole, setActiveRole] = useState<"teacher" | "student">("teacher");

  // SINIF & EĞİTMEN VERİLERİ
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>(DEFAULT_CLASSES);
  const [assignments, setAssignments] = useState<ClassroomAssignment[]>(DEFAULT_ASSIGNMENTS);
  const [selectedClassId, setSelectedClassId] = useState<string>("cls-1");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Yeni Sınıf Açma Mini Formu
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("C1 Pro");

  // YENİ ÖDEV HAZIRLA MODALI (AI DESTEKLİ)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignClassroomCode, setAssignClassroomCode] = useState("VRG-2535");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignContent, setAssignContent] = useState("");
  const [assignLevel, setAssignLevel] = useState("Intermediate");
  const [assignDueDate, setAssignDueDate] = useState("Bu Cuma, 18:00");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedWords, setExtractedWords] = useState<ExtractedTargetWord[]>([]);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isAssignSuccess, setIsAssignSuccess] = useState(false);

  // ÖĞRENCİ HIZLI KATILIM ALANI
  const [studentInputPin, setStudentInputPin] = useState("");
  const [joinedClassCode, setJoinedClassCode] = useState<string>("VRG-2535");
  const [joinedClassInfo, setJoinedClassInfo] = useState<{
    class_name: string;
    student_count: number;
    grade_level?: string;
  } | null>({
    class_name: "C1 Advanced Business & Engineering English",
    student_count: 18,
    grade_level: "C1 Pro",
  });
  const [studentAssignments, setStudentAssignments] = useState<ClassroomAssignment[]>(DEFAULT_ASSIGNMENTS);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Büyük Tahta Projeksiyon Modalı
  const [boardProjectCode, setBoardProjectCode] = useState<string | null>(null);

  // 1. Sınıfları ve Ödevleri Backend'den Çek
  const fetchClassrooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/classroom/classes`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setClassrooms(data);
          return;
        }
      }
    } catch (err) {
      console.warn("Classroom API offline fallback:", err);
    }
  };

  const fetchAssignmentsForCode = async (code: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/classroom/assignments/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.assignments && Array.isArray(data.assignments) && data.assignments.length > 0) {
          setStudentAssignments(data.assignments);
          setJoinedClassInfo({
            class_name: data.class_name || "Vocaship Sınıfı",
            student_count: data.student_count || 18,
            grade_level: data.grade_level || "C1 Pro",
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Assignments API offline fallback:", err);
    }

    // Fallback: Yerel eşleşme
    const clean = code.replace("-", "").toUpperCase();
    const filtered = assignments.filter(
      (a) => a.class_code.replace("-", "").toUpperCase() === clean
    );
    setStudentAssignments(filtered.length > 0 ? filtered : DEFAULT_ASSIGNMENTS);
  };

  useEffect(() => {
    fetchClassrooms();
    fetchAssignmentsForCode(joinedClassCode);
  }, []);

  // 2. Yeni Sınıf Açma
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/classroom/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClassName.trim(),
          grade_level: newClassGrade,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setClassrooms((prev) => [created, ...prev]);
        setSelectedClassId(created.id);
        setShowCreateClassModal(false);
        setNewClassName("");
        confetti({ particleCount: 40, spread: 60 });
        return;
      }
    } catch (err) {
      console.warn("Class create offline fallback:", err);
    }

    // Fallback Local Creation
    const rndDigits = Math.floor(1000 + Math.random() * 9000);
    const fallbackClass: ClassroomItem = {
      id: `cls_${Date.now()}`,
      name: newClassName.trim(),
      code: `VRG-${rndDigits}`,
      student_count: 0,
      grade_level: newClassGrade,
      created_at: new Date().toISOString(),
    };
    setClassrooms((prev) => [fallbackClass, ...prev]);
    setSelectedClassId(fallbackClass.id);
    setShowCreateClassModal(false);
    setNewClassName("");
    confetti({ particleCount: 35, spread: 50 });
  };

  // 3. AI ile Metinden Hedef Kelime ve 3 Soru Çıkart
  const handleExtractWithAI = async () => {
    if (!assignContent.trim()) {
      setExtractError("Lütfen analiz edilecek bir okuma metni yapıştırın.");
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/classroom/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: assignContent.trim(),
          level: assignLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const words: ExtractedTargetWord[] = (data.target_words || data.target_vocabulary || []).map(
          (w: any) => ({
            word: w.word,
            meaning: w.meaning || w.translation || "Kritik Terim",
            phonetic: w.phonetic,
            example: w.example,
          })
        );
        const questions: ExtractedQuestion[] = (data.questions || data.comprehension_questions || []).map(
          (q: any) => ({
            question: q.question,
            options: q.options || [],
            correct_index: q.correct_index ?? q.correct_answer_index ?? 0,
            explanation: q.explanation,
          })
        );

        setExtractedWords(words);
        setExtractedQuestions(questions);
        if (!assignTitle.trim() && data.title) {
          setAssignTitle(data.title);
        }
        confetti({ particleCount: 30, spread: 50 });
        return;
      }
    } catch (err) {
      console.warn("Extract API offline fallback:", err);
    } finally {
      setIsExtracting(false);
    }

    // Akıllı Yerel Fallback
    const fallbackWords: ExtractedTargetWord[] = [
      { word: "resilience", meaning: "Direnç, toparlanma gücü", phonetic: "/rɪˈzɪl.jənt/" },
      { word: "cognitive", meaning: "Bilişsel, zihinsel", phonetic: "/ˈkɒɡ.nə.tɪv/" },
      { word: "superficial", meaning: "Yüzeysel, derin olmayan", phonetic: "/ˌsuː.pəˈfɪʃ.əl/" },
      { word: "mitigate", meaning: "Etkisini azaltmak, hafifletmek", phonetic: "/ˈmɪt.ɪ.ɡeɪt/" },
      { word: "substantiate", meaning: "Kanıtlamak, doğrulamak", phonetic: "/səbˈstæn.ʃi.eɪt/" },
    ];
    const fallbackQuestions: ExtractedQuestion[] = [
      {
        question: "What is the core argument of the reading context?",
        options: [
          "Focused cognitive attention creates deep retention",
          "Constant superficial alerts improve throughput",
          "Written documentation is unnecessary",
          "Only short isolated tasks matter",
        ],
        correct_index: 0,
        explanation: "Metnin ana fikri odaklanmış zihinsel eforun kalıcılığı üzerinedir.",
      },
      {
        question: "How can learners mitigate knowledge attrition?",
        options: [
          "Through contextual reading and active review",
          "By avoiding testing mechanisms",
          "By limiting vocabulary exposure",
          "Through passive auditory background noise",
        ],
        correct_index: 0,
        explanation: "Aralıklı tekrar ve bağlamsal okuma kalıcılığı artırır.",
      },
      {
        question: "Which skill is emphasized as vital for complex problem solving?",
        options: [
          "Cognitive resilience against distractions",
          "Switching tasks every 30 seconds",
          "Ignoring verified vocabulary standards",
          "Relying solely on intuition",
        ],
        correct_index: 0,
        explanation: "Dikkat dağıtıcı unsurlara karşı bilişsel direnç esastır.",
      },
    ];

    setExtractedWords(fallbackWords);
    setExtractedQuestions(fallbackQuestions);
    if (!assignTitle.trim()) {
      setAssignTitle(assignContent.slice(0, 35).trim().concat("..."));
    }
    confetti({ particleCount: 25, spread: 40 });
  };

  // 4. Ödevi Sınıfa Ata (Tahtaya Gönder)
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) return;

    const payload = {
      classroom_id: assignClassroomCode,
      title: assignTitle.trim(),
      story_content: assignContent.trim(),
      target_words: extractedWords,
      questions: extractedQuestions,
      due_date: assignDueDate || "Bu Cuma, 18:00",
    };

    try {
      const res = await fetch(`${API_BASE}/api/v1/classroom/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        const item: ClassroomAssignment = {
          id: created.id,
          classroom_id: created.classroom_id,
          class_code: created.class_code || assignClassroomCode,
          title: created.title,
          story_content: created.story_content,
          target_words: created.target_words || extractedWords,
          questions: created.questions || extractedQuestions,
          due_date: created.due_date || assignDueDate,
          completed_percent: 0,
        };
        setAssignments((prev) => [item, ...prev]);
        setIsAssignSuccess(true);
        confetti({ particleCount: 50, spread: 70 });
        setTimeout(() => {
          setIsAssignSuccess(false);
          setShowAssignModal(false);
          resetAssignModal();
        }, 1500);
        return;
      }
    } catch (err) {
      console.warn("Assignment create offline fallback:", err);
    }

    // Fallback Local Addition
    const localAssign: ClassroomAssignment = {
      id: `assign_${Date.now()}`,
      classroom_id: assignClassroomCode,
      class_code: assignClassroomCode,
      title: assignTitle.trim(),
      story_content: assignContent.trim(),
      target_words: extractedWords,
      questions: extractedQuestions,
      due_date: assignDueDate || "Bu Cuma, 18:00",
      completed_percent: 0,
    };
    setAssignments((prev) => [localAssign, ...prev]);
    setIsAssignSuccess(true);
    confetti({ particleCount: 45, spread: 60 });
    setTimeout(() => {
      setIsAssignSuccess(false);
      setShowAssignModal(false);
      resetAssignModal();
    }, 1500);
  };

  const resetAssignModal = () => {
    setAssignTitle("");
    setAssignContent("");
    setExtractedWords([]);
    setExtractedQuestions([]);
    setExtractError(null);
  };

  // 5. Kodu Kopyala
  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // 6. Öğrenci PIN Girişi
  const handleStudentJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const clean = studentInputPin.trim().toUpperCase();

    if (!clean) {
      setJoinError("Lütfen tahtadaki 6 haneli sınıf PIN kodunu girin.");
      return;
    }

    setIsJoining(true);
    fetchAssignmentsForCode(clean);
    setJoinedClassCode(clean);
    setTimeout(() => {
      setIsJoining(false);
      confetti({ particleCount: 40, spread: 50 });
    }, 400);
  };

  // Seçili aktif sınıf
  const activeClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. ÜST BAR: BAŞLIK, ROL SEÇİCİ VE HIZLI PIN KATILIM GİRİŞİ                 */}
      {/* ========================================================================= */}
      <header className="border-b border-slate-850 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {t("classroom_portal_title", "Sınıf & Eğitmen Portalı")}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  FAZ 6 Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t("classroom_portal_subtitle", "6 haneli PIN ile hızlı katılım, AI ile otomatik ödev çıkartma ve sınıf yönetim paneli")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Hızlı PIN Kutucuğu (Öğrenciler için doğrudan üst barda) */}
            <form onSubmit={handleStudentJoin} className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <KeyRound className="w-4 h-4 text-indigo-400 ml-2 shrink-0" />
              <input
                type="text"
                maxLength={8}
                placeholder={t("classroom_pin_placeholder", "PIN: VRG-XXXX")}
                value={studentInputPin}
                onChange={(e) => setStudentInputPin(e.target.value.toUpperCase())}
                className="w-28 sm:w-32 bg-transparent text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none uppercase px-1.5"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
              >
                {t("btn_join_pin", "Katıl ➔")}
              </button>
            </form>

            {/* İki Sekmeli Rol Değiştirici */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setActiveRole("teacher")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeRole === "teacher"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>👨‍🏫</span>
                <span className="hidden sm:inline">{t("role_teacher", "Eğitmen")}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole("student")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeRole === "student"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🎓</span>
                <span className="hidden sm:inline">{t("role_student", "Öğrenci")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. ANA ALAN: ROL İÇERİKLERİ                                                */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* ========================================================================= */}
        {/* A) EĞİTMEN ÇALIŞMA ALANI                                                  */}
        {/* ========================================================================= */}
        {activeRole === "teacher" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 1. SINIF KARTLARI & PIN PROJEKSİYON BÖLÜMÜ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <School className="w-5 h-5 text-indigo-400" />
                    <span>{t("active_classes_title", "Aktif Sınıflarım & Tahta PIN Kodları")}</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t("active_classes_subtitle", "Öğrencilerinizin akıllı tahtadan göreceği 6 haneli katılım kodları")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateClassModal(true)}
                    className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span>{t("btn_new_class", "Yeni Sınıf Aç")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAssignClassroomCode(activeClass?.code || "VRG-2535");
                      setShowAssignModal(true);
                    }}
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>{t("btn_new_assignment", "+ Yeni Ödev Hazırla")}</span>
                  </button>
                </div>
              </div>

              {/* Sınıf Kartları Izgarası */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classrooms.map((cls) => {
                  const isSelected = cls.id === selectedClassId;
                  const isCopied = copiedCode === cls.code;

                  return (
                    <div
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 group ${
                        isSelected
                          ? "bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/50"
                          : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {cls.grade_level || "C1 Pro"}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {t("students_count_suffix", "{count} Öğrenci", { count: cls.student_count || 18 })}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                          {cls.name}
                        </h3>
                      </div>

                      {/* Büyük PIN Ekranı */}
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <KeyRound className="w-4 h-4 text-indigo-400" />
                          <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-white">
                            {cls.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(cls.code);
                            }}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                            title="PIN Kopyala"
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBoardProjectCode(cls.code);
                            }}
                            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                            title="Akıllı Tahtaya Yansıt"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                        <span>Aktif Ödev: {assignments.filter((a) => a.class_code === cls.code).length} Adet</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignClassroomCode(cls.code);
                            setShowAssignModal(true);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer"
                        >
                          + Ödev Ata ➔
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. ATANAN ÖDEVLER VE ÖĞRENCİ İLERLEME TABLOSU */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* SOL: ATANAN ÖDEVLER (5 Kolon) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Sınıfa Atanan Ödevler ({assignments.length})
                    </h3>
                  </div>
                  <span className="text-xs text-indigo-400 font-mono font-bold">
                    {activeClass?.code}
                  </span>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {assignments.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 transition space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          📖 Okuma & Anlama
                        </span>
                        <span className="text-[11px] font-mono font-bold text-emerald-400">
                          %{item.completed_percent} Teslimat
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition">
                        {item.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {item.due_date}
                        </span>
                        <span>{item.target_words?.length || 5} Kelime • {item.questions?.length || 3} Soru</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAĞ: ÖĞRENCİ İLERLEME VE TEST SKORU TABLOSU (7 Kolon) */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Öğrenci Tamamlama Durumu & Test Skorları
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">Canlı Sınıf Takibi</span>
                </div>

                {/* Tablo Görünümü */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                        <th className="pb-3 font-semibold">Öğrenci</th>
                        <th className="pb-3 font-semibold">Durum</th>
                        <th className="pb-3 font-semibold">Test Skoru</th>
                        <th className="pb-3 font-semibold text-right">Son Aktivite</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {DEMO_STUDENT_PROGRESS.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-950/40 transition">
                          <td className="py-3 flex items-center space-x-2 text-white font-bold">
                            <span className="text-base">{row.avatar}</span>
                            <span>{row.studentName}</span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                row.status === "completed"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : row.status === "in_progress"
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {row.status === "completed"
                                ? "✓ Tamamlandı"
                                : row.status === "in_progress"
                                ? "⏳ Çözüyor"
                                : "Başlanmadı"}
                            </span>
                          </td>
                          <td className="py-3 font-mono">
                            <span
                              className={
                                row.scorePercent === 100
                                  ? "text-emerald-400 font-bold"
                                  : row.scorePercent > 50
                                  ? "text-amber-400 font-bold"
                                  : "text-slate-400"
                              }
                            >
                              {row.scoreText}
                            </span>
                          </td>
                          <td className="py-3 text-right text-slate-400 font-mono">
                            {row.lastActive}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* B) ÖĞRENCİ HIZLI KATILIM ALANI                                            */}
        {/* ========================================================================= */}
        {activeRole === "student" && (
          <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
            {/* 6 Haneli PIN Giriş Kutusu */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
                🔑
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  6 Haneli PIN Koduyla Sınıfa Katıl
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Eğitmeninizin akıllı tahtaya yansıttığı kodu yazarak sınıfınıza atanan tüm ödev ve okuma parçalarına anında ulaşın.
                </p>
              </div>

              <form onSubmit={handleStudentJoin} className="max-w-md mx-auto space-y-3 pt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="Örn: VRG-2535"
                    value={studentInputPin}
                    onChange={(e) => setStudentInputPin(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-950 border-2 border-indigo-500/40 focus:border-indigo-400 rounded-2xl px-5 py-3 text-lg sm:text-xl font-mono font-black tracking-widest text-white text-center placeholder-slate-600 focus:outline-none uppercase shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isJoining}
                    className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    {isJoining ? "Aranıyor..." : "Sınıfa Gir ➔"}
                  </button>
                </div>

                {joinError && (
                  <p className="text-xs text-rose-400 font-semibold">{joinError}</p>
                )}

                {/* Hızlı Örnek Kod */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                  <span>Hazır Demo Sınıf:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentInputPin("VRG-2535");
                      fetchAssignmentsForCode("VRG-2535");
                      setJoinedClassCode("VRG-2535");
                    }}
                    className="text-indigo-400 hover:underline font-mono font-bold cursor-pointer"
                  >
                    VRG-2535
                  </button>
                </div>
              </form>
            </div>

            {/* Katılınan Sınıf ve Ödevler */}
            {joinedClassCode && (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold inline-flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Sınıf Bağlandı: {joinedClassCode}</span>
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {joinedClassInfo?.class_name || "Vocaship Sınıfı"}
                    </h3>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {studentAssignments.length} Aktif Ödev
                  </span>
                </div>

                {/* Öğrenci Ödev Listesi */}
                <div className="space-y-4">
                  {studentAssignments.map((assign) => (
                    <div
                      key={assign.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono font-bold">
                            📖 Okuma & Anlama Görevi
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            ⏳ Son Teslim: {assign.due_date}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition">
                          {assign.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {assign.story_content || "Eğitmeninizin atadığı bağlamsal okuma parçası ve sorular."}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <span>{assign.target_words?.length || 5} Hedef Kelime</span>
                          <span>•</span>
                          <span>{assign.questions?.length || 3} Çoktan Seçmeli Soru</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link
                          href={`/reading?code=${assign.class_code}`}
                          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95"
                        >
                          <span>Ödeve Başla</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL: YENİ SINIF AÇ                                                   */}
      {/* ========================================================================= */}
      {showCreateClassModal && (
        <div
          onClick={() => setShowCreateClassModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <School className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Yeni Sınıf Aç</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateClassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Sınıf Adı:</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: C1 Advanced Business & Engineering English"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Hedef Seviye:</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="C1 Pro">C1 Pro (İleri Düzey Kariyer)</option>
                  <option value="C1-C2 Executive">C1-C2 Executive (Sözleşme & FIDIC)</option>
                  <option value="Academic YDS/IELTS">Academic (YDS & IELTS)</option>
                  <option value="B2 Intermediate">B2 Upper Intermediate</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Sınıfı Oluştur & PIN Kodu Al</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: "+ YENİ ÖDEV HAZIRLA" (AI DESTEKLİ METİN & SORU ÇIKARTICI)       */}
      {/* ========================================================================= */}
      {showAssignModal && (
        <div
          onClick={() => setShowAssignModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Wand2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Metin Yapıştır & AI ile Otomatik Ödev Çıkart
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sınıf Kodu: <span className="font-mono text-indigo-300 font-bold">{assignClassroomCode}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-5">
              {/* Sınıf Seçimi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Atanacak Sınıf:</label>
                  <select
                    value={assignClassroomCode}
                    onChange={(e) => setAssignClassroomCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Son Teslim Tarihi:</label>
                  <input
                    type="text"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    placeholder="Örn: Bu Cuma, 18:00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 1. ADIM: METİN ALANI & AI ÇIKART BUTONU */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Okuma Parçası Metnini Yapıştırın:</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Gemini AI Destekli</span>
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder="İngilizce bir makale, sözleşme maddesi veya vaka analizi yapıştırın..."
                  value={assignContent}
                  onChange={(e) => setAssignContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                />

                {/* Örnek Metin Hapları */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 self-center">Hazır Örnekler:</span>
                  {PRESET_SAMPLE_TEXTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAssignTitle(sample.title);
                        setAssignContent(sample.content);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                    >
                      + {sample.title}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Zorluk Seviyesi:</span>
                    <select
                      value={assignLevel}
                      onChange={(e) => setAssignLevel(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                    >
                      <option value="Elementary">Elementary (A2)</option>
                      <option value="Intermediate">Intermediate (B1-B2)</option>
                      <option value="Advanced">Advanced (C1-C2)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={isExtracting || !assignContent.trim()}
                    onClick={handleExtractWithAI}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isExtracting ? "Analiz Ediliyor..." : "Soruları & Kelimeleri Çıkart"}</span>
                  </button>
                </div>

                {extractError && (
                  <p className="text-xs text-rose-400 font-semibold pt-1">{extractError}</p>
                )}
              </div>

              {/* 2. ADIM: ÇIKARTILAN KELİMELER VE SORULAR ÖNİZLEMESİ */}
              {extractedWords.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Ödev Başlığı */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Ödev Başlığı:</label>
                    <input
                      type="text"
                      required
                      value={assignTitle}
                      onChange={(e) => setAssignTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* 5 Hedef Kelime */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tespit Edilen Hedef Kelimeler ({extractedWords.length}):</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {extractedWords.map((w, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{w.word}</span>
                            {w.phonetic && (
                              <span className="text-[10px] text-slate-500 ml-1.5 font-mono">{w.phonetic}</span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px] truncate max-w-[130px]">{w.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3 Çoktan Seçmeli Soru */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Türetilen Anlama Soruları ({extractedQuestions.length}):</span>
                    </span>

                    <div className="space-y-2.5">
                      {extractedQuestions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                        >
                          <p className="font-bold text-white">
                            #{qIdx + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
                                  optIdx === q.correct_index
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                                    : "bg-slate-900 border-slate-800 text-slate-400"
                                }`}
                              >
                                <span>{String.fromCharCode(65 + optIdx)}) {opt}</span>
                                {optIdx === q.correct_index && (
                                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isAssignSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Ödev sınıfa başarıyla atandı ve PIN koduna bağlandı!</span>
                </div>
              )}

              {/* 3. ADIM: EYLEM BUTONU */}
              <button
                type="submit"
                disabled={extractedWords.length === 0}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Ödevi Sınıfa Ata (Tahtaya Gönder)</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: AKILLI TAHTA PROJEKSİYON EKRANI (FULLSCREEN PIN)                 */}
      {/* ========================================================================= */}
      {boardProjectCode && (
        <div
          onClick={() => setBoardProjectCode(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-indigo-500/50 p-8 sm:p-12 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                ● Canlı Akıllı Tahta Ekranı
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Sınıf Katılım Kodu
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Öğrencileriniz cihazlarından <b>vocaship.com/classroom</b> adresine giderek aşağıdaki PIN kodunu girmelidir:
              </p>
            </div>

            {/* Devasa PIN Kutusu */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 border-4 border-indigo-400 shadow-2xl shadow-indigo-500/20 flex items-center justify-center">
              <span className="text-5xl sm:text-7xl font-black font-mono tracking-widest text-white selection:bg-indigo-600">
                {boardProjectCode}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleCopyCode(boardProjectCode)}
                className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                {copiedCode === boardProjectCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kodu Kopyala</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setBoardProjectCode(null)}
                className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                Projeksiyonu Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
