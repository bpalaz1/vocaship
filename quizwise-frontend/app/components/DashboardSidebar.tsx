"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  BookOpen,
  Gamepad2,
  Layers,
  Search,
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
  GraduationCap,
  Briefcase,
  Wrench,
  Stethoscope,
  TrendingUp,
  FolderTree
} from "lucide-react";
import { CareerHubKey, ALL_CAREER_HUBS, CAREER_HUBS_BY_KEY } from "../data/careerHubs";
import { useTranslation } from "../context/LanguageContext";

export interface FolderItem {
  id: string;
  name: string;
}

export type TreeSelection =
  | { type: "all_decks" }
  | { type: "folder"; id: string; name: string }
  | { type: "hub"; key: CareerHubKey };

export interface IndustryTreeGroup {
  id: string;
  name: string;
  icon: string;
  hubKeys: CareerHubKey[];
}

export const INDUSTRY_TREE_GROUPS: IndustryTreeGroup[] = [
  {
    id: "academic",
    name: "Akademik Sınavlar",
    icon: "🎓",
    hubKeys: ["yds_yokdil", "ielts_toefl"],
  },
  {
    id: "project",
    name: "Proje & Kontrol",
    icon: "📊",
    hubKeys: ["project_controls", "project_management"],
  },
  {
    id: "engineering",
    name: "Mühendislik Dalları",
    icon: "🏗️",
    hubKeys: ["engineering_civil", "engineering_process_chem", "engineering_mechanical"],
  },
  {
    id: "health_legal",
    name: "Tıp & Hukuk",
    icon: "🩺",
    hubKeys: ["medical_health", "legal_contracts"],
  },
  {
    id: "finance_tech",
    name: "Finans & Bilişim",
    icon: "💻",
    hubKeys: ["finance_accounting", "tech_executive"],
  },
];

interface DashboardSidebarProps {
  folders: FolderItem[];
  selectedItem: TreeSelection;
  onSelectItem: (item: TreeSelection) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateFolder: () => void;
  deckCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function DashboardSidebar({
  folders,
  selectedItem,
  onSelectItem,
  searchQuery,
  onSearchChange,
  onOpenCreateFolder,
  deckCount,
  isMobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Accordion durumları
  const [isPersonalFoldersOpen, setIsPersonalFoldersOpen] = useState(true);
  const [isCareerTreeOpen, setIsCareerTreeOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    academic: true,
    project: true,
    engineering: false,
    health_legal: false,
    finance_tech: false,
  });

  const toggleGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const navLinks = [
    {
      name: t("nav_decks") || "Giriş Sayfası",
      href: "/",
      icon: Layers,
      isActive: pathname === "/",
    },
    {
      name: t("nav_reading") || "Okuma Odası",
      href: "/reading",
      icon: BookOpen,
      isActive: pathname.startsWith("/reading"),
    },
    {
      name: t("nav_games") || "Oyun Arenası",
      href: "/games",
      icon: Gamepad2,
      isActive: pathname.startsWith("/games"),
    },
  ];

  // Arama filtrelemesi
  const cleanQuery = searchQuery.trim().toLowerCase();
  const filteredFolders = folders.filter((f) =>
    cleanQuery ? f.name.toLowerCase().includes(cleanQuery) : true
  );

  const sidebarContent = (
    <aside className="w-[260px] min-w-[260px] max-w-[260px] h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl overflow-hidden select-none">
      {/* 1. ÜST KISIM: LOGO, ARAMA ÇUBUĞU & 3 ANA NAVİGASYON BAĞLANTISI */}
      <div className="p-4 border-b border-slate-800/80 space-y-3 shrink-0">
        {/* Logo & Kapat Butonu (Mobil) */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center space-x-2.5 group"
          >
            <div className="p-2 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  Vocaship
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium leading-none block">
                {t("nav_subtitle", "SaaS Çalışma Konsolu")}
              </span>
            </div>
          </Link>

          {/* Mobilde Kapatma Çarpısı */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Arama Çubuğu */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("search_placeholder", "Deste veya dal ara...")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-indigo-500/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition shadow-inner"
          />
        </div>

        {/* 3 Temel Menü Linki */}
        <nav className="space-y-1 pt-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  item.isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2. ORTA KISIM: HİYERARŞİK KARAR AĞACI (ACCORDION TREEVIEW) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {/* A) 📁 KİŞİSEL KLASÖRLERİM */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsPersonalFoldersOpen(!isPersonalFoldersOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition text-xs font-extrabold group cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Folder className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>{t("tree_personal_folders", "Kişisel Klasörlerim")}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400">
                {folders.length}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isPersonalFoldersOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </div>
          </button>

          {isPersonalFoldersOpen && (
            <div className="pl-3.5 space-y-0.5 border-l border-slate-800/80 ml-3 pt-1 animate-in fade-in duration-150">
              {/* Tüm Destelerim Kök Dalı */}
              <button
                type="button"
                onClick={() => {
                  onSelectItem({ type: "all_decks" });
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                  selectedItem.type === "all_decks"
                    ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">{t("all_decks", "Tüm Destelerim")}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {deckCount}
                </span>
              </button>

              {/* Kullanıcı Klasörleri */}
              {filteredFolders.map((folder) => {
                const isSelected =
                  selectedItem.type === "folder" && selectedItem.id === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      onSelectItem({
                        type: "folder",
                        id: folder.id,
                        name: folder.name,
                      });
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Folder className="w-3 h-3 text-amber-400/80 shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                  </button>
                );
              })}

              {filteredFolders.length === 0 && folders.length === 0 && (
                <div className="px-2.5 py-1.5 text-[11px] text-slate-500 italic">
                  Henüz klasör oluşturulmadı.
                </div>
              )}
            </div>
          )}
        </div>

        {/* B) 🌳 MESLEKİ UZMANLIK DALLARI (KARAR AĞACI) */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsCareerTreeOpen(!isCareerTreeOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition text-xs font-extrabold group cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>{t("tree_career_branches", "Mesleki Uzmanlık Dalları")}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-800 text-indigo-300">
                11
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isCareerTreeOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </div>
          </button>

          {isCareerTreeOpen && (
            <div className="pl-3.5 space-y-1.5 border-l border-slate-800/80 ml-3 pt-1 animate-in fade-in duration-150">
              {INDUSTRY_TREE_GROUPS.map((group) => {
                const isGroupOpen = !!openGroups[group.id];
                const matchingHubs = group.hubKeys
                  .map((k) => CAREER_HUBS_BY_KEY[k])
                  .filter(Boolean)
                  .filter((hub) =>
                    cleanQuery
                      ? hub.titleDefault.toLowerCase().includes(cleanQuery) ||
                        hub.descDefault.toLowerCase().includes(cleanQuery)
                      : true
                  );

                // Eğer arama yapılmışsa ve bu grupta eşleşen dikey yoksa gösterme
                if (cleanQuery && matchingHubs.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-0.5">
                    {/* Grup Başlığı (Accordion) */}
                    <button
                      type="button"
                      onClick={(e) => toggleGroup(group.id, e)}
                      className="w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-900/60 transition cursor-pointer"
                    >
                      <span className="flex items-center space-x-1.5 truncate">
                        <span>{group.icon}</span>
                        <span className="truncate">{group.name}</span>
                      </span>
                      <ChevronRight
                        className={`w-3 h-3 text-slate-500 transition-transform duration-150 shrink-0 ${
                          isGroupOpen || cleanQuery ? "rotate-90 text-indigo-400" : "rotate-0"
                        }`}
                      />
                    </button>

                    {/* Dikey Alt Dalları (Leaf Nodes) */}
                    {(isGroupOpen || cleanQuery) && (
                      <div className="pl-3 space-y-0.5 border-l border-slate-800/60 ml-2 pt-0.5">
                        {matchingHubs.map((hub) => {
                          const isSelected =
                            selectedItem.type === "hub" && selectedItem.key === hub.key;
                          return (
                            <button
                              key={hub.key}
                              type="button"
                              onClick={() => {
                                onSelectItem({ type: "hub", key: hub.key });
                                onCloseMobile();
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                                isSelected
                                  ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 shadow-sm"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                              }`}
                            >
                              <div className="flex items-center space-x-1.5 truncate">
                                <span className="text-sm shrink-0">{hub.icon}</span>
                                <span className="truncate">{hub.titleDefault}</span>
                              </div>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                                {hub.targetLevel.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. ALTI: "+ YENİ KLASÖR AÇ" BUTONU */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 shrink-0">
        <button
          type="button"
          onClick={() => {
            onOpenCreateFolder();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer group"
        >
          <FolderPlus className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>{t("btn_create_folder_sidebar", "+ Yeni Klasör Aç")}</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Masaüstü Sabit Sidebar (260px) */}
      <div className="hidden md:block shrink-0">
        {sidebarContent}
      </div>

      {/* Mobil Çekmece (Drawer) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
