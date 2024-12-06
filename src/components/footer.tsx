import { Flex, Title } from "@mantine/core";
import dayjs from "dayjs";

export default function Footer() {
  return (
    <Flex
      direction={"row"}
      w={"100%"}
      justify={"center"}
      px={"sm"}
      bg={"#f7f7f7"}
      mih={"5rem"}
      mt={'5vh'}
      align={"center"}
    >
      <Title order={5} fw={"lighter"} c={"#acaaaa"}>
        &copy; ContentToQuiz, {dayjs().year()}
      </Title>
    </Flex>
  );
}
