"use client";

import { useAppStore } from "@/app/_store/app-store";
import { trpc } from "@/app/_trpc/client";
import { QuestionSchema } from "@/utllities/apiFunctions";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  CSSProperties,
  Flex,
  Grid,
  Group,
  Input,
  Modal,
  TextInput,
  Title,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { OverlayModal } from "./loader";
import { BlinkLoader } from "./loader/loaders";

interface Props {
  open: boolean;
  close: VoidFunction;
  question: QuestionSchema;
  questionId: string;
  index: number;
}

function EditQuestionModal({
  open,
  close,
  question,
  questionId,
  index,
}: Props) {
  const [updatedQuestion, setUpdatedQuestion] = useState(question);
  const questions = useAppStore((state) => state.questions);
  const {
    mutateAsync: updateQuestion,
    isLoading: updatingQuestion,
    isError: updateError,
    isSuccess: updateSuccess,
  } = trpc.updateQuestions.useMutation();

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

  function handleOptionChange(key: "A" | "B" | "C" | "D", value: string) {
    setUpdatedQuestion((question) => ({
      ...question,
      options: {
        ...question.options,
        [key]: value,
      },
    }));
  }

  async function handleUpdateQuestion() {
    await updateQuestion(
      {
        question: updatedQuestion,
        index: index,
        questionId: questionId,
      },
      {
        onSuccess: () => {
          const quesRec = { ...questions[questionId] };
          const updatedList = quesRec.questions as QuestionSchema[];
          updatedList[index] = updatedQuestion;
          useAppStore.setState({
            questions: {
              ...questions,
              [questionId]: {
                ...questions[questionId],
                questions: [...updatedList],
              },
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
      <OverlayModal
        opened={updatingQuestion}
        message="Updating ..."
      />
      <Flex direction={"column"} w={"100%"} h={"100%"} gap={"lg"}>
        <Input.Wrapper label={<Title order={5}>Question</Title>}>
          <Input
            value={updatedQuestion.question}
            pt={"xs"}
            onChange={(e) => {
              setUpdatedQuestion((question) => ({
                ...question,
                question: e.target.value,
              }));
            }}
          />
        </Input.Wrapper>
        <Box>
          <Title order={5}>Options</Title>
          <Grid pt={"xs"} pl={"sm"}>
            {Object.entries(updatedQuestion.options).map(([key, value]) => {
              return (
                <Grid.Col span={{ xs: 12, md: 6 }} key={key}>
                  <TextInput
                    value={value}
                    w={"100%"}
                    leftSection={
                      <Avatar color="blue" radius={"sm"} size={"sm"}>
                        {key}
                      </Avatar>
                    }
                    onChange={(e) => {
                      handleOptionChange(
                        key as "A" | "B" | "C" | "D",
                        e.target.value
                      );
                    }}
                  />
                </Grid.Col>
              );
            })}
          </Grid>
        </Box>
        <Box>
          <Title order={5}>Correct Answer</Title>
          <Group justify="start" gap={"md"} pt={"xs"}>
            {["A", "B", "C", "D"].map((item, idx) => {
              return (
                <ActionIcon
                  variant="filled"
                  color={updatedQuestion.answer === item ? "green" : "gray"}
                  aria-label="Answer"
                  key={idx}
                  onClick={() => {
                    setUpdatedQuestion((question) => ({
                      ...question,
                      answer: item as "A" | "B" | "C" | "D",
                    }));
                  }}
                >
                  {item}
                </ActionIcon>
              );
            })}
          </Group>
        </Box>
      </Flex>
      <Group justify="end" pt={"sm"}>
        <Button variant="filled" size="compact-md" onClick={close}>
          Close
        </Button>
        <Button
          variant="filled"
          size="compact-md"
          onClick={handleUpdateQuestion}
        >
          Update
        </Button>
      </Group>
    </Modal>
  );
}

export { EditQuestionModal };
