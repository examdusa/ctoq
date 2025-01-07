import { SelectQuestionBank } from "@/db/schema";
import { Flex, Text } from "@mantine/core";

interface Props {
  record: SelectQuestionBank;
}

function RenderGuidanceOrSummaryResult({ record }: Props) {
  const { guidance, summary, outputType } = record;

  if (outputType === "summary") {
    return (
      <Flex
        direction={"column"}
        h={"100%"}
        w={"auto"}
        p={"lg"}
        style={{ objectFit: "contain" }}
        flex={1}
      >
        <Text fw={"bold"}>{summary}</Text>
      </Flex>
    );
  }
  return (
    <Flex
      direction={"column"}
      h={"100%"}
      w={"auto"}
      p={"lg"}
      style={{ objectFit: "contain" }}
      flex={1}
    >
      <Text fw={"bold"}>{guidance}</Text>
    </Flex>
  );
}

export { RenderGuidanceOrSummaryResult };
