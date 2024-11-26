"use client";

import { ThemeWrapper } from "@/components/app-layout";
import { CriteriaForm, FormObjectType } from "@/components/criteria-form";
import { QuestionContainer } from "@/components/questions-container";
import { SelectQuestionBank } from "@/db/schema";
import {
  fetchGeneratedQuestions,
  generateQuestionBank,
} from "@/utllities/apiFunctions";
import { useUser } from "@clerk/nextjs";
import { Flex } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { trpc } from "../_trpc/client";

export default function ChatContainer() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [questionRecs, setQuestionRecs] = useState<SelectQuestionBank[]>([]);
  const [withAnswer, setWithAnswer] = useState<"GWA" | "GWOA">("GWA");
  const {
    mutateAsync: fetchStoredQuestions,
    isLoading: fetchingStoredQuestions,
    data: storedQuestions,
  } = trpc.getQuestions.useMutation();

  const {
    mutateAsync: fetchSubsDetails,
    isLoading: fetchingSubs,
    data: subscriptionData,
  } = trpc.getSubscriptionDetails.useMutation();

  const { mutateAsync: updateCount } = trpc.updateQueryCount.useMutation();
  const [refetchQuestions, setRefetchQuestions] = useState(false);
  const [print, setPrint] = useState(false);
  const saveQBank = trpc.saveQBank.useMutation();

  const { mutateAsync: generateQBank, isLoading: generatingQBank } =
    useMutation({
      mutationFn: (values: FormObjectType) => {
        setRefetchQuestions(true);
        return generateQuestionBank({
          difficulty: values.difficulty,
          prompt: values.prompt,
          promptUrl: values.promptUrl,
          qCount: values.qCount,
          qType: values.qType,
          resume: null,
        });
      },
    });

  const fetchSavedQuestions = useCallback(async () => {
    try {
      if (user) {
        const res = await fetchStoredQuestions({ userId: user.id });
        if (res) {
          const records: SelectQuestionBank[] = res.map((rec) => {
            return {
              userId: rec.userId,
              id: rec.id,
              createdAt: rec.createdAt,
              jobId: rec.jobId,
              questions: rec.questions ?? [],
              difficultyLevel: rec.difficultyLevel,
              questionsCount: rec.questionsCount,
              prompt: rec.prompt,
              questionType: rec.questionType,
              promptUrl: rec.promptUrl,
              withAnswer: rec.withAnswer,
            } as SelectQuestionBank;
          });
          setQuestionRecs([...records]);
        }
      }
    } catch (err) {
      console.log("fetchSavedQuestions err: ", err);
    }
  }, [user, fetchStoredQuestions, setQuestionRecs]);

  const fetchSubscriptionDetails = useCallback(
    async (userId: string) => {
      await fetchSubsDetails({ userId });
    },
    [fetchSubsDetails]
  );

  const { mutateAsync: saveResult, isLoading: savingResult } = useMutation({
    mutationFn: async ({}: {
      refId: string;
      userId: string;
      values: FormObjectType;
    }) => {
      return fetchGeneratedQuestions();
    },
    retry: refetchQuestions,
    retryDelay: 2000,
    onSuccess: async (data, variable) => {
      if (data && variable.values) {
        const { prompt_responses } = data;
        const { questions } = prompt_responses[0];
        const { difficulty, prompt, promptUrl, qCount, qType } =
          variable.values;
        setRefetchQuestions(false);
        await saveQBank.mutateAsync({
          jobId: variable.refId,
          difficulty: difficulty,
          userId: variable.userId,
          qCount: qCount,
          qKeyword: prompt,
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
            userId: variable.userId,
            count: count,
          });
        }
        await fetchSavedQuestions();
        await fetchSubscriptionDetails(variable.userId);
      }
    },
  });

  useEffect(() => {
    if (user && !subscriptionData && !storedQuestions) {
      (async () => {
        await Promise.all([
          fetchSavedQuestions(),
          fetchSubscriptionDetails(user.id),
        ]);
      })();
    }
  }, [
    fetchSubscriptionDetails,
    subscriptionData,
    user,
    fetchSavedQuestions,
    storedQuestions,
  ]);

  async function generateQuestions(
    values: FormObjectType,
    qType: "GWA" | "GWOA"
  ) {
    const data = await generateQBank({ ...values });
    if (user) {
      await saveResult({
        refId: data.reference_id,
        userId: user.id,
        values: values,
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
          isLoading={savingResult}
          subscription={subscriptionData}
          printResult={(flag) => setPrint(flag)}
        />
        <QuestionContainer
          questions={questionRecs}
          subscription={subscriptionData}
          isLoading={
            (fetchingStoredQuestions || fetchingSubs) &&
            !generatingQBank &&
            !refetchQuestions
          }
          print={print}
          setPrint={setPrint}
          generatingQuestions={generatingQBank || refetchQuestions}
        />
      </Flex>
    </ThemeWrapper>
  );
}
