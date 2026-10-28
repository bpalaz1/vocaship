"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  BookOpen,
  Mic,
  Share2,
  Users,
  Gift,
  ShieldCheck,
  Zap,
  Play,
  RotateCw,
  Copy,
  Check,
  ChevronDown,
  GraduationCap,
  Building2,
  Scale,
  ExternalLink,
} from "lucide-react";

// ============================================================================
// 1. İNTERAKTİF CÜMLE SANDBOX TOKEN TANIMLARI
// ============================================================================
interface InteractiveToken {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  definition: string;
  exampleEn: string;
  exampleTr: string;
  category: string;
}

const INTERACTIVE_TOKENS: Record<string, InteractiveToken> = {
  mitigate: {
    id: "mitigate",
    word: "mitigate",
    ipa: "/ˈmɪt.ɪ.ɡeɪt/",
    meaning: "Hafifletmek, etkisini azaltmak, yatıştırmak",
    definition: "To make something less harmful, severe, unpleasant, or bad.",
    exampleEn: "The team managed to mitigate the risks by analyzing the critical path.",
    exampleTr: "Ekip, kritik yolu analiz ederek riskleri hafifletmeyi başardı.",
    category: "Proje Kontrol & Risk",
  },
  "critical path": {
    id: "critical path",
    word: "critical path",
    ipa: "/ˌkrɪt.ɪ.kəl ˈpɑːθ/",
    meaning: "Kritik Yol (P6 CPM ağ çizelgesi en uzun aktivite zinciri)",
    definition: "The sequence of stages determining the minimum total project duration.",
    exampleEn: "Any delay along the critical path directly pushes back the final handover date.",
    exampleTr: "Kritik yol üzerindeki herhangi bir gecikme doğrudan nihai teslim tarihini öteler.",
    category: "Primavera P6 & Çizelgeleme",
  },
  risks: {
    id: "risks",
    word: "risks",
    ipa: "/rɪsks/",
    meaning: "Riskler, potansiyel tehlike ve maliyet sapmaları",
    definition: "Situations involving exposure to danger, loss, or contingency variance.",
    exampleEn: "Proactive risk mitigation preserves the baseline budget margin.",
    exampleTr: "Proaktif risk hafifletme, temel bütçe marjını korur.",
    category: "Kurumsal Finans",
  },
  analyzing: {
    id: "analyzing",
    word: "analyzing",
    ipa: "/ˈæn.ə.laɪ.zɪŋ/",
    meaning: "Analiz etmek, ayrıntılı olarak incelemek",
    definition: "Examining methodically and in detail the constitution or structure of data.",
    exampleEn: "Analyzing schedule performance index (SPI) keeps projects on track.",
    exampleTr: "Zamanlama performans endeksini (SPI) analiz etmek projelerin takvimde kalmasını sağlar.",
    category: "EVM & Metrikler",
  },
};

// ============================================================================
// 2. VİTRİN DESTE KARTLARI (3D FLIP KARTLARI)
// ============================================================================
interface ShowcaseDeckCard {
  id: string;
  deckTitle: string;
  levelBadge: string;
  icon: string;
  word: string;
  ipa: string;
  meaning: string;
  exampleEn: string;
  exampleTr: string;
  cardCount: number;
}

const SHOWCASE_DECK_CARDS: ShowcaseDeckCard[] = [
  {
    id: "core3000",
    deckTitle: "Global Core 3000",
    levelBadge: "A1 - B2 Temel Dağarcık",
    icon: "🌐",
    word: "comprehensive",
    ipa: "/ˌkɒm.prɪˈhen.sɪv/",
    meaning: "Kapsamlı, geniş içerikli, eksiksiz",
    exampleEn: "We conducted a comprehensive review of the entire operational pipeline.",
    exampleTr: "Tüm operasyonel iş akışının kapsamlı bir incelemesini gerçekleştirdik.",
    cardCount: 3000,
  },
  {
    id: "business",
    deckTitle: "Business & Sektörel",
    levelBadge: "C1 EVM, Finans & FIDIC",
    icon: "📊",
    word: "contingency",
    ipa: "/kənˈtɪn.dʒən.si/",
    meaning: "Beklenmedik durum payı, acil durum ödeneği",
    exampleEn: "The contract incorporates a 10% contingency for unforeseen ground conditions.",
    exampleTr: "Sözleşme, öngörülemeyen zemin koşulları için %10 acil durum payı içermektedir.",
    cardCount: 450,
  },
  {
    id: "academic",
    deckTitle: "Akademik Sınav Paketi",
    levelBadge: "YDS • IELTS • TOEFL C1",
    icon: "🎓",
    word: "detrimental",
    ipa: "/ˌdet.rɪˈmen.təl/",
    meaning: "Zararlı, hasar veren, yıpratıcı",
    exampleEn: "Chronic lack of sleep has a detrimental impact on cognitive retention and memory.",
    exampleTr: "Kronik uykusuzluk, bilişsel kalıcılık ve hafıza üzerinde zararlı bir etkiye sahiptir.",
    cardCount: 500,
  },
];

// ============================================================================
// 3. KARŞILAŞTIRMA MATRİSİ KRİTERLERİ
// ============================================================================
const MATRIX_ROWS = [
  {
    feature: "Akıllı Flaşkartlar (Bilimsel SM-2)",
    traditional: "Mekanik tekrar, sabit aralıklar",
    readingOnly: "Desteklenmiyor",
    vocaship: "Optimum unutma eğrisi algoritması & zayıf nokta avcısı",
    traditionalSupported: "partial",
    readingSupported: "no",
    vocashipSupported: "yes",
  },
  {
    feature: "Çift Okuyuculu Dijital Kitaplık",
    traditional: "Metin okuma arayüzü yok",
    readingOnly: "Yalnızca statik e-kitap okuyucu",
    vocaship: "İnteraktif C1 vaka metinleri & tıkla-öğren kelime yakalama",
    traditionalSupported: "no",
    readingSupported: "partial",
    vocashipSupported: "yes",
  },
  {
    feature: "Canlı Mülakat ve Konuşma Simülatörü",
    traditional: "Yok",
    readingOnly: "Yok",
    vocaship: "Yapay zekâ sesli eğitmen ile sektörel vaka savunması",
    traditionalSupported: "no",
    readingSupported: "no",
    vocashipSupported: "yes",
  },
  {
    feature: "Sektörel Uzmanlık Karar Ağacı",
    traditional: "Yalnızca genel rastgele kelimeler",
    readingOnly: "Karmaşık kategorisiz makaleler",
    vocaship: "Proje Kontrol, FIDIC, Finans, Hukuk hiyerarşik dalları",
    traditionalSupported: "no",
    readingSupported: "no",
    vocashipSupported: "yes",
  },
  {
    feature: "Sınıf ve Ödev Entegrasyonu",
    traditional: "Temel liste paylaşımı ile sınırlı",
    readingOnly: "Yok",
    vocaship: "Ortak kodla katılım, canlı sınıf arenas & ödev takibi",
    traditionalSupported: "partial",
    readingSupported: "no",
    vocashipSupported: "yes",
  },
];

export default function LandingPage() {
  const router = useRouter();

  // Sandbox demo state
  const [selectedTokenKey, setSelectedTokenKey] = useState<string>("mitigate");
  const [showAddToDeckModal, setShowAddToDeckModal] = useState<boolean>(false);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);

  // Vitrin kartları çevrilme durumu (flip state)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleCardFlip = (cardId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // Sesli Telaffuz (Web Speech API)
  const playPronunciation = (word: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyReferral = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://vocaship.com/join?ref=voca2026");
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 3000);
    }
  };

  const activeToken = INTERACTIVE_TOKENS[selectedTokenKey] || INTERACTIVE_TOKENS.mitigate;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. ÜST NAVİGASYON (SaaS Header)                                           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Marka */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Vocaship
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Çalışma Konsolu
              </span>
            </div>
          </Link>

          {/* Menü Linkleri */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-slate-300">
            <a href="#sandbox-demo" className="hover:text-white transition-colors">
              Canlı Sandbox
            </a>
            <a href="#matrix" className="hover:text-white transition-colors">
              Çözüm Matrisi
            </a>
            <a href="#showcase" className="hover:text-white transition-colors">
              Vitrin Desteler
            </a>
            <a href="#referral" className="hover:text-white transition-colors">
              Referans Programı
            </a>
          </nav>

          {/* Giriş & CTA Butonları */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Giriş Yap
            </Link>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition cursor-pointer"
            >
              <span>30 Gün Ücretsiz Başla</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO BÖLÜMÜ                                                            */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 border-b border-slate-900">
        {/* Arka Plan Glow Efektleri */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7 relative z-10">
          {/* Üst Rozet */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold tracking-wide shadow-sm animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>YENİ NESİL DİL ÇALIŞMA İSTASYONU</span>
          </div>

          {/* Ana Başlık */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Ezberleme,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Bağlamında Oku
            </span>
            ,<br className="hidden sm:inline" /> Oyunla Pekiştir.
          </h1>

          {/* Alt Başlık */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
            Akıllı aralıklı tekrar, bağlamsal metin çözümleme ve C1 mülakat simülasyonunu
            tek çatı altında sunan modern dil çalışma istasyonu.
          </p>

          {/* Eylem Çağrıları (CTAs) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <span>30 Gün Ücretsiz Dene (Kredi Kartı Gerekmez)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#sandbox-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-sm sm:text-base transition active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-current" />
              <span>Canlı Demoyu İncele ↓</span>
            </a>
          </div>

          {/* Güven Rozetleri */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>30 Günlük Tam Deneme Sürümü</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Kredi Kartı Gerektirmez</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Anında Tarayıcıda Başlar</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SIFIR SÜRTÜNMELİ CANLI DEMO (Zero-Friction Sandbox)                     */}
      {/* ========================================================================= */}
      <section id="sandbox-demo" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <span>⚡ SIFIR SÜRTÜNMELİ CANLI SANDBOX</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Kayıt Olmadan Hemen Test Edin
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400">
            Aşağıdaki örnek cümledeki altı çizili kelimelere tıklayın. IPA telaffuzunu dinleyin,
            bağlamsal sözlük açıklamasını inceleyin ve Vocaship deneyimini canlı yaşayın.
          </p>
        </div>

        {/* İnteraktif Cümle Kutusu */}
        <div className="relative rounded-3xl bg-slate-900/70 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              💡 Örnek Vaka Cümlesi (Tıklanabilir Kelimeler):
            </span>

            {/* Cümle Parçacıkları */}
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-slate-200 leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-3">
              <span>The team</span>

              <button
                type="button"
                onClick={() => setSelectedTokenKey("mitigate")}
                className={`relative px-2.5 py-1 rounded-xl transition-all cursor-pointer font-bold ${
                  selectedTokenKey === "mitigate"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105 ring-2 ring-indigo-400"
                    : "bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border-b-2 border-indigo-400"
                }`}
                title="Kelimeyi incelemek için tıkla"
              >
                mitigate
              </button>

              <span>the</span>

              <button
                type="button"
                onClick={() => setSelectedTokenKey("risks")}
                className={`relative px-2.5 py-1 rounded-xl transition-all cursor-pointer font-bold ${
                  selectedTokenKey === "risks"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105 ring-2 ring-indigo-400"
                    : "bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border-b-2 border-indigo-400"
                }`}
                title="Kelimeyi incelemek için tıkla"
              >
                risks
              </button>

              <span>by</span>

              <button
                type="button"
                onClick={() => setSelectedTokenKey("analyzing")}
                className={`relative px-2.5 py-1 rounded-xl transition-all cursor-pointer font-bold ${
                  selectedTokenKey === "analyzing"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105 ring-2 ring-indigo-400"
                    : "bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border-b-2 border-indigo-400"
                }`}
                title="Kelimeyi incelemek için tıkla"
              >
                analyzing
              </button>

              <span>the</span>

              <button
                type="button"
                onClick={() => setSelectedTokenKey("critical path")}
                className={`relative px-2.5 py-1 rounded-xl transition-all cursor-pointer font-bold ${
                  selectedTokenKey === "critical path"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 scale-105 ring-2 ring-emerald-400"
                    : "bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-b-2 border-emerald-400"
                }`}
                title="Kritik yol terimini incelemek için tıkla"
              >
                critical path.
              </button>
            </div>
          </div>

          {/* Aktif Kelime İnceleme Popover / Kartı */}
          <div className="rounded-2xl bg-slate-950 border border-indigo-500/40 p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-black text-white tracking-tight">
                      {activeToken.word}
                    </h3>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">
                      {activeToken.ipa}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => playPronunciation(activeToken.word, e)}
                      className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition cursor-pointer"
                      title="IPA Telaffuzunu Dinle"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {activeToken.category}
                  </span>
                </div>
              </div>

              {/* + Desteme Ekle Butonu */}
              <button
                type="button"
                onClick={() => setShowAddToDeckModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer shrink-0"
              >
                <span>+ Desteme Ekle</span>
              </button>
            </div>

            {/* Anlam ve Örnek Cümle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Birincil Türkçe Anlamı
                </span>
                <p className="text-sm font-bold text-emerald-300">
                  {activeToken.meaning}
                </p>
                <p className="text-slate-400 text-[11px] pt-1">
                  {activeToken.definition}
                </p>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bağlamsal Örnek Kullanım
                </span>
                <p className="text-slate-200 italic font-mono text-[11px]">
                  "{activeToken.exampleEn}"
                </p>
                <p className="text-slate-400 text-[11px] pt-0.5">
                  "{activeToken.exampleTr}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ÇÖZÜM MATRİSİ VE KARŞILAŞTIRMA TABLOSU                                 */}
      {/* ========================================================================= */}
      <section id="matrix" className="py-20 border-t border-slate-900 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <span>⚖️ ÇÖZÜM MATRİSİ</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Geleneksel Yöntemler vs. Vocaship
            </h2>
            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400">
              Kelimeleri yalıtılmış olarak ezberlemek yerine; bağlamında okuyun, sesli simülasyonla
              savunun ve bilimsel aralıklı tekrarla kalıcı hafızanıza kodlayın.
            </p>
          </div>

          {/* Şeffaf Karşılaştırma Matrisi */}
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-xs font-bold text-slate-300">
                  <th className="p-4 sm:p-5 w-2/5">Özellik / Yetkinlik</th>
                  <th className="p-4 sm:p-5 w-1/5 text-center text-slate-400">
                    Geleneksel Kart Uygulamaları
                  </th>
                  <th className="p-4 sm:p-5 w-1/5 text-center text-slate-400">
                    Klasik Okuma Platformları
                  </th>
                  <th className="p-4 sm:p-5 w-1/5 text-center bg-indigo-950/40 text-indigo-300 border-x border-indigo-500/30">
                    <span className="flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Vocaship</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {MATRIX_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-semibold text-white">
                      {row.feature}
                    </td>

                    {/* Geleneksel */}
                    <td className="p-4 sm:p-5 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-1.5">
                        {row.traditionalSupported === "partial" ? (
                          <span className="text-amber-400 text-sm">⚠️</span>
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500/80 inline" />
                        )}
                        <span className="hidden lg:inline text-[11px]">{row.traditional}</span>
                      </div>
                    </td>

                    {/* Klasik Okuma */}
                    <td className="p-4 sm:p-5 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-1.5">
                        {row.readingSupported === "partial" ? (
                          <span className="text-amber-400 text-sm">⚠️</span>
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500/80 inline" />
                        )}
                        <span className="hidden lg:inline text-[11px]">{row.readingOnly}</span>
                      </div>
                    </td>

                    {/* Vocaship */}
                    <td className="p-4 sm:p-5 text-center bg-indigo-950/30 border-x border-indigo-500/20 font-bold text-white">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 inline shrink-0" />
                        <span className="text-[11px] text-slate-200">{row.vocaship}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HAZIR VİTRİN DESTE ÖNİZLEMESİ (3D Flip Kartlar)                         */}
      {/* ========================================================================= */}
      <section id="showcase" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <span>🃏 HAZIR VİTRİN DESTELERİ</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Kütüphanenizi Zenginleştirecek Paketler
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-400">
            Aşağıdaki kartlara tıklayarak ters çevirin; örnek kullanımını, Türkçe anlamını ve sesli
            telaffuzunu test edin.
          </p>
        </div>

        {/* 3 Adet 3D Flip Kart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SHOWCASE_DECK_CARDS.map((card) => {
            const isFlipped = !!flippedCards[card.id];

            return (
              <div
                key={card.id}
                className="group [perspective:1000px] cursor-pointer min-h-[300px]"
                onClick={() => toggleCardFlip(card.id)}
              >
                <div
                  className="relative w-full h-full rounded-3xl transition-transform duration-500 shadow-xl"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* ÖN YÜZ (Front Face) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl p-6 bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{card.icon}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {card.levelBadge}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {card.deckTitle}
                      </h3>
                      <span className="text-xs text-slate-400 block font-mono">
                        {card.cardCount} Terim İçerir
                      </span>

                      <div className="pt-4 text-center space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Örnek Kart
                        </span>
                        <h4 className="text-2xl font-black text-white">{card.word}</h4>
                        <span className="text-xs font-mono text-indigo-400">{card.ipa}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Çevirmek için tıklayın</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => playPronunciation(card.word, e)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Telaffuz"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ARKA YÜZ (Back Face) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl p-6 bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-slate-900 border border-indigo-500/60 flex flex-col justify-between shadow-2xl"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-indigo-300 font-bold">
                          {card.word} {card.ipa}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => playPronunciation(card.word, e)}
                          className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Türkçe Anlamı:
                        </span>
                        <p className="text-sm font-black text-emerald-300">{card.meaning}</p>
                      </div>

                      <div className="space-y-1 pt-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Örnek Cümle:
                        </span>
                        <p className="text-xs text-slate-200 italic font-mono">
                          "{card.exampleEn}"
                        </p>
                        <p className="text-[11px] text-slate-400 pt-0.5">
                          "{card.exampleTr}"
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-indigo-500/30 flex items-center justify-between text-[11px] text-indigo-300 font-medium">
                      <span>Ön yüze dönmek için tıkla</span>
                      <span className="text-xs">➔</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. REFERANS VE TOPLULUK ÇAĞRISI                                           */}
      {/* ========================================================================= */}
      <section id="referral" className="py-20 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-violet-950/70 border border-indigo-500/30 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 text-center md:text-left flex-1">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
                  <Gift className="w-3.5 h-3.5 text-indigo-400" />
                  <span>TOPLULUK REFERANS PROGRAMI</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Arkadaşını Davet Et, İkiniz de +1 Ay Ücretsiz PRO Kazanın
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  Çalışma grubunuzu, proje ekibinizi veya sınıf arkadaşlarınızı Vocaship'e davet
                  edin; her başarılı kayıt sonrasında her iki tarafa da anında 1 aylık sınırsız PRO
                  avantajı tanımlansın.
                </p>

                {/* Bağlantı Kopyalama Simülatörü */}
                <div className="flex items-center space-x-2 max-w-md mx-auto md:mx-0 pt-1">
                  <div className="flex-1 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 truncate">
                    https://vocaship.com/join?ref=voca2026
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
                  >
                    {copiedReferral ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sağ CTA Butonu */}
              <div className="shrink-0 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Ücretsiz Başla ➔</span>
                </Link>
                <span className="block text-[11px] text-slate-400 pt-2 font-mono">
                  Kurulum gerektirmez
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-300">Vocaship</span>
            <span>• Ezberleme, Bağlamında Oku, Oyunla Pekiştir.</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <Link href="/" className="hover:text-white transition">
              Kütüphanem
            </Link>
            <Link href="/reading" className="hover:text-white transition">
              Okuma Odası
            </Link>
            <Link href="/speaking" className="hover:text-white transition">
              Konuşma Odası
            </Link>
            <Link href="/games" className="hover:text-white transition">
              Oyun Arenası
            </Link>
          </div>

          <div>
            © {new Date().getFullYear()} Vocaship. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 8. "+ DESTEME EKLE" KAYIT TETİKLEME MODALI                                */}
      {/* ========================================================================= */}
      {showAddToDeckModal && (
        <div
          onClick={() => setShowAddToDeckModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 sm:p-7 shadow-2xl shadow-indigo-950/60 space-y-5 animate-in zoom-in-95 duration-200 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-2xl shadow-inner">
              ✨
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">
                Harika Bir Başlangıç!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="font-bold text-indigo-400">"{activeToken.word}"</span> kelimesini
                ve tüm sektörel terimleri kişisel destenize kaydedip SM-2 aralıklı tekrar seansını
                başlatmak için 30 günlük ücretsiz hesabınızı hemen başlatın.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition cursor-pointer"
              >
                <span>Hemen Ücretsiz Hesabını Başlat ➔</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowAddToDeckModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Demoya Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
