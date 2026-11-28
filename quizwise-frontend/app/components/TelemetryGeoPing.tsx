"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";

const GEO_PING_SESSION_KEY = "vocaship_geo_ping_sent";

export default function TelemetryGeoPing() {
  const { user, isAuthReady } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthReady || typeof window === "undefined") return;

    const uid = user?.id ? String(user.id) : "";
    const pingMarker = uid ? `user:${uid}` : "anon";

    try {
      const prev = sessionStorage.getItem(GEO_PING_SESSION_KEY);
      if (prev === pingMarker || (prev?.startsWith("user:") && !uid)) {
        return;
      }
      sessionStorage.setItem(GEO_PING_SESSION_KEY, pingMarker);
    } catch {
      return;
    }

    let cancelled = false;

    const sendPing = async () => {
      try {
        let country_code = "TR";
        let city = "";
        try {
          const geoRes = await fetch("/api/geo", { cache: "no-store" });
          if (geoRes.ok) {
            const geo = await geoRes.json();
            if (geo?.country_code) country_code = String(geo.country_code);
            if (geo?.city) city = String(geo.city);
          }
        } catch {}

        if (cancelled) return;

        await fetch(`${API_BASE}/api/v1/admin/ping`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country_code,
            city,
            user_id: uid || null,
            path: pathname || "/",
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    };

    sendPing();
    return () => {
      cancelled = true;
    };
  }, [isAuthReady, user?.id, pathname]);

  return null;
}
