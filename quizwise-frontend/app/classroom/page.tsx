"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Tv,
  KeyRound,
  Archive,
  BookOpen,
  HelpCircle,
  Sparkles,
  Calendar,
  X,
  Trash2,
  CheckCircle2,
  School,
  FileText,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";
import ClassCard, { ClassroomItem } from "../components/classroom/ClassCard";
import ClassPinModal, { generateClassPin } from "../components/classroom/ClassPinModal";
import { BoardLessonSummaryData } from "./board/components/BoardSummaryModal";

const DEFAULT_CLASSES: ClassroomItem[] = [
  {
    id: "cls-1",
    name: "10-A İngilizce",
    code: "7A2-5K9",
    student_count: 24,
    created_at: "2026-10-20T10:00:00Z",
  },
  {
    id: "cls-2",
    name: "Genel Pratik Grubu",
    code: "3M8-2B1",
    student_count: 16,
    created_at: "2026-10-22T14:30:00Z",
  },
  {
    id: "cls-3",
    name: "9-B Dil Sınıfı",
    code: "9T4-6A0",
    student_count: 19,
    created_at: "2026-10-25T11:00:00Z",
  },
];

const DEFAULT_ARCHIVES: BoardLessonSummaryData[] = [
  {
    id: "arch-1",
    className: "10-A İngilizce",
    lessonTitle: "Etkileşimli Okuma & Cümle Analizi",
    date: "8 Kasım 2026 • 14:30",
    summaryPoints: [
      "Okuma materyali sınıf tahtasında incelendi ve ana bölümler analiz edildi.",
      "Öğrencilerle rastgele söz hakkı eşliğinde soru-cevap turları yapıldı.",
      "Temel çıkarımlar ve cümle kalıpları özetlendi.",
    ],
    keyConcepts: ["Okuduğunu Anlama", "Kelime Dağarcığı", "Cümle Yapısı", "Telaffuz", "Özet"],
    questions: [
      { question: "Ders boyunca işlenen parçanın ana fikri neydi?" },
      { question: "Öğrendiğiniz yeni kelimeleri birer cümlede nasıl kullanırsınız?" },
      { question: "Bu konuyu kendi kelimelerinizle nasıl özetlersiniz?" },
    ],
  },
  {
    id: "arch-2",
    className: "Genel Pratik Grubu",
    lessonTitle: "Günlük Diyalog & Dinleme Egzersizleri",
    date: "7 Kasım 2026 • 10:15",
    summaryPoints: [
      "Günlük yaşam senaryoları üzerinden konuşma pratikleri yapıldı.",
      "Dinleme parçalarındaki kilit ifadeler tahtaya aktarıldı.",
      "Öğrencilerin akıcı konuşma refleksleri geliştirildi.",
    ],
    keyConcepts: ["Günlük Dil", "Dinleme Becerisi", "Rol Paylaşımı", "Soru Kalıpları", "Geri Bildirim"],
    questions: [
      { question: "Diyalogda geçen en önemli kalıp ifade hangisiydi?" },
      { question: "Benzer bir durumda kendinizi nasıl ifade ederdiniz?" },
    ],
  },
];

function ClassroomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Aktif Sekme: 'classes' | 'archive'
  const initialTab = searchParams.get("tab") === "archive" ? "archive" : "classes";
  const [activeTab, setActiveTab] = useState<"classes" | "archive">(initialTab);

  // Sınıf Listesi
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>(DEFAULT_CLASSES);
  const [selectedClassId, setSelectedClassId] = useState<string>("cls-1");

  // PIN Modalı
  const [pinModalClass, setPinModalClass] = useState<ClassroomItem | null>(null);

  // Yeni Sınıf Açma Modalı
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  // Ders Arşivi Verileri
  const [archives, setArchives] = useState<BoardLessonSummaryData[]>(DEFAULT_ARCHIVES);
  const [archiveSearch, setArchiveSearch] = useState("");

  // Hızlı Öğrenci PIN Girişi
  const [showJoinPinModal, setShowJoinPinModal] = useState(false);
  const [studentPin, setStudentPin] = useState("");

  // 1. LocalStorage'dan Sınıfları ve Ders Arşivini Yükle
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedClasses = localStorage.getItem("vocaship_classes");
        if (savedClasses) {
          const parsed = JSON.parse(savedClasses);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setClassrooms(parsed);
          }
        }

        const savedArchives = localStorage.getItem("vocaship_board_archives");
        if (savedArchives) {
          const parsedArch = JSON.parse(savedArchives);
          if (Array.isArray(parsedArch) && parsedArch.length > 0) {
            setArchives(parsedArch);
          }
        }
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
  }, []);

  // 2. Yeni Sınıf Açma
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newCls: ClassroomItem = {
      id: `cls_${Date.now()}`,
      name: newClassName.trim(),
      code: generateClassPin(),
      student_count: 0,
      created_at: new Date().toISOString(),
    };

    const updated = [newCls, ...classrooms];
    setClassrooms(updated);
    setSelectedClassId(newCls.id);
    try {
      localStorage.setItem("vocaship_classes", JSON.stringify(updated));
    } catch {}

    setNewClassName("");
    setShowCreateClassModal(false);
    confetti({ particleCount: 40, spread: 60 });
  };

  // 3. Sınıf Silme
  const handleDeleteClass = (id: string) => {
    const updated = classrooms.filter((c) => c.id !== id);
    setClassrooms(updated);
    try {
      localStorage.setItem("vocaship_classes", JSON.stringify(updated));
    } catch {}
    if (selectedClassId === id && updated.length > 0) {
      setSelectedClassId(updated[0].id);
    }
  };

  // 4. Arşiv Silme
  const handleDeleteArchive = (id: string) => {
    const updated = archives.filter((a) => a.id !== id);
    setArchives(updated);
    try {
      localStorage.setItem("vocaship_board_archives", JSON.stringify(updated));
    } catch {}
  };

  // 5. Öğrenci PIN ile Katılım
  const handleStudentJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = studentPin.trim().toUpperCase();
    if (!clean) return;
    router.push(`/reading?code=${encodeURIComponent(clean)}`);
  };

  const filteredArchives = archives.filter(
    (a) =>
      a.className.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      a.lessonTitle.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      a.keyConcepts.some((kc) => kc.toLowerCase().includes(archiveSearch.toLowerCase()))
  );

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-4rem)] flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. ÜST ŞERİT (TOP BAR): TEK SATIRDA BAŞLIK VE YENİ SINIF BUTONU            */}
      {/* ========================================================================= */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Sol: Başlık ve Sekmeler */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>🎓 Sınıflarım</span>
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Sınıf yönetimi, akıllı tahta konsolu ve ders arşivi
                </p>
              </div>
            </div>

            {/* İki Sekme: [ 🏫 Sınıflarım ] ve [ 🗂️ Ders Arşivi ] */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("classes")}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "classes"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🏫</span>
                <span>Sınıflarım</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {classrooms.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("archive")}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "archive"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🗂️</span>
                <span>Ders Arşivi</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {archives.length}
                </span>
              </button>
            </div>
          </div>

          {/* Sağ: Eylemler */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowJoinPinModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>PIN ile Katıl</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateClassModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Sınıf Aç</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. ANA İÇERİK ALANI                                                       */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* ======================================================================= */}
        {/* TAB 1: SINIFLARIM IZGARASI                                              */}
        {/* ======================================================================= */}
        {activeTab === "classes" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Kayıtlı Sınıflar</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({classrooms.length} Aktif Sınıf)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Akıllı tahtayı başlatmak veya davet kodu üretmek için sınıf kartının ••• menüsünü kullanın.
                </p>
              </div>

              <Link
                href="/classroom/board"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Akıllı Tahta Konsoluna Git</span>
              </Link>
            </div>

            {/* Sınıf Kartları Izgarası */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classrooms.map((cls) => (
                <ClassCard
                  key={cls.id}
                  classroom={cls}
                  isSelected={cls.id === selectedClassId}
                  onSelect={() => setSelectedClassId(cls.id)}
                  onOpenPinModal={() => setPinModalClass(cls)}
                  onProjectToBoard={() => {
                    router.push(
                      `/classroom/board?classId=${cls.id}&className=${encodeURIComponent(cls.name)}`
                    );
                  }}
                  onDeleteClass={() => handleDeleteClass(cls.id)}
                />
              ))}

              {/* Boş Yeni Sınıf Ekleme Kartı */}
              <button
                type="button"
                onClick={() => setShowCreateClassModal(true)}
                className="p-6 rounded-3xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center gap-2 min-h-[140px] text-slate-400 hover:text-white cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center transition">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Yeni Sınıf Ekle</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: DERS ARŞİVİ (BoardSummaryModal'dan Gelen Kayıtlar)               */}
        {/* ======================================================================= */}
        {activeTab === "archive" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Arşiv Üst Filtre Barı */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Archive className="w-4 h-4 text-indigo-400" />
                  <span>Tamamlanan Ders Arşivleri</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Akıllı tahta seansı sonunda AI tarafından üretilen pedagojik özetler ve soru setleri
                </p>
              </div>

              {/* Arama Kutusu */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Arşivde ders veya konu ara..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Arşiv Kartları Listesi */}
            {filteredArchives.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                <Archive className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">Kayıtlı Ders Özeti Bulunamadı</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Akıllı Tahta Konsolunda dersi tamamlayıp "Dersi Bitir" butonuna bastığınızda ders özeti otomatik olarak buraya kaydedilecektir.
                </p>
                <Link
                  href="/classroom/board"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Akıllı Tahtayı Başlat</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredArchives.map((arch) => (
                  <div
                    key={arch.id}
                    className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl space-y-4 group transition"
                  >
                    {/* Üst Satır: Sınıf Adı, Tarih ve Sil Butonu */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {arch.className}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {arch.date}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition pt-1">
                          {arch.lessonTitle}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteArchive(arch.id)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                        title="Arşivi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 3 Maddelik Özet */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>3 Maddelik Ders Çıkarımı</span>
                      </span>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {arch.summaryPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Kilit Kavramlar */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 block">Kilit Kavramlar:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {arch.keyConcepts.map((kc, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium"
                          >
                            #{kc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pekiştirme Soruları */}
                    {arch.questions && arch.questions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          <span>Pekiştirme Soruları ({arch.questions.length}):</span>
                        </span>
                        <div className="space-y-1">
                          {arch.questions.map((q, i) => (
                            <p key={i} className="text-xs text-slate-300 bg-slate-950/50 p-2 rounded-xl">
                              <b className="text-amber-400 mr-1.5">{i + 1}.</b>
                              {q.question}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. MODALLAR: YENİ SINIF AÇ, PIN GÖSTER, PIN İLE KATIL                     */}
      {/* ========================================================================= */}

      {/* A) Yeni Sınıf Aç Modalı */}
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
                  placeholder="Örn: 10-A İngilizce veya Pratik Grubu"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Sınıf açıldığında 6 haneli benzersiz bir katılım kodu (Örn: 7A2-5K9) otomatik oluşturulacaktır.
              </p>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Sınıfı Oluştur</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B) Katılım PIN Modalı (ClassPinModal) */}
      <ClassPinModal
        isOpen={Boolean(pinModalClass)}
        onClose={() => setPinModalClass(null)}
        classCode={pinModalClass?.code || null}
        className={pinModalClass?.name}
        onRegeneratePin={(newPin) => {
          if (pinModalClass) {
            const updated = classrooms.map((c) =>
              c.id === pinModalClass.id ? { ...c, code: newPin } : c
            );
            setClassrooms(updated);
            try {
              localStorage.setItem("vocaship_classes", JSON.stringify(updated));
            } catch {}
          }
        }}
      />

      {/* C) Öğrenci Hızlı PIN Giriş Modalı */}
      {showJoinPinModal && (
        <div
          onClick={() => setShowJoinPinModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl">
              🔑
            </div>
            <div>
              <h3 className="text-base font-bold text-white">PIN Kodu ile Derse Katıl</h3>
              <p className="text-xs text-slate-400 pt-1">
                Öğretmeninizin tahtada paylaştığı 6 haneli kodu yazın
              </p>
            </div>

            <form onSubmit={handleStudentJoin} className="space-y-3">
              <input
                type="text"
                maxLength={8}
                placeholder="Örn: 7A2-5K9"
                value={studentPin}
                onChange={(e) => setStudentPin(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-center font-mono font-bold text-lg text-white uppercase placeholder-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                Derse Bağlan ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassroomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClassroomContent />
    </Suspense>
  );
}
