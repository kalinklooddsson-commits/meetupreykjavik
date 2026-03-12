"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import type { AccountType, Locale } from "@/types/domain";

/**
 * Shape returned by the /api/auth/me endpoint and cached in-memory on the
 * client.  Matches the `AppSession` type from `@/lib/auth/session`.
 */
export type ClientUser = {
  id: string;
  email: string;
  displayName: string;
  slug: string;
  accountType: AccountType;
  locale: Locale;
};

type UserState = {
  user: ClientUser | null;
  isLoading: boolean;
  error: string | null;
};

// ---------------------------------------------------------------------------
// Singleton external store so every `useUser()` consumer shares one fetch.
// ---------------------------------------------------------------------------

let state: UserState = { user: null, isLoading: true, error: null };
let listeners = new Set<() => void>();
let fetchPromise: Promise<void> | null = null;

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return { user: null, isLoading: true, error: null };
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function emit(next: UserState) {
  state = next;
  listeners.forEach((listener) => listener());
}

async function fetchUser() {
  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" });

    if (!response.ok) {
      emit({ user: null, isLoading: false, error: "Failed to fetch session." });
      return;
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      data?: { user?: ClientUser | null };
    };

    emit({
      user: payload.data?.user ?? null,
      isLoading: false,
      error: null,
    });
  } catch {
    emit({ user: null, isLoading: false, error: "Network error." });
  }
}

function ensureFetched() {
  if (!fetchPromise) {
    fetchPromise = fetchUser();
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * React hook that returns the currently signed-in user from a shared
 * in-memory cache.  Fetches `/api/auth/me` once on mount and de-duplicates
 * across all consumers.
 *
 * ```tsx
 * const { user, isLoading } = useUser();
 * ```
 */
export function useUser() {
  // Kick off the fetch on first render of any consumer.
  useEffect(() => {
    ensureFetched();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Imperatively refresh the cached user.  Call after sign-in / sign-out to
 * force all `useUser()` consumers to re-render with fresh data.
 */
export function refreshUser() {
  fetchPromise = null;
  emit({ user: null, isLoading: true, error: null });
  ensureFetched();
}

/**
 * Immediately clear the cached user without refetching (useful on sign-out
 * before navigating away).
 */
export function clearUser() {
  fetchPromise = null;
  emit({ user: null, isLoading: false, error: null });
}
