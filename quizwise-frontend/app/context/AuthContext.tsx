"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config";

export type PlanTier = "basic" | "plus" | "pro";

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: string;
  isPro: boolean;
  isEducator: boolean;
  planTier: PlanTier;
  subscriptionStatus?: string | null;
  trialEndsAt?: string | null;
  trialDaysLeft?: number | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (
    fullName: string,
    username: string,
    password: string,
    email?: string,
    planTier?: PlanTier
  ) => Promise<AuthUser>;
  upgradeToPro: () => Promise<AuthUser>;
  logout: () => void;
}

export const AUTH_TOKEN_STORAGE_KEY = "vorego_auth_token";
export const AUTH_USER_STORAGE_KEY = "vorego_auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthEndpoint(path: "login" | "register" | "upgrade-pro"): string {
  const cleaned = (API_BASE || process.env.NEXT_PUBLIC_API_URL || "https://vocaship-api.onrender.com").replace(/\/+$/, "");
  if (cleaned.endsWith("/api/v1")) {
    return `${cleaned}/auth/${path}`;
  }
  return `${cleaned}/api/v1/auth/${path}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sayfa ilk açıldığında localStorage'dan oturumu otomatik geri yükle
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      const savedUserRaw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (savedToken && savedUserRaw) {
        const parsedUser = JSON.parse(savedUserRaw) as AuthUser;
        if (parsedUser && parsedUser.id && parsedUser.username) {
          const tier: PlanTier =
            (parsedUser.planTier as PlanTier) ||
            (parsedUser.isPro ? "pro" : "basic");
          const normalizedUser: AuthUser = { ...parsedUser, planTier: tier };
          setToken(savedToken);
          setUser(normalizedUser);
        }
      }
    } catch (err) {
      console.warn("[AuthContext] Oturum geri yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }

    const handleProActivated = () => {
      setUser((prev) => {
        if (!prev) return prev;
        const upgraded: AuthUser = {
          ...prev,
          isPro: true,
          isEducator: true,
          planTier: "pro",
          subscriptionStatus: "active",
          trialDaysLeft: null,
        };
        try {
          localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(upgraded));
          localStorage.setItem("vocaship_plan_tier", "pro");
        } catch {}
        return upgraded;
      });
    };

    window.addEventListener("vocaship_pro_activated", handleProActivated);
    return () => {
      window.removeEventListener("vocaship_pro_activated", handleProActivated);
    };
  }, []);

  const persistSession = (authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    try {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
      localStorage.setItem("vocaship_plan_tier", authUser.planTier);
    } catch (err) {
      console.warn("[AuthContext] localStorage kayıt hatası:", err);
    }
  };

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const res = await fetch(getAuthEndpoint("login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.detail || "Kullanıcı adı veya şifre hatalı.");
    }

    const tier: PlanTier =
      (data.plan_tier as PlanTier) ||
      (Boolean(data.is_pro ?? data.isPro) ? "pro" : "basic");

    const mappedUser: AuthUser = {
      id: String(data.user_id || data.id || ""),
      username: String(data.username || username.trim()),
      fullName: String(data.full_name || data.fullName || data.username || ""),
      email: data.email || data.user?.email || undefined,
      role: String(data.role || "user"),
      isPro: tier === "pro" || Boolean(data.is_pro ?? data.isPro ?? false),
      isEducator: Boolean(data.is_educator ?? data.isEducator ?? false),
      planTier: tier,
      subscriptionStatus: data.subscription_status ?? data.user?.subscription_status ?? null,
      trialEndsAt: data.trial_ends_at ?? data.user?.trial_ends_at ?? null,
      trialDaysLeft:
        typeof (data.trial_days_left ?? data.user?.trial_days_left) === "number"
          ? (data.trial_days_left ?? data.user?.trial_days_left)
          : null,
    };
    const jwtToken = String(data.token || "");

    persistSession(mappedUser, jwtToken);
    return mappedUser;
  };

  const register = async (
    fullName: string,
    username: string,
    password: string,
    email?: string,
    planTier: PlanTier = "pro"
  ): Promise<AuthUser> => {
    const res = await fetch(getAuthEndpoint("register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        username: username.trim(),
        password,
        email: email ? email.trim() : undefined,
        plan_tier: planTier,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.detail || "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    }

    const tier: PlanTier = (data.plan_tier as PlanTier) || "pro";

    const mappedUser: AuthUser = {
      id: String(data.user_id || data.id || ""),
      username: String(data.username || username.trim()),
      fullName: String(data.full_name || data.fullName || fullName.trim()),
      email: data.email || data.user?.email || (email ? email.trim() : undefined),
      role: String(data.role || "user"),
      isPro: tier === "pro" || Boolean(data.is_pro ?? data.isPro ?? true),
      isEducator: Boolean(data.is_educator ?? data.isEducator ?? true),
      planTier: tier,
      subscriptionStatus: data.subscription_status ?? data.user?.subscription_status ?? "trial",
      trialEndsAt: data.trial_ends_at ?? data.user?.trial_ends_at ?? null,
      trialDaysLeft:
        typeof (data.trial_days_left ?? data.user?.trial_days_left) === "number"
          ? (data.trial_days_left ?? data.user?.trial_days_left)
          : 30,
    };
    const jwtToken = String(data.token || "");

    persistSession(mappedUser, jwtToken);
    return mappedUser;
  };

  const upgradeToPro = async (): Promise<AuthUser> => {
    const baseUser: AuthUser = user
      ? { ...user, isPro: true, isEducator: true, planTier: "pro" }
      : {
          id: `pro-${Date.now()}`,
          username: "pro_egitmen",
          fullName: "PRO Eğitmen",
          role: "user",
          isPro: true,
          isEducator: true,
          planTier: "pro",
        };

    try {
      const res = await fetch(getAuthEndpoint("upgrade-pro"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: baseUser.id,
          username: baseUser.username,
          full_name: baseUser.fullName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const upgradedUser: AuthUser = {
          id: String(data.user_id || baseUser.id),
          username: String(data.username || baseUser.username),
          fullName: String(data.full_name || baseUser.fullName),
          role: String(data.role || baseUser.role),
          isPro: true,
          isEducator: true,
          planTier: "pro",
        };
        const newToken = String(data.token || token || "pro-test-token");
        persistSession(upgradedUser, newToken);
        return upgradedUser;
      }
    } catch {
      // Fallback to immediate local state upgrade
    }

    persistSession(baseUser, token || "pro-test-token");
    return baseUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      localStorage.removeItem("vocaship_plan_tier");
    } catch {
      // ignore storage errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        upgradeToPro,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
