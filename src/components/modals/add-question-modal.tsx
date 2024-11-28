import { useAppStore } from "@/app/_store/app-store";
import { trpc } from "@/app/_trpc/client";
import { QuestionSchema } from "@/utllities/apiFunctions";
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
import { CSSProperties, useEffect, useMemo } from "react";
import { z } from "zod";
import { OverlayModal } from "./loader";

interface Props {
  open: boolean;
  close: VoidFunction;
  questionId: string;
}

const formSchema = z.object({
  question: z.string().min(1, "Enter question"),
  options: z.object({
    A: z.string().min(1, "Enter value"),
    B: z.string().min(1, "Enter value"),
    C: z.string().min(1, "Enter value"),
    D: z.string().min(1, "Enter value"),
  }),
  answer: z.string().min(1, "Select an answer"),
});

type FormSchema = z.infer<typeof formSchema>;

function AddQuestion({ open, close, questionId }: Props) {
  const {
    mutateAsync: addQuestion,
    isLoading: addingQuestion,
    isError: additionError,
    isSuccess: additionSuccess,
  } = trpc.addQuestion.useMutation();
  const questions = useAppStore((state) => state.questions);

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

  const form = useForm<FormSchema>({
    mode: "controlled",
    initialValues: {
      question: "",
      answer: "",
      options: {
        A: "",
        B: "",
        C: "",
        D: "",
      },
    },
    validate: zodResolver(formSchema),
  });

  async function handleFormSubmit(values: FormSchema) {
    const { answer, options, question } = values;

    const payload: QuestionSchema = {
      answer: answer as "A" | "B" | "C" | "D",
      options: options,
      question: question,
    };

    await addQuestion(
      { question: payload, questionId: questionId },
      {
        onSuccess: () => {
          const questionRec = { ...questions[questionId] };
          const questionList = questionRec.questions as QuestionSchema[];
          questionList.push(payload);
          questionRec.questions = [...questionList];

          useAppStore.setState({
            questions: { ...questions, [questionId]: { ...questionRec } },
          });
        },
      }
    );
  }

  useEffect(() => {
    return () => {
      form.reset();
    };
  }, [form]);

  const { answer } = form.values;

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
              key={form.key("question")}
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
                <Grid.Col span={{ xs: 12, md: 6 }}>
                  <TextInput
                    placeholder="Enter option value"
                    {...form.getInputProps("options.C")}
                    leftSection={
                      <Avatar color="blue" radius={"sm"} size={"sm"}>
                        C
                      </Avatar>
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ xs: 12, md: 6 }}>
                  <TextInput
                    placeholder="Enter option value"
                    {...form.getInputProps("options.D")}
                    leftSection={
                      <Avatar color="blue" radius={"sm"} size={"sm"}>
                        D
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
                { value: "C", label: "C" },
                { value: "D", label: "D" },
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

export { AddQuestion };
