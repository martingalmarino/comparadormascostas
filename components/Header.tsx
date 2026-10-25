"use client";

import { Menu, PawPrint, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/site.config";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/comparar", label: "Comparador" },
  { href: "/precios", label: "Precios" },
  { href: "/cordoba", label: "Córdoba" },
];

function Logo() {
  const name = siteConfig.siteName;
  const index = name.toLowerCase().indexOf("compara");
  return (
    <span className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
      {index > 0 ? (
        <>
          {name.slice(0, index)}
          <span className="text-indigo-600">{name.slice(index)}</span>
        </>
      ) : (
        name
      )}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="rounded-lg bg-indigo-600 p-1.5 text-white">
            <PawPrint className="size-5" aria-hidden="true" />
          </span>
          <Logo />
          {siteConfig.showProvisionalBadge ? (
            <span className="hidden rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 sm:inline">
              {siteConfig.siteNameNote}
            </span>
          ) : null}
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex" aria-label="Principal">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={active ? "text-indigo-600" : "hover:text-indigo-600"} aria-current={active ? "page" : undefined}>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-xl border border-gray-200 text-gray-700 md:hidden"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>
      {open ? (
        <nav id="menu-movil" className="border-t border-gray-100 px-4 py-3 md:hidden" aria-label="Móvil">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block rounded-xl px-3 py-3 font-medium text-gray-800 hover:bg-gray-50" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/como-comparamos" className="block rounded-xl px-3 py-3 font-medium text-gray-800 hover:bg-gray-50" onClick={() => setOpen(false)}>
                Cómo comparamos
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
