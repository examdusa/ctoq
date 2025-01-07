import { relations } from "drizzle-orm";
// import { datetime, mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Define Userprofile schema
export const userProfile = sqliteTable("userprofile", {
  id: text("id", { length: 36 }).primaryKey(),
  firstname: text("firstname", { length: 255 }),
  lastname: text("lastname", { length: 255 }),
  email: text("email", { length: 255 }).notNull(),
  googleid: text("googleid", { length: 255 }),
  appTheme: text("appTheme", { length: 50 }),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()),
  language: text("language").default("English"),
  instituteName: text("instituteName").default("Content To Quiz"),
  role: text("userRole").default("student"),
});

export const userProfileRelation = relations(userProfile, ({ many, one }) => ({
  questions: many(questionbank),
  subscription: one(subscription, {
    fields: [userProfile.id],
    references: [subscription.userId],
  }),
  sharedExams: many(sharedExams),
}));

// Define Questionbank schema with a foreign key to Userprofile
export const questionbank = sqliteTable("questionbank", {
  id: text("id", { length: 36 }).primaryKey(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()),
  userId: text("userId", { length: 36 })
    .notNull()
    .references(() => userProfile.id, { onDelete: "cascade" }),
  jobId: text("jobId", { length: 255 }),
  questions: text("questions", { mode: "json" }),
  difficultyLevel: text("difficultyLevel"),
  questionsCount: integer("questionsCount"),
  prompt: text("prompt"),
  questionType: text("questionType"),
  promptUrl: text("promptUrl"),
  withAnswer: integer("withAnswer", { mode: "boolean" }),
  googleQuizLink: text("googleQuizLink").default(""),
  instituteName: text("instituteName").default("Content To Quiz"),
  outputType: text("outputType").default(""),
  guidance: text("guidance").default("NA"),
  summary: text("summary").default("NA"),
  googleFormId: text("googleFormId").default(""),
});

export const questionbankRelation = relations(
  questionbank,
  ({ one, many }) => ({
    user: one(userProfile, {
      fields: [questionbank.userId],
      references: [userProfile.id],
    }),
    sharedExams: many(sharedExams),
  })
);

export const subscription = sqliteTable("subscription", {
  id: text("id", { length: 36 }).primaryKey(),
  userId: text("userId", { length: 36 })
    .notNull()
    .references(() => userProfile.id),
  status: text("status", { length: 255 }),
  startDate: text("startDate", { length: 36 }),
  endDate: text("endDate", { length: 36 }),
  amountPaid: real("amountPaid"),
  amountDue: real("amountDue"),
  planId: text("planId", { length: 36 }),
  planName: text("planName", { length: 36 }),
  queries: integer("queries", { mode: "number" }).default(0),
  invoiceId: text("invoiceId", { length: 255 }),
  invoiceUrl: text("invoiceUrl"),
  invoicePdfUrl: text("invoicePdfUrl"),
  currency: text("currency", { length: 36 }),
  customerId: text("customerId"),
});

export const sharedExams = sqliteTable("sharedExams", {
  id: text("id", { length: 36 }).primaryKey(),
  userId: text("userId", { length: 36 })
  .notNull()
  .references(() => userProfile.id, { onDelete: "cascade" }), // FK to userProfile
questionRecord: text("questionRecord", { length: 36 })
  .notNull()
  .references(() => questionbank.id, { onDelete: "cascade" }),
  formId: text("formId"),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email").notNull(),
  shareDate: integer("shareDate", { mode: "timestamp" }).default(new Date()),
});

export const pendingJob = sqliteTable("pendingJob", {
  jobId: text("jobId", { length: 36 }).primaryKey().notNull(),
  userId: text("userId", { length: 36 })
    .notNull()
    .references(() => userProfile.id)
    .notNull(),
  questionBankId: text("jobId").unique().notNull(),
  status: text("status").notNull(),
});

export const sharedExamsRelation = relations(sharedExams, ({ one }) => ({
  user: one(userProfile, {
    fields: [sharedExams.userId],
    references: [userProfile.id],
  }),
  question: one(questionbank, {
    fields: [sharedExams.questionRecord],
    references: [questionbank.id],
  }),
}));

// Relations for pendingJob
export const pendingJobRelation = relations(pendingJob, ({ one }) => ({
  user: one(userProfile, {
    fields: [pendingJob.userId],
    references: [userProfile.id],
  }),
  questionBank: one(questionbank, {
    fields: [pendingJob.questionBankId],
    references: [questionbank.id],
  }),
}));

export type InsertUser = typeof userProfile.$inferInsert;
export type SelectUser = typeof userProfile.$inferSelect;
export type InsertQuestionBank = typeof questionbank.$inferInsert;
export type SelectQuestionBank = typeof questionbank.$inferSelect;
export type SelectSubscription = typeof subscription.$inferSelect;
export type InsertSubscription = typeof subscription.$inferInsert;
export type InsertPendingJob = typeof pendingJob.$inferInsert;
export type SelectPendingJob = typeof pendingJob.$inferSelect;
export type InsertSharedExams = typeof sharedExams.$inferInsert;
export type SelectSharedExams = typeof sharedExams.$inferSelect;
