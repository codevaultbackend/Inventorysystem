export const formatNumber = (num: number | string): string => {
  if (num === null || num === undefined) return "0";

  const n = Number(num);

  if (isNaN(n)) return String(num);

  if (n >= 1_000_000_000)
    return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";

  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";

  if (n >= 1_000)
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";

  return n.toString();
};
