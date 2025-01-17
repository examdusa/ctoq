import { z } from "zod";

const mcqQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
  difficulty: z.string(),
});

const trueFalseQuestionSchema = z.object({
  question: z.string(),
  answer: z.enum(["True", "False"]),
  difficulty: z.string(),
});
const fillBlankQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  difficulty: z.string(),
});

const openEndedQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  difficulty: z.string(),
});

const baseResultSchema = z.object({
  status: z.enum(["success", "processing"]),
  status_code: z.number().int().min(100).max(599),
  job_id: z.string(),
  callback_url: z.string().or(z.string().url()),
  file_metadata: z.union([
    z.object({
      word_count: z.number().int(),
      char_count: z.number().int(),
      file_size: z.string(),
    }),
    z.object({}),
  ]),
  resume_data: z.union([
    z.object({
      name: z.string(),
      email: z.string(),
      skills: z.string(),
    }),
    z.object({}),
  ]),
  summary: z.string(),
  guidance: z.string(),
  questions: z.array(
    z.union([
      mcqQuestionSchema,
      trueFalseQuestionSchema,
      fillBlankQuestionSchema,
      openEndedQuestionSchema,
    ])
  ),
});

const mcqQuestionsSchema = baseResultSchema.extend({
  questions: z.array(mcqQuestionSchema),
});

const trueFalseQuestionsSchema = baseResultSchema.extend({
  questions: z.array(trueFalseQuestionSchema),
});

const openEndedQuestionsSchema = baseResultSchema.extend({
  questions: z.array(openEndedQuestionSchema),
});

const mcqSimilarQuestionSchema = baseResultSchema.extend({
  questions: z.array(mcqQuestionSchema),
});

const fillBlankQuizResponseSchema = baseResultSchema.extend({
  questions: fillBlankQuestionSchema,
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

const submitJobPayloadSchema = z.object({
  language: z.string(),
  actor: z.string(),
  resume: z.string(),
  courses: z.string(),
  keywords: z.string(),
  output_type: z.enum(["question", "summary", "guidance"]),
  no_of_questions: z.number().int(),
  question_type: z
    .enum(["open_ended", "mcq", "true_false", "mcq_similar", "fill_blank"])
    .or(z.string()),
  question_difficulty: z.string(),
  instructions: z.string(),
  career_goal: z.string(),
  experience_level: z.string(),
  geography: z.string(),
  b_day: z.string(),
});

const generateQuestionsResponseSchema = z.object({
  job_id: z.string(),
  status: z.string(),
  callback_url: z.string(),
});

const userProfileSchema = z.object({
  id: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  googleid: z.string(),
  appTheme: z.string(),
  createdAt: z.date(),
  language: z.string(),
  instituteName: z.string(),
  role: z.string(),
});

const googleDocRequestObject = z.object({
  textToInsert: z.string(),
});

const googleDocSchema = z.object({
  title: z.string(),
  fromEmail: z.string(),
  toEmails: z.array(z.string()),
  requests: z.array(googleDocRequestObject),
});

const questionBankSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  userId: z.string(),
  jobId: z.string(),
  questions: z
    .array(
      z.union([
        mcqQuestionSchema,
        trueFalseQuestionSchema,
        fillBlankQuestionSchema,
        openEndedQuestionSchema,
      ])
    )
    .default([]),
  difficultyLevel: z.string(),
  questionsCount: z.number(),
  prompt: z.string(),
  questionType: z.string(),
  promptUrl: z.string(),
  withAnswer: z.boolean(),
  googleQuizLink: z.string(),
  instituteName: z.string(),
  outputType: z.string(),
  guidance: z.string(),
  summary: z.string(),
  googleFormId: z.string(),
});

const sharedRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  questionRecord: z.string(),
  formId: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().email(),
  shareDate: z.date().nullable(),
  prompt: z.string().nullable(),
  googleQuizLink: z.string().nullable(),
  googleFormId: z.string().nullable(),
  outputType: z.string().nullable(),
});

const genGoogleFormOrDocResponse = z.object({
  message: z.string().optional(),
  code: z.number(),
  responseStatus: z.enum(["CONTINUE", "SUCCESS", "FAILURE"]).optional(), // Adjust the enum values as needed
  data: z.record(z.unknown()).optional(), // Allows an empty or general object structure
  errorData: z.record(z.unknown()).optional(),
  formId: z.string(),
  formUrl: z.string(),
});

type GenGoolgeFormOrDocResponse = z.infer<typeof genGoogleFormOrDocResponse>;
type SharedRecordSchema = z.infer<typeof sharedRecordSchema>;
type QuestionBankSchema = z.infer<typeof questionBankSchema>;
type GoogleDocSchema = z.infer<typeof googleDocSchema>;
type SubmitJobPayloadSchema = z.infer<typeof submitJobPayloadSchema>;
type MCQSimilarQuizResponseSchema = z.infer<typeof mcqSimilarQuestionSchema>;
type GenerateQuestionsResponseSchema = z.infer<
  typeof generateQuestionsResponseSchema
>;
type FillBlankQuizResponseSchema = z.infer<typeof fillBlankQuizResponseSchema>;
type TrueFalseQuestionsSchema = z.infer<typeof trueFalseQuestionsSchema>;
type OpenEndedQuizResponseSchema = z.infer<typeof openEndedQuestionsSchema>;
type MCQQuestionsSchema = z.infer<typeof mcqQuestionsSchema>;
type FillBlankQuestionSchema = z.infer<typeof fillBlankQuestionSchema>;
type OpenendedQuestionSchema = z.infer<typeof openEndedQuestionSchema>;
type TrueFalseQuestionScheam = z.infer<typeof trueFalseQuestionSchema>;
type McqSimilarQuestionScheam = z.infer<typeof mcqSimilarQuestionSchema>;
type Institute = z.infer<typeof instituteSchema>;
type Institutes = z.infer<typeof institutesListSchema>;
type MCQQuestionSchema = z.infer<typeof mcqQuestionSchema>;
type BaseResultSchema = z.infer<typeof baseResultSchema>;
type UserProfileSchema = z.infer<typeof userProfileSchema>;

export {
  baseResultSchema,
  fillBlankQuestionSchema,
  fillBlankQuizResponseSchema,
  generateQuestionsResponseSchema,
  genGoogleFormOrDocResponse,
  googleDocSchema,
  instituteSchema,
  institutesListSchema,
  mcqQuestionSchema,
  mcqQuestionsSchema,
  mcqSimilarQuestionSchema,
  openEndedQuestionSchema,
  openEndedQuestionsSchema,
  questionBankSchema,
  sharedRecordSchema,
  submitJobPayloadSchema,
  trueFalseQuestionSchema,
  trueFalseQuestionsSchema,
  userProfileSchema,
};
export type {
  BaseResultSchema,
  FillBlankQuestionSchema,
  FillBlankQuizResponseSchema,
  GenerateQuestionsResponseSchema,
  GenGoolgeFormOrDocResponse,
  GoogleDocSchema,
  Institute,
  Institutes,
  MCQQuestionSchema,
  MCQQuestionsSchema,
  McqSimilarQuestionScheam,
  MCQSimilarQuizResponseSchema,
  OpenendedQuestionSchema,
  OpenEndedQuizResponseSchema,
  QuestionBankSchema,
  SharedRecordSchema,
  SubmitJobPayloadSchema,
  TrueFalseQuestionScheam,
  TrueFalseQuestionsSchema,
  UserProfileSchema,
};
