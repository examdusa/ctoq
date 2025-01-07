import { ThemeWrapper } from "@/components/app-layout";
import { RenderSharedExamsList } from "@/components/render-shared-exams-list";
import { db } from "@/db";
import {
  questionbank,
  SelectSharedExams,
  sharedExams,
  userProfile,
} from "@/db/schema";
import { Flex } from "@mantine/core";
import { eq } from "drizzle-orm";

export interface SharedExamDetail extends SelectSharedExams {
  prompt: string | null;
}

export default async function SharedExams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const records: SharedExamDetail[] = await db
    .select({
      id: sharedExams.id,
      userId: sharedExams.userId,
      questionRecord: sharedExams.questionRecord,
      formId: sharedExams.formId,
      firstName: sharedExams.firstName,
      lastName: sharedExams.lastName,
      email: sharedExams.email,
      shareDate: sharedExams.shareDate ?? new Date(),
      prompt: questionbank.prompt,
    })
    .from(sharedExams)
    .innerJoin(questionbank, eq(sharedExams.questionRecord, questionbank.id))
    .innerJoin(userProfile, eq(questionbank.userId, userProfile.id))
    .where(eq(sharedExams.userId, id));

  const groupedRecords = records.reduce<
    Record<string, { records: SharedExamDetail[]; propmt: string }>
  >((acc, record) => {
    const { questionRecord, prompt } = record; 

    if (!acc[questionRecord]) {
      acc[questionRecord] = { propmt: prompt ?? '', records: [] }; 
    }

    acc[questionRecord].records.push(record); 
    return acc;
  }, {});

  console.log(records);

  return (
    <ThemeWrapper>
      <Flex
        direction={"column"}
        h={"100%"}
        w={"100%"}
        align={"center"}
        justify={"center"}
        p={"xl"}
      >
        <RenderSharedExamsList exams={groupedRecords} />
      </Flex>
    </ThemeWrapper>
  );
}
