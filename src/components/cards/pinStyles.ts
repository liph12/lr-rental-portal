// Display order and color indicator of each pin
export const PIN_ORDER = [
  "Rent Manager",
  "Rent PH",
  "RMPro",
  "RMPro Elite",
] as const;

export const PIN_COLORS: Record<string, { main: string; bg: string }> = {
  "Rent Manager": { main: "#1976d2", bg: "rgba(25, 118, 210, 0.07)" },
  "Rent PH": { main: "#ed6c02", bg: "rgba(237, 108, 2, 0.08)" },
  RMPro: { main: "#d32f2f", bg: "rgba(211, 47, 47, 0.07)" },
  "RMPro Elite": { main: "#b8860b", bg: "rgba(184, 134, 11, 0.12)" },
};
