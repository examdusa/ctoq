"use client";

import { Flex, LoadingOverlay, Text } from "@mantine/core";
import { RingLoader } from "./ring-loader";

interface Props {
  opened: boolean;
}

function OverlayModal({ opened }: Props) {
  return (
    // <Box pos="relative">
    // </Box>
    <LoadingOverlay
      visible={opened}
      loaderProps={{
        children: (
          <Flex direction={"column"} h="auto" w="auto" gap={3} align={"center"}>
            <RingLoader width={80} height={80} />
            <Text>Generating questions...</Text>
          </Flex>
        ),
      }}
    />
  );
}

export { OverlayModal };
