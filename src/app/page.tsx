"use client";
import { ThemeWrapper } from "@/components/app-layout";
import { Faq } from "@/components/faq";
import Footer from "@/components/footer";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button, Flex, ScrollArea, Text, Title } from "@mantine/core";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  function handleSignIn() {
    if (!user) {
      openSignIn();
    } else {
      redirect(`/chat`);
    }
  }

  return (
    <ThemeWrapper>
      <ScrollArea
        styles={{
          root: {
            height: "calc(100vh - 64px)",
            width: "100%",
          },
        }}
      >
        <Flex
          direction={"column"}
          align={"center"}
          justify={"start"}
          gap={"3rem"}
          px={{ sm: "xs", md: "5%", lg: "5%", xl: "0%" }}
          styles={{
            root: {
              height: "98vh",
              width: "100%",
            },
          }}
        >
          <Text mx={"auto"} fz={{ sm: "h1", md: "3rem" }} fw={"bold"}>
            Content To Quiz
          </Text>
          <Image
            src={"/images/funct_app.avif"}
            width={700}
            height={700}
            alt="llm_funct"
          />
          <Text mx={"auto"} fz={{ xs: "h5", md: "h3" }} fw={"bold"}>
            Transform URLs and Keywords into Comprehensive Question Banks
          </Text>
          <Button variant="filled" fullWidth={false} onClick={handleSignIn}>
            Get Started
          </Button>
        </Flex>
        <Flex
          direction={"column"}
          w={"100%"}
          mih={"8rem"}
          px={"lg"}
          align={"center"}
          justify={"center"}
          styles={{
            root: {
              background: "#f7f7f7",
            },
          }}
        >
          <Flex
            direction={"row"}
            w={{ xs: "100%", md: "50%" }}
            align={"center"}
            gap={"3rem"}
            pt={"lg"}
          >
            <Image
              src={"/images/funct_pic_a.avif"}
              width={400}
              height={400}
              alt="llm_feat_a"
              className="rounded-md shadow-md"
            />
            <Flex direction={"column"} w={"100%"} h={"auto"} gap={"md"}>
              <Title order={1}>Fast and Easy</Title>
              <Text fz={"h4"} fw={"lighter"}>
                You&apos;ve never made a question bank this fast before.
              </Text>
            </Flex>
          </Flex>
          <Flex
            direction={"row"}
            w={{ xs: "100%", md: "50%" }}
            align={"center"}
            py={"lg"}
            gap={"3rem"}
            pt={"lg"}
          >
            <Flex direction={"column"} w={"100%"} h={"auto"} gap={"md"}>
              <Title order={1}>Versatile and Secured</Title>
              <Text fz={"h4"} fw={"lighter"}>
                Works Can be used for K12 as well as college student. Data is
                very secured.
              </Text>
            </Flex>
            <Image
              src={"/images/funct_pic_b.avif"}
              width={400}
              height={400}
              alt="llm_feat_a"
              className="rounded-md shadow-md"
            />
          </Flex>
        </Flex>
        <Flex
          my={"5rem"}
          direction={"column"}
          w={"100%"}
          align={"center"}
          gap={"md"}
        >
          <Title order={1}>FAQ</Title>
          <Faq />
        </Flex>
        <Flex
          direction={"column"}
          w={"100%"}
          mih={"8rem"}
          px={"lg"}
          gap={"xl"}
          align={"center"}
          justify={"center"}
          styles={{
            root: {
              background: "#f7f7f7",
            },
          }}
        >
          <Title order={1} pt={"lg"}>
            Sign up today.
          </Title>
          <Button
            variant="filled"
            fullWidth={false}
            mb={"lg"}
            onClick={handleSignIn}
          >
            Get Started
          </Button>
        </Flex>
        <Footer />
      </ScrollArea>
    </ThemeWrapper>
  );
}
