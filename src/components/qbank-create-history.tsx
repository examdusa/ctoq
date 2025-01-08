"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  Button,
  Flex,
  ScrollArea,
  Stack,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { IconReload } from "@tabler/icons-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useEffect, useMemo, useRef, useState } from "react";
import GroupedTabs from "./grouped-tabs";

dayjs.extend(isBetween);

function QBankCreateHistory() {
  const questions = useAppStore((state) => state.questions);
  const userProfile = useAppStore((state) => state.userProfile);
  const theme = useMantineTheme();
  const renderQIdx = useAppStore((state) => state.renderQIdx);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeFilterIdx, setActiveFilterIdx] = useState(1);
  const { mutateAsync: fetchQuestionsByUserId, isLoading: fetchingQuestions } =
    trpc.getQuestions.useMutation();
  const setQuestions = useAppStore((state) => state.setQuestions);

  const filteredQuestions = useMemo(() => {
    if (questions) {
      return Object.fromEntries(
        Object.entries(questions).filter(([key, value]) => {
          const { createdAt } = value;
          if (createdAt) {
            const createDate = dayjs(createdAt).tz(dayjs.tz.guess());

            if (activeFilterIdx === 0) {
              const startToday = dayjs().startOf("day");
              const endToday = dayjs().endOf("day");
              if (
                createDate.isBetween(startToday, endToday, "millisecond", "[]")
              )
                return { [key]: value };
            } else if (activeFilterIdx === 1) {
              const startToday = dayjs().startOf("week");
              const endToday = dayjs().endOf("week");
              if (
                createDate.isBetween(startToday, endToday, "millisecond", "[]")
              )
                return { [key]: value };
            } else if (activeFilterIdx === 2) {
              const startToday = dayjs().startOf("month");
              const endToday = dayjs().endOf("month");
              if (
                createDate.isBetween(startToday, endToday, "millisecond", "[]")
              )
                return { [key]: value };
            } else {
              return questions;
            }
          }
        })
      );
    }
    return null;
  }, [questions, activeFilterIdx]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [questions]);

  async function fetchQuestions() {
    if (userProfile) {
      await fetchQuestionsByUserId(
        { userId: userProfile.id },
        {
          onSuccess: (data) => {
            if (data) {
              const formattedQuestions: Record<string, SelectQuestionBank> = {};
              if (questions) {
                data.forEach((item) => {
                  formattedQuestions[item.id] = {
                    ...item,
                    questions: item.questions,
                  };
                });
              }
              setQuestions({ ...formattedQuestions });
            }
          },
        }
      );
    }
  }

  return (
    <Flex
      direction={"column"}
      gap={"sm"}
      maw={{ xs: "30%", md: "20%" }}
      w={"100%"}
      my={"xs"}
      styles={{
        root: {
          boxShadow: theme.shadows.md,
          border: `1.5px solid ${theme.colors.gray[3]}`,
          padding: 10,
          borderRadius: theme.radius.md,
        },
      }}
    >
      <GroupedTabs
        items={["Today", "This Week", "This Month", "All"]}
        activeIdx={activeFilterIdx}
        setActiveIdx={setActiveFilterIdx}
      />
      <Button
        variant="filled"
        leftSection={<IconReload />}
        onClick={fetchQuestions}
        loading={fetchingQuestions}
      >
        Refresh
      </Button>
      {filteredQuestions && (
        <ScrollArea
          ref={viewportRef}
          w={"100%"}
          h={"100%"}
          styles={{
            viewport: {
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <Stack
            h={"100%"}
            bg="var(--mantine-color-body)"
            align="stretch"
            justify="start"
            gap="sm"
          >
            {Object.entries(filteredQuestions).map(([key, value]) => {
              return (
                <Tooltip
                  label={value.prompt}
                  key={key}
                  arrowSize={6}
                  multiline
                  w={"100%"}
                  maw={"30%"}
                  withArrow
                  transitionProps={{ duration: 200 }}
                >
                  <UnstyledButton
                    w={"100%"}
                    onClick={() => {
                      useAppStore.setState({ renderQIdx: value.id });
                    }}
                    styles={{
                      root: {
                        background:
                          renderQIdx && renderQIdx === value.id
                            ? "linear-gradient(346deg, rgba(15,128,136,1) 36%, rgba(26,128,198,1) 83%)"
                            : "white",
                        fontSize: theme.fontSizes.sm,
                        fontWeight: "bold",
                        border: `1px solid ${theme.colors.gray[4]}`,
                        borderRadius: theme.radius.md,
                        padding: theme.spacing.xs,
                        color:
                          renderQIdx && renderQIdx === value.id
                            ? "white"
                            : "black",
                      },
                    }}
                  >
                    {value.prompt}
                  </UnstyledButton>
                </Tooltip>
              );
            })}
          </Stack>
        </ScrollArea>
      )}
    </Flex>
  );
}

export { QBankCreateHistory };
