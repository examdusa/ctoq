"use client";

import { Card, Skeleton, Text, useMantineTheme } from "@mantine/core";

function NoQuestion() {
  const theme = useMantineTheme();
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder w={"50%"}>
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
      <Text size="md" c="black" pt={"md"}>
        The right section shows the historical Question bank records.
      </Text>
      <Text size="md" c="black" ta={"center"}>
        Select one to view.
      </Text>
    </Card>
  );
}

export { NoQuestion };
