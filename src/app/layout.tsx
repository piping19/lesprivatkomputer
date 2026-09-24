import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LesKomputer - Kursus Komputer: Office, Pemrograman & Desain Grafis",
  description:
    "Les komputer dengan program Microsoft Office, Pemrograman, dan Desain Grafis (Photoshop & CorelDRAW). Pendaftaran peserta baru langsung via WhatsApp.",
  keywords: [
    "kursus komputer",
    "les komputer",
    "belajar office",
    "kursus pemrograman",
    "kursus desain grafis",
    "belajar photoshop",
    "belajar coreldraw",
  ],
  openGraph: {
    title: "LesKomputer - Kursus Komputer Terbaik",
    description:
      "Program Microsoft Office, Pemrograman, dan Desain Grafis. Daftar mudah via WhatsApp.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} antialiased bg-white font-sans text-slate-800`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
