export type UiLang = "tr" | "en" | "de" | "es" | "fr";

export const SUPPORTED_UI_LANGS: UiLang[] = ["tr", "en", "de", "es", "fr"];

export function getCurrentUiLang(): UiLang {
  if (typeof window !== "undefined") {
    try {
      const saved =
        localStorage.getItem("vocaship_ui_lang") ||
        localStorage.getItem("quizwise_ui_lang") ||
        "tr";
      if ((SUPPORTED_UI_LANGS as string[]).includes(saved)) {
        return saved as UiLang;
      }
    } catch {}
  }
  return "tr";
}

export function pickUiText(
  translations: Partial<Record<UiLang, string>>,
  lang?: string
): string {
  const code = (lang || getCurrentUiLang()) as UiLang;
  return (
    translations[code] ||
    translations.en ||
    translations.tr ||
    Object.values(translations)[0] ||
    ""
  );
}

export function formatUiText(
  translations: Partial<Record<UiLang, string>>,
  params?: Record<string, string | number>,
  lang?: string
): string {
  let out = pickUiText(translations, lang);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }
  return out;
}
