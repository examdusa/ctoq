"use client";

import { useUser } from "@clerk/nextjs";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode, useEffect } from "react";
import { AppHeader } from "./app-header/header";

interface Props {
  children: ReactNode;
}

function AppLayout({ children }: Props) {
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
    <AppShell
      header={{ height: 60, offset: true }}
      styles={{
        root: {
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100%",
        },
      }}
    >
      <AppShell.Header
        className="flex w-full"
        onResize={(event) => {
          if (event.currentTarget.clientWidth < 300) {
            close();
          }
        }}
      >
        <AppHeader />
      </AppShell.Header>
      <AppShell.Main
        mx={2}
        styles={{
          main: {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
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
