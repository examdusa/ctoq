import { Accordion, Flex, List, Text } from "@mantine/core";

function Faq() {
  return (
    <Accordion variant="contained" radius="lg" chevronPosition="right" w={"60%"}>
      <Accordion.Item key={"faqA"} value={"faqA"} p={"sm"} bg={"#f7f7f7"}>
        <Accordion.Control>
          <Text fw={"bold"}>
            What types of content do you use to create the question bank ?
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Flex direction={"column"} h={"auto"} w={"100%"} gap={"xs"} px={"xl"}>
            <Text>
              We utilize a diverse range of content sources including textbooks,
              academic journals, industry publications, and verified online
              resources (urls) and as well as Keywords.
            </Text>
            <Text>
              Our software will generate relevant and accurate questions across
              various subjects and difficulty levels.
            </Text>
          </Flex>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item key={"faqB"} value={"faqB"} p={"xs"} bg={"#f7f7f7"}>
        <Accordion.Control>
          <Text fw={"bold"}>
            How are the questions categorized within the question bank ?
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Flex direction={"column"} h={"auto"} w={"100%"} gap={"xs"} px={"xl"}>
            <Text>Questions are categorized based on multiple factors:</Text>
            <List size="md" withPadding listStyleType="disc">
              <List.Item>
                Subject area (e.g., Mathematics, Science, Literature)
              </List.Item>
              <List.Item>Topic within the subject</List.Item>
              <List.Item>
                Difficulty level (e.g., Beginner, Intermediate, Advanced)
              </List.Item>
              <List.Item>
                Question type (e.g., Multiple Choice, Short Answer)
              </List.Item>
            </List>
            <Text>We are expanding further with other item types as well.</Text>
          </Flex>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item key={"faqC"} value={"faqC"} p={"xs"} bg={"#f7f7f7"}>
        <Accordion.Control>
          <Text fw={"bold"}>
            Can I customize or add my own questions to the question bank ?
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Flex direction={"column"} h={"auto"} w={"100%"} gap={"xs"} px={"xl"}>
            <Text>Yes, our platform allows for customization. Users can:</Text>
            <List size="md" withPadding listStyleType="disc">
              <List.Item>
                After generating the question bank user can download that to
                their local drive and add their own questions to personal
                question sets.
              </List.Item>
              <List.Item>
                This feature ensures that the question bank can be tailored to
                specific learning objectives or testing requirements.
              </List.Item>
            </List>
          </Flex>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item key={"faqD"} value={"faqD"} p={"xs"} bg={"#f7f7f7"}>
        <Accordion.Control>
          <Text fw={"bold"}>
            Can I use Content2Quiz AI question generator for free ?
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Flex direction={"column"} h={"auto"} w={"100%"} gap={"xs"} px={"xl"}>
            <Text>
              Yes, Content2Quiz offers a tier that allows users to explore url
              to question bank and even key words to question bank features
              without any cost.
            </Text>
            <Text>
              You can generate 4 set of question bank per month. However,
              certain advanced features and premium AI capabilities may require
              a paid subscription.
            </Text>
          </Flex>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

export { Faq };
