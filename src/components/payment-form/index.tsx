"use client";

import { trpc } from "@/app/_trpc/client";
import { PlanDetails, useAppStore } from "@/store/app-store";
import {
  CARD_ELEMENT_OPTIONS,
  stripeSupportedCountries,
} from "@/utllities/constants";
import { calculateAmountAfterDiscount } from "@/utllities/helpers";
import { payCardSchema } from "@/utllities/zod-schemas-types";
import { useUser } from "@clerk/nextjs";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  Grid,
  Image,
  LoadingOverlay,
  Modal,
  Paper,
  Pill,
  Select,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  IconInfoCircle,
  IconLoader2,
  IconRosetteDiscountCheck,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import CardsLogo from "../../../public/images/cards_logo.png";
import { FreePlanSubscription } from "./free-plan-subscription";
import { ErrorAlert, SuccessAlert } from "./payment-alerts";

interface Props {
  open: boolean;
  close: VoidFunction;
  plan: PlanDetails;
}

const promoCodeFormSchema = z.object({
  code: z.string().nullable(),
});

type PayCardValues = z.infer<typeof payCardSchema>;

const countryOptions = Object.entries(stripeSupportedCountries).map(
  ([key, value]) => ({ value: key, label: value.name })
);

function PaymentForm({ open, close, plan }: Props) {
  const theme = useMantineTheme();
  const { user, isLoaded, isSignedIn } = useUser();
  const [finalAmount, setFinalAmount] = useState(plan.amount / 100);
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const showDiscountMenu = useMemo(() => {
    const { amount } = plan;
    if (amount === 0) {
      return false;
    }
    return true;
  }, [plan]);

  const stripe = useStripe();
  const elements = useElements();

  const {
    mutateAsync: validatePromoCode,
    isLoading: validatingPromoCode,
    data: couponData,
  } = trpc.validatePromoCode.useMutation();

  const {
    mutateAsync: createCustomer,
    isLoading: creatingCustomer,
    isError: createCustomerError,
  } = trpc.createCustomer.useMutation();

  const {
    mutateAsync: createSubscription,
    isLoading: creatingSubscription,
    isError: createSubscriptionError,
    isSuccess: createSubscriptionSuccess,
  } = trpc.createSubscription.useMutation();

  const promoCodeForm = useForm({
    validate: zodResolver(promoCodeFormSchema),
    initialValues: {
      code: "",
    },
    mode: "controlled",
  });

  const payCardForm = useForm({
    validate: zodResolver(payCardSchema),
    initialValues: {
      email: user?.emailAddresses[0].emailAddress || "",
      firstName: "",
      lastName: "",
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      consentAccepted: false,
    },
  });

  const { name } = plan;

  async function validateInputPromoCode(code: string) {
    const { code: resCode, data } = await validatePromoCode(code);

    if (resCode === "SUCCESS") {
      if (data.data.length > 0) {
        const {
          coupon: { percent_off },
        } = data.data[0];

        if (percent_off) {
          const finalAmount = calculateAmountAfterDiscount(
            plan.amount / 100,
            percent_off
          );
          setFinalAmount(finalAmount);
          setCouponApplied(true);
        }
      }
    } else {
      promoCodeForm.setFieldError("code", "Invalid coupon code");
    }
  }

  async function handlePay(values: PayCardValues) {
    if (!user || !isSignedIn || !isLoaded) return;
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }
    setLoading(true);

    const {
      firstName,
      lastName,
      email,
      addressLine1,
      city,
      country,
      postalCode,
      state,
    } = values;

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: `${firstName} ${lastName}`,
        email: email,
      },
    });

    setLoading(false);

    if (error) {
      notifications.show({
        message: error.message,
        title:
          error.code === "card_declined"
            ? "Card Declined"
            : "Something went wrong",
        withCloseButton: true,
        color: "red",
      });
      return;
    }
    const { code: ccCode, data: ccData } = await createCustomer({
      addressLine1,
      city,
      country,
      email,
      firstName,
      lastName,
      postalCode,
      state,
      paymentMethodId: paymentMethod.id,
      userId: user.id,
    });

    const currency =
      stripeSupportedCountries[country as keyof typeof stripeSupportedCountries]
        .currency;
    if (ccCode === "FAILED") {
      return;
    }

    const { code: csCode } = await createSubscription({
      couponCode:
        couponData && couponData.data ? couponData.data.data[0].id : "",
      currency: currency,
      customerId: ccData.id,
      paymentMethodId: paymentMethod.id,
      priceId: plan.default_price as string,
      userId: user.id,
    });

    if (csCode === "SUCCESS") {
      notifications.show({
        title: "Success",
        message: "You have successfully subscribed",
        position: "bottom-right",
      });
    }
  }

  const showForm = useMemo(() => {
    if (
      !creatingCustomer &&
      !createCustomerError &&
      !creatingSubscription &&
      !createSubscriptionError &&
      !createSubscriptionSuccess
    ) {
      return true;
    }
    return false;
  }, [
    creatingCustomer,
    createCustomerError,
    creatingSubscription,
    createSubscriptionError,
    createSubscriptionSuccess,
  ]);

  if (plan.amount === 0 && user) {
    return (
      <FreePlanSubscription
        open={open}
        close={close}
        plan={plan}
        userId={user.id}
      />
    );
  }

  return (
    <Modal
      opened={open}
      onClose={close}
      title="Payment details"
      centered
      closeOnEscape={false}
      size={showDiscountMenu ? "65%" : "45%"}
      radius={theme.radius.md}
      closeOnClickOutside={false}
      mih={"30pc"}
      fullScreen={window.innerWidth <= 768} // Fullscreen on mobile screens
      styles={{
        body: {
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        },
      }}
    >
      {showForm && (
        <Flex direction={"column"} h={"100%"} w={"100%"} gap={"sm"} flex={1}>
          <Flex
            direction={{ base: "column", md: "row" }}
            w={"100%"}
            gap={"sm"}
            flex={1}
          >
            {showDiscountMenu && (
              <Paper
                bg={"#F0F8FF"}
                w={{ base: "100%", md: "30%" }}
                p={"xs"}
                radius={theme.radius.md}
                styles={{
                  root: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                  },
                }}
              >
                <Title order={5}>Total amount</Title>
                <Title order={1} c={theme.colors.teal[6]}>
                  $ {finalAmount}
                </Title>
                <Divider
                  my={{ base: "xs", md: "md" }}
                  orientation="horizontal"
                  w={"80%"}
                />
                <Container
                  fluid
                  pt={{ base: "xs", md: "md" }}
                  m={0}
                  w={"100%"}
                  styles={{
                    root: {
                      alignItems: "start",
                      gap: theme.spacing.md,
                    },
                  }}
                >
                  <Title order={6}>Payment summary</Title>
                  <Flex w={"100%"} justify={"space-between"} my={"md"}>
                    <Title order={5} fw={"normal"}>
                      {name}
                    </Title>
                    <Title order={5}>$ {plan.amount / 100}</Title>
                  </Flex>

                  {!couponApplied && (
                    <form
                      onSubmit={promoCodeForm.onSubmit((values) =>
                        validateInputPromoCode(values.code)
                      )}
                    >
                      <TextInput
                        key={promoCodeForm.key("code")}
                        {...promoCodeForm.getInputProps("code")}
                        label="Promo code"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        mt={"md"}
                        fullWidth
                        loading={validatingPromoCode}
                        disabled={!promoCodeForm.getValues().code}
                      >
                        Apply
                      </Button>
                    </form>
                  )}
                  {couponApplied && couponData && couponData.data && (
                    <Flex justify={"space-between"} w={"auto"}>
                      <Flex direction={"column"} gap={"sm"}>
                        <Text size="sm">Coupon applied</Text>
                        <Flex gap={"sm"} align={"center"}>
                          <Badge
                            leftSection={<IconRosetteDiscountCheck size={15} />}
                            size="lg"
                          >
                            {couponData.data.data[0].code}
                          </Badge>
                          <Button
                            variant="subtle"
                            onClick={() => {
                              setCouponApplied(false);
                              setFinalAmount(plan.amount / 100);
                            }}
                          >
                            Change
                          </Button>
                        </Flex>
                      </Flex>
                      <Text size="sm" fw={"bold"}>
                        {couponData.data.data[0].coupon.percent_off} %
                      </Text>
                    </Flex>
                  )}
                </Container>
                <Flex
                  w={"100%"}
                  justify={"space-between"}
                  px={"xs"}
                  mt={{ base: "xs", md: "md" }}
                >
                  <Title order={5}>Final amount</Title>
                  <Title order={5}>$ {finalAmount}</Title>
                </Flex>
              </Paper>
            )}
            <Flex direction={"column"} gap={"md"} flex={1} h={"100%"}>
              <Flex
                direction={{ base: "column", md: "row" }}
                w={"100%"}
                justify={"space-between"}
                gap={{ base: "xs", md: 0 }}
                align={{ base: "start", md: "center" }}
              >
                <Pill
                  size="lg"
                  styles={{
                    root: {
                      backgroundColor: theme.colors.teal[5],
                      color: "white",
                    },
                  }}
                >
                  You&apos;re paying $ {finalAmount}
                </Pill>
                <Image
                  bg={"#F0F8FF"}
                  src={CardsLogo.src}
                  radius={theme.radius.md}
                  fit="cover"
                  alt="cards-logo"
                  ml={{ base: 0, md: "auto" }}
                  className="w-full h-10 max-w-xs"
                  styles={{
                    root: {
                      flex: "none",
                    },
                  }}
                />
              </Flex>
              <form
                onSubmit={payCardForm.onSubmit((values) => handlePay(values))}
              >
                <Grid columns={2} w={"auto"}>
                  <Grid.Col span={1}>
                    <TextInput
                      withAsterisk
                      {...payCardForm.getInputProps("firstName")}
                      key={payCardForm.key("firstName")}
                      label="First name"
                      placeholder="eg. Jhon"
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <TextInput
                      withAsterisk
                      {...payCardForm.getInputProps("lastName")}
                      key={payCardForm.key("lastName")}
                      label="Last name"
                      placeholder="eg. Doe"
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <TextInput
                      disabled
                      withAsterisk
                      {...payCardForm.getInputProps("email")}
                      key={payCardForm.key("email")}
                      label="Email"
                      placeholder="eg. johndoe@example.com"
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <TextInput
                      withAsterisk
                      {...payCardForm.getInputProps("addressLine1")}
                      key={payCardForm.key("addressLine1")}
                      label="Address Line"
                      placeholder="eg. 123 Main St"
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <TextInput
                      withAsterisk
                      {...payCardForm.getInputProps("city")}
                      key={payCardForm.key("city")}
                      label="City"
                      placeholder="eg. New York"
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <TextInput
                      withAsterisk
                      {...payCardForm.getInputProps("state")}
                      key={payCardForm.key("state")}
                      label="State"
                      placeholder="eg. NY"
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <TextInput
                      withAsterisk
                      {...payCardForm.getInputProps("postalCode")}
                      key={payCardForm.key("postalCode")}
                      label="Postal Code"
                      placeholder="eg. 10001"
                    />
                  </Grid.Col>
                  <Grid.Col span={1}>
                    <Select
                      withAsterisk
                      {...payCardForm.getInputProps("country")}
                      key={payCardForm.key("country")}
                      label="Country"
                      searchable
                      checkIconPosition="right"
                      placeholder="Select a country"
                      data={countryOptions}
                    />
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <Container
                      p={"sm"}
                      my={"sm"}
                      styles={{
                        root: {
                          borderRadius: theme.radius.sm,
                          border: `1px solid ${theme.colors.gray[4]}`,
                        },
                      }}
                    >
                      <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        id="card-element"
                      />
                    </Container>
                  </Grid.Col>
                  <Grid.Col span={2} py={0}>
                    <Checkbox
                      label="I authorize recurring charges for this subscription as per the terms and conditions"
                      {...payCardForm.getInputProps("consentAccepted")}
                      key={payCardForm.key("consentAccepted")}
                    />
                  </Grid.Col>
                </Grid>
                <Button
                  variant="filled"
                  size="compact-md"
                  fullWidth
                  mt={"md"}
                  type="submit"
                  loading={loading}
                >
                  Pay
                </Button>
                <Alert
                  variant="light"
                  color="blue"
                  title=""
                  icon={<IconInfoCircle />}
                  mt={"md"}
                >
                  The amount will be charged immediately to your selected
                  payment method upon subscribing. This is a recurring charge
                  based on your subscription plan.
                </Alert>
              </form>
            </Flex>
          </Flex>
        </Flex>
      )}
      {createSubscriptionSuccess && (
        <SuccessAlert closeHanlder={close} message="Payment Successful" />
      )}
      {(createCustomerError || createSubscriptionError) && (
        <ErrorAlert
          closeHanlder={close}
          message="Payment Failed. Try again later"
        />
      )}
      <LoadingOverlay
        visible={creatingCustomer || creatingSubscription}
        zIndex={1000}
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
              <Title order={4}>Processing payment...</Title>
            </Flex>
          ),
        }}
      />
    </Modal>
  );
}

export { PaymentForm };
