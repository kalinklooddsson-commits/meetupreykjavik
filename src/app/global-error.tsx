"use client";

/**
 * Global error boundary — last resort when root layout itself fails.
 * Cannot use next-intl because the provider may not be available.
 * Uses inline styles because Tailwind CSS may not be loaded.
 * Shows bilingual EN/IS content inline.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error — MeetupReykjavik</title>
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#faf9f6", color: "#1a1a1a" }}>
        <div style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: "2rem" }}>
          <div style={{ width: "100%", maxWidth: 680, borderRadius: 16, border: "1px solid #e5e5e5", backgroundColor: "#fff", padding: "2.5rem", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ margin: "0 auto 1.5rem", width: 56, height: 56, borderRadius: 16, backgroundColor: "#e8614d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              ⚠
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#e8614d" }}>
              System error / Kerfisvilla
            </p>
            <h1 style={{ marginTop: 16, fontSize: 28, fontWeight: 700, color: "#1a1a1a" }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: 12, fontSize: 16, color: "#666", lineHeight: 1.6, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            <p style={{ marginTop: 8, fontSize: 14, color: "#999", lineHeight: 1.6, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
              Óvænt villa kom upp. Reyndu aftur eða farðu á forsíðu.
            </p>
            <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{ borderRadius: 999, backgroundColor: "#e8614d", color: "#fff", padding: "12px 24px", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}
              >
                Try again / Reyna aftur
              </button>
              <a
                href="/"
                style={{ borderRadius: 999, backgroundColor: "#fff", color: "#333", padding: "12px 24px", fontSize: 14, fontWeight: 600, border: "1px solid #e5e5e5", textDecoration: "none" }}
              >
                Go home / Fara heim
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
