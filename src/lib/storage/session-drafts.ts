"use client";

export function writeSessionDraft(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(key, JSON.stringify(value, null, 2));
}
