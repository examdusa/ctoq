"use client";

import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import {
  trueFalseQuestionSchema,
  TrueFalseQuestionsScheam,
} from "@/utllities/zod-schemas-types";
import {
  Avatar,
  Box,
  Button,
  CSSProperties,
  Flex,
  Grid,
  Group,
  Modal,
  Select,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMemo } from "react";
import { OverlayModal } from "./loader";

interface Props {
  open: boolean;
  close: VoidFunction;
  question: TrueFalseQuestionsScheam;
  questionId: string;
  questionType: string;
  index: number;
}

export default function EditTrueFalseQuestion({
  open,
  close,
  question: storedQuestion,
  questionId,
  index,
  questionType,
}: Props) {
  const questions = useAppStore((state) => state.questions);
  const setQuestions = useAppStore((state) => state.setQuestions);
  const {
    mutateAsync: updateQuestion,
    isLoading: updatingQuestion,
    isError: updateError,
    isSuccess: updateSuccess,
  } = trpc.updateQuestions.useMutation();

  const editForm = useForm<TrueFalseQuestionsScheam>({
    validate: zodResolver(trueFalseQuestionSchema),
    initialValues: {
      ...storedQuestion,
      question: storedQuestion.question ?? undefined,
      statemen: storedQuestion.statemen ?? undefined,
      Suggested_lines: storedQuestion.Suggested_lines ?? undefined,
    },
  });

  const modalHeaderProps = useMemo(() => {
    let props: CSSProperties = { background: "white", color: "black" };

    if (updateSuccess) {
      props = {
        background: "teal",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    } else if (updateError) {
      props = {
        background: "red",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    }
    return props;
  }, [updateError, updateSuccess]);

  async function handleUpdateQuestion(values: TrueFalseQuestionsScheam) {
    await updateQuestion(
      {
        question: values,
        index: index,
        questionId: questionId,
        questionType: questionType,
      },
      {
        onSuccess: () => {
          const quesRec = { ...questions[questionId] };
          const updatedList = quesRec.questions as TrueFalseQuestionsScheam[];
          updatedList[index] = values;
          setQuestions({
            ...questions,
            [questionId]: {
              ...questions[questionId],
              questions: [...updatedList],
            },
          });
        },
      }
    );
  }

  return (
    <Modal
      opened={open}
      onClose={close}
      title="Edit Question"
      closeOnClickOutside={false}
      withCloseButton={updatingQuestion ? false : true}
      centered
      size={"lg"}
      styles={{
        header: {
          ...modalHeaderProps,
        },
        title: {
          fontWeight: "bolder",
        },
      }}
      p={"md"}
      closeOnEscape={false}
      shadow="lg"
    >
      <OverlayModal opened={updatingQuestion} message="Updating ..." />
      <form
        onSubmit={editForm.onSubmit((values) => handleUpdateQuestion(values))}
      >
        <Flex direction={"column"} w={"100%"} h={"100%"} gap={"lg"}>
          {storedQuestion.question && (
            <TextInput
              withAsterisk
              {...editForm.getInputProps("question")}
              label="Question"
            />
          )}
          {storedQuestion.statemen && (
            <TextInput
              withAsterisk
              {...editForm.getInputProps("statemen")}
              label="Statement"
            />
          )}
          {storedQuestion.Suggested_lines && (
            <Textarea
              withAsterisk
              label="Suggested lines"
              rows={3}
              placeholder="Enter value"
              {...editForm.getInputProps("suggested_lines")}
            />
          )}
          <Box>
            <Title order={6} fw={100}>
              Options
            </Title>
            <Grid pt={1}>
              {Object.entries(editForm.values.options).map(([key, value]) => {
                return (
                  <Grid.Col span={{ xs: 12, md: 6 }} key={key}>
                    <TextInput
                      {...editForm.getInputProps(`options.${key}`)}
                      w={"100%"}
                      leftSection={
                        <Avatar color="blue" radius={"sm"} size={"sm"}>
                          {key}
                        </Avatar>
                      }
                    />
                  </Grid.Col>
                );
              })}
            </Grid>
          </Box>
          <Select
            label="Correct Answer"
            withAsterisk
            placeholder="Pick answer"
            data={[...Object.keys(storedQuestion.options)]}
            checkIconPosition="right"
            {...editForm.getInputProps("answer")}
          />
        </Flex>
        <Group justify="end" pt={"sm"}>
          <Button variant="filled" onClick={close}>
            Close
          </Button>
          <Button variant="filled" type="submit">
            Update
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
