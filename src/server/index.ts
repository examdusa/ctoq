import { db } from "@/db";
import {
  questionbank,
  SelectSubscription,
  subscription,
  userProfile,
} from "@/db/schema";
import { questionSchema } from "@/utllities/apiFunctions";
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
        const questions = await db
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
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      try {
        const res: SelectSubscription[] = await db
          .select()
          .from(subscription)
          .where(eq(subscription.id, userId));
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
          questions: z.array(questionSchema),
        }),
        qType: z.enum(["mcq"]),
        difficulty: z.enum(["easy"]),
        qCount: z.number().min(0).max(30),
        qUrl: z.string().nullable(),
        qKeyword: z.string().nullable(),
        withAnswer: z.enum(["GWA", "GWOA"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
        return "Inserted";
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
});

export type AppRouter = typeof appRouter;
