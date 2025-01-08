import { ClerkAuthWrapper } from "@/components/clerk-auth-wapper";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import Provider from "./_trpc/provider";
import "./globals.css";
import PendingJobsHandler from "@/components/pending-jobs-handler";
import { AppOrchestrator } from "@/components/app-orchestrator";

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
            <ClerkAuthWrapper>
              {children}
              <PendingJobsHandler />
              <AppOrchestrator />
            </ClerkAuthWrapper>
          </MantineProvider>
        </Provider>
      </body>
      <Script id="live-agent">
        {`
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
    (function(){
var s1=document.createElement("script"),
s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/67521e874304e3196aed018a/1ieccegnl';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();

        `}
      </Script>
    </html>
  );
}
