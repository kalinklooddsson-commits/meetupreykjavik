"use client";

import { useState, useCallback } from "react";
import {
  ScanQrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Camera,
  CameraOff,
} from "lucide-react";

interface Attendee {
  name: string;
  ticket: string;
  status: string;
  checkedIn: string;
}

interface QrCheckinProps {
  eventSlug: string;
  attendees: readonly Attendee[];
  onCheckin?: (attendeeName: string) => void;
}

type ScanResult =
  | { state: "idle" }
  | { state: "scanning" }
  | { state: "success"; name: string; ticket: string }
  | { state: "already"; name: string }
  | { state: "not-found"; code: string }
  | { state: "error"; message: string };

export function QrCheckin({ eventSlug, attendees, onCheckin }: QrCheckinProps) {
  const [result, setResult] = useState<ScanResult>({ state: "idle" });
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [checkedInNames, setCheckedInNames] = useState<Set<string>>(
    () => new Set(attendees.filter((a) => a.checkedIn === "Yes").map((a) => a.name)),
  );

  const totalAttendees = attendees.length;
  const checkedInCount = checkedInNames.size;
  const checkinRate = totalAttendees > 0 ? Math.round((checkedInCount / totalAttendees) * 100) : 0;

  const processCode = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;

      // Match by name or ticket code
      const match = attendees.find(
        (a) =>
          a.name.toLowerCase() === trimmed.toLowerCase() ||
          a.ticket.toLowerCase() === trimmed.toLowerCase(),
      );

      if (!match) {
        setResult({ state: "not-found", code: trimmed });
        return;
      }

      if (checkedInNames.has(match.name)) {
        setResult({ state: "already", name: match.name });
        return;
      }

      setCheckedInNames((prev) => new Set([...prev, match.name]));
      setResult({ state: "success", name: match.name, ticket: match.ticket });
      onCheckin?.(match.name);
    },
    [attendees, checkedInNames, onCheckin],
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCode(manualCode);
    setManualCode("");
  };

  const toggleCamera = () => {
    if (cameraActive) {
      setCameraActive(false);
      setResult({ state: "idle" });
    } else {
      setCameraActive(true);
      setResult({ state: "scanning" });
      // Camera QR scanning would be integrated here with html5-qrcode
      // For now, show the camera-ready UI
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* Stats bar */}
      <div className="flex items-center gap-4 rounded-2xl bg-brand-sand-light px-5 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-indigo/10">
          <ScanQrCode className="h-6 w-6 text-brand-indigo" />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-brand-text">
            {checkedInCount}/{totalAttendees}
          </div>
          <div className="text-xs text-brand-text-muted">checked in</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-brand-sage-dark">{checkinRate}%</div>
          <div className="mt-1 h-2 w-20 overflow-hidden rounded-full bg-brand-border-light">
            <div
              className="h-full rounded-full bg-brand-sage transition-all duration-500"
              style={{ width: `${checkinRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Camera toggle */}
      <button
        type="button"
        onClick={toggleCamera}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition ${
          cameraActive
            ? "bg-brand-coral/10 text-brand-coral border border-brand-coral/30"
            : "bg-brand-indigo text-white shadow-lg"
        }`}
      >
        {cameraActive ? (
          <>
            <CameraOff className="h-4 w-4" />
            Stop camera
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            Scan QR code
          </>
        )}
      </button>

      {/* Camera viewport placeholder */}
      {cameraActive && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-brand-indigo/30 bg-black/5">
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-brand-text-muted">
            <div className="relative h-32 w-32">
              {/* Scanning frame corners */}
              <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-brand-indigo" />
              <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-brand-indigo" />
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-brand-indigo" />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-brand-indigo" />
              {/* Scanning line animation */}
              <div className="absolute left-2 right-2 top-1/2 h-0.5 animate-pulse bg-brand-indigo/60" />
            </div>
            <p className="text-xs">Point camera at attendee QR code</p>
          </div>
        </div>
      )}

      {/* Manual entry */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-light" />
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Name or ticket code…"
            className="w-full rounded-xl border border-brand-border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-indigo"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-indigo px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-indigo/90"
        >
          Check in
        </button>
      </form>

      {/* Result feedback */}
      {result.state !== "idle" && result.state !== "scanning" && (
        <div
          className={`flex items-start gap-3 rounded-2xl px-5 py-4 ${
            result.state === "success"
              ? "bg-brand-sage/10 border border-brand-sage/30"
              : result.state === "already"
                ? "bg-brand-sand border border-brand-border"
                : "bg-brand-coral/10 border border-brand-coral/30"
          }`}
        >
          {result.state === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-sage-dark" />
          ) : result.state === "already" ? (
            <Loader2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-text-muted" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-coral" />
          )}
          <div>
            {result.state === "success" && (
              <>
                <div className="font-semibold text-brand-sage-dark">Checked in!</div>
                <div className="text-sm text-brand-text-muted">
                  {result.name} · {result.ticket}
                </div>
              </>
            )}
            {result.state === "already" && (
              <>
                <div className="font-semibold text-brand-text">Already checked in</div>
                <div className="text-sm text-brand-text-muted">{result.name}</div>
              </>
            )}
            {result.state === "not-found" && (
              <>
                <div className="font-semibold text-brand-coral">Not found</div>
                <div className="text-sm text-brand-text-muted">
                  No attendee matching &quot;{result.code}&quot;
                </div>
              </>
            )}
            {result.state === "error" && (
              <>
                <div className="font-semibold text-brand-coral">Error</div>
                <div className="text-sm text-brand-text-muted">{result.message}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recent check-ins */}
      {checkedInCount > 0 && (
        <div className="rounded-2xl border border-brand-border-light bg-white px-5 py-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-text-light">
            Recent check-ins
          </div>
          <div className="space-y-2">
            {attendees
              .filter((a) => checkedInNames.has(a.name))
              .slice(0, 5)
              .map((a) => (
                <div key={a.name} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-brand-sage" />
                  <span className="font-medium text-brand-text">{a.name}</span>
                  <span className="text-brand-text-light">{a.ticket}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
