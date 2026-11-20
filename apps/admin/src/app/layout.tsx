import type { Metadata, Viewport } from "next";
import { Montserrat, Work_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BautistaGo Admin — Panel Administrador",
  description: "Panel de administración y control operativo de Carnitas Bautista",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#005dac",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${workSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fcf9f8] text-[#1b1c1c] font-sans">
        {children}
      </body>
    </html>
  );
}
