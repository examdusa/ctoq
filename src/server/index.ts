import { db } from "@/db";
import {
  questionbank,
  SelectQuestionBank,
  SelectSubscription,
  sharedExams,
  subscription,
  userProfile,
} from "@/db/schema";
import { updateQBankRecordScheam } from "@/utllities/helpers";
import {
  baseResultSchema,
  FillBlankQuestionSchema,
  fillBlankQuestionSchema,
  generateQuestionsResponseSchema,
  mcqQuestionSchema,
  MCQQuestionSchema,
  McqSimilarQuestionScheam,
  mcqSimilarQuestionSchema,
  OpenendedQuestionSchema,
  openEndedQuestionSchema,
  questionBankSchema,
  submitJobPayloadSchema,
  TrueFalseQuestionScheam,
  trueFalseQuestionSchema,
  userProfileSchema,
} from "@/utllities/zod-schemas-types";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import z from "zod";
import { procedure, router } from "./trpc";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const UserObject = z.object({
  id: z.string(),
  firstname: z.string().nullable(),
  lastname: z.string().nullable(),
  email: z.string(),
  googleid: z.string().nullable(),
  appTheme: z.enum(["dark", "light"]),
  createdAt: z.date().default(new Date()),
});

export type UserObjectShape = z.infer<typeof UserObject>;

export const appRouter = router({
  getQuestions: procedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const questions: SelectQuestionBank[] = await db
          .select({
            id: questionbank.id,
            createdAt: questionbank.createdAt,
            userId: questionbank.userId,
            jobId: questionbank.jobId,
            questions: questionbank.questions,
            difficultyLevel: questionbank.difficultyLevel,
            questionsCount: questionbank.questionsCount,
            prompt: questionbank.prompt,
            questionType: questionbank.questionType,
            promptUrl: questionbank.promptUrl,
            withAnswer: questionbank.withAnswer,
            googleQuizLink: questionbank.googleQuizLink,
            instituteName: questionbank.instituteName,
            guidance: questionbank.guidance,
            summary: questionbank.summary,
            outputType: questionbank.outputType,
            googleFormId: questionbank.googleFormId,
          })
          .from(questionbank)
          .innerJoin(userProfile, eq(questionbank.userId, userProfile.id))
          .where(eq(questionbank.userId, input.userId));
        if (questions.length > 0) {
          return questions;
        } else {
          return null;
        }
      } catch (err) {
        throw err;
      }
    }),
  getProfileDetails: procedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId } = input;
      try {
        const profiles = await db
          .select()
          .from(userProfile)
          .where(eq(userProfile.id, userId));

        if (profiles.length > 0) {
          const { data, error, success } = userProfileSchema.safeParse(
            profiles[0]
          );

          if (success) {
            return { code: "SUCCESS", data };
          }
          console.log("Profile data validation failed", error);
        }
        throw new Error("USER_NOT_FOUND");
      } catch (err) {
        console.log("GetProfileDetails error: ", JSON.stringify(err, null, 2));
        throw new Error("USER_NOT_FOUND");
      }
    }),
  getUserSubscriptionDetails: procedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      try {
        const res: SelectSubscription[] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.userId, userId));
        return res;
      } catch (err) {
        console.log("get subscription by user error: ", err);
        return [];
      }
    }),
  createSubscriptionRecord: procedure
    .input(
      z.object({
        subId: z.string(),
        userId: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { status, subId, userId } = input;

      try {
        await db.insert(subscription).values({
          id: subId,
          userId: userId,
          status: status,
        });
        return "Subscription record inserted";
      } catch (err) {
        console.log("createSubscriptionRecord error: ", err);
        throw new Error("CreateSubscriptionRecord failed");
      }
    }),
  saveUserDetails: procedure
    .input(
      z.object({
        id: z.string(),
        firstname: z.string().nullable(),
        lastname: z.string().nullable(),
        email: z.string(),
        googleid: z.string().nullable(),
        appTheme: z.enum(["dark", "light"]),
        createdAt: z.date().default(new Date()),
        language: z.string(),
        role: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        email,
        appTheme,
        createdAt,
        firstname,
        googleid,
        id,
        lastname,
        role,
        language,
      } = input;
      try {
        const records = await db
          .insert(userProfile)
          .values({
            email: email,
            id: id,
            appTheme: appTheme,
            createdAt: createdAt,
            firstname: firstname ?? null,
            lastname: lastname ?? null,
            googleid: googleid ?? null,
            language,
            role,
            instituteName: "https://www.content2quiz.com",
          })
          .returning();
        if (records.length === 0) {
          throw new Error("Insert failed");
        }

        const { data, success } = userProfileSchema.safeParse(records[0]);
        if (success) {
          return data;
        }
        throw new Error("Insert failed");
      } catch (err) {
        console.log(err);
        throw new Error("Insert failed");
      }
    }),

  getSubscriptionDetails: procedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<SelectSubscription> => {
      try {
        const res: SelectSubscription[] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.userId, input.userId));
        if (res.length > 0) {
          return res[0];
        }
        throw new Error("Error fetching subscription details");
      } catch (err) {
        console.error("GET_SUBS_DETAILS_ERROR: ", err);
        throw new Error("Error fetching subscription details");
      }
    }),
  updateQueryCount: procedure
    .input(
      z.object({
        userId: z.string(),
        count: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await db
          .update(subscription)
          .set({
            queries: input.count,
          })
          .where(eq(subscription.userId, input.userId));
        return true;
      } catch (err) {
        console.error("UPDATE_QUERY_COUNT_ERROR: ", err);
        throw new Error("UPDATE_QUERY_COUNT_ERROR");
      }
    }),
  generateBillingPortalLink: procedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;
      try {
        const subscriptionData = await db
          .select()
          .from(subscription)
          .where(eq(subscription.userId, userId));
        if (subscriptionData.length === 0) {
          throw new Error("USER_NOT_FOUND");
        }
        const { customerId } = subscriptionData[0];
        try {
          if (!customerId) {
            throw new Error("NO_CUSTOMER_ID");
          }
          const session = await stripe.billingPortal.sessions.create({
            customer: customerId as string,
            return_url: process.env.NEXT_PUBLIC_APP_DOMAIN + "/chat",
          });
          return { sessionUrl: session.url };
        } catch (err) {
          console.log("STRIPE_BILLING_PORTAL_SESS_ERROR: ", err);
          throw new Error("STRIPE_BILLING_PORTAL_SESS_ERROR");
        }
      } catch (err) {
        console.error("USER_NOT_FOUND: ", err);
        throw new Error("USER_NOT_FOUND");
      }
    }),
  updateQuestions: procedure
    .input(
      z.object({
        questionId: z.string(),
        question: z.union([
          mcqQuestionSchema,
          mcqSimilarQuestionSchema,
          trueFalseQuestionSchema,
          openEndedQuestionSchema,
          fillBlankQuestionSchema,
        ]),
        index: z.number(),
        questionType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { index, question, questionId, questionType } = input;
      try {
        const questRec = await db
          .select()
          .from(questionbank)
          .where(eq(questionbank.id, questionId));

        if (questRec.length > 0) {
          const rec = { ...questRec[0] };
          let updatedQuestions:
            | MCQQuestionSchema[]
            | FillBlankQuestionSchema[]
            | TrueFalseQuestionScheam[]
            | OpenendedQuestionSchema[]
            | McqSimilarQuestionScheam[] = [];
          switch (questionType) {
            case "mcq":
              updatedQuestions = [...(rec.questions as MCQQuestionSchema[])];
              updatedQuestions.splice(index, 1, question as MCQQuestionSchema);
              break;
            case "mcq_similar":
              updatedQuestions = [
                ...(rec.questions as McqSimilarQuestionScheam[]),
              ];
              updatedQuestions.splice(
                index,
                1,
                question as McqSimilarQuestionScheam
              );
              break;
            case "true_false":
              updatedQuestions = [
                ...(rec.questions as TrueFalseQuestionScheam[]),
              ];
              updatedQuestions.splice(
                index,
                1,
                question as TrueFalseQuestionScheam
              );
              break;
            case "fill_blank":
              updatedQuestions = [
                ...(rec.questions as FillBlankQuestionSchema[]),
              ];
              updatedQuestions.splice(
                index,
                1,
                question as FillBlankQuestionSchema
              );
              break;
            case "open_ended":
              updatedQuestions = [
                ...(rec.questions as OpenendedQuestionSchema[]),
              ];
              updatedQuestions.splice(
                index,
                1,
                question as OpenendedQuestionSchema
              );
              break;
            default:
              throw new Error("Invalid question type");
          }
          const updateRes = await db
            .update(questionbank)
            .set({ questions: updatedQuestions })
            .where(eq(questionbank.id, questionId));

          if (updateRes.rowsAffected === 0) {
            throw new Error("QUEST_UPDATE_ERROR");
          }
          return { code: "ROW_UPDATED" };
        }
        throw new Error("QUEST_REC_NOT_FOUND");
      } catch (err) {
        console.error("QUEST_UPDATE_ERROR: ", err);
        throw err;
      }
    }),
  addQuestion: procedure
    .input(
      z.object({
        questionId: z.string(),
        question: z.union([
          mcqQuestionSchema,
          mcqSimilarQuestionSchema,
          trueFalseQuestionSchema,
          openEndedQuestionSchema,
          fillBlankQuestionSchema,
        ]),
        questionType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { question, questionId, questionType } = input;
      try {
        const qBankRec = await db
          .select()
          .from(questionbank)
          .where(eq(questionbank.id, questionId));

        if (qBankRec.length > 0) {
          const rec = { ...qBankRec[0] };
          let updatedQuestions:
            | MCQQuestionSchema[]
            | FillBlankQuestionSchema[]
            | TrueFalseQuestionScheam[]
            | OpenendedQuestionSchema[]
            | McqSimilarQuestionScheam[] = [];
          if (questionType === "mcq") {
            updatedQuestions = rec.questions as MCQQuestionSchema[];
            updatedQuestions.push(question as MCQQuestionSchema);
          } else if (questionType === "mcq_similar") {
            updatedQuestions = rec.questions as McqSimilarQuestionScheam[];
            updatedQuestions.push(question as McqSimilarQuestionScheam);
          } else if (questionType === "true_false") {
            updatedQuestions = rec.questions as TrueFalseQuestionScheam[];
            updatedQuestions.push(question as TrueFalseQuestionScheam);
          } else if (questionType === "fill_blank") {
            updatedQuestions = rec.questions as FillBlankQuestionSchema[];
            updatedQuestions.push(question as FillBlankQuestionSchema);
          } else if (questionType === "open_ended") {
            updatedQuestions = rec.questions as OpenendedQuestionSchema[];
            updatedQuestions.push(question as OpenendedQuestionSchema);
          }

          const { questionsCount } = rec;
          if (questionsCount) {
            const { rowsAffected } = await db
              .update(questionbank)
              .set({
                questions: updatedQuestions,
                questionsCount: questionsCount + 1,
              })
              .where(eq(questionbank.id, questionId));

            if (rowsAffected === 0) {
              throw new Error("QUEST_ADD_ERROR");
            }

            return { code: "QUEST_ADDED" };
          }
        }
        throw new Error("QUEST_REC_NOT_FOUND");
      } catch (err) {
        throw err;
      }
    }),
  addGoogleQuizLinkToRec: procedure
    .input(
      z.object({
        recId: z.string(),
        gQuizLink: z.string(),
        outputType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { recId, gQuizLink, outputType } = input;

      try {
        const { rowsAffected } = await db
          .update(questionbank)
          .set(
            outputType === "question"
              ? { googleQuizLink: gQuizLink }
              : { googleFormId: gQuizLink }
          )
          .where(eq(questionbank.id, recId));

        if (rowsAffected === 0) {
          throw new Error("QUEST_REC_NOT_FOUND");
        }
        return { code: "GQUIZID_ADDED" };
      } catch (err) {
        throw err;
      }
    }),
  deleteQBank: procedure
    .input(
      z.object({
        questionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { questionId } = input;
      try {
        const { rowsAffected } = await db
          .delete(questionbank)
          .where(eq(questionbank.id, questionId));

        if (rowsAffected === 1) {
          return { code: "QBANK_DELETED" };
        }
        throw new Error("QB_REC_NOT_FOUND");
      } catch (err) {
        console.error("deleteQBank error:: ", err);
        throw err;
      }
    }),
  deleteQuestion: procedure
    .input(
      z.object({
        questionId: z.string(),
        qIdx: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { qIdx, questionId } = input;

      try {
        const records = await db
          .select()
          .from(questionbank)
          .where(eq(questionbank.id, questionId));

        if (records.length > 0) {
          const record = records[0];
          if (record.questions) {
            const newList = [
              ...(
                record.questions as
                  | MCQQuestionSchema[]
                  | FillBlankQuestionSchema[]
                  | TrueFalseQuestionScheam[]
                  | OpenendedQuestionSchema[]
                  | McqSimilarQuestionScheam[]
              ).filter((_, id) => id !== qIdx),
            ];
            const { rowsAffected } = await db
              .update(questionbank)
              .set({ questions: [...newList] })
              .where(eq(questionbank.id, questionId));

            if (rowsAffected === 0) {
              throw new Error("QB_REC_NOT_FOUND");
            }
            return { code: "QUESTION_DELETED" };
          }
        }
        throw new Error("QB_REC_NOT_FOUND");
      } catch (err) {
        console.log("DEL_QUESTION_ERROR: ", err);
        throw err;
      }
    }),
  updateQuestionBankHeading: procedure
    .input(
      z.object({
        questionId: z.string(),
        heading: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { questionId, heading } = input;

      try {
        const { rowsAffected } = await db
          .update(questionbank)
          .set({ prompt: heading })
          .where(eq(questionbank.id, questionId));

        if (rowsAffected === 0) {
          throw new Error("QB_REC_NOT_FOUND");
        }
        return { code: "HEADING_UPDATED" };
      } catch (err) {
        console.log("UPDATE_HEADING_ERROR: ", err);
        throw err;
      }
    }),
  generateQuestions: procedure
    .input(
      z.object({
        payload: submitJobPayloadSchema,
        userId: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          "https://augmentbyai.com/response_generator/response_generator",
          {
            method: "POST",
            body: JSON.stringify({ ...input.payload }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const jsonResp = await response.json();
        const { error, data } =
          generateQuestionsResponseSchema.safeParse(jsonResp);

        if (error) {
          throw new Error("Invalid response");
        }
        return data;
      } catch (err) {
        throw err;
      }
    }),
  fetchGeneratedQuestions: procedure
    .input(
      z.object({
        jobId: z.string(),
        userId: z.string(),
        questionType: z.enum([
          "mcq",
          "mcq_similar",
          "fill_blank",
          "true_false",
          "open_ended",
        ]),
        qCount: z.number(),
        keyword: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        outputType: z.enum(["question", "summary", "guidance"]),
      })
    )
    .mutation(async ({ input }) => {
      const {
        jobId,
        userId,
        difficulty,
        keyword,
        qCount,
        questionType,
        outputType,
      } = input;

      try {
        const response = await fetch(
          `https://augmentbyai.com/job_status/job_status/${jobId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response);
        if (response.status === 504) {
          return "TIMEOUT_ERROR";
        }

        const jsonResp = await response.json();
        if (typeof jsonResp === "string") {
          return "pending";
        }
        const { error, data } = baseResultSchema.safeParse(jsonResp);
        if (error) {
          console.log("RESPONSE_VALIDATION_ERROR:: ", error);
          throw error;
        }

        try {
          const { guidance, summary } = data;
          const updatedRecords = await db
            .update(questionbank)
            .set({
              difficultyLevel: difficulty,
              questions: data.questions,
              questionsCount: qCount,
              questionType: questionType,
              withAnswer: true,
              guidance: guidance,
              summary: summary,
              outputType: outputType,
            })
            .where(eq(questionbank.jobId, jobId))
            .returning();

          if (updatedRecords.length === 0) {
            throw new Error("Record insertion failed");
          }
          const { data: questionRecord, error } = questionBankSchema.safeParse(
            updatedRecords[0]
          );
          if (error) {
            throw new Error("QUEST_REC_VALIDATTION_ERROR");
          }
          return questionRecord;
        } catch (err) {
          throw new Error("Insert failed");
        }
      } catch (err) {
        throw err;
      }
    }),
  updateUserProfileDetails: procedure
    .input(
      z.object({
        id: z.string(),
        language: z.string(),
        role: z.string(),
        instituteName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, instituteName, role, language } = input;
      try {
        const { rowsAffected } = await db
          .update(userProfile)
          .set({
            instituteName,
            role,
            language,
          })
          .where(eq(userProfile.id, id));

        if (rowsAffected > 0) {
          return {
            code: "SUCCESS",
          };
        }
        return {
          code: "UPDATE_FAILED",
        };
      } catch (err) {
        console.log("Profile update error: ", err);
        throw err;
      }
    }),
  shareGoogleForm: procedure
    .input(
      z.object({
        formId: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const { formId, email } = input;
      try {
        await fetch(
          `https://autoproctor.com/canvaslms/api/v1/google-form/share/${formId}/${email}`,
          {
            method: "POST",
            headers: {
              accept: "application/json",
            },
          }
        );
        return {
          code: "SUCCESS",
        };
      } catch (err) {
        console.log(JSON.stringify(err, null, 2));
        throw err;
      }
    }),
  shareGoogleDoc: procedure
    .input(
      z.object({
        formId: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const { formId, email } = input;
      try {
        await fetch(
          `https://autoproctor.com/canvaslms/api/v1/google-doc/share/${formId}/${email}`,
          {
            method: "POST",
            headers: {
              accept: "application/json",
            },
          }
        );
        return {
          code: "SUCCESS",
        };
      } catch (err) {
        console.log(JSON.stringify(err, null, 2));
        throw err;
      }
    }),
  addSharedExamRecord: procedure
    .input(
      z.object({
        userId: z.string(),
        questionRecordId: z.string(),
        formId: z.string(),
        firstName: z.string().optional().default(""),
        lastName: z.string().optional().default(""),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { email, firstName, formId, lastName, questionRecordId, userId } =
          input;
        const insertedRecords = await db
          .insert(sharedExams)
          .values({
            id: crypto.randomUUID(),
            email,
            questionRecord: questionRecordId,
            userId,
            firstName,
            formId,
            lastName,
            shareDate: new Date(),
          })
          .returning();

        if (insertedRecords.length === 0) {
          return {
            code: "INSERT_FAILED",
            data: null,
          };
        }
        return {
          code: "SUCCESS",
          data: insertedRecords[0],
        };
      } catch (err) {
        console.log(JSON.stringify(err, null, 2));
        throw err;
      }
    }),
  addQuestionBankRecord: procedure
    .input(
      z.object({
        data: updateQBankRecordScheam,
      })
    )
    .mutation(async ({ input }) => {
      const {
        data: {
          difficulty,
          jobId,
          outputType,
          qCount,
          questionType,
          result,
          userId,
          instituteName,
          keyword,
          contentType,
        },
      } = input;
      const { guidance, summary, questions, resume_data } = result;
      try {
        let prompt = keyword;

        if (typeof resume_data !== "string" && "name" in resume_data) {
          prompt = resume_data.name;
        } else {
          if (outputType !== "question") {
            prompt = `Content based on URL`;
          }
        }
        const insertedRecords = await db
          .insert(questionbank)
          .values({
            difficultyLevel: difficulty,
            questions: questions,
            questionsCount: qCount,
            questionType: questionType,
            withAnswer: true,
            guidance: guidance,
            summary: summary,
            outputType: outputType,
            createdAt: dayjs().toISOString(),
            id: jobId,
            jobId,
            userId,
            googleFormId: "",
            googleQuizLink: "",
            instituteName,
            prompt: prompt,
            promptUrl: "",
          })
          .returning();
        if (insertedRecords.length === 0) {
          return {
            code: "INSERT_FAILED",
            data: null,
          };
        }
        const { data: questionRecord, error } = questionBankSchema.safeParse(
          insertedRecords[0]
        );
        if (error) {
          console.log("QUEST_REC_VALIDATTION_ERROR", error);
          return {
            code: "DATA_VALIDATION_ERROR",
            data: null,
          };
        }
        return {
          code: "SUCCESS",
          data: questionRecord,
        };
      } catch (err) {
        console.log("Insert failed: ", err);
        return {
          code: "INSERT_FAILED",
          data: null,
        };
      }
    }),
});

export type AppRouter = typeof appRouter;
