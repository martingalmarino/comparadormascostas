/** Normaliza un WhatsApp argentino a 10 dígitos nacionales (sin 0, sin 15 y sin +54 9). */
export function normalizeArWhatsapp(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("54")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("9") && digits.length >= 11 && digits.length <= 13) {
    digits = digits.slice(1);
  }
  if (digits.length >= 12 && digits.includes("15")) {
    const index = digits.indexOf("15");
    if (index > 0) {
      const candidate = `${digits.slice(0, index)}${digits.slice(index + 2)}`;
      if (candidate.length === 10) digits = candidate;
    }
  }
  return digits.length === 10 ? digits : null;
}
