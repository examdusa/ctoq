import { ThemeWrapper } from "@/components/app-layout";
import { UserProfileDetail } from "@/components/user-profile";
import { db } from "@/db";
import { SelectUser, userProfile } from "@/db/schema";
import { Flex, Paper } from "@mantine/core";
import { eq } from "drizzle-orm";

export default async function UserProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const userDetails: SelectUser[] = await db
    .select({
      id: userProfile.id,
      firstname: userProfile.firstname,
      lastname: userProfile.lastname,
      email: userProfile.email,
      googleid: userProfile.googleid,
      appTheme: userProfile.appTheme,
      createdAt: userProfile.createdAt,
      language: userProfile.language,
      instituteName: userProfile.instituteName,
      role: userProfile.role,
    })
    .from(userProfile)
    .where(eq(userProfile.id, id));

  return (
    <ThemeWrapper>
      <Flex
        flex={1}
        h={"100%"}
        direction={"column"}
        w={"auto"}
        align={"center"}
      >
        <Paper
          w={"100%"}
          h={"100%"}
          radius={0}
          maw={{ xs: "90%", md: "60%" }}
          withBorder
          styles={{
            root: {
              borderTop: "none",
              borderBottom: "none",
            },
          }}
        >
          <UserProfileDetail userDetail={userDetails[0]} />
        </Paper>
      </Flex>
    </ThemeWrapper>
  );
}
