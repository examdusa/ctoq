import { z } from "zod";

const mcqSimilarQuestionSchema = z.object({
  question: z.string(),
  options: z.record(z.string(), z.string()),
  answer: z.array(z.string()),
});

const mcqSimilarPromptResponseSchema = z.object({
  input: z.string(),
  code: z.number(),
  quiz_type: z.literal("mcq_similar"),
  questions: z.array(mcqSimilarQuestionSchema),
});

const mcqSimilarQuizResponseSchema = z.object({
  prompt_responses: z.array(mcqSimilarPromptResponseSchema),
  url_responses: z.array(mcqSimilarPromptResponseSchema),
});

const fillBlankQuestionSchema = z.object({
  question: z.string(),
  options: z.record(z.string(), z.string()),
  answer: z.string(),
});

const fillBlankPromptResponseSchema = z.object({
  input: z.string(),
  code: z.number(),
  quiz_type: z.literal("fill_blank"),
  questions: z.array(fillBlankQuestionSchema),
});

const fillBlankQuizResponseSchema = z.object({
  prompt_responses: z.array(fillBlankPromptResponseSchema),
  url_responses: z.array(fillBlankPromptResponseSchema),
});

const trueFalseQuestionSchema = z.object({
  question: z.string().optional(),
  options: z.record(z.string(), z.string()),
  answer: z.string(),
  statemen: z.string().optional(),
  Suggested_lines: z.string().optional(),
});

const trueFalsePromptResponseSchema = z.object({
  input: z.string(),
  code: z.number(),
  quiz_type: z.literal("true_false"),
  questions: z.array(trueFalseQuestionSchema),
});

const trueFalseQuizResponseSchema = z.object({
  prompt_responses: z.array(trueFalsePromptResponseSchema),
  url_responses: z.array(trueFalsePromptResponseSchema),
});

const openEndedQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const openEndedPromptResponseSchema = z.object({
  input: z.string(),
  code: z.number(),
  quiz_type: z.literal("open_ended"),
  questions: z.array(openEndedQuestionSchema),
});

const openEndedQuizresponseSchema = z.object({
  prompt_responses: z.array(openEndedPromptResponseSchema),
  url_responses: z.array(openEndedPromptResponseSchema),
});

const mcqOptionsSchema = z.object({
  A: z.string(),
  B: z.string(),
  C: z.string(),
  D: z.string(),
});

const mcqQuestionSchema = z.object({
  question: z.string(),
  options: mcqOptionsSchema,
  answer: z.string().refine((value) => ["A", "B", "C", "D"].includes(value), {
    message: "Answer must be one of the options: A, B, C, D",
  }),
});

const mcqPromptResponseSchema = z.object({
  input: z.string(),
  code: z.number(),
  quiz_type: z.literal("mcq"),
  questions: z.array(mcqQuestionSchema),
});

const mcqQuizresponseSchema = z.object({
  prompt_responses: z.array(mcqPromptResponseSchema),
  url_responses: z.array(mcqPromptResponseSchema),
});

const instituteSchema = z.object({
  instituteId: z.number(),
  invokeUrl: z.string(),
  lmsName: z.string(),
  instituteName: z.string(),
  campusName: z.string().nullable(),
  updatedBy: z.string().nullable(),
  instituteType: z.string(),
  instituteUrl: z.string(),
  lmsVersion: z.string().nullable(),
  accountId: z.string().nullable(),
  launchUrl: z.string(),
  developersKey: z.string().nullable(),
  lmsToken: z.string().nullable(),
  configurationKey: z.string().nullable(),
  sharedSecret: z.string().nullable(),
  ltiClientid: z.string().nullable(),
  ltiXml: z.string().nullable(),
  ltiXmlurl: z.string().nullable(),
  status: z.number(),
  firstName: z.string(),
  contactLastname: z.string(),
  contactPhone: z.string(),
  fax: z.string().nullable(),
  address1: z.string().nullable(),
  address2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
  country: z.string().nullable(),
  lmsAccessurl: z.string(),
  guid: z.string(),
  createUser: z.string(),
  createDate: z.string(),
  modifyUser: z.string(),
  modifyDate: z.string(),
});

const institutesListSchema = z.array(instituteSchema);

type MCQSimilarQuizResponseSchema = z.infer<
  typeof mcqSimilarQuizResponseSchema
>;
type FillBlankQuizResponseSchema = z.infer<typeof fillBlankQuizResponseSchema>;
type TrueFalseQuizResponseSchema = z.infer<typeof trueFalseQuizResponseSchema>;
type OpenEndedQuizresponseSchema = z.infer<typeof openEndedQuizresponseSchema>;
type MCQQuizResponseSchema = z.infer<typeof mcqQuizresponseSchema>;

type MCQQuestionSchema = z.infer<typeof mcqQuestionSchema>;
type FillBlankQuestionSchema = z.infer<typeof fillBlankQuestionSchema>;
type OpenendedQuestionSchema = z.infer<typeof openEndedQuestionSchema>;
type TrueFalseQuestionsScheam = z.infer<typeof trueFalseQuestionSchema>;
type McqSimilarQuestionScheam = z.infer<typeof mcqSimilarQuestionSchema>;
type Institute = z.infer<typeof instituteSchema>;
type Institutes = z.infer<typeof institutesListSchema>;

export {
  fillBlankQuestionSchema,
  fillBlankQuizResponseSchema,
  instituteSchema,
  institutesListSchema,
  mcqQuestionSchema,
  mcqQuizresponseSchema,
  mcqSimilarQuestionSchema,
  mcqSimilarQuizResponseSchema,
  openEndedQuestionSchema,
  openEndedQuizresponseSchema,
  trueFalseQuestionSchema,
  trueFalseQuizResponseSchema,
};
export type {
  FillBlankQuestionSchema,
  FillBlankQuizResponseSchema,
  Institute,
  Institutes,
  MCQQuestionSchema,
  MCQQuizResponseSchema,
  McqSimilarQuestionScheam,
  MCQSimilarQuizResponseSchema,
  OpenendedQuestionSchema,
  OpenEndedQuizresponseSchema,
  TrueFalseQuestionsScheam,
  TrueFalseQuizResponseSchema,
};
