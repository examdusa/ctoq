"use client";

import { SelectQuestionBank } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import { Flex, Group, Modal, Title, useMantineTheme } from "@mantine/core";
import { useMemo } from "react";
import { z } from "zod";
import RenderProctoredTestForm from "../proctored-test-form";

interface Props {
  open: boolean;
  close: VoidFunction;
  record: SelectQuestionBank;
  userEmail: string;
}

export const questionTypeMapping: Record<string, string> = {
  mcq: "MULTIPLE_CHOICE",
  mcq_similar: "MULTIPLE_CHOICE",
  fill_blank: "FILL_BLANK",
  true_false: "TRUE_FALSE",
  open_ended: "OPEN_ENDED",
  checkbox: "CHECKBOX",
  dropdown: "DROPDOWN",
};

export const googleQuizQuestions = z.object({
  options: z.array(z.string()),
  questionText: z.string(),
  questionType: z.string(),
  answer: z.string(),
  points: z.number(),
  required: z.boolean(),
});

const googleQuizPayloadSchema = z.object({
  formTitle: z.string(),
  ownerEmail: z.string().email(),
  studentEmail: z.string().email(),
  questions: z.array(googleQuizQuestions),
  shareWithInvite: z.boolean(),
});

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Invalid email",
    })
    .optional()
    .or(z.literal("")),
});

export type GoogleQuizPayloadSchema = z.infer<typeof googleQuizPayloadSchema>;
export type GoogleQuizQuestionsSchema = z.infer<typeof googleQuizQuestions>;

function GoogleQuizModal({ open, close, record, userEmail }: Props) {
  const subscription = useAppStore((state) => state.subscription);
  const theme = useMantineTheme();

  const modalTitle = useMemo(() => {
    let content = (
      <Group gap={"xl"} w={"100%"} justify="start" align="center">
        <Title order={5}>Google Quiz</Title>
      </Group>
    );

    if (subscription) {
      const { planName } = subscription;

      if (planName === "Integrated") {
        content = (
          <Group gap={"xl"} w={"100%"} justify="start" align="center">
            <Title order={5}>Google Quiz</Title>
          </Group>
        );
      }
    }
    return content;
  }, [subscription]);

  return (
    <Modal
      opened={open}
      onClose={close}
      size={"xl"}
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      title={modalTitle}
      styles={{
        body: {
          width: "100%",
          minHeight: "20vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Flex
        direction={"column"}
        w={"100%"}
        gap={"sm"}
        justify={"center"}
        align={"center"}
        h={"100%"}
        styles={{
          root: {
            flexGrow: 1,
          },
        }}
      >
        <RenderProctoredTestForm
          record={record}
          close={close}
          userEmail={userEmail}
        />
      </Flex>
    </Modal>
  );
}

export { GoogleQuizModal };

