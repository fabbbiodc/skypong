import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Space_Grotesk, Funnel_Sans } from "next/font/google";
config.autoAddCss = false;
import { LanguageProvider } from "./context/language-context";
import { AuthProvider } from "./context/auth-context";
import { getCurrentLocale } from "./lib/i18n/locale-manager";
import GlobalChatUI from "./ui/global-chat-ui";
import GrainientBackground from "./ui/GrainientBackground";

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const funnelSans = Funnel_Sans({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Transcendence",
  description: "Una Experiencia Trascendental de Pong",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <html lang={getCurrentLocale()}>
          <body
            className={`${funnelSans.variable} ${spaceGrotesk.variable} font-sans`}
          >
            <GrainientBackground />
            {children}
            <GlobalChatUI />
          </body>
        </html>
      </LanguageProvider>
    </AuthProvider>
  );
}
