import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import { MCQQuestionSchema } from "@/utllities/zod-schemas-types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Flex,
  Group,
  List,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import EditMcqQuestion from "./modals/edit-mcq-question-model";

interface Props {
  index: number;
  question: MCQQuestionSchema;
  questionId: string;
  questionType: string;
  showAnswer: boolean;
}

function RenderMcqQuestion({
  index,
  question,
  questionId,
  questionType,
  showAnswer,
}: Props) {
  const [opened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure();
  const theme = useMantineTheme();
  // const generatingQuestions = useAppStore((state) => state.generatingQuestions);
  const { mutateAsync: deleteQuestion, isLoading: deletingQuestion } =
    trpc.deleteQuestion.useMutation();
  const questions = useAppStore((state) => state.questions);

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
                ...(record.questions as MCQQuestionSchema[]).filter(
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
      <Flex
        direction={"row"}
        w={"100%"}
        h={"100%"}
        align={"start"}
        justify={"start"}
      >
        <Avatar color="cyan" radius="xl" size={"sm"}>
          {index + 1}
        </Avatar>
        <Flex
          direction={"column"}
          h={"100%"}
          gap={"sm"}
          align={"start"}
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
            align={"start"}
          >
            <Text
              pl={"xs"}
              size="sm"
              fw={"bold"}
              c={theme.colors.gray[7]}
              maw={"85%"}
            >
              {question.question}
            </Text>
            <Group gap={"xs"} justify="center">
              <Tooltip label="Edit question">
                <ActionIcon
                  variant="transparent"
                  size="xs"
                  onClick={(e) => {
                    openEditModal();
                  }}
                >
                  <IconEdit />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Delete question">
                <ActionIcon
                  loading={deletingQuestion}
                  variant="transparent"
                  size="xs"
                  onClick={(e) => {
                    deleteQuestionByIdx();
                  }}
                >
                  <IconTrash />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Flex>
          <Flex
            direction={"column"}
            w={"auto"}
            gap={3}
            pl={"md"}
            styles={{
              root: {
                flexGrow: 1,
              },
            }}
          >
            <List spacing="md" size="sm" center={true} mb={"sm"}>
              {Object.entries(question.options).map(([key, value], index) => {
                return (
                  <List.Item
                    key={key}
                    icon={
                      <ThemeIcon color="blue" size={"xs"} radius="xl">
                        {String.fromCharCode(65 + index)}
                      </ThemeIcon>
                    }
                  >
                    <Text size="xs" lh={"xs"}>
                      {value}
                    </Text>
                  </List.Item>
                );
              })}
            </List>
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
      </Flex>
      <EditMcqQuestion
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

export { RenderMcqQuestion };
