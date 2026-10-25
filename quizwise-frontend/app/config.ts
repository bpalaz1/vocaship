export const getApiBase = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname === "localhost" ? "localhost" : "127.0.0.1";
    return `http://${host}:8000/api/v1`;
  }
  return "http://localhost:8000/api/v1";
};

export const API_BASE = getApiBase();
