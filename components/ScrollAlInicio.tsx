"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/** Al abrir una ficha sin ancla, el scroll vuelve arriba aunque el fallback haya sido corto. */
export function ScrollAlInicio() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const html = document.documentElement;
    const anclaje = html.style.overflowAnchor;
    html.style.overflowAnchor = "none";

    if (window.location.hash) {
      return () => {
        html.style.overflowAnchor = anclaje;
      };
    }

    const irArriba = () => {
      const previo = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      html.style.scrollBehavior = previo;
    };

    irArriba();
    const frame = requestAnimationFrame(irArriba);
    return () => {
      cancelAnimationFrame(frame);
      html.style.overflowAnchor = anclaje;
    };
  }, [pathname]);

  return null;
}
