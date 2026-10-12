import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { loadPublications } from "@/lib/publications";
import "./globals.css";

// next/font downloads the fonts at build time and serves them from this app (no runtime Google request).
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

// Every page renders per request: pages show live API data (admin edits appear on the next load), the nav
// depends on whether Research has entries, and the API isn't reachable during `docker compose build`.
// Fine for a local demo; on a public site I'd cache and revalidate when admin data changes.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Prathamesh Patil", template: "%s · Prathamesh Patil" },
};

// Runs before the page paints: use the saved theme, else the OS setting. Prevents a light/dark flash.
const themeScript = `(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}
if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
document.documentElement.dataset.theme=t})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Research stays out of the nav until at least one real publication exists (and if the API is down).
  const publications = await loadPublications();
  const showResearch = (publications?.length ?? 0) > 0;

  return (
    // suppressHydrationWarning: the script above changes data-theme before React hydrates.
    <html lang="en" className={`${geist.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <SiteHeader showResearch={showResearch} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
