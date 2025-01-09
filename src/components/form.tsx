"use client";
import { trpc } from "@/app/_trpc/client";
import { SelectSubscription } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  GenerateQuestionsPayload,
  pollGeneratedResult,
} from "@/utllities/apiFunctions";
import { encodeFileToBase64 } from "@/utllities/helpers";
import {
  Button,
  FileInput,
  Flex,
  Grid,
  NumberInput,
  rem,
  ScrollArea,
  Select,
  Text,
  Textarea,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconFile3d, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import z from "zod";
import { PriceDetail } from "./criteria-form";
import { ResetIcon, WithAnswersIcon } from "./icons";
import { AlertModal } from "./modals/alert-modal";
import { roles } from "./user-profile";

export const formObject = z
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
    keyword: z.string(),
    resumeUrl: z.string().url({ message: "Enter resume url" }),
    resumeFile: z.instanceof(File) as z.ZodType<File | null>,
    courseUrl: z.string().url({ message: "Enter course url" }),
    courseFile: z.instanceof(File) as z.ZodType<File | null>,
    instructions: z.string(),
    outputType: z.enum(["question", "summary", "guidance"]),
    careerGoal: z.string(),
    experienceLevel: z.string(),
    geography: z.string(),
    bDay: z.string(),
  })
  .refine((data) => !!data.resumeUrl || !!data.resumeFile, {
    message: "Either resumeUrl or resumeFile must be provided.",
    path: ["resumeUrl", "resumeFile"],
  })
  .refine((data) => !!data.courseUrl || !!data.courseFile, {
    message: "Either course url or course file must be provided.",
    path: ["courseFile", "courseUrl"],
  });

export type FormSchema = z.infer<typeof formObject>;

interface CriteriaFormProps {
  priceDetails: PriceDetail;
  subscription: SelectSubscription | undefined;
  userId: string;
}

function Form({ subscription, userId, priceDetails }: CriteriaFormProps) {
  const [contentType, setContentType] = useState<
    "Resume" | "Courses" | "Keywords"
  >("Keywords");
  const userProfile = useAppStore((state) => state.userProfile);
  const updateQuestionsList = useAppStore((state) => state.updateQuestionsList);
  const theme = useMantineTheme();
  const [attempt, setAttempt] = useState(0);

  const { mutateAsync: generateQuestions, isLoading: isGenerating } =
    trpc.generateQuestions.useMutation();
  const { mutateAsync: addQBankRecord } =
    trpc.addQuestionBankRecord.useMutation();

  const [
    showPendingAlert,
    { close: closePendingAlert, open: openPendingAlert },
  ] = useDisclosure();
  const { mutateAsync: fetchGenerationResult } = useMutation({
    mutationFn: pollGeneratedResult,
  });

  const form = useForm<FormSchema>({
    mode: "controlled",
    initialValues: {
      qType: "mcq",
      difficulty: "easy",
      qCount: 10,
      keyword: "",
      resumeUrl: "",
      resumeFile: null,
      courseFile: null,
      courseUrl: "",
      outputType: "question",
      instructions: "",
      careerGoal: "",
      bDay: "",
      experienceLevel: "",
      geography: "",
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
      resumeFile: (value) => {
        if (contentType === "Resume") {
          const { resumeUrl } = form.values;

          if (!value && !resumeUrl)
            return "Either provide resume url or resume file";
        }
        return null;
      },
      resumeUrl: (value) => {
        if (contentType === "Resume") {
          const { resumeFile } = form.values;

          if (!value && !resumeFile)
            return "Either provide resume url or resume file";
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

    if (!attempt) return false;

    if (isGenerating) return true;

    const { keyword, resumeFile, resumeUrl, courseFile, courseUrl } =
      form.values;

    switch (contentType) {
      case "Keywords": {
        if (!keyword) {
          return true;
        }
        return false;
      }
      case "Courses": {
        if (!courseFile && !courseUrl) {
          return true;
        }
        return false;
      }
      case "Resume": {
        if (!resumeFile && !resumeUrl) {
          return true;
        }
        return false;
      }
      default:
        break;
    }

    return false;
  }, [subscription, isGenerating, form, contentType, attempt]);

  const disableFields = useMemo(() => {
    if (subscription) {
      return subscription.queries === 0;
    }

    if (!subscription) return true;
    return false;
  }, [subscription]);

  async function handleSubmit(values: FormSchema) {
    const {
      instructions,
      resumeFile,
      resumeUrl,
      courseFile,
      courseUrl,
      outputType,
      qCount,
      qType,
      difficulty,
      keyword,
      bDay,
      careerGoal,
      experienceLevel,
      geography,
    } = values;
    const payload: GenerateQuestionsPayload = {
      instructions: instructions,
      experience_level: experienceLevel,
      language: "",
      actor: "",
      resume: "",
      courses: "",
      keywords: "",
      output_type: outputType,
      no_of_questions: qCount,
      question_type: qType,
      question_difficulty: difficulty,
      career_goal: "",
      geography: "",
      b_day: bDay,
    };

    if (outputType !== "question") {
      payload.no_of_questions = 0;
      payload.question_type = "";
      payload.question_difficulty = "";
    }

    if (userProfile) {
      const { role, language } = userProfile;
      payload.actor = roles[role];
      payload.language = language;
    }

    if (outputType !== "question") {
      payload.career_goal = careerGoal;
      payload.geography = geography;
    }

    if (contentType === "Resume") {
      if (resumeFile && !resumeUrl) {
        const b64 = await encodeFileToBase64(resumeFile);
        payload.resume = b64;
      } else if (!resumeFile && resumeUrl) {
        payload.resume = resumeUrl;
      }
    } else if (contentType === "Courses") {
      if (courseFile && !courseUrl) {
        const b64 = await encodeFileToBase64(courseFile);
        payload.courses = b64;
      } else if (!courseFile && courseUrl) {
        payload.courses = courseUrl;
      }
    } else {
      payload.keywords = keyword.split(" ").join(",");
    }
    if (!userProfile) return;
    const { job_id } = await generateQuestions(
      {
        payload: { ...payload },
        contentType,
        userId: userProfile.id,
      },
      {
        onSettled: () => {
          setAttempt(1);
          form.reset();
        },
      }
    );
    await fetchGenerationResult(
      {
        jobId: job_id,
        difficulty,
        keyword,
        outputType,
        qCount,
        questionType: qType,
        userId,
        contentType,
      },
      {
        onSettled: async (settledResult, error) => {
          if (error) {
            if ((error as any) === "TIMEOUT") {
              openPendingAlert();
              const closeInterval = setInterval(() => {
                closePendingAlert();
                clearInterval(closeInterval);
              }, 2000);
            }
          }
          if (settledResult) {
            const { code, data } = settledResult;
            if (code !== "PENDING") {
              if (userProfile) {
                if (data) {
                  const { code, data: record } = await addQBankRecord({
                    data: {
                      difficulty,
                      jobId: job_id,
                      keyword,
                      outputType,
                      qCount,
                      questionType: qType,
                      userId,
                      instituteName: userProfile.instituteName,
                      result: data,
                      contentType,
                    },
                  });

                  if (code === "SUCCESS") {
                    if (record)
                      updateQuestionsList({ [record.jobId]: { ...record } });
                  }
                }
              }
            }
          }
        },
        onError: (err) => {
          if ((err as any) === "TIMEOUT") {
            openPendingAlert();
            const closeInterval = setInterval(() => {
              closePendingAlert();
              clearInterval(closeInterval);
            }, 2000);
          }
        },
      }
    );
  }

  return (
    <>
      <ScrollArea
        w={"100%"}
        h={"100%"}
        styles={{
          viewport: {
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <form
          onSubmit={form.onSubmit((values) => handleSubmit(values))}
          className="w-full"
        >
          <Grid p={"xs"} py={0} gutter={{ xs: "xs", md: "sm" }}>
            <Grid.Col span={6}>
              <Select
                label="Content Type"
                placeholder="Pick a type"
                value={contentType}
                disabled={disableFields}
                onChange={(value) => {
                  if (value) {
                    setContentType(value as "Resume" | "Courses" | "Keywords");
                  }
                }}
                data={[
                  { label: "Keywords", value: "Keywords" },
                  { label: "Courses", value: "Courses" },
                  { label: "Resume", value: "Resume" },
                ]}
              />
            </Grid.Col>
            {form.values.outputType === "question" && (
              <Grid.Col span={6}>
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
            )}
            <Grid.Col span={6}>
              <Select
                label="Output Type"
                placeholder="Pick an output type"
                disabled={disableFields}
                data={[
                  { label: "Question Bank", value: "question" },
                  { label: "Guidance", value: "guidance" },
                  { label: "Summary", value: "summary" },
                ]}
                {...form.getInputProps("outputType")}
              />
            </Grid.Col>
            {form.values.outputType === "question" && (
              <Grid.Col span={6}>
                <Select
                  label="Difficulty"
                  styles={{
                    label: {
                      fontSize: theme.fontSizes.sm,
                    },
                  }}
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
            )}
            {form.values.outputType === "question" && (
              <Grid.Col span={6}>
                <NumberInput
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
            )}
            {form.values.outputType !== "question" &&
              contentType === "Resume" && (
                <Grid.Col span={6}>
                  <DatePickerInput
                    label="Pick DOB"
                    placeholder="Pick DOB"
                    {...form.getInputProps("bDay")}
                    defaultDate={new Date()}
                    valueFormat="MM-DD-YYYY"
                  />
                </Grid.Col>
              )}
            {contentType === "Courses" && (
              <>
                <Grid.Col span={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                  <Textarea
                    label={
                      <Flex
                        direction={"row"}
                        w={"100%"}
                        gap={"sm"}
                        align={"center"}
                      >
                        <Text size="xs" fw={"bold"}>
                          URL
                        </Text>
                        <Tooltip
                          withArrow
                          label="Can only access public URLs that don't require any login. If using a Google Doc, it must be unrestricted. If the document is larger that will take longer time."
                        >
                          <IconInfoCircle width={20} height={20} />
                        </Tooltip>
                      </Flex>
                    }
                    placeholder="Content url goes here"
                    rows={2}
                    disabled={disableFields}
                    {...form.getInputProps("courseUrl")}
                    pt={5}
                    styles={{
                      label: {
                        fontSize: theme.fontSizes.xs,
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col>
                  <FileInput
                    label="Course file"
                    multiple={false}
                    placeholder="Click to select file"
                    leftSection={
                      <IconFile3d
                        style={{ width: rem(18), height: rem(18) }}
                        stroke={1.5}
                      />
                    }
                    styles={{
                      input: {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: 300,
                      },
                    }}
                    rightSection={
                      form.values.courseFile && (
                        <Tooltip label="Delete file">
                          <UnstyledButton
                            onClick={(event) => {
                              form.setFieldValue("courseFile", null);
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
                    {...form.getInputProps("courseFile")}
                    onChange={(file) => {
                      if (file) {
                        form.setFieldValue("courseFile", file);
                      }
                    }}
                  />
                </Grid.Col>
              </>
            )}
            {contentType === "Keywords" && (
              <Grid.Col span={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <Textarea
                  label="Keyword"
                  placeholder="Query keywords"
                  disabled={disableFields}
                  rows={2}
                  {...form.getInputProps("keyword")}
                />
              </Grid.Col>
            )}
            {contentType === "Resume" && (
              <>
                <Grid.Col>
                  <Textarea
                    label={
                      <Flex
                        direction={"row"}
                        w={"100%"}
                        gap={"sm"}
                        align={"center"}
                      >
                        <Text size="xs" fw={"bold"}>
                          Resume URL
                        </Text>
                        <Tooltip
                          withArrow
                          label="Can only access public URLs that don't require any login. If using a Google Doc, it must be unrestricted. LinkedIn cannot be used. "
                        >
                          <IconInfoCircle width={20} height={20} />
                        </Tooltip>
                      </Flex>
                    }
                    placeholder="Enter resume url"
                    rows={2}
                    {...form.getInputProps("resumeUrl")}
                    key={form.key("resumeUrl")}
                    disabled={form.values.resumeFile ? true : false}
                    styles={{
                      label: {
                        fontSize: theme.fontSizes.xs,
                      },
                    }}
                  />
                </Grid.Col>
                <Grid.Col>
                  <FileInput
                    label="Resume file"
                    multiple={false}
                    disabled={form.values.resumeUrl ? true : false}
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
                    styles={{
                      input: {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: 300,
                      },
                    }}
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
            {form.values.outputType !== "question" && (
              <>
                <Grid.Col span={12}>
                  <Textarea
                    label="Career Goal"
                    placeholder="Write your career goals"
                    disabled={disableFields}
                    rows={2}
                    {...form.getInputProps("careerGoal")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Geography"
                    placeholder=""
                    disabled={disableFields}
                    rows={2}
                    {...form.getInputProps("geography")}
                  />
                </Grid.Col>
              </>
            )}
            <Grid.Col span={12}>
              <Textarea
                label="Instructions"
                placeholder="Write your instructions"
                disabled={disableFields}
                rows={2}
                {...form.getInputProps("instructions")}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Button
                loading={isGenerating}
                disabled={disableActionButton}
                fullWidth
                type="submit"
                leftSection={<WithAnswersIcon />}
              >
                Generate questions
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
      </ScrollArea>
      <AlertModal
        showCloseButton={false}
        message="Result generation in progress. W'll notify when it's done"
        open={showPendingAlert}
        title="Result generation"
        close={() => {}}
      />
    </>
  );
}

export { Form };
