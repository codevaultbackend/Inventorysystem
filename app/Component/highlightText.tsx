import React from "react";

export function highlightText(
  text?: string | number | null,
  query?: string | number | null
) {
  const safeText = text === null || text === undefined ? "" : String(text);
  const safeQuery = query === null || query === undefined ? "" : String(query);

  if (!safeText) return safeText;
  if (!safeQuery.trim()) return safeText;

  const escapedQuery = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");

  return safeText.split(regex).map((part, index) => {
    if (part.toLowerCase() === safeQuery.toLowerCase()) {
      return (
        <mark
          key={index}
          className="rounded-md bg-yellow-200 px-1 font-semibold text-black"
        >
          {part}
        </mark>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}