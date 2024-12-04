"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import { createGoogleQuizForm, QuestionSchema } from "@/utllities/apiFunctions";
import { OpenendedQuestionSchema } from "@/utllities/zod-schemas-types";
import {
  Button,
  Center,
  Flex,
  Group,
  Loader,
  Modal,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { z } from "zod";

interface Props {
  open: boolean;
  close: VoidFunction;
  record: SelectQuestionBank;
  userEmail: string;
}

const questionTypeMapping: Record<string, string> = {
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
  const {
    mutateAsync: createGQuiz,
    isError: createQuizError,
    isSuccess: quizCreated,
    isLoading: creatingQuiz,
    data: quizLink,
  } = useMutation({
    mutationFn: createGoogleQuizForm,
  });
  const {
    mutateAsync: addGoogleQuizLinkToRec,
    isError: addToRecError,
    isSuccess: addedToRec,
  } = trpc.addGoogleQuizLinkToRec.useMutation();
  const questions = useAppStore((state) => state.questions);
  const setQuestions = useAppStore((state) => state.setQuestions);
  const theme = useMantineTheme();

  const form = useForm<FormSchema>({
    mode: "controlled",
    validate: zodResolver(formSchema),
    initialValues: {
      email: "",
    },
  });

  const updateQuestionRecord = useCallback(
    (quizLink: string) => {
      const updatedQuestionsList = { ...questions };
      updatedQuestionsList[record.id].googleQuizLink = quizLink;
      setQuestions({ ...updatedQuestionsList });
    },
    [questions, record.id, setQuestions]
  );

  const handleCreateQuiz = useCallback(
    async (email: string | undefined) => {
      const { questionType } = record;
      let formattedQuestions: GoogleQuizQuestionsSchema[] = [];
      if (questionType === "open_ended") {
        formattedQuestions = (
          record.questions as OpenendedQuestionSchema[]
        ).map((question) => {
          let qType: (typeof questionTypeMapping)[keyof typeof questionTypeMapping] =
            "MULTIPLE_CHOICE";
          if (
            typeof record.questionType === "string" &&
            record.questionType in questionTypeMapping
          ) {
            qType = questionTypeMapping[record.questionType];
          }
          return {
            answer: question.answer,
            options: [],
            points: 1,
            questionText: question.question,
            questionType: qType,

            required: true,
          };
        });
      } else {
        formattedQuestions = (record.questions as QuestionSchema[]).map(
          (question) => {
            let qType: (typeof questionTypeMapping)[keyof typeof questionTypeMapping] =
              "MULTIPLE_CHOICE";

            if (
              typeof record.questionType === "string" &&
              record.questionType in questionTypeMapping
            ) {
              qType = questionTypeMapping[record.questionType];
            }

            return {
              answer: question.options[question.answer],
              options: Object.values(question.options),
              points: 1,
              questionText: question.question,
              questionType: qType,

              required: true,
            };
          }
        );
      }

      const payload: GoogleQuizPayloadSchema = {
        questions: formattedQuestions,
        formTitle: record.prompt ?? "",
        ownerEmail: userEmail,
        studentEmail: !email ? userEmail : email,
        shareWithInvite: true,
      };
      const quizLink = await createGQuiz(payload);
      await addGoogleQuizLinkToRec({ recId: record.id, gQuizLink: quizLink });
      updateQuestionRecord(quizLink);
    },
    [
      createGQuiz,
      record,
      addGoogleQuizLinkToRec,
      userEmail,
      updateQuestionRecord,
    ]
  );

  function openGoogleQuizLink() {
    if (quizLink) {
      window.open(quizLink, "_blank");
      close();
    }
  }

  const modalConent = useMemo(() => {
    if (quizCreated && addedToRec) {
      return (
        <Text size="md" fw={900} variant="gradient">
          Google quiz has been created. Do you want to open ?
        </Text>
      );
    } else if (createQuizError || addToRecError) {
      return (
        <Text size="md" fw={900} variant="gradient">
          An unexpected error occured. Please retry after some time.
        </Text>
      );
    }
    return (
      <Center w={"100%"} h={"100%"}>
        <Loader color="orange" size="lg" type="bars" />
      </Center>
    );
  }, [createQuizError, quizCreated, addToRecError, addedToRec]);

  return (
    <Modal
      opened={open}
      onClose={close}
      size={"md"}
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      title="Google Quiz"
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
        {!creatingQuiz && !createQuizError && !quizCreated ? (
          <form
            onSubmit={form.onSubmit((values) => {
              handleCreateQuiz(values.email);
            })}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <TextInput
              {...form.getInputProps("email")}
              onChange={(e) => form.setFieldValue("email", e.target.value)}
              label="Send to the student's email ?"
              placeholder="Enter student's email"
              styles={{
                label: {
                  fontSize: theme.fontSizes.md,
                },
              }}
            />
            <Button variant="filled" ml={"auto"} mt={"auto"} type="submit">
              Create
            </Button>
          </form>
        ) : (
          modalConent
        )}
      </Flex>
      {quizCreated && (
        <Group justify="end" w={"100%"} pt={"sm"}>
          <Button
            variant="filled"
            onClick={close}
            disabled={creatingQuiz}
            loading={creatingQuiz}
          >
            No
          </Button>
          <Button
            variant="filled"
            onClick={openGoogleQuizLink}
            disabled={creatingQuiz}
            loading={creatingQuiz}
          >
            Open
          </Button>
        </Group>
      )}
    </Modal>
  );
}

export { GoogleQuizModal };
