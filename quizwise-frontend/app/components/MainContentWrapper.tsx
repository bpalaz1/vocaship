"use client";

import React from "react";
import { usePathname } from "next/navigation";
import MobileBottomTabbar from "./layout/MobileBottomTabbar";

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBoard = pathname?.startsWith("/classroom/board");
  const hideTabbar =
    isBoard || pathname?.startsWith("/landing") || pathname?.startsWith("/join");

  return (
    <>
      <div
        className={`flex-1 flex flex-col overflow-x-hidden w-full max-w-[100vw] ${
          isBoard
            ? "pt-0 h-screen overflow-hidden"
            : `pt-16 min-h-[calc(100vh-64px)] ${hideTabbar ? "" : "pb-24 md:pb-0"}`
        }`}
      >
        {children}
      </div>
      {!hideTabbar && <MobileBottomTabbar />}
    </>
  );
}

