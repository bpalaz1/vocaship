import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import FloatingXP from "./components/FloatingXP";
import { LanguageProvider } from "./context/LanguageContext";
import { ExperienceProvider } from "./context/ExperienceContext";
import { PersonaProvider } from "./context/PersonaContext";
import { UserStoriesProvider } from "./context/UserStoriesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vocaship | Akıllı Kelime ve Okuma Platformu",
  description: "Bilimsel SM-2 aralıklı tekrar algoritması, çok dilli interaktif okuma odası ve sınıf içi etkileşimli kelime arenası.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden w-full max-w-[100vw]">
        <LanguageProvider>
          <ExperienceProvider>
            <PersonaProvider>
              <UserStoriesProvider>
                {/* Global Floating XP Bildirimi */}
                <FloatingXP />

                {/* Global Ortak Navbar */}
                <Navbar />

                {/* Sayfa İçeriği: Navbar h-16 için dikey boşluk */}
                <div className="flex-1 flex flex-col pt-16 overflow-x-hidden w-full max-w-[100vw]">
                  {children}
                </div>
              </UserStoriesProvider>
            </PersonaProvider>
          </ExperienceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
