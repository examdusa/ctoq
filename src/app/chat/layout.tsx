import "@mantine/core/styles.css";
import type { Metadata } from "next";
import Provider from "../_trpc/provider";

export const metadata: Metadata = {
  title: "Content2Quiz",
  description:
    "Transform URLs and Keywords into Comprehensive Question Banks. Harness the power of AI to create customized question sets for education, training, and assessment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Provider>{children}</Provider>;
}
