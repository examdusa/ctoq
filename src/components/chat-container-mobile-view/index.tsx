"use client";

import { useAppStore } from "@/store/app-store";
import { useUser } from "@clerk/nextjs";
import { ActionIcon, Container, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHistory } from "@tabler/icons-react";
import { QBankCreateHistory } from "../qbank-create-history";
import { CriteriaForm } from "./criteria-form";
import { QuestionContainerMobilView } from "./question-container";

function ChatContainerMobileView() {
  const [historyOpenned, { toggle }] = useDisclosure(false);
  const subscription = useAppStore((state) => state.subscription);
  const questions = useAppStore((state) => state.questions);
  const { user } = useUser();

  return (
    <Container
      pos={"relative"}
      w={"100%"}
      h={"100%"}
      hiddenFrom="lg"
      styles={{
        root: {
          paddingInline: 0,
        },
      }}
    >
      <ActionIcon
        variant="filled"
        radius="xl"
        aria-label="History"
        pos={"absolute"}
        top={0}
        left={0}
        m={3}
        onClick={toggle}
        styles={{
          root: {
            zIndex: historyOpenned ? 0 : 9999,
          },
        }}
      >
        <IconHistory />
      </ActionIcon>
      <QuestionContainerMobilView
        subscription={subscription ? subscription : undefined}
        questions={questions}
      />
      {user && (
        <CriteriaForm
          subscription={subscription ? subscription : undefined}
          userId={user.id}
        />
      )}
      <Drawer opened={historyOpenned} title="History" onClose={toggle}>
        <QBankCreateHistory />
      </Drawer>
    </Container>
  );
}

export { ChatContainerMobileView };
