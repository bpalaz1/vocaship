"use client";

import React, { useState } from "react";
import { AvatarAnimationState } from "./AvatarDisplay";

/**
 * Ready Player Me .glb URL'sinden resmi 3D yarı-gövde PNG render URL'si üretir.
 */
export function getRPMPortraitUrlFromGlb(glbUrl: string, fallbackPortrait: string): string {
  if (!glbUrl) return fallbackPortrait;
  if (glbUrl.includes("models.readyplayer.me/")) {
    const base = glbUrl.split("?")[0];
    if (base.endsWith(".glb")) {
      return base.replace(/\.glb$/, ".png?scene=halfbody-portrait-v1-transparent");
    }
  }
  return fallbackPortrait;
}

interface RPMSafe3DStageProps {
  glbUrl?: string;
  avatarState?: AvatarAnimationState;
  fallbackPortrait?: string;
  avatarName?: string;
  className?: string;
}

/**
 * Saf 2D Portre Sahnesi:
 * Three.js, WebGL canvas ve .glb yükleyicileri devreden çıkarılmış;
 * sıfır CPU/GPU yüküyle doğrudan optimize 2D portre görüntüler.
 */
export default function RPMSafe3DStage({
  fallbackPortrait = "/avatars/leo.png",
  avatarName = "Mentor",
  className = "",
}: RPMSafe3DStageProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 overflow-hidden ${className}`}>
      <img
        src={imgError ? "/avatars/sparky.png" : fallbackPortrait}
        alt={avatarName}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover select-none relative z-10 origin-bottom"
      />
    </div>
  );
}
