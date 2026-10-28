"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Home,
  BookOpen,
  Mic,
  Gamepad2,
  Folder,
  FolderPlus,
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  X,
  GraduationCap
} from "lucide-react";
import { CareerHubKey, ALL_CAREER_HUBS, CAREER_HUBS_BY_KEY } from "../../data/careerHubs";
import { useTranslation } from "../../context/LanguageContext";

export interface FolderItem {
  id: string;
  name: string;
}

export type TreeSelection =
  | { type: "all_decks" }
  | { type: "folder"; id: string; name: string }
  | { type: "hub"; key: CareerHubKey; subTitle?: string };

export interface CareerBranchSubItem {
  id: string;
  title: string;
  hubKey: CareerHubKey;
  badge?: string;
}

export interface CareerCategoryGroup {
  id: string;
  title: string;
  icon: string;
  hubKey: CareerHubKey;
  subItems: CareerBranchSubItem[];
}

export const CAREER_DECISION_TREE: CareerCategoryGroup[] = [
  {
    id: "project_controls",
    title: "Proje Kontrol & Yönetim",
    icon: "📊",
    hubKey: "project_controls",
    subItems: [
      { id: "evm", title: "EVM & Maliyet Varyansı", hubKey: "project_controls", badge: "EVM" },
      { id: "p6", title: "Primavera P6 & Çizelgeleme", hubKey: "project_controls", badge: "P6" },
      { id: "delay", title: "Delay Claims & Gecikme Analizi", hubKey: "project_controls", badge: "FIDIC" },
      { id: "pmp", title: "PMP & Çevik Proje Yönetimi", hubKey: "project_management", badge: "Agile" },
    ],
  },
  {
    id: "engineering",
    title: "Mühendislik [İnşaat / FIDIC]",
    icon: "🏗️",
    hubKey: "engineering_civil",
    subItems: [
      { id: "civil", title: "İnşaat & FIDIC Sözleşmeleri", hubKey: "engineering_civil", badge: "FIDIC" },
      { id: "process", title: "Kimya & Proses Mühendisliği", hubKey: "engineering_process_chem", badge: "Process" },
      { id: "mechanical", title: "Makine & İmalat Mühendisliği", hubKey: "engineering_mechanical", badge: "Mechanical" },
    ],
  },
  {
    id: "finance",
    title: "Kurumsal Finans & Bankacılık",
    icon: "📈",
    hubKey: "finance_accounting",
    subItems: [
      { id: "fin_audit", title: "Finansal Raporlama & Denetim", hubKey: "finance_accounting", badge: "IFRS" },
      { id: "tech_exec", title: "Teknoloji Yöneticiliği & FinTech", hubKey: "tech_executive", badge: "Tech" },
    ],
  },
  {
    id: "legal",
    title: "Hukuk & Ticari Sözleşmeler",
    icon: "⚖️",
    hubKey: "legal_contracts",
    subItems: [
      { id: "arbitration", title: "Ticari Sözleşmeler & Tahkim", hubKey: "legal_contracts", badge: "Contracts" },
      { id: "medical", title: "Tıp & Sağlık Bilimleri", hubKey: "medical_health", badge: "Clinical" },
    ],
  },
  {
    id: "academic",
    title: "Akademik Sınavlar [YDS / IELTS]",
    icon: "🎓",
    hubKey: "yds_yokdil",
    subItems: [
      { id: "yds", title: "YDS / YÖKDİL Kritik 500 Kelime", hubKey: "yds_yokdil", badge: "ÖSYM" },
      { id: "ielts", title: "IELTS & TOEFL Akademik C1", hubKey: "ielts_toefl", badge: "C1" },
    ],
  },
];

interface DecisionTreeSidebarProps {
  folders: FolderItem[];
  selectedItem: TreeSelection;
  onSelectItem: (item: TreeSelection) => void;
  onOpenCreateFolder: () => void;
  onOpenCreateDeck: () => void;
  deckCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function DecisionTreeSidebar({
  folders,
  selectedItem,
  onSelectItem,
  onOpenCreateFolder,
  onOpenCreateDeck,
  deckCount,
  isMobileOpen,
  onCloseMobile,
}: DecisionTreeSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Akordeon durumları
  const [isPersonalFoldersOpen, setIsPersonalFoldersOpen] = useState(true);
  const [isCareerTreeOpen, setIsCareerTreeOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    project_controls: true,
    engineering: false,
    finance: false,
    legal: false,
    academic: false,
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
      name: t("nav_home", "Giriş Sayfası"),
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: t("nav_reading", "Okuma Odası"),
      href: "/reading",
      icon: BookOpen,
      isActive: pathname.startsWith("/reading"),
    },
    {
      name: t("nav_speaking", "Speaking Lounge"),
      href: "/speaking",
      icon: Mic,
      isActive: pathname.startsWith("/speaking"),
    },
    {
      name: t("nav_games", "Oyun Arenası"),
      href: "/games",
      icon: Gamepad2,
      isActive: pathname.startsWith("/games"),
    },
  ];

  const sidebarContent = (
    <aside className="w-[260px] min-w-[260px] max-w-[260px] h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl overflow-hidden select-none z-30">
      {/* 1. ÜST ALAN: LOGO VE 4 TEMEL LİNK */}
      <div className="p-4 border-b border-slate-800/80 space-y-3 shrink-0">
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
                {t("nav_subtitle", "Karar Ağacı Dashboard")}
              </span>
            </div>
          </Link>

          {/* Mobilde Kapatma Butonu */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Temel Link */}
        <nav className="space-y-0.5 pt-1">
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
                    : "text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2. KARAR AĞACI BÖLÜMÜ (HIERARCHICAL ACCORDION TREE) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {/* A) 📁 KİŞİSEL KLASÖRLERİM */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsPersonalFoldersOpen(!isPersonalFoldersOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition text-xs font-extrabold group cursor-pointer"
          >
            <div className="flex items-center space-x-2 truncate">
              <Folder className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">{t("tree_personal_folders", "Kişisel Klasörlerim")}</span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
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
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
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
              {folders.map((folder) => {
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
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Folder className="w-3 h-3 text-amber-400/80 shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                  </button>
                );
              })}

              {folders.length === 0 && (
                <div className="px-2.5 py-1.5 text-[11px] text-slate-500 italic">
                  Henüz klasör açılmadı.
                </div>
              )}
            </div>
          )}
        </div>

        {/* B) 🌳 MESLEKİ UZMANLIK DALLARI (AKORDEON AĞAÇ) */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setIsCareerTreeOpen(!isCareerTreeOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition text-xs font-extrabold group cursor-pointer"
          >
            <div className="flex items-center space-x-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">{t("tree_career_branches", "Mesleki Uzmanlık Dalları")}</span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
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
              {CAREER_DECISION_TREE.map((category) => {
                const isGroupOpen = !!openGroups[category.id];
                return (
                  <div key={category.id} className="space-y-0.5">
                    {/* Grup Başlığı */}
                    <button
                      type="button"
                      onClick={(e) => toggleGroup(category.id, e)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-900/60 transition cursor-pointer"
                    >
                      <span className="flex items-center space-x-1.5 truncate">
                        <span>{category.icon}</span>
                        <span className="truncate">{category.title}</span>
                      </span>
                      <ChevronRight
                        className={`w-3 h-3 text-slate-500 transition-transform duration-150 shrink-0 ${
                          isGroupOpen ? "rotate-90 text-indigo-400" : "rotate-0"
                        }`}
                      />
                    </button>

                    {/* Alt Kırılımlar (Sub-items) */}
                    {isGroupOpen && (
                      <div className="pl-3 space-y-0.5 border-l border-slate-800/60 ml-2 pt-0.5 animate-in fade-in duration-150">
                        {category.subItems.map((subItem) => {
                          const isSelected =
                            selectedItem.type === "hub" &&
                            selectedItem.key === subItem.hubKey &&
                            selectedItem.subTitle === subItem.title;

                          return (
                            <button
                              key={subItem.id}
                              type="button"
                              onClick={() => {
                                onSelectItem({
                                  type: "hub",
                                  key: subItem.hubKey,
                                  subTitle: subItem.title,
                                });
                                onCloseMobile();
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                                isSelected
                                  ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 shadow-sm"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                              }`}
                            >
                              <span className="truncate pr-1">{subItem.title}</span>
                              {subItem.badge && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                                  {subItem.badge}
                                </span>
                              )}
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

      {/* 3. ALT ALAN: `+ YENİ KLASÖR` VE `+ YENİ DESTE` BUTONLARI */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 space-y-1.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            onOpenCreateDeck();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Yeni Deste</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenCreateFolder();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white font-bold text-xs transition active:scale-95 cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
          <span>+ Yeni Klasör</span>
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

      {/* Mobil Drawer (Ekran < md) */}
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
