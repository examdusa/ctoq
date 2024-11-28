"use client";

import { Modal } from "@mantine/core";

interface Props {
  open: boolean;
  close: VoidFunction;
}

function GoogleQuizModal({ open, close }: Props) {
  return <Modal opened={open} onClose={close}></Modal>;
}

export { GoogleQuizModal };
