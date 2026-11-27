"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  isTrackReference,
} from "@livekit/components-react";
import { RoomEvent, Track, type RoomOptions } from "livekit-client";
import {
  ChevronDown,
  ChevronUp,
  Monitor,
  MonitorUp,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Pin,
  PinOff,
  LayoutGrid,
  UserCheck,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { API_BASE } from "../../config";
import { getAuthToken } from "../../context/AuthContext";

export interface LiveKitBoardContextValue {
  isConnected: boolean;
  roomName: string;
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenShareEnabled: boolean;
  participantsCount: number;
  mediaError: string | null;
  toggleMicrophone: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  publishBoardData: (payload: Record<string, any>, options?: { reliable?: boolean }) => Promise<void>;
  subscribeBoardData: (listener: (payload: any) => void) => () => void;
}

const LiveKitBoardContext = createContext<LiveKitBoardContextValue>({
  isConnected: false,
  roomName: "",
  isMicEnabled: false,
  isCameraEnabled: false,
  isScreenShareEnabled: false,
  participantsCount: 1,
  mediaError: null,
  toggleMicrophone: async () => {},
  toggleCamera: async () => {},
  toggleScreenShare: async () => {},
  publishBoardData: async () => {},
  subscribeBoardData: () => () => {},
});

export function useLiveKitBoard() {
  return useContext(LiveKitBoardContext);
}

const LIVEKIT_ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  publishDefaults: {
    simulcast: true,
    videoEncoding: {
      maxBitrate: 450_000,
      maxFramerate: 20,
    },
  },
};

function isTeacherIdentity(p: { identity?: string; name?: string; isLocal?: boolean }, localRole: "teacher" | "student") {
  const idStr = String(p?.identity || "").toLowerCase();
  const nameStr = String(p?.name || "").toLowerCase();
  return (
    idStr.startsWith("teacher") ||
    nameStr.includes("eğitmen") ||
    nameStr.includes("öğretmen") ||
    (localRole === "teacher" && Boolean(p?.isLocal))
  );
}

function LiveKitBoardBridge({
  role,
  roomName,
  children,
}: {
  role: "teacher" | "student";
  roomName: string;
  children: React.ReactNode;
}) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [screenExpanded, setScreenExpanded] = useState(true);

  const dataListenersRef = useRef<Set<(payload: any) => void>>(new Set());

  // LiveKit Room bağlantı ve DataChannel dinleyicisi
  useEffect(() => {
    if (!room) return;

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => {
      setIsConnected(false);
      setIsMicEnabled(false);
      setIsCameraEnabled(false);
      setIsScreenShareEnabled(false);
    };
    const handleTrackChange = () => {
      if (!room.localParticipant) return;
      setIsMicEnabled(Boolean(room.localParticipant.isMicrophoneEnabled));
      setIsCameraEnabled(Boolean(room.localParticipant.isCameraEnabled));
      setIsScreenShareEnabled(Boolean(room.localParticipant.isScreenShareEnabled));
    };
    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const text = new TextDecoder().decode(payload);
        const parsed = JSON.parse(text);
        dataListenersRef.current.forEach((cb) => {
          try {
            cb(parsed);
          } catch {}
        });
      } catch {}
    };

    setIsConnected(room.state === "connected");
    handleTrackChange();

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.LocalTrackPublished, handleTrackChange);
    room.on(RoomEvent.LocalTrackUnpublished, handleTrackChange);
    room.on(RoomEvent.TrackMuted, handleTrackChange);
    room.on(RoomEvent.TrackUnmuted, handleTrackChange);
    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.LocalTrackPublished, handleTrackChange);
      room.off(RoomEvent.LocalTrackUnpublished, handleTrackChange);
      room.off(RoomEvent.TrackMuted, handleTrackChange);
      room.off(RoomEvent.TrackUnmuted, handleTrackChange);
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  const toggleMicrophone = useCallback(async () => {
    if (!localParticipant) return;
    setMediaError(null);
    const next = !localParticipant.isMicrophoneEnabled;
    try {
      await localParticipant.setMicrophoneEnabled(next);
      setIsMicEnabled(Boolean(localParticipant.isMicrophoneEnabled));
    } catch (err: any) {
      console.warn("[LiveKit] Mikrofon hatası:", err);
      setMediaError(err?.message || "Mikrofon izni alınamadı.");
    }
  }, [localParticipant]);

  const toggleCamera = useCallback(async () => {
    if (!localParticipant) return;
    setMediaError(null);
    const next = !localParticipant.isCameraEnabled;
    try {
      await localParticipant.setCameraEnabled(next);
      setIsCameraEnabled(Boolean(localParticipant.isCameraEnabled));
    } catch (err: any) {
      console.warn("[LiveKit] Kamera hatası:", err);
      setMediaError(err?.message || "Kamera izni alınamadı.");
    }
  }, [localParticipant]);

  const toggleScreenShare = useCallback(async () => {
    if (role !== "teacher" || !localParticipant) return;
    setMediaError(null);
    const next = !localParticipant.isScreenShareEnabled;
    try {
      await localParticipant.setScreenShareEnabled(next);
      setIsScreenShareEnabled(Boolean(localParticipant.isScreenShareEnabled));
    } catch (err: any) {
      console.warn("[LiveKit] Ekran paylaşımı hatası:", err);
      setIsScreenShareEnabled(false);
      setMediaError(err?.message || "Ekran paylaşımı başlatılamadı veya iptal edildi.");
    }
  }, [role, localParticipant]);

  const publishBoardData = useCallback(
    async (payload: Record<string, any>, options?: { reliable?: boolean }) => {
      if (!room?.localParticipant || room.state !== "connected") return;
      try {
        const bytes = new TextEncoder().encode(JSON.stringify(payload));
        await room.localParticipant.publishData(bytes, {
          reliable: options?.reliable ?? true,
        });
      } catch (err) {
        console.warn("[LiveKit] DataChannel yayın hatası:", err);
      }
    },
    [room]
  );

  const subscribeBoardData = useCallback((listener: (payload: any) => void) => {
    dataListenersRef.current.add(listener);
    return () => {
      dataListenersRef.current.delete(listener);
    };
  }, []);

  // Ekran Paylaşımı Track'i (Tüm katılımcılar için otomatik tam ekran sahne)
  const screenTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );
  const activeScreenTrack = screenTracks.find(isTrackReference);

  useEffect(() => {
    if (activeScreenTrack) {
      setScreenExpanded(true);
    }
  }, [activeScreenTrack]);

  const ctxValue = useMemo<LiveKitBoardContextValue>(
    () => ({
      isConnected,
      roomName,
      isMicEnabled,
      isCameraEnabled,
      isScreenShareEnabled,
      participantsCount: Math.max(1, participants.length),
      mediaError,
      toggleMicrophone,
      toggleCamera,
      toggleScreenShare,
      publishBoardData,
      subscribeBoardData,
    }),
    [
      isConnected,
      roomName,
      isMicEnabled,
      isCameraEnabled,
      isScreenShareEnabled,
      participants.length,
      mediaError,
      toggleMicrophone,
      toggleCamera,
      toggleScreenShare,
      publishBoardData,
      subscribeBoardData,
    ]
  );

  return (
    <LiveKitBoardContext.Provider value={ctxValue}>
      <RoomAudioRenderer />
      {children}

      {/* Canlı Ekran Paylaşımı Sahnesi (Track.Source.ScreenShare) */}
      {activeScreenTrack && screenExpanded && (
        <div className="fixed inset-x-0 top-16 bottom-24 z-30 pointer-events-none flex items-center justify-center px-3 sm:px-6 lg:pr-[340px]">
          <div className="pointer-events-auto relative w-full h-full max-w-6xl rounded-2xl overflow-hidden border border-indigo-500/50 bg-slate-950 shadow-2xl flex items-center justify-center">
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600/90 text-white text-[11px] font-bold shadow">
              <Monitor className="w-3.5 h-3.5" />
              <span>Canlı Ekran Paylaşımı</span>
            </div>
            <button
              type="button"
              onClick={() => setScreenExpanded(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
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
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Ekran Paylaşımını Göster</span>
        </button>
      )}
    </LiveKitBoardContext.Provider>
  );
}

export interface TeamsParticipantGalleryProps {
  role: "teacher" | "student";
}

export function TeamsParticipantGallery({ role }: TeamsParticipantGalleryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid");
  const [collapsed, setCollapsed] = useState(false);
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);
  const {
    isMicEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
  } = useLiveKitBoard();

  const participants = useParticipants();
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  // Akıllı Teams Sıralaması:
  // 1) Eğitmen (rozetli), 2) Aktif konuşanlar (isSpeaking), 3) Kamerası açık öğrenciler, 4) Kamerası kapalı öğrenciler
  const sortedTracks = useMemo(() => {
    const scoreOf = (tr: (typeof cameraTracks)[number]) => {
      const p = tr.participant;
      const isTeacher = isTeacherIdentity(p, role);
      const isSpeaking = Boolean(p.isSpeaking);
      const hasCam = isTrackReference(tr) && !tr.publication.isMuted;

      if (isTeacher) return 0;
      if (isSpeaking) return 1;
      if (hasCam) return 2;
      return 3;
    };

    return [...cameraTracks].sort((a, b) => scoreOf(a) - scoreOf(b));
  }, [cameraTracks, role]);

  const pinnedTrack = useMemo(
    () =>
      pinnedIdentity
        ? sortedTracks.find((tr) => tr.participant.identity === pinnedIdentity) || null
        : null,
    [sortedTracks, pinnedIdentity]
  );

  const visibleGridTracks = useMemo(() => {
    const rest = pinnedTrack
      ? sortedTracks.filter((tr) => tr.participant.identity !== pinnedTrack.participant.identity)
      : sortedTracks;
    if (viewMode === "speaker") {
      // Konuşan görünümü: konuşanlar + eğitmen + ilk 2 aktif katılımcı
      const prioritized = rest.filter(
        (tr) => tr.participant.isSpeaking || isTeacherIdentity(tr.participant, role)
      );
      return prioritized.length > 0 ? prioritized : rest.slice(0, 2);
    }
    return rest;
  }, [sortedTracks, pinnedTrack, viewMode, role]);

  const totalCount = Math.max(1, participants.length || sortedTracks.length);
  const useTwoColGrid = visibleGridTracks.length >= 4 && viewMode === "grid";

  const renderTile = (
    trackRef: (typeof cameraTracks)[number],
    isLarge: boolean
  ) => {
    const p = trackRef.participant;
    const isTeacher = isTeacherIdentity(p, role);
    const isSpeaking = Boolean(p.isSpeaking);
    const hasVideo = isTrackReference(trackRef) && !trackRef.publication.isMuted;
    const displayName = p.name || p.identity || "Katılımcı";
    const isMutedAudio = !p.isMicrophoneEnabled;
    const isPinned = pinnedIdentity === p.identity;

    return (
      <div
        key={`${p.identity}-${trackRef.source}`}
        className={`group relative rounded-xl overflow-hidden bg-slate-950 border transition-all ${
          isLarge ? "aspect-video w-full" : useTwoColGrid ? "aspect-video w-full" : "aspect-video w-full"
        } ${
          isSpeaking
            ? "ring-2 ring-emerald-400 border-emerald-400/70 shadow-lg shadow-emerald-500/20"
            : isTeacher
            ? "border-indigo-500/60"
            : "border-slate-800"
        }`}
      >
        {hasVideo ? (
          <VideoTrack
            trackRef={trackRef}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-slate-900 to-slate-950 p-2">
            <div
              className={`${
                isLarge ? "w-12 h-12 text-base" : useTwoColGrid ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
              } rounded-full bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center text-indigo-200 font-black`}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <VideoOff className="w-3 h-3 opacity-60" />
              {!useTwoColGrid && <span>Kamera Kapalı</span>}
            </span>
          </div>
        )}

        {/* Üst Sol: Eğitmen Rozeti */}
        {isTeacher && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-indigo-600/90 text-[9px] font-black text-white tracking-wide shadow">
            EĞİTMEN
          </div>
        )}

        {/* Hover: Sabitle / Büyüt Butonu */}
        <button
          type="button"
          onClick={() =>
            setPinnedIdentity((prev) => (prev === p.identity ? null : p.identity))
          }
          className={`absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/85 hover:bg-indigo-600 border border-slate-700 text-white transition cursor-pointer ${
            isPinned ? "opacity-100 bg-indigo-600/90" : "opacity-0 group-hover:opacity-100"
          }`}
          title={isPinned ? "Sabitlemeyi Kaldır" : "Sabitle / Büyüt"}
        >
          {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </button>

        {/* Alt İsim & Mikrofon Durumu */}
        <div className="absolute inset-x-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between gap-1 text-[10px] font-semibold text-white">
          <span className="truncate">{displayName}</span>
          {isMutedAudio ? (
            <MicOff className="w-3 h-3 text-rose-400 shrink-0" />
          ) : (
            <Mic className={`w-3 h-3 shrink-0 ${isSpeaking ? "text-emerald-400" : "text-slate-300"}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-slate-950/75 border border-slate-800/80 overflow-hidden">
      {/* Başlık Barı */}
      <div className="shrink-0 px-3 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-100 truncate">
            👥 Katılımcılar ({totalCount})
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-1.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Izgara Görünümü"
          >
            <LayoutGrid className="w-3 h-3" />
            <span>Izgara</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("speaker")}
            className={`px-1.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
              viewMode === "speaker"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Konuşan Görünümü"
          >
            <UserCheck className="w-3 h-3" />
            <span>Konuşan</span>
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={collapsed ? "Galeriyi Aç" : "Galeriyi Daralt"}
          >
            {collapsed ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Kaydırılabilir Adaptif Katılımcı Galerisi */}
      {!collapsed && (
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
          {/* Sabitlenmiş (Pinned) Büyük Önizleme */}
          {pinnedTrack && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 px-0.5 block">
                📌 Sabitlenen Görünüm
              </span>
              {renderTile(pinnedTrack, true)}
            </div>
          )}

          {/* Adaptif Izgara: <=3 kişi tek sütun, >=4 kişi (15+ kamera) 2 sütun */}
          {visibleGridTracks.length === 0 ? (
            <div className="py-6 text-center text-[11px] text-slate-400">
              Odaya bağlanılıyor...
            </div>
          ) : (
            <div
              className={`grid gap-2 ${
                useTwoColGrid ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {visibleGridTracks.map((tr) => renderTile(tr, false))}
            </div>
          )}
        </div>
      )}

      {/* B) Canlı İletişim Kontrol Şeridi (Teams Galerisinin En Altına Sabit) */}
      <div className="shrink-0 flex items-center justify-center gap-2 p-2.5 border-t border-slate-800/80 bg-slate-900/95">
        <button
          type="button"
          onClick={toggleMicrophone}
          className={`flex-1 py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
            isMicEnabled
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm ring-1 ring-emerald-400/40"
              : "bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80"
          }`}
          title={isMicEnabled ? "Mikrofonu Kapat" : "Mikrofonu Aç"}
        >
          {isMicEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
          <span>Mikrofon</span>
        </button>

        <button
          type="button"
          onClick={toggleCamera}
          className={`flex-1 py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
            isCameraEnabled
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm ring-1 ring-emerald-400/40"
              : "bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80"
          }`}
          title={isCameraEnabled ? "Kamerayı Kapat" : "Kamerayı Aç"}
        >
          {isCameraEnabled ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
          <span>Kamera</span>
        </button>

        {role === "teacher" && (
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`py-2 px-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
              isScreenShareEnabled
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50"
                : "bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80"
            }`}
            title={isScreenShareEnabled ? "Ekran Paylaşımını Durdur" : "Ekran Paylaş"}
          >
            {isScreenShareEnabled ? (
              <MonitorUp className="w-4 h-4 text-white" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export interface LiveKitBoardProviderProps {
  classId: string;
  userId?: string;
  userName?: string;
  role?: "teacher" | "student";
  children: React.ReactNode;
}

export function LiveKitBoardProvider({
  classId,
  userId,
  userName,
  role = "student",
  children,
}: LiveKitBoardProviderProps) {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [serverUrl, setServerUrl] = useState<string>(
    process.env.NEXT_PUBLIC_LIVEKIT_URL || ""
  );
  const [roomName, setRoomName] = useState<string>(
    classId ? `vocaship-room-${classId.trim().toLowerCase()}` : ""
  );

  const stableIdentity = useMemo(
    () => (userId ? `${role}-${userId}` : `${role}-${classId}-${Math.random().toString(36).slice(2, 6)}`),
    [userId, role, classId]
  );

  useEffect(() => {
    const cleanClassId = (classId || "").trim().toLowerCase();
    if (!cleanClassId) return;
    let active = true;

    const fetchToken = async () => {
      try {
        const authToken = getAuthToken();
        const res = await fetch(
          `${API_BASE}/api/v1/classroom/classes/${encodeURIComponent(cleanClassId)}/livekit-token`,
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
          const resolvedRoom = data.room_name || `vocaship-room-${cleanClassId}`;
          console.info(`[LiveKit] Bağlanılan oda: ${resolvedRoom}`);
          setRoomName(resolvedRoom);
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

  const canConnect = Boolean(token && serverUrl);

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={canConnect}
      audio={false}
      video={false}
      options={LIVEKIT_ROOM_OPTIONS}
      data-lk-theme="default"
      className="h-full w-full"
    >
      <LiveKitBoardBridge role={role} roomName={roomName}>{children}</LiveKitBoardBridge>
    </LiveKitRoom>
  );
}

export default LiveKitBoardProvider;
