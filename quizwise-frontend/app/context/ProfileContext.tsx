"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { API_BASE } from "../config";

export interface UserProfile {
  id?: string;
  user_id?: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string;
  is_pro: boolean;
  plan_tier?: "basic" | "plus" | "pro";
  planTier?: "basic" | "plus" | "pro";
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  trial_days_left?: number | null;
  study_level?: string;
  daily_goal?: number;
  tts_voice?: string;
  tts_speed?: string;
  theme?: "dark" | "light";
}

export interface ProfileContextType {
  userProfile: UserProfile;
  updateUsername: (newUsername: string) => Promise<void>;
  updateAvatar: (newAvatarUrl: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  settingsInitialTab?: "profile" | "learning" | "audio_theme";
  setSettingsInitialTab: (tab: "profile" | "learning" | "audio_theme") => void;
}

const STORAGE_KEY = "vocaship_profile";

const DEFAULT_PROFILE: UserProfile = {
  full_name: "Öğrenci",
  username: "ogrenci",
  email: "ogrenci@vocaship.com",
  avatar_url: "🦊",
  is_pro: false,
  plan_tier: "basic",
  planTier: "basic",
  study_level: "B1",
  daily_goal: 20,
  tts_voice: "en-US-JennyNeural",
  tts_speed: "1.0x",
  theme: "dark",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<
    "profile" | "learning" | "audio_theme"
  >("profile");

  // 1. Sayfa yüklendiğinde localStorage'dan profili geri yükle ve CustomEvent senkronizasyonunu dinle
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        // Eski karakter unvanı kaydını temizle (yalnızca @username + avatar görseli kullanılır)
        localStorage.removeItem("vocaship_equipped_title");
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            const { equipped_title: _removed, ...cleanProfile } = parsed;
            if (_removed !== undefined) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanProfile));
            }
            setUserProfile((prev) => ({
              ...prev,
              ...cleanProfile,
            }));
          }
        }
      } catch (err) {
        console.warn("[ProfileContext] localStorage profil okuma hatası:", err);
      }
    };

    loadFromStorage();

    const handleProfileCustomEvent = (e: Event) => {
      const ce = e as CustomEvent<Partial<UserProfile>>;
      if (ce.detail && typeof ce.detail === "object") {
        setUserProfile((prev) => ({ ...prev, ...ce.detail }));
      } else {
        loadFromStorage();
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadFromStorage();
      }
    };

    const handleLoggedOut = () => {
      setUserProfile(DEFAULT_PROFILE);
    };

    window.addEventListener("vocaship_profile_updated", handleProfileCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener("vocaship_logged_out", handleLoggedOut);
    return () => {
      window.removeEventListener("vocaship_profile_updated", handleProfileCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("vocaship_logged_out", handleLoggedOut);
    };
  }, []);

  // 2. AuthContext'teki kullanıcı değiştiğinde profili güncelle
  useEffect(() => {
    if (user) {
      const tier = user.planTier || (user.isPro ? "pro" : "basic");
      setUserProfile((prev) => {
        const updated: UserProfile = {
          ...prev,
          id: user.id || prev.id,
          user_id: user.id || prev.user_id,
          full_name: user.fullName || prev.full_name,
          username: user.username || prev.username,
          email: user.email || prev.email,
          is_pro: user.isPro ?? prev.is_pro,
          plan_tier: tier,
          planTier: tier,
          subscription_status:
            user.subscriptionStatus !== undefined
              ? user.subscriptionStatus
              : prev.subscription_status,
          trial_ends_at:
            user.trialEndsAt !== undefined ? user.trialEndsAt : prev.trial_ends_at,
          trial_days_left:
            user.trialDaysLeft !== undefined
              ? user.trialDaysLeft
              : prev.trial_days_left,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [user]);

  // 3. Sunucudan güncel profil verisini çek (varsa)
  const refreshProfile = useCallback(async () => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("vorego_auth_token") : null);
    if (!activeToken) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/profile`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.username) {
          const tier = (data.plan_tier as "basic" | "plus" | "pro") || (data.is_pro ? "pro" : "basic");
          let localStored: Partial<UserProfile> = {};
          try {
            const rawLocal = localStorage.getItem(STORAGE_KEY);
            if (rawLocal) localStored = JSON.parse(rawLocal) || {};
          } catch {}

          const incomingEmail = String(data.email || "");
          const preservedEmail =
            localStored.email && (!incomingEmail || incomingEmail.endsWith("@vocaship.local"))
              ? localStored.email
              : incomingEmail || localStored.email || "";

          setUserProfile((prev) => {
            const synced: UserProfile = {
              ...prev,
              ...localStored,
              id: data.id || prev.id,
              user_id: data.id || prev.user_id,
              full_name: localStored.full_name || data.full_name || prev.full_name || "Öğrenci",
              username: (localStored.username || data.username || prev.username).replace(/^@+/, ""),
              email: preservedEmail,
              avatar_url: localStored.avatar_url || data.avatar_url || prev.avatar_url || "🦊",
              is_pro: Boolean(data.is_pro),
              plan_tier: tier,
              planTier: tier,
              subscription_status: data.subscription_status ?? prev.subscription_status ?? null,
              trial_ends_at: data.trial_ends_at ?? prev.trial_ends_at ?? null,
              trial_days_left:
                typeof data.trial_days_left === "number"
                  ? data.trial_days_left
                  : prev.trial_days_left ?? null,
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
            } catch {}
            return synced;
          });
        }
      }
    } catch (err) {
      console.debug("[ProfileContext] Profil yenileme atlandı:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token, refreshProfile]);

  // 4. Genel Profil Güncelleme (Local + CustomEvent + Backend sync)
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...userProfile,
      ...updates,
    };
    setUserProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vocaship_profile_updated", { detail: updated })
        );
      }
    } catch (err) {
      console.warn("[ProfileContext] localStorage kayıt hatası:", err);
    }

    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("vorego_auth_token") : null);
    if (activeToken) {
      try {
        const payload: Record<string, any> = {};
        if (updates.full_name !== undefined) payload.full_name = updates.full_name;
        if (updates.username !== undefined) payload.username = updates.username;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;

        await fetch(`${API_BASE}/api/v1/auth/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn("[ProfileContext] Backend profil güncelleme uyarısı:", err);
      }
    }
  };

  // 5. Yalnızca Username Güncelleme
  const updateUsername = async (newUsername: string) => {
    const clean = newUsername.trim().replace(/^@+/, "");
    if (!clean) return;
    await updateProfile({ username: clean });
  };

  // 6. Yalnızca Avatar Güncelleme
  const updateAvatar = async (newAvatarUrl: string) => {
    const clean = newAvatarUrl.trim();
    if (!clean) return;
    await updateProfile({ avatar_url: clean });
  };

  return (
    <ProfileContext.Provider
      value={{
        userProfile,
        updateUsername,
        updateAvatar,
        updateProfile,
        refreshProfile,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        settingsInitialTab,
        setSettingsInitialTab,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

