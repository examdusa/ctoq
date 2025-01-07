import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import { OpenendedQuestionSchema } from "@/utllities/zod-schemas-types";
import {
  ActionIcon,
  Alert,
  Button,
  Flex,
  Group,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import EditOpenEndedQuestion from "./modals/edit-openended-question-modal";
import { OverlayModal } from "./modals/loader";

interface Props {
  index: number;
  question: OpenendedQuestionSchema;
  questionId: string;
  questionType: string;
  showAnswer: boolean;
}

function RenderOpenEndedQuestion({
  index,
  question,
  questionId,
  questionType,
  showAnswer,
}: Props) {
  const [opened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure();
  const theme = useMantineTheme();
  const generatingQuestions = useAppStore((state) => state.generatingQuestions);
  const questions = useAppStore((state) => state.questions);
  const { mutateAsync: deleteQuestion, isLoading: deletingQuestion } =
    trpc.deleteQuestion.useMutation();

  async function deleteQuestionByIdx() {
    await deleteQuestion(
      { questionId, qIdx: index },
      {
        onSuccess: (data) => {
          const { code } = data;

          if (code === "QUESTION_DELETED") {
            if (questions && questions[questionId]) {
              const record = { ...questions[questionId] };
              const newList = [
                ...(record.questions as OpenendedQuestionSchema[]).filter(
                  (_, id) => id !== index
                ),
              ];
              useAppStore.setState({
                questions: {
                  ...questions,
                  [questionId]: { ...record, questions: [...newList] },
                },
              });
            }
          }
        },
      }
    );
  }

  return (
    <Flex
      direction={"column"}
      w={"auto"}
      gap={8}
      align={"self-start"}
      styles={{
        root: {
          border: `1px solid ${theme.colors.gray[4]}`,
          padding: theme.spacing.sm,
          borderRadius: theme.radius.md,
          flexGrow: 1,
        },
      }}
    >
      <OverlayModal
        opened={generatingQuestions}
        message="Generating questions..."
        width={80}
        height={80}
      />
      <Flex
        direction={"row"}
        w={"100%"}
        h={"100%"}
        align={"start"}
        justify={"start"}
      >
        <ActionIcon size={"sm"} variant="light">
          {index + 1}
        </ActionIcon>
        <Flex
          direction={"column"}
          h={"100%"}
          gap={"sm"}
          styles={{
            root: {
              flexGrow: 1,
            },
          }}
        >
          <Flex direction={"row"} w={"100%"} justify="space-between">
            <Text pl={"xs"} fw={"bold"} c={theme.colors.gray[7]}>
              {question.question}
            </Text>
            <Group gap={"xs"}>
              <Tooltip label="Edit question">
                <Button
                  variant="transparent"
                  size="xs"
                  onClick={(e) => {
                    openEditModal();
                  }}
                  ml={"auto"}
                >
                  <IconEdit />
                </Button>
              </Tooltip>
              <Tooltip label="Delete questions">
                <Button
                  loading={deletingQuestion}
                  variant="transparent"
                  size="xs"
                  onClick={(e) => {
                    deleteQuestionByIdx();
                  }}
                  ml={"auto"}
                >
                  <IconTrash />
                </Button>
              </Tooltip>
            </Group>
          </Flex>
          <Alert
            variant="light"
            color="green"
            radius={"md"}
            hidden={!!showAnswer}
          >
            <Text fw={"bold"} c={theme.colors.gray[7]} size="sm">
              Answer
            </Text>
            <Text fw={"bold"} c={theme.colors.gray[7]} size="xs" pt={"xs"}>
              {question.answer}
            </Text>
          </Alert>
        </Flex>
      </Flex>
      <EditOpenEndedQuestion
        open={opened}
        close={closeEditModal}
        index={index}
        question={question}
        questionId={questionId}
        questionType={questionType}
      />
    </Flex>
  );
}

export { RenderOpenEndedQuestion };

