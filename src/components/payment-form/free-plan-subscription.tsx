"use client";

import { trpc } from "@/app/_trpc/client";
import { PlanDetails, useAppStore } from "@/store/app-store";
import { Flex, Modal, Title, useMantineTheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect } from "react";

interface Props {
  plan: PlanDetails;
  userId: string;
  open: boolean;
  close: VoidFunction;
}

function FreePlanSubscription({ plan, userId, close, open }: Props) {
  const theme = useMantineTheme();

  const { mutateAsync: addFreePlan } = trpc.addFreeSubscription.useMutation();

  useEffect(() => {
    const subscribeToFreePlan = async () => {
      const { code, data } = await addFreePlan({
        userId,
        amount: plan.amount,
        priceId: plan.default_price as string,
        queries: Number(plan.metadata.queryCount),
      });

      switch (code) {
        case "FAILED":
        case "ERROR": {
          notifications.show({
            message:
              "An error occured while processing the subscription. Please try again",
            title: "Process error",
            color: theme.colors.red[5],
          });
          close();
          break;
        }
        case "SUCCESS": {
          notifications.show({
            message: "Successfully subscribed to free plan.",
            title: "Success",
            color: theme.colors.teal[6],
          });
          useAppStore.setState({ subscription: data });
          window.location.href = "/chat";
          break;
        }
        default: {
          break;
        }
      }
    };

    subscribeToFreePlan();
  }, [
    addFreePlan,
    userId,
    plan.id,
    close,
    plan.amount,
    plan.default_price,
    plan.metadata.queryCount,
    theme.colors.red,
    theme.colors.teal,
  ]);

  return (
    <Modal
      opened={open}
      onClose={close}
      centered
      closeOnClickOutside={false}
      radius={theme.radius.md}
      maw={"30%"}
      mih={"30pc"}
    >
      <Flex
        direction={"column"}
        flex={1}
        w={"100%"}
        justify={"center"}
        align={"center"}
        gap={"md"}
      >
        <IconLoader2
          className="animate-spin"
          size={150}
          stroke={1}
          color={theme.colors.blue[5]}
        />
        <Title order={4}>Processing subscription...</Title>
      </Flex>
    </Modal>
  );
}

export { FreePlanSubscription };
