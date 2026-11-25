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
import { sanitizeUsername } from "../utils/avatarHelper";

export interface UserProfile {
  id?: string;
  user_id?: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url: string;
  is_pro: boolean;
  plan_tier?: "free" | "pro";
  planTier?: "free" | "pro";
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  trial_days_left?: number | null;
  study_level?: string;
  target_level?: string;
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

function getUserProfileStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
}

function getAuthUserIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const rawUser = localStorage.getItem("vorego_auth_user");
    if (!rawUser) return null;
    const parsed = JSON.parse(rawUser);
    return parsed?.id ? String(parsed.id) : null;
  } catch {
    return null;
  }
}

const DEFAULT_PROFILE: UserProfile = {
  full_name: "",
  username: "",
  email: "",
  avatar_url: "",
  is_pro: false,
  plan_tier: "free",
  planTier: "free",
  study_level: "B1",
  target_level: "B1",
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

  // 1. Sayfa yüklendiğinde yalnızca gerçek oturum varsa localStorage'dan profili geri yükle
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        localStorage.removeItem("vocaship_equipped_title");
        const hasAuthSession = Boolean(
          localStorage.getItem("vorego_auth_token") &&
            localStorage.getItem("vorego_auth_user")
        );
        if (!hasAuthSession) {
          localStorage.removeItem(STORAGE_KEY);
          setUserProfile(DEFAULT_PROFILE);
          return;
        }

        const authUserId = getAuthUserIdFromStorage();
        const scopedKey = getUserProfileStorageKey(authUserId);
        const stored = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEY);
        const legacyCustomAvatar = localStorage.getItem("vocaship_custom_avatar") || "";
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            const { equipped_title: _removed, ...cleanProfile } = parsed;
            if (
              String(cleanProfile.username || "").toLowerCase() === "ogrenci" &&
              String(cleanProfile.email || "").toLowerCase() === "ogrenci@vocaship.com"
            ) {
              localStorage.removeItem(STORAGE_KEY);
              if (authUserId) localStorage.removeItem(scopedKey);
              setUserProfile(DEFAULT_PROFILE);
              return;
            }
            if (!cleanProfile.avatar_url && legacyCustomAvatar) {
              cleanProfile.avatar_url = legacyCustomAvatar;
            }
            if (_removed !== undefined) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanProfile));
              if (authUserId) localStorage.setItem(scopedKey, JSON.stringify(cleanProfile));
            }
            setUserProfile((prev) => ({
              ...prev,
              ...cleanProfile,
            }));
          }
        } else if (legacyCustomAvatar) {
          setUserProfile((prev) => ({
            ...prev,
            avatar_url: legacyCustomAvatar,
          }));
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
    window.addEventListener("vocaship-profile-updated", handleProfileCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener("vocaship_logged_out", handleLoggedOut);
    return () => {
      window.removeEventListener("vocaship_profile_updated", handleProfileCustomEvent);
      window.removeEventListener("vocaship-profile-updated", handleProfileCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("vocaship_logged_out", handleLoggedOut);
    };
  }, []);

  // 2. AuthContext'teki kullanıcı değiştiğinde profili güncelle; oturum yoksa sıfırla
  useEffect(() => {
    if (!user) {
      setUserProfile(DEFAULT_PROFILE);
      return;
    }

    const tier: "free" | "pro" = user.isPro || user.planTier === "pro" ? "pro" : "free";
    let storedForUser: Partial<UserProfile> = {};
    try {
      const rawScoped = localStorage.getItem(getUserProfileStorageKey(user.id)) || localStorage.getItem(STORAGE_KEY);
      if (rawScoped) storedForUser = JSON.parse(rawScoped) || {};
    } catch {}
    const legacyAvatar = typeof window !== "undefined" ? (localStorage.getItem("vocaship_custom_avatar") || "") : "";

    setUserProfile((prev) => {
      const updated: UserProfile = {
        ...prev,
        ...storedForUser,
        id: user.id || prev.id,
        user_id: user.id || prev.user_id,
        full_name: storedForUser.full_name || user.fullName || prev.full_name,
        username: storedForUser.username || user.username || prev.username,
        email: storedForUser.email || user.email || prev.email,
        avatar_url: storedForUser.avatar_url || prev.avatar_url || legacyAvatar || "",
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
        if (user.id) {
          localStorage.setItem(getUserProfileStorageKey(user.id), JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
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
          const tier: "free" | "pro" =
            data.is_pro || String(data.plan_tier || "").toLowerCase() === "pro"
              ? "pro"
              : "free";
          let localStored: Partial<UserProfile> = {};
          try {
            const scopedKey = getUserProfileStorageKey(data.id || user?.id);
            const rawLocal = localStorage.getItem(scopedKey) || localStorage.getItem(STORAGE_KEY);
            if (rawLocal) localStored = JSON.parse(rawLocal) || {};
          } catch {}
          const legacyAvatar = typeof window !== "undefined" ? (localStorage.getItem("vocaship_custom_avatar") || "") : "";

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
              full_name: localStored.full_name || data.full_name || prev.full_name || "",
              username: sanitizeUsername(
                localStored.username || data.username || prev.username,
                preservedEmail
              ),
              email: preservedEmail,
              avatar_url: localStored.avatar_url || data.avatar_url || prev.avatar_url || legacyAvatar || "",
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
              if (synced.id) {
                localStorage.setItem(getUserProfileStorageKey(synced.id), JSON.stringify(synced));
              }
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
      const activeUserId = updated.id || user?.id || getAuthUserIdFromStorage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (activeUserId) {
        localStorage.setItem(getUserProfileStorageKey(activeUserId), JSON.stringify(updated));
      }
      if (updates.avatar_url !== undefined) {
        if (updates.avatar_url) {
          localStorage.setItem("vocaship_custom_avatar", updates.avatar_url);
        } else {
          localStorage.removeItem("vocaship_custom_avatar");
        }
      }
      if (updates.study_level !== undefined || updates.target_level !== undefined) {
        const nextLvl = updates.target_level || updates.study_level || "B1";
        localStorage.setItem("vocaship_target_level", nextLvl);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("vocaship_profile_updated", { detail: updated })
        );
        window.dispatchEvent(new Event("vocaship-profile-updated"));
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

