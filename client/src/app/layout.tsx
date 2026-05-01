import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { SocketProvider } from "@/lib/socket";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandMenu } from '@/components/CommandMenu';
import { Metadata } from 'next';
import { BackgroundBlobs } from "@/components/ui/BackgroundBlobs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <SocketProvider>
              <BackgroundBlobs />
              {children}
              <CommandMenu />
            </SocketProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
