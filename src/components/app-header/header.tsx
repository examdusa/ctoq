"use client";

import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Burger,
  Flex,
  Group,
  Menu,
  rem,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDownload,
  IconEye,
  IconSettings,
  IconTool,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertModal } from "../modals/alert-modal";

function AppHeader() {
  const { user } = useUser();
  const {
    mutateAsync: generateBillPortalLink,
    isLoading: generatingLink,
    isError: generateLinkError,
  } = trpc.generateBillingPortalLink.useMutation();
  const subscriptionDetail = useAppStore((state) => state.subscription);
  const [opened, { open, close }] = useDisclosure();
  const [burgerOpened, { toggle }] = useDisclosure(false);
  const router = useRouter();

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
        <Group visibleFrom="md" gap={"sm"}>
          <SignedIn>
            <Link href={"/chat"}>Dashboard</Link>
            {user && user.id && (
              <Link href={`/shared-exams/${user.id}`}>Shared exams</Link>
            )}
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
          </SignedIn>
          <Link href={"/about"}>About us</Link>
          <Link href={"/support"}>Support</Link>
          <SignedOut>
            <Link href={"/pricing"}>See plans</Link>
          </SignedOut>
        </Group>
        <Burger
          opened={burgerOpened}
          onClick={toggle}
          hiddenFrom="md"
          size="sm"
        />
        <SignedIn>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="Edit profile"
                onClick={() => {
                  router.push(`/profile/${user?.id}`);
                }}
                labelIcon={<IconTool width={rem(1)} height={rem(1)} />}
              />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
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

