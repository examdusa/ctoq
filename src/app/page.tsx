"use client";
import { ThemeWrapper } from "@/components/app-layout";
import { HowItWorks } from "@/components/faq";
import Footer from "@/components/footer";
import { WatchVideo } from "@/components/watch-video";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  Button,
  Card,
  Flex,
  Group,
  ScrollArea,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAdjustments,
  IconChartHistogram,
  IconFileIsr,
  IconShare,
} from "@tabler/icons-react";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const theme = useMantineTheme();
  const [demoVideoOpenned, { open: openDemoVideo, close: closeDemoVideo }] =
    useDisclosure();

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
          pt={"5%"}
          align={"center"}
        >
          <Flex
            direction={"row"}
            w={"100%"}
            maw={{ xs: "90%", md: "80%", xl: "80%" }}
            gap={"lg"}
            justify={"space-between"}
            align={"center"}
          >
            <Group
              styles={{
                root: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                },
              }}
              px={{ base: "xs", lg: 0 }}
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
                <Button variant="default" onClick={openDemoVideo}>
                  Watch demo
                </Button>
              </Flex>
            </Group>
            <Image
              src={"/images/app_banner.jpeg"}
              width={600}
              height={600}
              alt="app-banner"
              className="hidden md:block"
              style={{
                borderRadius: theme.radius.md,
                boxShadow: theme.shadows.md,
                filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
              }}
            />
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
              direction={{ base: "column", lg: "row" }}
              py={"xl"}
              w={"100%"}
              maw={{ xs: "90%", md: "80%", xl: "80%" }}
              justify={"space-between"}
              gap={"md"}
              px={{ base: "xs", lg: 0 }}
            >
              <Card
                shadow="sm"
                padding="xl"
                maw={{ xs: "100%", lg: "25%" }}
                radius={"md"}
              >
                <Group
                  styles={{
                    root: {
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "start",
                      alignItems: "start",
                      gap: theme.spacing.sm,
                    },
                  }}
                >
                  <IconFileIsr size={40} color="#4B0082" />
                  <Text fw={"bold"} size="lg">
                    Effortless quiz creation
                  </Text>
                </Group>

                <Text mt="xs" c="dimmed" size="sm">
                  Paste your content and let our AI extract key points to create
                  quiz questions instantly.
                </Text>
              </Card>
              <Card
                shadow="sm"
                padding="xl"
                maw={{ xs: "100%", lg: "25%" }}
                radius={"md"}
              >
                <Group
                  styles={{
                    root: {
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "start",
                      alignItems: "start",
                      gap: theme.spacing.sm,
                    },
                  }}
                >
                  <IconAdjustments size={40} color="#4B0082" />
                  <Text fw={"bold"} size="lg">
                    Customizable and interactive
                  </Text>
                </Group>

                <Text mt="xs" c="dimmed" size="sm">
                  Tailor each quiz with your own style, edit questions, add
                  images or videos and choose from multiple formats.
                </Text>
              </Card>
              <Card
                shadow="sm"
                padding="xl"
                maw={{ xs: "100%", lg: "25%" }}
                radius={"md"}
              >
                <Group
                  styles={{
                    root: {
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "start",
                      alignItems: "start",
                      gap: theme.spacing.sm,
                    },
                  }}
                >
                  <IconChartHistogram size={40} color="#4B0082" />
                  <Text fw={"bold"} size="lg">
                    Data driven insights
                  </Text>
                </Group>

                <Text mt="xs" c="dimmed" size="sm">
                  Access performance analytics to see how your quizzes drive
                  engagement and learning outcomes.
                </Text>
              </Card>
              <Card
                shadow="sm"
                padding="xl"
                maw={{ xs: "100%", lg: "25%" }}
                radius={"md"}
              >
                <Group
                  styles={{
                    root: {
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "start",
                      alignItems: "start",
                      gap: theme.spacing.sm,
                    },
                  }}
                >
                  <IconShare size={40} color="#4B0082" />
                  <Text fw={"bold"} size="lg">
                    Seemless integration
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
            px={{ base: "xs", lg: 0 }}
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
            <Group
              justify={theme.breakpoints.lg ? "center" : "start"}
              gap={"md"}
              align={"center"}
              w={"100%"}
            >
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
        <WatchVideo open={demoVideoOpenned} close={closeDemoVideo} />
      </ScrollArea>
    </ThemeWrapper>
  );
}
