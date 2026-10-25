import Image from "next/image";
import { marcaIniciales } from "@/lib/format";
import { logoMaxBox } from "@/lib/logo";

export function BrandLogo({
  nombre,
  logo,
  width = 160,
  height = 40,
  fallback = "nombre",
  slug,
  className,
  maxWidth = "100%",
}: {
  nombre: string;
  logo?: string | null;
  width?: number;
  height?: number;
  fallback?: "nombre" | "iniciales";
  slug?: string;
  className?: string;
  maxWidth?: string;
}) {
  if (!logo) {
    if (fallback === "iniciales" && slug) {
      return (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 font-bold text-indigo-600">
          {marcaIniciales(slug, nombre)}
        </span>
      );
    }
    return (
      <span className={`inline-flex h-8 items-center text-base font-semibold text-gray-500 transition hover:text-indigo-700 group-hover:text-indigo-700 ${className ?? ""}`}>
        {nombre}
      </span>
    );
  }

  const box = logoMaxBox(logo, { width, height });
  const widthLimit = box.maxWidthPx == null ? maxWidth : `min(${maxWidth}, ${box.maxWidthPx}px)`;

  return (
    <Image
      src={logo}
      alt={`Logo de ${nombre}`}
      width={width}
      height={height}
      unoptimized={logo.endsWith(".svg") || box.maxWidthPx != null}
      className={`w-auto max-w-full object-contain grayscale opacity-70 transition duration-200 hover:grayscale-0 hover:opacity-100 group-hover:grayscale-0 group-hover:opacity-100 ${className ?? ""}`}
      style={{ width: "auto", height: `${box.height}px`, maxHeight: `${height}px`, maxWidth: widthLimit }}
    />
  );
}
