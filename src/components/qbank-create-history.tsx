"use client";

import { SelectQuestionBank } from "@/db/schema";
import { dateFormatter } from "@/utllities/helpers";
import {
  Card,
  Flex,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";

interface Props {
  questions: Record<string, SelectQuestionBank>;
  showRecord: (id: string) => void;
}

function QBankCreateHistory({ questions, showRecord }: Props) {
  const theme = useMantineTheme();
  const [id, setId] = useState("");

  useEffect(() => {
    if (id) {
      showRecord(id);
    }
  }, [id, showRecord]);

  return (
    <Flex
      direction={"column"}
      gap={"sm"}
      maw={{ xs: "30%", md: "20%" }}
      w={"100%"}
      my={"xs"}
      styles={{
        root: {
          flexGrow: 1,
          boxShadow: theme.shadows.md,
          border: `1.5px solid ${theme.colors.gray[3]}`,
          padding: 10,
          borderRadius: theme.radius.md,
        },
      }}
    >
      <ScrollArea
        style={{ height: "calc(100vh - 10vh)", width: "100%" }}
        offsetScrollbars
      >
        <Stack
          h={"100%"}
          bg="var(--mantine-color-body)"
          align="stretch"
          justify="start"
          gap="lg"
        >
          {Object.entries(questions).map(([key, value]) => {
            return (
              <Tooltip
                label={value.prompt}
                key={key}
                arrowSize={6}
                multiline
                w={"auto"}
                maw={"30%"}
                withArrow
                transitionProps={{ duration: 200 }}
              >
                <Card
                  padding="lg"
                  radius="md"
                  withBorder
                  styles={{
                    root: {
                      cursor: "pointer",
                      padding: theme.spacing.xs,
                      background:
                        id === value.id
                          ? "linear-gradient(346deg, rgba(15,128,136,1) 36%, rgba(26,128,198,1) 83%)"
                          : "white",
                    },
                  }}
                  onClick={() => setId(value.id)}
                >
                  <Text
                    size="md"
                    fw={"bolder"}
                    lineClamp={2}
                    variant={"text"}
                    c={id === value.id ? "white" : "black"}
                  >
                    {value.prompt}
                  </Text>
                  {value.createdAt && (
                    <Text
                      size="10"
                      ta={"end"}
                      fw={"lighter"}
                      lh={"sm"}
                      pt={"sm"}
                      variant={"text"}
                      c={id === value.id ? "white" : "black"}
                    >
                      Created at: {dateFormatter(value.createdAt)}
                    </Text>
                  )}
                </Card>
              </Tooltip>
            );
          })}
        </Stack>
      </ScrollArea>
    </Flex>
  );
}

export { QBankCreateHistory };
