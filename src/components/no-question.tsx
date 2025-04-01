"use client";

import { useAppStore } from "@/store/app-store";
import {
  Avatar,
  Card,
  Flex,
  Skeleton,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import Image from "next/image";
import { useMemo } from "react";

function NoQuestion() {
  const theme = useMantineTheme();
  const renderQIdx = useAppStore((state) => state.renderQIdx);
  const questions = useAppStore((state) => state.questions);

  const questionsAvailable = useMemo(() => {
    if (Object.keys(questions).length > 0) {
      return true;
    }
    return false;
  }, [questions]);

  if (!renderQIdx && questionsAvailable) {
    return (
      <Flex
        align={"center"}
        justify={"center"}
        direction={"column"}
        my={"auto"}
        mx={"auto"}
        w={"auto"}
      >
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          w={"100%"}
          h={"100%"}
        >
          <Card.Section
            h={{ xs: 50, md: 80 }}
            mx={"sm"}
            p={"md"}
            styles={{
              section: {
                border: `1px solid ${theme.colors.teal[3]}`,
                borderRadius: theme.radius.md,
                position: "relative",
              },
            }}
            visibleFrom="lg"
          >
            <Skeleton height={30} radius="sm" width={"60%"} animate={false} />
            <Skeleton
              height={8}
              radius="sm"
              width={"20%"}
              animate={false}
              ml={"auto"}
              mt={"md"}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={50}
              height={50}
              viewBox="0 0 24 24"
              fill="white"
              stroke="teal"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-mouse-pointer-click absolute top-0 right-0"
            >
              <path d="M14 4.1 12 6" />
              <path d="m5.1 8-2.9-.8" />
              <path d="m6 12-1.9 2" />
              <path d="M7.2 2.2 8 5.1" />
              <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" />
            </svg>
          </Card.Section>
          <Card.Section hiddenFrom="lg" mx={"auto"}>
            <Avatar variant="filled" color={"blue"}>
              <IconHistory />
            </Avatar>
          </Card.Section>
          <Text size="md" c="black" pt={"md"} ta={"center"}>
            Use the icon located at the top left to see all the historical
            generated question banks.
          </Text>
        </Card>
      </Flex>
    );
  }

  if (!questionsAvailable) {
    return (
      <Flex
        h={"100%"}
        w={"100%"}
        align={"center"}
        justify={"center"}
        styles={{
          root: {
            flexGrow: 1,
          },
        }}
        direction={"column"}
      >
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          maw={'40%'}
          styles={{
            root: {
              display: "flex",
              flexDirection: "column",
              width: '100%',
              alignItems: "center",
              gap: theme.spacing.sm,
            },
          }}
        >
          <Image
            src={"/images/no-history.png"}
            width={150}
            height={150}
            alt="No history"
          />
          <Title
            fw={300}
            order={2}
            styles={{
              root: {
                color: theme.colors.gray[7],
              },
            }}
          >
            No records
          </Title>
        </Card>
      </Flex>
    );
  }
  return null;
}

export { NoQuestion };
