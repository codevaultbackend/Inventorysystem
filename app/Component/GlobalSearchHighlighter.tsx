"use client";

import { useEffect } from "react";
import { useApp } from "../context/AppContext";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeHighlights(root: HTMLElement) {
  const marks = root.querySelectorAll("mark[data-global-search-highlight='true']");

  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;

    parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
    parent.normalize();
  });
}

function shouldSkipNode(parent: Node | null) {
  if (!(parent instanceof HTMLElement)) return true;

  const tag = parent.tagName.toLowerCase();

  return (
    tag === "script" ||
    tag === "style" ||
    tag === "noscript" ||
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    tag === "option" ||
    tag === "button" ||
    tag === "svg" ||
    tag === "path" ||
    tag === "mark" ||
    parent.isContentEditable
  );
}

function highlightTextNodes(root: HTMLElement, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;

  const safeQuery = escapeRegExp(trimmed);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentNode;

        if (!node.textContent?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        if (shouldSkipNode(parent)) {
          return NodeFilter.FILTER_REJECT;
        }

        const regex = new RegExp(safeQuery, "i");

        return regex.test(node.textContent)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const text = textNode.textContent || "";
    const regex = new RegExp(safeQuery, "gi");
    const fragment = document.createDocumentFragment();

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (start > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, start))
        );
      }

      const mark = document.createElement("mark");
      mark.setAttribute("data-global-search-highlight", "true");
      mark.className = "rounded-md bg-yellow-200 px-1 font-semibold text-black";
      mark.textContent = text.slice(start, end);

      fragment.appendChild(mark);
      lastIndex = end;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  });
}

export default function GlobalSearchHighlighter() {
  const { globalSearch } = useApp();

  useEffect(() => {
    const root = document.querySelector(
      "[data-dashboard-search-root='true']"
    ) as HTMLElement | null;

    if (!root) return;

    removeHighlights(root);

    if (!globalSearch.trim()) return;

    const frame = requestAnimationFrame(() => {
      highlightTextNodes(root, globalSearch);
    });

    return () => cancelAnimationFrame(frame);
  }, [globalSearch]);

  return null;
}