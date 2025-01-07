"use client";

import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import {
  trueFalseQuestionSchema,
  TrueFalseQuestionsScheam,
} from "@/utllities/zod-schemas-types";
import {
  Button,
  CSSProperties,
  Flex,
  Group,
  Modal,
  TextInput
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
          <TextInput
            label="Correct Answer"
            withAsterisk
            placeholder="Pick answer"
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
