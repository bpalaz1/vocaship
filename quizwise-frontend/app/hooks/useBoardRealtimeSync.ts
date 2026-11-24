"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export type SyncDrawTool =
  | "highlighter"
  | "pen_red"
  | "pen_blue"
  | "eraser"
  | "line"
  | "circle"
  | "rect"
  | "arrow"
  | "text";

export interface BoardStrokeEvent {
  tool: SyncDrawTool;
  from: { x: number; y: number };
  to: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
}

export interface BoardShapeEvent {
  tool: "line" | "circle" | "rect" | "arrow";
  start: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
  canvasWidth: number;
  canvasHeight: number;
}

export interface BoardTextEvent {
  text: string;
  x: number;
  y: number;
  color: string;
  canvasWidth: number;
  canvasHeight: number;
}

export interface BoardPdfStateEvent {
  pdfFileName: string | null;
  pdfPageImages: string[];
  currentPage: number;
}

export interface UseBoardRealtimeSyncOptions {
  classId: string;
  isTeacher: boolean;
  onRemoteStroke?: (payload: BoardStrokeEvent) => void;
  onRemoteShape?: (payload: BoardShapeEvent) => void;
  onRemoteText?: (payload: BoardTextEvent) => void;
  onRemoteLaser?: (payload: { nx: number; ny: number }) => void;
  onRemoteClear?: () => void;
  onRemoteCanvasSnapshot?: (dataUrl: string) => void;
  onRemotePdfState?: (payload: BoardPdfStateEvent) => void;
  onRemotePdfPage?: (page: number) => void;
  onRemotePdfClear?: () => void;
  onRemoteScreenStream?: (stream: MediaStream | null) => void;
  getSyncState?: () => {
    pdfFileName: string | null;
    pdfPageImages: string[];
    currentPage: number;
    canvasDataUrl: string | null;
    screenStream: MediaStream | null;
  };
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useBoardRealtimeSync({
  classId,
  isTeacher,
  onRemoteStroke,
  onRemoteShape,
  onRemoteText,
  onRemoteLaser,
  onRemoteClear,
  onRemoteCanvasSnapshot,
  onRemotePdfState,
  onRemotePdfPage,
  onRemotePdfClear,
  onRemoteScreenStream,
  getSyncState,
}: UseBoardRealtimeSyncOptions) {
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const peerIdRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `peer-${Math.random().toString(36).slice(2, 10)}`
  );

  // Teacher: studentPeerId -> RTCPeerConnection
  const teacherPeersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Student: single RTCPeerConnection to teacher
  const studentPeerRef = useRef<RTCPeerConnection | null>(null);
  const activeScreenStreamRef = useRef<MediaStream | null>(null);

  // Keep latest callbacks in refs so channel subscription doesn't churn
  const callbacksRef = useRef({
    onRemoteStroke,
    onRemoteShape,
    onRemoteText,
    onRemoteLaser,
    onRemoteClear,
    onRemoteCanvasSnapshot,
    onRemotePdfState,
    onRemotePdfPage,
    onRemotePdfClear,
    onRemoteScreenStream,
    getSyncState,
  });
  callbacksRef.current = {
    onRemoteStroke,
    onRemoteShape,
    onRemoteText,
    onRemoteLaser,
    onRemoteClear,
    onRemoteCanvasSnapshot,
    onRemotePdfState,
    onRemotePdfPage,
    onRemotePdfClear,
    onRemoteScreenStream,
    getSyncState,
  };

  const emitEvent = useCallback((event: string, payload: any) => {
    try {
      channelRef.current?.send({
        type: "broadcast",
        event,
        payload,
      });
    } catch {}
    try {
      bcRef.current?.postMessage({ event, payload });
    } catch {}
  }, []);

  const closeAllPeers = useCallback(() => {
    teacherPeersRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch {}
    });
    teacherPeersRef.current.clear();

    if (studentPeerRef.current) {
      try {
        studentPeerRef.current.close();
      } catch {}
      studentPeerRef.current = null;
    }
  }, []);

  const createTeacherOfferForStudent = useCallback(
    async (studentPeerId: string, stream: MediaStream) => {
      try {
        const existing = teacherPeersRef.current.get(studentPeerId);
        if (existing) {
          existing.close();
        }
        const pc = new RTCPeerConnection(RTC_CONFIG);
        teacherPeersRef.current.set(studentPeerId, pc);

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            emitEvent("rtc-ice", {
              targetPeerId: studentPeerId,
              fromPeerId: peerIdRef.current,
              candidate: e.candidate.toJSON(),
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        emitEvent("rtc-offer", {
          targetPeerId: studentPeerId,
          fromPeerId: peerIdRef.current,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.warn("WebRTC teacher offer error:", err);
      }
    },
    [emitEvent]
  );

  useEffect(() => {
    if (!classId || typeof window === "undefined") return;

    const channelName = `board-room-${classId}`;

    const handleIncoming = async (event: string, payload: any) => {
      const cb = callbacksRef.current;

      if (!isTeacher) {
        if (event === "board-draw-stroke" && payload) {
          cb.onRemoteStroke?.(payload);
        } else if (event === "board-draw-shape" && payload) {
          cb.onRemoteShape?.(payload);
        } else if (event === "board-draw-text" && payload) {
          cb.onRemoteText?.(payload);
        } else if (event === "board-laser" && payload) {
          cb.onRemoteLaser?.(payload);
        } else if (event === "board-clear") {
          cb.onRemoteClear?.();
        } else if (event === "board-canvas-snapshot" && payload?.dataUrl) {
          cb.onRemoteCanvasSnapshot?.(payload.dataUrl);
        } else if (event === "board-pdf-state" && payload) {
          cb.onRemotePdfState?.(payload);
        } else if (event === "board-pdf-page" && typeof payload?.currentPage === "number") {
          cb.onRemotePdfPage?.(payload.currentPage);
        } else if (event === "board-pdf-clear") {
          cb.onRemotePdfClear?.();
        } else if (event === "rtc-screen-started") {
          emitEvent("rtc-request-offer", { studentPeerId: peerIdRef.current });
        } else if (event === "rtc-screen-stopped") {
          if (studentPeerRef.current) {
            try {
              studentPeerRef.current.close();
            } catch {}
            studentPeerRef.current = null;
          }
          cb.onRemoteScreenStream?.(null);
        } else if (event === "rtc-offer" && payload?.targetPeerId === peerIdRef.current) {
          try {
            if (studentPeerRef.current) {
              studentPeerRef.current.close();
            }
            const pc = new RTCPeerConnection(RTC_CONFIG);
            studentPeerRef.current = pc;

            pc.ontrack = (e) => {
              const stream = e.streams?.[0] || new MediaStream([e.track]);
              cb.onRemoteScreenStream?.(stream);
            };

            pc.onicecandidate = (e) => {
              if (e.candidate) {
                emitEvent("rtc-ice", {
                  targetPeerId: payload.fromPeerId,
                  fromPeerId: peerIdRef.current,
                  candidate: e.candidate.toJSON(),
                });
              }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            emitEvent("rtc-answer", {
              targetPeerId: payload.fromPeerId,
              fromPeerId: peerIdRef.current,
              sdp: pc.localDescription,
            });
          } catch (err) {
            console.warn("WebRTC student answer error:", err);
          }
        } else if (event === "rtc-ice" && payload?.targetPeerId === peerIdRef.current) {
          try {
            if (studentPeerRef.current && payload.candidate) {
              await studentPeerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
            }
          } catch {}
        }
      } else {
        // Teacher incoming handlers
        if (event === "board-request-sync") {
          const state = cb.getSyncState?.();
          if (state) {
            if (state.pdfPageImages.length > 0 || state.pdfFileName) {
              emitEvent("board-pdf-state", {
                pdfFileName: state.pdfFileName,
                pdfPageImages: state.pdfPageImages,
                currentPage: state.currentPage,
              });
            }
            if (state.canvasDataUrl) {
              emitEvent("board-canvas-snapshot", { dataUrl: state.canvasDataUrl });
            }
            if (state.screenStream && payload?.studentPeerId) {
              activeScreenStreamRef.current = state.screenStream;
              await createTeacherOfferForStudent(payload.studentPeerId, state.screenStream);
            }
          }
        } else if (event === "rtc-request-offer" && payload?.studentPeerId) {
          const stream = activeScreenStreamRef.current || cb.getSyncState?.()?.screenStream;
          if (stream) {
            await createTeacherOfferForStudent(payload.studentPeerId, stream);
          }
        } else if (event === "rtc-answer" && payload?.targetPeerId === peerIdRef.current) {
          const pc = teacherPeersRef.current.get(payload.fromPeerId);
          if (pc && payload.sdp) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            } catch {}
          }
        } else if (event === "rtc-ice" && payload?.targetPeerId === peerIdRef.current) {
          const pc = teacherPeersRef.current.get(payload.fromPeerId);
          if (pc && payload.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch {}
          }
        }
      }
    };

    // 1. Local BroadcastChannel (0ms same-browser multi-tab fallback)
    if ("BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel(channelName);
        bcRef.current = bc;
        bc.onmessage = (e) => {
          if (e.data?.event) {
            handleIncoming(e.data.event, e.data.payload);
          }
        };
      } catch {}
    }

    // 2. Supabase Realtime Channel: board-room-${classId}
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
      },
    });
    channelRef.current = channel;

    const events = [
      "board-draw-stroke",
      "board-draw-shape",
      "board-draw-text",
      "board-laser",
      "board-clear",
      "board-canvas-snapshot",
      "board-pdf-state",
      "board-pdf-page",
      "board-pdf-clear",
      "board-request-sync",
      "rtc-screen-started",
      "rtc-screen-stopped",
      "rtc-request-offer",
      "rtc-offer",
      "rtc-answer",
      "rtc-ice",
    ];

    events.forEach((evtName) => {
      channel.on("broadcast", { event: evtName }, ({ payload }) => {
        handleIncoming(evtName, payload);
      });
    });

    channel.subscribe((status: string) => {
      if (status === "SUBSCRIBED") {
        setIsRealtimeConnected(true);
        if (!isTeacher) {
          emitEvent("board-request-sync", { studentPeerId: peerIdRef.current });
        }
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setIsRealtimeConnected(false);
      }
    });

    // Trigger initial sync request via BroadcastChannel for local tabs as well
    if (!isTeacher) {
      setTimeout(() => {
        emitEvent("board-request-sync", { studentPeerId: peerIdRef.current });
      }, 150);
    }

    return () => {
      closeAllPeers();
      try {
        bcRef.current?.close();
      } catch {}
      bcRef.current = null;
      try {
        supabase.removeChannel(channel);
      } catch {}
      channelRef.current = null;
      setIsRealtimeConnected(false);
    };
  }, [classId, isTeacher, emitEvent, closeAllPeers, createTeacherOfferForStudent]);

  const broadcastDrawStroke = useCallback(
    (payload: BoardStrokeEvent) => {
      if (!isTeacher) return;
      emitEvent("board-draw-stroke", payload);
    },
    [isTeacher, emitEvent]
  );

  const broadcastDrawShape = useCallback(
    (payload: BoardShapeEvent) => {
      if (!isTeacher) return;
      emitEvent("board-draw-shape", payload);
    },
    [isTeacher, emitEvent]
  );

  const broadcastDrawText = useCallback(
    (payload: BoardTextEvent) => {
      if (!isTeacher) return;
      emitEvent("board-draw-text", payload);
    },
    [isTeacher, emitEvent]
  );

  const broadcastLaser = useCallback(
    (nx: number, ny: number) => {
      if (!isTeacher) return;
      emitEvent("board-laser", { nx, ny });
    },
    [isTeacher, emitEvent]
  );

  const broadcastClear = useCallback(() => {
    if (!isTeacher) return;
    emitEvent("board-clear", {});
  }, [isTeacher, emitEvent]);

  const broadcastPdfState = useCallback(
    (payload: BoardPdfStateEvent) => {
      if (!isTeacher) return;
      emitEvent("board-pdf-state", payload);
    },
    [isTeacher, emitEvent]
  );

  const broadcastPdfPage = useCallback(
    (currentPage: number) => {
      if (!isTeacher) return;
      emitEvent("board-pdf-page", { currentPage });
    },
    [isTeacher, emitEvent]
  );

  const broadcastPdfClear = useCallback(() => {
    if (!isTeacher) return;
    emitEvent("board-pdf-clear", {});
  }, [isTeacher, emitEvent]);

  const startWebRtcBroadcast = useCallback(
    (stream: MediaStream) => {
      if (!isTeacher) return;
      activeScreenStreamRef.current = stream;
      emitEvent("rtc-screen-started", { teacherPeerId: peerIdRef.current });
    },
    [isTeacher, emitEvent]
  );

  const stopWebRtcBroadcast = useCallback(() => {
    if (!isTeacher) return;
    activeScreenStreamRef.current = null;
    closeAllPeers();
    emitEvent("rtc-screen-stopped", { teacherPeerId: peerIdRef.current });
  }, [isTeacher, closeAllPeers, emitEvent]);

  return {
    isRealtimeConnected,
    broadcastDrawStroke,
    broadcastDrawShape,
    broadcastDrawText,
    broadcastLaser,
    broadcastClear,
    broadcastPdfState,
    broadcastPdfPage,
    broadcastPdfClear,
    startWebRtcBroadcast,
    stopWebRtcBroadcast,
  };
}
