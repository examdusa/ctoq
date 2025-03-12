"use client";

import { ThemeWrapper } from "@/components/app-layout";
import { ChatContainerMobileView } from "@/components/chat-container-mobile-view";
import { CriteriaForm } from "@/components/criteria-form";
import DashboardLoader from "@/components/modals/loader/dashboard-loader";
import { QBankCreateHistory } from "@/components/qbank-create-history";
import { QuestionContainer } from "@/components/questions-container";
import { useAppStore } from "@/store/app-store";
import { useUser } from "@clerk/nextjs";
import { Flex, MantineProvider } from "@mantine/core";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ChatContainer() {
  const { user } = useUser();

  const userProfile = useAppStore((state) => state.userProfile);
  const subscription = useAppStore((state) => state.subscription);
  const questions = useAppStore((state) => state.questions);

  useEffect(() => {
    if (!userProfile && !subscription && !user) {
      redirect("/");
    }
  }, [user, subscription, userProfile]);

  if (!userProfile) {
    return <DashboardLoader />;
  }

  return (
    <MantineProvider
      defaultColorScheme="light"
      forceColorScheme="light"
    >
      <ThemeWrapper>
        <Flex
          direction={"row"}
          w={"100%"}
          h={"100%"}
          justify={"center"}
          gap={10}
          visibleFrom="lg"
        >
          <QBankCreateHistory />
          <QuestionContainer
            subscription={subscription ? subscription : undefined}
            questions={questions}
          />
          <CriteriaForm
            subscription={subscription ? subscription : undefined}
          />
        </Flex>
        <ChatContainerMobileView />
      </ThemeWrapper>
    </MantineProvider>
  );
}
