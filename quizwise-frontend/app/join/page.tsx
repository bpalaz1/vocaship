"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Radio,
  GraduationCap,
  Sparkles,
  ArrowRight,
  User,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Gamepad2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const codeParam = searchParams.get("code") || "";
  const sessionParam = searchParams.get("session") || "live-session-1";

  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoRedirecting, setAutoRedirecting] = useState(false);
  const [classInfo, setClassInfo] = useState<{
    name: string;
    grade_level?: string;
  } | null>(null);

  // 1. Sınıf bilgilerini önbellekten veya API'den çek
  useEffect(() => {
    if (!codeParam) return;
    const fetchClassInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/classroom/assignments/${encodeURIComponent(codeParam)}`);
        if (res.ok) {
          const data = await res.json();
          setClassInfo({
            name: data.class_name || "Vocaship Canlı Sınıfı",
            grade_level: data.grade_level || "B2-C1",
          });
        }
      } catch {
        // Fallback
        setClassInfo({
          name: "Vocaship Canlı Sınıfı",
          grade_level: "Genel",
        });
      }
    };
    fetchClassInfo();
  }, [codeParam]);

  // 2. Kullanıcı Zaten Oturum Açmışsa: Doğrudan Canlı Derse Yönlendir
  useEffect(() => {
    if (user && codeParam) {
      setAutoRedirecting(true);
      const timer = setTimeout(() => {
        const targetUrl = `/classroom/live?code=${encodeURIComponent(codeParam)}&session=${encodeURIComponent(sessionParam)}&role=student`;
        router.push(targetUrl);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [user, codeParam, sessionParam, router]);

  // 3. Geçici Öğrenci / Takma Ad ile Hızlı Katılım
  const handleGuestJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nickname.trim() || "Öğrenci";
    setIsSubmitting(true);

    try {
      localStorage.setItem("vocaship_guest_student", cleanName);
      if (codeParam) {
        localStorage.setItem("vocaship_last_class_code", codeParam);
      }
    } catch {}

    const targetUrl = `/classroom/live?code=${encodeURIComponent(codeParam)}&session=${encodeURIComponent(sessionParam)}&role=student&guestName=${encodeURIComponent(cleanName)}`;
    router.push(targetUrl);
  };

  // Oturum açmış kullanıcılar için şık otomatik aktarma ekranı
  if (autoRedirecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl">
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white">
              Oturum Açık: Hoş Geldin {user?.fullName || user?.username || "Öğrenci"}!
            </h2>
            <p className="text-xs text-slate-400">
              Kayıtlı hesabın tespit edildi. Canlı ders stüdyosuna aktarılıyorsun...
            </p>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1.5 rounded-full w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-8 select-none relative overflow-hidden">
      {/* Arka Plan Glow Efektleri */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Üst Logo ve Durum */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-black text-lg text-white group-hover:text-indigo-400 transition">
            Vocaship
          </span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Canlı Ders Yayında</span>
        </span>
      </header>

      {/* Orta Form Kartı */}
      <main className="max-w-md mx-auto w-full my-auto">
        <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl space-y-6">
          {/* Sınıf Başlığı */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
              <Tv className="w-3.5 h-3.5" />
              <span>Sınıf Kodu: {codeParam || "VRG-2535"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {classInfo?.name || "Canlı Derse Katıl"}
            </h1>

            <p className="text-xs text-slate-400">
              Kameranızı tahtaya okuttunuz. Şifresiz giriş yapmak için adınızı yazın ve derse bağlanın.
            </p>
          </div>

          {/* Hızlı Katılım Formu */}
          <form onSubmit={handleGuestJoin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label htmlFor="student-nickname" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Adınız Soyadınız veya Takma Adınız:</span>
              </label>

              <input
                id="student-nickname"
                type="text"
                required
                autoFocus
                placeholder="Örn: Mehmet Yılmaz veya Memo"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-slate-950 border-2 border-indigo-500/40 focus:border-indigo-400 rounded-2xl px-4 py-3.5 text-white font-bold placeholder-slate-600 focus:outline-none transition shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !nickname.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? "Bağlanılıyor..." : "🚀 Şifresiz Derse Katıl"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Özellik Rozetleri */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-300 block">⚡ Şifre Yok</span>
              <span className="text-[9px] text-slate-500">Doğrudan giriş</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-300 block">🏆 Canlı Podyum</span>
              <span className="text-[9px] text-slate-500">Yarış & XP</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-300 block">🔒 Güvenli</span>
              <span className="text-[9px] text-slate-500">İzole oturum</span>
            </div>
          </div>
        </div>
      </main>

      {/* Alt Bilgi */}
      <footer className="max-w-md mx-auto w-full text-center text-xs text-slate-500 pt-6">
        <span>Zaten bir Vocaship hesabınız var mı? </span>
        <Link href="/classroom" className="text-indigo-400 hover:underline font-bold">
          Öğrenci Girişi Yap
        </Link>
      </footer>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
          Katılım ekranı yükleniyor...
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
