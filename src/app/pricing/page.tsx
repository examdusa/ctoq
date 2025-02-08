"use client";

import { ThemeWrapper } from "@/components/app-layout";
import Footer from "@/components/footer";
import {
  CancelSubscription,
  UpgradeSubscription,
} from "@/components/modals/payments/alerts-modal";
import { PaymentForm } from "@/components/payment-form";
import { SelectSubscription } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import { createCheckoutSession } from "@/utllities/apiFunctions";
import { PRICE_MAP, PriceDetail } from "@/utllities/constants";
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
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "../_trpc/client";

interface PriceItemProps {
  item: PriceDetail;
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
  const [selectedPlan, setSelectedPlan] = useState<PriceDetail | null>(null);
  const [plan, setPlan] = useState<PriceDetail | null>(null);
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

  const isSubscribed = useMemo(() => {
    if (subscriptionDetails) {
      return subscriptionDetails.planId ? true : false;
    }
    return false;
  }, [subscriptionDetails]);

  const {
    mutateAsync: creatPayIntent,
    isLoading: creatingPayIntent,
    isError: errorPayIntent,
  } = useMutation({
    mutationFn: async ({
      userId,
      email,
      priceId,
      prdtName,
    }: {
      userId: string;
      email: string;
      priceId: string;
      prdtName: string;
    }) => {
      return createCheckoutSession(priceId, email, userId, prdtName);
    },
  });

  async function handleSubsCancel() {
    openCancellationModal();
  }

  async function handleSubscribe(plan: PriceDetail) {
    // await handleSubmit(priceId, prdtName);
    setSelectedPlan(plan);
    openPayForm();
  }

  return (
    <Paper
      shadow="md"
      p="xs"
      w={"100%"}
      maw={{ xs: "100%", md: "20%" }}
      h={"100%"}
      radius={"md"}
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
        {subscriptionDetails?.planId === item.priceId &&
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
        {subscriptionDetails?.planId === item.priceId &&
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
        <Image src={item.imageUrl} alt="base-pack" height={80} width={80} />
        <Title order={3} pt={"md"} c={"cyan"}>
          {item.label}
        </Title>
        <Title order={3} pt={"lg"}>
          {item.regularPrice && (
            <NumberFormatter
              prefix="$ "
              value={item.regularPrice}
              thousandSeparator
              className="line-through"
            />
          )}
          &nbsp;&nbsp;
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
          {item.features.map((feature, idx) => (
            <List.Item key={idx}>{feature}</List.Item>
          ))}
        </List>
        <Button
          variant="filled"
          fullWidth
          loading={creatingPayIntent || errorPayIntent || loading}
          loaderProps={{
            textRendering: creatingPayIntent ? "Processing..." : "Error",
          }}
          mt={"lg"}
          disabled={
            !isSignedIn ||
            (subscriptionDetails?.status === "requested_cancellation" &&
              subscriptionDetails.planId === item.priceId)
              ? true
              : false
          }
          onClick={() => {
            if (!isSubscribed) {
              handleSubscribe(item);
              return;
            }

            if (isSubscribed && subscriptionDetails?.planId === item.priceId) {
              handleSubsCancel();
            }
            if (isSubscribed && subscriptionDetails?.planId !== item.priceId) {
              setPlan(item);
              openUpgradeModal();
            }
          }}
        >
          {subscriptionDetails?.planId === item.priceId
            ? "Cancel"
            : isSubscribed
            ? "Upgrade"
            : "Subscribe"}
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
          priceId={plan.priceId}
        />
      )}
    </Paper>
  );
}

export default function Pricing() {
  const theme = useMantineTheme();
  const pathName = usePathname();
  const { user } = useUser();
  const setSubscription = useAppStore((state) => state.setSubscription);
  const subscription = useAppStore((state) => state.subscription);
  const {
    mutateAsync: fetchSubsDetails,
    data: subscriptionData,
    isLoading: fetchingSubsDetails,
  } = trpc.getUserSubscriptionDetails.useMutation();

  const { refetch, data: subscriptionPlans } =
    trpc.fetchSubscriptionPlans.useQuery(undefined, { enabled: false });

  const fetchSubscriptionDetails = useCallback(
    async (userId: string) => {
      await fetchSubsDetails(
        { userId },
        {
          onSuccess: (data) => {
            setSubscription(data[0]);
          },
        }
      );
    },
    [fetchSubsDetails, setSubscription]
  );

  const planItems = useMemo(() => {
    const plans: PriceDetail[] = [];

    if (subscriptionPlans) {
      const { code, data } = subscriptionPlans;

      if (code === "SUCCESS" && data) {
        data.data.forEach((item) => {
          if (PRICE_MAP[item.id]) {
            const { description, features, imageUrl, regularPrice, label } =
              PRICE_MAP[item.id];
            const details: PriceDetail = {
              amount: item.unit_amount,
              label,
              description,
              features,
              imageUrl,
              regularPrice,
              priceId: item.id,
              currencyOptions: item.currency_options,
            };
            plans.push(details);
          }
        });
      }
    }

    return plans;
  }, [subscriptionPlans]);

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

  useEffect(() => {
    if (!subscriptionPlans) refetch();
  }, [refetch, subscriptionPlans]);

  return (
    <ThemeWrapper>
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
              direction={{ xs: "column", md: "row" }}
              w={"100%"}
              gap={{ xs: "xs", md: "md" }}
              h={"100%"}
              p={{ xs: "xs", md: "lg" }}
              justify={"space-around"}
            >
              {planItems.map((item, index) => (
                <RenderPriceItem
                  key={index}
                  item={item}
                  subscriptionDetails={subscription}
                  loading={fetchingSubsDetails}
                  refetchSubscriptionDetails={(userId: string) =>
                    fetchSubsDetails({ userId })
                  }
                />
              ))}
            </Flex>
          </ScrollArea>
        </Flex>
      </Elements>
      <Footer />
    </ThemeWrapper>
  );
}
