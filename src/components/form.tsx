"use client";
import { SelectSubscription } from "@/db/schema";
import { GenerateQBankPayload, uploadResume } from "@/utllities/apiFunctions";
import {
  Button,
  FileInput,
  Grid,
  NumberInput,
  rem,
  Select,
  Textarea,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import "@mantine/dropzone/styles.css";
import { useForm } from "@mantine/form";
import { IconFile3d, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import z from "zod";
import { PriceDetail } from "./criteria-form";
import { PrintIcon, ResetIcon, WithAnswersIcon } from "./icons";

const formObject = z
  .object({
    qType: z.enum([
      "mcq",
      "mcq_similar",
      "fill_blank",
      "true_false",
      "open_ended",
    ]),
    difficulty: z.enum(["easy", "medium", "hard"]),
    qCount: z.number().min(0).max(30),
    promptUrl: z.string().url().nullable(),
    prompt: z.string(),
    resumeUrl: z.string().url("Enter valid url").min(1, "Enter resume url"),
    resumeFile: z.instanceof(File) as z.ZodType<File | null>,
  })
  .refine((data) => !!data.resumeUrl || !!data.resumeFile, {
    message: "Either resumeUrl or resumeFile must be provided.",
    path: ["resumeUrl", "resumeFile"],
  });

export type FormObjectType = z.infer<typeof formObject>;

interface CriteriaFormProps {
  generateQuestions: (
    values: GenerateQBankPayload,
    qType: "GWA" | "GWOA",
    candidateName: string | null,
    resumeContent: boolean
  ) => void;
  isLoading: boolean;
  priceDetails: PriceDetail;
  subscription: SelectSubscription | undefined;
  printResult: (flag: boolean) => void;
  queryFinished: boolean;
}

function Form({
  generateQuestions,
  isLoading,
  subscription,
  printResult,
  priceDetails,
  queryFinished,
}: CriteriaFormProps) {
  const [queryType, setQueryType] = useState<"GWA" | "GWOA">("GWA");
  const [contentType, setContentType] = useState<"Resume" | "URL" | "Keyword">(
    "Keyword"
  );
  const { mutateAsync: uploadUserResume, isLoading: uploadingResume } =
    useMutation({
      mutationFn: async ({ file, url }: { file: File | null; url: string }) =>
        await uploadResume(url, file),
    });

  const form = useForm<FormObjectType>({
    mode: "controlled",
    initialValues: {
      qType: "mcq",
      difficulty: "easy",
      qCount: 10,
      promptUrl: "",
      prompt: "",
      resumeUrl: "",
      resumeFile: null,
    },
    validate: {
      qCount: (value) => {
        if (value < 0) {
          return "Invalid email";
        }
        if (subscription) {
          const { planId } = subscription;
          if (planId) {
            const { questionCount, label } = priceDetails[planId];
            if (label === "Integrated") {
              return null;
            }
            if (value > questionCount) {
              return "Invalid count";
            }
          }
        }
        return null;
      },
      promptUrl: (value) => {
        if (!value && !form.values.prompt && contentType !== "Resume") {
          return "URL field must be filled";
        }
        return null;
      },
      prompt: (value) => {
        if (!value && !form.values.promptUrl && contentType !== "Resume") {
          return "Keyword field must be filled";
        }
        return null;
      },
    },
  });

  const disableActionButton = useMemo(() => {
    if (subscription) {
      if (subscription.queries === 0) {
        return true;
      }
    }
    if (isLoading) {
      return true;
    }
    if (contentType === "Resume") {
      if (uploadingResume) return true;
      const { resumeUrl, resumeFile } = form.values;
      if (resumeUrl || resumeFile) return false;
      return true;
    } else if (contentType === "Keyword") {
      const { prompt } = form.values;
      if (prompt) return false;
      return true;
    } else if (contentType === "URL") {
      const { promptUrl } = form.values;
      if (promptUrl) return false;
      return true;
    }

    return false;
  }, [contentType, isLoading, subscription, uploadingResume, form]);

  const disableFields = useMemo(() => {
    if (subscription) {
      return subscription.queries === 0;
    }

    if (!subscription) return true;
    return false;
  }, [subscription]);

  async function handleSubmit(values: FormObjectType) {
    if (contentType === "Resume") {
      const { resumeFile, resumeUrl } = values;
      const uploadRes = await uploadUserResume({
        url: resumeUrl,
        file: resumeFile,
      });

      const {
        skills_and_experience: { experience_details, skills, experience_level },
        candidate_name,
      } = uploadRes;
      generateQuestions(
        {
          ...values,
          prompt: [...experience_details, experience_level, ...skills],
        },
        queryType,
        candidate_name ?? null,
        true
      );
    } else if (contentType === "URL") {
      generateQuestions(
        { ...values, prompt: [], promptUrl: values.promptUrl },
        queryType,
        null,
        false
      );
    } else {
      generateQuestions(
        { ...values, prompt: values.prompt ? [values.prompt] : [] },
        queryType,
        null,
        false
      );
    }
  }

  useEffect(() => {
    if (queryFinished) {
      form.reset();
    }
  }, [queryFinished, form]);

  return (
    <form
      onSubmit={form.onSubmit((values) => handleSubmit(values))}
      className="w-full"
    >
      <Grid p={"xs"} py={0}>
        <Grid.Col span={12}>
          <Select
            label="Content Type"
            placeholder="Pick a type"
            value={contentType}
            disabled={disableFields}
            onChange={(value) => {
              if (value) {
                setContentType(value as "Resume" | "URL" | "Keyword");
              }
            }}
            data={[
              { label: "Keyword", value: "Keyword" },
              { label: "URL", value: "URL" },
              { label: "Resume", value: "Resume" },
            ]}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Select
            label="Question Type"
            placeholder="Pick a type"
            disabled={disableFields}
            data={[
              { label: "Multiple Choice", value: "mcq" },
              { label: "Multiple Similar", value: "mcq_similar" },
              { label: "Fill blanks", value: "fill_blank" },
              { label: "True False", value: "true_false" },
              { label: "Short Answers", value: "open_ended" },
            ]}
            {...form.getInputProps("qType")}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Select
            size="xs"
            label="Difficulty"
            disabled={disableFields}
            placeholder="Pick a difficulty level"
            data={[
              { label: "Easy", value: "easy" },
              { label: "Medium", value: "medium" },
              { label: "Hard", value: "hard" },
            ]}
            {...form.getInputProps("difficulty")}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <NumberInput
            size="xs"
            label="# of Questions"
            disabled={disableFields}
            placeholder="eg: 10"
            {...form.getInputProps("qCount")}
            min={1}
            max={
              subscription && subscription.planId
                ? priceDetails[subscription.planId].label === "Integrated"
                  ? 30
                  : 10
                : 10
            }
          />
        </Grid.Col>
        {contentType === "URL" && (
          <Grid.Col span={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Textarea
              label="URL"
              placeholder="Content url goes here"
              rows={4}
              disabled={disableFields}
              {...form.getInputProps("promptUrl")}
              pt={5}
            />
          </Grid.Col>
        )}
        {contentType === "Keyword" && (
          <Grid.Col span={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Textarea
              label="Keyword"
              placeholder="Query keywords"
              disabled={disableFields}
              rows={4}
              {...form.getInputProps("prompt")}
            />
          </Grid.Col>
        )}
        {contentType === "Resume" && (
          <>
            <Grid.Col>
              <Textarea
                label="Resume URL"
                placeholder="Enter resume url"
                rows={2}
                {...form.getInputProps("resumeUrl")}
                key={form.key("resumeUrl")}
              />
            </Grid.Col>
            <Grid.Col>
              <FileInput
                label="Resume file"
                multiple={false}
                placeholder="Click to select file"
                leftSection={
                  <IconFile3d
                    style={{ width: rem(18), height: rem(18) }}
                    stroke={1.5}
                  />
                }
                rightSection={
                  form.values.resumeFile && (
                    <Tooltip label="Delete file">
                      <UnstyledButton
                        onClick={(event) => {
                          form.setFieldValue("resumeFile", null);
                        }}
                      >
                        <IconX
                          color="red"
                          style={{
                            width: rem(18),
                            height: rem(18),
                            cursor: "pointer",
                          }}
                        />
                      </UnstyledButton>
                    </Tooltip>
                  )
                }
                leftSectionPointerEvents="none"
                {...form.getInputProps("resumeFile")}
                onChange={(file) => {
                  if (file) {
                    form.setFieldValue("resumeFile", file);
                  }
                }}
              />
            </Grid.Col>
          </>
        )}
        <Grid.Col span={12}>
          <Button
            loading={(isLoading && queryType === "GWA") || uploadingResume}
            disabled={disableActionButton}
            fullWidth
            onClick={() => setQueryType("GWA")}
            type="submit"
            leftSection={<WithAnswersIcon />}
          >
            Generate questions
          </Button>
        </Grid.Col>
        <Grid.Col span={12}>
          <Button
            fullWidth
            disabled={disableActionButton}
            onClick={() => printResult(true)}
            leftSection={<PrintIcon />}
          >
            Print all questions
          </Button>
        </Grid.Col>
        <Grid.Col span={12}>
          <Button
            fullWidth
            type="reset"
            onClick={(e) => {
              form.reset();
            }}
            disabled={disableActionButton}
            leftSection={<ResetIcon />}
          >
            Reset
          </Button>
        </Grid.Col>
      </Grid>
    </form>
  );
}

export { Form };
