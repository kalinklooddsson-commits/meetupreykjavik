"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Check } from "lucide-react";

interface JoinGroupButtonProps {
  slug: string;
  label: string;
  className?: string;
  /** Show ArrowRight icon after label */
  showArrow?: boolean;
  /** Pre-set membership state from server */
  isMember?: boolean;
}

/**
 * Client component that POSTs to /api/groups/[slug]/join.
 * Falls back to /signup if the user isn't authenticated (401).
 */
export function JoinGroupButton({
  slug,
  label,
  className,
  showArrow = false,
  isMember = false,
}: JoinGroupButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "joined" | "error">(isMember ? "joined" : "idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleJoin() {
    if (state === "loading" || state === "joined") return;
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/groups/${slug}/join`, { method: "POST" });

      if (res.status === 401 || res.status === 403) {
        // Not authenticated — redirect to login with return path
        router.push(`/login?redirect=/groups/${slug}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        // Already a member is not really an error
        if (data.error?.toLowerCase().includes("already") || data.error?.toLowerCase().includes("authentication")) {
          setState("joined");
          return;
        }
        setState("error");
        setErrorMsg(data.error ?? "Could not join group");
        return;
      }

      setState("joined");
      router.refresh();
    } catch {
      setState("error");
      setErrorMsg("Could not reach the server. Please try again.");
    }
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={state === "loading" || state === "joined"}
        className={className}
      >
        {state === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === "joined" && <Check className="h-4 w-4" />}
        {state === "joined" ? "Joined!" : label}
        {showArrow && state === "idle" && <ArrowRight className="h-4 w-4" />}
      </button>
      {state === "error" && errorMsg && (
        <p className="mt-1 text-xs text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
