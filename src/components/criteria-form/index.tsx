"use client";

import { SelectSubscription } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import { Flex, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useMemo } from "react";
import { Form } from "../form";

interface Props {
  subscription: SelectSubscription | undefined;
}

export interface PriceDetail {
  [key: string]: {
    amount: number;
    label: string;
    queries: number;
    questionCount: number;
    features: string[];
  };
}

function CriteriaForm({ subscription }: Props) {
  const { user, isLoaded, isSignedIn } = useUser();
  const colorScheme = useMantineColorScheme();
  const theme = useMantineTheme();

  const disableFields = useMemo(() => {
    if (subscription) {
      return subscription.queries === 0 || subscription.status !== "paid";
    }
    return false;
  }, [subscription]);

  return (
    <Flex
      w={"100%"}
      direction={"column"}
      gap={"xs"}
      maw={{ xs: "30%", md: "25%" }}
      my={"xs"}
      p={"xs"}
      styles={{
        root: {
          border: `1.5px solid ${
            colorScheme.colorScheme !== "dark"
              ? theme.colors.gray[3]
              : theme.colors.gray[8]
          }`,
          boxShadow: theme.shadows.md,
          padding: 10,
          borderRadius: theme.radius.md,
        },
      }}
    >
      {user && isLoaded && isSignedIn && (
        <Form
          subscription={subscription}
          userId={user.id}
        />
      )}
    </Flex>
  );
}

export { CriteriaForm };
