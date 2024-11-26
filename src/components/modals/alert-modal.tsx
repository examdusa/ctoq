"use client";

import { Group, Modal, Text } from "@mantine/core";

interface Props {
  open: boolean;
  message: string;
  title: string;
  showCloseButton: boolean;
  close: VoidFunction;
  footer?: React.ReactNode;
}

function AlertModal({
  open,
  message,
  title,
  footer,
  showCloseButton,
  close,
}: Props) {
  return (
    <Modal
      size={"md"}
      opened={open}
      closeOnClickOutside={false}
      withCloseButton={showCloseButton}
      onClose={close}
      shadow="lg"
      title={title}
      centered
      closeOnEscape={false}
    >
      <Text size="md">{message}</Text>
      {footer && (
        <Group mt={"sm"} ml={"auto"} w={'100%'} justify="end">
          {footer}
        </Group>
      )}
    </Modal>
  );
}

export { AlertModal };
