import { NextRequest, NextResponse } from "next/server";

import { getCurrentAppSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTrustedOrigin } from "@/lib/security/request";
import { forbiddenResponse } from "@/lib/security/response";
import {
  checkRateLimit,
  rateLimitKeyFromRequest,
} from "@/lib/security/rate-limit";

const UPLOAD_RATE_LIMIT = { maxRequests: 20, windowMs: 60 * 1000 };

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/upload
 *
 * Accepts a multipart form upload with a single "file" field and an optional
 * "folder" field (e.g. "events", "venues", "profiles"). Stores the image in
 * Supabase Storage and returns the public URL.
 */
export async function POST(request: NextRequest) {
  // --- CSRF ---
  if (!hasTrustedOrigin(request)) {
    return forbiddenResponse("Cross-site uploads are not allowed.");
  }

  // --- Auth ---
  const session = await getCurrentAppSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  // --- Rate limit ---
  const rlKey = rateLimitKeyFromRequest(request, "upload");
  const rl = checkRateLimit(rlKey, UPLOAD_RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rl.resetAt - Date.now()) / 1000),
          ),
        },
      },
    );
  }

  // --- Parse multipart form ---
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided." },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Use PNG, JPG, WebP, or GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5 MB." },
      { status: 400 },
    );
  }

  // Folder scoping: events, venues, profiles, groups
  const folder = (formData.get("folder") as string) ?? "uploads";
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "uploads";

  // --- Upload to Supabase Storage ---
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Storage is not configured." },
      { status: 503 },
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)
    ? ext
    : "jpg";
  const fileName = `${safeFolder}/${session.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase storage upload error:", uploadError);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}
