import { SelectQuestionBank } from "@/db/schema";
import { Box, Flex } from "@mantine/core";
import "github-markdown-css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        <Box
          className="markdown-body"
          style={{ backgroundColor: "transparent", color: "black" }}
          p={"sm"}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => (
                <p style={{ fontSize: "16px" }} {...props} />
              ),
            }}
          >
            {summary}
          </ReactMarkdown>
        </Box>
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
      <Box
        className="markdown-body"
        style={{ backgroundColor: "transparent", color: "black" }}
        p={"sm"}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p style={{ fontSize: "16px" }} {...props} />
            ),
          }}
        >
          {guidance}
        </ReactMarkdown>
      </Box>
    </Flex>
  );
}

export { RenderGuidanceOrSummaryResult };
