export function DirectAnswer({ text, align = "start" }: { text: string; align?: "start" | "center" }) {
  const alignClass = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";
  return <p className={`mt-4 text-base leading-relaxed text-gray-700 ${alignClass}`}>{text}</p>;
}
