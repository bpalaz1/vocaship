import { API_BASE } from "../config";
import { pickUiText } from "../utils/uiLocale";

export interface ArchiveTurnItem {
  sender: "user" | "ai";
  text: string;
  timestamp?: string;
  feedback?: any;
}

export interface ArchiveMetricsData {
  fluency: number;
  vocabulary: number;
  grammar: number;
  overall_score: number;
  level?: string;
}

export interface SpeakingArchiveItem {
  id: string;
  user_id: string;
  session_title: string;
  transcript: ArchiveTurnItem[];
  metrics: ArchiveMetricsData;
  created_at: string;
  xp_awarded?: number;
}

export async function saveSpeakingArchiveSession(payload: {
  session_title: string;
  transcript: ArchiveTurnItem[];
  metrics: ArchiveMetricsData;
  user_id?: string;
}): Promise<SpeakingArchiveItem> {
  const res = await fetch(`${API_BASE}/api/v1/speaking/archives`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${pickUiText({ tr: "Konuşma oturumu arşivlenemedi.", en: "Could not archive speaking session.", de: "Sprachsitzung konnte nicht archiviert werden.", es: "No se pudo archivar la sesión.", fr: "Impossible d'archiver la session." })}`);
  }

  return await res.json();
}

export async function getSpeakingArchives(userId?: string): Promise<SpeakingArchiveItem[]> {
  const url = userId
    ? `${API_BASE}/api/v1/speaking/archives?user_id=${encodeURIComponent(userId)}`
    : `${API_BASE}/api/v1/speaking/archives`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${pickUiText({ tr: "Konuşma arşivleri alınamadı.", en: "Could not fetch speaking archives.", de: "Spracharchive konnten nicht abgerufen werden.", es: "No se pudieron obtener los archivos.", fr: "Impossible de récupérer les archives." })}`);
  }

  return await res.json();
}

export async function getSpeakingArchiveById(archiveId: string): Promise<SpeakingArchiveItem> {
  const res = await fetch(`${API_BASE}/api/v1/speaking/archives/${encodeURIComponent(archiveId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${pickUiText({ tr: "Arşiv detayı alınamadı.", en: "Could not load archive details.", de: "Archivdetails konnten nicht geladen werden.", es: "No se pudieron cargar los detalles.", fr: "Impossible de charger les détails." })}`);
  }

  return await res.json();
}

