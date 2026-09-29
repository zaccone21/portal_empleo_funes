import type { Metadata } from "next";
import { Be_Vietnam_Pro, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

// Municipal typography (D-019). Be Vietnam Pro is not a variable font, so the
// weights must be listed; Sora is variable and loads every weight.
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  // Each page sets its own title (WCAG 2.4.2) and the template adds the portal name.
  title: {
    default: "Portal de Empleo — Municipalidad de Funes",
    template: "%s — Portal de Empleo Funes",
  },
  description:
    "Portal de Empleo de la Municipalidad de Funes: ofertas laborales, postulaciones y gestión de la Oficina de Empleo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={cn("h-full antialiased", beVietnam.variable, sora.variable)}
    >
      <body className="min-h-full flex flex-col">
        {/* First thing a keyboard reaches: jumps over the top bar to the page's
            <main id="contenido"> (WCAG 2.4.1). Hidden until it gets focus. */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:text-base focus:text-foreground focus:ring-3 focus:ring-ring"
        >
          Saltar al contenido
        </a>
        {children}
        {/* The app has no dark mode, but the Toaster follows the OS theme
            unless forced (it reads next-themes without a provider). */}
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  );
}
