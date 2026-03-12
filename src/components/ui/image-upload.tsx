"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  label?: string;
  hint?: string;
  accept?: string;
  maxSizeMb?: number;
  aspectHint?: string;
  className?: string;
  /** Storage folder: "events", "venues", "profiles", "groups" */
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload image",
  hint = "PNG, JPG or WebP up to 5 MB",
  accept = "image/png,image/jpeg,image/webp",
  maxSizeMb = 5,
  aspectHint,
  className = "",
  folder = "uploads",
}: ImageUploadProps) {
  const [preview, setPreview] = useState(value ?? "");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError("");

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }

      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSizeMb} MB.`);
        return;
      }

      setUploading(true);

      // Show instant local preview while uploading
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      // Upload to Supabase Storage via API
      const form = new FormData();
      form.append("file", file);
      if (folder) form.append("folder", folder);

      fetch("/api/upload", { method: "POST", body: form })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(
              (data as { error?: string }).error ?? "Upload failed",
            );
          }
          return res.json() as Promise<{ url: string }>;
        })
        .then(({ url }) => {
          setPreview(url);
          onChange?.(url);
        })
        .catch((err: Error) => {
          // Fall back to local data URL so the user doesn't lose their image
          setError(err.message + " — using local preview.");
          onChange?.(localUrl);
        })
        .finally(() => {
          setUploading(false);
        });
    },
    [maxSizeMb, onChange, folder],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const removeImage = () => {
    setPreview("");
    setError("");
    onChange?.("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="group relative overflow-hidden rounded-2xl border border-brand-border bg-brand-sand-light">
          <img
            src={preview}
            alt="Upload preview"
            className="h-48 w-full object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          {aspectHint && (
            <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {aspectHint}
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition ${
            dragOver
              ? "border-brand-coral bg-brand-coral/5"
              : "border-brand-border-light bg-brand-sand-light hover:border-brand-indigo/30 hover:bg-white"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-brand-indigo" />
          ) : dragOver ? (
            <Upload className="h-8 w-8 text-brand-coral" />
          ) : (
            <ImagePlus className="h-8 w-8 text-brand-text-light" />
          )}
          <span className="mt-3 text-sm font-semibold text-brand-text">
            {label}
          </span>
          <span className="mt-1 text-xs text-brand-text-muted">{hint}</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />
      {error && (
        <p className="mt-2 text-xs text-brand-coral">{error}</p>
      )}
    </div>
  );
}
