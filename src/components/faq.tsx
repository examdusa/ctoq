"use client";

import {
  Avatar,
  Flex,
  Paper,
  Pill,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCpu,
  IconFileIsr,
  IconPencil,
  IconWorld,
} from "@tabler/icons-react";

function HowItWorks() {
  const theme = useMantineTheme();

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      w={"100%"}
      justify={"space-between"}
      gap={"md"}
      maw={{ xs: "90%", md: "80%", xl: "80%" }}
      px={{ base: "xs", lg: 0 }}
    >
      <Paper
        radius="md"
        p="md"
        maw={{ base: "100%", lg: "25%" }}
        withBorder
        styles={{
          root: {
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      >
        <Avatar color="blue" radius="xl" size={"lg"}>
          <IconFileIsr size={30} />
        </Avatar>
        <Flex direction={"row"} w={"100%"} gap={"sm"} align={"center"}>
          <Pill size="md" my={"xs"} c={"white"} bg={theme.colors.teal[6]}>
            Step 1
          </Pill>
          <Text fw={700} size="lg">
            Input your content
          </Text>
        </Flex>
        <Text mt={"sm"} fw={"lighter"} size="sm">
          Update any default parameter and simply type any keyword or copy/past
          any url or upload your pdf document (book, article).
        </Text>
      </Paper>
      <Paper
        radius="md"
        p="md"
        maw={{ base: "100%", lg: "25%" }}
        withBorder
        styles={{
          root: {
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      >
        <Avatar color="blue" radius="xl" size={"lg"}>
          <IconCpu size={30} />
        </Avatar>
        <Flex direction={"row"} w={"100%"} gap={"sm"} align={"center"}>
          <Pill size="md" my={"xs"} c={"white"} bg={theme.colors.teal[6]}>
            Step 2
          </Pill>
          <Text fw={700} size="lg">
            AI-Powered Output
          </Text>
        </Flex>
        <Text mt={"sm"} fw={"lighter"} size="sm">
          Based on your parameters AI will provide an output. It could be a
          question bank or it could be a guidance or document summary
        </Text>
      </Paper>
      <Paper
        radius="md"
        p="md"
        maw={{ base: "100%", lg: "25%" }}
        withBorder
        styles={{
          root: {
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      >
        <Avatar color="blue" radius="xl" size={"lg"}>
          <IconPencil size={30} />
        </Avatar>
        <Flex direction={"row"} w={"100%"} gap={"sm"} align={"center"}>
          <Pill size="md" my={"xs"} c={"white"} bg={theme.colors.teal[6]}>
            Step 3
          </Pill>
          <Text fw={700} size="lg">
            Customize
          </Text>
        </Flex>
        <Text mt={"sm"} fw={"lighter"} size="sm">
          Review the output. Fine tune your output based on your audience.
        </Text>
      </Paper>
      <Paper
        radius="md"
        p="md"
        maw={{ base: "100%", lg: "25%" }}
        withBorder
        styles={{
          root: {
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
        }}
      >
        <Avatar color="blue" radius="xl" size={"lg"}>
          <IconWorld size={30} />
        </Avatar>
        <Flex direction={"row"} w={"100%"} gap={"sm"} align={"center"}>
          <Pill size="md" my={"xs"} c={"white"} bg={theme.colors.teal[6]}>
            Step 4
          </Pill>
          <Text fw={700} size="lg">
            Publish and engage
          </Text>
        </Flex>
        <Text mt={"sm"} fw={"lighter"} size="sm">
          Create google form of the output (question bank of guidance). Share
          with intended audience. Track real time response and built in google
          analytics.
        </Text>
      </Paper>
    </Flex>
  );
}

export { HowItWorks };
