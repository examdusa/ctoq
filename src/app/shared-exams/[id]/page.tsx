import { ThemeWrapper } from "@/components/app-layout";
import { RenderSharedExamsList } from "@/components/render-shared-exams-list";
import { db } from "@/db";
import { questionbank, sharedExams, userProfile } from "@/db/schema";
import { sharedRecordSchema } from "@/utllities/zod-schemas-types";
import { Alert, Flex } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { eq } from "drizzle-orm";
import { z } from "zod";

export default async function SharedExams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const records = await db
    .select({
      id: sharedExams.id,
      userId: sharedExams.userId,
      formId: sharedExams.formId,
      firstName: sharedExams.firstName,
      lastName: sharedExams.lastName,
      email: sharedExams.email,
      shareDate: sharedExams.shareDate,
      prompt: questionbank.prompt,
      googleQuizLink: questionbank.googleQuizLink,
      googleFormId: questionbank.googleFormId,
      outputType: questionbank.outputType,
      questionRecord: sharedExams.questionRecord,
    })
    .from(sharedExams)
    .innerJoin(questionbank, eq(sharedExams.questionRecord, questionbank.jobId))
    .innerJoin(userProfile, eq(questionbank.userId, userProfile.id))
    .where(eq(sharedExams.userId, id));

  const { error, data } = z.array(sharedRecordSchema).safeParse(records);

  if (error) {
    return (
      <ThemeWrapper>
        <Flex
          direction={"column"}
          h={"100%"}
          w={"100%"}
          align={"center"}
          p={"xl"}
        >
          <Alert
            variant="light"
            color="yellow"
            title="Something went wrong"
            icon={<IconInfoCircle />}
          >
            Something went wrong while processing shared exams data. Please try
            again later.
          </Alert>
        </Flex>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <Flex
        direction={"column"}
        h={"100%"}
        w={"100%"}
        align={"center"}
        p={"xl"}
      >
        <RenderSharedExamsList records={data} userId={id}/>
      </Flex>
    </ThemeWrapper>
  );
}
