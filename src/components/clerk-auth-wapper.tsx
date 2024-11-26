"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useMantineColorScheme } from "@mantine/core";

interface Props {
  children: React.ReactNode;
}

function ClerkAuthWrapper({ children }: Props) {
  const { colorScheme } = useMantineColorScheme();
  return (
    <ClerkProvider
      appearance={{
        baseTheme: colorScheme === "dark" ? dark : undefined,
        layout: {
          animations: true,
        },
        userProfile: {
          baseTheme: colorScheme === "dark" ? dark : undefined,
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export { ClerkAuthWrapper };
