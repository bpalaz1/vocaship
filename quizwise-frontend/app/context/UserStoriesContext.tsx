"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { autoAssignCover, autoAssignCategoryLabel } from "../utils/autoCover";

export const USER_STORIES_STORAGE_KEY = "vocaship_user_stories";

export interface CustomStoryVocabularyItem {
  word: string;
  phonetic?: string;
  turkish_meaning: string;
  context_sentence?: string;
}

export interface CustomStoryQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  correct_index?: number;
}

export interface CustomStory {
  id: string;
  title: string;
  topic: string;
  level: string;
  cefr?: string;
  coverImage: string;
  content: string;
  target_words?: string[];
  target_vocabulary?: CustomStoryVocabularyItem[];
  comprehension_questions?: CustomStoryQuestion[];
  createdAt: number;
  wordCount?: number | string;
  readTime?: string;
  desc?: string;
  category?: string;
  categoryName?: string;
  isUserStory?: boolean;
}

interface UserStoriesContextType {
  userStories: CustomStory[];
  saveUserStory: (story: Partial<CustomStory> & { title: string; content: string }) => CustomStory;
  deleteUserStory: (id: string) => void;
  getUserStories: () => CustomStory[];
  isStorySaved: (idOrTitle: string) => boolean;
  clearAllUserStories: () => void;
}

const UserStoriesContext = createContext<UserStoriesContextType | undefined>(undefined);

/**
 * LocalStorage'dan kullanıcı hikayelerini güvenli okuma
 */
export function getSavedUserStories(): CustomStory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_STORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[UserStories] LocalStorage okuma hatası:", e);
    return [];
  }
}

/**
 * LocalStorage'a kaydetme ve event tetikleme
 */
export function persistUserStories(stories: CustomStory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_STORIES_STORAGE_KEY, JSON.stringify(stories));
    window.dispatchEvent(new Event("vocaship_user_stories_updated"));
  } catch (e) {
    console.error("[UserStories] LocalStorage yazma hatası:", e);
  }
}

export function UserStoriesProvider({ children }: { children: ReactNode }) {
  const [userStories, setUserStories] = useState<CustomStory[]>([]);

  // Sayfa yüklendiğinde ve storage eventlerinde senkronizasyon
  const syncStories = useCallback(() => {
    setUserStories(getSavedUserStories());
  }, []);

  useEffect(() => {
    syncStories();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_STORIES_STORAGE_KEY) {
        syncStories();
      }
    };

    const handleCustomEvent = () => {
      syncStories();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vocaship_user_stories_updated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vocaship_user_stories_updated", handleCustomEvent);
    };
  }, [syncStories]);

  /**
   * Yeni hikaye ekler veya mevcut olanı günceller.
   */
  const saveUserStory = useCallback(
    (storyData: Partial<CustomStory> & { title: string; content: string }): CustomStory => {
      const words = storyData.content.trim().split(/\s+/).filter(Boolean);
      const wordCountNum = words.length;
      const readMinutes = Math.max(1, Math.ceil(wordCountNum / 100));

      // Otomatik kapak görseli atama (eğer atanmamışsa)
      const coverImage =
        storyData.coverImage && storyData.coverImage.trim() !== ""
          ? storyData.coverImage
          : autoAssignCover({
              title: storyData.title,
              topic: storyData.topic,
              category: storyData.category,
              content: storyData.content,
            });

      const topic =
        storyData.topic && storyData.topic.trim() !== ""
          ? storyData.topic
          : autoAssignCategoryLabel({
              title: storyData.title,
              content: storyData.content,
            });

      const id = storyData.id || `user_story_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const newStory: CustomStory = {
        ...storyData,
        id,
        title: storyData.title.trim(),
        content: storyData.content.trim(),
        topic,
        level: storyData.level || "Intermediate",
        cefr: storyData.cefr || storyData.level || "B1",
        coverImage,
        desc: storyData.desc || (storyData.content.slice(0, 140) + "..."),
        wordCount: typeof storyData.wordCount === "number" ? storyData.wordCount : wordCountNum,
        readTime: storyData.readTime || `${readMinutes} dk`,
        target_words:
          storyData.target_words ||
          (storyData.target_vocabulary ? storyData.target_vocabulary.map((v) => v.word) : []),
        target_vocabulary: storyData.target_vocabulary || [],
        comprehension_questions: storyData.comprehension_questions || [],
        createdAt: storyData.createdAt || Date.now(),
        isUserStory: true,
        category: "user_custom",
        categoryName: "Benim Hikayelerim",
      };

      setUserStories((prev) => {
        const existingIdx = prev.findIndex(
          (s) => s.id === newStory.id || (s.title.toLowerCase() === newStory.title.toLowerCase() && s.content === newStory.content)
        );
        let updated: CustomStory[];
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...newStory };
        } else {
          updated = [newStory, ...prev];
        }
        persistUserStories(updated);
        return updated;
      });

      return newStory;
    },
    []
  );

  /**
   * Hikayeyi siler.
   */
  const deleteUserStory = useCallback((id: string) => {
    setUserStories((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persistUserStories(updated);
      return updated;
    });
  }, []);

  /**
   * Tüm hikayeleri getirir.
   */
  const getUserStories = useCallback((): CustomStory[] => {
    return getSavedUserStories();
  }, []);

  /**
   * Hikayenin kütüphanede kayıtlı olup olmadığını kontrol eder.
   */
  const isStorySaved = useCallback(
    (idOrTitle: string): boolean => {
      if (!idOrTitle) return false;
      const target = idOrTitle.trim().toLowerCase();
      return userStories.some(
        (s) => s.id.toLowerCase() === target || s.title.toLowerCase() === target
      );
    },
    [userStories]
  );

  const clearAllUserStories = useCallback(() => {
    setUserStories([]);
    persistUserStories([]);
  }, []);

  return (
    <UserStoriesContext.Provider
      value={{
        userStories,
        saveUserStory,
        deleteUserStory,
        getUserStories,
        isStorySaved,
        clearAllUserStories,
      }}
    >
      {children}
    </UserStoriesContext.Provider>
  );
}

export function useUserStories() {
  const context = useContext(UserStoriesContext);
  if (!context) {
    // Fallback: Provider dışında çağrılsa bile LocalStorage üzerinden çalışır
    return {
      userStories: getSavedUserStories(),
      saveUserStory: (storyData: any) => {
        const stories = getSavedUserStories();
        const id = storyData.id || `user_story_${Date.now()}`;
        const coverImage = storyData.coverImage || autoAssignCover(storyData);
        const item: CustomStory = {
          ...storyData,
          id,
          coverImage,
          createdAt: Date.now(),
          isUserStory: true,
        };
        const updated = [item, ...stories.filter((s) => s.id !== id)];
        persistUserStories(updated);
        return item;
      },
      deleteUserStory: (id: string) => {
        const stories = getSavedUserStories();
        persistUserStories(stories.filter((s) => s.id !== id));
      },
      getUserStories: getSavedUserStories,
      isStorySaved: (idOrTitle: string) => {
        const stories = getSavedUserStories();
        const t = (idOrTitle || "").toLowerCase();
        return stories.some((s) => s.id.toLowerCase() === t || s.title.toLowerCase() === t);
      },
      clearAllUserStories: () => persistUserStories([]),
    };
  }
  return context;
}
