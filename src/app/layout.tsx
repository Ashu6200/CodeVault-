import { JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandMenu } from '@/components/CommandMenu';
import { Metadata } from 'next';
import { Geist } from "next/font/google";

const geist = Geist({
  variable: "--font-inter",
  subsets: ["latin"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "CodeVault 2.0",
  description: "Secure Modular Monolith SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable} ${playfair.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <StoreProvider>
            {children}
            <CommandMenu />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

