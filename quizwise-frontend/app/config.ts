export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getApiBase = (): string => {
  return API_BASE;
};


