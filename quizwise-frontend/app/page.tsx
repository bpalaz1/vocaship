"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Folder,
  FolderPlus,
  Trash2,
  X,
  Target,
  FolderTree,
  LayoutGrid,
  List as ListIcon,
  GripVertical,
  ArrowLeft,
  Edit3,
  Check,
  ChevronRight,
  ChevronDown,
  Copy,
  CornerDownRight,
  Share2,
  KeyRound,
} from "lucide-react";
import { API_BASE } from "./config";
import { useAuth, getAuthToken } from "./context/AuthContext";
import { useProfile } from "./context/ProfileContext";
// guestShowcase seed removed; empty library zero-state is enforced
import { useAppTheme } from "./context/ThemeContext";
import { useLanguage } from "./context/LanguageContext";
import {
  DeckItem,
  FolderItem,
  GameWordPair,
  DECKS_CACHE_STORAGE_KEY,
  FOLDERS_CACHE_STORAGE_KEY,
  FOLDER_ORDER_STORAGE_KEY,
  LIBRARY_VIEW_STORAGE_KEY,
  fetchDecksList,
  fetchFoldersList,
  getActiveDeckCards,
  normalizeFolderId,
  setActiveDeckId,
  setFolderParentInHierarchy,
  removeFolderFromHierarchy,
  wouldCreateFolderCycle,
} from "./utils/activeDeckStore";
import {
  getArenaMistakes,
  syncUnifiedWeakSpots,
  ARENA_MISTAKES_EVENT,
} from "./utils/arenaMistakes";
import CreateDeckModal from "./components/CreateDeckModal";
import AddWordModal, {
  SupportedLanguageItem,
  useAddWordController,
} from "./components/AddWordModal";
import WeakSpotRecoveryModal from "./components/WeakSpotRecoveryModal";
import SettingsModal from "./components/settings/SettingsModal";
import MobileBottomTabbar from "./components/layout/MobileBottomTabbar";
import DeckShareModal from "./components/DeckShareModal";
import ImportDeckModal, {
  PENDING_IMPORT_DECK_KEY,
} from "./components/ImportDeckModal";

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface DueCardItem {
  id: string;
  deck_id?: string;
  word?: string;
}

type FolderFilterType = "all" | string;
type LibraryViewMode = "folder" | "grid" | "list";

const FOLDER_PALETTE = [
  { hex: "#f59e0b", label: "Kehribar", darkTint: "bg-amber-500/15", lightTint: "bg-amber-50/90", borderLeft: "border-l-amber-500", darkBorderAll: "border-amber-500/30 hover:border-amber-400", lightBorderAll: "border-amber-300 hover:border-amber-400", darkIconBg: "bg-amber-500/20 text-amber-300 border-amber-500/30", lightIconBg: "bg-amber-100 text-amber-700 border-amber-200" },
  { hex: "#6366f1", label: "İndigo", darkTint: "bg-indigo-500/15", lightTint: "bg-indigo-50/90", borderLeft: "border-l-indigo-500", darkBorderAll: "border-indigo-500/30 hover:border-indigo-400", lightBorderAll: "border-indigo-300 hover:border-indigo-400", darkIconBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", lightIconBg: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { hex: "#10b981", label: "Zümrüt", darkTint: "bg-emerald-500/15", lightTint: "bg-emerald-50/90", borderLeft: "border-l-emerald-500", darkBorderAll: "border-emerald-500/30 hover:border-emerald-400", lightBorderAll: "border-emerald-300 hover:border-emerald-400", darkIconBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", lightIconBg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { hex: "#f43f5e", label: "Gül", darkTint: "bg-rose-500/15", lightTint: "bg-rose-50/90", borderLeft: "border-l-rose-500", darkBorderAll: "border-rose-500/30 hover:border-rose-400", lightBorderAll: "border-rose-300 hover:border-rose-400", darkIconBg: "bg-rose-500/20 text-rose-300 border-rose-500/30", lightIconBg: "bg-rose-100 text-rose-700 border-rose-200" },
  { hex: "#8b5cf6", label: "Menekşe", darkTint: "bg-violet-500/15", lightTint: "bg-violet-50/90", borderLeft: "border-l-violet-500", darkBorderAll: "border-violet-500/30 hover:border-violet-400", lightBorderAll: "border-violet-300 hover:border-violet-400", darkIconBg: "bg-violet-500/20 text-violet-300 border-violet-500/30", lightIconBg: "bg-violet-100 text-violet-700 border-violet-200" },
  { hex: "#06b6d4", label: "Turkuaz", darkTint: "bg-cyan-500/15", lightTint: "bg-cyan-50/90", borderLeft: "border-l-cyan-500", darkBorderAll: "border-cyan-500/30 hover:border-cyan-400", lightBorderAll: "border-cyan-300 hover:border-cyan-400", darkIconBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", lightIconBg: "bg-cyan-100 text-cyan-700 border-cyan-200" },
];

function getFolderAccentTheme(colorHex?: string) {
  return (
    FOLDER_PALETTE.find(
      (c) => c.hex.toLowerCase() === (colorHex || "").toLowerCase()
    ) || FOLDER_PALETTE[0]
  );
}

const SUPPORTED_LANGUAGES: (SupportedLanguageItem & { ttsLocale: string })[] = [
  { code: "en", label: "İNGİLİZCE", flag: "🇬🇧", ttsLocale: "en-US" },
  { code: "tr", label: "TÜRKÇE", flag: "🇹🇷", ttsLocale: "tr-TR" },
  { code: "de", label: "ALMANCA", flag: "🇩🇪", ttsLocale: "de-DE" },
  { code: "es", label: "İSPANYOLCA", flag: "🇪🇸", ttsLocale: "es-ES" },
  { code: "fr", label: "FRANSIZCA", flag: "🇫🇷", ttsLocale: "fr-FR" },
  { code: "it", label: "İTALYANCA", flag: "🇮🇹", ttsLocale: "it-IT" },
  { code: "ru", label: "RUSÇA", flag: "🇷🇺", ttsLocale: "ru-RU" },
];

export default function Home() {
  const router = useRouter();
  const { user, isGuest, openRegistrationGate } = useAuth();
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useProfile();
  const { isDark } = useAppTheme();
  const { t } = useLanguage();

  // Oyun Arenası ile Ortak Deste, Klasör ve Kelime Verileri
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [deckCardsMap, setDeckCardsMap] = useState<
    Record<string, GameWordPair[]>
  >({});
  const [loadingDecks, setLoadingDecks] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFolderFilter, setSelectedFolderFilter] =
    useState<FolderFilterType>("all");

  // SM-2 & Zayıf Nokta Sayacı
  const [dueCount, setDueCount] = useState<number>(0);
  const [primaryDueDeckId, setPrimaryDueDeckId] = useState<string | null>(null);
  const [weakSpotCount, setWeakSpotCount] = useState<number>(0);

  // Klasör & Deste Modalları
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#f59e0b");
  const [newFolderParentId, setNewFolderParentId] = useState<string>("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);
  const [isCopyingFolder, setIsCopyingFolder] = useState(false);
  const [contextMoveOpen, setContextMoveOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDeckFolderId, setNewDeckFolderId] = useState("");
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  // Kalıcı Deste Paylaşma & Kodla Deste Kopyalama Modalları
  const [sharingDeck, setSharingDeck] = useState<{
    id: string;
    title: string;
    card_count?: number;
  } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [initialImportCode, setInitialImportCode] = useState("");

  // Kalıcı Görünüm Seçici (Klasör / Kart / Liste) & Sürükle-Bırak State + Ref
  const [viewMode, setViewModeState] = useState<LibraryViewMode>("grid");
  const [draggedDeckId, setDraggedDeckId] = useState<string | null>(null);
  const [dragOverFolderTarget, setDragOverFolderTarget] = useState<
    string | null
  >(null);
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [dragOverFolderReorderId, setDragOverFolderReorderId] = useState<
    string | null
  >(null);
  const draggedDeckIdRef = useRef<string | null>(null);
  const draggedFolderIdRef = useRef<string | null>(null);

  // Özel Sağ Tık (Context Menu) & Klasör Adı Düzenleme
  const [contextMenu, setContextMenu] = useState<{
    type: "deck" | "folder";
    x: number;
    y: number;
    deck?: DeckItem;
    folder?: FolderItem;
  } | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);

  const setViewMode = useCallback((mode: LibraryViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LIBRARY_VIEW_STORAGE_KEY, mode);
      } catch {}
    }
  }, []);

  // Zayıf Nokta & Hızlı Çalışma Seçici Modalları
  const [isWeakSpotModalOpen, setIsWeakSpotModalOpen] = useState(false);
  const [isQuickStudyModalOpen, setIsQuickStudyModalOpen] = useState(false);
  const [selectedQuickFolderIds, setSelectedQuickFolderIds] = useState<
    string[]
  >([]);
  const [selectedQuickSubfolderIds, setSelectedQuickSubfolderIds] = useState<
    string[]
  >([]);
  const [selectedQuickDeckIds, setSelectedQuickDeckIds] = useState<string[]>(
    []
  );

  // Desteler için gerçek kart önbelleği + API yükleyicisi (kelime araması + birebir kart sayısı için)
  const hydrateDeckCards = useCallback(async (deckList: DeckItem[]) => {
    if (deckList.length === 0) return;

    // 1. Önce varsa yerel önbellekten anında yükle
    if (typeof window !== "undefined") {
      const immediateMap: Record<string, GameWordPair[]> = {};
      for (const d of deckList) {
        try {
          const cached = localStorage.getItem(`vocaship_deck_cards_${d.id}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) immediateMap[d.id] = parsed;
          }
        } catch {}
      }
      if (Object.keys(immediateMap).length > 0) {
        setDeckCardsMap((prev) => ({ ...immediateMap, ...prev }));
      }
    }

    // 2. Oyun Arenası ile aynı getActiveDeckCards yardımcısıyla güncel kartları çek
    const entries = await Promise.allSettled(
      deckList.map(async (d) => {
        const cards = await getActiveDeckCards(d.id, false);
        return [d.id, cards] as const;
      })
    );

    const nextMap: Record<string, GameWordPair[]> = {};
    for (const res of entries) {
      if (res.status === "fulfilled") {
        const [deckId, cards] = res.value;
        nextMap[deckId] = cards;
      }
    }
    if (Object.keys(nextMap).length > 0) {
      setDeckCardsMap((prev) => ({ ...prev, ...nextMap }));
    }
  }, []);

  const refreshLibraryData = useCallback(async () => {
    try {
      const [fetchedFolders, fetchedDecks] = await Promise.all([
        fetchFoldersList(),
        fetchDecksList(),
      ]);

      // Eski preset/guest kayıtlarını filtrele; klasörsüz (folder_id === null) paylaşılan/kopyalanan desteleri KORU
      const cleanDecks = fetchedDecks.filter(
        (d) => !d.id.startsWith("preset_") && !d.id.startsWith("guest_")
      );
      const finalFolders = fetchedFolders.filter(
        (f) => !String(f.id || "").startsWith("guest_")
      );

      setFolders(finalFolders);
      setDecks(cleanDecks);

      hydrateDeckCards(cleanDecks);
    } finally {
      setLoadingDecks(false);
    }
  }, [hydrateDeckCards, user, isGuest]);

  const fetchStudyMetrics = useCallback(async () => {
    // Önce yerel ortak önbelleği hemen yansıt (anlık sayı tutarlılığı için)
    const immediateLocal = getArenaMistakes();
    setWeakSpotCount(immediateLocal.length);

    try {
      const [dueRes, unifiedMistakes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/v1/study/due-cards?limit=50`),
        syncUnifiedWeakSpots(),
      ]);

      if (dueRes.status === "fulfilled" && dueRes.value.ok) {
        const dueData: DueCardItem[] = await dueRes.value.json();
        if (Array.isArray(dueData)) {
          setDueCount(dueData.length);
          const firstWithDeck = dueData.find((c) => c.deck_id);
          setPrimaryDueDeckId(firstWithDeck?.deck_id || null);
        }
      }

      if (unifiedMistakes.status === "fulfilled") {
        setWeakSpotCount(unifiedMistakes.value.length);
      }
    } catch (err) {
      console.warn("SM-2 tekrar verileri alınamadı:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedView = localStorage.getItem(LIBRARY_VIEW_STORAGE_KEY);
        if (
          savedView === "folder" ||
          savedView === "grid" ||
          savedView === "list"
        ) {
          setViewModeState(savedView);
        }
      } catch {}
    }

    refreshLibraryData();
    fetchStudyMetrics();

    const handleMistakesSync = (e: Event) => {
      const detail = (e as CustomEvent<{ count?: number }>).detail;
      const count =
        typeof detail?.count === "number"
          ? detail.count
          : getArenaMistakes().length;
      setWeakSpotCount(count);
    };

    const handleFocusRefresh = () => {
      fetchStudyMetrics();
    };

    window.addEventListener(ARENA_MISTAKES_EVENT, handleMistakesSync);
    window.addEventListener("focus", handleFocusRefresh);

    return () => {
      window.removeEventListener(ARENA_MISTAKES_EVENT, handleMistakesSync);
      window.removeEventListener("focus", handleFocusRefresh);
    };
  }, [refreshLibraryData, fetchStudyMetrics]);

  // URL'de ?importDeck=... varsa veya giriş sonrası bekleyen bir paylaşım kodu varsa ImportDeckModal'ı otomatik aç
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = (params.get("importDeck") || "").trim();
      const pendingCode = (sessionStorage.getItem(PENDING_IMPORT_DECK_KEY) || "").trim();
      const targetCode = urlCode || (user ? pendingCode : "");
      if (targetCode) {
        setInitialImportCode(targetCode);
        setIsImportModalOpen(true);
      }
    } catch {}
  }, [user]);

  const clearImportDeckParam = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("importDeck")) {
        url.searchParams.delete("importDeck");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
      }
    } catch {}
  }, []);

  // Merkezi Hafıza Öncelikli Kelime Ekleme Kontrolcüsü (300ms debounce + anında dil değiştirme)
  const addWordModalDecks = useMemo(
    () =>
      decks.map((d) => ({
        id: d.id,
        title: d.title,
        card_count: deckCardsMap[d.id]?.length ?? d.card_count ?? 0,
      })),
    [decks, deckCardsMap]
  );

  const handleWordCardSaved = useCallback(async () => {
    await Promise.all([refreshLibraryData(), fetchStudyMetrics()]);
  }, [refreshLibraryData, fetchStudyMetrics]);

  const addWordCtrl = useAddWordController({
    decks: addWordModalDecks,
    onSaved: handleWordCardSaved,
  });

  useEffect(() => {
    if (decks.length > 0) {
      if (
        !addWordCtrl.selectedDeckForWord ||
        !decks.some((d) => d.id === addWordCtrl.selectedDeckForWord)
      ) {
        addWordCtrl.setSelectedDeckForWord(decks[0].id);
      }
    } else if (addWordCtrl.selectedDeckForWord) {
      addWordCtrl.setSelectedDeckForWord("");
    }
  }, [decks, addWordCtrl.selectedDeckForWord, addWordCtrl.setSelectedDeckForWord]);

  // Hızlı Çalışma Modalı her açıldığında en güncel klasör ve desteleri yenile
  useEffect(() => {
    if (isQuickStudyModalOpen) {
      refreshLibraryData();
    }
  }, [isQuickStudyModalOpen, refreshLibraryData]);

  // Silinen klasör veya desteler Quick Study seçim listesinde asla kalmasın
  useEffect(() => {
    const activeFolderIdSet = new Set(
      folders.map((f) => String(f.id || "").trim()).filter(Boolean)
    );
    const activeDeckIdSet = new Set(decks.map((d) => d.id));

    setSelectedQuickFolderIds((prev) =>
      prev.filter((id) => activeFolderIdSet.has(id))
    );
    setSelectedQuickSubfolderIds((prev) =>
      prev.filter((id) => activeFolderIdSet.has(id))
    );
    setSelectedQuickDeckIds((prev) =>
      prev.filter((id) => activeDeckIdSet.has(id))
    );
  }, [folders, decks]);

  // Sağ tık menüsünü dışarı tıklandığında veya ESC tuşuyla kapat
  useEffect(() => {
    if (!contextMenu) return;
    const closeMenu = () => setContextMenu(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("mousedown", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu]);

  // Klasör ID seti
  const validFolderIds = useMemo(
    () => new Set(folders.map((f) => String(f.id || "").trim()).filter(Boolean)),
    [folders]
  );

  const folderNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of folders) {
      const id = String(f.id || "").trim();
      if (id) m.set(id, f.name);
    }
    return m;
  }, [folders]);

  const folderObjMap = useMemo(() => {
    const m = new Map<string, FolderItem>();
    for (const f of folders) {
      const id = String(f.id || "").trim();
      if (id) m.set(id, f);
    }
    return m;
  }, [folders]);

  const getSubfolders = useCallback(
    (parentId: string | null): FolderItem[] => {
      const cleanParent = normalizeFolderId(parentId);
      return folders.filter((f) => {
        const fid = String(f.id || "").trim();
        const pid = normalizeFolderId(f.parent_id);
        if (!cleanParent) {
          return !pid || pid === fid || !validFolderIds.has(pid);
        }
        return pid === cleanParent && fid !== cleanParent;
      });
    },
    [folders, validFolderIds]
  );

  const getDescendantFolderIds = useCallback(
    (rootFolderId: string): string[] => {
      const result: string[] = [rootFolderId];
      const queue: string[] = [rootFolderId];
      const visited = new Set<string>([rootFolderId]);
      while (queue.length > 0) {
        const cur = queue.shift()!;
        const children = getSubfolders(cur);
        for (const ch of children) {
          const cid = String(ch.id || "").trim();
          if (cid && !visited.has(cid)) {
            visited.add(cid);
            result.push(cid);
            queue.push(cid);
          }
        }
      }
      return result;
    },
    [getSubfolders]
  );

  const countDecksRecursive = useCallback(
    (folderId: string): number => {
      const idSet = new Set(getDescendantFolderIds(folderId));
      return decks.filter((d) => {
        const fid = normalizeFolderId(d.folder_id);
        return fid ? idSet.has(fid) : false;
      }).length;
    },
    [decks, getDescendantFolderIds]
  );

  const getBreadcrumbTrail = useCallback(
    (folderId: string): FolderItem[] => {
      const trail: FolderItem[] = [];
      const visited = new Set<string>();
      let cur: string | null = String(folderId || "").trim();
      while (cur && !visited.has(cur)) {
        visited.add(cur);
        const item = folderObjMap.get(cur);
        if (!item) break;
        trail.unshift(item);
        const pid = normalizeFolderId(item.parent_id);
        cur = pid && validFolderIds.has(pid) ? pid : null;
      }
      return trail;
    },
    [folderObjMap, validFolderIds]
  );

  const toggleFolderExpand = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    setExpandedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  // Sesli Telaffuz (TTS)
  const speakText = (text: string, langCode: string = "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    utterance.lang = langObj ? langObj.ttsLocale : "en-US";
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  // Klasör Oluşturma & Silme
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || isCreatingFolder) return;
    setIsCreatingFolder(true);
    try {
      const targetParent = normalizeFolderId(newFolderParentId);
      const res = await fetch(`${API_BASE}/api/v1/folders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newFolderName.trim(),
          color: newFolderColor || "#f59e0b",
          parent_id: targetParent || null,
          ...(user?.id ? { user_id: user.id } : {}),
        }),
      });
      if (res.ok) {
        const created = await res.json().catch(() => null);
        if (created?.id && targetParent) {
          setFolderParentInHierarchy(String(created.id).trim(), targetParent);
          setExpandedFolderIds((prev) =>
            Array.from(new Set([...prev, targetParent]))
          );
        }
        setNewFolderName("");
        setNewFolderParentId("");
        setIsCreateFolderModalOpen(false);
        await refreshLibraryData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(
          `Klasör oluşturulamadı: ${err.detail || err.message || "Sunucu hatası"}`
        );
      }
    } catch {
      alert("Klasör oluşturulurken sunucuya ulaşılamadı.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (
    e: React.MouseEvent,
    folderId: string,
    folderName: string
  ) => {
    e.stopPropagation();
    if (
      !window.confirm(
        t("lib_confirm_del_folder", undefined, { name: folderName })
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/folders/${folderId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const cleanDeletedId = String(folderId || "").trim();
        const deletedDeckIds = new Set(
          decks
            .filter((d) => normalizeFolderId(d.folder_id) === cleanDeletedId)
            .map((d) => d.id)
        );
        removeFolderFromHierarchy(cleanDeletedId);
        if (selectedFolderFilter === cleanDeletedId) {
          setSelectedFolderFilter("all");
        }
        setSelectedQuickFolderIds((prev) =>
          prev.filter((id) => id !== cleanDeletedId)
        );
        setSelectedQuickSubfolderIds((prev) =>
          prev.filter((id) => id !== cleanDeletedId)
        );
        setSelectedQuickDeckIds((prev) =>
          prev.filter((id) => !deletedDeckIds.has(id))
        );
        setFolders((prev) => {
          const next = prev.filter(
            (f) => String(f.id || "").trim() !== cleanDeletedId
          );
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                FOLDERS_CACHE_STORAGE_KEY,
                JSON.stringify(next)
              );
              const nextOrder = next.map((f) => String(f.id || "").trim());
              localStorage.setItem(
                FOLDER_ORDER_STORAGE_KEY,
                JSON.stringify(nextOrder)
              );
            } catch {}
          }
          return next;
        });
        setDecks((prev) => {
          const next = prev.filter(
            (d) => normalizeFolderId(d.folder_id) !== cleanDeletedId
          );
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                DECKS_CACHE_STORAGE_KEY,
                JSON.stringify(next)
              );
              deletedDeckIds.forEach((did) => {
                localStorage.removeItem(`vocaship_deck_cards_${did}`);
              });
            } catch {}
          }
          return next;
        });
        await refreshLibraryData();
      }
    } catch (err) {
      console.error("Klasör silinemedi:", err);
    }
  };

  // Yeni Deste Oluşturma & Silme
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isCreatingDeck) return;
    const cleanFolderId =
      normalizeFolderId(newDeckFolderId) ||
      (folders.length > 0 ? String(folders[0].id || "").trim() : null);

    if (!cleanFolderId) {
      alert(t("lib_create_folder_first"));
      return;
    }

    setIsCreatingDeck(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/decks`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          folder_id: cleanFolderId,
          ...(user?.id ? { user_id: user.id } : {}),
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setNewDeckFolderId("");
        setIsCreateModalOpen(false);
        await refreshLibraryData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(
          `Deste oluşturulamadı: ${err.detail || err.message || "Sunucu hatası"}`
        );
      }
    } catch {
      alert("Deste oluşturulurken sunucuya ulaşılamadı.");
    } finally {
      setIsCreatingDeck(false);
    }
  };

  const handleDeleteDeck = async (
    e: React.MouseEvent,
    deckId: string,
    deckTitle: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        t("lib_confirm_del_deck", undefined, { name: deckTitle })
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/decks/${deckId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await Promise.all([refreshLibraryData(), fetchStudyMetrics()]);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Deste silinemedi: ${err.detail || err.message || "Sunucu hatası"}`);
      }
    } catch (err) {
      console.error("Deste silinemedi:", err);
      alert("Deste silinirken sunucuya ulaşılamadı.");
    }
  };

  // =========================================================================
  // SÜRÜKLE-BIRAK (MOVE) & SAĞ TIK KLASÖRE TAŞIMA İŞLEYİCİLERİ
  // =========================================================================
  const handleDeckDragStart = (e: React.DragEvent, deckId: string) => {
    const cleanId = String(deckId);
    draggedFolderIdRef.current = null;
    draggedDeckIdRef.current = cleanId;
    setDraggedFolderId(null);
    setDraggedDeckId(cleanId);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("application/x-deck-id", cleanId);
      e.dataTransfer.setData("text/plain", cleanId);
    } catch {}
  };

  const handleDeckDragEnd = () => {
    draggedDeckIdRef.current = null;
    setDraggedDeckId(null);
    setDragOverFolderTarget(null);
  };

  const handleMoveDeckToFolder = async (
    deckId: string,
    targetFolder: string | null
  ) => {
    const nextFolderId =
      !targetFolder || targetFolder === "all" || targetFolder === "__orphan__"
        ? null
        : String(targetFolder).trim();

    setDecks((prev) => {
      const next = prev.map((d) =>
        d.id === deckId ? { ...d, folder_id: nextFolderId } : d
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(DECKS_CACHE_STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    if (deckId.startsWith("preset_")) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/decks/${encodeURIComponent(deckId)}/folder`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ folder_id: nextFolderId }),
        }
      );
      if (res.ok) {
        await refreshLibraryData();
      }
    } catch (err) {
      console.error("Deste klasöre taşınamadı:", err);
    }
  };

  const handleMoveFolderDecks = async (
    sourceFolderId: string,
    targetFolderId: string | null
  ) => {
    const cleanSource = String(sourceFolderId).trim();
    const cleanTarget =
      !targetFolderId ||
      targetFolderId === "all" ||
      targetFolderId === "__orphan__"
        ? null
        : String(targetFolderId).trim();
    if (!cleanSource || cleanSource === cleanTarget) return;

    const movingDecks = decks.filter(
      (d) => normalizeFolderId(d.folder_id) === cleanSource
    );
    if (movingDecks.length === 0) return;

    setDecks((prev) => {
      const next = prev.map((d) =>
        normalizeFolderId(d.folder_id) === cleanSource
          ? { ...d, folder_id: cleanTarget }
          : d
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(DECKS_CACHE_STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    const backendMoving = movingDecks.filter((d) => !d.id.startsWith("preset_"));
    if (backendMoving.length > 0) {
      await Promise.allSettled(
        backendMoving.map((d) =>
          fetch(
            `${API_BASE}/api/v1/decks/${encodeURIComponent(d.id)}/folder`,
            {
              method: "PATCH",
              headers: getAuthHeaders(),
              body: JSON.stringify({ folder_id: cleanTarget }),
            }
          )
        )
      );
      await refreshLibraryData();
    }
  };

  const handleFolderDragStart = (e: React.DragEvent, folderId: string) => {
    e.stopPropagation();
    const cleanId = String(folderId).trim();
    draggedDeckIdRef.current = null;
    draggedFolderIdRef.current = cleanId;
    setDraggedDeckId(null);
    setDraggedFolderId(cleanId);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("application/x-folder-id", cleanId);
      e.dataTransfer.setData("text/plain", cleanId);
    } catch {}
  };

  const handleFolderDragEnd = () => {
    draggedFolderIdRef.current = null;
    setDraggedFolderId(null);
    setDragOverFolderReorderId(null);
    setDragOverFolderTarget(null);
  };

  const handleReorderFolders = (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setFolders((prev) => {
      const fromIdx = prev.findIndex(
        (f) => String(f.id || "").trim() === sourceId
      );
      const toIdx = prev.findIndex(
        (f) => String(f.id || "").trim() === targetId
      );
      if (fromIdx < 0 || toIdx < 0) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);

      if (typeof window !== "undefined") {
        try {
          const orderIds = updated.map((f) => String(f.id || "").trim());
          localStorage.setItem(
            FOLDER_ORDER_STORAGE_KEY,
            JSON.stringify(orderIds)
          );
          localStorage.setItem(
            FOLDERS_CACHE_STORAGE_KEY,
            JSON.stringify(updated)
          );
        } catch {}
      }
      return updated;
    });
  };

  const handleMoveFolderToParent = (
    sourceFolderId: string,
    targetParentId: string | null
  ) => {
    const cleanSource = String(sourceFolderId || "").trim();
    const cleanParent =
      !targetParentId ||
      targetParentId === "all" ||
      targetParentId === "__orphan__"
        ? null
        : String(targetParentId).trim();

    if (!cleanSource) return;
    if (wouldCreateFolderCycle(folders, cleanSource, cleanParent)) {
      alert(t("lib_folder_cycle_err"));
      return;
    }

    setFolderParentInHierarchy(cleanSource, cleanParent);
    setFolders((prev) => {
      const next = prev.map((f) =>
        String(f.id || "").trim() === cleanSource
          ? { ...f, parent_id: cleanParent }
          : f
      );
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(FOLDERS_CACHE_STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    if (cleanParent) {
      setExpandedFolderIds((prev) =>
        Array.from(new Set([...prev, cleanParent]))
      );
    }
  };

  const handleFolderDroppedOnTarget = async (
    sourceFolderId: string,
    targetFolderId: string | null
  ) => {
    const cleanSource = String(sourceFolderId).trim();
    const cleanTarget =
      !targetFolderId ||
      targetFolderId === "all" ||
      targetFolderId === "__orphan__"
        ? null
        : String(targetFolderId).trim();
    if (!cleanSource || cleanSource === cleanTarget) return;

    handleMoveFolderToParent(cleanSource, cleanTarget);
  };

  const handleCopyFolder = async (sourceFolder: FolderItem) => {
    if (isCopyingFolder) return;
    setIsCopyingFolder(true);
    const sourceId = String(sourceFolder.id || "").trim();
    const copyName = `${sourceFolder.name} (Kopya)`;
    const parentId = normalizeFolderId(sourceFolder.parent_id);

    try {
      const fRes = await fetch(`${API_BASE}/api/v1/folders`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: copyName,
          color: sourceFolder.color || "#f59e0b",
        }),
      });
      if (!fRes.ok) {
        alert("Klasör kopyalanamadı.");
        return;
      }
      const newFolder = await fRes.json();
      const newFolderId = String(newFolder.id || "").trim();
      if (parentId) {
        setFolderParentInHierarchy(newFolderId, parentId);
      }

      const decksToCopy = decks.filter(
        (d) =>
          normalizeFolderId(d.folder_id) === sourceId &&
          !d.id.startsWith("preset_")
      );

      for (const srcDeck of decksToCopy) {
        try {
          const dRes = await fetch(`${API_BASE}/api/v1/decks`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              title: srcDeck.title,
              description: srcDeck.description || "",
              folder_id: newFolderId,
            }),
          });
          if (!dRes.ok) continue;
          const createdDeck = await dRes.json();

          const cardsRes = await fetch(
            `${API_BASE}/api/v1/decks/${encodeURIComponent(srcDeck.id)}/cards`,
            { headers: getAuthHeaders() }
          );
          if (cardsRes.ok) {
            const rawCards = await cardsRes.json();
            if (Array.isArray(rawCards) && rawCards.length > 0) {
              await Promise.allSettled(
                rawCards.map((c: any) =>
                  fetch(`${API_BASE}/api/v1/decks/cards`, {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                      deck_id: createdDeck.id,
                      word: c.word,
                      phonetic: c.phonetic || null,
                      meanings: c.meanings || [],
                      example_sentences: c.example_sentences || [],
                      collocations: c.collocations || [],
                    }),
                  })
                )
              );
            }
          }
        } catch (err) {
          console.warn("Deste kopyalama hatası:", err);
        }
      }

      await refreshLibraryData();
    } catch (err) {
      console.error("Klasör kopyalanamadı:", err);
      alert("Klasör kopyalanırken bir hata oluştu.");
    } finally {
      setIsCopyingFolder(false);
    }
  };

  const handleRenameFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFolder || !renamingFolder.name.trim() || isRenamingFolder) {
      return;
    }
    setIsRenamingFolder(true);
    const trimmedName = renamingFolder.name.trim();
    const targetId = renamingFolder.id;

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/folders/${encodeURIComponent(targetId)}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ name: trimmedName }),
        }
      );
      if (res.ok) {
        setRenamingFolder(null);
        await refreshLibraryData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(
          `Klasör adı güncellenemedi: ${err.detail || err.message || "Sunucu hatası"}`
        );
      }
    } catch (err) {
      console.error("Klasör adı güncellenemedi:", err);
      alert("Klasör adı güncellenirken sunucuya ulaşılamadı.");
    } finally {
      setIsRenamingFolder(false);
    }
  };

  const openDeckContextMenu = (e: React.MouseEvent, deck: DeckItem) => {
    e.preventDefault();
    e.stopPropagation();
    const maxW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const maxH = typeof window !== "undefined" ? window.innerHeight : 800;
    setContextMenu({
      type: "deck",
      x: Math.min(e.clientX, maxW - 260),
      y: Math.min(e.clientY, maxH - 340),
      deck,
    });
  };

  const openFolderContextMenu = (e: React.MouseEvent, folder: FolderItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMoveOpen(false);
    const maxW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const maxH = typeof window !== "undefined" ? window.innerHeight : 800;
    setContextMenu({
      type: "folder",
      x: Math.min(e.clientX, maxW - 260),
      y: Math.min(e.clientY, maxH - 360),
      folder,
    });
  };

  // Sol Menü İçin İç İçe Açılır/Kapanır Klasör Ağacı
  const renderSidebarFolderNode = (
    folder: FolderItem,
    depth: number = 0
  ): React.ReactNode => {
    const normalizedFolderId = String(folder.id || "").trim();
    const subfolders = getSubfolders(normalizedFolderId);
    const hasSubfolders = subfolders.length > 0;
    const isExpanded = expandedFolderIds.includes(normalizedFolderId);
    const isSelected = selectedFolderFilter === normalizedFolderId;
    const isDeckTarget = dragOverFolderTarget === normalizedFolderId;
    const isReorderTarget = dragOverFolderReorderId === normalizedFolderId;
    const count = countDecksRecursive(normalizedFolderId);
    const theme = getFolderAccentTheme(folder.color);

    return (
      <div key={normalizedFolderId} className="space-y-1">
        <div
          draggable
          onDragStart={(e) => handleFolderDragStart(e, normalizedFolderId)}
          onDragEnd={handleFolderDragEnd}
          onContextMenu={(e) => openFolderContextMenu(e, folder)}
          onDragEnter={(e) => {
            const fId = draggedFolderIdRef.current || draggedFolderId;
            const dId = draggedDeckIdRef.current || draggedDeckId;
            if (
              fId &&
              fId !== normalizedFolderId &&
              !wouldCreateFolderCycle(folders, fId, normalizedFolderId)
            ) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              setDragOverFolderReorderId(normalizedFolderId);
            } else if (dId) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              setDragOverFolderTarget(normalizedFolderId);
            }
          }}
          onDragOver={(e) => {
            const fId = draggedFolderIdRef.current || draggedFolderId;
            const dId = draggedDeckIdRef.current || draggedDeckId;
            if (
              fId &&
              fId !== normalizedFolderId &&
              !wouldCreateFolderCycle(folders, fId, normalizedFolderId)
            ) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              setDragOverFolderReorderId(normalizedFolderId);
            } else if (dId) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              setDragOverFolderTarget(normalizedFolderId);
            }
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            if (dragOverFolderTarget === normalizedFolderId) {
              setDragOverFolderTarget(null);
            }
            if (dragOverFolderReorderId === normalizedFolderId) {
              setDragOverFolderReorderId(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const fId =
              draggedFolderIdRef.current ||
              draggedFolderId ||
              e.dataTransfer.getData("application/x-folder-id");
            const dId =
              draggedDeckIdRef.current ||
              draggedDeckId ||
              e.dataTransfer.getData("application/x-deck-id") ||
              (!fId ? e.dataTransfer.getData("text/plain") : "");

            setDragOverFolderTarget(null);
            setDragOverFolderReorderId(null);
            setDraggedFolderId(null);
            setDraggedDeckId(null);
            draggedFolderIdRef.current = null;
            draggedDeckIdRef.current = null;

            if (fId && fId !== normalizedFolderId) {
              handleFolderDroppedOnTarget(fId, normalizedFolderId);
            } else if (dId) {
              handleMoveDeckToFolder(dId, normalizedFolderId);
            }
          }}
          onClick={() => setSelectedFolderFilter(normalizedFolderId)}
          className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between gap-1 group cursor-pointer border border-l-4 ${
            isDeckTarget || isReorderTarget
              ? isDark
                ? "ring-2 ring-amber-400 bg-amber-500/20 border-dashed border-amber-400 border-l-amber-500 text-amber-200 scale-[1.02]"
                : "ring-2 ring-amber-400 bg-amber-50 border-dashed border-amber-400 border-l-amber-500 text-amber-900 scale-[1.02]"
              : isSelected
              ? isDark
                ? `${theme.darkTint} ${theme.darkBorderAll} ${theme.borderLeft} text-white font-bold shadow-xs`
                : `${theme.lightTint} ${theme.lightBorderAll} ${theme.borderLeft} text-slate-900 font-bold shadow-xs`
              : isDark
              ? `bg-slate-950/70 hover:bg-slate-800/80 text-slate-300 hover:text-white ${theme.darkBorderAll} ${theme.borderLeft}`
              : `bg-[#f8fafc] hover:bg-slate-100 text-slate-700 hover:text-slate-900 ${theme.lightBorderAll} ${theme.borderLeft}`
          } ${draggedFolderId === normalizedFolderId ? "opacity-50" : ""}`}
        >
          <span className="flex items-center gap-1.5 min-w-0">
            {hasSubfolders ? (
              <button
                type="button"
                onClick={(e) => toggleFolderExpand(e, normalizedFolderId)}
                aria-label={isExpanded ? "Alt klasörleri gizle" : "Alt klasörleri aç"}
                className={`p-0.5 rounded shrink-0 cursor-pointer ${isDark ? "hover:bg-slate-700/70 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <GripVertical className={`w-3 h-3 shrink-0 pointer-events-none ${isDark ? "text-slate-600 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-600"}`} />
            )}
            <span
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 pointer-events-none ${isDark ? theme.darkIconBg : theme.lightIconBg}`}
            >
              <Folder className="w-3 h-3" />
            </span>
            <span className="truncate pointer-events-none">{folder.name}</span>
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) =>
                handleDeleteFolder(e, normalizedFolderId, folder.name)
              }
              title={t("lib_delete_folder_title")}
              className={`opacity-0 group-hover:opacity-100 p-1 rounded transition cursor-pointer ${isDark ? "text-slate-400 hover:text-rose-400" : "text-slate-400 hover:text-rose-600"}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border pointer-events-none ${isDark ? "bg-slate-900 text-slate-300 border-slate-800" : "bg-slate-100 text-slate-700 border-slate-300"}`}>
              {count}
            </span>
          </div>
        </div>

        {hasSubfolders && isExpanded && depth < 6 && (
          <div className="pl-3.5 border-l-2 border-amber-400/40 ml-2.5 space-y-1">
            {subfolders.map((child) => renderSidebarFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Klasör Vitrini İçin Renkli Klasör Kartı (Kök & Alt Klasörlerde Ortak)
  const renderFolderCard = (folder: FolderItem) => {
    const fid = String(folder.id || "").trim();
    const recursiveDeckCount = countDecksRecursive(fid);
    const subfolderCount = getSubfolders(fid).length;
    const directDecks = decks.filter(
      (d) => normalizeFolderId(d.folder_id) === fid
    );
    const folderWordCount = directDecks.reduce(
      (sum, d) => sum + getRealDeckWordCount(d),
      0
    );
    const isDropTarget =
      dragOverFolderTarget === fid || dragOverFolderReorderId === fid;
    const theme = getFolderAccentTheme(folder.color);

    return (
      <div
        key={fid}
        draggable
        onDragStart={(e) => handleFolderDragStart(e, fid)}
        onDragEnd={handleFolderDragEnd}
        onContextMenu={(e) => openFolderContextMenu(e, folder)}
        onClick={() => setSelectedFolderFilter(fid)}
        onDragEnter={(e) => {
          const fId = draggedFolderIdRef.current || draggedFolderId;
          const dId = draggedDeckIdRef.current || draggedDeckId;
          const canDropFolder =
            Boolean(fId) &&
            fId !== fid &&
            !wouldCreateFolderCycle(folders, String(fId), fid);
          if (!dId && !canDropFolder) return;
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = "move";
          setDragOverFolderTarget(fid);
        }}
        onDragOver={(e) => {
          const fId = draggedFolderIdRef.current || draggedFolderId;
          const dId = draggedDeckIdRef.current || draggedDeckId;
          const canDropFolder =
            Boolean(fId) &&
            fId !== fid &&
            !wouldCreateFolderCycle(folders, String(fId), fid);
          if (!dId && !canDropFolder) return;
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = "move";
          setDragOverFolderTarget(fid);
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          if (dragOverFolderTarget === fid) {
            setDragOverFolderTarget(null);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const fId =
            draggedFolderIdRef.current ||
            draggedFolderId ||
            e.dataTransfer.getData("application/x-folder-id");
          const dId =
            draggedDeckIdRef.current ||
            draggedDeckId ||
            e.dataTransfer.getData("application/x-deck-id") ||
            (!fId ? e.dataTransfer.getData("text/plain") : "");

          setDragOverFolderTarget(null);
          setDragOverFolderReorderId(null);
          setDraggedFolderId(null);
          setDraggedDeckId(null);
          draggedFolderIdRef.current = null;
          draggedDeckIdRef.current = null;

          if (fId && fId !== fid) {
            handleFolderDroppedOnTarget(fId, fid);
          } else if (dId) {
            handleMoveDeckToFolder(dId, fid);
          }
        }}
        className={`p-5 rounded-3xl border border-l-4 transition-all cursor-pointer group flex flex-col justify-between space-y-4 ${
          isDark
            ? "bg-slate-900/90 shadow-lg hover:shadow-xl"
            : "bg-[#f8fafc] shadow-sm hover:shadow-md"
        } ${
          isDropTarget
            ? isDark
              ? "ring-2 ring-amber-400 border-dashed border-amber-400 border-l-amber-500 bg-amber-500/15 scale-[1.02]"
              : "ring-2 ring-amber-400 border-dashed border-amber-400 border-l-amber-500 bg-amber-50 scale-[1.02]"
            : isDark
            ? `${theme.darkBorderAll} ${theme.borderLeft}`
            : `${theme.lightBorderAll} ${theme.borderLeft}`
        } ${draggedFolderId === fid ? "opacity-50" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition pointer-events-none ${isDark ? theme.darkIconBg : theme.lightIconBg}`}
          >
            <Folder className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {subfolderCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border pointer-events-none ${isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-300"}`}>
                {t("lib_subfolder_count", undefined, { count: subfolderCount })}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFolderFilter(fid);
                setNewDeckFolderId(fid);
                setIsCreateModalOpen(true);
              }}
              title={t("lib_add_deck_to_folder")}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                isDark
                  ? "bg-slate-800 hover:bg-indigo-600/30 text-slate-200 hover:text-indigo-200 border-slate-700 hover:border-indigo-500/50"
                  : "bg-slate-100 hover:bg-indigo-100 text-slate-800 hover:text-indigo-800 border-slate-300 hover:border-indigo-400"
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>{t("lib_add_deck_to_folder")}</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleDeleteFolder(e, fid, folder.name)}
              title={t("lib_delete_folder_title")}
              className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition cursor-pointer ${isDark ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/15" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none">
          <h3 className={`text-base font-black transition truncate ${isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"}`}>
            {folder.name}
          </h3>
          <p className={`text-xs mt-1 font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {recursiveDeckCount} {t("decks_count_suffix")} • {folderWordCount} {t("lib_word_unit")}
          </p>
        </div>

        <div className={`pt-3 border-t flex items-center justify-between text-xs font-bold pointer-events-none ${isDark ? "border-slate-800 text-slate-300 group-hover:text-indigo-300" : "border-slate-200 text-slate-700 group-hover:text-indigo-700"}`}>
          <span>{t("lib_open_folder")}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    );
  };

  // Hem Deste Başlığı/Açıklaması Hem İçindeki Kelimelerde Canlı Arama + Klasör Filtresi
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const deckSearchResults = useMemo(() => {
    return decks
      .map((deck) => {
        const deckFolderId = normalizeFolderId(deck.folder_id);
        let matchesFolder = true;
        if (selectedFolderFilter !== "all") {
          matchesFolder =
            deckFolderId === String(selectedFolderFilter || "").trim();
        }
        if (!matchesFolder) return null;

        const cards = deckCardsMap[deck.id];
        const matchedWords = trimmedQuery
          ? (cards || []).filter(
              (c) =>
                c.word.toLowerCase().includes(trimmedQuery) ||
                c.meaning.toLowerCase().includes(trimmedQuery)
            )
          : [];

        const matchesMeta =
          !trimmedQuery ||
          deck.title.toLowerCase().includes(trimmedQuery) ||
          (deck.description &&
            deck.description.toLowerCase().includes(trimmedQuery));

        if (!matchesMeta && matchedWords.length === 0) return null;

        const realCardCount = Array.isArray(cards)
          ? cards.length
          : deck.card_count || 0;

        return {
          deck,
          matchedWords,
          realCardCount,
        };
      })
      .filter(
        (
          entry
        ): entry is {
          deck: DeckItem;
          matchedWords: GameWordPair[];
          realCardCount: number;
        } => entry !== null
      );
  }, [decks, deckCardsMap, selectedFolderFilter, trimmedQuery]);

  const heroWaitingCount = dueCount > 0 ? dueCount : weakSpotCount;

  const getRealDeckWordCount = useCallback(
    (deck: DeckItem): number => {
      const cards = deckCardsMap[deck.id];
      return Array.isArray(cards) ? cards.length : deck.card_count || 0;
    },
    [deckCardsMap]
  );

  // Hızlı Çalışma Seçici Yardımcıları (Klasör + Alt Klasör + Deste Çoklu Seçim)
  const getRecursiveFolderStats = useCallback(
    (rootFolderId: string) => {
      const idSet = new Set(getDescendantFolderIds(rootFolderId));
      const matched = decks.filter((d) => {
        const fid = normalizeFolderId(d.folder_id);
        return Boolean(fid && idSet.has(fid));
      });
      const wordCount = matched.reduce(
        (sum, d) => sum + getRealDeckWordCount(d),
        0
      );
      return { deckCount: matched.length, wordCount };
    },
    [decks, getDescendantFolderIds, getRealDeckWordCount]
  );

  const modalSubfolders = useMemo(() => {
    if (selectedQuickFolderIds.length === 0) return [];
    const seen = new Set<string>();
    const result: FolderItem[] = [];
    for (const rootId of selectedQuickFolderIds) {
      const descendantIds = getDescendantFolderIds(rootId);
      for (const dId of descendantIds) {
        if (dId === rootId || seen.has(dId)) continue;
        const item = folderObjMap.get(dId);
        if (item) {
          seen.add(dId);
          result.push(item);
        }
      }
    }
    return result;
  }, [selectedQuickFolderIds, getDescendantFolderIds, folderObjMap]);

  const visibleModalDecks = useMemo(() => {
    if (selectedQuickFolderIds.length === 0) {
      return decks;
    }
    const activeFolderScope = new Set<string>([
      ...selectedQuickFolderIds,
      ...selectedQuickSubfolderIds,
    ]);
    return decks.filter((d) => {
      const fid = normalizeFolderId(d.folder_id);
      return Boolean(fid && activeFolderScope.has(fid));
    });
  }, [decks, selectedQuickFolderIds, selectedQuickSubfolderIds]);

  const selectedTotalWords = useMemo(() => {
    const idSet = new Set(selectedQuickDeckIds);
    return decks.reduce((sum, d) => {
      if (!idSet.has(d.id)) return sum;
      return sum + getRealDeckWordCount(d);
    }, 0);
  }, [decks, selectedQuickDeckIds, getRealDeckWordCount]);

  const toggleQuickFolder = (folderId: string) => {
    const isCurrentlySelected = selectedQuickFolderIds.includes(folderId);

    const descendantIds = getDescendantFolderIds(folderId);
    const childOnlyIds = descendantIds.filter((id) => id !== folderId);
    const scopeSet = new Set(descendantIds);
    const folderDeckIds = decks
      .filter((d) => {
        const fid = normalizeFolderId(d.folder_id);
        return Boolean(fid && scopeSet.has(fid));
      })
      .map((d) => d.id);

    if (isCurrentlySelected) {
      setSelectedQuickFolderIds((prev) => prev.filter((id) => id !== folderId));
      setSelectedQuickSubfolderIds((prev) =>
        prev.filter((id) => !childOnlyIds.includes(id))
      );
      setSelectedQuickDeckIds((prev) =>
        prev.filter((id) => !folderDeckIds.includes(id))
      );
    } else {
      setSelectedQuickFolderIds((prev) =>
        Array.from(new Set([...prev, folderId]))
      );
      setSelectedQuickSubfolderIds((prev) =>
        Array.from(new Set([...prev, ...childOnlyIds]))
      );
      setSelectedQuickDeckIds((prev) =>
        Array.from(new Set([...prev, ...folderDeckIds]))
      );
    }
  };

  const toggleQuickSubfolder = (subfolderId: string) => {
    const descendantIds = getDescendantFolderIds(subfolderId);
    const scopeSet = new Set(descendantIds);
    const subDeckIds = decks
      .filter((d) => {
        const fid = normalizeFolderId(d.folder_id);
        return Boolean(fid && scopeSet.has(fid));
      })
      .map((d) => d.id);

    const isCurrentlySelected = selectedQuickSubfolderIds.includes(subfolderId);
    if (isCurrentlySelected) {
      setSelectedQuickSubfolderIds((prev) =>
        prev.filter((id) => !descendantIds.includes(id))
      );
      setSelectedQuickDeckIds((prev) =>
        prev.filter((id) => !subDeckIds.includes(id))
      );
    } else {
      setSelectedQuickSubfolderIds((prev) =>
        Array.from(new Set([...prev, ...descendantIds]))
      );
      setSelectedQuickDeckIds((prev) =>
        Array.from(new Set([...prev, ...subDeckIds]))
      );
    }
  };

  const toggleQuickDeck = (deck: DeckItem) => {
    setSelectedQuickDeckIds((prev) =>
      prev.includes(deck.id)
        ? prev.filter((id) => id !== deck.id)
        : [...prev, deck.id]
    );
  };

  const handleOpenQuickStudyModal = () => {
    setIsQuickStudyModalOpen(true);
  };

  const handleLaunchQuickAll = () => {
    setIsQuickStudyModalOpen(false);
    const availableIds = decks
      .filter((d) => getRealDeckWordCount(d) > 0)
      .map((d) => d.id);
    if (availableIds.length > 0) {
      router.push(
        `/study/quick?decks=${encodeURIComponent(availableIds.join(","))}`
      );
    } else {
      router.push("/study/quick");
    }
  };

  const handleLaunchSelectedQuickStudy = () => {
    if (selectedQuickDeckIds.length === 0 || selectedTotalWords === 0) {
      return;
    }
    setIsQuickStudyModalOpen(false);
    router.push(
      `/study/quick?decks=${encodeURIComponent(selectedQuickDeckIds.join(","))}`
    );
  };

  return (
    <div
      className={`w-full max-w-full overflow-x-hidden min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
        isDark ? "bg-[#0B0F19] text-slate-100" : "bg-[#dce3ec] text-slate-900"
      }`}
    >
      <div className="flex-1 w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* =================================================================== */}
        {/* 1. SOL SÜTUN: Deste & Kelime Ara + Klasörler + SM-2 Bilgi Kartı      */}
        {/* =================================================================== */}
        <aside className="w-full lg:sticky lg:top-20 space-y-4">
          {/* Deste & Kelime Ara */}
          <div
            className={`p-4 rounded-3xl border space-y-2.5 transition-colors ${
              isDark
                ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-lg"
                : "bg-[#f8fafc] border-slate-300 text-slate-900 shadow-sm"
            }`}
          >
            <label
              htmlFor="deck-search-input"
              className={`text-xs font-bold block ${isDark ? "text-slate-200" : "text-slate-800"}`}
            >
              Deste &amp; Kelime Ara
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="deck-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("lib_search_decks_words")}
                className={`w-full pl-9 pr-8 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 transition ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={t("lib_clear_search")}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Klasörler Listesi */}
          <div
            className={`p-4 rounded-3xl border space-y-2.5 transition-colors ${
              isDark
                ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-lg"
                : "bg-[#f8fafc] border-slate-300 text-slate-900 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {t("lib_folders")}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!user && isGuest) {
                    openRegistrationGate("Harika gidiyorsun! Öğrendiğin kelimeleri kalıcı olarak kaydetmek için 10 saniyede ücretsiz hesabını aç.");
                    return;
                  }
                  setNewFolderName("");
                  setNewFolderColor("#f59e0b");
                  setNewFolderParentId("");
                  setIsCreateFolderModalOpen(true);
                }}
                title={t("lib_new_folder_title")}
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                  isDark
                    ? "bg-slate-800 hover:bg-indigo-600/30 text-slate-200 hover:text-indigo-200 border-slate-700 hover:border-indigo-500/50"
                    : "bg-slate-100 hover:bg-indigo-100 text-slate-800 hover:text-indigo-800 border-slate-300 hover:border-indigo-400"
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{t("lib_folder")}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {/* Tüm Desteler (Klasör -> Kök Dizin Hedefi) */}
              <button
                type="button"
                onClick={() => setSelectedFolderFilter("all")}
                onDragEnter={(e) => {
                  const fId = draggedFolderIdRef.current || draggedFolderId;
                  if (!fId) return;
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverFolderTarget("all");
                }}
                onDragOver={(e) => {
                  const fId = draggedFolderIdRef.current || draggedFolderId;
                  if (!fId) return;
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverFolderTarget("all");
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  if (dragOverFolderTarget === "all") {
                    setDragOverFolderTarget(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const fId =
                    draggedFolderIdRef.current ||
                    draggedFolderId ||
                    e.dataTransfer.getData("application/x-folder-id");

                  setDragOverFolderTarget(null);
                  setDraggedFolderId(null);
                  setDraggedDeckId(null);
                  draggedFolderIdRef.current = null;
                  draggedDeckIdRef.current = null;

                  if (fId) {
                    handleMoveFolderToParent(fId, null);
                  }
                }}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                  dragOverFolderTarget === "all"
                    ? isDark
                      ? "ring-2 ring-indigo-500 bg-indigo-500/20 border border-dashed border-indigo-400 text-indigo-200 scale-[1.02]"
                      : "ring-2 ring-indigo-500 bg-indigo-50 border border-dashed border-indigo-400 text-indigo-800 scale-[1.02]"
                    : selectedFolderFilter === "all"
                    ? isDark
                      ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/50 font-bold shadow-xs"
                      : "bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold shadow-xs"
                    : isDark
                    ? "bg-slate-950/70 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800"
                    : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-300/80"
                }`}
              >
                <span className="flex items-center gap-2 truncate pointer-events-none">
                  <span>📚</span>
                  <span className="truncate">{t("lib_all_decks")}</span>
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border pointer-events-none ${isDark ? "bg-slate-900 text-slate-300 border-slate-700" : "bg-white text-slate-700 border-slate-300"}`}>
                  {decks.length}
                </span>
              </button>

              {/* Kullanıcı Klasörleri Ağacı (Renk Vurgulu + Alt Klasörlü) */}
              {getSubfolders(null).length > 0 ? (
                <div className="pt-1 space-y-1.5">
                  {getSubfolders(null).map((folder) =>
                    renderSidebarFolderNode(folder, 0)
                  )}
                </div>
              ) : (
                <div className={`p-3 rounded-xl border border-dashed text-center text-[11px] ${isDark ? "border-slate-800 text-slate-400" : "border-slate-300 text-slate-500"}`}>
                  {t("lib_no_folders_yet")}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* 2. ANA ALAN (SAĞ): SM-2 Bar + Aksiyonlar + 3 Sütunlu Deste Vitrini  */}
        {/* =================================================================== */}
        <section className="min-w-0 w-full space-y-5">
          {/* Üst SM-2 Günlük Tekrar Barı (Her İki Modda Koyu Kontrast Korunur) */}
          <div
            data-theme-preserve="dark"
            className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="absolute -right-10 -top-10 w-44 h-44 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1.5 z-10 max-w-xl">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                {t("lib_daily_review_badge")}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t("nav_library", "Kelime Havuzu")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t("lib_waiting_words_msg", undefined, { count: heroWaitingCount })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
              <button
                type="button"
                onClick={() => setIsWeakSpotModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Target className="w-3.5 h-3.5 text-rose-300" />
                <span>🎯 {t("lib_weak_spot")} ({weakSpotCount})</span>
              </button>

              <button
                type="button"
                onClick={handleOpenQuickStudyModal}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ {t("lib_start_quick_study")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Deste Vitrini Üst Barı */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {viewMode === "folder" && selectedFolderFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedFolderFilter("all")}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    isDark
                      ? "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
                      : "bg-[#f8fafc] hover:bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t("lib_all_folders")}</span>
                </button>
              )}
              <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                {t("lib_decks_listed", undefined, { count: deckSearchResults.length })}
              </span>
              {selectedFolderFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedFolderFilter("all")}
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                    isDark
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                      : "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                  }`}
                >
                  <span>
                    {folderNameMap.get(selectedFolderFilter) || t("lib_folder")}
                  </span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const hasFolderDecks =
                    selectedFolderFilter !== "all" &&
                    deckSearchResults.length > 0;
                  let preferredDeckId = addWordCtrl.selectedDeckForWord;
                  if (hasFolderDecks) {
                    const alreadyInFolder = deckSearchResults.some(
                      (entry) => entry.deck.id === preferredDeckId
                    );
                    if (!alreadyInFolder) {
                      preferredDeckId = deckSearchResults[0].deck.id;
                    }
                  } else if (decks.length > 0 && !preferredDeckId) {
                    preferredDeckId = decks[0].id;
                  }
                  addWordCtrl.openModal(preferredDeckId || undefined);
                }}
                className={`px-3.5 py-2 rounded-xl border font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-indigo-500/50 text-indigo-300"
                    : "bg-[#f8fafc] hover:bg-indigo-50 border-slate-300 hover:border-indigo-400 text-indigo-700"
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                <span>✨ {t("lib_add_word")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInitialImportCode("");
                  setIsImportModalOpen(true);
                }}
                className={`px-3.5 py-2 rounded-xl border font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 border-amber-500/40 hover:border-amber-400 text-amber-300"
                    : "bg-[#f8fafc] hover:bg-amber-50 border-amber-400/70 hover:border-amber-500 text-amber-800"
                }`}
                title="Paylaşım Kodu veya Link ile Deste Al"
              >
                <KeyRound className={`w-3.5 h-3.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                <span>🔑 Kodla Deste Al</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!user && isGuest) {
                    openRegistrationGate("Harika gidiyorsun! Öğrendiğin kelimeleri kalıcı olarak kaydetmek için 10 saniyede ücretsiz hesabını aç.");
                    return;
                  }
                  if (selectedFolderFilter && selectedFolderFilter !== "all") {
                    setNewDeckFolderId(selectedFolderFilter);
                  } else if (folders.length > 0) {
                    setNewDeckFolderId(String(folders[0].id || "").trim());
                  } else {
                    setNewDeckFolderId("");
                  }
                  setIsCreateModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ {t("lib_new_deck")}</span>
              </button>

              {/* Kalıcı 3 Seçenekli Görünüm Değiştirici */}
              <div
                className={`flex items-center border rounded-xl p-1 shadow-xs ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-[#f8fafc] border-slate-300"
                }`}
                role="group"
                aria-label={t("lib_view_switcher")}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("folder")}
                  title={t("lib_view_folder_title")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    viewMode === "folder"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("lib_folder")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title={t("lib_view_card_title")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("lib_view_card")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  title={t("lib_view_list_title")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : isDark
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t("lib_view_list")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Akıllı Unutma Destesi / Zorlandığım Kelimeler Kartı (En az 1 kelime varsa en üstte görünür) */}
          {weakSpotCount > 0 && (
            <button
              type="button"
              onClick={() => setIsWeakSpotModalOpen(true)}
              className={`w-full text-left p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-md hover:-translate-y-0.5 ${
                isDark
                  ? "bg-rose-950/35 hover:bg-rose-950/50 border-rose-500/40 text-white"
                  : "bg-rose-50 hover:bg-rose-100 border-rose-300 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                    isDark
                      ? "bg-rose-500/20 border-rose-500/40"
                      : "bg-rose-100 border-rose-300"
                  }`}
                >
                  🧠
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm sm:text-base font-extrabold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                      {t("lib_smart_weak_deck", "Unutma Destesi / Zorlandığım Kelimeler")}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black font-mono bg-rose-600 text-white shrink-0">
                      {weakSpotCount}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${isDark ? "text-rose-200/80" : "text-rose-900/80"}`}>
                    {t("lib_smart_weak_deck_sub", "Yanlış bilinen ve zorlanılan kartlarla hemen telafi çalışması başlat")}
                  </p>
                </div>
              </div>
              <span className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm">
                <span>{t("lib_study_now", "Çalış")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          )}

          {/* Seçili Klasör Breadcrumb Yolu & Alt Klasörler */}
          {selectedFolderFilter !== "all" && !trimmedQuery && (
              <div className="space-y-4">
                <div
                  className={`px-4 py-2.5 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-2 ${
                    isDark
                      ? "bg-slate-900/90 border-slate-800"
                      : "bg-[#f8fafc] border-slate-300"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedFolderFilter("all")}
                      className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        isDark
                          ? "bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-200"
                          : "bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700"
                      }`}
                    >
                      Ana Dizin
                    </button>
                    {getBreadcrumbTrail(selectedFolderFilter).map(
                      (crumb, idx, arr) => {
                        const crumbId = String(crumb.id || "").trim();
                        const isLast = idx === arr.length - 1;
                        return (
                          <div
                            key={crumbId}
                            className="flex items-center gap-1.5"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            <button
                              type="button"
                              onClick={() => setSelectedFolderFilter(crumbId)}
                              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                                isLast
                                  ? isDark
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                                    : "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                                  : isDark
                                  ? "text-slate-300 hover:text-indigo-200 hover:bg-slate-800 font-semibold"
                                  : "text-slate-700 hover:text-indigo-700 hover:bg-slate-100 font-semibold"
                              }`}
                            >
                              {crumb.name}
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewFolderName("");
                      setNewFolderColor(
                        folderObjMap.get(selectedFolderFilter)?.color ||
                          "#f59e0b"
                      );
                      setNewFolderParentId(selectedFolderFilter);
                      setIsCreateFolderModalOpen(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      isDark
                        ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30"
                        : "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                    }`}
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>{t("lib_subfolders")}</span>
                  </button>
                </div>

                {viewMode === "folder" &&
                  getSubfolders(selectedFolderFilter).length > 0 && (
                    <div className="space-y-2.5">
                      <div className={`text-[11px] font-bold uppercase tracking-wider px-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {t("lib_subfolders")} ({getSubfolders(selectedFolderFilter).length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {getSubfolders(selectedFolderFilter).map(
                          renderFolderCard
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

          {/* Deste ve Klasör Görünümleri (Klasör / Kart / Liste) */}
          {loadingDecks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className={`h-44 rounded-3xl border animate-pulse p-5 ${
                    isDark ? "bg-slate-900 border-slate-800" : "bg-[#f8fafc] border-slate-300"
                  }`}
                />
              ))}
            </div>
          ) : viewMode === "folder" &&
            selectedFolderFilter === "all" &&
            !trimmedQuery ? (
            <div className="space-y-6">
              {/* Kullanıcı Klasörleri (Kök Dizin) */}
              {getSubfolders(null).length > 0 ? (
                <div className="space-y-3">
                  <div className={`text-[11px] font-bold uppercase tracking-wider px-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("lib_user_folders")} ({getSubfolders(null).length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {getSubfolders(null).map(renderFolderCard)}
                  </div>
                </div>
              ) : (
                <div
                  className={`p-8 rounded-3xl border border-dashed text-center space-y-3 ${
                    isDark
                      ? "bg-slate-900/80 border-slate-700"
                      : "bg-[#f8fafc] border-slate-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${isDark ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {t("lib_first_folder_title")}
                    </h3>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("lib_first_folder_desc")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFolderName("");
                      setNewFolderColor("#f59e0b");
                      setNewFolderParentId("");
                      setIsCreateFolderModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    {t("lib_open_first_folder")}
                  </button>
                </div>
              )}
              {/* Klasörsüz / Kopyalanan Desteler (Kök Dizinde Her Zaman Görünür) */}
              {decks.filter((d) => !normalizeFolderId(d.folder_id)).length > 0 && (
                <div className="space-y-3">
                  <div className={`text-[11px] font-bold uppercase tracking-wider px-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Genel Desteler ({decks.filter((d) => !normalizeFolderId(d.folder_id)).length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {decks
                      .filter((d) => !normalizeFolderId(d.folder_id))
                      .map((deck) => {
                        const realCardCount = getRealDeckWordCount(deck);
                        return (
                          <div
                            key={deck.id}
                            role="link"
                            tabIndex={0}
                            onClick={() => {
                              setActiveDeckId(deck.id);
                              router.push(`/study/${deck.id}`);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setActiveDeckId(deck.id);
                                router.push(`/study/${deck.id}`);
                              }
                            }}
                            className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                              isDark
                                ? "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-indigo-500/60 shadow-lg"
                                : "bg-[#f8fafc] hover:bg-white border-slate-300 hover:border-indigo-400 shadow-sm hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`w-9 h-9 rounded-xl border flex items-center justify-center ${isDark ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-indigo-100 border-indigo-200 text-indigo-700"}`}>
                                <BookOpen className="w-4 h-4" />
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSharingDeck({
                                      id: deck.id,
                                      title: deck.title,
                                      card_count: realCardCount,
                                    });
                                  }}
                                  title="Desteyi Paylaş"
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${isDark ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15" : "text-slate-500 hover:text-indigo-700 hover:bg-indigo-50"}`}
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800"}`}>
                                  {realCardCount} {t("lib_word_unit")}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 space-y-1">
                              <h3 className={`text-base font-bold line-clamp-1 ${isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"}`}>
                                {deck.title}
                              </h3>
                              <p className={`text-xs line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                {deck.description || t("lib_personal_sm2_desc")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : deckSearchResults.length === 0 ? (
            viewMode === "folder" &&
            selectedFolderFilter !== "all" &&
            getSubfolders(selectedFolderFilter).length > 0 &&
            !trimmedQuery ? (
              <div
                className={`p-5 rounded-2xl border border-dashed text-center text-xs ${
                  isDark
                    ? "bg-slate-900/70 border-slate-700 text-slate-400"
                    : "bg-[#f8fafc] border-slate-300 text-slate-600"
                }`}
              >
                {t("lib_no_decks_in_root")}
              </div>
            ) : (
              <div
                className={`p-8 rounded-3xl border border-dashed text-center space-y-3 ${
                  isDark
                    ? "bg-slate-900/80 border-slate-700"
                    : "bg-[#f8fafc] border-slate-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${isDark ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-indigo-100 text-indigo-700 border-indigo-200"}`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {t("lib_no_match_title")}
                  </h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("lib_no_match_desc")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFolderFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  {t("lib_show_all_decks")}
                </button>
              </div>
            )
          ) : viewMode === "list" ? (
            /* KOMPAKT YATAY LİSTE GÖRÜNÜMÜ */
            <div className="space-y-2.5">
              {deckSearchResults.map(({ deck, matchedWords, realCardCount }) => {
                const normalizedFid = normalizeFolderId(deck.folder_id);
                const folderLabel =
                  normalizedFid && validFolderIds.has(normalizedFid)
                    ? folderNameMap.get(normalizedFid) || t("lib_folder")
                    : t("lib_folder");
                const isPresetDeck = deck.id.startsWith("preset_");
                const isBeingDragged = draggedDeckId === deck.id;

                return (
                  <div
                    key={deck.id}
                    role="link"
                    tabIndex={0}
                    draggable
                    onDragStart={(e) => handleDeckDragStart(e, deck.id)}
                    onDragEnd={handleDeckDragEnd}
                    onContextMenu={(e) => openDeckContextMenu(e, deck)}
                    onClick={() => {
                      setActiveDeckId(deck.id);
                      router.push(`/study/${deck.id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setActiveDeckId(deck.id);
                        router.push(`/study/${deck.id}`);
                      }
                    }}
                    className={`p-3.5 sm:px-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-grab active:cursor-grabbing ${
                      isDark
                        ? "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-indigo-500/60 shadow-lg"
                        : "bg-[#f8fafc] hover:bg-white border-slate-300 hover:border-indigo-400 shadow-sm hover:shadow-md"
                    } ${
                      isBeingDragged
                        ? "opacity-45 border-dashed border-indigo-400 scale-[0.99]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
                      <GripVertical className={`w-4 h-4 shrink-0 ${isDark ? "text-slate-600 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-600"}`} />
                      <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${isDark ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-indigo-100 border-indigo-200 text-indigo-700"}`}>
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-bold transition truncate ${isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"}`}>
                            {deck.title}
                          </h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-300"}`}>
                            📁 {folderLabel}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {deck.description || t("lib_personal_sm2_desc")}
                        </p>
                        {trimmedQuery && matchedWords.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {matchedWords.slice(0, 3).map((mw, idx) => (
                              <span
                                key={`${deck.id}-lmw-${idx}`}
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${isDark ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-indigo-100 border-indigo-200 text-indigo-800"}`}
                              >
                                {mw.word} • {mw.meaning}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold ${isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800"}`}>
                        {realCardCount} {t("lib_word_unit")}
                      </span>
                      <span className={`font-semibold hidden md:inline-flex items-center gap-1 text-[11px] ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t("lib_sm2_ready")}</span>
                      </span>
                      {!isPresetDeck && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSharingDeck({
                                id: deck.id,
                                title: deck.title,
                                card_count: realCardCount,
                              });
                            }}
                            title="Desteyi Paylaş"
                            className={`p-1.5 rounded-lg transition cursor-pointer ${isDark ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15" : "text-slate-500 hover:text-indigo-700 hover:bg-indigo-50"}`}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) =>
                              handleDeleteDeck(e, deck.id, deck.title)
                            }
                            title={t("lib_delete_deck_title")}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${isDark ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/15" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <span className={`font-bold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>
                        <span>{t("lib_study")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 3 SÜTUNLU GENİŞ KART GÖRÜNÜMÜ */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {deckSearchResults.map(({ deck, matchedWords, realCardCount }) => {
                const normalizedFid = normalizeFolderId(deck.folder_id);
                const folderLabel =
                  normalizedFid && validFolderIds.has(normalizedFid)
                    ? folderNameMap.get(normalizedFid) || t("lib_folder")
                    : t("lib_folder");
                const isPresetDeck = deck.id.startsWith("preset_");
                const isBeingDragged = draggedDeckId === deck.id;

                return (
                  <div
                    key={deck.id}
                    role="link"
                    tabIndex={0}
                    draggable
                    onDragStart={(e) => handleDeckDragStart(e, deck.id)}
                    onDragEnd={handleDeckDragEnd}
                    onContextMenu={(e) => openDeckContextMenu(e, deck)}
                    onClick={() => {
                      setActiveDeckId(deck.id);
                      router.push(`/study/${deck.id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setActiveDeckId(deck.id);
                        router.push(`/study/${deck.id}`);
                      }
                    }}
                    className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between group cursor-grab active:cursor-grabbing relative overflow-hidden ${
                      isDark
                        ? "bg-slate-900/90 hover:bg-slate-800/90 border-slate-800 hover:border-indigo-500/60 shadow-lg hover:shadow-indigo-500/10"
                        : "bg-[#f8fafc] hover:bg-white border-slate-300 hover:border-indigo-400 shadow-sm hover:shadow-md"
                    } ${
                      isBeingDragged
                        ? "opacity-45 border-dashed border-indigo-400 scale-95"
                        : ""
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 pointer-events-none">
                          <GripVertical className={`w-4 h-4 shrink-0 ${isDark ? "text-slate-600 group-hover:text-slate-400" : "text-slate-400 group-hover:text-slate-600"}`} />
                          <span className={`w-9 h-9 rounded-xl border flex items-center justify-center group-hover:scale-110 transition ${isDark ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-indigo-100 border-indigo-200 text-indigo-700"}`}>
                            <BookOpen className="w-4 h-4" />
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isPresetDeck && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSharingDeck({
                                    id: deck.id,
                                    title: deck.title,
                                    card_count: realCardCount,
                                  });
                                }}
                                title="Desteyi Paylaş"
                                className={`p-1.5 rounded-lg transition cursor-pointer ${isDark ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15" : "text-slate-500 hover:text-indigo-700 hover:bg-indigo-50"}`}
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleDeleteDeck(e, deck.id, deck.title)
                                }
                                title={t("lib_delete_deck_title")}
                                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition cursor-pointer ${isDark ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/15" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition ${isDark ? "bg-slate-950 border-slate-800 text-slate-300 group-hover:text-indigo-300" : "bg-slate-100 border-slate-300 text-slate-800 group-hover:text-indigo-700"}`}>
                            {realCardCount} {t("lib_word_unit")}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-0.5 pointer-events-none">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border ${isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-300"}`}>
                          📁 {folderLabel}
                        </span>
                        <h3 className={`text-base font-bold transition line-clamp-1 ${isDark ? "text-white group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-700"}`}>
                          {deck.title}
                        </h3>
                        <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {deck.description || t("lib_personal_sm2_desc")}
                        </p>
                      </div>

                      {/* Kelime Bazlı Arama Eşleşmeleri */}
                      {trimmedQuery && matchedWords.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1 pointer-events-none">
                          {matchedWords.slice(0, 3).map((mw, idx) => (
                            <span
                              key={`${deck.id}-mw-${idx}`}
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold truncate max-w-full ${isDark ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-indigo-100 border-indigo-200 text-indigo-800"}`}
                            >
                              {mw.word} • {mw.meaning}
                            </span>
                          ))}
                          {matchedWords.length > 3 && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-700"}`}>
                              +{matchedWords.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={`pt-4 mt-4 border-t flex items-center justify-between text-xs pointer-events-none ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                      <span className={`font-semibold flex items-center gap-1 text-[11px] ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t("lib_sm2_ready")}</span>
                      </span>
                      <span className={`font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>
                        <span>{t("lib_study")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =================================================================== */}
      {/* MODALLAR (Oyun Arenası & SM-2 Backend Endpoints ile Tam Senkron)     */}
      {/* =================================================================== */}

      {/* 1. Yeni Klasör Açma Modalı */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <FolderPlus className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                {newFolderParentId ? t("lib_new_subfolder_title") : t("lib_new_folder_title")}
              </h3>
            </div>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("lib_folder_name_label")}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder={t("lib_folder_name_ph")}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("lib_parent_folder_opt")}
                </label>
                <select
                  value={newFolderParentId}
                  onChange={(e) => setNewFolderParentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none cursor-pointer"
                >
                  <option value="">{t("lib_root_dir")}</option>
                  {folders.map((f) => {
                    const fid = String(f.id || "").trim();
                    return (
                      <option key={fid} value={fid}>
                        📁 {f.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t("lib_folder_color")}
                </label>
                <div className="flex items-center gap-2">
                  {FOLDER_PALETTE.map((c) => {
                    const active =
                      newFolderColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.label}
                        onClick={() => setNewFolderColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`w-7 h-7 rounded-full transition cursor-pointer ${
                          active
                            ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110"
                            : "opacity-75 hover:opacity-100"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateFolderModalOpen(false);
                    setNewFolderParentId("");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  {t("lib_cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white text-xs font-bold cursor-pointer"
                >
                  {isCreatingFolder ? t("lib_creating") : t("lib_create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Yeni Deste Oluşturma Modalı */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newDescription={newDescription}
        setNewDescription={setNewDescription}
        newDeckFolderId={newDeckFolderId}
        setNewDeckFolderId={setNewDeckFolderId}
        folders={folders.map((f) => ({ id: f.id, name: f.name }))}
        onSubmit={handleCreateDeck}
      />

      {/* 3. AI Kelime Ekleme Modalı */}
      <AddWordModal
        isOpen={addWordCtrl.isOpen}
        onClose={addWordCtrl.closeModal}
        decks={addWordModalDecks}
        selectedDeckForWord={addWordCtrl.selectedDeckForWord}
        setSelectedDeckForWord={addWordCtrl.setSelectedDeckForWord}
        termLang={addWordCtrl.termLang}
        setTermLang={addWordCtrl.setTermLang}
        defLang={addWordCtrl.defLang}
        setDefLang={addWordCtrl.setDefLang}
        supportedLanguages={SUPPORTED_LANGUAGES}
        wordInput={addWordCtrl.wordInput}
        setWordInput={addWordCtrl.setWordInput}
        isAutoLookingUp={addWordCtrl.isAutoLookingUp}
        triggerAutoLookup={addWordCtrl.triggerAutoLookup}
        isEnriching={addWordCtrl.isEnriching}
        contextHint={addWordCtrl.contextHint}
        setContextHint={addWordCtrl.setContextHint}
        handleManualInputMode={addWordCtrl.handleManualInputMode}
        runFetchAi={addWordCtrl.runFetchAi}
        enrichedData={addWordCtrl.enrichedData}
        setEnrichedData={addWordCtrl.setEnrichedData}
        speakText={speakText}
        handleSaveCard={addWordCtrl.handleSaveCard}
        isSavingCard={addWordCtrl.isSavingCard}
        lastAutoWordRef={addWordCtrl.lastAutoWordRef}
        isProUpgradeOpen={addWordCtrl.isProUpgradeOpen}
        setIsProUpgradeOpen={addWordCtrl.setIsProUpgradeOpen}
        proUpgradeReason={addWordCtrl.proUpgradeReason}
      />

      {/* 4. Zayıf Nokta Kurtarma Modalı */}
      <WeakSpotRecoveryModal
        isOpen={isWeakSpotModalOpen}
        onClose={() => {
          setIsWeakSpotModalOpen(false);
          fetchStudyMetrics();
        }}
        onRefreshNeeded={fetchStudyMetrics}
        onAllWeakSpotsCleared={() => {
          setWeakSpotCount(0);
          fetchStudyMetrics();
        }}
      />

      {/* 5. Hızlı Çalışma Kapsam Seçici Modalı */}
      {isQuickStudyModalOpen && (
        <div
          onClick={() => setIsQuickStudyModalOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] flex flex-col"
          >
            {/* Üst Başlık */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {t("lib_quick_study_scope")}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t("lib_quick_study_sub")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickStudyModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* En Üstte: Tek Tıkla Hemen Başla */}
            <button
              type="button"
              onClick={handleLaunchQuickAll}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer shrink-0"
            >
              <span>{t("lib_quick_all_btn")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Klasörler ve Desteler Çoklu Seçim Alanı */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {/* Klasörler Bölümü */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t("lib_quick_folders_hint")}
                  </span>
                  {(selectedQuickFolderIds.length > 0 ||
                    selectedQuickDeckIds.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuickFolderIds([]);
                        setSelectedQuickSubfolderIds([]);
                        setSelectedQuickDeckIds([]);
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      {t("lib_clear_selection")}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getSubfolders(null).map((folder) => {
                    const fId = String(folder.id || "").trim();
                    const { deckCount, wordCount } =
                      getRecursiveFolderStats(fId);
                    const checked = selectedQuickFolderIds.includes(fId);

                    return (
                      <label
                        key={fId}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition ${
                          checked
                            ? "bg-indigo-600/20 border-indigo-400 text-white"
                            : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleQuickFolder(fId)}
                            className="w-4 h-4 rounded accent-indigo-500 cursor-pointer shrink-0"
                          />
                          <span className="text-xs font-bold truncate">
                            📁 {folder.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {deckCount} / {wordCount}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Seçili Klasörlerin Alt Klasörleri Bölümü (Varsa) */}
              {selectedQuickFolderIds.length > 0 &&
                modalSubfolders.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 block">
                      {t("lib_subfolders")} ({modalSubfolders.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modalSubfolders.map((sub) => {
                        const subId = String(sub.id || "").trim();
                        const { deckCount, wordCount } =
                          getRecursiveFolderStats(subId);
                        const checked =
                          selectedQuickSubfolderIds.includes(subId);

                        return (
                          <label
                            key={subId}
                            className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition ${
                              checked
                                ? "bg-amber-500/15 border-amber-400/70 text-white"
                                : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleQuickSubfolder(subId)}
                                className="w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0"
                              />
                              <span className="text-xs font-semibold truncate">
                                ↳ 📂 {sub.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {deckCount} / {wordCount}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Desteler Bölümü (Dinamik Klasör Filtreli) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    {selectedQuickFolderIds.length > 0
                      ? t("lib_quick_selected_decks", undefined, { count: visibleModalDecks.length })
                      : t("lib_quick_all_decks_hdr", undefined, { count: decks.length })}
                  </span>
                  {selectedQuickFolderIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuickFolderIds([]);
                        setSelectedQuickSubfolderIds([]);
                      }}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      {t("lib_show_all_decks")}
                    </button>
                  )}
                </div>

                {visibleModalDecks.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 text-center text-xs text-slate-400">
                    {t("lib_quick_no_decks")}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {visibleModalDecks.map((deck) => {
                      const checked = selectedQuickDeckIds.includes(deck.id);
                      const normalizedFid = normalizeFolderId(deck.folder_id);
                      const folderLabel =
                        normalizedFid && validFolderIds.has(normalizedFid)
                          ? folderNameMap.get(normalizedFid) || t("lib_folder")
                          : t("lib_folder");
                      const wordCount = getRealDeckWordCount(deck);

                      return (
                        <label
                          key={deck.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                            checked
                              ? "bg-emerald-500/15 border-emerald-400/70 text-white"
                              : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleQuickDeck(deck)}
                              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer shrink-0"
                            />
                            <div className="min-w-0 flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold truncate">
                                {deck.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                                📁 {folderLabel}
                              </span>
                            </div>
                          </div>

                          <span className="text-[11px] font-mono font-bold text-indigo-300 shrink-0">
                            {wordCount} {t("lib_word_unit")}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Alt Eylem Butonu */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                {t("lib_quick_decks_selected", undefined, { count: selectedQuickDeckIds.length })}
              </span>
              <button
                type="button"
                disabled={
                  selectedQuickDeckIds.length === 0 ||
                  selectedTotalWords === 0
                }
                onClick={handleLaunchSelectedQuickStudy}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition ${
                  selectedQuickDeckIds.length > 0 &&
                  selectedTotalWords > 0
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {t("lib_quick_study_selected", undefined, { count: selectedTotalWords })}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Klasör Adını Düzenle Modalı */}
      {renamingFolder && (
        <div
          onClick={() => setRenamingFolder(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                {t("lib_rename_folder")}
              </h3>
            </div>
            <form onSubmit={handleRenameFolder} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                value={renamingFolder.name}
                onChange={(e) =>
                  setRenamingFolder({ ...renamingFolder, name: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingFolder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  {t("lib_cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isRenamingFolder || !renamingFolder.name.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white text-xs font-bold cursor-pointer"
                >
                  {isRenamingFolder ? t("lib_saving") : t("lib_save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Özel Sağ Tık (Context Menu) Klasöre Taşıma Menüsü */}
      {contextMenu && (
        <div
          data-theme-preserve="dark"
          onMouseDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-[9999] w-64 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2 text-slate-100 space-y-1 animate-in fade-in zoom-in-95 duration-100"
        >
          {contextMenu.type === "deck" && contextMenu.deck && (
            <>
              <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-800 truncate">
                {t("lib_move_deck_to")}
              </div>
              <div className="max-h-52 overflow-y-auto space-y-0.5 py-1">
                {folders.map((f) => {
                  const fid = String(f.id || "").trim();
                  const isCurrent =
                    normalizeFolderId(contextMenu.deck?.folder_id) === fid;
                  return (
                    <button
                      key={fid}
                      type="button"
                      onClick={() => {
                        const targetDeck = contextMenu.deck!;
                        setContextMenu(null);
                        handleMoveDeckToFolder(targetDeck.id, fid);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer ${
                        isCurrent
                          ? "bg-amber-500/15 text-amber-300"
                          : "hover:bg-slate-800 text-slate-200"
                      }`}
                    >
                      <span className="truncate">📁 {f.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {!contextMenu.deck.id.startsWith("preset_") && (
                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      const targetDeck = contextMenu.deck!;
                      setContextMenu(null);
                      handleDeleteDeck(e, targetDeck.id, targetDeck.title);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-500/15 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>🗑️ {t("lib_delete_deck_title")}</span>
                  </button>
                </div>
              )}
            </>
          )}

          {contextMenu.type === "folder" && contextMenu.folder && (() => {
            const ctxFolder = contextMenu.folder!;
            const sourceId = String(ctxFolder.id || "").trim();
            const currentParent = normalizeFolderId(ctxFolder.parent_id);
            const validTargets = folders.filter((targetF) => {
              const targetId = String(targetF.id || "").trim();
              return (
                targetId !== sourceId &&
                targetId !== currentParent &&
                !wouldCreateFolderCycle(folders, sourceId, targetId)
              );
            });

            return (
              <>
                <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-800 truncate">
                  📁 {ctxFolder.name}
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setContextMenu(null);
                      setContextMoveOpen(false);
                      setSelectedFolderFilter(sourceId);
                      setNewDeckFolderId(sourceId);
                      setIsCreateModalOpen(true);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-indigo-300 hover:bg-indigo-500/15 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>{t("lib_add_deck_plus")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setContextMenu(null);
                      setContextMoveOpen(false);
                      setNewFolderName("");
                      setNewFolderColor(ctxFolder.color || "#f59e0b");
                      setNewFolderParentId(sourceId);
                      setIsCreateFolderModalOpen(true);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-amber-300 hover:bg-amber-500/15 flex items-center gap-2 transition cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                    <span>{t("lib_new_sub_under")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContextMoveOpen((prev) => !prev)}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between gap-2 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CornerDownRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{t("lib_move_under_folder")}</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        contextMoveOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {contextMoveOpen && (
                    <div className="ml-3 pl-2 border-l border-slate-700 max-h-40 overflow-y-auto space-y-0.5 py-1">
                      {currentParent && (
                        <button
                          type="button"
                          onClick={() => {
                            setContextMenu(null);
                            setContextMoveOpen(false);
                            handleMoveFolderToParent(sourceId, null);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15 transition cursor-pointer"
                        >
                          {t("lib_move_to_root")}
                        </button>
                      )}
                      {validTargets.map((targetF) => {
                        const targetId = String(targetF.id || "").trim();
                        return (
                          <button
                            key={targetId}
                            type="button"
                            onClick={() => {
                              setContextMenu(null);
                              setContextMoveOpen(false);
                              handleMoveFolderToParent(sourceId, targetId);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-slate-200 hover:bg-slate-800 truncate transition cursor-pointer"
                          >
                            📁 {targetF.name}
                          </button>
                        );
                      })}
                      {!currentParent && validTargets.length === 0 && (
                        <div className="px-2.5 py-1.5 text-[11px] text-slate-500">
                          {t("lib_no_target_folders")}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isCopyingFolder}
                    onClick={() => {
                      setContextMenu(null);
                      setContextMoveOpen(false);
                      handleCopyFolder(ctxFolder);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>{t("lib_copy_folder")}</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setContextMenu(null);
                      setContextMoveOpen(false);
                      setRenamingFolder({
                        id: sourceId,
                        name: ctxFolder.name,
                      });
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-semibold text-indigo-300 hover:bg-indigo-500/15 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                    <span>{t("lib_edit_name")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      setContextMenu(null);
                      setContextMoveOpen(false);
                      handleDeleteFolder(e, sourceId, ctxFolder.name);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-500/15 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>🗑️ {t("lib_delete_folder_title")}</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 8. Ayarlar Modalı */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* 9. Deste Paylaşma Modalı */}
      <DeckShareModal
        isOpen={Boolean(sharingDeck)}
        onClose={() => setSharingDeck(null)}
        deck={sharingDeck}
      />

      {/* 10. Kodla / Linkle Deste Kopyalama (Import) Modalı */}
      <ImportDeckModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setInitialImportCode("");
          clearImportDeckParam();
        }}
        initialCode={initialImportCode}
        folders={folders.map((f) => ({ id: f.id, name: f.name }))}
        onImported={async () => {
          clearImportDeckParam();
          await Promise.all([refreshLibraryData(), fetchStudyMetrics()]);
        }}
      />

      <MobileBottomTabbar />
    </div>
  );
}
