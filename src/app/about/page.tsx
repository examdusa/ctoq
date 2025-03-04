import { ThemeWrapper } from "@/components/app-layout";
import Footer from "@/components/footer";
import {
  Card,
  Flex,
  Paper,
  ScrollArea,
  Text,
  Title
} from "@mantine/core";
import Image from "next/image";

export default function AboutUs() {
  return (
    <ThemeWrapper>
      <ScrollArea
        h={"100%"}
        styles={{
          viewport: {
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
      >
        <Flex
          h="100vh"
          w={"100%"}
          py={"md"}
          justify={"start"}
          align={"center"}
          direction={"column"}
        >
          <Flex
            direction={"column"}
            align={"center"}
            w={"100%"}
            px={{ base: "xs", lg: 0 }}
          >
            <Title order={1} ta={"center"} lineClamp={2}>
              Welcome to Content2Quiz
            </Title>
            <Text mt={"xl"} size="lg">
              At Content2Quiz, we specialize in transforming any type of content
              into engaging, interactive quizzes. Whether you&apos;re a business
              looking to test knowledge, an educator aiming to assess your
              student&apos;s understanding, or a content creator wanting to
              enhance user engagement, we&apos;ve got you covered.
            </Text>
          </Flex>
          <Card
            shadow="sm"
            w={"100%"}
            maw={{ base: "100%", lg: "50%" }}
            radius={"md"}
            mih={"35%"}
            my={40}
            px={{ base: "xs", lg: 0 }}
            withBorder
            styles={{
              root: {
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flexGrow: 1,
              },
            }}
          >
            <Flex
              direction={"row"}
              w={"100%"}
              styles={{
                root: {
                  flexGrow: 1,
                },
              }}
              justify={"center"}
              align={"start"}
              gap={"xl"}
            >
              <Flex
                direction={"column"}
                w={"100%"}
                h="100%"
                gap={"lg"}
                px={{ base: "xs", lg: 0 }}
              >
                <Title order={3} w={"100%"}>
                  Our Mission
                </Title>
                <Text size="md" fs={"italic"}>
                  Our mission is simple: to make content more engaging and
                  impactful through customized quizzes. We believe that quizzes
                  are a powerful tool for reinforcing learning, boosting
                  interactivity, and making content more enjoyable. With our
                  easy-to-use platform, you can seamlessly convert any written
                  content into quizzes, empowering you to engage your audience
                  in a fun and meaningful way.
                </Text>
              </Flex>
              <Image
                src={"/images/mission.png"}
                alt="mission"
                width={350}
                height={350}
                className="hidden lg:block"
              />
            </Flex>
          </Card>
          <Flex
            direction={"column"}
            w={"100%"}
            gap={"lg"}
            mt={50}
            px={{ base: "xs", lg: 0 }}
            maw={{ base: "100%", lg: "50%" }}
            align={"center"}
          >
            <Title order={2}>Why choose us?</Title>
            <Flex
              direction={{ base: "column", lg: "row" }}
              w={"100%"}
              h={"auto"}
              gap={"md"}
            >
              <Paper shadow="sm" radius="md" p="md" withBorder>
                <Title order={3} lh={"sm"} c={"#4B0082"}>
                  Easy & Efficient
                </Title>
                <Text mt={"md"}>
                  Our platform is designed for simplicity. You don&apos;t need
                  any technical skills to create quizzes from your content. Just
                  paste the content, and we&apos;ll help you generate quizzes in
                  minutes.
                </Text>
              </Paper>
              <Paper shadow="sm" radius="md" p="md" withBorder>
                <Title order={3} lh={"sm"} c={"#4B0082"}>
                  Customizable
                </Title>
                <Text mt={"md"}>
                  Tailor quizzes to your specific needs. Whether it&apos;s
                  multiple-choice questions, true/false, or fill-in-the-blanks,
                  we offer a range of question formats to suit your content.
                </Text>
              </Paper>
              <Paper shadow="sm" radius="md" p="md" withBorder>
                <Title order={3} lh={"sm"} c={"#4B0082"}>
                  Engagement
                </Title>
                <Text mt={"md"}>
                  Create quizzes that keep your audience engaged. We provide
                  tools to ensure your quizzes are interactive and effective,
                  whether for learning or fun.
                </Text>
              </Paper>
              <Paper shadow="sm" radius="md" p="md" withBorder>
                <Title order={3} lh={"sm"} c={"#4B0082"}>
                  Versatile
                </Title>
                <Text mt={"md"}>
                  Perfect for businesses, educators, bloggers, and marketers.
                  Content2Quiz is a versatile tool designed to serve anyone who
                  wants to turn their content into a learning or engagement
                  experience.
                </Text>
              </Paper>
            </Flex>
          </Flex>
          <Flex
            direction={"column"}
            w={"100%"}
            gap={"lg"}
            mt={50}
            maw={{ base: "100%", lg: "50%" }}
            px={{ base: "xs", lg: 0 }}
            align={"center"}
          >
            <Title order={2}>Our Vision</Title>
            <Text>
              We envision a world where content and learning intersect
              seamlessly, where engagement is fostered through interactive
              experiences. Content2Quiz is dedicated to making this vision a
              reality by helping you create quizzes that enhance your
              content&apos;s value.
            </Text>
          </Flex>
          <Flex
            direction={"column"}
            w={"100%"}
            gap={"lg"}
            my={50}
            maw={{ base: "100%", lg: "50%" }}
            px={{ base: "xs", lg: 0 }}
            align={"center"}
          >
            <Title order={2}>Get in Touch</Title>
            <Text>
              Have questions or need assistance? Our team is here to help! Reach
              out to us at <span className="text-blue-500 font-semibold">sales@content2quiz.com</span> for
              support, inquiries, or feedback.
            </Text>
          </Flex>
          <Footer />
        </Flex>
      </ScrollArea>
    </ThemeWrapper>
  );
}
