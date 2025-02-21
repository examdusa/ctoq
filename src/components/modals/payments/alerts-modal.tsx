"use client";

import { trpc } from "@/app/_trpc/client";
import {
  ErrorAlert,
  SuccessAlert,
} from "@/components/payment-form/payment-alerts";
import { SelectSubscription } from "@/db/schema";
import { PlanDetails, useAppStore } from "@/store/app-store";
import {
  Alert,
  Button,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconInfoCircle, IconLoader2 } from "@tabler/icons-react";
import { useMemo } from "react";

interface Props {
  open: boolean;
  close: VoidFunction;
  subscriptionDetails: SelectSubscription;
}

interface UpgradeSubscriptionProps {
  open: boolean;
  close: VoidFunction;
  subscriptionDetails: SelectSubscription;
  userEmail: string;
  plan: PlanDetails;
  action: "Downgrade" | "Upgrade";
}

function CancelSubscription({ open, close, subscriptionDetails }: Props) {
  const theme = useMantineTheme();

  const {
    mutateAsync: cancelSubscription,
    isLoading: cancellingSubscription,
    isSuccess: subscriptionCancelled,
    isError: cancellationError,
  } = trpc.cancelSubscription.useMutation();

  return (
    <Modal
      opened={open}
      closeButtonProps={{
        display: "none",
      }}
      title="Cancellation alert"
      onClose={() => {}}
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      size={"md"}
      radius={theme.radius.md}
      mih={"40vh"}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
        },
      }}
    >
      {!cancellationError &&
        !cancellingSubscription &&
        !subscriptionCancelled && (
          <Flex
            direction={"column"}
            flex={1}
            w={"100%"}
            align={"center"}
            justify={"center"}
            gap={"md"}
          >
            <Alert title="Cancellation Notice" color="blue">
              Your subscription cancellation will take effect at the end of the
              billing cycle. A cancellation request will be submitted.
            </Alert>
            <Group justify="flex-end" mt={"auto"} w={"100%"}>
              <Button variant="outline" onClick={close}>
                Close
              </Button>
              <Button
                variant="filled"
                onClick={() => {
                  cancelSubscription(subscriptionDetails.id);
                }}
              >
                Ok
              </Button>
            </Group>
          </Flex>
        )}
      <LoadingOverlay
        visible={cancellingSubscription}
        zIndex={1000}
        flex={1}
        display={"flex"}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{
          type: "oval",
          color: "blue",
          children: (
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
              <Title order={4}>Cancelling subscription...</Title>
            </Flex>
          ),
        }}
      />
      {subscriptionCancelled && (
        <SuccessAlert
          closeHanlder={close}
          message="Cancellation request submitted"
        />
      )}
      {cancellationError && (
        <ErrorAlert
          closeHanlder={close}
          message="Cancellation request failed. Try again later."
        />
      )}
    </Modal>
  );
}

function UpgradeSubscription({
  close,
  open,
  subscriptionDetails,
  userEmail,
  plan,
  action,
}: UpgradeSubscriptionProps) {
  const theme = useMantineTheme();
  const setSubscriptionDetails = useAppStore((state) => state.setSubscription);

  const { mutateAsync: getSubscriptionDetails } =
    trpc.getSubscriptionDetails.useMutation({
      onSuccess: (data) => {
        if (data.code === "SUCCESS" && data.data) {
          setSubscriptionDetails({...data.data});
        }
      },
    });

  const {
    mutateAsync: upgradeSubscription,
    isLoading: upgradingSubscription,
    isError: upgradeError,
    data: upgradeData,
  } = trpc.upgradeSubscription.useMutation({
    onSuccess: async (data) => {
      if (data && data.code === "UPGRADE_SUCCESS") {
        await getSubscriptionDetails({ userId: subscriptionDetails.userId });
      }
    },
  });

  const {
    mutateAsync: downgradeSubscription,
    isLoading: downgradingSubscription,
    isError: errorDowngradingSubscription,
    data: downgradeData,
  } = trpc.downgradeSubscription.useMutation();

  if (upgradeData) {
    status = upgradeData.code;
  }

  return (
    <Modal
      opened={open}
      closeButtonProps={{
        display: "none",
      }}
      title={action}
      onClose={() => {}}
      closeOnClickOutside={false}
      closeOnEscape={false}
      centered
      radius={theme.radius.md}
      mih={"40vh"}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        },
      }}
    >
      {!upgradeData && !downgradeData && (
        <>
          <Title order={4}>Subscription {action.toLowerCase()} summary</Title>
          <Divider w={"auto"} my={"xs"} />
          <Flex
            direction={"column"}
            gap={"sm"}
            w={"100%"}
            justify={"start"}
            my={"md"}
          >
            <Title order={5}>Current plan</Title>
            <Flex
              direction={"row"}
              w={"100%"}
              justify={"space-between"}
              align={"center"}
              bg={theme.colors.gray[3]}
              p={"sm"}
              styles={{
                root: {
                  borderRadius: theme.radius.sm,
                },
              }}
            >
              <Text>{subscriptionDetails.planName}</Text>
              {subscriptionDetails.amountPaid && (
                <Text fs={theme.fontSizes.lg} fw={"bold"}>
                  $ {subscriptionDetails.amountPaid / 100}
                </Text>
              )}
            </Flex>
            <Title order={5} mt={"md"}>
              {action} to plan
            </Title>
            <Flex
              direction={"row"}
              w={"100%"}
              justify={"space-between"}
              align={"center"}
              bg={theme.colors.gray[3]}
              p={"sm"}
              styles={{
                root: {
                  borderRadius: theme.radius.sm,
                },
              }}
            >
              <Text>{plan.name}</Text>
              <Text fs={theme.fontSizes.lg} fw={"bold"}>
                $ {plan.amount / 100}
              </Text>
            </Flex>
          </Flex>
          {action !== "Downgrade" && (
            <Alert
              title="Proration Notice"
              color="blue"
              icon={<IconInfoCircle />}
              mt={"md"}
            >
              If proration applies, the amount will be adjusted and charged
              accordingly. The saved payment method will be used to process the
              payment.
            </Alert>
          )}
          <Group justify="flex-end" mt={"md"} w={"100%"}>
            <Button variant="outline" onClick={close}>
              Close
            </Button>
            <Button
              variant="filled"
              onClick={() => {
                if (action === "Downgrade") {
                  downgradeSubscription({
                    subscriptionId: subscriptionDetails.id,
                    priceId: plan.default_price as string,
                    userEmail,
                  });
                } else {
                  upgradeSubscription({
                    subscriptionId: subscriptionDetails.id,
                    priceId: plan.default_price as string,
                    userEmail,
                  });
                }
              }}
            >
              {action}
            </Button>
          </Group>
        </>
      )}
      <LoadingOverlay
        visible={upgradingSubscription || downgradingSubscription}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        styles={{
          root: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            flexGrow: 1,
          },
        }}
        loaderProps={{
          type: "oval",
          color: "blue",
          children: (
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
              {upgradingSubscription ? (
                <Title order={4}>Upgrading subscription...</Title>
              ) : (
                <Title order={4}>Downgrading subscription...</Title>
              )}
            </Flex>
          ),
        }}
      />
      {(upgradeData?.code === "SUCCESS" ||
        upgradeData?.code === "UPGRADE_SUCCESS") && (
        <SuccessAlert
          closeHanlder={close}
          message={"Your subscription has been successfully upgraded."}
        />
      )}
      {downgradeData?.code === "WILL_CHANGE" && (
        <SuccessAlert
          closeHanlder={close}
          message={
            "Your downgrade request has been successfully processed and will take effect on the next billing cycle."
          }
        />
      )}
      {upgradeError && (
        <ErrorAlert
          closeHanlder={close}
          message="Cancellation request failed. Try again later."
        />
      )}
      {errorDowngradingSubscription && (
        <ErrorAlert
          closeHanlder={close}
          message="Subscription downgrade request failed. Try again later."
        />
      )}
    </Modal>
  );
}

export { CancelSubscription, UpgradeSubscription };
