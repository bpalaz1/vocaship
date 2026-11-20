import { pickUiText, formatUiText } from "./utils/uiLocale";

export const getApiBase = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  return "http://127.0.0.1:8000";
};

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface ResilientFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

/**
 * 45s zaman aşımı ve ağ/zaman aşımı/5xx hatalarında sessiz yeniden deneme (retry)
 * sağlayan merkezi fetch sarmalayıcısı.
 */
export async function resilientFetch(
  input: RequestInfo | URL,
  options: ResilientFetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 45000,
    retries = 1,
    retryDelayMs = 2000,
    signal: externalSignal,
    ...fetchInit
  } = options;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    let timedOut = false;

    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener("abort", onExternalAbort, { once: true });
      }
    }

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(input, {
        ...fetchInit,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (externalSignal) {
        externalSignal.removeEventListener("abort", onExternalAbort);
      }

      if (response.status >= 500 && attempt < retries && !externalSignal?.aborted) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timer);
      if (externalSignal) {
        externalSignal.removeEventListener("abort", onExternalAbort);
      }
      lastError = timedOut
        ? new Error(formatUiText({ tr: "İstek {ms}ms içinde yanıt vermedi (zaman aşımı).", en: "Request timed out after {ms}ms.", de: "Zeitüberschreitung nach {ms}ms.", es: "La solicitud superó el tiempo límite de {ms}ms.", fr: "La requête a expiré après {ms}ms." }, { ms: timeoutMs }))
        : err;

      if (externalSignal?.aborted || attempt >= retries) {
        break;
      }
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(pickUiText({ tr: "Ağ bağlantısı kurulamadı.", en: "Network connection failed.", de: "Netzwerkverbindung fehlgeschlagen.", es: "Error de conexión de red.", fr: "Échec de la connexion réseau." }));
}



