"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBoard = pathname?.startsWith("/classroom/board");

  return (
    <div
      className={`flex-1 flex flex-col overflow-x-hidden w-full max-w-[100vw] ${
        isBoard ? "pt-0 h-screen overflow-hidden" : "pt-16 min-h-[calc(100vh-64px)]"
      }`}
    >
      {children}
    </div>
  );
}

