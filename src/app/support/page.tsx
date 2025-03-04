import { ThemeWrapper } from "@/components/app-layout";
import Footer from "@/components/footer";
import { Flex, ScrollArea, Title } from "@mantine/core";

export default function Support() {
  return (
    <ThemeWrapper>
      <ScrollArea
        h={"100vh"}
        w={"100%"}
        offsetScrollbars
        my={"sm"}
        styles={{
          viewport: {
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
      >
        <Flex
          direction={"column"}
          w={"100%"}
          align={"center"}
          styles={{
            root: {
              flexGrow: 1,
            },
          }}
          h={'100%'}
          gap={"xl"}
        >
          <Title order={1}>Support</Title>
          <iframe
            src={
              "https://docs.google.com/presentation/d/e/2PACX-1vQmmzrReWweaIJpg2HHYTIsky3nz2C2x9Ycpg2fUchOMPNAao5OrotxeCrEebfxX-UvQ0dbzLLF56gl/embed?start=true&loop=false&delayms=3000&slide=id.p"
            }
            frameBorder="0"
            width="960"
            height="569"
            allowFullScreen={true}
          />
        </Flex>
      </ScrollArea>
      <Footer />
    </ThemeWrapper>
  );
}
