"use client";

import { ThemeWrapper } from "@/components/app-layout";
import Footer from "@/components/footer";
import {
  CancelSubscription,
  UpgradeSubscription,
} from "@/components/modals/payments/alerts-modal";
import { PaymentForm } from "@/components/payment-form";
import { SelectSubscription } from "@/db/schema";
import { PlanDetails, useAppStore } from "@/store/app-store";
import { useUser } from "@clerk/nextjs";
import {
  Badge,
  Button,
  Chip,
  Flex,
  List,
  NumberFormatter,
  Paper,
  rem,
  ScrollArea,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { IconCircleCheck } from "@tabler/icons-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "../_trpc/client";

interface PriceItemProps {
  item: PlanDetails;
  subscriptionDetails: SelectSubscription | undefined;
  loading: boolean;
  refetchSubscriptionDetails: (userId: string) => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function RenderPriceItem({
  item,
  subscriptionDetails,
  loading,
  refetchSubscriptionDetails,
}: PriceItemProps) {
  const { user, isSignedIn } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [payFormOpen, { open: openPayForm, close: closePayForm }] =
    useDisclosure(false);
  const [
    cancelModalOpen,
    { open: openCancellationModal, close: closeCancellationModal },
  ] = useDisclosure(false);
  const [
    upgradeModalOpen,
    { open: openUpgradeModal, close: closeUpgradeModal },
  ] = useDisclosure(false);

  const action = useMemo(() => {
    if (subscriptionDetails && subscriptionDetails.amountPaid !== null) {
      if (item.amount > subscriptionDetails.amountPaid) {
        return "Upgrade";
      } else {
        return "Downgrade";
      }
    }
    return "Subscribe";
  }, [subscriptionDetails, item]);

  const isSubscribed = useMemo(() => {
    if (subscriptionDetails) {
      return subscriptionDetails.planId &&
        subscriptionDetails.planName !== "Free"
        ? true
        : false;
    }
    return false;
  }, [subscriptionDetails]);

  async function handleSubsCancel() {
    openCancellationModal();
  }

  async function handleSubscribe(plan: PlanDetails) {
    // await handleSubmit(priceId, prdtName);
    setSelectedPlan(plan);
    openPayForm();
  }

  return (
    <Paper
      p="xs"
      w={"100%"}
      maw={{ xs: "100%", md: "20%" }}
      radius={"md"}
      styles={{
        root: {
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        },
      }}
      withBorder
    >
      <Flex
        direction={"column"}
        w={"100%"}
        p={"xs"}
        align={"center"}
        pos={"relative"}
        gap={"sm"}
        styles={{
          root: {
            flexGrow: 1,
          },
        }}
      >
        {!isSignedIn && (
          <Chip
            defaultChecked
            variant="light"
            ml={"auto"}
            className="pointer-events-none"
          >
            Requires signing in
          </Chip>
        )}
        {subscriptionDetails &&
          subscriptionDetails?.planId === item.default_price &&
          subscriptionDetails.status === "paid" && (
            <Badge
              size="lg"
              pos={"absolute"}
              top={0}
              right={0}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
            >
              Subscribed
            </Badge>
          )}
        {subscriptionDetails &&
          subscriptionDetails?.planId === item.default_price &&
          subscriptionDetails.status === "requested_cancellation" && (
            <Badge
              size="lg"
              pos={"absolute"}
              top={0}
              right={0}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
            >
              Cancellation requested
            </Badge>
          )}
        {item.images.length > 0 && (
          <Image src={item.images[0]} alt="base-pack" height={80} width={80} />
        )}
        <Title order={3} pt={"md"} c={"cyan"}>
          {item.name}
        </Title>
        <Title order={3} pt={"lg"}>
          <NumberFormatter
            prefix="$ "
            value={item.amount / 100}
            thousandSeparator
          />
        </Title>
        <Title
          order={4}
          pt={"md"}
          styles={{
            root: {
              alignSelf: "self-start",
            },
          }}
        >
          Features
        </Title>
        <List
          size="sm"
          spacing={"sm"}
          icon={
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
            </ThemeIcon>
          }
        >
          <List.Item>{item.description}</List.Item>
        </List>
        <Button
          variant="filled"
          fullWidth
          loading={loading}
          loaderProps={{
            textRendering: loading ? "Processing..." : "Error",
          }}
          mt={"auto"}
          disabled={
            !isSignedIn ||
            (subscriptionDetails?.status === "requested_cancellation" &&
              subscriptionDetails.planId === item.default_price) ||
            (subscriptionDetails?.planId === item.default_price &&
              item.amount === 0)
              ? true
              : false
          }
          onClick={() => {
            if (!isSubscribed) {
              handleSubscribe(item);
              return;
            }

            if (
              isSubscribed &&
              subscriptionDetails?.planId === item.default_price
            ) {
              handleSubsCancel();
            }
            if (
              isSubscribed &&
              subscriptionDetails?.planId !== item.default_price
            ) {
              setPlan(item);
              openUpgradeModal();
            }
          }}
        >
          {subscriptionDetails?.planId === item.default_price
            ? "Cancel"
            : action}
        </Button>
      </Flex>
      {selectedPlan && payFormOpen && (
        <PaymentForm
          open={payFormOpen}
          close={() => {
            closePayForm();
            if (user) {
              refetchSubscriptionDetails(user.id);
            }
          }}
          plan={selectedPlan}
        />
      )}
      {cancelModalOpen && subscriptionDetails && (
        <CancelSubscription
          close={() => {
            closeCancellationModal();
            if (user) refetchSubscriptionDetails(user.id);
          }}
          open={cancelModalOpen}
          subscriptionDetails={subscriptionDetails}
        />
      )}
      {upgradeModalOpen && subscriptionDetails && user && plan && (
        <UpgradeSubscription
          open={upgradeModalOpen}
          close={() => {
            closeUpgradeModal();
            setPlan(null);
            if (user) refetchSubscriptionDetails(user.id);
          }}
          subscriptionDetails={subscriptionDetails}
          userEmail={user.emailAddresses[0].emailAddress}
          plan={plan}
          action={action as "Upgrade" | "Downgrade"}
        />
      )}
    </Paper>
  );
}

export default function Pricing() {
  const theme = useMantineTheme();
  const pathName = usePathname();
  const { user } = useUser();
  const subscription = useAppStore((state) => state.subscription);
  const subscriptionPlans = useAppStore((state) => state.subscriptionPlans);
  const {
    mutateAsync: fetchSubsDetails,
    data: subscriptionData,
    isLoading: fetchingSubsDetails,
  } = trpc.getUserSubscriptionDetails.useMutation();

  const fetchSubscriptionDetails = useCallback(
    async (userId: string) => {
      const data = await fetchSubsDetails({ userId });

      if (data.length > 0) {
        useAppStore.setState({ subscription: { ...data[0] } });
      }
    },
    [fetchSubsDetails]
  );

  const title = useMemo(() => {
    if (pathName.includes("/chat")) {
      return (
        <Flex
          direction={"column"}
          h={"auto"}
          w={"100%"}
          gap={"sm"}
          align={"center"}
        >
          <Title order={2}>You&apos;re just a subscription away</Title>
          <Title order={3}>Monthly Pricing</Title>
        </Flex>
      );
    }
    return <Title order={2}>Monthly Pricing</Title>;
  }, [pathName]);

  useEffect(() => {
    if (user && !subscriptionData && !subscription) {
      fetchSubscriptionDetails(user.id);
    }
  }, [fetchSubscriptionDetails, subscriptionData, user, subscription]);

  return (
    <ThemeWrapper>
      <ScrollArea
        styles={{
          root: {
            height: "calc(100vh - 64px)",
            width: "100%",
          },
          viewport: {
            height: "100%",
            width: "100%",
          },
        }}
        mx={"auto"}
      >
        <Elements stripe={stripePromise}>
          <Flex
            direction={"column"}
            w={"100%"}
            my={{ xl: pathName.includes("/chat") ? 0 : "5%" }}
            align={"center"}
            className="rounded-md"
            gap={"md"}
            styles={{
              root: {
                padding: `${theme.spacing.lg}`,
                flexGrow: 1,
              },
            }}
          >
            {title}
            <ScrollArea style={{ height: "calc(100vh- 20vh)", width: "100%" }}>
              <Flex
                direction={{ base: "column", md: "row" }}
                w={"100%"}
                gap={{ base: "xs", md: "md" }}
                h={"100%"}
                p={{ xs: "xs", md: "lg" }}
                justify={"space-around"}
              >
                {subscriptionPlans.map((item, index) => (
                  <RenderPriceItem
                    key={index}
                    item={item}
                    subscriptionDetails={subscription}
                    loading={fetchingSubsDetails}
                    refetchSubscriptionDetails={(userId: string) =>
                      fetchSubscriptionDetails(userId)
                    }
                  />
                ))}
              </Flex>
            </ScrollArea>
          </Flex>
        </Elements>
        <Footer />
      </ScrollArea>
    </ThemeWrapper>
  );
}
