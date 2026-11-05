"use client";

import React from "react";
import PlatformStandardLayout from "../layout/PlatformStandardLayout";

export interface SpeakingLoungeProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  scorecard: React.ReactNode;
  className?: string;
}

/**
 * SpeakingLounge (PlatformStandardLayout ile 3 Sütunlu Ergonomik Speaking Kabuğu)
 * - Sol Sütun: "📚 Aktif Destemden Sorular", senaryo klasörleri ve arşive erişim (SpeakingSidebar)
 * - Orta Sütun: Diyalog akışı, neon dalga formu, mikrofon (SpeakingCenterStage)
 * - Sağ Sütun: Maskot başlıklı Adaptif Karne & CEFR Değerlendirmesi (SpeakingScorecard)
 */
export default function SpeakingLounge({
  sidebar,
  children,
  scorecard,
  className = "",
}: SpeakingLoungeProps) {
  return (
    <PlatformStandardLayout
      leftSidebar={sidebar}
      rightSidebar={scorecard}
      className={className}
      maxWidthClass="max-w-[1720px]"
    >
      {children}
    </PlatformStandardLayout>
  );
}

