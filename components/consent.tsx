"use client";

import Link from "next/link";
import { siteConfig } from "@/site.config";
import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Choice = { analytics: boolean; ads: boolean; at: string };

const ConsentContext = createContext<Choice | null>(null);
const storageKey = "mc_consent";
const pendingSnap = "pending";
const absentSnap = "absent";
let consentSnap = pendingSnap;
let consentReady = false;
const consentListeners = new Set<() => void>();

function readConsentSnap() {
  if (typeof window === "undefined") return pendingSnap;
  if (!consentReady) {
    consentReady = true;
    const raw = window.localStorage.getItem(storageKey);
    consentSnap = raw || absentSnap;
  }
  return consentSnap;
}

function writeConsentSnap(choice: Choice) {
  consentSnap = JSON.stringify(choice);
  window.localStorage.setItem(storageKey, consentSnap);
  consentListeners.forEach((listener) => listener());
}

export function useConsent() {
  return useContext(ConsentContext);
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(
    (listener) => {
      consentListeners.add(listener);
      return () => consentListeners.delete(listener);
    },
    readConsentSnap,
    () => pendingSnap,
  );
  let choice: Choice | null = null;
  if (snap.startsWith("{")) {
    try {
      choice = JSON.parse(snap) as Choice;
    } catch {
      choice = null;
    }
  }
  const ready = snap !== pendingSnap;

  useEffect(() => {
    if (!snap.startsWith("{") || !siteConfig.gaId || document.getElementById("ga4")) return;
    const parsed = JSON.parse(snap) as Choice;
    if (!parsed.analytics) return;
    const script = document.createElement("script");
    script.id = "ga4";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`;
    document.head.appendChild(script);
    const dataLayer = (window.dataLayer = window.dataLayer || []);
    dataLayer.push(["js", new Date()]);
    dataLayer.push(["config", siteConfig.gaId, { anonymize_ip: true }]);
  }, [snap]);

  function save(next: Choice) {
    writeConsentSnap(next);
  }

  return (
    <ConsentContext.Provider value={choice}>
      {children}
      {ready && !choice ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              Usamos cookies de medición si lo aceptás. Los datos del formulario se tratan aparte, según la{" "}
              <Link className="font-semibold text-indigo-700 underline" href="/privacidad">
                Política de privacidad
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800"
                onClick={() => save({ analytics: false, ads: false, at: new Date().toISOString() })}
              >
                Solo necesarias
              </button>
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                onClick={() => save({ analytics: true, ads: true, at: new Date().toISOString() })}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConsentContext.Provider>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
