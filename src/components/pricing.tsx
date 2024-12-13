"use client";

import { SelectSubscription } from "@/db/schema";
import { createCheckoutSession } from "@/utllities/apiFunctions";
import { PRICE_LIST, PriceDetail } from "@/utllities/constants";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  Chip,
  Flex,
  List,
  NumberFormatter,
  Paper,
  rem,
  ThemeIcon,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { loadStripe } from "@stripe/stripe-js";
import { IconCircleCheck } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";


interface PriceItemProps {
  item: PriceDetail;
  subscriptionDetails: SelectSubscription | undefined;
}

interface Props {
  subscriptionDetails: SelectSubscription | undefined;
}

function RenderPriceItem({ item, subscriptionDetails }: PriceItemProps) {
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
      radius={"md"}
      withBorder
    >
      <Flex
        direction={"column"}
        w={"100%"}
        p={"xs"}
        align={"center"}
        gap={"md"}
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
          loading={creatingPayIntent || errorPayIntent}
          loaderProps={{
            textRendering: creatingPayIntent ? "Processing..." : "Error",
          }}
          mt={"lg"}
          disabled={!isSignedIn || (subscriptionDetails ? true : false)}
          onClick={() => handleSubscribe(item.priceId, item.label)}
        >
          {subscriptionDetails ? "You have already subscribed" : "Subscribe"}
        </Button>
      </Flex>
    </Paper>
  );
}

function Pricing({ subscriptionDetails }: Props) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const pathName = usePathname();

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
    <Flex
      direction={"column"}
      w={"100%"}
      my={{ xl: pathName.includes("/chat") ? 0 : "5%" }}
      align={"center"}
      className="rounded-md"
      styles={{
        root: {
          border: `1px solid ${
            colorScheme === "dark" ? theme.colors.gray[7] : theme.colors.gray[3]
          }`,
          padding: `${theme.spacing.lg}`,
          flexGrow: 1,
        },
      }}
    >
      {title}
      <Flex
        direction={{ xs: "column", md: "row" }}
        w={"100%"}
        gap={{ xs: "xs", md: "lg" }}
        p={{ xs: "xs", md: "lg" }}
        justify={"space-around"}
      >
        {PRICE_LIST.map((item, index) => (
          <RenderPriceItem
            key={index}
            item={item}
            subscriptionDetails={subscriptionDetails}
          />
        ))}
      </Flex>
    </Flex>
  );
}

export { Pricing };
