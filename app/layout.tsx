import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { getReferenceDate } from "@/lib/dates";
import { getPlans } from "@/lib/plans";
import { siteConfig } from "@/site.config";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: `Obra social para mascotas en Córdoba`,
    template: `%s · ${siteConfig.siteName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.siteName,
  openGraph: {
    locale: "es_AR",
    siteName: siteConfig.siteName,
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const today = await getReferenceDate();
  const catalog = getPlans().map((plan) => ({
    id: plan.id,
    marca: plan.marca,
    nombre: plan.nombre,
    marca_slug: plan.marca_slug,
  }));

  return (
    <html lang="es-AR" className={`${sans.variable} ${mono.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
        >
          Saltar al contenido
        </a>
        <Providers catalog={catalog}>
          <Header />
          <main id="contenido" className="flex-1">
            {children}
          </main>
          <Footer year={today.slice(0, 4)} />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
