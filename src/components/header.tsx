"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectSubscription } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Flex, Menu, rem, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDownload, IconEye, IconSettings } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AlertModal } from "./modals/alert-modal";

function AppHeader() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { mutateAsync: saveUserDetails, data: userData } =
    trpc.saveUserDetails.useMutation();
  const {
    mutateAsync: generateBillPortalLink,
    isLoading: generatingLink,
    isError: generateLinkError,
  } = trpc.generateBillingPortalLink.useMutation();
  const subscriptionDetail = useAppStore((state) => state.subscription)
  const pathname = usePathname();
  const isChatRoute = pathname.includes("/chat");
  const [opened, { open, close }] = useDisclosure();

  useEffect(() => {
    async function saveUser() {
      if (userData === "User exists") return;
      if (user) {
        await saveUserDetails({
          appTheme: "dark",
          email: user.emailAddresses[0].emailAddress,
          firstname: user.firstName,
          googleid: "",
          id: user.id,
          lastname: user.lastName,
        });
      }
    }

    if (user && isSignedIn && isLoaded) saveUser();
  }, [
    user,
    isSignedIn,
    isLoaded,
    saveUserDetails,
    userData,
  ]);

  useEffect(() => {
    if (generateLinkError || generatingLink) {
      open();
    }
  }, [generatingLink, generateLinkError, open]);

  async function handleManageSubs() {
    if (user) {
      await generateBillPortalLink(
        { userId: user.id },
        {
          onSuccess: (data) => {
            window.location.href = data.sessionUrl;
          },
          onError: (err) => {
            console.error(err);
          },
        }
      );
    }
  }

  if (!isSignedIn) {
    return (
      <Flex w={"100%"} justify={"space-between"} align={"center"} px={"xs"}>
        <Flex
          direction={"row"}
          w={"100%"}
          gap={1}
          align={"center"}
          justify={"start"}
        >
          <Image
            src={"/images/content2Quiz.png"}
            width={60}
            height={60}
            alt="app_logo"
          />
          <Link href={"/"}>
            <Text w={"100%"} c={"blue"} fw={700}>
              Content2Quiz
            </Text>
          </Link>
        </Flex>
        <Flex
          w={"100%"}
          direction={"row"}
          gap={"md"}
          justify={"end"}
          align={"center"}
        >
          <Link href={"/pricing"}>Pricing</Link>
          <Text>About us</Text>
          <Text>Support</Text>
          {pathname.includes("/pricing") && (
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl={"/pricing"} />
            </SignedOut>
          )}
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      w={"100%"}
      direction={"row"}
      justify={"space-between"}
      align={"center"}
      px={"xs"}
    >
      <Flex
        direction={"row"}
        w={"100%"}
        gap={"xs"}
        align={"center"}
        justify={"start"}
      >
        <Image
          src={"/images/content2Quiz.png"}
          width={60}
          height={60}
          alt="app_logo"
        />
        <Link href={"/"}>
          <Text w={"100%"} c={"blue"} fw={700}>
            Content2Quiz
          </Text>
        </Link>
      </Flex>
      <Flex
        direction={"row"}
        w={"100%"}
        justify={"end"}
        gap={"md"}
        align={"center"}
      >
        {!isChatRoute && <Link href={"/chat"}>Generate Questions</Link>}
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton>Subscription</UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                <IconEye style={{ width: rem(14), height: rem(14) }} />
              }
            >
              <Link href={"/pricing"}>See plans</Link>
            </Menu.Item>
            <Menu.Item
              disabled={!subscriptionDetail}
              leftSection={
                <IconSettings style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={handleManageSubs}
            >
              Manage
            </Menu.Item>
            <Menu.Item
              disabled={!subscriptionDetail}
              leftSection={
                <IconDownload style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => {
                if (subscriptionDetail) {
                  window.open(
                    subscriptionDetail.invoicePdfUrl as string,
                    "_blank"
                  );
                }
              }}
            >
              Invoice
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </Flex>
      <AlertModal
        title="Please wait"
        close={close}
        showCloseButton={generateLinkError}
        message={
          generatingLink
            ? "Give us a moment..."
            : generateLinkError
            ? "Couldn't process the request"
            : "Redirecting..."
        }
        open={opened}
      />
    </Flex>
  );
}

export { AppHeader };
