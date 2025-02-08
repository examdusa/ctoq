"use client";

import { Button, Flex, Image, Title } from "@mantine/core";
import {
  default as CheckIcon,
  default as ErrorIcon,
} from "../../../public/images/Success.gif";

interface Props {
  closeHanlder: VoidFunction;
  message: string
}

function SuccessAlert({ closeHanlder, message }: Props) {
  return (
    <Flex
      direction={"column"}
      w={"100%"}
      flex={1}
      align={"center"}
      justify={"center"}
      gap={"md"}
    >
      <Image
        src={CheckIcon.src}
        alt="check-icon"
        sizes={"50"}
        styles={{
          root: {
            flex: "none",
            width: "auto",
          },
        }}
      />
      <Title order={3}>{message}</Title>
      <Button variant="filled" mt={"md"} onClick={closeHanlder}>
        Close
      </Button>
    </Flex>
  );
}

function ErrorAlert({ closeHanlder, message }: Props) {
  return (
    <Flex
      direction={"column"}
      w={"100%"}
      flex={1}
      align={"center"}
      justify={"center"}
      gap={"md"}
    >
      <Image
        src={ErrorIcon.src}
        alt="error-icon"
        sizes={"50"}
        styles={{
          root: {
            flex: "none",
            width: "auto",
          },
        }}
      />
      <Title order={3}>{message}</Title>
      <Button variant="filled" mt={"md"} onClick={closeHanlder}>
        Close
      </Button>
    </Flex>
  );
}

export { SuccessAlert , ErrorAlert  };
