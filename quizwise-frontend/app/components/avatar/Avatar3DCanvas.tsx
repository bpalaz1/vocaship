"use client";

import React from "react";
import AvatarDisplay, { AvatarAnimationState } from "./AvatarDisplay";

export type Avatar3DState = AvatarAnimationState;

export interface Avatar3DCanvasProps {
  personaId?: string;
  personaName?: string;
  personaTitle?: string;
  avatarState: Avatar3DState;
  modelUrl?: string;
  fallbackPortraitUrl?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Video Loop Avatar Engine uyumluluk sarmalayıcısı (Three.js ve 2D SVG çizimleri kaldırıldı)
 */
export default function Avatar3DCanvas({
  personaId,
  avatarState,
  className = "",
  onClick,
}: Avatar3DCanvasProps) {
  return (
    <AvatarDisplay
      personaId={personaId}
      avatarState={avatarState}
      showBadges={false}
      className={className}
      onClick={onClick}
    />
  );
}
