import { NextResponse } from "next/server";

export function forbiddenResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}
