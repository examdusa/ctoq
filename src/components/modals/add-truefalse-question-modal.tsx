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
  Flex,
  Grid,
  Group,
  Modal,
  Select,
  Text,
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

export default function AddTrueFalseQuestion({
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

  const form = useForm<TrueFalseQuestionsScheam>({
    mode: "controlled",
    validate: zodResolver(trueFalseQuestionSchema),
    initialValues: {
      answer: "",
      options: {
        A: "",
        B: "",
      },
      question: "",
    },
  });

  async function handleFormSubmit(values: TrueFalseQuestionsScheam) {
    const { answer, options, question } = values;

    const payload: TrueFalseQuestionsScheam = {
      answer: answer,
      options: options,
      question: question,
    };

    await addQuestion(
      { question: payload, questionId: questionId, questionType: "mcq" },
      {
        onSuccess: () => {
          const questionRec = { ...questions[questionId] };
          const questionList =
            questionRec.questions as TrueFalseQuestionsScheam[];
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
            <TextInput
              label="Question"
              {...form.getInputProps("question")}
              placeholder="Enter your question"
              autoFocus
            />
            <Flex direction={"column"} w={"100%"} h={"auto"} gap={2}>
              <Text size="sm">Answers Options</Text>
              <Grid>
                <Grid.Col span={{ xs: 12, md: 6 }}>
                  <TextInput
                    placeholder="Enter option value"
                    {...form.getInputProps("options.A")}
                    leftSection={
                      <Avatar color="blue" radius={"sm"} size={"sm"}>
                        A
                      </Avatar>
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ xs: 12, md: 6 }}>
                  <TextInput
                    placeholder="Enter option value"
                    {...form.getInputProps("options.B")}
                    leftSection={
                      <Avatar color="blue" radius={"sm"} size={"sm"}>
                        B
                      </Avatar>
                    }
                  />
                </Grid.Col>
              </Grid>
            </Flex>
            <Select
              label="Correct Answer"
              placeholder="Pick one"
              data={[
                { value: "A", label: "A" },
                { value: "B", label: "B" },
              ]}
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
