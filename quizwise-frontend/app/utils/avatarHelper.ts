const TR_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function transliterateTr(input: string): string {
  return input.replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TR_CHAR_MAP[ch] || ch);
}

/**
 * Ad Soyad bilgisinden Türkçe karaktersiz, küçük harfli rumuz önerisi üretir.
 * Örn: "Burak Palaz" -> "burakpalaz"
 */
export function suggestUsernameFromFullName(fullName: string): string {
  return transliterateTr(fullName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 24);
}

/**
 * E-posta adresinin rumuz olarak sızmasını engeller; '@' varsa öncesini alır.
 */
export function sanitizeUsername(raw?: string | null, fallbackEmail?: string | null): string {
  const trimmed = (raw || "").trim();
  const base = trimmed.includes("@")
    ? trimmed.split("@")[0]
    : trimmed || (fallbackEmail ? fallbackEmail.split("@")[0] : "");
  return transliterateTr(base)
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, "")
    .replace(/^@+/, "");
}

/**
 * Ad Soyad (veya yoksa rumuz) üzerinden 2 harfli Monogram baş harfleri üretir.
 * Örn: "Burak Palaz" -> "BP"
 */
export function getInitials(fullName?: string | null, username?: string | null): string {
  const cleanFull = (fullName || "").trim();
  const source =
    cleanFull && !cleanFull.includes("@")
      ? cleanFull
      : sanitizeUsername(username) || "VS";

  const parts = source
    .replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase("tr-TR");
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toLocaleUpperCase("tr-TR");
  }
  return (parts[0]?.[0] || "V").toLocaleUpperCase("tr-TR");
}

export function isImageAvatarUrl(avatarUrl?: string | null): boolean {
  if (!avatarUrl) return false;
  return (
    avatarUrl.startsWith("http") ||
    avatarUrl.startsWith("/") ||
    avatarUrl.startsWith("data:")
  );
}
