"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  Trash2,
  Copy,
  Check,
  Volume2,
  Radio,
  Sparkles,
} from "lucide-react";
import { API_BASE } from "../../config";

interface TranscriptPair {
  id: string;
  time: string;
  en: string;
  tr: string;
}

export default function LiveMeetingTranslatorPage() {
  const [isListening, setIsListening] = useState(false);
  const [liveEn, setLiveEn] = useState("");
  const [liveTr, setLiveTr] = useState("");
  const [transcripts, setTranscripts] = useState<TranscriptPair[]>([]);
  const [copied, setCopied] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Tampon bellek ve akıllı ayrıştırma sayaçları
  const committedLengthRef = useRef(0);
  const latestFullSessionTextRef = useRef("");
  const liveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestLiveTrRef = useRef("");

  const leftBottomRef = useRef<HTMLDivElement | null>(null);
  const rightBottomRef = useRef<HTMLDivElement | null>(null);

  // Otomatik aşağı kaydırma
  useEffect(() => {
    const timer = setTimeout(() => {
      leftBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      rightBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
    return () => clearTimeout(timer);
  }, [transcripts.length, liveEn]);

  // Sayfa kapanırken tüm kaynakları temizle
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Backend hızlı çeviri servisi
  const translateText = async (text: string): Promise<string> => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    try {
      const res = await fetch(`${API_BASE}/api/v1/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          source_lang: "en",
          target_lang: "tr",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.translated_text || "";
      }
    } catch (e) {
      console.warn("Translation fallback:", e);
    }
    return "";
  };

  // Kelime sayacı
  const countWords = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;

  // Cümleyi kalıcı listeye kaydet (Flush)
  const flushCurrentSentence = async (textToCommit: string, newCommittedLength: number) => {
    const clean = textToCommit.trim();
    if (!clean || clean.length < 2) return;

    committedLengthRef.current = newCommittedLength;
    setLiveEn("");
    setLiveTr("");

    const id = "pair_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const cachedTr = latestLiveTrRef.current;
    latestLiveTrRef.current = "";

    const newPair: TranscriptPair = {
      id,
      time,
      en: clean,
      tr: cachedTr || "Çevriliyor...",
    };

    setTranscripts((prev) => [...prev, newPair]);

    // Nihai kaliteli çeviriyi üretip güncelle
    const finalTr = await translateText(clean);
    if (finalTr) {
      setTranscripts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, tr: finalTr } : item))
      );
    }
  };

  // Agresif ve Hızlı Oturum Yeniden Başlatma (50ms)
  const restartRecognition = () => {
    if (!isListeningRef.current) return;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    restartTimerRef.current = setTimeout(() => {
      if (!isListeningRef.current) return;
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (err: any) {
        // Zaten çalışıyorsa veya geçiş halindeyse yok say
      }
    }, 50);
  };

  // Dinlemeyi Başlat
  const startListening = async () => {
    stopListening();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tarayıcınız Konuşma Tanıma (SpeechRecognition) API'sini desteklemiyor. Lütfen Google Chrome veya Edge kullanın.");
      return;
    }

    try {
      // 1. Ortamdaki ve harici hoparlör sesini saf yüksek sadakatle yakala (Filtreler kapalı)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Web Audio Gain: Düşük kalan seslerin kesilmesini engelle (+2.0x Gain)
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        if (audioCtx.state === "suspended") await audioCtx.resume();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 2.0; // Hassasiyet artışı

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        source.connect(gainNode);
        gainNode.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (err) {
        console.warn("Audio gain/meter notice:", err);
      }

      // 3. Kesintisiz ve Agresif Konuşma Tanıma Motoru
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      committedLengthRef.current = 0;
      latestFullSessionTextRef.current = "";
      isListeningRef.current = true;
      setIsListening(true);

      recognition.onresult = (event: any) => {
        let fullSessionText = "";
        let hasFinalChunk = false;

        for (let i = 0; i < event.results.length; i++) {
          fullSessionText += event.results[i][0].transcript + " ";
          if (event.results[i].isFinal) {
            hasFinalChunk = true;
          }
        }
        fullSessionText = fullSessionText.replace(/\s+/g, " ").trim();
        latestFullSessionTextRef.current = fullSessionText;

        // Henüz kalıcı listeye aktarılmamış canlı metin dilimi
        const uncommitted = fullSessionText.slice(committedLengthRef.current).trim();

        if (uncommitted) {
          setLiveEn(uncommitted);

          // Anlık canlı çeviri (150ms debounce)
          if (liveDebounceRef.current) clearTimeout(liveDebounceRef.current);
          liveDebounceRef.current = setTimeout(async () => {
            const tr = await translateText(uncommitted);
            if (tr) {
              setLiveTr(tr);
              latestLiveTrRef.current = tr;
            }
          }, 150);

          const words = countWords(uncommitted);

          // KURAL 1: Ara metin 8 kelimeyi aşarsa beklemeden hemen cümleyi tamamla!
          if (words >= 8) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            flushCurrentSentence(uncommitted, fullSessionText.length);
            return;
          }

          // KURAL 2: Konuşma motoru isFinal ürettiyse hemen tamamla!
          if (hasFinalChunk && words >= 2) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            flushCurrentSentence(uncommitted, fullSessionText.length);
            return;
          }

          // KURAL 3: Konuşmacı 1.0 saniye susarsa otomatik tamamla!
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const currentPending = latestFullSessionTextRef.current.slice(committedLengthRef.current).trim();
            if (currentPending.length >= 2) {
              flushCurrentSentence(currentPending, latestFullSessionTextRef.current.length);
            }
          }, 1000);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "no-speech" || event.error === "audio-capture" || event.error === "network") {
          // Dinleme oturumunu asla sonlandırma, onend ile hemen yeniden başlasın
          return;
        }
        if (event.error === "not-allowed") {
          alert("Mikrofon izni verilmedi.");
          stopListening();
        }
      };

      // KESİNTİSİZ OTURUM DÖNGÜSÜ:
      // Tarayıcı sessizlik veya sınır nedeniyle dursa bile 50ms içinde anında yeniden başlat!
      recognition.onend = () => {
        if (isListeningRef.current) {
          // Askıda kalan son uncommitted metin varsa kurtar
          if (latestFullSessionTextRef.current) {
            const rem = latestFullSessionTextRef.current.slice(committedLengthRef.current).trim();
            if (rem.length >= 2) {
              flushCurrentSentence(rem, latestFullSessionTextRef.current.length);
            }
          }
          committedLengthRef.current = 0;
          latestFullSessionTextRef.current = "";
          restartRecognition();
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error("Audio error:", err);
      alert("Ses başlatılamadı: " + (err.message || "Mikrofon izni gerekebilir."));
      stopListening();
    }
  };

  // Dinlemeyi Durdur
  const stopListening = () => {
    isListeningRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (liveDebounceRef.current) {
      clearTimeout(liveDebounceRef.current);
      liveDebounceRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    // Askıda kalan son metni döküme ekle
    if (latestFullSessionTextRef.current) {
      const rem = latestFullSessionTextRef.current.slice(committedLengthRef.current).trim();
      if (rem.length >= 2) {
        flushCurrentSentence(rem, latestFullSessionTextRef.current.length);
      }
    }

    committedLengthRef.current = 0;
    latestFullSessionTextRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setIsListening(false);
    setAudioLevel(0);
    setLiveEn("");
    setLiveTr("");
  };

  // Metni Panoya Kopyala
  const handleCopyAll = () => {
    if (transcripts.length === 0) return;
    const text = transcripts
      .map((t, idx) => `[${t.time}] #${idx + 1}\nEN: ${t.en}\nTR: ${t.tr}\n`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dökümü Temizle
  const handleClear = () => {
    if (transcripts.length === 0) return;
    if (window.confirm("Tüm dökümü temizlemek istiyor musunuz?")) {
      setTranscripts([]);
      setLiveEn("");
      setLiveTr("");
      committedLengthRef.current = 0;
      latestFullSessionTextRef.current = "";
    }
  };

  // TTS Seslendirme
  const speak = (text: string, lang = "en-US") => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ÜST PANEL: TEK TIKLA BAŞLATMA & KONTROLLER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* TEK TIKLA BAŞLATMA BUTONU */}
            {!isListening ? (
              <button
                onClick={startListening}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer text-sm sm:text-base"
              >
                <Mic className="w-5 h-5 text-emerald-300 animate-pulse" />
                <span>🎙️ Dış Sesi Dinle ve Çevir</span>
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer text-sm sm:text-base animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>⏹️ Dinlemeyi Durdur</span>
              </button>
            )}

            {/* SES SEVİYESİ / AKTİF DURUM */}
            {isListening && (
              <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-emerald-500/30">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Kesintisiz Canlı Döngü
                </span>
                <div className="flex items-end gap-1 h-4 ml-1">
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, audioLevel * 0.8)}px` }}
                  />
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, audioLevel * 1.2)}px` }}
                  />
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, audioLevel * 0.5)}px` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SAĞ BUTONLAR: KOPYALA & TEMİZLE */}
          <div className="flex items-center gap-2.5">
            {transcripts.length > 0 && (
              <>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                  title="Tümünü Kopyala"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-300" />
                      <span>Metni Kopyala</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-semibold transition-all cursor-pointer"
                  title="Tüm Dökümü Temizle"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Temizle</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* EKRANI İKİYE BÖLEN ÇİFT SÜTUNLU CANLI MİZANPAJ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[650px]">
          {/* SOL SÜTUN: İNGİLİZCE METİN DÖKÜMÜ */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* SÜTUN BAŞLIĞI */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇬🇧</span>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Konuşulan İngilizce Metin
                </h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                {transcripts.length} Cümle
              </span>
            </div>

            {/* SÜTUN LİSTESİ */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-3.5 pr-1">
              {transcripts.length === 0 && !liveEn && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Radio className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm max-w-xs leading-relaxed">
                    Yukarıdaki <strong className="text-indigo-300">[ 🎙️ Dış Sesi Dinle ve Çevir ]</strong> butonuna tıklayın. Hoparlörden gelen İngilizce konuşmalar satır satır buraya dökülecektir.
                  </p>
                </div>
              )}

              {/* KALICI İNGİLİZCE SATIRLARI */}
              {transcripts.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40">
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400">{t.time}</span>
                    </div>
                    <button
                      onClick={() => speak(t.en, "en-US")}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Seslendir"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    {t.en}
                  </p>
                </div>
              ))}

              {/* CANLI KONUŞULAN AKTİF CÜMLE */}
              {liveEn && (
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-1 animate-pulse">
                  <div className="flex items-center justify-between text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      <span>Canlı Algılanıyor...</span>
                    </span>
                    <span className="text-slate-400 font-mono lowercase">1.0s veya 8 kelimede eklenir</span>
                  </div>
                  <p className="text-base sm:text-lg text-indigo-200 italic font-medium leading-relaxed">
                    {liveEn}
                  </p>
                </div>
              )}

              <div ref={leftBottomRef} />
            </div>
          </div>

          {/* SAĞ SÜTUN: EŞZAMANLI TÜRKÇE ÇEVİRİ */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* SÜTUN BAŞLIĞI */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇹🇷</span>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Eşzamanlı Türkçe Çeviri
                </h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                {transcripts.length} Çeviri
              </span>
            </div>

            {/* SÜTUN LİSTESİ */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-3.5 pr-1">
              {transcripts.length === 0 && !liveTr && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm max-w-xs leading-relaxed">
                    Sol sütundaki İngilizce konuşmaların Türkçe karşılığı anında ve kalıcı şekilde buraya yansıyacaktır.
                  </p>
                </div>
              )}

              {/* KALICI TÜRKÇE ÇEVİRİ SATIRLARI */}
              {transcripts.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400">{t.time}</span>
                    </div>
                    <button
                      onClick={() => speak(t.tr, "tr-TR")}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Türkçe Seslendir"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-medium text-emerald-300 leading-relaxed">
                    {t.tr}
                  </p>
                </div>
              ))}

              {/* CANLI AKTİF ÇEVİRİ */}
              {liveTr && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1 animate-pulse">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Canlı Çeviri...</span>
                  </div>
                  <p className="text-base sm:text-lg text-emerald-300 italic font-medium leading-relaxed">
                    {liveTr}
                  </p>
                </div>
              )}

              <div ref={rightBottomRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
