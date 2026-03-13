"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

export function FaqSearchableContent({
  sections,
  searchPlaceholder,
  noResultsMessage = "No questions match your search. Try different keywords.",
}: {
  sections: FaqSection[];
  searchPlaceholder: string;
  noResultsMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = normalizedQuery
    ? sections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              item.question.toLowerCase().includes(normalizedQuery) ||
              item.answer.toLowerCase().includes(normalizedQuery),
          ),
        }))
        .filter((section) => section.items.length > 0)
    : sections;

  const totalResults = filteredSections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  return (
    <>
      {/* Search input */}
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-brand-sand-light px-5 py-4 transition-colors focus-within:border-brand-indigo/30 focus-within:bg-white">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </div>
        {normalizedQuery && (
          <p className="mt-2 text-center text-sm text-gray-500">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;
            {query}&rdquo;
          </p>
        )}
      </div>

      {/* FAQ sections */}
      <div className="mx-auto max-w-3xl space-y-10">
        {filteredSections.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">
              {noResultsMessage}
            </p>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-gray-200 bg-white transition-all hover:border-gray-300 [&[open]]:shadow-md [&[open]]:border-brand-indigo/20"
                    open={!!normalizedQuery}
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left font-semibold text-gray-900 transition hover:text-brand-indigo [&::-webkit-details-marker]:hidden">
                      <span>{item.question}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-90" />
                    </summary>
                    <div className="px-6 pb-5">
                      <p className="text-sm leading-relaxed text-gray-600">
                        {item.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
