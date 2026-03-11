"use client";

import { useEffect } from "react";

export function useUnsavedChangesWarning(
  enabled: boolean,
  message = "You have unsaved changes that will be lost if you leave this page.",
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = message;
      return message;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enabled, message]);
}
