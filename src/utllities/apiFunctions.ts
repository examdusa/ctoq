import { GoogleQuizPayloadSchema } from "@/components/modals/google-quiz-modal";
import z from "zod";
import {
  fillBlankQuizResponseSchema,
  FillBlankQuizResponseSchema,
  GoogleDocSchema,
  Institutes,
  institutesListSchema,
  mcqQuestionsSchema,
  MCQQuestionsSchema,
  mcqSimilarQuestionSchema,
  MCQSimilarQuizResponseSchema,
  openEndedQuestionsSchema,
  OpenEndedQuizResponseSchema,
  TrueFalseQuestionsSchema,
} from "./zod-schemas-types";

export const questionSchema = z.object({
  question: z.string(),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }),
  answer: z.enum(["A", "B", "C", "D"]),
});

export const paymentIntentResponseSchema = z.object({
  sessionId: z.string(),
});

// export const promptResponseSchema = z.object({
//   input: z.string(),
//   code: z.number(),
//   quiz_type: z.string(),
//   questions: z.array(questionSchema),
// });

// export const GeneratedQuestions = z.object({
//   prompt_responses: z.array(promptResponseSchema),
//   url_responses: z.array(promptResponseSchema),
// });

// export const GeneratedQuestionsResponse = z.object({
//   data: GeneratedQuestions,
//   timestamp: z.string(),
//   session: z.string(),
//   id: z.string(),
// });

const skillsExperienceSchema = z.object({
  experience_details: z.array(z.string()).or(z.string()),
  experience_level: z.string(),
  skills: z.array(z.string()),
});

const uploadResumeResponse = z.object({
  call_back_url: z.string().url(),
  candidate_name: z.string(),
  difficulty_level: z.enum(["easy", "medium", "hard"]),
  number_of_questions: z.number().int().positive(),
  prompts: z.array(z.string()),
  quiz_type: z.string(),
  skills_and_experience: skillsExperienceSchema,
  urls: z.array(z.string().url()),
});

export const unifiedSchema = z.object({
  action: z.string(),
  userName: z.string(),
  instituteName: z.string(),
  courseName: z.string(),
  quizName: z.string(),
  proctorCode: z.string(),
  userFirstName: z.string(),
  userLastName: z.string(),
  userEmail: z.string().email({ message: "Enter a valid email address" }),
  quizDetails: z.object({
    quizType: z.string(),
    quizContentFile: z.string(),
    quizTime: z
      .number()
      .int()
      .nonnegative({ message: "Time must be non-negative" }),
    quizQuestionCount: z
      .number()
      .int()
      .nonnegative({ message: "Count must be non-negative" }),
  }),
  assignmentDetails: z.object({
    assignId: z.string(),
    assignName: z.string(),
  }),
  quizOverrideDetails: z.object({
    prompt1: z.string(),
    prompt2: z.string(),
    prompt3: z.string(),
    quizFileName: z.string(),
    extraTime: z.string(),
  }),
  userDetails: z.object({
    userPassword: z.string(),
  }),
  instructorId: z.string(),
});

export const userAccessDetails = z.object({
  idAccess: z.string(),
  guid: z.string(),
  userId: z.string(),
  instructorId: z
    .number()
    .int()
    .nonnegative({ message: "Must be a non-negative integer" }),
  instituteId: z
    .number()
    .int()
    .nonnegative({ message: "Must be a non-negative integer" }),
  accessType: z.string(),
  status: z.string(),
  aiQuiz: z.string(),
  aiWithReport: z.string(),
  liveLaunch: z.string(),
  liveProctor: z.string(),
  lockdownBrowser: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email({ message: "Must be a valid email address" }),
  userType: z.string(),
});

export const userAccessDetailsList = z.array(userAccessDetails);

export interface GenerateQBankPayload {
  qType: "mcq" | "mcq_similar" | "fill_blank" | "true_false" | "open_ended";
  difficulty: "easy" | "medium" | "hard";
  qCount: number;
  promptUrl: string | null;
  prompt: string;
}

const generateQuestionsPayload = z.object({
  language: z.string().default("English"),
  actor: z.string(),
  resume: z.string(),
  courses: z.string(),
  keywords: z.string(),
  output_type: z.enum(["question", "summary", "guidance"]),
  no_of_questions: z.number().int().min(0).default(0), // Ensure non-negative integer
  question_type: z
    .enum(["mcq", "mcq_similar", "fill_blank", "true_false", "open_ended"])
    .or(z.string()),
  question_difficulty: z.enum(["easy", "medium", "hard"]).or(z.string()),
  instructions: z.string(),
  career_goal: z.string(),
  experience_level: z.string(),
  geography: z.string(),
  b_day: z.string(),
});

export type UploadResponseSchema = z.infer<typeof uploadResumeResponse>;
export type GenerateQuestionsPayload = z.infer<typeof generateQuestionsPayload>;
export type PaymentIntentResponseSchemaType = z.infer<
  typeof paymentIntentResponseSchema
>;
// export type GeneratedQuestionsResponse = z.infer<
//   typeof GeneratedQuestionsResponse
// >;
// export type GeneratedQuestionsSchema = z.infer<typeof promptResponseSchema>;
// export type QuestionSchema = z.infer<typeof questionSchema>;

export type UploadResumeResponse = z.infer<typeof uploadResumeResponse>;
export type UnifiedSchema = z.infer<typeof unifiedSchema>;
export type UserAccessDetails = z.infer<typeof userAccessDetails>;
export type UserAccessDetailsList = z.infer<typeof userAccessDetailsList>;

async function generateQuestionBank(payload: GenerateQuestionsPayload) {
  try {
    const respStr = await fetch(
      "https://augmentbyai.com/response_generator/response_generator",
      {
        method: "POST",
        body: JSON.stringify({ ...payload }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const response = await respStr.json();
    return response;
  } catch (err) {
    throw err;
  }
}

async function fetchGeneratedQuestions(
  refId: string,
  qType: "mcq" | "mcq_similar" | "fill_blank" | "true_false" | "open_ended"
): Promise<
  | MCQQuestionsSchema
  | FillBlankQuizResponseSchema
  | MCQSimilarQuizResponseSchema
  | OpenEndedQuizResponseSchema
  | TrueFalseQuestionsSchema
> {
  try {
    const respStr = await fetch(
      `https://augmentbyai.com/job_status/job_status/${refId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const response = await respStr.json();
    const { data } = response;
    const parsedData = JSON.parse(data);
    switch (qType) {
      case "fill_blank": {
        const {
          data: validatedData,
          success,
          error,
        } = fillBlankQuizResponseSchema.safeParse(parsedData);
        if (success) {
          return validatedData;
        }
      }
      case "mcq_similar": {
        const { data: validatedData, success } =
          mcqSimilarQuestionSchema.safeParse(parsedData);
        if (success) {
          return validatedData as MCQSimilarQuizResponseSchema;
        }
        break;
      }
      case "open_ended": {
        const { data: validatedData, success } =
          openEndedQuestionsSchema.safeParse(parsedData);
        if (success) {
          return validatedData;
        }
        break;
      }
      // case "true_false": {
      //   const {
      //     data: validatedData,
      //     success,
      //     error,
      //   } = trueFalseQuestionsSchema.safeParse(parsedData);
      //   if (error) {
      //     console.log("fetch questions [error]: ", error);
      //   }
      //   if (success) {
      //     return validatedData;
      //   }
      //   break;
      // }
      case "mcq": {
        const { data: validatedData, success } =
          mcqQuestionsSchema.safeParse(parsedData);
        if (success) {
          return validatedData as MCQQuestionsSchema;
        }
      }
    }

    throw new Error("DATA_VALIDATION_FAILED");
  } catch (err) {
    throw err;
  }
}

async function createCheckoutSession(
  priceId: string,
  email: string,
  userId: string,
  prdtName: string
): Promise<PaymentIntentResponseSchemaType> {
  try {
    const respStr = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: priceId,
        email: email,
        userId: userId,
        prdtName: prdtName,
      }),
    });
    const parsedResponse: PaymentIntentResponseSchemaType =
      await respStr.json();
    return parsedResponse;
  } catch (err) {
    throw err;
  }
}

async function uploadResume(
  url: string,
  file: File | null
): Promise<UploadResponseSchema> {
  try {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("url", url);
    const response = await fetch("https://examd.us/llmresume/upload", {
      method: "POST",
      body: formData,
    });
    const jsonRes = await response.json();
    const { success } = uploadResumeResponse.safeParse(jsonRes);

    if (success) {
      return jsonRes;
    }

    throw new Error("URL_RESP_VALIDATION_ERROR");
  } catch (err) {
    throw err;
  }
}

async function createGoogleQuizForm(
  payload: GoogleQuizPayloadSchema
): Promise<string> {
  try {
    const response = await fetch(
      "https://autoproctor.com/canvaslms/api/v1/google-form/create",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );
    const parsedRes = await response.text();
    return parsedRes;
  } catch (err) {
    throw err;
  }
}

async function createGoogleDoc(payload: GoogleDocSchema): Promise<string> {
  try {
    const response = await fetch(
      "https://autoproctor.com/canvaslms/api/v1/google-doc",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );
    const parsedRes: { message: string; responseStatus: string; code: number } =
      await response.json();
    return parsedRes.message;
  } catch (err) {
    throw err;
  }
}

async function getInstitutes(): Promise<Institutes> {
  try {
    const response = await fetch(
      "https://examd.ai/canvaslms/api/v1/canvas-institute-details"
    );
    const jsonRes = await response.json();

    const { success, error, data } = institutesListSchema.safeParse(jsonRes);

    if (success) {
      return data;
    }

    throw error;
  } catch (err) {
    throw err;
  }
}

async function postUnifiedData(payload: UnifiedSchema) {
  try {
    const response = await fetch(
      "https://examd.ai/canvaslms/api/v1/lti-canvas-unified/STUDENT_UNIFIED",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const jsonRes = await response.json();

    return jsonRes;
  } catch (err) {
    throw err;
  }
}

async function getProfileDetailsByGuidUserId(
  guid: string,
  userId: string
): Promise<UserAccessDetails | null> {
  try {
    const response = await fetch(
      `https://examd.ai/canvaslms/api/v1/lti-access-guid-user-id/${guid}/${userId}`,
      {
        method: "GET",
      }
    );
    const jsonRes: UserAccessDetailsList = await response.json();

    if (jsonRes.length === 0) {
      return null;
    }

    const { success } = userAccessDetailsList.safeParse(jsonRes);

    if (success) {
      return jsonRes[0];
    }
    throw new Error("INVALID_DATA");
  } catch (err) {
    throw err;
  }
}

async function testFunction(jobId: string) {
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
  } catch (err) {
    console.log(err);
  }
}

export {
  createCheckoutSession,
  createGoogleDoc,
  createGoogleQuizForm,
  fetchGeneratedQuestions,
  generateQuestionBank,
  getInstitutes,
  getProfileDetailsByGuidUserId,
  postUnifiedData,
  uploadResume,
  testFunction
};
