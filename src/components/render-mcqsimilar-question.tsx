import { useAppStore } from "@/store/app-store";
import { McqSimilarQuestionScheam } from "@/utllities/zod-schemas-types";
import {
  ActionIcon,
  Badge,
  Flex,
  List,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import EditMcqSimilarQuestion from "./modals/edit-mcqsimilar-question-modal";
import { OverlayModal } from "./modals/loader";

interface Props {
  index: number;
  question: McqSimilarQuestionScheam;
  questionId: string;
  questionType: string;
  showAnswer: boolean
}

function RenderMcqSimilarQuestion({
  index,
  question,
  questionId,
  questionType,
  showAnswer
}: Props) {
  const [opened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure();
  const theme = useMantineTheme();
  const generatingQuestions = useAppStore((state) => state.generatingQuestions);

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
            <Tooltip label="Edit question">
              <UnstyledButton
                onClick={(e) => {
                  openEditModal();
                }}
                ml={"auto"}
              >
                <IconEdit />
              </UnstyledButton>
            </Tooltip>
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
              {Object.entries(question.options).map(([key, value]) => {
                return (
                  <List.Item
                    key={key}
                    icon={
                      <ThemeIcon color="blue" size={"sm"} radius="xl">
                        {key}
                      </ThemeIcon>
                    }
                  >
                    <Text size="sm" lh={"xs"}>
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
              Answer: {question.answer.join(", ")}
            </Badge>
          </Flex>
        </Flex>
      </Flex>
      <EditMcqSimilarQuestion
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

export { RenderMcqSimilarQuestion };
