export const formatNumber = (
  num: number | string
): string => {
  if (num === null || num === undefined || num === "") {
    return "0";
  }

  const cleaned = String(num).replace(/[₹,\s]/g, "");
  const n = Number(cleaned);

  if (Number.isNaN(n)) {
    return String(num);
  }

  if (n >= 10000000) {
    return `${(n / 10000000)
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1")}Cr`;
  }

  if (n >= 100000) {
    return `${(n / 100000)
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1")}L`;
  }

  if (n >= 1000) {
    return `${(n / 1000)
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.\d)0$/, "$1")}K`;
  }

  return n.toString();
};