import { ThemeWrapper } from "@/components/app-layout";
import { RenderSharedExamsList } from "@/components/render-shared-exams-list";
import { db } from "@/db";
import { questionbank, sharedExams, userProfile } from "@/db/schema";
import {
  SharedRecordSchema,
  sharedRecordSchema,
} from "@/utllities/zod-schemas-types";
import { Flex, Paper } from "@mantine/core";
import { eq } from "drizzle-orm";
import { z } from "zod";

export interface GroupedRecords {
  [key: string]: { prompt: string; records: SharedRecordSchema[] };
}

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

  const { success, data } = z.array(sharedRecordSchema).safeParse(records);

  let groupedRecords: GroupedRecords = {};

  if (success) {
    groupedRecords = data.reduce<GroupedRecords>((acc, record) => {
      const { questionRecord, prompt } = record;

      if (!acc[questionRecord]) {
        acc[questionRecord] = {
          records: [],
          prompt: prompt ?? "N/A",
        };
      }

      acc[questionRecord].records.push(record);
      return acc;
    }, {});
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
        <Paper withBorder radius={"sm"} w={"100%"} maw={"auto"}>
          <RenderSharedExamsList records={groupedRecords} />
        </Paper>
      </Flex>
    </ThemeWrapper>
  );
}
