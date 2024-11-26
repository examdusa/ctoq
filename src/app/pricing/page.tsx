"use client";

import { ThemeWrapper } from "@/components/app-layout";
import Footer from "@/components/footer";
import { SelectSubscription } from "@/db/schema";
import { createCheckoutSession } from "@/utllities/apiFunctions";
import { useUser } from "@clerk/nextjs";
import {
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
import { loadStripe } from "@stripe/stripe-js";
import { IconCircleCheck } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "../_trpc/client";

interface PriceDetail {
  priceId: string;
  amount: number;
  label: string;
  description: React.ReactNode;
  features: string[];
  imageUrl: string;
  regularPrice: number | null;
}

interface PriceItemProps {
  item: PriceDetail;
  subscriptionDetails: SelectSubscription | undefined;
  loading: boolean;
}

const priceList: PriceDetail[] = [
  {
    priceId: "price_1QGNbZBpYrMQUMR14RX1iZVQ",
    amount: 0,
    label: "Starter",
    description: <div></div>,
    imageUrl: "/images/base-sub.png",
    features: ["Generate 4 question set of 10 question each per month"],
    regularPrice: null,
  },
  {
    priceId: "price_1QH7gtBpYrMQUMR1GNUV8E6W",
    amount: 4999,
    label: "Premium",
    description: <div></div>,
    features: ["200 sets of question for up to 30 questions per month"],
    imageUrl: "/images/premium-sub.png",
    regularPrice: 99,
  },
  {
    priceId: "price_1QKM8OBpYrMQUMR17Lk1ZR7D",
    amount: 19900,
    label: "Integrated",
    description: <div></div>,
    features: ["Generate unlimited sets of question each month"],
    imageUrl: "/images/integrated-sub.png",
    regularPrice: 399,
  },
];

function RenderPriceItem({
  item,
  subscriptionDetails,
  loading,
}: PriceItemProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const { user, isSignedIn } = useUser();

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

  async function handleSubmit(priceId: string, prdtName: string) {
    if (user) {
      const { sessionId } = await creatPayIntent({
        userId: user.id,
        email: user.emailAddresses[0].emailAddress,
        priceId: priceId,
        prdtName,
      });

      if (sessionId) {
        const stripe = await stripePromise;

        const response = await stripe?.redirectToCheckout({
          sessionId: sessionId,
        });
        return response;
      }
    }
  }

  async function handleSubscribe(priceId: string, prdtName: string) {
    await handleSubmit(priceId, prdtName);
  }

  useEffect(() => {
    setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!));
  }, []);

  return (
    <Paper
      shadow="md"
      p="xs"
      w={"100%"}
      maw={{ xs: "100%", md: "30%" }}
      h={"100%"}
      radius={"md"}
      withBorder
    >
      <Flex
        direction={"column"}
        w={"100%"}
        p={"xs"}
        align={"center"}
        gap={"md"}
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
            (subscriptionDetails?.planId === item.priceId ? true : false)
          }
          onClick={() => handleSubscribe(item.priceId, item.label)}
        >
          {subscriptionDetails?.planId === item.priceId
            ? "You have already subscribed"
            : "Subscribe"}
        </Button>
      </Flex>
    </Paper>
  );
}

export default function Pricing() {
  const theme = useMantineTheme();
  const pathName = usePathname();
  const { user } = useUser();
  const {
    mutateAsync: fetchSubsDetails,
    data: subscriptionData,
    isLoading: fetchingSubsDetails,
  } = trpc.getSubscriptionDetails.useMutation();

  const fetchSubscriptionDetails = useCallback(
    async (userId: string) => {
      await fetchSubsDetails({ userId });
    },
    [fetchSubsDetails]
  );

  useEffect(() => {
    if (user && !subscriptionData) {
      fetchSubscriptionDetails(user.id);
    }
  }, [fetchSubscriptionDetails, subscriptionData, user]);

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

  return (
    <ThemeWrapper subscriptionDetails={undefined}>
      <Flex
        direction={"column"}
        w={"100%"}
        my={{ xl: pathName.includes("/chat") ? 0 : "5%" }}
        align={"center"}
        className="rounded-md"
        styles={{
          root: {
            padding: `${theme.spacing.lg}`,
            flexGrow: 1
          },
        }}
      >
        {title}
        <ScrollArea style={{ height: "calc(100vh-200px)", width: "100%" }}>
          <Flex
            direction={{ xs: "column", md: "row" }}
            w={"100%"}
            gap={{ xs: "xs", md: "lg" }}
            h={"100%"}
            p={{ xs: "xs", md: "lg" }}
            justify={"space-around"}
          >
            {priceList.map((item, index) => (
              <RenderPriceItem
                key={index}
                item={item}
                subscriptionDetails={subscriptionData}
                loading={fetchingSubsDetails}
              />
            ))}
          </Flex>
        </ScrollArea>
      </Flex>
      <Footer />
    </ThemeWrapper>
  );
}
