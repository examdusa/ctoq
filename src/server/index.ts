import { db } from "@/db";
import {
  questionbank,
  SelectQuestionBank,
  SelectSubscription,
  subscription,
  userProfile,
} from "@/db/schema";
import { questionSchema } from "@/utllities/apiFunctions";
import {
  FillBlankQuestionSchema,
  fillBlankQuestionSchema,
  MCQQuestionSchema,
  McqSimilarQuestionScheam,
  mcqSimilarQuestionSchema,
  OpenendedQuestionSchema,
  openEndedQuestionSchema,
  trueFalseQuestionSchema,
  TrueFalseQuestionsScheam,
} from "@/utllities/zod-schemas-types";
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
    .mutation(async ({ ctx, input }) => {
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
  getProfileDetails: procedure.query(async () => {
    return await db.select().from(userProfile);
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, appTheme, createdAt, firstname, googleid, id, lastname } =
        input;
      try {
        const user = await db
          .select()
          .from(userProfile)
          .where(eq(userProfile.id, id));
        if (user.length === 0) {
          await db.insert(userProfile).values({
            email: email,
            id: id,
            appTheme: appTheme,
            createdAt: createdAt,
            firstname: firstname ?? null,
            lastname: lastname ?? null,
            googleid: googleid ?? null,
          });
          return "Inserted";
        } else {
          return "User exists";
        }
      } catch (err) {
        console.log(err);
        throw new Error("Insert failed");
      }
    }),
  saveQBank: procedure
    .input(
      z.object({
        createdAt: z.date().default(new Date()),
        userId: z.string(),
        jobId: z.string(),
        questions: z.object({
          questions: z.array(
            z.union([
              questionSchema,
              mcqSimilarQuestionSchema,
              trueFalseQuestionSchema,
              openEndedQuestionSchema,
              fillBlankQuestionSchema,
            ])
          ),
        }),
        qType: z.enum([
          "mcq",
          "mcq_similar",
          "fill_blank",
          "true_false",
          "open_ended",
        ]),
        difficulty: z.enum(["easy", "medium", "hard"]),
        qCount: z.number().min(0).max(30),
        qUrl: z.string().nullable(),
        qKeyword: z.string(),
        withAnswer: z.enum(["GWA", "GWOA"]),
      })
    )
    .mutation(async ({ input }) => {
      const {
        createdAt,
        difficulty,
        jobId,
        qCount,
        qKeyword,
        qType,
        qUrl,
        questions,
        userId,
        withAnswer,
      } = input;
      try {
        await db.insert(questionbank).values({
          id: jobId,
          createdAt: createdAt,
          jobId: jobId,
          userId: userId,
          difficultyLevel: difficulty,
          prompt: qKeyword ?? "",
          promptUrl: qUrl ?? "",
          questions: questions.questions,
          questionsCount: qCount,
          questionType: qType,
          withAnswer: withAnswer === "GWA" ? true : false,
        });
        const records = await db
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
            instituteName: questionbank.instituteName,
          })
          .from(questionbank)
          .where(eq(questionbank.id, jobId));
        if (records.length > 0) {
          return records[0];
        }
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
          questionSchema,
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
            | TrueFalseQuestionsScheam[]
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
                ...(rec.questions as TrueFalseQuestionsScheam[]),
              ];
              updatedQuestions.splice(
                index,
                1,
                question as TrueFalseQuestionsScheam
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
          questionSchema,
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
            | TrueFalseQuestionsScheam[]
            | OpenendedQuestionSchema[]
            | McqSimilarQuestionScheam[] = [];
          if (questionType === "mcq") {
            updatedQuestions = rec.questions as MCQQuestionSchema[];
            updatedQuestions.push(question as MCQQuestionSchema);
          } else if (questionType === "mcq_similar") {
            updatedQuestions = rec.questions as McqSimilarQuestionScheam[];
            updatedQuestions.push(question as McqSimilarQuestionScheam);
          } else if (questionType === "true_false") {
            updatedQuestions = rec.questions as TrueFalseQuestionsScheam[];
            updatedQuestions.push(question as TrueFalseQuestionsScheam);
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
      })
    )
    .mutation(async ({ input }) => {
      const { recId, gQuizLink } = input;

      try {
        const { rowsAffected } = await db
          .update(questionbank)
          .set({ googleQuizLink: gQuizLink })
          .where(eq(questionbank.id, recId));

        if (rowsAffected === 0) {
          throw new Error("QUEST_REC_NOT_FOUND");
        }
        return { code: "GQUIZLINK_ADDED" };
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
                  | TrueFalseQuestionsScheam[]
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
});

export type AppRouter = typeof appRouter;
