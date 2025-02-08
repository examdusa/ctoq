"use client";

import { trpc } from "@/app/_trpc/client";
import {
  ErrorAlert,
  SuccessAlert,
} from "@/components/payment-form/payment-alerts";
import { SelectSubscription } from "@/db/schema";
import {
  Alert,
  Button,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconLoader2 } from "@tabler/icons-react";

interface Props {
  open: boolean;
  close: VoidFunction;
  subscriptionDetails: SelectSubscription;
}

interface UpgradeSubscriptionProps {
  open: boolean;
  close: VoidFunction;
  subscriptionDetails: SelectSubscription;
  priceId: string;
  userEmail: string;
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
  priceId,
  userEmail,
}: UpgradeSubscriptionProps) {
  const theme = useMantineTheme();

  const {
    mutateAsync: upgradeSubscription,
    isLoading: upgradingSubscription,
    isError: upgradeError,
    data,
  } = trpc.upgradeSubscription.useMutation();

  let status = 'SUCCESS'

  if (data) {
    status = data.code
  }

  return (
    <Modal
      opened={open}
      closeButtonProps={{
        display: "none",
      }}
      title="Upgrade alert"
      onClose={() => {}}
      closeOnClickOutside={false}
      closeOnEscape={false}
      size={"md"}
      centered
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
      {(!upgradeError && status === 'SUCCESS') && (
        <Flex
          direction={"column"}
          flex={1}
          w={"100%"}
          align={"center"}
          justify={"center"}
          gap={"md"}
        >
          <Alert title="Upgrade Notice" color="blue">
            Your subscription upgrade will take effect at the end of the billing
            cycle. An upgrade request will be submitted.
          </Alert>
          <Group justify="flex-end" mt={"auto"} w={"100%"}>
            <Button variant="outline" onClick={close}>
              Close
            </Button>
            <Button
              variant="filled"
              onClick={() => {
                upgradeSubscription({
                  subscriptionId: subscriptionDetails.id,
                  priceId,
                  userEmail,
                });
              }}
            >
              Ok
            </Button>
          </Group>
        </Flex>
      )}
      <LoadingOverlay
        visible={upgradingSubscription}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        flex={1}
        display={"flex"}
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
      {(data?.code === "SUCCESS" || data?.code === "WILL_UPGRADE") && (
        <SuccessAlert
          closeHanlder={close}
          message={
            data?.code === "SUCCESS"
              ? "Your subscription has been successfully upgraded."
              : "Your subscription will be upgraded at the end of the billing cycle."
          }
        />
      )}
      {upgradeError && (
        <ErrorAlert
          closeHanlder={close}
          message="Cancellation request failed. Try again later."
        />
      )}
    </Modal>
  );
}

export { CancelSubscription, UpgradeSubscription };
