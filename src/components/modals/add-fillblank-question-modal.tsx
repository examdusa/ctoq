import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import {
  FillBlankQuestionSchema,
  fillBlankQuestionSchema,
} from "@/utllities/zod-schemas-types";
import {
  Box,
  Button,
  Flex,
  Group,
  Modal,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { CSSProperties, useMemo } from "react";
import { OverlayModal } from "./loader";

interface Props {
  open: boolean;
  close: VoidFunction;
  questionId: string;
}

export default function AddFillBlankQuestion({
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
  const questionRec = useMemo(() => {
    return questions[questionId];
  }, [questions, questionId]);

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

  const form = useForm<FillBlankQuestionSchema>({
    mode: "controlled",
    validate: zodResolver(fillBlankQuestionSchema),
    initialValues: {
      question: "",
      answer: "",
      difficulty: questionRec.difficultyLevel ?? "easy",
    },
  });

  async function handleFormSubmit(values: FillBlankQuestionSchema) {
    const { answer, question, difficulty } = values;

    const payload: FillBlankQuestionSchema = {
      answer: answer,
      question: question,
      difficulty,
    };

    await addQuestion(
      { question: payload, questionId: questionId, questionType: "fill_blank" },
      {
        onSuccess: () => {
          const questionRec = { ...questions[questionId] };
          const questionList =
            questionRec.questions as FillBlankQuestionSchema[];
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
              rows={4}
              label="Question"
              {...form.getInputProps("question")}
              key={form.key("question")}
              placeholder="Enter your question"
              autoFocus
            />
            <TextInput
              label="Correct Answer"
              placeholder="Enter answer"
              {...form.getInputProps("answer")}
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
