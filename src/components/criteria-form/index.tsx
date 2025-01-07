"use client";

import { SelectSubscription } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  fetchGeneratedQuestions,
  GenerateQBankPayload,
} from "@/utllities/apiFunctions";
import { useUser } from "@clerk/nextjs";
import {
  Alert,
  Flex,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
  // async function storeQuestionBank(
  //   questions:
  //     | MCQQuestionsSchema
  //     | FillBlankQuizResponseSchema
  //     | MCQSimilarQuizResponseSchema
  //     | OpenEndedQuizResponseSchema
  //     | TrueFalseQuestionsSchema,
  //   refId: string,
  //   userId: string,
  //   formValues: GenerateQBankPayload
  // ) {
  //   const { prompt_responses, url_responses } = questions;

  //   if (prompt_responses.length > 0) {
  //     const { questions, input } = prompt_responses[0];
  //     const { difficulty, promptUrl, qCount, qType } = formValues;
  //     switch (formValues.qType) {
  //       case "mcq": {
  //       }
  //     }
  //     await saveQBank(
  //       {
  //         jobId: refId,
  //         difficulty: difficulty,
  //         userId: userId,
  //         qCount: qCount,
  //         qKeyword: input,
  //         qType: qType,
  //         questions: { questions: questions },
  //         qUrl: promptUrl,
  //         withAnswer: withAnswer,
  //       },
  //       {
  //         onSuccess: (data) => {
  //           if (data) {
  //             const updatedList = {
  //               ...questionList,
  //               [data.id]: {
  //                 ...data,
  //                 createdAt: data.createdAt ? new Date(data.createdAt) : null,
  //                 questions: data.questions,
  //                 googleQuizLink: "",
  //                 instituteName:
  //                   instituteName.length === 0
  //                     ? "Content To Quiz"
  //                     : instituteName,
  //               },
  //             };
  //             setQuestions(updatedList);
  //             if (instituteName !== "Content To Quiz") {
  //               setInstituteName("Content To Quiz");
  //             }
  //           }
  //         },
  //       }
  //     );
  //     if (subscription && subscription.queries) {
  //       let count = subscription.queries - 1;
  //       const { planName } = subscription;

  //       if (planName === "Integrated") {
  //         count = subscription.queries;
  //       }
  //       await updateCount({
  //         userId: userId,
  //         count: count,
  //       });
  //     }
  //   } else if (url_responses.length > 0) {
  //     const { questions, input } = url_responses[0];
  //     const { difficulty, promptUrl, qCount, qType } = formValues;
  //     await saveQBank(
  //       {
  //         jobId: refId,
  //         difficulty: difficulty,
  //         userId: userId,
  //         qCount: qCount,
  //         qKeyword: input,
  //         qType: qType,
  //         questions: { questions: questions },
  //         qUrl: promptUrl,
  //         withAnswer: withAnswer,
  //       },
  //       {
  //         onSuccess: (data) => {
  //           if (data) {
  //             const updatedList = {
  //               ...questionList,
  //               [data.id]: {
  //                 ...data,
  //                 createdAt: data.createdAt ? new Date(data.createdAt) : null,
  //                 questions: data.questions,
  //                 googleQuizLink: "",
  //                 instituteName:
  //                   instituteName.length === 0
  //                     ? "Content To Quiz"
  //                     : instituteName,
  //               },
  //             };
  //             setQuestions(updatedList);
  //             if (instituteName !== "Content To Quiz") {
  //               setInstituteName("Content To Quiz");
  //             }
  //           }
  //         },
  //       }
  //     );
  //     if (subscription && subscription.queries) {
  //       let count = subscription.queries - 1;
  //       const { planName } = subscription;

  //       if (planName === "Integrated") {
  //         count = subscription.queries;
  //       }
  //       await updateCount({
  //         userId: userId,
  //         count: count,
  //       });
  //     }
  //   }
  // }

  const { mutate: fetchQuestions, isLoading: fetchingQuestion } = useMutation({
    mutationFn: async ({
      refId,
      values,
    }: {
      refId: string;
      userId: string;
      values: GenerateQBankPayload;
      candidateName: string | null;
      resumeContent: boolean;
    }) => {
      return await fetchGeneratedQuestions(refId, values.qType);
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
      // if (resumeContent) {
      //   storeQuestionBank(data, variable.refId, variable.userId, {
      //     difficulty: difficulty,
      //     prompt: candidateName ?? "",
      //     promptUrl: promptUrl,
      //     qCount: qCount,
      //     qType: qType,
      //   });
      // } else {
      //   storeQuestionBank(data, variable.refId, variable.userId, {
      //     difficulty: difficulty,
      //     prompt: prompt,
      //     promptUrl: promptUrl,
      //     qCount: qCount,
      //     qType: qType,
      //   });
      // }
      useAppStore.setState({
        generatingQuestions: false,
        renderQIdx: variable.refId,
      });
    },
  });

  const disableFields = useMemo(() => {
    if (subscription) {
      return subscription.queries === 0;
    }
    return false;
  }, [subscription]);

  // const { queries, features } = useMemo(() => {
  //   if (subscription && subscription.planId) {
  //     const { queries, features } = priceList[subscription.planId];
  //     return { queries, features };
  //   }
  //   return { queries: null, features: null };
  // }, [subscription]);

  return (
    <Flex
      w={"100%"}
      direction={"column"}
      gap={"xs"}
      maw={{ xs: "30%", md: "25%" }}
      my={"xs"}
      p={0}
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
      {/* {subscription && (
        <Alert
          variant="light"
          color={!subscription.queries ? "red" : "lime"}
          title={!subscription.queries ? "Note" : "All set"}
          icon={<IconInfoCircle />}
          mt={"auto"}
        >
          <Flex direction={"column"} w={"auto"} align={"start"} gap={"xs"}>
            <Text size="sm">
              Your subscription plan name is ~ {subscription.planName}
            </Text>
            <Text size="sm">You&apos;re offered to generate</Text>
            <List listStyleType="disc" withPadding>
              {features &&
                features.map((item, idx) => {
                  return (
                    <List.Item fs={"italic"} className="text-sm" key={idx}>
                      {item}
                    </List.Item>
                  );
                })}
            </List>
            <Badge variant="outline" color="orange" size="lg" radius="sm">
              <Flex direction={"row"} w={"auto"} gap={"sm"} align={"center"}>
                <Text size="sm">
                  Queries left :{" "}
                  {queries && queries < 0 ? "Unlimited" : queries}
                </Text>
              </Flex>
            </Badge>
          </Flex>
        </Alert>
      )} */}
    </Flex>
  );
}

export { CriteriaForm };
