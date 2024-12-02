"use client";

import { Flex, LoadingOverlay, Text } from "@mantine/core";
import { BlinkLoader } from "./loaders";

interface Props {
  opened: boolean;
  message?: string;
  width?: number;
  height?: number;
}

function OverlayModal({
  opened,
  width = 50,
  height = 50,
  message,
}: Props) {
  return (
    <LoadingOverlay
      visible={opened}
      loaderProps={{
        children: (
          <Flex direction={"column"} h="auto" w="auto" gap={3} align={"center"}>
            <BlinkLoader width={width} height={height} />
            <Text>{message}</Text>
          </Flex>
        ),
      }}
    />
  );
}

export { OverlayModal };
