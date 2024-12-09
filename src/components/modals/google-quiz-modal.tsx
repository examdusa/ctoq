"use client";

import { SelectQuestionBank } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  Checkbox,
  Flex,
  Group,
  Modal,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { z } from "zod";
import NonProctoredGoogleQuiz from "../non-proctored-google-quiz";
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

type FormSchema = z.infer<typeof formSchema>;

export type GoogleQuizPayloadSchema = z.infer<typeof googleQuizPayloadSchema>;
export type GoogleQuizQuestionsSchema = z.infer<typeof googleQuizQuestions>;

function GoogleQuizModal({ open, close, record, userEmail }: Props) {
  const [proctored, setProctored] = useState(false);
  const subscription = useAppStore((state) => state.subscription);
  const theme = useMantineTheme();

  const modalTitle = useMemo(() => {
    let content = (
      <Group gap={"xl"} w={"100%"} justify="start" align="center">
        <Title order={5}>Google Quiz</Title>
        <Tooltip label="Only available in Integrated plan">
          <Checkbox
            label="Proctored Test"
            size="sm"
            disabled
            checked={proctored}
            onChange={(e) => setProctored(e.target.checked)}
            styles={{
              label: {
                fontSize: theme.fontSizes.md,
              },
            }}
          />
        </Tooltip>
      </Group>
    );

    if (subscription) {
      const { planName } = subscription;

      if (planName === "Integrated") {
        content = (
          <Group gap={"xl"} w={"100%"} justify="start" align="center">
            <Title order={5}>Google Quiz</Title>
            <Checkbox
              label="Proctored Test"
              size="sm"
              checked={proctored}
              onChange={(e) => setProctored(e.target.checked)}
              styles={{
                label: {
                  fontSize: theme.fontSizes.md,
                },
              }}
            />
          </Group>
        );
      }
    }
    return content;
  }, [subscription, proctored, setProctored, theme.fontSizes.md]);

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
        {proctored ? (
          <RenderProctoredTestForm
            record={record}
            close={close}
            userEmail={userEmail}
          />
        ) : (
          <NonProctoredGoogleQuiz record={record} userEmail={userEmail} close={close}/>
        )}
      </Flex>
    </Modal>
  );
}

export { GoogleQuizModal };
