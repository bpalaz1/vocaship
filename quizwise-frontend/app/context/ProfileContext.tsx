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
  settingsInitialTab?: "profile" | "learning" | "audio_theme" | "payout";
  setSettingsInitialTab: (tab: "profile" | "learning" | "audio_theme" | "payout") => void;
}

const STORAGE_KEY = "vocaship_profile";

const DEFAULT_PROFILE: UserProfile = {
  full_name: "Öğrenci",
  username: "ogrenci",
  email: "ogrenci@vocaship.com",
  avatar_url: "🦊",
  is_pro: true,
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
    "profile" | "learning" | "audio_theme" | "payout"
  >("profile");

  // 1. Sayfa yüklendiğinde localStorage'dan profili geri yükle
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setUserProfile((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      }
    } catch (err) {
      console.warn("[ProfileContext] localStorage profil okuma hatası:", err);
    }
  }, []);

  // 2. AuthContext'teki kullanıcı değiştiğinde profili güncelle
  useEffect(() => {
    if (user) {
      const tier = user.planTier || (user.isPro ? "pro" : "basic");
      setUserProfile((prev) => {
        const updated: UserProfile = {
          ...prev,
          full_name: user.fullName || prev.full_name,
          username: user.username || prev.username,
          is_pro: user.isPro ?? prev.is_pro,
          plan_tier: tier,
          planTier: tier,
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
          const synced: UserProfile = {
            full_name: data.full_name || "Öğrenci",
            username: data.username,
            email: data.email || "",
            avatar_url: data.avatar_url || "🦊",
            is_pro: Boolean(data.is_pro),
            plan_tier: tier,
            planTier: tier,
          };
          setUserProfile(synced);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
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

  // 4. Genel Profil Güncelleme (Local + Backend sync)
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...userProfile,
      ...updates,
    };
    setUserProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("[ProfileContext] localStorage kayıt hatası:", err);
    }

    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("vorego_auth_token") : null);
    if (activeToken) {
      try {
        const payload: Record<string, any> = {};
        if (updates.full_name !== undefined) payload.full_name = updates.full_name;
        if (updates.username !== undefined) payload.username = updates.username;
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

