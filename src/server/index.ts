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
  pricesListSchema,
  questionBankSchema,
  sharedRecordSchema,
  StripePromotionResponseSchema,
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
        return { code: "USER_NOT_FOUND", data: null };
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
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<{
        code: "SUCCESS" | "NOT_FOUND";
        data: SelectSubscription | null;
      }> => {
        try {
          const res: SelectSubscription[] = await db
            .select()
            .from(subscription)
            .where(eq(subscription.userId, input.userId));
          if (res.length > 0) {
            return { code: "SUCCESS", data: res[0] };
          }
          return { code: "NOT_FOUND", data: null };
        } catch (err) {
          console.error("GET_SUBS_DETAILS_ERROR: ", err);
          throw new Error("Error fetching subscription details");
        }
      }
    ),
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
        gId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { recId, gQuizLink, gId } = input;

      try {
        const { rowsAffected } = await db
          .update(questionbank)
          .set({ googleQuizLink: gQuizLink, googleFormId: gId })
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
          console.log(error);
          throw new Error("Invalid response");
        }
        return data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
  fetchGeneratedQuestions: procedure
    .input(
      z.object({
        jobId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { jobId } = input;

      try {
        const response = await fetch(
          `https://augmentbyai.com/redis/redis_get?job_id=${jobId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const jsonResp = await response.json();
        const { error, data, success } = z
          .union([
            baseResultSchema,
            z.object({
              callback_url: z.string().nullable(),
              job_id: z.string(),
              status: z.string(),
            }),
          ])
          .safeParse(jsonResp);

        if (success) {
          if (data.status === "processing") {
            throw new Error("PROCESSING");
          }
          if ("summary" in data) {
            return { code: "SUCCESS", data: data };
          }
        }

        if (error) {
          console.log("RESPONSE_VALIDATION_ERROR:: ", error);
          return {
            code: "RESPONSE_VALIDATION_ERROR",
            data: null,
          };
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
      const { email, firstName, formId, lastName, questionRecordId, userId } =
        input;
      try {
        const result = await db
          .select()
          .from(sharedExams)
          .where(eq(sharedExams.email, email));

        if (result.length > 0) {
          return {
            code: "SUCCESS",
            data: null,
          };
        }
      } catch (err) {
        console.log(err);
        return {
          code: "INSERT_FAILED",
          data: null,
        };
      }

      try {
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
        },
      } = input;
      const { guidance, summary, questions, resume_data } = result;
      try {
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
            prompt: keyword,
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
  fetchProductPrices: procedure.query(async () => {
    try {
      const response = await fetch(
        "https://api.stripe.com/v1/prices?expand[]=data.currency_options&active=true",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.ok) {
        return {
          code: "FAILED",
          data: null,
        } as const;
      }

      const jsonResp = await response.json();
      const { error, data } = pricesListSchema.safeParse(jsonResp);

      if (error) {
        console.log("PARSE ERROR: ", error);
        return {
          code: "FAILED",
          data: null,
        } as const;
      }
      return {
        code: "SUCCESS",
        data,
      } as const;
    } catch (err) {
      console.log("fetchSubscriptionPlans error: ", err);
      return {
        code: "FAILED",
        data: null,
      } as const;
    }
  }),
  fetchProducts: procedure.query(async () => {
    try {
      const products = await stripe.products.list({
        active: true,
      });

      const productsById: { [key: string]: Stripe.Product } = {};

      products.data.forEach((item) => {
        productsById[item.id] = { ...item };
      });

      return { data: productsById, code: "SUCCESS" } as const;
    } catch (err) {
      console.log("fetchProducts error: ", err);
      return { data: null, code: "FAILED" } as const;
    }
  }),
  cancelSubscription: procedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        await stripe.subscriptions.update(input, {
          cancel_at_period_end: true,
          cancellation_details: {
            comment: "User demanded cancellation",
          },
        });

        try {
          const { rowsAffected } = await db
            .update(subscription)
            .set({
              status: "requested_cancellation",
            })
            .where(eq(subscription.id, input));
          if (rowsAffected > 0) {
            console.log(
              "Cancellation requested at: ",
              dayjs().format("MMM-DD-YYYY | hh:mm a")
            );
          } else {
            console.log("Cancellation data update failed");
          }
        } catch (err) {
          console.log(err);
        }

        return {
          code: "SUCCESS",
        } as const;
      } catch (err) {
        console.log("cancellation error: ", err);
        return {
          code: "FAILED",
        } as const;
      }
    }),
  validatePromoCode: procedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const url = new URL("https://api.stripe.com/v1/promotion_codes");
      url.searchParams.append("code", input);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!response.ok) {
        return { code: "FAILED", data: null } as const;
      }

      const jsonResp = await response.json();

      const { error, data } = StripePromotionResponseSchema.safeParse(jsonResp);

      if (error) {
        return { code: "FAILED", data: null } as const;
      } else {
        if (data.data.length === 0) {
          return { code: "FAILED", data: null } as const;
        }
        return { code: "SUCCESS", data } as const;
      }
    } catch (err) {
      console.log(err);
      return { code: "FAILED", data: null } as const;
    }
  }),
  createCustomer: procedure
    .input(
      z.object({
        paymentMethodId: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        addressLine1: z.string(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        paymentMethodId,
        firstName,
        lastName,
        email,
        addressLine1,
        city,
        state,
        postalCode,
        country,
        userId,
      } = input;
      try {
        const customer = await stripe.customers.create({
          payment_method: paymentMethodId,
          name: `${firstName} ${lastName}`,
          email: email,
          description: `Payment from ${firstName} ${lastName} at ${dayjs().format(
            "MMM-DD-YYYY | hh:mm a"
          )}`,
          address: {
            line1: addressLine1,
            city: city,
            state: state,
            postal_code: postalCode,
            country: country,
          },
          metadata: {
            userId,
          },
        });

        return {
          code: "SUCCESS",
          data: customer,
        } as const;
      } catch (err) {
        console.error("Create Customer error: ", err);
        return {
          code: "FAILED",
          data: null,
        } as const;
      }
    }),

  createSubscription: procedure
    .input(
      z.object({
        customerId: z.string(),
        priceId: z.string(),
        paymentMethodId: z.string(),
        currency: z.string(),
        couponCode: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const {
        currency,
        customerId,
        paymentMethodId,
        priceId,
        couponCode,
        userId,
      } = input;
      const payload: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        default_payment_method: paymentMethodId,
        items: [
          {
            price: priceId,
          },
        ],
        currency,
        metadata: {
          userId,
        },
      };

      if (couponCode) {
        payload.discounts = [
          {
            promotion_code: couponCode,
          },
        ];
      }

      try {
        const subscription = await stripe.subscriptions.create({
          ...payload,
        });

        return {
          code: "SUCCESS",
          data: subscription,
        } as const;
      } catch (err) {
        console.log("create subscription error: ", err);
        return {
          code: "FAILED",
          data: null,
        } as const;
      }
    }),
  upgradeSubscription: procedure
    .input(
      z.object({
        subscriptionId: z.string(),
        priceId: z.string(),
        userEmail: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { subscriptionId, priceId, userEmail } = input;

      const [fsoResult, fceResult] = await Promise.all([
        fetchSubscriptionObject(subscriptionId),
        fetchCustomerByEmail(userEmail),
      ]);

      const { code: fsoCode, data: fsoData } = fsoResult;
      const { code: fceCode, data: fceData } = fceResult;

      if (fsoCode === "SUCCESS" && fsoData && fceData) {
        try {
          const updateResponse = await stripe.subscriptions.update(
            subscriptionId,
            {
              proration_behavior: "always_invoice",
              items: [{ id: fsoResult.data.items.data[0].id, price: priceId }],
              proration_date: Math.floor(new Date().getTime() / 1000),
            }
          );

          console.log("updateResponse: ", updateResponse);

          return {
            code: "UPGRADE_SUCCESS",
            data: null,
          } as const;
        } catch (err) {
          console.log("Upgrade error: ", err);
          return {
            code: "UPGRADE_ERROR",
            data: null,
          } as const;
        }
      } else {
        if (fceCode === "SUCCESS" && fceData) {
          const { id } = fceData;
          const { code, data } = await fetchPaymentMethod(id);

          if (code === "SUCCESS" && data) {
            const payload: Stripe.SubscriptionCreateParams = {
              customer: id,
              default_payment_method: data.id,
              items: [
                {
                  price: priceId,
                },
              ],
              currency: fceData.currency || "usd",
              metadata: {
                userId: fceData.metadata.userId,
              },
            };

            try {
              await stripe.subscriptions.create({
                ...payload,
              });

              return {
                code: "SUCCESS",
                data: null,
              } as const;
            } catch (err) {
              console.log("new subscription create error: ", err);
              return {
                code: "FAILED",
                data: null,
              } as const;
            }
          }
        }
      }
    }),
  getSharedExams: procedure.input(z.string()).mutation(async ({ input }) => {
    try {
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
        .innerJoin(
          questionbank,
          eq(sharedExams.questionRecord, questionbank.jobId)
        )
        .innerJoin(userProfile, eq(questionbank.userId, userProfile.id))
        .where(eq(sharedExams.userId, input));

      const { error, data } = z.array(sharedRecordSchema).safeParse(records);

      if (error) {
        console.log("getSharedExams error: ", error);
        return {
          code: "FAILED",
          data: null,
        } as const;
      }
      return {
        code: "SUCCESS",
        data: data,
      } as const;
    } catch (err) {
      console.log("getSharedExams error: ", err);
      return {
        code: "FAILED",
        data: null,
      } as const;
    }
  }),
  getProratedAmount: procedure
    .input(
      z.object({
        subscriptionId: z.string(),
        newPriceId: z.string(),
        customerId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { subscriptionId, newPriceId, customerId } = input;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        if (subscription.status === "active") {
          const invoice = await stripe.invoices.retrieveUpcoming({
            subscription: subscriptionId,
            customer: customerId,
            subscription_items: [
              {
                id: subscription.items.data[0].id,
                price: newPriceId,
              },
            ],
            subscription_proration_date: Math.floor(Date.now() / 1000),
          });
          console.log("upcoming invoice: ", JSON.stringify(invoice));
          return {
            code: "SUCCESS",
            data: invoice.amount_due,
          } as const;
        }
        return {
          code: "NO_ACTIVE_SUBSCRIPTION",
          data: null,
        } as const;
      } catch (err) {
        console.log("getProratedAmount error: ", err);
        return {
          code: "FAILED",
          data: null,
        } as const;
      }
    }),
  downgradeSubscription: procedure
    .input(
      z.object({
        subscriptionId: z.string(),
        priceId: z.string(),
        userEmail: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { subscriptionId, priceId, userEmail } = input;

      const [fsoResult, fceResult] = await Promise.all([
        fetchSubscriptionObject(subscriptionId),
        fetchCustomerByEmail(userEmail),
      ]);
      if (fsoResult.data && fceResult.data) {
        const { id, current_period_end } = fsoResult.data;
        const { id: customerId } = fceResult.data;
        try {
          const payload: Stripe.SubscriptionScheduleCreateParams = {
            customer: customerId,
            start_date: current_period_end,
            phases: [
              {
                items: [{ price: priceId }],
              },
            ],
          };
          await stripe.subscriptionSchedules.create({
            ...payload,
          });

          return { code: "WILL_CHANGE", data: null } as const;
        } catch (err) {
          console.log("Downgrade error: ", err);
          return { code: "FAILED", data: null } as const;
        }
      } else {
        return { code: "FAILED", data: null } as const;
      }
    }),
  addFreeSubscription: procedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
        priceId: z.string(),
        queries: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { amount, priceId, userId, queries } = input;
      try {
        const startDay = dayjs();
        const endDay = startDay.add(1, "month");

        const rows = await db
          .insert(subscription)
          .values({
            id: `${priceId}_${userId}`,
            userId,
            amountDue: amount,
            amountPaid: amount,
            currency: "usd",
            customerId: "",
            planName: "Free",
            startDate: startDay.toISOString(),
            endDate: endDay.toISOString(),
            queries,
            status: "paid",
            planId: priceId
          })
          .returning();

        if (rows.length === 0) {
          return { code: "FAILED", data: null } as const;
        }

        return { code: "SUCCESS", data: rows[0] } as const;
      } catch (err) {
        console.log("Add free plan error: ", JSON.stringify(err));
        return { code: "ERROR", data: null } as const;
      }
    }),
});

async function fetchPaymentMethod(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    if (paymentMethods.data.length === 0) {
      return {
        code: "NO_PAYMENT_METHOD",
        data: null,
      } as const;
    }

    return {
      code: "SUCCESS",
      data: paymentMethods.data[0],
    } as const;
  } catch (err) {
    console.error("Error fetching payment method: ", err);
    return {
      code: "FAILED",
      data: null,
    } as const;
  }
}

async function fetchSubscriptionObject(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      code: "SUCCESS",
      data: subscription,
    } as const;
  } catch (err) {
    console.error("Error fetching subscription: ", err);
    return {
      code: "FAILED",
      data: null,
    } as const;
  }
}

async function fetchCustomerByEmail(email: string) {
  try {
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });
    if (customers.data.length === 0) {
      return {
        code: "NO_CUSTOMER",
        data: null,
      } as const;
    }

    return {
      code: "SUCCESS",
      data: customers.data[0],
    } as const;
  } catch (err) {
    console.error("Error fetching customer by email: ", err);
    return {
      code: "FAILED",
      data: null,
    } as const;
  }
}

export type AppRouter = typeof appRouter;
