"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

export interface HighlightPayload {
  wordIndex: number;
  wordText: string;
  senderRole?: "teacher" | "student";
  timestamp?: number;
}

export interface UseLiveReadingSyncOptions {
  sessionId: string;
  isTeacher: boolean;
  onWordHighlight?: (wordIndex: number, wordText: string) => void;
}

export function useLiveReadingSync({
  sessionId,
  isTeacher,
  onWordHighlight,
}: UseLiveReadingSyncOptions) {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [activeWordText, setActiveWordText] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const localChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<any>(null);

  // Otomatik yumuşak kaydırma (Smooth Scroll to Active Word)
  const scrollToWordIndex = useCallback((wordIndex: number) => {
    if (typeof window === "undefined" || wordIndex === null || wordIndex === undefined) return;
    try {
      const el = document.querySelector(`[data-word-index="${wordIndex}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } catch {}
  }, []);

  // Vurgu uygulama mantığı
  const applyHighlight = useCallback(
    (index: number | null, text: string | null = null, shouldScroll: boolean = true) => {
      setActiveWordIndex(index);
      setActiveWordText(text);
      setLastSyncTime(Date.now());

      if (index !== null && shouldScroll) {
        // DOM render'ından hemen sonra odaklan
        requestAnimationFrame(() => {
          scrollToWordIndex(index);
        });
      }

      if (index !== null && text && onWordHighlight) {
        onWordHighlight(index, text);
      }
    },
    [scrollToWordIndex, onWordHighlight]
  );

  // 1. Kanal Aboneliği ve Dinleyici Kurulumu
  useEffect(() => {
    if (!sessionId) return;

    const channelName = `live-reading:${sessionId}`;

    // A. Native BroadcastChannel (Yerel sekmeler arası sıfır gecikmeli senkron)
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel(channelName);
        localChannelRef.current = bc;
        bc.onmessage = (event) => {
          const data = event.data;
          if (data && data.event === "highlight-word") {
            const { wordIndex, wordText } = data.payload || {};
            applyHighlight(wordIndex, wordText, true);
          } else if (data && data.event === "clear-highlight") {
            applyHighlight(null, null, false);
          }
        };
      } catch (err) {
        console.warn("[Local BroadcastChannel fallback error]:", err);
      }
    }

    // B. Supabase Realtime Broadcast (Ağ ve cihazlar arası gerçek zamanlı senkron)
    try {
      const channel = supabase.channel(channelName);
      supabaseChannelRef.current = channel;

      channel
        .on("broadcast", { event: "highlight-word" }, (payload: any) => {
          const body = payload?.payload;
          if (body && typeof body.wordIndex === "number") {
            applyHighlight(body.wordIndex, body.wordText || "", true);
          }
        })
        .on("broadcast", { event: "clear-highlight" }, () => {
          applyHighlight(null, null, false);
        })
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        });
    } catch (err) {
      console.warn("[Supabase Realtime Channel error]:", err);
    }

    return () => {
      // Temizlik
      if (localChannelRef.current) {
        try {
          localChannelRef.current.close();
        } catch {}
        localChannelRef.current = null;
      }
      if (supabaseChannelRef.current) {
        try {
          supabase.removeChannel(supabaseChannelRef.current);
        } catch {}
        supabaseChannelRef.current = null;
      }
    };
  }, [sessionId, applyHighlight]);

  // 2. Öğretmen Tarafı: Kelime Vurgulama Yayını
  const broadcastWordHighlight = useCallback(
    (wordIndex: number, wordText: string) => {
      // SADECE ÖĞRETMEN TÜM SINIFIN EKRANINDA VURGU DEĞİŞTİREBİLİR
      if (!isTeacher) {
        // Öğrenci kendi ekranında sözlüğü inceleyebilir ancak broadcast yapmaz
        return;
      }

      // Kendi ekranında anında uygula
      applyHighlight(wordIndex, wordText, false);

      const payload: HighlightPayload = {
        wordIndex,
        wordText,
        senderRole: "teacher",
        timestamp: Date.now(),
      };

      // A. Yerel BroadcastChannel gönderimi
      if (localChannelRef.current) {
        try {
          localChannelRef.current.postMessage({
            event: "highlight-word",
            payload,
          });
        } catch {}
      }

      // B. Supabase Realtime Broadcast gönderimi
      if (supabaseChannelRef.current) {
        try {
          supabaseChannelRef.current.send({
            type: "broadcast",
            event: "highlight-word",
            payload,
          });
        } catch {}
      }
    },
    [isTeacher, applyHighlight]
  );

  // 3. Vurguyu Temizleme
  const clearHighlight = useCallback(() => {
    if (!isTeacher) return;

    applyHighlight(null, null, false);

    if (localChannelRef.current) {
      try {
        localChannelRef.current.postMessage({ event: "clear-highlight" });
      } catch {}
    }

    if (supabaseChannelRef.current) {
      try {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "clear-highlight",
          payload: {},
        });
      } catch {}
    }
  }, [isTeacher, applyHighlight]);

  return {
    activeWordIndex,
    activeWordText,
    isConnected,
    lastSyncTime,
    broadcastWordHighlight,
    clearHighlight,
    scrollToWordIndex,
  };
}

