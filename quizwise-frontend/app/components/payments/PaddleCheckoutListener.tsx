"use client";

import { useEffect } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useProfile } from "../../context/ProfileContext";

let paddleInstanceCache: Paddle | undefined;
let paddleInitPromise: Promise<Paddle | undefined> | null = null;
let autoOpenedPtxn: string | null = null;

export function getPaddleEnvironment(): "production" | "sandbox" {
  return process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
    ? "production"
    : "sandbox";
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
      eventCallback: (event) => {
        if (event?.name === "checkout.completed") {
          window.dispatchEvent(
            new CustomEvent("vocaship_paddle_checkout_completed")
          );
        }
      },
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
  const { refreshProfile } = useProfile();

  useEffect(() => {
    let active = true;

    const handleCompleted = () => {
      refreshProfile?.();
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
      // Arka planda Paddle.js'i önceden hazırla
      getOrInitPaddle();
    }

    return () => {
      active = false;
      window.removeEventListener(
        "vocaship_paddle_checkout_completed",
        handleCompleted
      );
    };
  }, [refreshProfile]);

  return null;
}
