import { ThemeWrapper } from "@/components/app-layout";
import { Center, Loader } from "@mantine/core";

export default function DashboardLoader() {
  return (
    <ThemeWrapper>
      <Center w={"100%"} h={"100%"}>
        <Loader size={50} />
      </Center>
    </ThemeWrapper>
  );
}
