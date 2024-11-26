"use client";
import { SelectSubscription } from "@/db/schema";
import { uploadResume } from "@/utllities/apiFunctions";
import {
  Alert,
  Badge,
  Button,
  Flex,
  Grid,
  Group,
  List,
  LoadingOverlay,
  NumberInput,
  rem,
  Select,
  Text,
  Textarea,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";
import { useForm } from "@mantine/form";
import {
  IconFileDescription,
  IconInfoCircle,
  IconLockAccess,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import z from "zod";

const formObject = z.object({
  qType: z.enum(["mcq"]),
  difficulty: z.enum(["easy"]),
  qCount: z.number().min(0).max(30),
  promptUrl: z.string().url().nullable(),
  prompt: z.string().nullable(),
  resume: z.instanceof(File) as z.ZodType<FileWithPath | null>,
});

export type FormObjectType = z.infer<typeof formObject>;

interface CriteriaFormProps {
  generateQuestions: (values: FormObjectType, qType: "GWA" | "GWOA") => void;
  isLoading: boolean;
  subscription: SelectSubscription | undefined;
  printResult: (flag: boolean) => void;
}

interface PriceDetail {
  [key: string]: {
    amount: number;
    label: string;
    queries: number;
    questionCount: number;
    features: string[];
  };
}

const priceList: PriceDetail = {
  price_1QGNbZBpYrMQUMR14RX1iZVQ: {
    amount: 0,
    label: "Starter",
    queries: 4,
    questionCount: 10,
    features: ["Generate 4 question set of 10 question each per month"],
  },
  price_1QH7gtBpYrMQUMR1GNUV8E6W: {
    amount: 4999,
    label: "Premium",
    queries: 200,
    questionCount: 30,
    features: ["200 sets of question for up to 30 questions per month"],
  },
  price_1QKM8OBpYrMQUMR17Lk1ZR7D: {
    amount: 9999,
    label: "Integrated",
    queries: -1,
    questionCount: -1,
    features: ["Generate unlimited sets of question each month"],
  },
};

const imageMimeTypes = ["application/pdf"];

function CriteriaForm({
  generateQuestions,
  isLoading,
  subscription,
  printResult,
}: CriteriaFormProps) {
  const theme = useMantineTheme();
  const colorScheme = useMantineColorScheme();
  const [queryType, setQueryType] = useState<"GWA" | "GWOA">("GWA");
  const [contentType, setContentType] = useState<"Resume" | "URL" | "Keyword">(
    "Keyword"
  );
  const { mutateAsync: uploadResumeFile, isLoading: uploadingResume } =
    useMutation({
      mutationFn: uploadResume,
    });

  const { queries, features } = useMemo(() => {
    if (subscription && subscription.planId) {
      const { queries, features } = priceList[subscription.planId];
      return { queries, features };
    }
    return { queries: null, features: null };
  }, [subscription]);

  const form = useForm<FormObjectType>({
    mode: "controlled",
    initialValues: {
      qType: "mcq",
      difficulty: "easy",
      qCount: 10,
      promptUrl: "",
      prompt: "",
      resume: null,
    },
    validate: {
      qCount: (value) => {
        if (value < 0) {
          return "Invalid email";
        }
        if (subscription) {
          const { planId } = subscription;
          if (planId) {
            const { questionCount, label } = priceList[planId];
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
      resume: (value) => {
        if (contentType === "Resume" && !value) {
          return "Please select a file";
        }
        return null;
      },
    },
  });

  const disableActionButton = useMemo(() => {
    if (subscription) {
      return subscription.queries === 0;
    }
    if (contentType === "Resume") {
      if (uploadingResume) return true;
      const { resume } = form.getValues();
      if (resume) return false;
      return true;
    }

    if (isLoading) {
      return true;
    }
    return false;
  }, [contentType, isLoading, subscription, form, uploadingResume]);

  const fileName = useMemo(() => {
    if (contentType === "Resume") {
      const { resume } = form.getValues();
      if (resume) {
        return resume.name;
      }
      return "N/A";
    }
  }, [contentType, form]);

  const disableFields = useMemo(() => {
    if (subscription) {
      return !subscription.queries;
    }
    return false;
  }, [subscription]);

  const isFileSelected = useMemo(() => {
    const { resume } = form.getValues();
    return contentType === "Resume" && resume ? true : false;
  }, [form, contentType]);

  async function handleSubmit(values: FormObjectType) {
    if (contentType === "Resume") {
      if (values.resume) {
        await uploadResumeFile(values.resume, {
          onSuccess: (data) => {},
          onError: (err) => {
            console.error("UPLOAD_RESUME_ERROR: ", err);
          },
        });
      }
    } else {
      generateQuestions(values, queryType);
    }
  }

  return (
    <Flex
      w={"100%"}
      direction={"column"}
      gap={"sm"}
      maw={{ md: "25%", lg: "30%", xl: "30%" }}
      className="rounded-md"
      pos={"sticky"}
      my={"xs"}
      p={0}
      styles={{
        root: {
          border: `1.5px solid ${
            colorScheme.colorScheme !== "dark"
              ? theme.colors.gray[3]
              : theme.colors.gray[8]
          }`,
          boxShadow: theme.shadows.md,
          padding: 10,
          flexGrow: 1,
        },
      }}
    >
      <form
        onSubmit={form.onSubmit((values) => handleSubmit(values))}
        className="w-full"
      >
        <LoadingOverlay
          visible={!subscription}
          loaderProps={{ children: <IconLockAccess width={50} height={50} /> }}
        />
        <Grid p={"xs"}>
          <Grid.Col span={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
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
          <Grid.Col span={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Select
              label="Question Type"
              placeholder="Pick a type"
              key={form.key("qType")}
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
          <Grid.Col span={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Select
              size="xs"
              label="Difficulty"
              disabled={disableFields}
              placeholder="Pick a difficulty level"
              key={form.key("difficulty")}
              data={[
                { label: "Easy", value: "easy" },
                { label: "Medium", value: "medium" },
                { label: "Hard", value: "hard" },
              ]}
              {...form.getInputProps("difficulty")}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <NumberInput
              size="xs"
              label="# of Questions"
              key={form.key("qCount")}
              disabled={disableFields}
              placeholder="eg: 10"
              {...form.getInputProps("qCount")}
              min={1}
              max={
                subscription && subscription.planId
                  ? priceList[subscription.planId].label === "Integrated"
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
                disabled={form.getValues()?.prompt!.length > 0 || disableFields}
                {...form.getInputProps("promptUrl")}
                key={form.key("promptUrl")}
                pt={5}
              />
            </Grid.Col>
          )}
          {contentType === "Keyword" && (
            <Grid.Col span={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Textarea
                label="Keyword"
                placeholder="Query keywords"
                disabled={
                  form.getValues()?.promptUrl!.length > 0 || disableFields
                }
                rows={4}
                {...form.getInputProps("prompt")}
                key={form.key("prompt")}
              />
            </Grid.Col>
          )}
          {contentType === "Resume" && (
            <Dropzone
              onDrop={(files) => {
                form.setFieldValue("resume", files[0]);
              }}
              disabled={disableFields}
              onReject={(files) => console.log("rejected files", files)}
              maxSize={1 * 1024 ** 2}
              key={form.key("resume")}
              {...form.getInputProps("resume")}
              accept={imageMimeTypes}
              mx={"sm"}
              multiple={false}
              w={"100%"}
              my={"md"}
            >
              <Group
                justify="center"
                gap="sm"
                mih={150}
                style={{ pointerEvents: "none" }}
              >
                <Dropzone.Accept>
                  <IconUpload
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-blue-6)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-red-6)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFileDescription
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-dimmed)",
                    }}
                    stroke={1.5}
                  />
                </Dropzone.Idle>

                {!isFileSelected ? (
                  <div>
                    <Text size="xl" inline>
                      Drag or click to select files
                    </Text>
                    <Text size="sm" inline mt={7}>
                      Only pdf files are accepted
                    </Text>
                    <Text size="sm" inline mt={7}>
                      File size should not exceed 1mb
                    </Text>
                  </div>
                ) : uploadingResume ? (
                  <Text>Uploading file...</Text>
                ) : (
                  <Flex direction={"column"} w={"auto"} h={"auto"} gap={"xs"}>
                    <Text size="sm" fw={"bold"}>
                      File name: {fileName}
                    </Text>
                    <Button variant="outline">Change file</Button>
                  </Flex>
                )}
              </Group>
            </Dropzone>
          )}
          <Grid.Col span={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Button
              loading={(isLoading && queryType === "GWA") || uploadingResume}
              disabled={disableActionButton}
              fullWidth
              onClick={() => setQueryType("GWA")}
              type="submit"
              leftSection={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-zap"
                >
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                </svg>
              }
            >
              Generate w/ Answers
            </Button>
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Button
              fullWidth
              loading={(isLoading && queryType === "GWOA") || uploadingResume}
              disabled={disableActionButton}
              onClick={() => setQueryType("GWOA")}
              type="submit"
              leftSection={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-zap-off"
                >
                  <path d="M10.513 4.856 13.12 2.17a.5.5 0 0 1 .86.46l-1.377 4.317" />
                  <path d="M15.656 10H20a1 1 0 0 1 .78 1.63l-1.72 1.773" />
                  <path d="M16.273 16.273 10.88 21.83a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4a1 1 0 0 1-.78-1.63l4.507-4.643" />
                  <path d="m2 2 20 20" />
                </svg>
              }
            >
              Generate w/o Answers
            </Button>
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Button
              fullWidth
              disabled={disableActionButton}
              onClick={() => printResult(true)}
              leftSection={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-printer"
                >
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                  <rect x="6" y="14" width="12" height="8" rx="1" />
                </svg>
              }
            >
              Print all questions
            </Button>
          </Grid.Col>
          <Grid.Col span={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Button
              fullWidth
              type="reset"
              onClick={(e) => {
                form.reset();
              }}
              disabled={disableActionButton}
              leftSection={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-rotate-ccw"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              }
            >
              Reset
            </Button>
          </Grid.Col>
        </Grid>
      </form>
      {disableFields && (
        <Alert
          variant="light"
          color={"blue"}
          title={"Info"}
          icon={<IconInfoCircle />}
          mt={"auto"}
          radius={"md"}
        >
          <Flex direction={"column"} w={"auto"} align={"start"} gap={"xs"}>
            <Text size="sm">
              It looks like you&apos;ve run out of available query counts.
            </Text>
            <Text size="sm">
              If you want to reset your account or upgrade please contact
              <span className="text-blue-600"> help@content2quiz.com</span>
            </Text>
          </Flex>
        </Alert>
      )}
      {subscription && (
        <Alert
          variant="light"
          color={!subscription.queries ? "red" : "lime"}
          title={!subscription.queries ? "Note" : "All set"}
          icon={<IconInfoCircle />}
          mt={"auto"}
          radius={"md"}
        >
          <Flex direction={"column"} w={"auto"} align={"start"} gap={"xs"}>
            <Text size="sm">
              Your subscription plan name is ~ {subscription.planName}
            </Text>
            <Text size="sm">You&apos;re offered to generate</Text>
            <List listStyleType="disc" withPadding>
              {features &&
                features.map((item, idx) => {
                  return (
                    <List.Item fs={"italic"} className="text-sm" key={idx}>
                      {item}
                    </List.Item>
                  );
                })}
            </List>
            <Badge variant="outline" color="orange" size="lg" radius="sm">
              <Flex direction={"row"} w={"auto"} gap={"sm"} align={"center"}>
                <Text size="sm">
                  Queries left :{" "}
                  {queries && queries < 0 ? "Unlimited" : queries}
                </Text>
              </Flex>
            </Badge>
          </Flex>
        </Alert>
      )}
    </Flex>
  );
}

export { CriteriaForm };
