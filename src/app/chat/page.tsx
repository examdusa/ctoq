"use client";

import { ThemeWrapper } from "@/components/app-layout";
import { CriteriaForm } from "@/components/criteria-form";
import { QBankCreateHistory } from "@/components/qbank-create-history";
import { QuestionContainer } from "@/components/questions-container";
import {
  fetchGeneratedQuestions,
  GeneratedQuestionsResponse,
  GenerateQBankPayload,
  generateQuestionBank,
} from "@/utllities/apiFunctions";
import { useUser } from "@clerk/nextjs";
import { Flex } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAppStore } from "../_store/app-store";
import { trpc } from "../_trpc/client";

export default function ChatContainer() {
  const { user } = useUser();
  const [withAnswer, setWithAnswer] = useState<"GWA" | "GWOA">("GWA");
  const subscriptionData = useAppStore((state) => state.subscription);
  const questionList = useAppStore((state) => state.questions);
  const { mutateAsync: updateCount } = trpc.updateQueryCount.useMutation();
  const [print, setPrint] = useState(false);
  const [recId, setRecId] = useState<string | undefined>(undefined);
  const { mutateAsync: saveQBank, isLoading: savingQBank } =
    trpc.saveQBank.useMutation();

  const { mutateAsync: generateQBank, isLoading: generatingQBank } =
    useMutation({
      mutationFn: (values: GenerateQBankPayload) => {
        return generateQuestionBank({
          difficulty: values.difficulty,
          prompt: values.prompt ?? [],
          promptUrl: values.promptUrl,
          qCount: values.qCount,
          qType: values.qType,
        });
      },
    });

  async function storeQuestionBank(
    questions: GeneratedQuestionsResponse,
    refId: string,
    userId: string,
    formValues: GenerateQBankPayload
  ) {
    const {
      data: { prompt_responses, url_responses },
    } = questions;

    if (prompt_responses.length > 0) {
      const { questions } = prompt_responses[0];
      const { difficulty, prompt, promptUrl, qCount, qType } = formValues;
      await saveQBank(
        {
          jobId: refId,
          difficulty: difficulty,
          userId: userId,
          qCount: qCount,
          qKeyword: prompt[0],
          qType: qType,
          questions: { questions: questions },
          qUrl: promptUrl,
          withAnswer: withAnswer,
        },
        {
          onSuccess: (data) => {
            if (data) {
              const updatedList = {
                ...questionList,
                [data.id]: {
                  ...data,
                  createdAt: data.createdAt ? new Date(data.createdAt) : null,
                  questions: data.questions,
                  googleQuizLink: "",
                },
              };
              useAppStore.setState({ questions: { ...updatedList } });
            }
          },
        }
      );
      if (subscriptionData && subscriptionData.queries) {
        let count = subscriptionData.queries - 1;
        const { planName } = subscriptionData;

        if (planName === "Integrated") {
          count = subscriptionData.queries;
        }
        await updateCount({
          userId: userId,
          count: count,
        });
      }
    } else if (url_responses.length > 0) {
      const { questions } = url_responses[0];
      const { difficulty, prompt, promptUrl, qCount, qType } = formValues;
      await saveQBank({
        jobId: refId,
        difficulty: difficulty,
        userId: userId,
        qCount: qCount,
        qKeyword: prompt[0],
        qType: qType,
        questions: { questions: questions },
        qUrl: promptUrl,
        withAnswer: withAnswer,
      });
      if (subscriptionData && subscriptionData.queries) {
        let count = subscriptionData.queries - 1;
        const { planName } = subscriptionData;

        if (planName === "Integrated") {
          count = subscriptionData.queries;
        }
        await updateCount({
          userId: userId,
          count: count,
        });
      }
    }
  }

  const { mutate: fetchQuestions, isLoading: fetchingQuestion } = useMutation({
    mutationFn: async ({
      refId,
    }: {
      refId: string;
      userId: string;
      values: GenerateQBankPayload;
      candidateName: string | null;
      resumeContent: boolean;
    }) => {
      return fetchGeneratedQuestions(refId);
    },
    retry: (_, error: Error) => {
      if (error.message === "DATA_VALIDATION_FAILED") {
        return true;
      }
      return false;
    },
    retryDelay: 2000,
    onSuccess: async (data, variable) => {
      const {
        values: { difficulty, prompt, promptUrl, qCount, qType },
        resumeContent,
        candidateName,
      } = variable;
      if (resumeContent) {
        storeQuestionBank(data, variable.refId, variable.userId, {
          difficulty: difficulty,
          prompt: candidateName ? [candidateName] : [],
          promptUrl: promptUrl,
          qCount: qCount,
          qType: qType,
        });
      } else {
        storeQuestionBank(data, variable.refId, variable.userId, {
          difficulty: difficulty,
          prompt: prompt,
          promptUrl: promptUrl,
          qCount: qCount,
          qType: qType,
        });
      }
    },
  });

  async function generateQuestions(
    values: GenerateQBankPayload,
    qType: "GWA" | "GWOA",
    candidateName: string | null,
    resumeContent: boolean
  ) {
    const data = await generateQBank({
      ...values,
      prompt: values.prompt ?? [],
    });
    if (user) {
      fetchQuestions({
        refId: data.reference_id,
        userId: user.id,
        values: values,
        candidateName,
        resumeContent,
      });
    }
    setWithAnswer(qType);
  }

  return (
    <ThemeWrapper subscriptionDetails={subscriptionData}>
      <Flex
        className="border-y-0"
        direction={"row"}
        w={"100%"}
        h={"100%"}
        justify={"center"}
        styles={{
          root: {
            flexGrow: 1,
          },
        }}
        gap={10}
      >
        <CriteriaForm
          generateQuestions={generateQuestions}
          isLoading={generatingQBank || savingQBank || fetchingQuestion}
          subscription={subscriptionData}
          printResult={(flag) => setPrint(flag)}
        />
        <QuestionContainer
          isLoading={generatingQBank || savingQBank || fetchingQuestion}
          questions={recId ? questionList[recId] : undefined}
          subscription={subscriptionData}
          print={print}
          setPrint={setPrint}
          userEmail={user?.primaryEmailAddress?.emailAddress}
        />
        <QBankCreateHistory questions={questionList} showRecord={setRecId} />
      </Flex>
    </ThemeWrapper>
  );
}
