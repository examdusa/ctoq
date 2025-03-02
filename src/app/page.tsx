"use client";
import { ThemeWrapper } from "@/components/app-layout";
import { HowItWorks } from "@/components/faq";
import Footer from "@/components/footer";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  Button,
  Card,
  Flex,
  Group,
  ScrollArea,
  Text,
  Title,
  useMantineTheme
} from "@mantine/core";
import {
  IconAdjustments,
  IconChartHistogram,
  IconFileIsr,
  IconShare,
} from "@tabler/icons-react";
import { redirect } from "next/navigation";

export default function Home() {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const theme = useMantineTheme();

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
          viewport: {
            height: "100%",
            width: "100%",
          },
        }}
      >
        <Flex
          direction={"column"}
          flex={1}
          w={"100%"}
          pt={"10%"}
          align={"center"}
        >
          <Flex
            direction={"row"}
            w={"100%"}
            maw={{ xs: "90%", md: "80%", xl: "80%" }}
            gap={"md"}
          >
            <Group
              styles={{
                root: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                },
              }}
            >
              <Text fz={"h1"} fw={"bold"}>
                Transform Your Content Into Engaing Quizzes
              </Text>
              <Text fz={"md"}>
                Convert your articles, blog posts and training materials into
                interactive quizzes in seconds with our AI-powered platform.
              </Text>
              <Flex direction={"row"} justify={"start"} gap={"md"} mt={"md"}>
                <Button variant="filled" bg={"#4B0082"} onClick={handleSignIn}>
                  Get started free
                </Button>
                <Button variant="default">Watch demo</Button>
              </Flex>
            </Group>
          </Flex>
          <Flex
            direction={"row"}
            w={"100%"}
            align={"center"}
            justify={"center"}
            my={"10%"}
            styles={{
              root: {
                background: "#f7f7f7",
              },
            }}
          >
            <Flex
              direction={"row"}
              py={"xl"}
              w={"100%"}
              maw={{ xs: "90%", md: "80%", xl: "80%" }}
              justify={"space-between"}
              gap={"md"}
            >
              <Card shadow="sm" padding="xl" maw={"25%"} radius={"md"}>
                <Group>
                  <IconFileIsr size={40} />
                  <Text fw={"bold"} size="lg">
                    Effortless quiz creation
                  </Text>
                </Group>

                <Text mt="xs" c="dimmed" size="sm">
                  Paste your content and let our AI extract key points to create
                  quiz questions instantly.
                </Text>
              </Card>
              <Card shadow="sm" padding="xl" maw={"25%"} radius={"md"}>
                <Group>
                  <IconAdjustments size={40} />
                  <Text fw={"bold"} size="lg">
                    Customizable and interactive
                  </Text>
                </Group>

                <Text mt="xs" c="dimmed" size="sm">
                  Tailor each quiz with your own style, edit questions, add
                  images or videos and choose from multiple formats.
                </Text>
              </Card>
              <Card shadow="sm" padding="xl" maw={"25%"} radius={"md"}>
                <Group>
                  <IconChartHistogram size={40} />
                  <Text fw={"bold"} size="lg">
                    Data driven insights
                  </Text>
                </Group>

                <Text mt="xs" c="dimmed" size="sm">
                  Access performance analytics to see how your quizzes drive
                  engagement and learning outcomes.
                </Text>
              </Card>
              <Card shadow="sm" padding="xl" maw={"25%"} radius={"md"}>
                <Group>
                  <IconShare size={40} />
                  <Text fw={"bold"} size="lg">
                    Effortless quiz creation
                  </Text>
                </Group>

                <Text mt="xs" c="dimmed" size="sm">
                  Easily embed quizzes on your website, Learning management
                  system (LMS) or social media channels.
                </Text>
              </Card>
            </Flex>
          </Flex>
          <Flex direction={"column"} w={"100%"} align={"center"} gap={"lg"}>
            <Title order={2}>How it works</Title>
            <HowItWorks />
          </Flex>
          <Flex
            direction={"column"}
            w={"100%"}
            py={"8%"}
            gap={"xl"}
            mt={"10%"}
            align={"center"}
            justify={"center"}
            styles={{
              root: {
                background: "#6f00ff",
                color: "white",
              },
            }}
          >
            <Title order={1} pt={"lg"}>
              Ready to Turn Your Content into Interactive Quizzes?
            </Title>
            <Text size="lg">
              Join hundreds of educators, marketers, and trainers who are
              already boosting engagement with Content2Quiz
            </Text>
            <Group justify="center" gap={"md"} align="center">
              <Button
                variant="filled"
                fullWidth={false}
                onClick={handleSignIn}
                bg={"white"}
                c={"#6f00ff"}
              >
                Get Started for free
              </Button>
              <Button
                variant="outline"
                styles={{
                  root: {
                    color: "white",
                    borderColor: "white",
                  },
                }}
              >
                Request a demo
              </Button>
            </Group>
          </Flex>
          <Footer />
        </Flex>
      </ScrollArea>
    </ThemeWrapper>
  );
}
