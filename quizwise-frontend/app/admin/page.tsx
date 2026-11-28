"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Users,
  Activity,
  Crown,
  Radio,
  Zap,
  Globe2,
  AlertTriangle,
  Database,
  Clock,
  BookOpen,
  FileText,
  Mic,
  Ban,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { API_BASE } from "../config";
import { useAuth, getAuthToken } from "../context/AuthContext";

const ADMIN_EMAIL = "bpalaz1@gmail.com";

interface AdminOverviewResponse {
  system_health: {
    db_mode: "supabase" | "fallback";
    db_error: string | null;
    server_time: string;
  };
  runtime_guard?: {
    ai_circuit_open: boolean;
    ai_circuit_manual: boolean;
    ai_circuit_auto_remaining_sec: number;
    blocked_ips_count: number;
    blocked_ips: Array<{ ip: string; remaining_sec: number }>;
    suspended_users_count: number;
  };
  users_summary: {
    total_users: number;
    pro_users: number;
    free_users: number;
    active_today_count: number;
  };
  quota_usage_today: {
    custom_texts_today: number;
    ai_stories_today: number;
    speaking_sessions_today: number;
    top_quota_users: Array<{
      id: string;
      username: string;
      full_name: string;
      email: string;
      plan_tier: string;
      custom_texts: number;
      ai_stories: number;
      speaking_sessions: number;
      total_today: number;
    }>;
  };
  live_classes: {
    active_sessions_count: number;
    active_rooms: Array<{
      id: string;
      class_id: string;
      title: string;
      status: string;
      started_at?: string | null;
    }>;
  };
  countries: Array<{
    country: string;
    count: number;
    count_24h?: number;
    percentage: number;
  }>;
  countries_meta?: {
    total_7d: number;
    total_24h: number;
  };
  early_warnings: {
    risk_score: "LOW" | "MEDIUM" | "HIGH";
    critical_count: number;
    warning_count: number;
    items: Array<{
      id: string;
      severity: "critical" | "warning" | string;
      event_type: string;
      endpoint?: string | null;
      detail?: string | null;
      message: string;
      recommendation: string;
      path?: string | null;
      user_id?: string | null;
      ip?: string | null;
      country_code?: string | null;
      created_at: string;
    }>;
  };
}

const COUNTRY_NAMES: Record<string, string> = {
  TR: "Türkiye",
  US: "ABD",
  DE: "Almanya",
  GB: "Birleşik Krallık",
  NL: "Hollanda",
  FR: "Fransa",
  ES: "İspanya",
  IT: "İtalya",
  CA: "Kanada",
  AZ: "Azerbaycan",
  RU: "Rusya",
  AT: "Avusturya",
  CH: "İsviçre",
  BE: "Belçika",
  SE: "İsveç",
  AU: "Avustralya",
  JP: "Japonya",
  BR: "Brezilya",
  PL: "Polonya",
  CY: "Kıbrıs",
};

function countryCodeToFlag(code: string): string {
  const clean = (code || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(clean)) return "🌐";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    base + (clean.charCodeAt(0) - 65),
    base + (clean.charCodeAt(1) - 65)
  );
}

function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "";
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return "";
    return dt.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthReady } = useAuth();
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
  const [isTogglingAiGuard, setIsTogglingAiGuard] = useState(false);
  const [isClosingRooms, setIsClosingRooms] = useState(false);
  const [isClearingWarnings, setIsClearingWarnings] = useState(false);
  const [suspendingKey, setSuspendingKey] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const isAuthorizedAdmin = Boolean(
    user?.email && user.email.toLowerCase().trim() === ADMIN_EMAIL
  );

  // Yetkisiz kullanıcıyı hiçbir veri göstermeden anında ana sayfaya at
  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthorizedAdmin) {
      router.replace("/");
    }
  }, [isAuthReady, isAuthorizedAdmin, router]);

  const fetchOverview = useCallback(
    async (silent = false) => {
      if (!isAuthorizedAdmin) return;
      const token = getAuthToken();
      if (!token) {
        router.replace("/");
        return;
      }
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMsg(null);
      try {
        const res = await fetch(`${API_BASE}/api/v1/admin/overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        if (res.status === 401 || res.status === 403) {
          router.replace("/");
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Veri alınamadı (${res.status})`);
        }
        const json: AdminOverviewResponse = await res.json();
        setData(json);
        setLastUpdated(
          new Date().toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch (err: any) {
        setErrorMsg(err?.message || "Admin verileri yüklenemedi.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAuthorizedAdmin, router]
  );

  // İlk yükleme + 30 saniyede bir otomatik tazeleme
  useEffect(() => {
    if (!isAuthReady || !isAuthorizedAdmin) return;
    fetchOverview(false);
    const interval = setInterval(() => {
      fetchOverview(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthReady, isAuthorizedAdmin, fetchOverview]);

  const showBanner = (kind: "success" | "error", text: string) => {
    setActionBanner({ kind, text });
    setTimeout(() => {
      setActionBanner((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const handleToggleAiGuard = async () => {
    const token = getAuthToken();
    if (!token || isTogglingAiGuard) return;
    const currentlyOpen = Boolean(data?.runtime_guard?.ai_circuit_open);
    setIsTogglingAiGuard(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/actions/toggle-ai-guard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !currentlyOpen }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.detail || `İşlem başarısız (${res.status})`);
      }
      showBanner("success", json.message || "AI Güvenli Mod güncellendi.");
      await fetchOverview(true);
    } catch (err: any) {
      showBanner("error", err?.message || "AI Güvenli Mod değiştirilemedi.");
    } finally {
      setIsTogglingAiGuard(false);
    }
  };

  const handleCloseStaleRooms = async () => {
    const token = getAuthToken();
    if (!token || isClosingRooms) return;
    if (
      !window.confirm(
        "class_sessions tablosundaki aktif görünen tüm canlı ders odaları sonlandırılacak (status='ended'). Onaylıyor musunuz?"
      )
    ) {
      return;
    }
    setIsClosingRooms(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/actions/close-stale-rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.detail || `Odalar kapatılamadı (${res.status})`);
      }
      showBanner("success", json.message || "Açık ders odaları temizlendi.");
      await fetchOverview(true);
    } catch (err: any) {
      showBanner("error", err?.message || "Açık ders odaları temizlenemedi.");
    } finally {
      setIsClosingRooms(false);
    }
  };

  const handleClearWarnings = async () => {
    const token = getAuthToken();
    if (!token || isClearingWarnings) return;
    setIsClearingWarnings(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/actions/clear-warnings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.detail || `Uyarılar temizlenemedi (${res.status})`);
      }
      showBanner("success", json.message || "Tüm uyarılar temizlendi.");
      await fetchOverview(true);
    } catch (err: any) {
      showBanner("error", err?.message || "Uyarılar temizlenirken hata oluştu.");
    } finally {
      setIsClearingWarnings(false);
    }
  };

  const handleSuspendTarget = async (opts: {
    userId?: string | null;
    ip?: string | null;
    label: string;
    rowKey: string;
  }) => {
    const token = getAuthToken();
    if (!token || suspendingKey) return;
    if (!opts.userId && !opts.ip) return;
    if (
      !window.confirm(
        `"${opts.label}" için erişimi anında durdurmak istediğinizden emin misiniz?`
      )
    ) {
      return;
    }
    setSuspendingKey(opts.rowKey);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/actions/suspend-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: opts.userId || null,
          ip: opts.ip || null,
          reason: `Admin panelinden erişim durduruldu (${opts.label})`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.detail || `Erişim durdurulamadı (${res.status})`);
      }
      showBanner("success", json.message || `${opts.label} için erişim durduruldu.`);
      await fetchOverview(true);
    } catch (err: any) {
      showBanner("error", err?.message || "Erişim durdurma işlemi başarısız oldu.");
    } finally {
      setSuspendingKey(null);
    }
  };

  // Yetki doğrulanmadan veya yetkisizse hiçbir şey render etme
  if (!isAuthReady || !isAuthorizedAdmin) {
    return <div className="min-h-screen bg-[#0B0F19]" />;
  }

  const riskScore = data?.early_warnings?.risk_score || "LOW";
  const warnings = data?.early_warnings?.items || [];
  const totalUsers = data?.users_summary?.total_users || 0;
  const proUsers = data?.users_summary?.pro_users || 0;
  const freeUsers = data?.users_summary?.free_users || 0;
  const proPercent = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;

  return (
    <div
      data-theme-preserve="dark"
      className="min-h-screen w-full bg-[#0B0F19] text-slate-100 pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Üst Başlık & Canlı Yenileme */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Admin Kontrol &amp; Erken Uyarı Merkezi
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                  Süper Yönetici
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Database className="w-3 h-3 text-indigo-400" />
                  <span>
                    DB:{" "}
                    <strong
                      className={
                        data?.system_health?.db_mode === "fallback"
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }
                    >
                      {data?.system_health?.db_mode === "fallback"
                        ? "FALLBACK (KRİTİK)"
                        : "Supabase Aktif"}
                    </strong>
                  </span>
                </span>
                {lastUpdated && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>Son güncelleme: {lastUpdated}</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
              30sn otomatik tazeleme
            </span>
            <button
              type="button"
              onClick={() => fetchOverview(true)}
              disabled={isRefreshing || isLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-95"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing || isLoading ? "animate-spin" : ""}`}
              />
              <span>↻ Canlı Yenile</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {actionBanner && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-150 ${
              actionBanner.kind === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                : "bg-rose-500/15 border-rose-500/40 text-rose-200"
            }`}
          >
            {actionBanner.kind === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionBanner.text}</span>
          </div>
        )}

        {isLoading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-32 rounded-3xl bg-slate-900/80 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : data ? (
          <>
            {/* ================================================================= */}
            {/* BLOK 1: 🚨 ERKEN UYARI & RİSK MONİTÖRÜ (EN ÜSTTE)                 */}
            {/* ================================================================= */}
            <section
              className={`rounded-3xl border p-5 sm:p-6 space-y-4 shadow-xl ${
                riskScore === "HIGH"
                  ? "bg-rose-950/30 border-rose-500/50"
                  : riskScore === "MEDIUM"
                  ? "bg-amber-950/25 border-amber-500/45"
                  : "bg-slate-900/90 border-emerald-500/35"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      riskScore === "HIGH"
                        ? "bg-rose-500 animate-pulse shadow-sm shadow-rose-400"
                        : riskScore === "MEDIUM"
                        ? "bg-amber-400 animate-pulse shadow-sm shadow-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                    🚨 Erken Uyarı &amp; Risk Monitörü (Son 24 Saat)
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {data.runtime_guard && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/90 border border-slate-700 text-[11px] font-mono text-slate-300">
                      Bloklu IP: <strong className="text-rose-300">{data.runtime_guard.blocked_ips_count}</strong> • Askıda: <strong className="text-amber-300">{data.runtime_guard.suspended_users_count}</strong>
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider border ${
                      riskScore === "HIGH"
                        ? "bg-rose-500/20 border-rose-400/60 text-rose-200"
                        : riskScore === "MEDIUM"
                        ? "bg-amber-500/20 border-amber-400/60 text-amber-200"
                        : "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
                    }`}
                  >
                    RİSK SKORU: {riskScore}
                  </span>
                  <button
                    type="button"
                    disabled={isClearingWarnings || warnings.length === 0}
                    onClick={handleClearWarnings}
                    className="px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-40 border border-emerald-400/50 text-emerald-200 text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                    title="Çözülmüş warning ve critical uyarı kayıtlarını temizle"
                  >
                    {isClearingWarnings ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    <span>✓ Uyarıları Temizle</span>
                  </button>
                </div>
              </div>

              {/* ⚡ ANINDA MÜDAHALE KONTROLLERİ ÇUBUĞU */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    ⚡ Anında Müdahale Kontrolleri
                  </span>
                  {data.runtime_guard?.ai_circuit_open && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/60 text-rose-200 text-[10px] font-black animate-pulse">
                      AI Maliyet Kilidi Devrede
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isTogglingAiGuard}
                    onClick={handleToggleAiGuard}
                    className={`px-4 py-2 rounded-xl border text-xs font-black flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50 ${
                      data.runtime_guard?.ai_circuit_open
                        ? "bg-rose-600/25 hover:bg-rose-600/35 border-rose-400 text-rose-200 ring-2 ring-rose-500/35 shadow-lg shadow-rose-500/15"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                    }`}
                  >
                    {isTogglingAiGuard ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldAlert
                        className={`w-3.5 h-3.5 ${
                          data.runtime_guard?.ai_circuit_open
                            ? "text-rose-300"
                            : "text-emerald-400"
                        }`}
                      />
                    )}
                    <span>
                      🛡️ AI Güvenli Mod (
                      {data.runtime_guard?.ai_circuit_open ? "Açık" : "Kapalı"})
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isClosingRooms}
                    onClick={handleCloseStaleRooms}
                    className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-200 text-xs font-black flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isClosingRooms ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>🧹 Açık Ders Odalarını Temizle</span>
                  </button>
                </div>
              </div>

              {warnings.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-sm font-black text-emerald-200">
                      Sistem Stabil — Aktif Risk Tespit Edilmedi
                    </div>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      Supabase veritabanı bağlantısı aktif, son 24 saatte kritik 500 hatası veya yoğun kota uyarısı kaydedilmedi.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {warnings.map((w) => {
                    const isCritical = w.severity === "critical";
                    return (
                      <div
                        key={w.id}
                        className={`p-4 rounded-2xl border space-y-1.5 ${
                          isCritical
                            ? "bg-rose-950/60 border-rose-500/60 ring-1 ring-rose-500/30"
                            : "bg-amber-950/40 border-amber-500/45"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full animate-pulse ${
                                isCritical ? "bg-rose-400" : "bg-amber-400"
                              }`}
                            />
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                isCritical
                                  ? "bg-rose-500 text-white"
                                  : "bg-amber-500/25 text-amber-200 border border-amber-400/40"
                              }`}
                            >
                              {isCritical ? "KRİTİK" : "UYARI"} • {w.event_type}
                            </span>
                            {(w.endpoint || w.path) && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950/90 border border-indigo-500/40 text-[11px] font-mono font-bold text-indigo-300">
                                {w.endpoint || w.path}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {formatRelativeTime(w.created_at)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-white leading-snug break-words bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 font-mono">
                              {w.detail || w.message}
                            </p>
                            <p className="text-xs text-slate-300">
                              <strong className="text-indigo-300">Öneri:</strong>{" "}
                              {w.recommendation}
                            </p>
                          </div>

                          {(w.user_id || w.ip) && (
                            <button
                              type="button"
                              disabled={suspendingKey === `warn-${w.id}`}
                              onClick={() =>
                                handleSuspendTarget({
                                  userId: w.user_id,
                                  ip: w.ip,
                                  label: w.user_id ? `Kullanıcı (${w.user_id.slice(0, 8)})` : `IP (${w.ip})`,
                                  rowKey: `warn-${w.id}`,
                                })
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-rose-200 text-[11px] font-black flex items-center gap-1.5 shrink-0 transition cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              {suspendingKey === `warn-${w.id}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Ban className="w-3 h-3" />
                              )}
                              <span>🚫 Erişimi Durdur</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ================================================================= */}
            {/* BLOK 2: 👥 CANLI KULLANICI & SINIF KARTLARI (4'LÜ KPI)             */}
            {/* ================================================================= */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Toplam Üye
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white font-mono">
                  {totalUsers}
                </div>
                <p className="text-[11px] text-slate-400">
                  Supabase <code className="text-indigo-300">public.users</code>
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Bugün Aktif
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-300 font-mono">
                  {data.users_summary.active_today_count}
                </div>
                <p className="text-[11px] text-slate-400">
                  Son 24 saatte oturum / kota hareketi
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    PRO / Ücretsiz Oranı
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400">
                    <Crown className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-300 font-mono">
                    {proUsers}
                  </span>
                  <span className="text-sm font-bold text-slate-400 font-mono">
                    / {freeUsers}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    %{proPercent} PRO
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${proPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                  />
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Şu An Canlı Ders
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center text-rose-400">
                    <Radio className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white font-mono">
                  {data.live_classes.active_sessions_count}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {data.live_classes.active_rooms.length > 0
                    ? data.live_classes.active_rooms
                        .map((r) => r.title)
                        .slice(0, 2)
                        .join(", ")
                    : "Aktif canlı ders odası yok"}
                </p>
              </div>
            </section>

            {/* ================================================================= */}
            {/* BLOK 3 & BLOK 4: KOTA TÜKETİMİ + ÜLKE DAĞILIMI                    */}
            {/* ================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* BLOK 3: ⚡ GÜNLÜK KOTA & AI MALİYET TÜKETİMİ */}
              <section className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-black text-white">
                      ⚡ Günlük Kota &amp; AI Maliyet Tüketimi
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Bugün (UTC)
                  </span>
                </div>

                {/* 3 Alt Sayaç */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Hikaye</span>
                    </div>
                    <div className="text-2xl font-black text-indigo-300 font-mono">
                      {data.quota_usage_today.ai_stories_today}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Metin Analizi</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-300 font-mono">
                      {data.quota_usage_today.custom_texts_today}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      <span>Speaking</span>
                    </div>
                    <div className="text-2xl font-black text-amber-300 font-mono">
                      {data.quota_usage_today.speaking_sessions_today}
                    </div>
                  </div>
                </div>

                {/* Limiti Zorlayan İlk 5 Kullanıcı Tablosu */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bugün En Çok Kota Tüketen Kullanıcılar (İlk 5)
                  </h3>
                  {data.quota_usage_today.top_quota_users.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                      Bugün henüz AI kota tüketimi kaydedilmedi.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="px-3.5 py-2.5">Kullanıcı</th>
                            <th className="px-2.5 py-2.5 text-center">Plan</th>
                            <th className="px-2.5 py-2.5 text-center">Metin</th>
                            <th className="px-2.5 py-2.5 text-center">Hikaye</th>
                            <th className="px-2.5 py-2.5 text-center">Speaking</th>
                            <th className="px-3 py-2.5 text-right">Toplam</th>
                            <th className="px-3 py-2.5 text-right">Müdahale</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                          {data.quota_usage_today.top_quota_users.map((u) => {
                            const isSelfAdmin =
                              (u.email || "").toLowerCase().trim() === ADMIN_EMAIL;
                            return (
                              <tr key={u.id} className="hover:bg-slate-800/40">
                                <td className="px-3.5 py-2.5 max-w-[165px]">
                                  <div className="font-bold text-white truncate">
                                    {u.full_name || u.username}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono truncate">
                                    {u.email || u.username}
                                  </div>
                                </td>
                                <td className="px-2.5 py-2.5 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      u.plan_tier === "pro"
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/35"
                                        : "bg-slate-800 text-slate-300 border border-slate-700"
                                    }`}
                                  >
                                    {u.plan_tier}
                                  </span>
                                </td>
                                <td className="px-2.5 py-2.5 text-center font-mono text-slate-200">
                                  {u.custom_texts}
                                </td>
                                <td className="px-2.5 py-2.5 text-center font-mono text-slate-200">
                                  {u.ai_stories}
                                </td>
                                <td className="px-2.5 py-2.5 text-center font-mono text-slate-200">
                                  {u.speaking_sessions}
                                </td>
                                <td className="px-3 py-2.5 text-right font-mono font-black text-indigo-300">
                                  {u.total_today}
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  {isSelfAdmin ? (
                                    <span className="text-[10px] font-mono text-slate-500">
                                      Admin
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={suspendingKey === `user-${u.id}`}
                                      onClick={() =>
                                        handleSuspendTarget({
                                          userId: u.id,
                                          label: u.email || u.username || u.full_name,
                                          rowKey: `user-${u.id}`,
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-rose-200 text-[10px] font-black inline-flex items-center gap-1 transition cursor-pointer active:scale-95 disabled:opacity-50 whitespace-nowrap"
                                    >
                                      {suspendingKey === `user-${u.id}` ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Ban className="w-3 h-3" />
                                      )}
                                      <span>🚫 Erişimi Durdur</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* BLOK 4: 🌍 ÜLKE BAZLI BAĞLANTI DAĞILIMI */}
              <section className="lg:col-span-5 rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-sky-400" />
                    <h2 className="text-base font-black text-white">
                      🌍 Ülke Bazlı Bağlantı Dağılımı
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Son 7 Gün ({data.countries_meta?.total_7d || 0})
                  </span>
                </div>

                {data.countries.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">
                      Henüz coğrafi konum kaydı yok
                    </p>
                    <p>
                      Kullanıcılar siteye bağlandıkça Vercel ülke başlıkları burada canlı olarak gruplanacaktır.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {data.countries.map((c) => {
                      const flag = countryCodeToFlag(c.country);
                      const label = COUNTRY_NAMES[c.country] || c.country;
                      return (
                        <div
                          key={c.country}
                          className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-lg leading-none">{flag}</span>
                              <span className="font-bold text-white truncate">
                                {label}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {c.country}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 font-mono">
                              {typeof c.count_24h === "number" && c.count_24h > 0 && (
                                <span className="text-[10px] text-emerald-300">
                                  24s: {c.count_24h}
                                </span>
                              )}
                              <span className="font-black text-sky-300">
                                {c.count}
                              </span>
                              <span className="text-[11px] text-slate-400 w-10 text-right">
                                %{c.percentage}
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(4, Math.min(100, c.percentage))}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
