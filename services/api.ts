/**
 * PRAVAAH Service Layer Base
 * 
 * Configured to seamlessly switch between local mock/simulation datasets
 * and the future FastAPI backend (set via NEXT_PUBLIC_API_URL).
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
export const IS_LIVE_API_ENABLED = process.env.NEXT_PUBLIC_DISABLE_LIVE_API !== 'true';

export async function fetchWithFallback<T>(
  endpoint: string,
  fallbackData: T,
  options?: RequestInit
): Promise<{ data: T; isLive: boolean }> {
  if (!IS_LIVE_API_ENABLED) {
    return { data: fallbackData, isLive: false };
  }


  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      console.warn(`[PRAVAAH API] Live endpoint ${endpoint} returned ${res.status}. Falling back to demo data.`);
      return { data: fallbackData, isLive: false };
    }

    const json = await res.json();
    return { data: json, isLive: true };
  } catch (err) {
    console.warn(`[PRAVAAH API] Failed to reach live API at ${endpoint}. Using demo dataset.`, err);
    return { data: fallbackData, isLive: false };
  }
}
