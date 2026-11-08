"use client";

import React, { Component, ErrorInfo, ReactNode, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Loader2 } from "lucide-react";
import { AvatarAnimationState } from "./AvatarDisplay";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SafeWebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("RPMSafe3DStage ErrorBoundary caught WebGL/Three error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

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

interface AnimatedGLTFModelProps {
  scene: THREE.Group;
  avatarState: AvatarAnimationState;
}

function AnimatedGLTFModel({ scene, avatarState }: AnimatedGLTFModelProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const morphMeshesRef = useRef<THREE.SkinnedMesh[]>([]);
  const headBoneRef = useRef<THREE.Object3D | null>(null);
  const neckBoneRef = useRef<THREE.Object3D | null>(null);
  const jawBoneRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const meshes: THREE.SkinnedMesh[] = [];
    scene.traverse((obj: any) => {
      if (obj.isSkinnedMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        meshes.push(obj as THREE.SkinnedMesh);
      }
      if (obj.isBone) {
        const boneName = (obj.name || "").toLowerCase();
        if (boneName.includes("head") && !headBoneRef.current) {
          headBoneRef.current = obj;
        } else if (boneName.includes("neck") && !neckBoneRef.current) {
          neckBoneRef.current = obj;
        } else if ((boneName.includes("jaw") || boneName.includes("teeth")) && !jawBoneRef.current) {
          jawBoneRef.current = obj;
        }
      }
    });
    morphMeshesRef.current = meshes;
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const isSpeaking = avatarState === "speaking";
    const isListening = avatarState === "listening";

    // 1. Yüz Morph Hedefleri (Lip-Sync & Göz Kırpma)
    const mouthTargets = ["mouthOpen", "jawOpen", "viseme_aa", "viseme_O", "viseme_E"];
    const smileTargets = ["mouthSmile", "mouthSmileLeft", "mouthSmileRight"];
    const blinkTargets = ["eyeBlinkLeft", "eyeBlinkRight", "eyesClosed"];

    // Konuşma esnasında sinüs dalgalarıyla doğal ağız açılıp kapanması (0.08 - 0.68)
    const rawSpeechWave =
      Math.abs(Math.sin(t * 13.5)) * 0.42 +
      Math.abs(Math.cos(t * 21.0)) * 0.22;
    const targetMouthOpen = isSpeaking ? Math.min(0.68, Math.max(0.08, rawSpeechWave)) : 0;

    // 3.5 saniyede bir doğal göz kırpma
    const blinkCycle = t % 3.6;
    const targetBlink = blinkCycle > 3.42 && blinkCycle < 3.58 ? 0.95 : 0;

    for (const mesh of morphMeshesRef.current) {
      const dict = mesh.morphTargetDictionary;
      const inf = mesh.morphTargetInfluences;
      if (!dict || !inf) continue;

      for (const mName of mouthTargets) {
        const idx = dict[mName];
        if (idx !== undefined) {
          const factor = mName === "viseme_O" ? 0.55 : mName === "viseme_E" ? 0.4 : 1.0;
          inf[idx] = THREE.MathUtils.lerp(inf[idx] || 0, targetMouthOpen * factor, 0.35);
        }
      }

      for (const sName of smileTargets) {
        const idx = dict[sName];
        if (idx !== undefined) {
          inf[idx] = THREE.MathUtils.lerp(inf[idx] || 0, isSpeaking ? 0.22 : 0.15, 0.15);
        }
      }

      for (const bName of blinkTargets) {
        const idx = dict[bName];
        if (idx !== undefined) {
          inf[idx] = THREE.MathUtils.lerp(inf[idx] || 0, targetBlink, 0.45);
        }
      }
    }

    // 2. Kafa / Boyun / Çene Kemiği Canlı Konuşma ve Nefes Salınımı
    if (headBoneRef.current) {
      const targetRotX = isSpeaking
        ? Math.sin(t * 6.5) * 0.045
        : isListening
        ? 0.03
        : Math.sin(t * 1.5) * 0.015;
      const targetRotY = isSpeaking
        ? Math.cos(t * 4.2) * 0.055
        : Math.sin(t * 0.9) * 0.025;
      headBoneRef.current.rotation.x = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.x,
        targetRotX,
        0.18
      );
      headBoneRef.current.rotation.y = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.y,
        targetRotY,
        0.18
      );
    }

    if (jawBoneRef.current) {
      const jawRotX = isSpeaking ? targetMouthOpen * 0.25 : 0;
      jawBoneRef.current.rotation.x = THREE.MathUtils.lerp(
        jawBoneRef.current.rotation.x,
        jawRotX,
        0.35
      );
    }

    // 3. Gövde Nefes Alma ve Konuşma Mikro-Salınımı
    if (groupRef.current) {
      const baseY = -1.58;
      const breatheOffset = isSpeaking
        ? Math.sin(t * 8.0) * 0.012
        : Math.sin(t * 1.8) * 0.008;
      groupRef.current.position.y = baseY + breatheOffset;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.58, 1.75]} scale={1.78}>
      <primitive object={scene} />
    </group>
  );
}

interface RPMSafe3DStageProps {
  glbUrl: string;
  avatarState: AvatarAnimationState;
  fallbackPortrait: string;
  avatarName: string;
  portraitMotionClass: string;
}

export default function RPMSafe3DStage({
  glbUrl,
  avatarState,
  fallbackPortrait,
  avatarName,
  portraitMotionClass,
}: RPMSafe3DStageProps) {
  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const [portraitImgError, setPortraitImgError] = useState<boolean>(false);

  const rpmPortraitUrl = getRPMPortraitUrlFromGlb(glbUrl, fallbackPortrait);
  const displayPortrait = portraitImgError ? fallbackPortrait : rpmPortraitUrl;

  useEffect(() => {
    let isCancelled = false;
    setIsLoadingModel(true);
    setLoadFailed(false);
    setLoadedScene(null);
    setPortraitImgError(false);

    if (!glbUrl || typeof window === "undefined") {
      setIsLoadingModel(false);
      setLoadFailed(true);
      return;
    }

    // WebGL desteğini kontrol et
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setIsLoadingModel(false);
        setLoadFailed(true);
        return;
      }
    } catch {
      setIsLoadingModel(false);
      setLoadFailed(true);
      return;
    }

    const loader = new GLTFLoader();
    loader.setCrossOrigin("anonymous");

    // 7 saniyelik güvenli zaman aşımı: Ağ yavaşsa çökmeden yedek portreye geçsin
    const timeoutId = setTimeout(() => {
      if (!isCancelled) {
        setIsLoadingModel(false);
        setLoadFailed(true);
      }
    }, 7000);

    loader.load(
      glbUrl,
      (gltf) => {
        clearTimeout(timeoutId);
        if (isCancelled) return;
        if (gltf && gltf.scene) {
          setLoadedScene(gltf.scene);
          setIsLoadingModel(false);
          setLoadFailed(false);
        } else {
          setIsLoadingModel(false);
          setLoadFailed(true);
        }
      },
      undefined,
      (err) => {
        clearTimeout(timeoutId);
        if (isCancelled) return;
        console.warn("RPMSafe3DStage GLB load fallback triggered (safe):", err);
        setIsLoadingModel(false);
        setLoadFailed(true);
      }
    );

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [glbUrl]);

  const fallbackPortraitView = (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
      <img
        src={displayPortrait}
        alt={avatarName}
        onError={() => setPortraitImgError(true)}
        className={`w-full h-full object-cover select-none relative z-10 origin-bottom transition-transform duration-150 ease-in-out ${portraitMotionClass}`}
      />
      {isLoadingModel && (
        <div
          data-testid="rpm-3d-loading-indicator"
          className="absolute inset-x-3 bottom-11 py-1.5 px-3 rounded-xl bg-slate-950/85 border border-emerald-500/40 backdrop-blur-md flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-300 z-30 shadow-lg"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
          <span>3D Avatar Hazırlanıyor...</span>
        </div>
      )}
    </div>
  );

  if (loadFailed || !loadedScene) {
    return fallbackPortraitView;
  }

  return (
    <SafeWebGLErrorBoundary fallback={fallbackPortraitView}>
      <div
        data-testid="rpm-3d-webgl-canvas"
        className="w-full h-full relative z-10 bg-gradient-to-b from-slate-800/90 via-slate-900 to-slate-950"
      >
        <Canvas
          camera={{ position: [0, 0.12, 2.35], fov: 28 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[0, 2, 5]} intensity={1.5} />
          <directionalLight position={[-2, 1, 2]} intensity={0.6} color="#34d399" />
          <AnimatedGLTFModel scene={loadedScene} avatarState={avatarState} />
        </Canvas>
      </div>
    </SafeWebGLErrorBoundary>
  );
}

