export const toSlug = (value: string) =>
  encodeURIComponent(
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
  );

export const fromSlug = (value: string) =>
  decodeURIComponent(value).replace(/-/g, " ");