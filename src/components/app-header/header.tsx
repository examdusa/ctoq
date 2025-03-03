"use client";

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
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrain,
  IconDownload,
  IconEye,
  IconTool,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function AppHeader() {
  const { user } = useUser();
  const subscriptionDetail = useAppStore((state) => state.subscription);
  const [burgerOpened, { toggle }] = useDisclosure(false);
  const router = useRouter();
  const pathname = usePathname();

  const theme = useMantineTheme();

  function linkStyle(path: string) {
    return {
      fontWeight:
        pathname === path || pathname.includes(path) ? "bold" : "lighter",
      color:
        pathname === path || pathname.includes(path)
          ? "#4B0082"
          : theme.colors.dark[5],
    };
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
        gap={2}
        align={"center"}
        justify={"start"}
      >
        <IconBrain size={30} color="#4B0082" />
        <Link href={"/"}>
          <Text fw={700} c={"#4B0082"} size="xl">
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
            <Link href={"/chat"} style={linkStyle("/chat")}>
              Dashboard
            </Link>
            {user && user.id && (
              <Link
                href={`/shared-exams/${user.id}`}
                style={linkStyle("/shared-exams")}
              >
                Shared exams
              </Link>
            )}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton style={linkStyle("/pricing")}>
                  Subscription
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={
                    <IconEye style={{ width: rem(14), height: rem(14) }} />
                  }
                >
                  <Link href={"/pricing"}>
                    {user ? "Manage plans" : "See plans"}
                  </Link>
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
          <Link href={"/about"} style={linkStyle("/about")}>
            About us
          </Link>
          <Link href={"/support"} style={linkStyle("/support")}>
            Support
          </Link>
          <SignedOut>
            <Link href={"/pricing"} style={linkStyle("/pricing")}>
              See plans
            </Link>
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
    </Flex>
  );
}

export { AppHeader };
