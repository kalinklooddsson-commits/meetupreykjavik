"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function LeaveGroupButton({ groupSlug, groupName }: { groupSlug: string; groupName: string }) {
  const { toast } = useToast();
  const [state, setState] = useState<"idle" | "confirming" | "loading" | "left">("idle");

  async function handleLeave() {
    if (state === "idle") {
      setState("confirming");
      return;
    }

    if (state === "confirming") {
      setState("loading");
      try {
        const res = await fetch(`/api/groups/${groupSlug}/leave`, { method: "POST" });
        if (!res.ok) {
          setState("idle");
          toast("error", `Could not leave ${groupName}. Please try again.`);
          return;
        }
        setState("left");
        toast("success", `Left ${groupName}`);
      } catch {
        setState("idle");
        toast("error", `Could not leave ${groupName}. Please try again.`);
      }
    }
  }

  if (state === "left") {
    return <span className="text-xs text-brand-text-muted">Left</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {state === "confirming" ? (
        <>
          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex items-center gap-1 rounded-md bg-brand-coral px-2 py-1 text-xs font-medium text-white transition hover:bg-brand-coral/90"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="rounded-md px-2 py-1 text-xs font-medium text-brand-text-muted hover:text-brand-text"
          >
            Cancel
          </button>
        </>
      ) : state === "loading" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-text-muted" />
      ) : (
        <button
          type="button"
          onClick={handleLeave}
          className="inline-flex items-center gap-1 rounded-md border border-brand-border-light px-2 py-1 text-xs font-medium text-brand-text-muted transition hover:border-brand-coral hover:text-brand-coral"
        >
          <LogOut className="h-3 w-3" />
          Leave
        </button>
      )}
    </div>
  );
}
