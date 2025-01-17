"use client";

import { Dialog, Text, useMantineTheme } from "@mantine/core";
import { useMemo } from "react";

interface Props {
  opened: boolean;
  close: VoidFunction;
  title: string;
  message: string;
  variant: "success" | "error" | "info";
}

function AlertDialog({ opened, close, message, title, variant }: Props) {
  const theme = useMantineTheme();

  const dialogStyles = useMemo(() => {
    const style = { background: "", color: "" };

    if (variant === "success") {
      style.background = theme.colors.teal[6];
      style.color = theme.white;
    } else if (variant === "error") {
      style.background = theme.colors.red[6];
      style.color = theme.white;
    } else {
      style.background = theme.colors.blue[6];
      style.color = theme.white;
    }

    return style;
  }, [variant, theme]);

  return (
    <Dialog
      opened={opened}
      withCloseButton
      onClose={close}
      size="lg"
      radius="md"
      styles={{
        root: {
          ...dialogStyles,
        },
      }}
    >
      <Text size="lg" mb="xs" fw={700}>
        {title}
      </Text>
      <Text size="sm" fw={600}>
        {message}
      </Text>
    </Dialog>
  );
}

export { AlertDialog };
