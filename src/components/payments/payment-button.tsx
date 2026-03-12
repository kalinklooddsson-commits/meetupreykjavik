"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface PaymentButtonProps {
  onClick: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function PaymentButton({
  onClick,
  children,
  disabled = false,
  className = "",
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("common");

  async function handleClick() {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center rounded-lg bg-brand-indigo px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-indigo-dark focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {t("processing")}
        </>
      ) : (
        children
      )}
    </button>
  );
}
