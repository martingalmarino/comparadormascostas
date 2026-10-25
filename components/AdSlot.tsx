"use client";

import { useConsent } from "@/components/consent";
import { siteConfig } from "@/site.config";
import { useEffect, useRef } from "react";

export function AdSlot({
  variant = "inline",
  slot,
}: {
  variant?: "inline" | "sidebar" | "banner";
  slot?: string;
}) {
  const consent = useConsent();
  const pushed = useRef(false);
  const adSlot = slot || process.env.NEXT_PUBLIC_ADSENSE_SLOT || "";
  const active = Boolean(consent?.ads && siteConfig.adsEnabled && siteConfig.adsenseClient && adSlot);
  const minHeight = variant === "sidebar" ? "min-h-[600px]" : "min-h-[120px]";

  useEffect(() => {
    if (!active || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      pushed.current = false;
    }
  }, [active]);

  return (
    <aside aria-label="Publicidad" className={`flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-4 ${minHeight}`}>
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Publicidad</span>
      {active ? (
        <ins
          className="adsbygoogle mt-3 block flex-1"
          style={{ display: "block" }}
          data-ad-client={siteConfig.adsenseClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="mt-3 flex-1 rounded-lg border border-dashed border-gray-200" />
      )}
    </aside>
  );
}
