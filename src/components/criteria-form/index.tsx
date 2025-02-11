"use client";

import { SelectSubscription } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import {
  Alert,
  Flex,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
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

const priceList: PriceDetail = {
  price_1QGNbZBpYrMQUMR14RX1iZVQ: {
    amount: 0,
    label: "Starter",
    queries: 4,
    questionCount: 10,
    features: ["Generate 4 question set of 10 question each per month"],
  },
  price_1QH7gtBpYrMQUMR1GNUV8E6W: {
    amount: 4999,
    label: "Premium",
    queries: 200,
    questionCount: 30,
    features: ["200 sets of question for up to 30 questions per month"],
  },
  price_1QKM8OBpYrMQUMR17Lk1ZR7D: {
    amount: 9999,
    label: "Integrated",
    queries: -1,
    questionCount: -1,
    features: ["Generate unlimited sets of question each month"],
  },
};

function CriteriaForm({ subscription }: Props) {
  const { user, isLoaded, isSignedIn } = useUser();
  const colorScheme = useMantineColorScheme();
  const theme = useMantineTheme();

  const disableFields = useMemo(() => {
    if (subscription) {
      return subscription.queries === 0 || subscription.status !== 'paid';
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
          priceDetails={priceList}
          subscription={subscription}
          userId={user.id}
        />
      )}
      {disableFields && (
        <Alert
          variant="light"
          color={"blue"}
          title={"Info"}
          icon={<IconInfoCircle />}
          mt={"auto"}
          radius={"md"}
        >
          <Flex direction={"column"} w={"auto"} align={"start"} gap={"xs"}>
            <Text size="sm">
              It looks like you&apos;ve run out of available query counts.
            </Text>
            <Text size="sm">
              If you want to reset your account or upgrade please contact
              <span className="text-blue-600"> help@content2quiz.com</span>
            </Text>
          </Flex>
        </Alert>
      )}
    </Flex>
  );
}

export { CriteriaForm };
