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
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { z } from "zod";
import {
  GoogleQuizPayloadSchema,
  GoogleQuizQuestionsSchema,
  questionTypeMapping,
} from "./modals/google-quiz-modal";

interface Props {
  record: SelectQuestionBank;
  userEmail: string;
  close: VoidFunction
}

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

export default function NonProctoredGoogleQuiz({ record, userEmail, close }: Props) {
  const theme = useMantineTheme();
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
    isLoading: addingToRecord,
  } = trpc.addGoogleQuizLinkToRec.useMutation();
  const questions = useAppStore((state) => state.questions);
  const setQuestions = useAppStore((state) => state.setQuestions);
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

  if (quizCreated && addedToRec) {
    return (
      <Flex
        direction={"column"}
        w={"100%"}
        styles={{
          root: {
            flexGrow: 1,
          },
        }}
      >
        <Center w={"100%"} h={"100%"} display={"flex"} flex={1}>
          <Text size="md" fw={900} variant="gradient">
            Google quiz has been created. Do you want to open ?
          </Text>
        </Center>
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
      </Flex>
    );
  }

  if (createQuizError || addToRecError) {
    return (
      <Flex
        direction={"column"}
        w={"100%"}
        styles={{
          root: {
            flexGrow: 1,
          },
        }}
      >
        <Center w={"100%"} h={"100%"} display={"flex"} flex={1}>
          <Text size="md" fw={900} variant="gradient">
            An unexpected error occured. Please retry after some time.
          </Text>
        </Center>
        <Button
          variant="filled"
          onClick={close}
          disabled={creatingQuiz}
          loading={creatingQuiz}
          ml={"auto"}
        >
          Close
        </Button>
      </Flex>
    );
  }

  if (creatingQuiz || addingToRecord) {
    return (
      <Center w={"100%"} h={"100%"} display={"flex"} flex={1}>
        <Loader color="orange" size="lg" type="dots" />
      </Center>
    );
  }

  return (
    <>
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
    </>
  );
}
