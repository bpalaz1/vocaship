import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import FloatingXP from "./components/FloatingXP";
import ActiveClassBanner from "./components/classroom/ActiveClassBanner";
import MainContentWrapper from "./components/MainContentWrapper";
import { LanguageProvider } from "./context/LanguageContext";
import { ExperienceProvider } from "./context/ExperienceContext";
import { PersonaProvider } from "./context/PersonaContext";
import { UserStoriesProvider } from "./context/UserStoriesContext";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { ThemeProvider } from "./context/ThemeContext";

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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('vocaship_app_theme') || localStorage.getItem('vocaship_reader_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-indigo-500 selection:text-white overflow-x-hidden w-full max-w-[100vw] transition-colors duration-150">
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider>
              <LanguageProvider>
                <ExperienceProvider>
                  <PersonaProvider>
                    <UserStoriesProvider>
                      {/* Global Floating XP Bildirimi */}
                      <FloatingXP />

                      {/* Global Ortak Navbar */}
                      <Navbar />

                      {/* Sayfa İçeriği Kapsayıcısı */}
                      <MainContentWrapper>
                        {/* Aktif Ders Devam Ediyor Geri Dönüş Şeridi */}
                        <ActiveClassBanner />
                        {children}
                      </MainContentWrapper>
                    </UserStoriesProvider>
                  </PersonaProvider>
                </ExperienceProvider>
              </LanguageProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
