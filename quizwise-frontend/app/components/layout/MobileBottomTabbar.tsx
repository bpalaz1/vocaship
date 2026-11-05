"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Mic, Gamepad2, GraduationCap, Layers } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive: (pathname: string) => boolean;
}

export const DEFAULT_TABS: TabItem[] = [
  {
    id: "study",
    label: "Desteler",
    href: "/study",
    icon: <Layers className="w-5 h-5" />,
    isActive: (path) => path.startsWith("/study") || path === "/",
  },
  {
    id: "reading",
    label: "Okuma",
    href: "/reading",
    icon: <BookOpen className="w-5 h-5" />,
    isActive: (path) => path.startsWith("/reading"),
  },
  {
    id: "speaking",
    label: "Speaking",
    href: "/speaking",
    icon: <Mic className="w-5 h-5" />,
    isActive: (path) => path.startsWith("/speaking"),
  },
  {
    id: "games",
    label: "Oyunlar",
    href: "/games",
    icon: <Gamepad2 className="w-5 h-5" />,
    isActive: (path) => path.startsWith("/games"),
  },
  {
    id: "classroom",
    label: "Sınıfım",
    href: "/classroom",
    icon: <GraduationCap className="w-5 h-5" />,
    isActive: (path) => path.startsWith("/classroom"),
  },
];

export default function MobileBottomTabbar({
  tabs = DEFAULT_TABS,
}: {
  tabs?: TabItem[];
}) {
  const pathname = usePathname() || "";

  return (
    <nav
      data-testid="mobile-bottom-tabbar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-2 sm:px-4 py-1.5 flex justify-around items-center lg:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.6)]"
      style={{ paddingBottom: "calc(0.4rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Mobil Alt Navigasyon"
    >
      {tabs.map((tab) => {
        const active = tab.isActive(pathname);

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 select-none relative group ${
              active
                ? "text-indigo-400 font-bold scale-105"
                : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            {/* Aktif İkon ve Arka Plan Parıltısı */}
            <div className="relative flex items-center justify-center">
              {active && (
                <div className="absolute -inset-1.5 rounded-full bg-indigo-500/20 blur-sm pointer-events-none" />
              )}
              <span className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                {tab.icon}
              </span>
            </div>

            {/* Metin Etiketi */}
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
              {tab.label}
            </span>

            {/* Aktif Gösterge Noktası */}
            {active && (
              <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5 shadow-sm shadow-indigo-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

