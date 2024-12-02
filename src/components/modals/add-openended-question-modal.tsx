import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import {
  openEndedQuestionSchema,
  OpenendedQuestionSchema,
} from "@/utllities/zod-schemas-types";
import { Box, Button, Flex, Group, Modal, Textarea } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { CSSProperties, useMemo } from "react";
import { OverlayModal } from "./loader";

interface Props {
  open: boolean;
  close: VoidFunction;
  questionId: string;
}

export default function AddOpenEndedQuestion({
  open,
  close,
  questionId,
}: Props) {
  const {
    mutateAsync: addQuestion,
    isLoading: addingQuestion,
    isError: additionError,
    isSuccess: additionSuccess,
  } = trpc.addQuestion.useMutation();
  const questions = useAppStore((state) => state.questions);
  const setQuestions = useAppStore((state) => state.setQuestions);

  const modalHeaderProps = useMemo(() => {
    let props: CSSProperties = { background: "white", color: "black" };

    if (additionSuccess) {
      props = {
        background: "teal",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    } else if (additionError) {
      props = {
        background: "red",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    }
    return props;
  }, [additionError, additionSuccess]);

  const form = useForm<OpenendedQuestionSchema>({
    mode: "controlled",
    validate: zodResolver(openEndedQuestionSchema),
  });

  async function handleFormSubmit(values: OpenendedQuestionSchema) {
    const { answer, question } = values;

    const payload: OpenendedQuestionSchema = {
      answer: answer,
      question: question,
    };

    await addQuestion(
      { question: payload, questionId: questionId, questionType: "open_ended" },
      {
        onSuccess: () => {
          const questionRec = { ...questions[questionId] };
          const questionList =
            questionRec.questions as OpenendedQuestionSchema[];
          questionList.push(payload);
          questionRec.questions = [...questionList];

          setQuestions({ ...questions, [questionId]: { ...questionRec } });
        },
      }
    );
  }

  return (
    <Modal
      opened={open}
      onClose={close}
      closeOnClickOutside={false}
      withCloseButton
      title="Add Question"
      centered
      size={"xl"}
      p={"md"}
      closeOnEscape={false}
      shadow="lg"
      styles={{
        header: {
          ...modalHeaderProps,
        },
        title: {
          fontWeight: "bolder",
        },
      }}
    >
      <OverlayModal opened={addingQuestion} message="Adding ..." />
      <Box p={"sm"}>
        <form
          onSubmit={form.onSubmit((values) => {
            handleFormSubmit(values);
          })}
        >
          <Flex direction={"column"} w={"100%"} h={"100%"} gap={"lg"}>
            <Textarea
              label="Question"
              {...form.getInputProps("question")}
              key={form.key("question")}
              placeholder="Enter your question"
              autoFocus
              withAsterisk
              rows={3}
            />
            <Textarea
              label="Answer"
              withAsterisk
              {...form.getInputProps("answer")}
              key={form.key("answer")}
              placeholder="Enter your answer"
              autoFocus
              rows={5}
            />
          </Flex>
          <Group justify="end" w={"100%"} gap={"sm"} pt={"md"}>
            <Button onClick={close} variant="filled">
              Close
            </Button>
            <Button type="submit" variant="filled">
              Add
            </Button>
          </Group>
        </form>
      </Box>
    </Modal>
  );
}
