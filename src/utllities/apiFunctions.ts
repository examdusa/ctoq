import { GoogleQuizPayloadSchema } from "@/components/modals/google-quiz-modal";
import z from "zod";

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

export const promptResponseSchema = z.object({
  input: z.string(),
  code: z.number(),
  quiz_type: z.string(),
  questions: z.array(questionSchema),
});

export const GeneratedQuestions = z.object({
  prompt_responses: z.array(promptResponseSchema),
  url_responses: z.array(promptResponseSchema),
});

export const GeneratedQuestionsResponse = z.object({
  data: GeneratedQuestions,
  timestamp: z.string(),
  session: z.string(),
  id: z.string(),
});

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

export interface GenerateQBankPayload {
  qType: "mcq" | "mcq_similar" | "fill_blank" | "true_false" | "open_ended";
  difficulty: "easy" | "medium" | "hard";
  qCount: number;
  promptUrl: string | null;
  prompt: string[];
}

export type UploadResponseSchema = z.infer<typeof uploadResumeResponse>;

export type PaymentIntentResponseSchemaType = z.infer<
  typeof paymentIntentResponseSchema
>;
export type GeneratedQuestionsResponse = z.infer<
  typeof GeneratedQuestionsResponse
>;
export type GeneratedQuestionsSchema = z.infer<typeof promptResponseSchema>;
export type QuestionSchema = z.infer<typeof questionSchema>;

export type UploadResumeResponse = z.infer<typeof uploadResumeResponse>;

async function generateQuestionBank({
  qCount,
  difficulty,
  prompt,
  qType,
  promptUrl,
}: GenerateQBankPayload) {
  try {
    const respStr = await fetch(
      "https://examd.us/llmreader/api/questions/callllm",
      {
        method: "POST",
        body: JSON.stringify({
          quiz_type: qType,
          difficulty_level: difficulty,
          number_of_questions: qCount,
          prompts: prompt,
          urls: !promptUrl ? [] : [promptUrl],
          call_back_url: "https://examd.us/llmreader/api/questions/post",
        }),
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
  refId: string
): Promise<GeneratedQuestionsResponse> {
  try {
    const respStr = await fetch(
      `https://examd.us/llmreader/api/questions/getresponse/${refId}`,
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
    const structuredData = { ...response, data: parsedData };
    const { data: validatedData, success } =
      GeneratedQuestionsResponse.safeParse(structuredData);

    if (success) {
      return validatedData;
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

async function createGoogleQuizForm(payload: GoogleQuizPayloadSchema):Promise<string> {
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

export {
  createCheckoutSession,
  createGoogleQuizForm,
  fetchGeneratedQuestions,
  generateQuestionBank,
  uploadResume
};

