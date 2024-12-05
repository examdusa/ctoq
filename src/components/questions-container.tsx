"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank, SelectSubscription } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  FillBlankQuestionSchema,
  MCQQuestionSchema,
  McqSimilarQuestionScheam,
  OpenendedQuestionSchema,
  TrueFalseQuestionsScheam,
} from "@/utllities/zod-schemas-types";
import { useUser } from "@clerk/nextjs";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Paper,
  ScrollArea,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconEye,
  IconEyeClosed,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { redirect } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AddFillBlankQuestion from "./modals/add-fillblank-question-modal";
import AddMcqQuestion from "./modals/add-mcq-question-model";
import AddMcqSimilarQuestion from "./modals/add-mcqsimilar-question-modal";
import AddOpenEndedQuestion from "./modals/add-openended-question-modal";
import AddTrueFalseQuestion from "./modals/add-truefalse-question-modal";
import { AlertModal } from "./modals/alert-modal";
import { GoogleQuizModal } from "./modals/google-quiz-modal";
import { OverlayModal } from "./modals/loader";
import { NoQuestion } from "./no-question";
import { Pricing } from "./pricing";
import { RenderFillBlankQuestion } from "./render-fillblank-question";
import { RenderMcqQuestion } from "./render-mcq-question";
import { RenderMcqSimilarQuestion } from "./render-mcqsimilar-question";
import { RenderOpenEndedQuestion } from "./render-openended-question";
import { RenderTrueFalseQuestion } from "./render-truefalse-question";

dayjs.extend(tz);
dayjs.extend(utc);

interface Props {
  subscription: SelectSubscription | undefined;
  isLoading: boolean;
}

interface RenderQuestionRecordProps {
  record: SelectQuestionBank;
  planName: string;
  userEmail: string;
  instituteName: string;
  deleteQuestionBank: (questionId: string) => void;
  deletingQBank: boolean;
}

interface RenderQuestionProps {
  question:
    | MCQQuestionSchema
    | FillBlankQuestionSchema
    | OpenendedQuestionSchema
    | TrueFalseQuestionsScheam
    | McqSimilarQuestionScheam;
  index: number;
  withAnswer: boolean;
  questionId: string;
  questionType: string;
  showAnswer: boolean;
}

function RenderQuestion({
  question,
  index,
  withAnswer,
  questionId,
  questionType,
  showAnswer,
}: RenderQuestionProps) {
  if (questionType === "mcq") {
    return (
      <RenderMcqQuestion
        question={question as MCQQuestionSchema}
        index={index}
        questionId={questionId}
        questionType={questionType}
        showAnswer={showAnswer}
      />
    );
  } else if (questionType === "mcq_similar") {
    return (
      <RenderMcqSimilarQuestion
        question={question as McqSimilarQuestionScheam}
        index={index}
        questionId={questionId}
        questionType={questionType}
        showAnswer={showAnswer}
      />
    );
  } else if (questionType === "true_false") {
    return (
      <RenderTrueFalseQuestion
        index={index}
        questionId={questionId}
        question={question as TrueFalseQuestionsScheam}
        questionType={questionType}
        showAnswer={showAnswer}
      />
    );
  } else if (questionType === "fill_blank") {
    return (
      <RenderFillBlankQuestion
        question={question as FillBlankQuestionSchema}
        index={index}
        questionId={questionId}
        questionType={questionType}
        showAnswer={showAnswer}
      />
    );
  }

  return (
    <RenderOpenEndedQuestion
      question={question as OpenendedQuestionSchema}
      index={index}
      questionId={questionId}
      questionType={questionType}
      showAnswer={showAnswer}
    />
  );
}

function RenderQuestionRecrod({
  record,
  planName,
  userEmail,
  instituteName,
  deleteQuestionBank,
  deletingQBank,
}: RenderQuestionRecordProps) {
  const [opened, { close, open }] = useDisclosure();
  const [gquizOpened, { close: closeGQuizModal, open: openGQuizModal }] =
    useDisclosure(false);
  const [showAddModal, { close: closeAddModal, open: openAddModal }] =
    useDisclosure();
  const [showAnswers, setShowAnswers] = useState(true);
  const { questionType } = record;

  const enableGoogleQuizBtn =
    questionType === "mcq" || questionType === "open_ended";

  const questions = useMemo(() => {
    if (questionType === "mcq") {
      return record.questions as MCQQuestionSchema[];
    } else if (questionType === "fill_blank") {
      return record.questions as FillBlankQuestionSchema[];
    } else if (questionType === "mcq_similar") {
      return record.questions as McqSimilarQuestionScheam[];
    } else if (questionType === "true_false") {
      return record.questions as TrueFalseQuestionsScheam[];
    }
    return record.questions as OpenendedQuestionSchema[];
  }, [record, questionType]);

  const questionBankLabel = useMemo(() => {
    const { prompt } = record;

    if (prompt) {
      if (prompt.length > 0) return prompt;
    }

    return "Questions based on prompt URL";
  }, [record]);

  function handleGoogleQuiz() {
    if (planName === "Starter") {
      open();
      return;
    } else if (!record.googleQuizLink) {
      openGQuizModal();
    } else {
      window.open(record.googleQuizLink, "_blank");
    }
  }

  function handleRedirect() {
    close();
    redirect("/pricing");
  }

  function printQuestion(jobId: string) {
    const printContent = document.getElementById(jobId);

    if (!printContent) {
      console.error(`Element with id "${jobId}" not found.`);
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      console.error("Could not open print window.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Content</title>
          <style>
            /* Add necessary styles for print */
            body { font-size: 12pt; margin: 20px; }
            .mantine-ScrollArea-root { height: auto !important; }
            svg, button { display: none !important; }
          </style>
        </head>
        <body>${printContent.outerHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <Paper
      withBorder
      p="sm"
      w={"100%"}
      radius={"md"}
      id={record.jobId as string}
    >
      <Flex direction={"column"} gap={"sm"} justify={"center"}>
        <Flex
          direction={"row"}
          h={"auto"}
          w={"100%"}
          align={"start"}
          justify={"space-between"}
        >
          <Flex direction={"column"} h="auto" w={"100%"} maw={"80%"} gap={5}>
            <Text size={"xl"} fw={"bold"} w={"100%"} maw={"90%"} lineClamp={2}>
              {questionBankLabel}
            </Text>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 248 }}
              styles={{
                label: {
                  textTransform: "none",
                },
              }}
            >
              Brought to you by ~ {instituteName}
            </Badge>
          </Flex>
          <Flex direction={"row"} w={"auto"} gap={"sm"} align={"center"}>
            <Tooltip label={!showAnswers ? "Hide answers" : "Show answers"}>
              <ActionIcon
                variant="default"
                onClick={() => {
                  setShowAnswers(!showAnswers);
                }}
              >
                {showAnswers ? <IconEyeClosed /> : <IconEye />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Add new question">
              <ActionIcon
                variant="default"
                onClick={() => {
                  openAddModal();
                }}
              >
                <IconPlus />
              </ActionIcon>
            </Tooltip>

            <Tooltip
              label={
                enableGoogleQuizBtn
                  ? "Google Quiz"
                  : "Only available for MCQ and Open ended question types"
              }
            >
              <UnstyledButton
                disabled={!enableGoogleQuizBtn}
                styles={{
                  root: {
                    cursor: enableGoogleQuizBtn ? "pointer" : "not-allowed",
                  },
                }}
                onClick={(e) => {
                  handleGoogleQuiz();
                }}
              >
                <Avatar
                  src={"/images/google_quiz.png"}
                  alt="it's me"
                  size={"sm"}
                />
              </UnstyledButton>
            </Tooltip>
            <Tooltip label="Print">
              <UnstyledButton
                onClick={(e) => {
                  printQuestion(record.jobId as string);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#228be6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-printer"
                >
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                  <rect x="6" y="14" width="12" height="8" rx="1" />
                </svg>
              </UnstyledButton>
            </Tooltip>
            <Tooltip label="Delete question bank">
              <ActionIcon
                variant="transparent"
                loading={deletingQBank}
                onClick={() => {
                  deleteQuestionBank(record.id);
                }}
              >
                <IconTrash width={24} height={24} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </Flex>
        <Divider />
        <Grid gutter={{ base: 5, xs: "md", md: "xl", xl: 50 }}>
          {questionType &&
            questions.map((question, i) => {
              return (
                <Grid.Col
                  key={i}
                  span={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}
                  display={"flex"}
                >
                  <RenderQuestion
                    question={question}
                    questionType={questionType}
                    index={i}
                    withAnswer={record.withAnswer as boolean}
                    questionId={record.id}
                    showAnswer={showAnswers}
                  />
                </Grid.Col>
              );
            })}
        </Grid>
        <AlertModal
          close={close}
          open={opened}
          message="This feature is available only in Integrated and premium plan. Do you want to Upgrade?"
          showCloseButton={false}
          title="Alert"
          footer={
            <>
              <Button variant="filled" size="sm" onClick={close}>
                No
              </Button>
              <Button variant="filled" size="sm" onClick={handleRedirect}>
                Yes
              </Button>
            </>
          }
        />
      </Flex>
      {questionType === "open_ended" && (
        <AddOpenEndedQuestion
          open={showAddModal}
          close={closeAddModal}
          questionId={record.id}
        />
      )}
      {questionType === "fill_blank" && (
        <AddFillBlankQuestion
          open={showAddModal}
          close={closeAddModal}
          questionId={record.id}
        />
      )}
      {questionType === "mcq" && (
        <AddMcqQuestion
          open={showAddModal}
          close={closeAddModal}
          questionId={record.id}
        />
      )}
      {questionType === "true_false" && (
        <AddTrueFalseQuestion
          open={showAddModal}
          close={closeAddModal}
          questionId={record.id}
        />
      )}
      {questionType === "mcq_similar" && (
        <AddMcqSimilarQuestion
          open={showAddModal}
          close={closeAddModal}
          questionId={record.id}
        />
      )}
      {gquizOpened && (
        <GoogleQuizModal
          close={closeGQuizModal}
          open={gquizOpened}
          record={record}
          userEmail={userEmail}
        />
      )}
    </Paper>
  );
}

function QuestionContainer({ subscription, isLoading }: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const questions = useAppStore((state) => state.questions);
  const renderQIdx = useAppStore((state) => state.renderQIdx);

  const {
    mutateAsync: deleteQuestionBank,
    isLoading: deletingQBank,
    isError: deleteQBankError,
  } = trpc.deleteQBank.useMutation();

  const question = useMemo(() => {
    if (renderQIdx.length > 0 && questions) {
      return questions[renderQIdx];
    }
    return null;
  }, [renderQIdx, questions]);

  useEffect(() => {
    if (viewportRef && viewportRef.current) {
      viewportRef.current.scrollTo({
        behavior: "smooth",
        top: 0,
      });
    }
  }, [questions]);

  async function handleDeleteQBank(questId: string) {
    await deleteQuestionBank(
      { questionId: questId },
      {
        onSuccess: (_, variable) => {
          const updatedList = Object.fromEntries(
            Object.entries(questions).filter(
              ([key, _]) => variable.questionId !== key
            )
          );
          useAppStore.setState({ questions: { ...updatedList } });
        },
      }
    );
  }

  // useEffect(() => {
  //   if (containerRef && containerRef.current) {
  //     const content = containerRef.current?.outerHTML;
  //     if (!content) return;

  //     const printWindow = window.open("", "_blank");
  //     if (!printWindow) return;
  //     const tempContainer = document.createElement("div");
  //     tempContainer.innerHTML = content;
  //     tempContainer.querySelectorAll("button, svg").forEach((element) => {
  //       element.setAttribute("display", "none");
  //     });
  //     printWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>Print</title>
  //       <link
  //         rel="stylesheet"
  //         href="https://unpkg.com/@mantine/core@7.4.2/styles.css"
  //       />
  //       <style>
  //         @media print {
  //           body { font-size: 10pt; }
  //           .mantine-ScrollArea-root { height: auto !important; }
  //           .mantine-ScrollArea-viewPort { height: auto !important; }
  //           #question-container svg, button {
  //             display: "none !important"
  //           }
  //         }
  //       </style>
  //     </head>
  //     <body onload="window.print();window.close()">
  //       ${tempContainer.innerHTML}
  //     </body>
  //   </html>
  // `);

  //     printWindow.document.close();
  //   }
  // }, []);

  if (!subscription) {
    return (
      <Flex direction={"column"} w={"100%"} my={"xs"} align={"center"} gap={10}>
        <OverlayModal opened={isLoading} width={80} height={80} />
        <Pricing subscriptionDetails={subscription} />
      </Flex>
    );
  }

  if (!question) {
    return (
      <Flex
        direction={"column"}
        w={"100%"}
        styles={{
          root: {
            flexGrow: 1,
          },
        }}
        align={"center"}
        gap={10}
        justify={"center"}
      >
        <OverlayModal opened={isLoading} width={80} height={80} />
        <NoQuestion />
      </Flex>
    );
  }

  return (
    <ScrollArea
      style={{ height: "calc(100vh - 8vh)", width: "100%" }}
      offsetScrollbars={"x"}
      my={"xs"}
      p={3}
      viewportRef={viewportRef}
    >
      <Flex
        direction={"column"}
        w={"100%"}
        h={"100%"}
        ref={containerRef}
        p={0}
        id="question-container"
        styles={{
          root: {
            flexGrow: 1,
            maxHeight: "50%",
          },
        }}
        align={"center"}
        px={"sm"}
        gap={10}
      >
        <OverlayModal opened={isLoading} width={80} height={80} />
        {user && user.primaryEmailAddressId && (
          <RenderQuestionRecrod
            record={question}
            planName={subscription.planName ?? ""}
            userEmail={user.primaryEmailAddress?.emailAddress ?? ""}
            instituteName={question.instituteName ?? ""}
            deleteQuestionBank={handleDeleteQBank}
            deletingQBank={deletingQBank}
          />
        )}
      </Flex>
    </ScrollArea>
  );
}

export { QuestionContainer };
