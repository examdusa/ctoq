import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import { TrueFalseQuestionsScheam } from "@/utllities/zod-schemas-types";
import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Text,
  Tooltip,
  useMantineTheme
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMemo } from "react";
import EditTrueFalseQuestion from "./modals/edit-truefalse-question-modal";

interface Props {
  index: number;
  question: TrueFalseQuestionsScheam;
  questionId: string;
  questionType: string;
  showAnswer: boolean;
}

function RenderTrueFalseQuestion({
  index,
  question,
  questionId,
  questionType,
  showAnswer,
}: Props) {
  const [opened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure();
  const theme = useMantineTheme();
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
                ...(record.questions as TrueFalseQuestionsScheam[]).filter(
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

  const questionLabelElement = useMemo(() => {
    if (question.question) {
      return (
        <Text pl={"xs"} fw={"bold"} c={theme.colors.gray[7]}>
          {question.question}
        </Text>
      );
    }
    return null;
  }, [question, theme]);

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
          <Flex
            direction={"row"}
            w={"100%"}
            justify="space-between"
            align={"flex-start"}
          >
            <Text pl={"xs"} fw={"bold"} c={theme.colors.gray[7]} maw={"85%"}>
              {questionLabelElement}
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
          <Badge
            hidden={!!showAnswer}
            variant="outline"
            bg="teal"
            color="white"
            size="lg"
            radius="sm"
            mt={"auto"}
          >
            Answer: {question.answer}
          </Badge>
        </Flex>
      </Flex>
      {opened && (
        <EditTrueFalseQuestion
          open={opened}
          close={closeEditModal}
          index={index}
          question={question}
          questionId={questionId}
          questionType={questionType}
        />
      )}
    </Flex>
  );
}

export { RenderTrueFalseQuestion };

