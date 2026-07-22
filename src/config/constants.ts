/**
 * Global constants mirroring knowledge/business-rules.md. Don't inline these
 * values elsewhere — import from here so a rule change is a one-line diff.
 */

export const DEFAULT_SEARCH_RADIUS_KM = 5;
export const MAX_SEARCH_RADIUS_KM = 50;
export const MAX_LISTING_IMAGES = 10;
export const CANCELLATION_FREE_WINDOW_HOURS = 24;

/** Fallback only — the authoritative value lives in the platform_settings table. */
export const DEFAULT_PLATFORM_FEE_RATE = 0.12;
