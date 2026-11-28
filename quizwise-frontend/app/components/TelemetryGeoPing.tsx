"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { API_BASE } from "../config";
import { useAuth } from "../context/AuthContext";

const GEO_PING_SESSION_KEY = "vocaship_geo_ping_uid";

export default function TelemetryGeoPing() {
  const { user, token, isGuest, isAuthReady } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthReady || typeof window === "undefined") return;
    // Otomatik tarayıcı / bot oturumlarını ping'leme
    if (typeof navigator !== "undefined" && navigator.webdriver === true) return;
    // Yalnızca oturum açmış gerçek üyeler (misafir/bot taramalarında asla ping atma)
    const isAuthenticated = Boolean(user?.id && token && !isGuest);
    if (!isAuthenticated || !user?.id) return;

    const uid = String(user.id).trim();
    if (!uid) return;

    try {
      if (sessionStorage.getItem(GEO_PING_SESSION_KEY) === uid) {
        return;
      }
      sessionStorage.setItem(GEO_PING_SESSION_KEY, uid);
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            country_code,
            city,
            user_id: uid,
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
  }, [isAuthReady, user?.id, token, isGuest, pathname]);

  return null;
}
