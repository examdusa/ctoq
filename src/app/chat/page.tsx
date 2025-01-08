"use client";

import { trpc } from "@/app/_trpc/client";
import { ThemeWrapper } from "@/components/app-layout";
import { CriteriaForm } from "@/components/criteria-form";
import DashboardLoader from "@/components/modals/loader/dashboard-loader";
import { QBankCreateHistory } from "@/components/qbank-create-history";
import { QuestionContainer } from "@/components/questions-container";
import { SelectQuestionBank } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import { useUser } from "@clerk/nextjs";
import { Flex } from "@mantine/core";
import { redirect } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function ChatContainer() {
  const { user } = useUser();
  const {
    mutateAsync: fetchSubscription,
    data: subscription,
    isLoading: fetchingSubscription,
  } = trpc.getUserSubscriptionDetails.useMutation();
  const { mutateAsync: fetchQuestions, isLoading: fetchingQuestions } =
    trpc.getQuestions.useMutation();

  const setSubscription = useAppStore((state) => state.setSubscription);
  const setQuestions = useAppStore((state) => state.setQuestions);

  const fetchUserData = useCallback(
    async (userId: string) => {
      const [subscription, questions] = await Promise.all([
        fetchSubscription({ userId: userId }),
        fetchQuestions({ userId: userId }),
      ]);

      const formattedQuestions: Record<string, SelectQuestionBank> = {};
      if (questions) {
        questions.forEach((item) => {
          formattedQuestions[item.id] = {
            ...item,
            questions: item.questions,
          };
        });
      }

      setSubscription(subscription[0]);
      setQuestions(formattedQuestions);
    },
    [fetchSubscription, fetchQuestions, setSubscription, setQuestions]
  );

  useEffect(() => {
    if (user) {
      fetchUserData(user.id);
    } else {
      redirect('/')
    }
  }, [user, fetchUserData]);

  return (
    <ThemeWrapper>
      <Flex
        direction={"row"}
        w={"100%"}
        h={'100%'}
        justify={"center"}
        gap={10}
      >
        <QBankCreateHistory />
        <QuestionContainer
          isLoading={fetchingQuestions || fetchingSubscription}
          subscription={subscription ? subscription[0] : undefined}
        />
        <CriteriaForm
          subscription={subscription ? subscription[0] : undefined}
        />
      </Flex>
    </ThemeWrapper>
  );
}
