"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config";
import { sanitizeUsername } from "../utils/avatarHelper";

export type PlanTier = "free" | "pro";

function normalizePlanTier(raw?: unknown, isPro?: boolean, role?: unknown): PlanTier {
  if (isPro || String(role || "").toLowerCase() === "admin") return "pro";
  const s = String(raw || "").toLowerCase().trim();
  return s === "pro" ? "pro" : "free";
}

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
  isAuthReady: boolean;
  hasEntered: boolean;
  isGuest: boolean;
  gateReason: string | null;
  setGateReason: (reason: string | null) => void;
  enterGuestMode: () => void;
  openRegistrationGate: (reason?: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: "login" | "register";
  setAuthModalTab: (tab: "login" | "register") => void;
  openAuthModal: (tab?: "login" | "register") => void;
  isWelcomeModalOpen: boolean;
  setIsWelcomeModalOpen: (open: boolean) => void;
  openWelcomeModal: () => void;
  login: (usernameOrEmail: string, password: string) => Promise<AuthUser>;
  register: (
    fullName: string,
    username: string,
    password: string,
    email: string
  ) => Promise<RegisterResult>;
  verifyEmail: (email: string, code: string) => Promise<AuthUser>;
  forgotPassword: (
    email: string
  ) => Promise<{ ok: boolean; message: string; devCode?: string | null }>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<{ ok: boolean; message: string }>;
  upgradeToPro: () => Promise<AuthUser>;
  logout: () => void;
}

export const AUTH_TOKEN_STORAGE_KEY = "vorego_auth_token";
export const AUTH_USER_STORAGE_KEY = "vorego_auth_user";
const ENTERED_STORAGE_KEY = "vocaship_entered";
const WELCOME_SKIPPED_KEY = "vocaship_welcome_skipped";
const LOGGED_OUT_KEY = "vocaship_logged_out";
const GUEST_MODE_KEY = "vocaship_guest";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthEndpoint(
  path:
    | "login"
    | "register"
    | "verify-email"
    | "forgot-password"
    | "reset-password"
    | "upgrade-pro"
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
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [gateReason, setGateReason] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setGateReason(null);
    setAuthModalTab(tab);
    setIsWelcomeModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const openRegistrationGate = (
    reason = "Harika gidiyorsun! Öğrendiğin kelimeleri kalıcı olarak kaydetmek için 10 saniyede ücretsiz hesabını aç."
  ) => {
    setGateReason(reason);
    setAuthModalTab("register");
    setIsWelcomeModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setHasEntered(true);
    setIsWelcomeModalOpen(false);
    setIsAuthModalOpen(false);
    setGateReason(null);
    try {
      localStorage.setItem(ENTERED_STORAGE_KEY, "true");
      localStorage.setItem(GUEST_MODE_KEY, "true");
      sessionStorage.setItem(GUEST_MODE_KEY, "true");
      sessionStorage.setItem(WELCOME_SKIPPED_KEY, "1");
      sessionStorage.removeItem(LOGGED_OUT_KEY);
    } catch {}
  };

  const openWelcomeModal = () => {
    try {
      sessionStorage.removeItem(LOGGED_OUT_KEY);
      sessionStorage.removeItem(WELCOME_SKIPPED_KEY);
    } catch {}
    setIsAuthModalOpen(false);
    setIsWelcomeModalOpen(true);
  };

  // Sayfa ilk açıldığında localStorage'dan oturum / giriş bayrağını oku
  useEffect(() => {
    let restored = false;
    try {
      const savedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      const savedUserRaw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (savedToken && savedUserRaw) {
        const parsedUser = JSON.parse(savedUserRaw) as AuthUser;
        if (parsedUser && parsedUser.id && parsedUser.username) {
          const tier = normalizePlanTier(parsedUser.planTier, parsedUser.isPro, parsedUser.role);
          const normalizedUser: AuthUser = { ...parsedUser, planTier: tier, isPro: tier === "pro" };
          setToken(savedToken);
          setUser(normalizedUser);
          setIsGuest(false);
          setHasEntered(true);
          localStorage.setItem(ENTERED_STORAGE_KEY, "true");
          restored = true;
        }
      }

      if (!restored) {
        const enteredBefore = localStorage.getItem(ENTERED_STORAGE_KEY) === "true";
        const wasGuest =
          localStorage.getItem(GUEST_MODE_KEY) === "true" ||
          sessionStorage.getItem(GUEST_MODE_KEY) === "true";
        if (enteredBefore) {
          setHasEntered(true);
          setIsGuest(true);
          setIsWelcomeModalOpen(false);
        } else if (wasGuest) {
          setHasEntered(true);
          setIsGuest(true);
          setIsWelcomeModalOpen(false);
          localStorage.setItem(ENTERED_STORAGE_KEY, "true");
        } else {
          setHasEntered(false);
          setIsWelcomeModalOpen(true);
        }
      }
    } catch (err) {
      console.warn("[AuthContext] Oturum geri yüklenemedi:", err);
      setHasEntered(false);
      setIsWelcomeModalOpen(true);
    } finally {
      setIsLoading(false);
      setIsAuthReady(true);
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
    setIsGuest(false);
    setHasEntered(true);
    setGateReason(null);
    setIsWelcomeModalOpen(false);
    try {
      sessionStorage.removeItem(LOGGED_OUT_KEY);
      sessionStorage.removeItem(GUEST_MODE_KEY);
      localStorage.removeItem(GUEST_MODE_KEY);
      localStorage.setItem(ENTERED_STORAGE_KEY, "true");
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
    const tier = normalizePlanTier(
      data.plan_tier,
      Boolean(data.is_pro ?? data.isPro),
      data.role
    );
    const safeEmail = data.email || data.user?.email || fallbackEmail || undefined;
    const safeUsername = sanitizeUsername(data.username || fallbackUsername, safeEmail);
    const rawFullName = String(data.full_name || data.fullName || "").trim();
    const safeFullName =
      rawFullName && !rawFullName.includes("@") ? rawFullName : safeUsername;

    return {
      id: String(data.user_id || data.id || ""),
      username: safeUsername,
      fullName: safeFullName,
      email: safeEmail,
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
    const normalizedLower = cleanInput.toLowerCase();
    const res = await fetch(getAuthEndpoint("login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: normalizedLower,
        email: cleanInput.includes("@") ? normalizedLower : undefined,
        username: cleanInput,
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof data?.detail === "string"
          ? data.detail
          : "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin."
      );
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

  const forgotPassword = async (
    email: string
  ): Promise<{ ok: boolean; message: string; devCode?: string | null }> => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(getAuthEndpoint("forgot-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.detail || "Şifre sıfırlama kodu gönderilemedi. Lütfen tekrar deneyin."
      );
    }
    return {
      ok: Boolean(data.ok ?? true),
      message:
        data.message ||
        "Eğer bu e-posta sistemde kayıtlıysa şifre sıfırlama kodu gönderildi.",
      devCode: data.dev_code || null,
    };
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ ok: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(getAuthEndpoint("reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        code: code.trim(),
        new_password: newPassword,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.detail || "Şifre sıfırlanamadı. Kodu kontrol edip tekrar deneyin."
      );
    }
    return {
      ok: Boolean(data.ok ?? true),
      message:
        data.message ||
        "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.",
    };
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
    setIsGuest(false);
    setHasEntered(false);
    setGateReason(null);
    setIsAuthModalOpen(false);
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      localStorage.removeItem("vocaship_plan_tier");
      localStorage.removeItem("vocaship_profile");
      localStorage.removeItem(ENTERED_STORAGE_KEY);
      localStorage.removeItem(GUEST_MODE_KEY);
      sessionStorage.removeItem(GUEST_MODE_KEY);
      sessionStorage.removeItem(LOGGED_OUT_KEY);
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
        isAuthReady,
        hasEntered,
        isGuest,
        gateReason,
        setGateReason,
        enterGuestMode,
        openRegistrationGate,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        isWelcomeModalOpen,
        setIsWelcomeModalOpen,
        openWelcomeModal,
        login,
        register,
        verifyEmail,
        forgotPassword,
        resetPassword,
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
