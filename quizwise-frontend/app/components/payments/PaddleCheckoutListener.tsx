"use client";

import React, { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { CheckCircle2, Crown, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { API_BASE } from "../../config";

let paddleInstanceCache: Paddle | undefined;
let paddleInitPromise: Promise<Paddle | undefined> | null = null;
let autoOpenedPtxn: string | null = null;
const confirmedTransactions = new Set<string>();

export function getPaddleEnvironment(): "production" | "sandbox" {
  return process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
    ? "production"
    : "sandbox";
}

export function createPaddleEventCallback() {
  return (event: any) => {
    if (event?.name === "checkout.completed") {
      const transactionId =
        event?.data?.transaction_id || event?.data?.id || null;
      window.dispatchEvent(
        new CustomEvent("vocaship_paddle_checkout_completed", {
          detail: { transactionId, rawEvent: event?.data },
        })
      );
    }
  };
}

export async function getOrInitPaddle(): Promise<Paddle | undefined> {
  if (typeof window === "undefined") return undefined;
  if (paddleInstanceCache) return paddleInstanceCache;

  if (!paddleInitPromise) {
    const environment = getPaddleEnvironment();
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";

    paddleInitPromise = initializePaddle({
      environment,
      token,
      eventCallback: createPaddleEventCallback(),
    })
      .then((instance) => {
        if (instance) {
          paddleInstanceCache = instance;
        } else {
          paddleInitPromise = null;
        }
        return instance;
      })
      .catch((err) => {
        console.warn("[Paddle] initializePaddle hatası:", err);
        paddleInitPromise = null;
        return undefined;
      });
  }

  return paddleInitPromise;
}

export default function PaddleCheckoutListener() {
  const { user } = useAuth();
  const { userProfile, updateProfile, refreshProfile } = useProfile();
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const handleCompleted = async (ev: Event) => {
      const ce = ev as CustomEvent<{ transactionId?: string | null }>;
      const transactionId = ce?.detail?.transactionId?.trim();
      const dedupeKey = transactionId || `instant_${Date.now()}`;
      if (transactionId && confirmedTransactions.has(dedupeKey)) {
        return;
      }
      if (transactionId) {
        confirmedTransactions.add(dedupeKey);
      }

      const uid =
        user?.id ||
        userProfile?.id ||
        userProfile?.user_id ||
        (() => {
          try {
            const rawAuth = localStorage.getItem("vorego_auth_user");
            if (rawAuth) return JSON.parse(rawAuth)?.id;
          } catch {}
          return null;
        })() ||
        "00000000-0000-0000-0000-000000000001";

      // 1. Backend Paddle API doğrulama & DB (Supabase + SQLite) anlık PRO güncellemesi
      if (transactionId) {
        try {
          const cleanedBase = (API_BASE || "").replace(/\/+$/, "");
          const confirmUrl = cleanedBase.endsWith("/api/v1")
            ? `${cleanedBase}/payments/paddle/confirm-client`
            : `${cleanedBase}/api/v1/payments/paddle/confirm-client`;

          await fetch(confirmUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: uid,
              transaction_id: transactionId,
            }),
          });
        } catch (err) {
          console.warn("[Paddle] confirm-client çağrısı uyarısı:", err);
        }
      }

      // 2. localStorage + AuthContext + ProfileContext anlık PRO güncellemesi
      try {
        localStorage.setItem("vocaship_plan_tier", "pro");
        const rawAuth = localStorage.getItem("vorego_auth_user");
        if (rawAuth) {
          const parsedAuth = JSON.parse(rawAuth);
          localStorage.setItem(
            "vorego_auth_user",
            JSON.stringify({
              ...parsedAuth,
              isPro: true,
              isEducator: true,
              planTier: "pro",
              subscriptionStatus: "active",
              trialDaysLeft: null,
            })
          );
        }
        const rawProf = localStorage.getItem("vocaship_profile");
        if (rawProf) {
          const parsedProf = JSON.parse(rawProf);
          localStorage.setItem(
            "vocaship_profile",
            JSON.stringify({
              ...parsedProf,
              is_pro: true,
              plan_tier: "pro",
              planTier: "pro",
              subscription_status: "active",
              trial_days_left: null,
            })
          );
        }
      } catch {}

      window.dispatchEvent(new CustomEvent("vocaship_pro_activated"));

      await updateProfile({
        is_pro: true,
        plan_tier: "pro",
        planTier: "pro",
        subscription_status: "active",
        trial_days_left: null,
      });

      refreshProfile?.();

      // 3. Başarı bildirimi göster
      if (active) {
        setSuccessToast("🎉 Tebrikler! VocaShip PRO üyeliğiniz aktif edildi.");
        setTimeout(() => {
          if (active) setSuccessToast(null);
        }, 7000);
      }
    };

    window.addEventListener(
      "vocaship_paddle_checkout_completed",
      handleCompleted
    );

    const params = new URLSearchParams(window.location.search);
    const ptxn = params.get("_ptxn")?.trim();

    if (ptxn && autoOpenedPtxn !== ptxn) {
      autoOpenedPtxn = ptxn;
      getOrInitPaddle().then((paddle) => {
        if (!active || !paddle) return;
        try {
          paddle.Checkout.open({ transactionId: ptxn });
        } catch (err) {
          console.warn("[Paddle] ?_ptxn otomatik checkout açma hatası:", err);
        }
      });
    } else if (process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
      getOrInitPaddle();
    }

    return () => {
      active = false;
      window.removeEventListener(
        "vocaship_paddle_checkout_completed",
        handleCompleted
      );
    };
  }, [user, userProfile, updateProfile, refreshProfile]);

  if (!successToast) return null;

  return (
    <div
      data-testid="paddle-pro-activated-toast"
      className="fixed top-20 right-4 sm:right-6 z-[200] max-w-md flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-amber-950/95 border border-amber-400/50 text-white shadow-2xl shadow-amber-500/20 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
        <Crown className="w-5 h-5 text-amber-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-black text-amber-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={() => setSuccessToast(null)}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
        aria-label="Kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
