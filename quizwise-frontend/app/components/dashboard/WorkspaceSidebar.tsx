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
  GraduationCap,
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
    title: "Kurumsal Finans",
    icon: "📈",
    hubKey: "finance_accounting",
    subItems: [
      { id: "fin_audit", title: "Finansal Raporlama & Denetim", hubKey: "finance_accounting", badge: "IFRS" },
      { id: "tech_exec", title: "Teknoloji Yöneticiliği & FinTech", hubKey: "tech_executive", badge: "Tech" },
    ],
  },
  {
    id: "legal",
    title: "Hukuk",
    icon: "⚖️",
    hubKey: "legal_contracts",
    subItems: [
      { id: "arbitration", title: "Ticari Sözleşmeler & Tahkim", hubKey: "legal_contracts", badge: "Contracts" },
      { id: "medical", title: "Tıp & Sağlık Bilimleri", hubKey: "medical_health", badge: "Clinical" },
    ],
  },
  {
    id: "academic",
    title: "Sınav Hazırlık",
    icon: "🎓",
    hubKey: "yds_yokdil",
    subItems: [
      { id: "yds", title: "YDS / YÖKDİL Kritik 500 Kelime", hubKey: "yds_yokdil", badge: "ÖSYM" },
      { id: "ielts", title: "IELTS & TOEFL Akademik C1", hubKey: "ielts_toefl", badge: "C1" },
    ],
  },
];

interface WorkspaceSidebarProps {
  folders: FolderItem[];
  selectedItem: TreeSelection;
  onSelectItem: (item: TreeSelection) => void;
  onOpenCreateFolder: () => void;
  onOpenCreateDeck: () => void;
  deckCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function WorkspaceSidebar({
  folders,
  selectedItem,
  onSelectItem,
  onOpenCreateFolder,
  onOpenCreateDeck,
  deckCount,
  isMobileOpen,
  onCloseMobile,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Akordeon açık/kapalı state'leri
  const [personalFoldersOpen, setPersonalFoldersOpen] = useState(true);
  const [careerBranchesOpen, setCareerBranchesOpen] = useState(true);

  // Hangi mesleki kategori grubunun açık olduğu (varsayılan: project_controls açık)
  const [openGroupIds, setOpenGroupIds] = useState<Record<string, boolean>>({
    project_controls: true,
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const navLinks = [
    {
      name: "Giriş Sayfası",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Okuma Odası",
      href: "/reading",
      icon: BookOpen,
      isActive: pathname.startsWith("/reading"),
    },
    {
      name: "Konuşma Odası",
      href: "/speaking",
      icon: Mic,
      isActive: pathname.startsWith("/speaking"),
    },
    {
      name: "Oyun Arenası",
      href: "/games",
      icon: Gamepad2,
      isActive: pathname.startsWith("/games"),
    },
    {
      name: "Sınıf Portalı",
      href: "/classroom",
      icon: GraduationCap,
      isActive: pathname.startsWith("/classroom"),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 select-none">
      {/* 1. Üst Alan: Vocaship Logo & Marka */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              Vocaship
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Çalışma Konsolu
            </span>
          </div>
        </Link>

        {/* Mobil Kapat Butonu */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Menüyü Kapat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Temel Gezinme Linkleri */}
      <div className="px-3 pt-3 pb-2 space-y-1 border-b border-slate-800/80 shrink-0">
        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Gezinme
        </span>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                link.isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${link.isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 3. Kaydırılabilir Karar Ağacı Bölümü */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {/* A) "📁 Kişisel Klasörlerim" Bölümü */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setPersonalFoldersOpen(!personalFoldersOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition rounded-lg hover:bg-slate-900/60"
          >
            <span className="flex items-center space-x-1.5">
              <span>📁</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                Kişisel Klasörlerim
              </span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                personalFoldersOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>

          {personalFoldersOpen && (
            <div className="pl-2 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-200">
              {/* Tüm Desteler Linki */}
              <button
                type="button"
                onClick={() => {
                  onSelectItem({ type: "all_decks" });
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedItem.type === "all_decks"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">Tüm Destelerim</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {deckCount}
                </span>
              </button>

              {/* Kullanıcı Klasörleri */}
              {folders.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-slate-400 italic">
                  Henüz klasör oluşturulmadı.
                </div>
              ) : (
                folders.map((folder) => {
                  const isSelected =
                    selectedItem.type === "folder" && selectedItem.id === folder.id;
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => {
                        onSelectItem({ type: "folder", id: folder.id, name: folder.name });
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* B) "🌳 Mesleki Uzmanlık Dalları" Akordeon Ağacı */}
        <div className="space-y-1.5 pt-1">
          <button
            type="button"
            onClick={() => setCareerBranchesOpen(!careerBranchesOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition rounded-lg hover:bg-slate-900/60"
          >
            <span className="flex items-center space-x-1.5">
              <span>🌳</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                Mesleki Uzmanlık Dalları
              </span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                careerBranchesOpen ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>

          {careerBranchesOpen && (
            <div className="space-y-1 pl-1 animate-in slide-in-from-top-1 fade-in duration-200">
              {CAREER_DECISION_TREE.map((group) => {
                const isGroupOpen = !!openGroupIds[group.id];
                const isCurrentHubInGroup =
                  selectedItem.type === "hub" &&
                  group.subItems.some((s) => s.hubKey === selectedItem.key);

                return (
                  <div
                    key={group.id}
                    className="rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-hidden"
                  >
                    {/* Grup Başlığı (Tıklanabilir Akordeon Tetikleyici) */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition ${
                        isCurrentHubInGroup
                          ? "text-indigo-300 bg-indigo-950/20"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span>{group.icon}</span>
                        <span className="truncate">{group.title}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isGroupOpen ? "rotate-90 text-indigo-400" : "rotate-0"
                        }`}
                      />
                    </button>

                    {/* Grup Alt Dalları (Hiyerarşik Kırılımlar) */}
                    {isGroupOpen && (
                      <div className="py-1 px-1.5 space-y-0.5 bg-slate-950/50 border-t border-slate-800/50">
                        {group.subItems.map((sub) => {
                          const isSubSelected =
                            selectedItem.type === "hub" && selectedItem.key === sub.hubKey;

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                onSelectItem({
                                  type: "hub",
                                  key: sub.hubKey,
                                  subTitle: sub.title,
                                });
                                onCloseMobile();
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition text-left ${
                                isSubSelected
                                  ? "bg-indigo-600/25 text-white font-bold border border-indigo-500/40 shadow-sm"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center space-x-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 shrink-0" />
                                <span className="truncate">{sub.title}</span>
                              </div>
                              {sub.badge && (
                                <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                                  {sub.badge}
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

      {/* 4. Alt Alan: Hızlı Aksiyon Butonları (+ Yeni Klasör & + Yeni Deste) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 space-y-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            onOpenCreateDeck();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
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
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold active:scale-95 transition cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>+ Yeni Klasör</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Masaüstü Sabit 260px Panel */}
      <aside className="hidden md:flex w-[260px] shrink-0 border-r border-slate-800/80 bg-slate-950 flex-col h-screen sticky top-0 overflow-hidden z-20">
        {sidebarContent}
      </aside>

      {/* Mobil Kayar Çekmece */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
