"use client";

import { SelectQuestionBank, SelectSubscription } from "@/db/schema";
import { QuestionSchema } from "@/utllities/apiFunctions";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Loader,
  Paper,
  ScrollArea,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { AlertModal } from "./modals/alert-modal";
import { OverlayModal } from "./modals/loader";
import { Pricing } from "./pricing";

dayjs.extend(tz);
dayjs.extend(utc);

interface Props {
  questions: SelectQuestionBank[];
  isLoading: boolean;
  generatingQuestions: boolean;
  subscription: SelectSubscription | undefined;
  print: boolean;
  setPrint: Dispatch<SetStateAction<boolean>>;
}

interface RenderQuestionRecordProps {
  record: SelectQuestionBank;
  planName: string;
}

interface RenderQuestionProps {
  question: QuestionSchema;
  index: number;
  withAnswer: boolean;
}

// function parseTime(date: Date) {
//   return dayjs(date).utc().tz(dayjs.tz.guess()).format("MM-DD-YYYY | hh:mm a");
// }

function RenderQuestion({ question, index, withAnswer }: RenderQuestionProps) {
  return (
    <Flex
      direction={"column"}
      h={"auto"}
      w={"auto"}
      gap={8}
      align={"self-start"}
    >
      <Text>
        {index}. {question.question}
      </Text>
      <Flex direction={"column"} h={"auto"} w={"auto"} gap={3} px={"md"}>
        {Object.entries(question.options).map(([key, value], index) => {
          return (
            <Text key={index} truncate>
              {key}. {value}
            </Text>
          );
        })}
      </Flex>
      {withAnswer && (
        <Badge variant="outline" color="orange" size="lg" radius="sm">
          Answer: {question.answer}
        </Badge>
      )}
    </Flex>
  );
}

function RenderQuestionRecrod({ record, planName }: RenderQuestionRecordProps) {
  const [opened, { close, open }] = useDisclosure();

  function handleGoogleQuiz() {
    if (planName !== "Starter") {
      open();
      return;
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
      shadow="md"
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
          align={"center"}
          justify={"space-between"}
        >
          <Text size="xl" fw={"bold"}>
            {record.prompt}
          </Text>
          <Flex direction={"row"} w={"auto"} gap={"sm"} align={"center"}>
            <Tooltip label="Google Quiz">
              <UnstyledButton
                onClick={(e) => {
                  handleGoogleQuiz();
                }}
              >
                <Image
                  src={"/images/google_quiz.png"}
                  width={30}
                  height={30}
                  alt="google-quiz"
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
          </Flex>
        </Flex>
        <Divider />
        <Grid gutter={{ base: 5, xs: "md", md: "xl", xl: 50 }}>
          {(record.questions as QuestionSchema[]).map((question, i) => {
            return (
              <Grid.Col key={i} span={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                <RenderQuestion
                  question={question}
                  index={i + 1}
                  withAnswer={record.withAnswer as boolean}
                />
              </Grid.Col>
            );
          })}
        </Grid>
      </Flex>
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
      ></AlertModal>
    </Paper>
  );
}

function QuestionContainer({
  questions,
  isLoading,
  generatingQuestions,
  subscription,
  print,
  setPrint,
}: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (viewportRef && viewportRef.current) {
      viewportRef.current.scrollTo({
        behavior: "smooth",
        top: viewportRef.current.scrollHeight,
      });
    }
  }, [questions]);

  useEffect(() => {
    if (containerRef && containerRef.current && print) {
      const content = containerRef.current?.outerHTML;
      if (!content) return;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = content;
      tempContainer.querySelectorAll("button, svg").forEach((element) => {
        element.setAttribute("display", "none");
      });
      printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/@mantine/core@7.4.2/styles.css"
        />
        <style>
          @media print {
            body { font-size: 10pt; }
            .mantine-ScrollArea-root { height: auto !important; }
            .mantine-ScrollArea-viewPort { height: auto !important; }
            #question-container svg, button {
              display: "none !important"
            }
          }
        </style>
      </head>
      <body onload="window.print();window.close()">
        ${tempContainer.innerHTML}
      </body>
    </html>
  `);

      printWindow.document.close();
    }
    setPrint(false);
  }, [print, setPrint]);

  if (isLoading) {
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
        <Loader color="blue" size="xl" />
      </Flex>
    );
  }

  if (!subscription) {
    return (
      <ScrollArea
        style={{ height: "calc(100vh - 64px)", width: "100%" }}
        offsetScrollbars
        viewportRef={viewportRef}
      >
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
          <Pricing subscriptionDetails={subscription} />
        </Flex>
      </ScrollArea>
    );
  }

  if (questions.length === 0 && !isLoading) {
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
        <OverlayModal opened={generatingQuestions} />
        <Text>It&apos;s lonely here...</Text>
      </Flex>
    );
  }

  return (
    <ScrollArea
      style={{ height: "calc(100vh - 64px)", width: "100%" }}
      offsetScrollbars
      my={"xs"}
      p={0}
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
        <OverlayModal opened={generatingQuestions} />
        {questions.map((rec, i) => (
          <RenderQuestionRecrod
            record={rec}
            key={i}
            planName={subscription.planName ?? ""}
          />
        ))}
      </Flex>
    </ScrollArea>
  );
}

export { QuestionContainer };
