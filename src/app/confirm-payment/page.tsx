"use client";
import { ThemeWrapper } from "@/components/app-layout";
import { ClerkAuthWrapper } from "@/components/clerk-auth-wapper";
import { Button, Flex, MantineProvider, Paper, Text } from "@mantine/core";
import Link from "next/link";

export default function ConfirmPayment() {
  return (
    <MantineProvider defaultColorScheme={"dark"}>
      <ClerkAuthWrapper>
        <ThemeWrapper>
          <div className="flex flex-col min-h-screen w-full items-center justify-center">
            <Paper withBorder w={"100%"} maw={"30%"} p={"md"}>
              <Flex direction={"column"} h={"auto"} w={"100%"} gap={10}>
                <Text size="lg">Payment Successfull</Text>
                <Link href={"/"}>
                  <Button variant="default">Ok</Button>
                </Link>
              </Flex>
            </Paper>
          </div>
        </ThemeWrapper>
      </ClerkAuthWrapper>
    </MantineProvider>
  );
}
