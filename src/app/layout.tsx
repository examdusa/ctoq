import { ClerkAuthWrapper } from "@/components/clerk-auth-wapper";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Provider from "./_trpc/provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Content2Quiz",
  description:
    "Transforms URLs and Keywords into Comprehensive Question Banks. Harness the power of AI to create customized question sets for education, training, and assessment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/content2Quiz.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        <Provider>
          <MantineProvider defaultColorScheme="light" forceColorScheme="light">
            <ClerkAuthWrapper>{children}</ClerkAuthWrapper>
          </MantineProvider>
        </Provider>
      </body>
    </html>
  );
}
