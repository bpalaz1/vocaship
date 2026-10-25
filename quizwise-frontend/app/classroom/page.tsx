"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  FileText,
  Wand2,
  CheckCircle2,
  Clock,
  Share2,
  Copy,
  Plus,
  Trash2,
  Volume2,
  RotateCw,
  ArrowRight,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  KeyRound
} from "lucide-react";
import ShareModal from "../components/ShareModal";
import TargetVocabularyFlashcards from "../components/reading/TargetVocabularyFlashcards";
import { API_BASE } from "../config";
import { useLanguage } from "../context/LanguageContext";

interface VocabularyItem {
  word: string;
  phonetic?: string;
  meaning: string;
  example?: string;
}

interface QuestionItem {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation?: string;
}

interface TeacherStory {
  id: string;
  title: string;
  level: string;
  content: string;
  topic: string;
  target_vocabulary: VocabularyItem[];
  comprehension_questions: QuestionItem[];
  status: "pending" | "approved";
  visibility: "class_only" | "public";
  share_code?: string;
  created_at: string;
}

export default function ClassroomPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"create" | "queue">("create");
  const [creationMode, setCreationMode] = useState<"paste" | "magic">("paste");

  // Form State
  const [pastedText, setPastedText] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Intermediate");
  const [magicTopic, setMagicTopic] = useState("");
  const [magicWords, setMagicWords] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // İncelenen / Düzenlenen Hikaye Önizlemesi
  const [previewStory, setPreviewStory] = useState<{
    title: string;
    level: string;
    topic: string;
    content: string;
    target_vocabulary: VocabularyItem[];
    comprehension_questions: QuestionItem[];
    visibility: "class_only" | "public";
  } | null>(null);
  const [vocabTab, setVocabTab] = useState<"flashcard" | "edit">("flashcard");
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [questionMode, setQuestionMode] = useState<"interactive" | "edit">("interactive");

  // Gönderilen Hikayeler Listesi
  const [stories, setStories] = useState<TeacherStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  // Paylaşım Modalı & Kopyalama Bildirimi
  const [shareModalConfig, setShareModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    itemType: "story";
    itemId: string;
    story?: any;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Hikayeleri Yükle
  const fetchStories = async () => {
    setLoadingStories(true);
    try {
      const res = await fetch(`${API_BASE}/classroom/stories`);
      if (res.ok) {
        const data = await res.json();
        setStories(data || []);
      }
    } catch (err) {
      console.error("Hikayeler yüklenemedi:", err);
    } finally {
      setLoadingStories(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // 2. Metinden Soru ve Kelime Çıkar (AI Extract)
  const handleExtractFromText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    setIsExtracting(true);
    try {
      const res = await fetch(`${API_BASE}/classroom/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: pastedText.trim(),
          level: selectedLevel,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Metin analiz edilemedi.");
        return;
      }

      const data = await res.json();
      setPreviewStory({
        title: data.title || "Yeni Okuma Parçası",
        level: selectedLevel,
        topic: data.topic || "Genel Okuma",
        content: pastedText.trim(),
        target_vocabulary: data.target_vocabulary || [],
        comprehension_questions: data.comprehension_questions || [],
        visibility: "class_only",
      });
      setUserAnswers({});
    } catch (err) {
      console.error(err);
      alert("Yapay zeka analiz servisine bağlanılamadı.");
    } finally {
      setIsExtracting(false);
    }
  };

  // 3. Sihirli Konu ile Hikaye Üret (Generate Magic Story)
  const handleGenerateMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicTopic.trim()) return;

    setIsExtracting(true);
    try {
      const wordsList = magicWords
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean);

      const res = await fetch(`${API_BASE}/reading/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: selectedLevel,
          topic: magicTopic.trim(),
          target_words: wordsList.length > 0 ? wordsList : undefined,
          length_words: 250,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Hikaye üretilemedi.");
        return;
      }

      const data = await res.json();
      setPreviewStory({
        title: data.title || magicTopic.trim(),
        level: data.level || selectedLevel,
        topic: data.topic || magicTopic.trim(),
        content: data.content || "",
        target_vocabulary: (data.target_vocabulary || []).map((v: any) => ({
          word: v.word,
          phonetic: v.phonetic || "",
          meaning: v.turkish_meaning || v.meaning || "",
          example: v.context_sentence || v.example || "",
        })),
        comprehension_questions: data.comprehension_questions || [],
        visibility: "class_only",
      });
      setUserAnswers({});
    } catch (err) {
      console.error(err);
      alert("Hikaye üretimi sırasında hata oluştu.");
    } finally {
      setIsExtracting(false);
    }
  };

  // 4. Hikayeyi Sınıfa Gönder & Kaydet
  const handleSubmitStory = async () => {
    if (!previewStory || !previewStory.title.trim() || !previewStory.content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/classroom/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewStory),
      });

      if (res.ok) {
        setPreviewStory(null);
        setPastedText("");
        setMagicTopic("");
        setMagicWords("");
        await fetchStories();
        setActiveTab("queue");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Hikaye kaydedilemedi.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Denetim Onayı Ver (Approve)
  const handleApproveStory = async (storyId: string) => {
    try {
      const res = await fetch(`${API_BASE}/classroom/stories/${storyId}/approve`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchStories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Ödev Olarak Ata (Metni Panoya Kopyala)
  const handleCopyAssignment = (story: TeacherStory) => {
    const text = `📚 Vocaship Okuma Ödevi: ${story.title}\n🎯 Seviye: ${story.level} | Konu: ${story.topic}\n🔗 Katılım Kodu: ${story.share_code || "VC-CLASS"}\n👉 Vocaship'e girip "Kod ile Katıl" butonuna basarak ödevi tamamlayabilirsiniz!`;
    navigator.clipboard.writeText(text);
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // TTS Seslendirme
  const speakText = (text: string, lang: string = "en-US") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    window.speechSynthesis.speak(utt);
  };

  const filteredStories = stories.filter((s) => {
    if (statusFilter === "all") return true;
    return s.status === statusFilter;
  });

  const pendingCount = stories.filter((s) => s.status === "pending").length;
  const approvedCount = stories.filter((s) => s.status === "approved").length;

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ÜST BAŞLIK VE ÖĞRETMEN VİTRİNİ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>{t("teacher_panel_badge", "ÖĞRETMEN & EĞİTİMCİ PANELİ")}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Sınıfım & Hikaye Oluşturucu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {t("teacher_panel_desc", "Kendi okuma parçalarınızı sınıfa ekleyin, yapay zekayla 4-5 hedef kelime ve 3 soruyu otomatik çıkartın, ödev olarak atayın veya denetim kuyruğunu yönetin.")}
          </p>
        </div>

        {/* ANA SEKMELER */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "create"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("btn_new_story_assign", "Yeni Hikaye / Ödev")}</span>
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "queue"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t("btn_audit_queue", "Gönderilenler & Denetim")}</span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: YENİ HİKAYE & ÖDEV GÖNDER */}
      {/* ========================================================================= */}
      {activeTab === "create" && (
        <div className="space-y-8">
          {!previewStory ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
              {/* OLUŞTURMA YÖNTEMİ SEÇİCİSİ */}
              <div className="grid grid-cols-2 gap-3 max-w-md mb-6">
                <button
                  type="button"
                  onClick={() => setCreationMode("paste")}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border text-xs sm:text-sm font-bold transition ${
                    creationMode === "paste"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{t("tab_paste_text", "A) Metin Yapıştır & Çıkart")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("magic")}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border text-xs sm:text-sm font-bold transition ${
                    creationMode === "magic"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  <span>{t("tab_magic_topic", "B) Sihirli Konu ile Üret")}</span>
                </button>
              </div>

              {creationMode === "paste" ? (
                /* SEÇENEK A: METİN YAPIŞTIR & ÇIKART */
                <form onSubmit={handleExtractFromText} className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{t("paste_title", "İngilizce Metni veya Ders Notunu Yapıştır")}</h3>
                      <p className="text-xs text-slate-400">{t("paste_desc", "Yapay zeka metinden 4-5 hedef kelimeyi ve 3 anlama sorusunu saniyeler içinde çıkartır.")}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 font-medium">{t("target_level_label", "Hedef Seviye:")}</span>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-bold focus:border-indigo-500 outline-none"
                      >
                        <option value="Elementary">Elementary (A1-A2)</option>
                        <option value="Intermediate">Intermediate (B1-B2)</option>
                        <option value="Advanced">Advanced (C1-C2)</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    required
                    placeholder={t("paste_placeholder", "Örn: Ancient sailors navigated across vast oceans using constellations...")}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 outline-none resize-y leading-relaxed font-sans"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isExtracting || !pastedText.trim()}
                      className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-40"
                    >
                      {isExtracting ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>Yapay Zeka Analiz Ediyor...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t("btn_extract_ai_words", "Yapay Zeka ile Soruları & Kelimeleri Çıkar")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* SEÇENEK B: SİHİRLİ KONU İLE ÜRET */
                <form onSubmit={handleGenerateMagic} className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white">Sihirli Hikaye & Okuma Parçası Üret</h3>
                    <p className="text-xs text-slate-400">İstediğin konuyu ve bu haftanın kelimelerini yaz, sistem sıfırdan pedagojik okuma parçası yazsın.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hikaye Konusu / Teması *</label>
                      <input
                        type="text"
                        required
                        placeholder={t("placeholder_magic_prompt", "Örn: Mars'a ilk ayak basan astronotların yaşadığı gizemli bir keşif öyküsü yazsın...")}
                        value={magicTopic}
                        onChange={(e) => setMagicTopic(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t("label_student_level", "Öğrenci Seviyesi *")}</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-indigo-300 font-bold focus:border-indigo-500 outline-none"
                      >
                        <option value="Elementary">Elementary (A1-A2)</option>
                        <option value="Intermediate">Intermediate (B1-B2)</option>
                        <option value="Advanced">Advanced (C1-C2)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      İçinde Geçmesi İstenen Kelimeler (İsteğe bağlı, virgülle ayırın)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: telescope, orbit, atmosphere, discovery"
                      value={magicWords}
                      onChange={(e) => setMagicWords(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isExtracting || !magicTopic.trim()}
                      className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-40"
                    >
                      {isExtracting ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Hikaye Yazılıyor & Sorular Hazırlanıyor...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          <span>🪄 {t("btn_generate_magic_story", "Sihirli Hikayeyi Üret")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ==================== ÖNİZLEME & DÜZENLEME EKRANI ==================== */
            <div className="bg-slate-900/80 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6 animate-in fade-in duration-300 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="text-xl font-black text-white">{t("story_review_title", "Hikaye & Soru İnceleme Ekranı")}</h3>
                    <p className="text-xs text-slate-400">{t("story_review_subtitle", "Çıkartılan kelimeleri ve soruları inceleyip sınıfınıza göndermeden önce düzenleyebilirsiniz.")}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewStory(null)}
                  className="text-xs font-semibold text-slate-400 hover:text-white self-start sm:self-auto cursor-pointer"
                >
                  ← {t("btn_cancel_restart", "Vazgeç & Yeniden Başla")}
                </button>
              </div>

              {/* Başlık, Seviye, Konu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t("label_title", "Başlık")}</label>
                  <input
                    type="text"
                    value={previewStory.title}
                    onChange={(e) => setPreviewStory({ ...previewStory, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{t("label_topic", "Konu / Tema")}</label>
                  <input
                    type="text"
                    value={previewStory.topic}
                    onChange={(e) => setPreviewStory({ ...previewStory, topic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-amber-300 font-semibold focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Okuma Metni */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{t("label_reading_passage", "Okuma Parçası Metni")}</label>
                <textarea
                  rows={6}
                  value={previewStory.content}
                  onChange={(e) => setPreviewStory({ ...previewStory, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 focus:border-indigo-500 outline-none resize-y leading-relaxed font-sans"
                />
              </div>

              {/* HEDEF KELİMELER KARTI */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Çıkartılan Hedef Kelimeler ({previewStory.target_vocabulary.length})</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setVocabTab("flashcard")}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                          vocabTab === "flashcard"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        👁️ Flashcard
                      </button>
                      <button
                        type="button"
                        onClick={() => setVocabTab("edit")}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                          vocabTab === "edit"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        ✏️ Düzenle
                      </button>
                    </div>

                    {vocabTab === "edit" && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewStory({
                            ...previewStory,
                            target_vocabulary: [
                              ...previewStory.target_vocabulary,
                              { word: "new word", meaning: "anlamı", phonetic: "/.../", example: "" },
                            ],
                          });
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/10 border border-indigo-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t("modal_add_word_title", "Kelime Ekle")}</span>
                      </button>
                    )}
                  </div>
                </div>

                {vocabTab === "flashcard" ? (
                  <TargetVocabularyFlashcards
                    vocabulary={previewStory.target_vocabulary}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {previewStory.target_vocabulary.map((vocab, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={vocab.word}
                              onChange={(e) => {
                                const updated = [...previewStory.target_vocabulary];
                                updated[idx].word = e.target.value;
                                setPreviewStory({ ...previewStory, target_vocabulary: updated });
                              }}
                              className="bg-transparent border-b border-indigo-500/40 text-sm font-black text-indigo-300 outline-none max-w-[140px]"
                            />
                            <button
                              type="button"
                              onClick={() => speakText(vocab.word)}
                              className="text-slate-400 hover:text-white"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = previewStory.target_vocabulary.filter((_, i) => i !== idx);
                              setPreviewStory({ ...previewStory, target_vocabulary: updated });
                            }}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Türkçe Anlamı"
                          value={vocab.meaning}
                          onChange={(e) => {
                            const updated = [...previewStory.target_vocabulary];
                            updated[idx].meaning = e.target.value;
                            setPreviewStory({ ...previewStory, target_vocabulary: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-semibold outline-none mb-1.5"
                        />

                        <input
                          type="text"
                          placeholder="Örnek Cümle"
                          value={vocab.example || ""}
                          onChange={(e) => {
                            const updated = [...previewStory.target_vocabulary];
                            updated[idx].example = e.target.value;
                            setPreviewStory({ ...previewStory, target_vocabulary: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 italic outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ANLAMA SORULARI (COMPREHENSION QUESTIONS) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Okuma Anlama Soruları ({previewStory.comprehension_questions.length} Soru)</span>
                  </span>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setQuestionMode("interactive")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        questionMode === "interactive"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🧪 İnteraktif Test Modu
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuestionMode("edit")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        questionMode === "edit"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ✏️ Soruları Düzenle
                    </button>
                  </div>
                </div>

                {questionMode === "interactive" ? (
                  /* 1. İNTERAKTİF TEST DENEYİMİ */
                  <div className="space-y-4">
                    {previewStory.comprehension_questions.map((q, qIdx) => {
                      const isAnswered = userAnswers[qIdx] !== undefined;
                      const selectedOpt = userAnswers[qIdx];
                      const correctIndex = q.correct_answer_index;
                      const isQuestionCorrect = isAnswered && selectedOpt === correctIndex;

                      return (
                        <div
                          key={qIdx}
                          className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3.5 shadow-inner"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-sm sm:text-base font-semibold text-slate-100 flex items-start gap-2">
                              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {qIdx + 1}
                              </span>
                              <span className="pt-0.5">{q.question}</span>
                            </h4>
                            {isAnswered && (
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                                  isQuestionCorrect
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                }`}
                              >
                                {isQuestionCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {isQuestionCorrect ? "Doğru" : "Yanlış"}
                              </span>
                            )}
                          </div>

                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 ${isAnswered ? "pointer-events-none" : ""}`}>
                            {q.options.map((opt, optIdx) => {
                              const isSelected = isAnswered && selectedOpt === optIdx;
                              const isCorrectChoice = optIdx === correctIndex;

                              let containerStyle = "";
                              if (!isAnswered) {
                                // Başlangıç Durumu (Initial): Nötr koyu gri, Hover: MAVİ
                                containerStyle =
                                  "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-200 cursor-pointer active:ring-2 active:ring-emerald-400 active:bg-emerald-500/20 transition-colors";
                              } else {
                                if (isCorrectChoice) {
                                  if (isSelected) {
                                    // Kullanıcının seçtiği şık DOĞRU ise: Kalıcı YEŞİL
                                    containerStyle =
                                      "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm pointer-events-none";
                                  } else {
                                    // Yanlış seçildiyse, gerçek doğru cevap olan şık YEŞİL aydınlansın
                                    containerStyle =
                                      "border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-sm pointer-events-none";
                                  }
                                } else if (isSelected) {
                                  // Tıklanan şık YANLIŞ ise: Kalıcı KIRMIZI
                                  containerStyle =
                                    "border-rose-500 bg-rose-500/20 text-rose-300 shadow-sm pointer-events-none";
                                } else {
                                  containerStyle =
                                    "border-slate-800/60 bg-slate-900/40 text-slate-600 opacity-40 pointer-events-none";
                                }
                              }

                              const letterBadge = (
                                <span
                                  className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${
                                    !isAnswered
                                      ? "bg-slate-800 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-300"
                                      : isCorrectChoice && isSelected
                                      ? "bg-emerald-500 text-slate-950 font-bold"
                                      : isCorrectChoice
                                      ? "bg-emerald-500/30 text-emerald-300 font-bold"
                                      : isSelected
                                      ? "bg-rose-500 text-white font-bold"
                                      : "bg-slate-800/50 text-slate-600"
                                  }`}
                                >
                                  {["A", "B", "C", "D"][optIdx]}
                                </span>
                              );

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={isAnswered}
                                  onClick={() => {
                                    if (userAnswers[qIdx] !== undefined) return;
                                    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                  }}
                                  className={`group p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left flex items-center justify-between gap-3 shadow-sm ${containerStyle}`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <input
                                      type="radio"
                                      name={`classroom_test_q_${qIdx}`}
                                      checked={userAnswers[qIdx] === optIdx}
                                      onChange={() => {}}
                                      disabled={isAnswered}
                                      className="accent-emerald-500 cursor-pointer shrink-0 pointer-events-none"
                                    />
                                    {letterBadge}
                                    <span className="leading-snug break-words">{opt}</span>
                                  </div>

                                  {isAnswered && isCorrectChoice && (
                                    <span className="flex items-center gap-1 text-emerald-300 shrink-0 font-bold text-xs bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                      <Check className="w-3 h-3" />
                                      <span className="hidden sm:inline">{isSelected ? "Doğru" : "Doğru Cevap"}</span>
                                    </span>
                                  )}
                                  {isAnswered && isSelected && !isCorrectChoice && (
                                    <span className="flex items-center gap-1 text-rose-300 shrink-0 font-bold text-xs bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                                      <X className="w-3 h-3" />
                                      <span className="hidden sm:inline">Yanlış</span>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* 2. DÜZENLEME MODU (Öğretmen metin ve şıkları düzenler) */
                  <div className="space-y-4">
                    {previewStory.comprehension_questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {qIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => {
                              const updated = [...previewStory.comprehension_questions];
                              updated[qIdx].question = e.target.value;
                              setPreviewStory({ ...previewStory, comprehension_questions: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white font-semibold outline-none"
                          />
                        </div>

                        {/* 4 Şık ve Doğru Cevap Seçici (Statik Yeşil Kaldırıldı) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correct_answer_index === optIdx;
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center space-x-2 p-2 rounded-xl border transition ${
                                  isCorrect
                                    ? "bg-slate-800/80 border-indigo-500/60 text-indigo-200"
                                    : "bg-slate-900 border-slate-800 text-slate-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct_edit_${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => {
                                    const updated = [...previewStory.comprehension_questions];
                                    updated[qIdx].correct_answer_index = optIdx;
                                    setPreviewStory({ ...previewStory, comprehension_questions: updated });
                                  }}
                                  className="accent-indigo-500 cursor-pointer"
                                />
                                <span className="text-[11px] font-bold text-slate-500">
                                  {["A", "B", "C", "D"][optIdx]}:
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const updated = [...previewStory.comprehension_questions];
                                    updated[qIdx].options[optIdx] = e.target.value;
                                    setPreviewStory({ ...previewStory, comprehension_questions: updated });
                                  }}
                                  className="w-full bg-transparent text-xs outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GÖRÜNÜRLÜK & KAYDETME ÇUBUĞU */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-semibold">Yayın Kapsamı:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPreviewStory({ ...previewStory, visibility: "class_only" })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        previewStory.visibility === "class_only"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-950 text-slate-400 border border-slate-800"
                      }`}
                    >
                      Sadece Sınıfıma Özel
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewStory({ ...previewStory, visibility: "public" })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        previewStory.visibility === "public"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-950 text-slate-400 border border-slate-800"
                      }`}
                    >
                      Genel Kütüphaneye Aç (Onaylı)
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setPreviewStory(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitStory}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Sınıfıma Gönder & Kaydet</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GÖNDERİLEN HİKAYELER & DENETİM KUYRUĞU */}
      {/* ========================================================================= */}
      {activeTab === "queue" && (
        <div className="space-y-6">
          {/* FİLTRE ÇUBUĞU */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tümü ({stories.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === "pending"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Denetim Bekleyen ({pendingCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Onaylananlar ({approvedCount})</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab("create")}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 font-semibold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Ekle</span>
            </button>
          </div>

          {loadingStories ? (
            <div className="py-24 text-center text-slate-500 text-sm">Hikayeler yükleniyor...</div>
          ) : filteredStories.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-white mb-1">Bu Filtrede Hikaye Bulunmuyor</h3>
              <p className="text-xs text-slate-400 mb-4">Yeni bir metin yapıştırıp sınıfınıza ödev olarak gönderebilirsiniz.</p>
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Hikaye Ekle
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStories.map((story) => {
                const isExpanded = expandedStoryId === story.id;
                const isPending = story.status === "pending";

                return (
                  <div
                    key={story.id}
                    className={`p-6 rounded-3xl border transition-all duration-300 ${
                      isPending
                        ? "bg-slate-900/70 border-amber-500/40 shadow-lg shadow-amber-500/5"
                        : "bg-slate-900/60 border-slate-800 hover:border-indigo-500/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Seviye & Konu Rozetleri */}
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
                          {story.level}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium">
                          {story.topic}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[11px]">
                          {story.target_vocabulary?.length || 0} Kelime
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[11px]">
                          {story.comprehension_questions?.length || 0} Soru
                        </span>
                      </div>

                      {/* Durum Rozeti */}
                      <div>
                        {isPending ? (
                          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>⏳ Denetim Bekliyor (Pedagojik Filtre)</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>✅ Onaylandı & Sınıfta Yayında</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                      {story.content}
                    </p>

                    {/* Genişletilmiş İçerik ve Sorular */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                          <h4 className="text-xs font-bold text-slate-400 mb-2">Tam Metin:</h4>
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">{story.content}</p>
                        </div>

                        {/* Kelimeler */}
                        {story.target_vocabulary?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Hedef Kelimeler:</h4>
                            <div className="flex flex-wrap gap-2">
                              {story.target_vocabulary.map((v, i) => (
                                <div
                                  key={i}
                                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center space-x-1.5"
                                >
                                  <span className="font-bold text-indigo-300">{v.word}</span>
                                  <span className="text-slate-500">→</span>
                                  <span className="text-emerald-400">{v.meaning}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sorular */}
                        {story.comprehension_questions?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Anlama Soruları:</h4>
                            <div className="space-y-2">
                              {story.comprehension_questions.map((q, qIndex) => (
                                <div key={qIndex} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                                  <span className="font-bold text-amber-300 mr-2">Soru {qIndex + 1}:</span>
                                  <span className="text-slate-200">{q.question}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Alt Eylemler Çubuğu */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/60 mt-4">
                      <div className="flex items-center space-x-2">
                        {story.share_code && (
                          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300">
                            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{story.share_code}</span>
                          </div>
                        )}
                        <button
                          onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              <span>Gizle</span>
                              <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              <span>İçeriği & Soruları İncele</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isPending && (
                          <button
                            onClick={() => handleApproveStory(story.id)}
                            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Hemen Onayla</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleCopyAssignment(story)}
                          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                            copiedId === story.id
                              ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                              : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
                          }`}
                        >
                          {copiedId === story.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Ödev Kopyalandı!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Ödev Olarak Ata</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            setShareModalConfig({
                              isOpen: true,
                              title: story.title,
                              itemType: "story",
                              itemId: story.id,
                              story: story,
                            })
                          }
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Sınıfla Paylaş</span>
                        </button>

                        <Link
                          href="/reading"
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
                        >
                          <span>Oku</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PAYLAŞIM MODALI */}
      {shareModalConfig && (
        <ShareModal
          isOpen={shareModalConfig.isOpen}
          onClose={() => setShareModalConfig(null)}
          title={shareModalConfig.title}
          itemType={shareModalConfig.itemType}
          itemId={shareModalConfig.itemId}
          story={shareModalConfig.story}
        />
      )}
    </main>
  );
}
