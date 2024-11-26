import { FormObjectType } from "@/components/criteria-form";
import { FileWithPath } from "@mantine/dropzone";
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
  quiz_type: z.enum(["mcq", "true/false"]),
  questions: z.array(questionSchema),
});

export const qBankSchema = z.object({
  prompt_responses: z.array(promptResponseSchema),
  url_responses: z.array(z.any()), // Assuming `url_responses` can hold various types, modify if necessary
});

const uploadResponseSchema = z.object({
  call_back_url: z.string().url(),
  difficulty_level: z.string(),
  number_of_questions: z.number().int(),
  prompts: z.array(z.string()),
  quiz_type: z.string(),
  skills_and_experience: z.object({
    experience_details: z.array(z.string()),
    experience_level: z.string(),
    skills: z.array(z.string()),
  }),
  urls: z.array(z.string().url()),
});

export type UploadResponseSchema = z.infer<typeof uploadResponseSchema>;

export type PaymentIntentResponseSchemaType = z.infer<
  typeof paymentIntentResponseSchema
>;
export type QBankSchemaType = z.infer<typeof qBankSchema>;
export type GeneratedQuestionsSchema = z.infer<typeof promptResponseSchema>;
export type QuestionSchema = z.infer<typeof questionSchema>;

async function generateQuestionBank({
  qCount,
  difficulty,
  prompt,
  qType,
  promptUrl,
}: FormObjectType) {
  try {
    const respStr = await fetch(
      "https://examd.us/llmreader/api/questions/callllm",
      {
        method: "POST",
        body: JSON.stringify({
          quiz_type: qType,
          difficulty_level: difficulty,
          number_of_questions: qCount,
          prompts: !prompt ? [] : [prompt],
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

async function fetchGeneratedQuestions(): Promise<QBankSchemaType | null> {
  try {
    const respStr = await fetch(
      "https://examd.us/llmreader/api/questions/getresponse",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const response = await respStr.json();
    const validationResult = qBankSchema.safeParse(response);

    if (validationResult.success) {
      return validationResult.data;
    } else {
      console.error("Validation failed:", validationResult.error);
      return null;
    }
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

async function uploadResume(file: FileWithPath): Promise<UploadResponseSchema> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("https://examd.us/llmresume/upload", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });
    const jsonRes = await response.json();
    const parsedRes = uploadResponseSchema.parse(jsonRes);
    return parsedRes;
  } catch (err) {
    throw err;
  }
}

export {
  createCheckoutSession,
  fetchGeneratedQuestions,
  generateQuestionBank,
  uploadResume,
};
