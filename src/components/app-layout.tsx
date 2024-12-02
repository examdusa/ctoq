"use client";

import { SelectSubscription } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode, useEffect } from "react";
import { AppHeader } from "./header";

interface Props {
  children: ReactNode;
  subscriptionDetails: SelectSubscription | undefined;
}

function AppLayout({ children, subscriptionDetails }: Props) {
  const [, { close, open }] = useDisclosure();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      close();
    } else {
      open();
    }
  }, [isSignedIn, close, open]);

  return (
    <AppShell header={{ height: 60, offset: true }}>
      <AppShell.Header
        className="flex w-full"
        onResize={(event) => {
          if (event.currentTarget.clientWidth < 300) {
            close();
          }
        }}
      >
        <AppHeader subscriptionDetail={subscriptionDetails} />
      </AppShell.Header>
      <AppShell.Main
        mx={2}
        styles={{
          main: {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            // height: "100%",
            width: "100%",
          },
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export { AppLayout as ThemeWrapper };
