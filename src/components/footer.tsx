import { Divider, Flex, Group, Text } from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import Link from "next/link";

export default function Footer() {
  return (
    <Flex
      direction={"column"}
      pt={"5%"}
      w={"100%"}
      bg={"#000000"}
      flex={1}
      c={"white"}
      justify={"center"}
      align={"center"}
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        w={"100%"}
        gap={"xl"}
        px={{ base: "xs", lg: 0 }}
        maw={{ xs: "90%", md: "80%", xl: "80%" }}
        align={"start"}
        justify={"space-between"}
        styles={{
          root: {
            color: "whitesmoke",
          },
        }}
      >
        <Flex direction={"column"} w={"100%"} gap={"md"}>
          <Flex direction={"row"} w={"auto"} gap={3} align={"start"} h={"100%"}>
            <Text size={"xl"} fw={"bolder"}>
              Content To Quiz
            </Text>
          </Flex>
          <Text size="sm" c={"white"}>
            Transform your content into engaging interactive experiences
          </Text>
        </Flex>
        <Flex direction={"column"} w={"100%"} maw={"40%"} gap={"md"}>
          <Text size={"xl"} fw={"bolder"}>
            Quick Links
          </Text>
          <Group
            styles={{
              root: {
                display: "flex",
                flexDirection: "column",
                gap: 5,
              },
            }}
            justify="start"
            align="start"
          >
            <Link href={"/chat"}>Create Quiz</Link>
            <Link href={"/chat"}>Quiz Dashboard</Link>
            <Link href={"/chat"}>Quiz Library</Link>
          </Group>
        </Flex>
        <Flex direction={"column"} w={"100%"} gap={"md"}>
          <Text size={"xl"} fw={"bolder"}>
            Contact
          </Text>
          <Text size="md" c={"#F5F5F5"} fw={"bold"}>
            support@content2quiz.com
          </Text>
        </Flex>
        <Flex direction={"column"} w={"100%"} gap={"md"}>
          <Text size={"xl"} fw={"bolder"}>
            Follow us
          </Text>
          <Group justify="start" gap={"sm"} align="center">
            <IconBrandTwitter color="#F5F5F5" />
            <IconBrandLinkedin color="#F5F5F5" />
            <IconBrandFacebook color="#F5F5F5" />
            <IconBrandInstagram color="#F5F5F5" />
          </Group>
        </Flex>
      </Flex>
      <Divider orientation="horizontal" color="#5D6166" w={"100%"} my={"xl"} />
      <Text
        size="md"
        c={"#F5F5F5"}
        w={"100%"}
        h={"100%"}
        ta={"center"}
        py={"md"}
      >
        &copy; {dayjs().year()} Content2Quiz. All rights reserved.
      </Text>
    </Flex>
  );
}
