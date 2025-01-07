"use client";

import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import {
  mcqQuestionSchema,
  MCQQuestionSchema,
} from "@/utllities/zod-schemas-types";
import {
  Avatar,
  Box,
  Button,
  CSSProperties,
  Flex,
  Grid,
  Group,
  Input,
  Modal,
  Select,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMemo } from "react";
import { OverlayModal } from "./loader";

interface Props {
  open: boolean;
  close: VoidFunction;
  question: MCQQuestionSchema;
  questionId: string;
  questionType: string;
  index: number;
}

export default function EditMcqSimilarQuestion({
  open,
  close,
  question,
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

  const editForm = useForm<MCQQuestionSchema>({
    validate: zodResolver(mcqQuestionSchema),
    initialValues: {
      ...question,
      options: [...question.options],
      answer: question.answer,
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

  async function handleUpdateQuestion(values: MCQQuestionSchema) {
    await updateQuestion(
      {
        question: values,
        index: index,
        questionId: questionId,
        questionType: questionType,
      },
      {
        onSuccess: (_, variable) => {
          const { questionType } = variable;
          if (questionType === "mcq") {
          }
          const quesRec = { ...questions[questionId] };
          const updatedList = quesRec.questions as MCQQuestionSchema[];
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
          <Input.Wrapper label={<Title order={5}>Question</Title>}>
            <Input {...editForm.getInputProps("question")} pt={"xs"} />
          </Input.Wrapper>
          <Box>
            <Title order={5}>Options</Title>
            <Grid pt={"xs"} pl={"sm"}>
              {Object.entries(editForm.values.options).map(
                ([key, value], index) => {
                  return (
                    <Grid.Col span={{ xs: 12, md: 6 }} key={key}>
                      <TextInput
                        {...editForm.getInputProps(`options.${key}`)}
                        w={"100%"}
                        leftSection={
                          <Avatar color="blue" radius={"sm"} size={"sm"}>
                            {String.fromCharCode(65 + index)}
                          </Avatar>
                        }
                      />
                    </Grid.Col>
                  );
                }
              )}
            </Grid>
          </Box>
          <Box>
            <Select
              label="Correct Answers"
              placeholder="Pick value"
              data={question.options.map((item) => ({
                label: item,
                value: item,
              }))}
              {...editForm.getInputProps("answer")}
            />
          </Box>
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
