/**
 * VocaShip Takvim ve Saat Dilimi Yardımcı Fonksiyonları (Faz 4)
 */

import { pickUiText, getCurrentUiLang } from "./uiLocale";

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * UTC ISO tarihini kullanıcının yerel tarih ve saatine dönüştürür.
 * Örn: "18 Kasım 2026, 20:00 (Europe/Istanbul)"
 */
export function formatLocalSessionTime(utcIsoString?: string | null): string {
  if (!utcIsoString) return pickUiText({ tr: "Tarih belirtilmedi", en: "Date not specified", de: "Kein Datum angegeben", es: "Fecha no especificada", fr: "Date non spécifiée", it: "Data non specificata", ru: "Дата не указана" });
  try {
    const date = new Date(utcIsoString);
    if (isNaN(date.getTime())) return pickUiText({ tr: "Geçersiz Tarih", en: "Invalid Date", de: "Ungültiges Datum", es: "Fecha inválida", fr: "Date invalide", it: "Data non valida", ru: "Некорректная дата" });

    const locMap: Record<string, string> = { tr: "tr-TR", en: "en-US", de: "de-DE", es: "es-ES", fr: "fr-FR", it: "it-IT", ru: "ru-RU" };
    const locale = locMap[getCurrentUiLang()] || "en-US";
    const userTz = getUserTimeZone();
    const formatted = new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: userTz,
    }).format(date);

    return `${formatted} (${userTz})`;
  } catch {
    return utcIsoString;
  }
}

/**
 * Tek tıkla Google / Apple / Outlook takvimlerine eklenebilen evrensel RFC-5545 .ics dosyası indirir.
 */
export function downloadSessionIcs(
  title: string,
  scheduledAtUtc: string,
  durationMinutes: number = 60,
  joinUrl: string = ""
): void {
  if (typeof window === "undefined") return;

  const startDate = new Date(scheduledAtUtc);
  if (isNaN(startDate.getTime())) {
    alert(pickUiText({ tr: "Geçerli bir ders tarihi bulunamadı.", en: "No valid lesson date found.", de: "Kein gültiges Unterrichtsdatum gefunden.", es: "No se encontró una fecha de clase válida.", fr: "Aucune date de cours valide trouvée.", it: "Nessuna data di lezione valida trovata.", ru: "Подходящая дата урока не найдена." }));
    return;
  }

  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const formatIcsDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const dtStart = formatIcsDate(startDate);
  const dtEnd = formatIcsDate(endDate);
  const dtStamp = formatIcsDate(new Date());
  const uid = `vocaship-session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@vocaship.com`;
  const cleanTitle = (title || "VocaShip Canlı Ders").replace(/[\r\n]+/g, " ");
  const description = `VocaShip Canlı Ders\\nKatılım Bağlantısı: ${joinUrl || window.location.origin}`;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VocaShip//Class Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${description}`,
    joinUrl ? `URL:${joinUrl}` : "",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean);

  const icsContent = icsLines.join("\r\n");
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeFilename = cleanTitle.replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, "_").slice(0, 30);
  link.href = url;
  link.setAttribute("download", `${safeFilename}_takvim.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

