"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
  isTrackReference,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  ChevronDown,
  ChevronUp,
  PictureInPicture2,
  Monitor,
  Video,
  Users,
  MicOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { API_BASE } from "../../config";
import { getAuthToken } from "../../context/AuthContext";

export interface LiveKitClassroomStageProps {
  classId: string;
  userId?: string;
  userName?: string;
  role?: "teacher" | "student";
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenShareEnabled: boolean;
  onParticipantsCountChange?: (count: number) => void;
  onScreenShareStopped?: () => void;
}

function LiveKitStageInner({
  role,
  isCameraEnabled,
  isMicEnabled,
  isScreenShareEnabled,
  onParticipantsCountChange,
  onScreenShareStopped,
}: {
  role: "teacher" | "student";
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
  isScreenShareEnabled: boolean;
  onParticipantsCountChange?: (count: number) => void;
  onScreenShareStopped?: () => void;
}) {
  const [stripCollapsed, setStripCollapsed] = useState(false);
  const [screenExpanded, setScreenExpanded] = useState(true);
  const [pipActive, setPipActive] = useState(false);
  const stripContainerRef = useRef<HTMLDivElement | null>(null);
  const { localParticipant } = useLocalParticipant();

  const screenTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const participants = useParticipants();

  useEffect(() => {
    onParticipantsCountChange?.(participants.length);
  }, [participants.length, onParticipantsCountChange]);

  // Öğretmen ekran paylaşımını LiveKit üzerinden yayınla / durdur
  useEffect(() => {
    if (role !== "teacher" || !localParticipant) return;
    let cancelled = false;

    const syncScreenShare = async () => {
      try {
        const currentlyEnabled = localParticipant.isScreenShareEnabled;
        if (isScreenShareEnabled !== currentlyEnabled) {
          await localParticipant.setScreenShareEnabled(isScreenShareEnabled);
        }
      } catch (err) {
        if (!cancelled && isScreenShareEnabled) {
          console.warn("[LiveKit] Ekran paylaşımı başlatılamadı/iptal edildi:", err);
          onScreenShareStopped?.();
        }
      }
    };

    syncScreenShare();
    return () => {
      cancelled = true;
    };
  }, [role, localParticipant, isScreenShareEnabled, onScreenShareStopped]);

  const activeScreenTrack = screenTracks.find(isTrackReference);

  // Öğrenci veya öğretmen tarafında aktif ekran paylaşımı algılandığında sahneyi otomatik aç
  useEffect(() => {
    if (activeScreenTrack) {
      setScreenExpanded(true);
    }
  }, [activeScreenTrack]);

  // Sağ alt video şeridi:
  // - Kamerası kapalı olan öğrencilerin boş gri kutularını gizle
  // - Öğretmenin kamerasını her zaman en başta ve büyük göster
  const visibleCameraTracks = useMemo(() => {
    const isTeacherParticipant = (p: any) => {
      const idStr = String(p?.identity || "").toLowerCase();
      const nameStr = String(p?.name || "").toLowerCase();
      return (
        idStr.startsWith("teacher") ||
        nameStr.includes("eğitmen") ||
        nameStr.includes("öğretmen") ||
        (role === "teacher" && p?.isLocal)
      );
    };

    const filtered = cameraTracks.filter((trackRef) => {
      const isValidVideo =
        isTrackReference(trackRef) && !trackRef.publication.isMuted;
      if (isTeacherParticipant(trackRef.participant)) {
        // Öğretmenin kamerası açıksa veya kendisiyse göster
        return isValidVideo || (role === "teacher" && isCameraEnabled && trackRef.participant.isLocal);
      }
      // Öğrencilerde kamerası kapalı olan boş gri kutuları gizle
      return isValidVideo;
    });

    return filtered.sort((a, b) => {
      const aTeacher = isTeacherParticipant(a.participant) ? 0 : 1;
      const bTeacher = isTeacherParticipant(b.participant) ? 0 : 1;
      return aTeacher - bTeacher;
    });
  }, [cameraTracks, role, isCameraEnabled]);

  const handleToggleDesktopPip = useCallback(async () => {
    if (typeof window === "undefined") return;
    const dPip = (window as any).documentPictureInPicture;
    if (dPip && typeof dPip.requestWindow === "function") {
      try {
        const pipWindow: Window = await dPip.requestWindow({
          width: 340,
          height: 220,
        });
        setPipActive(true);
        pipWindow.document.body.style.margin = "0";
        pipWindow.document.body.style.background = "#0f172a";
        pipWindow.document.body.style.color = "#f8fafc";
        pipWindow.document.body.style.fontFamily = "system-ui, sans-serif";
        pipWindow.document.body.innerHTML = `
          <div style="padding:16px;display:flex;flex-direction:column;gap:10px;">
            <div style="font-size:13px;font-weight:700;color:#a5b4fc;">VocaShip Canlı Sınıf (Mini Pencere)</div>
            <div style="font-size:12px;color:#cbd5e1;">Aktif Katılımcı: ${participants.length}</div>
            <div style="font-size:11px;color:#94a3b8;">Kamera: ${isCameraEnabled ? "Açık" : "Kapalı"} • Mikrofon: ${isMicEnabled ? "Açık" : "Kapalı"}</div>
          </div>
        `;
        pipWindow.addEventListener("pagehide", () => setPipActive(false));
        return;
      } catch {
        setPipActive(false);
      }
    }

    const videoEl = stripContainerRef.current?.querySelector("video");
    if (videoEl && typeof (videoEl as any).requestPictureInPicture === "function") {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setPipActive(false);
        } else {
          await (videoEl as any).requestPictureInPicture();
          setPipActive(true);
        }
      } catch {}
    }
  }, [participants.length, isCameraEnabled, isMicEnabled]);

  return (
    <>
      <RoomAudioRenderer />

      {/* Orta Sahne: Canlı Ekran Paylaşımı (Otomatik Tam Ekran) */}
      {activeScreenTrack && screenExpanded && (
        <div className="fixed inset-x-0 top-16 bottom-24 z-30 pointer-events-none flex items-center justify-center px-3 sm:px-6">
          <div className="pointer-events-auto relative w-full h-full max-w-6xl rounded-2xl overflow-hidden border border-indigo-500/40 bg-slate-950 shadow-2xl flex items-center justify-center">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600/90 text-white text-[11px] font-bold shadow">
              <Monitor className="w-3.5 h-3.5" />
              <span>Canlı Ekran Paylaşımı</span>
            </div>
            <button
              type="button"
              onClick={() => setScreenExpanded(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
              title="Ekran paylaşımını küçült"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <VideoTrack
              trackRef={activeScreenTrack}
              className="w-full h-full object-contain bg-black"
            />
          </div>
        </div>
      )}

      {activeScreenTrack && !screenExpanded && (
        <button
          type="button"
          onClick={() => setScreenExpanded(true)}
          className="fixed top-20 right-6 z-40 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Ekran Paylaşımını Göster</span>
        </button>
      )}

      {/* Sağ Alt Köşe: Teams Tarzı Daraltılabilir Yüzen Katılımcı Video Şeridi */}
      <div
        ref={stripContainerRef}
        className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-xl backdrop-blur-md text-xs text-slate-200">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">Katılımcılar ({participants.length || 1})</span>
          <button
            type="button"
            onClick={handleToggleDesktopPip}
            className={`p-1 rounded-lg transition cursor-pointer ${
              pipActive
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Masaüstü Mini Pencere (PiP)"
          >
            <PictureInPicture2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setStripCollapsed((prev) => !prev)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={stripCollapsed ? "Video şeridini aç" : "Video şeridini daralt"}
          >
            {stripCollapsed ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {!stripCollapsed && visibleCameraTracks.length > 0 && (
          <div className="flex flex-wrap items-end justify-end gap-2 max-w-[360px] sm:max-w-[560px]">
            {visibleCameraTracks.map((trackRef, idx) => {
              const p = trackRef.participant;
              const isValidVideoTrack =
                isTrackReference(trackRef) && !trackRef.publication.isMuted;
              const displayName = p.name || p.identity || "Katılımcı";
              const isMutedAudio = !p.isMicrophoneEnabled;
              const isTeacherTile =
                idx === 0 &&
                (String(p.identity || "").toLowerCase().startsWith("teacher") ||
                  String(p.name || "").toLowerCase().includes("eğitmen") ||
                  (role === "teacher" && p.isLocal));

              return (
                <div
                  key={`${p.identity}-${trackRef.source}`}
                  className={`${
                    isTeacherTile ? "w-52 h-36 border-indigo-500/60" : "w-36 h-24 border-slate-700/80"
                  } rounded-xl overflow-hidden border bg-slate-900/95 shadow-2xl relative flex items-center justify-center`}
                >
                  {isValidVideoTrack ? (
                    <VideoTrack
                      trackRef={trackRef}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-200 font-bold text-sm">
                        {displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <Video className="w-3 h-3 opacity-50" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between gap-1 text-[10px] font-semibold text-white">
                    <span className="truncate">{displayName}</span>
                    {isMutedAudio && (
                      <MicOff className="w-3 h-3 text-rose-400 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default function LiveKitClassroomStage({
  classId,
  userId,
  userName,
  role = "student",
  isMicEnabled,
  isCameraEnabled,
  isScreenShareEnabled,
  onParticipantsCountChange,
  onScreenShareStopped,
}: LiveKitClassroomStageProps) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>(
    process.env.NEXT_PUBLIC_LIVEKIT_URL || ""
  );

  const stableIdentity = useMemo(
    () => (userId ? `${role}-${userId}` : `${role}-${classId}`),
    [userId, role, classId]
  );

  useEffect(() => {
    if (!classId) return;
    let active = true;

    const fetchToken = async () => {
      try {
        const authToken = getAuthToken();
        const res = await fetch(
          `${API_BASE}/api/v1/classroom/classes/${encodeURIComponent(classId)}/livekit-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              identity: stableIdentity,
              name: userName || (role === "teacher" ? "Eğitmen" : "Öğrenci"),
              role,
            }),
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.token) {
          setToken(data.token);
          if (data.server_url) setServerUrl(data.server_url);
        }
      } catch {}
    };

    fetchToken();
    return () => {
      active = false;
    };
  }, [classId, stableIdentity, userName, role]);

  if (!token || !serverUrl) {
    return null;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={isMicEnabled}
      video={isCameraEnabled}
      data-lk-theme="default"
    >
      <LiveKitStageInner
        role={role}
        isCameraEnabled={isCameraEnabled}
        isMicEnabled={isMicEnabled}
        isScreenShareEnabled={isScreenShareEnabled}
        onParticipantsCountChange={onParticipantsCountChange}
        onScreenShareStopped={onScreenShareStopped}
      />
    </LiveKitRoom>
  );
}
