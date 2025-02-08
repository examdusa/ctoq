import dayjs from "dayjs";
import { z } from "zod";
import { baseResultSchema } from "./zod-schemas-types";

const updateQBankRecordScheam = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
  jobId: z.string(),
  keyword: z.string(),
  outputType: z.enum(["question", "summary", "guidance"]),
  qCount: z.number(),
  questionType: z.enum([
    "mcq",
    "mcq_similar",
    "fill_blank",
    "true_false",
    "open_ended",
  ]),
  userId: z.string(),
  result: baseResultSchema,
  instituteName: z.string(),
  contentType: z.string(),
});

function generateAsciiCharFromNumber(number: number) {
  return String.fromCharCode(65 + number);
}

function dateFormatter(date: Date) {
  return dayjs(date).tz(dayjs.tz.guess()).format("MM-DD-YYYY | hh:mm a");
}

function encodeFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]); // Extract Base64 part
      } else {
        reject(new Error("FileReader result is not a string."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file."));
    };

    reader.readAsDataURL(file); // Read file as Data URL
  });
}

const extractHeadingFromMarkdown = (markdown: string) => {
  const match = markdown.match(/^#\s.+?\n([\s\S]*?)^##/m);
  if (match && match[0]) {
    return match[0].trim().replace(/[#*`>_-]/g, '').trim();
  }
  return null;
};

function calculateAmountAfterDiscount(amount: number, discountPercentage: number) {
  const discountValue = (amount * discountPercentage) / 100

  return parseInt((amount - discountValue).toFixed(2))
}



export {
  dateFormatter,
  encodeFileToBase64,
  generateAsciiCharFromNumber,
  updateQBankRecordScheam,
  extractHeadingFromMarkdown,
  calculateAmountAfterDiscount
};
