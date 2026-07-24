import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/authcontext";
import { ThemeProvider } from "@/components/theme-provider";
import { RbacProvider } from "@/context/rbacContext";
import { Providers } from "./providers";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  title: "CodeColiseum",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RbacProvider>
              <Providers>
                <main>{children}</main>
              </Providers>
              <Toaster />
            </RbacProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
