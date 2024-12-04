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
});

export const userProfileRelation = relations(userProfile, ({ many }) => ({
  questions: many(questionbank), // A user can have many questions
}));

export const userProfileSubscriptionRelation = relations(
  userProfile,
  ({ one }) => ({
    suscription: one(subscription), // A user can have many questions
  })
);

// Define Questionbank schema with a foreign key to Userprofile
export const questionbank = sqliteTable("questionbank", {
  id: text("id", { length: 36 }).primaryKey(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(new Date()),
  userId: text("userId", { length: 36 })
    .notNull()
    .references(() => userProfile.id),
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
});

export const questionbankRelation = relations(questionbank, ({ many }) => ({
  user: many(userProfile), // Each question is linked to one user
}));

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

export const subscriptionTableRelation = relations(subscription, ({ one }) => ({
  user: one(userProfile),
}));

export type InsertUser = typeof userProfile.$inferInsert;
export type SelectUser = typeof userProfile.$inferSelect;
export type InsertQuestionBank = typeof questionbank.$inferInsert;
export type SelectQuestionBank = typeof questionbank.$inferSelect;
export type SelectSubscription = typeof subscription.$inferSelect;
export type InsertSubscription = typeof subscription.$inferInsert;
