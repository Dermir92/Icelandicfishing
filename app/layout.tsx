import type { Metadata } from "next";
import "./globals.css";

import { AppHeader } from "@/components/shared/app-header";
import { SiteFooter } from "@/components/shared/site-footer";

export const metadata: Metadata = {
  title: "Veiðistaðir | Veiði á Íslandi, skýrt sett fram",
  description:
    "Kortamiðaður vefur fyrir veiðistaði á Íslandi þar sem hægt er að finna staði eftir fisktegund, svæði, tímabili og aðgengi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is">
      <body className="bg-white text-ink antialiased">
        <div className="relative min-h-screen bg-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(111,149,153,0.08),transparent_28%)]" />
          <div className="relative">
            <AppHeader />
            {children}
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
