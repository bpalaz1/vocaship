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
  emailVerified?: boolean;
  subscriptionStatus?: string | null;
  trialEndsAt?: string | null;
  trialDaysLeft?: number | null;
}

export interface RegisterResult {
  requiresEmailVerification: boolean;
  email: string;
  devVerificationCode?: string | null;
  verificationSent?: boolean;
  message?: string;
  user?: AuthUser;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: "login" | "register";
  setAuthModalTab: (tab: "login" | "register") => void;
  openAuthModal: (tab?: "login" | "register") => void;
  isWelcomeModalOpen: boolean;
  setIsWelcomeModalOpen: (open: boolean) => void;
  login: (usernameOrEmail: string, password: string) => Promise<AuthUser>;
  register: (
    fullName: string,
    username: string,
    password: string,
    email: string
  ) => Promise<RegisterResult>;
  verifyEmail: (email: string, code: string) => Promise<AuthUser>;
  upgradeToPro: () => Promise<AuthUser>;
  logout: () => void;
}

export const AUTH_TOKEN_STORAGE_KEY = "vorego_auth_token";
export const AUTH_USER_STORAGE_KEY = "vorego_auth_user";
const WELCOME_SKIPPED_KEY = "vocaship_welcome_skipped";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthEndpoint(
  path: "login" | "register" | "verify-email" | "upgrade-pro"
): string {
  const cleaned = (
    API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://vocaship-api.onrender.com"
  ).replace(/\/+$/, "");
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
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsWelcomeModalOpen(false);
    setIsAuthModalOpen(true);
  };

  // Sayfa ilk açıldığında localStorage'dan oturumu geri yükle; yoksa karşılama sahnesini aç
  useEffect(() => {
    let restored = false;
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
          restored = true;
        }
      }
    } catch (err) {
      console.warn("[AuthContext] Oturum geri yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }

    if (!restored) {
      try {
        const skipped = sessionStorage.getItem(WELCOME_SKIPPED_KEY) === "1";
        if (!skipped) {
          setIsWelcomeModalOpen(true);
        }
      } catch {
        setIsWelcomeModalOpen(true);
      }
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
    setIsWelcomeModalOpen(false);
    try {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
      localStorage.setItem("vocaship_plan_tier", authUser.planTier);
    } catch (err) {
      console.warn("[AuthContext] localStorage kayıt hatası:", err);
    }
  };

  const mapAuthResponseToUser = (
    data: any,
    fallbackUsername = "",
    fallbackEmail?: string
  ): AuthUser => {
    const tier: PlanTier =
      (data.plan_tier as PlanTier) ||
      (Boolean(data.is_pro ?? data.isPro) ? "pro" : "basic");
    return {
      id: String(data.user_id || data.id || ""),
      username: String(data.username || fallbackUsername),
      fullName: String(data.full_name || data.fullName || data.username || fallbackUsername),
      email: data.email || data.user?.email || fallbackEmail || undefined,
      role: String(data.role || "user"),
      isPro: tier === "pro" || Boolean(data.is_pro ?? data.isPro ?? false),
      isEducator: Boolean(data.is_educator ?? data.isEducator ?? false),
      planTier: tier,
      emailVerified: Boolean(data.email_verified ?? data.user?.email_verified ?? true),
      subscriptionStatus:
        data.subscription_status ?? data.user?.subscription_status ?? null,
      trialEndsAt: data.trial_ends_at ?? data.user?.trial_ends_at ?? null,
      trialDaysLeft:
        typeof (data.trial_days_left ?? data.user?.trial_days_left) === "number"
          ? data.trial_days_left ?? data.user?.trial_days_left
          : null,
    };
  };

  const login = async (
    usernameOrEmail: string,
    password: string
  ): Promise<AuthUser> => {
    const cleanInput = usernameOrEmail.trim();
    const res = await fetch(getAuthEndpoint("login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        cleanInput.includes("@")
          ? { email: cleanInput.toLowerCase(), username: cleanInput, password }
          : { username: cleanInput, password }
      ),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.detail || "E-posta/kullanıcı adı veya şifre hatalı.");
    }

    const mappedUser = mapAuthResponseToUser(data, cleanInput);
    const jwtToken = String(data.token || "");

    persistSession(mappedUser, jwtToken);
    return mappedUser;
  };

  const register = async (
    fullName: string,
    username: string,
    password: string,
    email: string
  ): Promise<RegisterResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(getAuthEndpoint("register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        username: username.trim(),
        email: cleanEmail,
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.detail || "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    }

    if (data.requires_email_verification || !data.token) {
      return {
        requiresEmailVerification: true,
        email: String(data.email || cleanEmail),
        devVerificationCode: data.dev_verification_code || null,
        verificationSent: Boolean(data.verification_sent),
        message:
          data.message ||
          "Doğrulama kodu e-posta adresinize gönderildi.",
      };
    }

    const mappedUser = mapAuthResponseToUser(data, username.trim(), cleanEmail);
    const jwtToken = String(data.token || "");
    persistSession(mappedUser, jwtToken);

    return {
      requiresEmailVerification: false,
      email: cleanEmail,
      user: mappedUser,
    };
  };

  const verifyEmail = async (email: string, code: string): Promise<AuthUser> => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(getAuthEndpoint("verify-email"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        code: code.trim(),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.detail || "Doğrulama kodu geçersiz. Lütfen tekrar deneyin."
      );
    }

    const mappedUser = mapAuthResponseToUser(data, cleanEmail.split("@")[0], cleanEmail);
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
          email: data.email || baseUser.email,
          role: String(data.role || baseUser.role),
          isPro: true,
          isEducator: true,
          planTier: "pro",
          subscriptionStatus: "active",
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
    setIsAuthModalOpen(false);
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      localStorage.removeItem("vocaship_plan_tier");
      localStorage.removeItem("vocaship_profile");
      sessionStorage.removeItem(WELCOME_SKIPPED_KEY);
      window.dispatchEvent(new CustomEvent("vocaship_logged_out"));
    } catch {
      // ignore storage errors
    }
    setIsWelcomeModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        isWelcomeModalOpen,
        setIsWelcomeModalOpen,
        login,
        register,
        verifyEmail,
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
