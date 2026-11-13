"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Lock,
  School,
  Loader2,
  ArrowLeft,
  Ticket,
  Globe,
  Radio,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config";

export default function InviteJoinPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";
  const { user, setIsAuthModalOpen } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sınıf Verileri
  const [classData, setClassData] = useState<any | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<{ id: string; name: string } | null>(null);

  // Katılım ve Ödeme Durumları
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinResult, setJoinResult] = useState<any | null>(null);
  const [showPaymentCard, setShowPaymentCard] = useState<boolean>(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Kullanıcının Yerel Saat Dilimi
  const userTimezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  // Tarih ve saat formatlayıcı
  const formatSessionDate = (utcIso: string) => {
    try {
      const d = new Date(utcIso);
      const datePart = d.toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const timePart = d.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { datePart, timePart };
    } catch {
      return { datePart: utcIso, timePart: "" };
    }
  };

  // Davet verilerini API'den çek
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    const fetchInviteData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/classroom/invite/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setClassData(data.class);
            setUpcomingSessions(data.upcoming_sessions || []);
            setTeacher(data.teacher || { id: "", name: "Eğitmen" });
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setErrorMessage("Bu davet bağlantısına ait aktif bir sınıf veya oturum bulunamadı.");
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage("Sınıf verileri yüklenirken sunucu hatası oluştu.");
          setIsLoading(false);
        }
      }
    };

    fetchInviteData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Derse Katıl / Bilet Kontrolü
  const handleJoinOrRegister = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsJoining(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/classroom/invite/${encodeURIComponent(slug)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          selected_session_id: upcomingSessions[0]?.id || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setJoinResult(data);

        if (data.access_granted) {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
          setPaymentSuccess(true);
          setTimeout(() => {
            router.push(`/classroom`);
          }, 1800);
        } else if (data.requires_payment) {
          setShowPaymentCard(true);
        }
      } else {
        const err = await res.json();
        alert(err.detail || "Derse katılırken bir hata oluştu.");
      }
    } catch (err) {
      alert("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
    } finally {
      setIsJoining(false);
    }
  };

  // Faz 5 Ödeme Oturumu Başlat ve Webhook ile Bilet Tanımla
  const handleProcessCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsSimulatingPayment(true);
    try {
      // 1. Ödeme Oturumu Başlat (POST /api/v1/payments/checkout)
      const res = await fetch(`${API_BASE}/api/v1/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          class_id: classData.id,
          session_id: upcomingSessions[0]?.id || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Ödeme oturumu oluşturulamadı.");
      }

      const checkoutData = await res.json();

      // 2. Webhook / Sandbox Ödeme Onayı (POST /api/v1/payments/webhook)
      const webhookRes = await fetch(`${API_BASE}/api/v1/payments/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: checkoutData.transaction_id,
          status: "success",
          user_id: user.id,
          class_id: classData.id,
          session_id: upcomingSessions[0]?.id || null,
          amount: checkoutData.amount,
        }),
      });

      if (!webhookRes.ok) {
        const wErr = await webhookRes.json().catch(() => ({}));
        throw new Error(wErr.detail || "Ödeme onaylanırken bir hata oluştu.");
      }

      setPaymentSuccess(true);
      confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
      setTimeout(() => {
        router.push(`/classroom?tab=calendar`);
      }, 1600);
    } catch (err: any) {
      alert(err.message || "Ödeme işlemi sırasında bir hata oluştu.");
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Arka Plan Dekoratif Parıltıları */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

      {/* Üst Bar */}
      <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2 text-white font-black text-base hover:opacity-90 transition">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-sm shadow-md shadow-indigo-600/30">
            🎓
          </span>
          <span className="tracking-tight">Vocaship</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user.fullName || user.username}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </header>

      {/* Ana Gövde */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        {isLoading ? (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Ders ve davet bilgileri doğrulanıyor...</p>
          </div>
        ) : errorMessage ? (
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-white">Geçersiz veya Süresi Dolmuş Davet</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
            <Link
              href="/classroom"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sınıflarıma Dön</span>
            </Link>
          </div>
        ) : paymentSuccess ? (
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">Derse Kaydınız Tamamlandı! 🎉</h2>
            <p className="text-xs text-slate-300">
              Sınıf paneline yönlendiriliyorsunuz. Canlı tahtaya veya materyallere hemen erişebilirsiniz.
            </p>
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mt-2" />
          </div>
        ) : showPaymentCard ? (
          /* ========================================================================= */
          /* ŞIK "DERSE KAYIT OL & ÖDE" KARTI (FAZ 5 ÖDEME GEÇİDİNE HAZIR)             */
          /* ========================================================================= */
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-amber-500/40 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                  Bilet & Katılım Onayı
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {classData.invite_slug || slug}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-white">{classData.name}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Eğitmen: {teacher?.name || "Vocaship Uzmanı"}</span>
              </p>
            </div>

            {/* Fiyat ve Bilet Detayları */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Ders Bilet Tutarı:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {classData.price} {classData.currency}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Ödeme Sıklığı:</span>
                <span className="font-bold text-slate-200">
                  {classData.billing_type === "monthly" ? "Aylık Düzenli Abonelik" : "Tek Seferlik Bilet"}
                </span>
              </div>

              {/* Hakediş Bölüşümü (Split Payment) */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Hakediş Bölüşümü:</span>
                <span className="text-indigo-300 font-mono text-[11px]">
                  Eğitmen: %88 ({((classData.price || 0) * 0.88).toFixed(2)} {classData.currency}) • Platform: %12
                </span>
              </div>

              {upcomingSessions[0] && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Oturum Zamanı:</span>
                  <span className="font-bold text-indigo-300">
                    {formatSessionDate(upcomingSessions[0].session_date_utc).datePart} •{" "}
                    {formatSessionDate(upcomingSessions[0].session_date_utc).timePart}
                  </span>
                </div>
              )}
            </div>

            {/* Dahil Olan Özellikler */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Akıllı tahtada canlı interaktif anlatım ve çizim katılımı</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ders materyallerine ve öğretmen notlarına sınırsız erişim</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Kişisel hakediş garantisi ve 256-bit SSL korumalı ödeme</span>
              </div>
            </div>

            {/* Güvenli Ödeme Butonu */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleProcessCheckout}
                disabled={isSimulatingPayment}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isSimulatingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ödeme Doğrulanıyor ve Bilet Tanımlanıyor...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Güvenli Öde & Derse Giriş Yap ({classData.price} {classData.currency})</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Faz 5 ödeme altyapısı hazır. Tek tıkla biletinizi onaylayabilirsiniz.</span>
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* NORMAL GİRİŞ KAPISI: SINIF ÖN İZLEME VE KATIL BUTONU                     */
          /* ========================================================================= */
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Canlı Sınıf Daveti</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {classData.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center justify-center gap-2">
                <span>👨‍🏫 Eğitmen:</span>
                <span className="font-bold text-white">{teacher?.name || "Vocaship Eğitmeni"}</span>
              </p>
            </div>

            {/* Bilet / Fiyat Rozeti */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  Katılım Türü
                </span>
                <span className="text-xs font-bold text-white">
                  {classData.price > 0 ? "Ücretli Biletli Ders" : "Açık Topluluk Sınıfı"}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  Ücret
                </span>
                <span
                  className={`text-sm sm:text-base font-black font-mono ${
                    classData.price > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {classData.price > 0 ? `${classData.price} ${classData.currency}` : "🟢 ÜCRETSİZ"}
                </span>
              </div>
            </div>

            {/* Yaklaşan Oturumlar (Yerel Saat Dilimiyle) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ders Takvimi</span>
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-500" />
                  <span>Saat Diliminiz: {userTimezone}</span>
                </span>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {upcomingSessions.map((session, idx) => {
                    const formatted = formatSessionDate(session.session_date_utc);
                    return (
                      <div
                        key={session.id || idx}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{formatted.datePart}</span>
                          <span className="text-[11px] text-indigo-300 font-mono">
                            {formatted.timePart} (Süre: {session.duration_minutes || 60} Dk)
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                          {idx === 0 ? "İlk Oturum" : `Oturum ${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 text-center">
                  📅 Bu sınıf için esnek slot rezervasyonu uygulanacaktır.
                </div>
              )}
            </div>

            {/* Aksiyon Butonu */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleJoinOrRegister}
                disabled={isJoining}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Kontrol Ediliyor...</span>
                  </>
                ) : user ? (
                  <>
                    <span>{classData.price > 0 ? "Derse Kayıt Ol & Bilet Al" : "Derse Hemen Katıl"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Giriş Yap ve Derse Katıl</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Alt Bilgi */}
      <footer className="h-12 border-t border-slate-800/60 flex items-center justify-center text-[11px] text-slate-500 z-10">
        <span>Vocaship Akıllı Tahta & Biletli Canlı Sınıf Altyapısı</span>
      </footer>
    </div>
  );
}

