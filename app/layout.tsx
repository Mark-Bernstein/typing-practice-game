import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StyledComponentsRegistry from "./styled-components-registry";
import { AudioProvider } from "./contexts/AudioContext";

// Load fonts via next/font/google
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://typing-prodigy.vercel.app"),

  title: "Typing Prodigy – Futuristic Typing Challenge",
  description:
    "A neon sci-fi typing game built by Mark Bernstein. Features letters, words, story adventures, power-ups, animations, music, SFX, and a live leaderboard.",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/app_icon_16.png", sizes: "16x16", type: "image/png" },
      { url: "/app_icon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/app_icon_64.png", sizes: "64x64", type: "image/png" },
      { url: "/app_icon_128.png", sizes: "128x128", type: "image/png" },
      { url: "/app_icon_256.png", sizes: "256x256", type: "image/png" },
      { url: "/app_icon_512.png", sizes: "512x512", type: "image/png" },
    ],

    shortcut: ["/app_icon_64.png"],

    apple: [
      { url: "/app_icon_128.png", sizes: "128x128" },
      { url: "/app_icon_256.png", sizes: "256x256" },
    ],
  },

  openGraph: {
    title: "Typing Prodigy – Neon Sci-Fi Typing Game",
    description:
      "A futuristic typing adventure built by Mark Bernstein with interactive animations, power-ups, music, SFX, and leaderboard support.",
    url: "https://typing-prodigy.vercel.app",
    siteName: "Typing Prodigy",
    images: [
      {
        url: "/Typing_Prodigy_Image.png",
        width: 1200,
        height: 630,
        alt: "Typing Prodigy – Neon Sci-Fi Typing Game",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Typing Prodigy – Neon Sci-Fi Typing Game",
    description:
      "A neon-themed typing game by Mark Bernstein featuring glowing animations, story mode, and a live leaderboard.",
    images: ["/Typing_Prodigy_Image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StyledComponentsRegistry>
          <AudioProvider>{children}</AudioProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
