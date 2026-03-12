"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface PayPalCheckoutProps {
  eventSlug: string;
  tierName: string;
  amountIsk: number;
  quantity: number;
  onSuccess?: (details: { orderId: string; captureId: string | null }) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError: (err: unknown) => void;
      }) => {
        render: (selector: string | HTMLElement) => Promise<void>;
      };
    };
  }
}

export function PayPalCheckout({
  eventSlug,
  tierName,
  amountIsk,
  quantity,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    // Check if SDK is already loaded
    if (window.paypal) {
      setSdkReady(true);
      setLoading(false);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="paypal.com/sdk/js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        setSdkReady(true);
        setLoading(false);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=ISK`;
    script.async = true;
    script.onload = () => {
      setSdkReady(true);
      setLoading(false);
    };
    script.onerror = () => {
      setLoading(false);
      onError?.("Failed to load PayPal SDK.");
    };
    document.body.appendChild(script);
  }, [clientId, onError]);

  const createOrder = useCallback(async () => {
    const response = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventSlug, tierName, amountIsk, quantity }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to create order.");
    }

    const data = await response.json();
    return data.id as string;
  }, [eventSlug, tierName, amountIsk, quantity]);

  const onApprove = useCallback(
    async (data: { orderID: string }) => {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        onError?.(errorData.error ?? "Failed to capture payment.");
        return;
      }

      const captureData = await response.json();
      onSuccess?.({
        orderId: captureData.orderId,
        captureId: captureData.captureId,
      });
    },
    [onSuccess, onError],
  );

  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current) return;

    // Clear previous buttons safely
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    window.paypal
      .Buttons({
        createOrder,
        onApprove,
        onError: (_err: unknown) => {
          onError?.("An error occurred with PayPal.");
        },
      })
      .render(containerRef.current);
  }, [sdkReady, createOrder, onApprove, onError]);

  if (!clientId) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
        Payments coming soon
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <div ref={containerRef} />;
}
