import { Flex, Title } from "@mantine/core";
import dayjs from "dayjs";

export default function Footer() {
  return (
    <div className="flex w-full h-3/5 bg-[#f7f7f7] pt-5 pb-5">
      <Flex
        direction={"row"}
        w={"100%"}
        justify={"center"}
        px={"sm"}
        align={"center"}
      >
        <Title order={5} fw={"lighter"} c={"#acaaaa"}>&copy; Content To Code, {dayjs().year()}</Title>
      </Flex>
    </div>
  );
}
