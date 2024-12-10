"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  createGoogleQuizForm,
  getInstitutes,
  getProfileDetailsByGuidUserId,
  postUnifiedData,
  QuestionSchema,
  UnifiedSchema,
} from "@/utllities/apiFunctions";
import {
  FillBlankQuestionSchema,
  Institute,
  MCQQuestionSchema,
  McqSimilarQuestionScheam,
  OpenendedQuestionSchema,
  TrueFalseQuestionsScheam,
} from "@/utllities/zod-schemas-types";
import {
  Button,
  Center,
  Fieldset,
  Flex,
  Grid,
  Group,
  Loader,
  NumberInput,
  Select,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { z } from "zod";
import {
  GoogleQuizPayloadSchema,
  GoogleQuizQuestionsSchema,
  questionTypeMapping,
} from "./modals/google-quiz-modal";

interface Props {
  record: SelectQuestionBank;
  close: VoidFunction;
  userEmail: string;
}

const instituteOptionsSchema = z.array(
  z.object({
    label: z.string(),
    value: z.string(),
  })
);

const proctoredTestForm = z.object({
  userFirstName: z
    .string()
    .trim()
    .min(1, { message: "First name cannot be empty" }),
  userLastName: z
    .string()
    .trim()
    .min(1, { message: "Last name cannot be empty" }),
  userEmail: z
    .string()
    .trim()
    .min(1, { message: "Email cannot be empty" })
    .email({ message: "Enter a valid email address" }),
  instituteName: z
    .string()
    .nullable()
    .refine((value) => value !== null && value.trim().length > 0, {
      message: "Select institute",
    }),
  courseName: z
    .string()
    .trim()
    .min(1, { message: "Course name cannot be empty" }),
  quizType: z.string().trim().min(1, { message: "Select a quiz type" }),
  quizName: z.string().trim().min(1, { message: "Quiz name cannot be empty" }),
  quizDuration: z
    .number({
      invalid_type_error: "Duration must be a number",
    })
    .positive({ message: "Duration must be a positive number" })
    .int({ message: "Duration must be an integer" })
    .min(1, { message: "Enter a valid value" }),
  instructorId: z
    .number({
      invalid_type_error: "Instructor ID must be a number",
    })
    .positive({ message: "Instructor ID must be a positive number" })
    .int({ message: "Instructor ID must be an integer" })
    .min(1, { message: "Enter a valid instructor ID" }),
});

type InstituteOptions = z.infer<typeof instituteOptionsSchema>;
type ProctoredTestForm = z.infer<typeof proctoredTestForm>;

export default function RenderProctoredTestForm({
  record,
  close,
  userEmail,
}: Props) {
  const questions = useAppStore((state) => state.questions);
  const setQuestions = useAppStore((state) => state.setQuestions);

  const {
    mutateAsync: getInstitues,
    isLoading: fetchingInstitutes,
    data: instituteList,
  } = useMutation({
    mutationFn: getInstitutes,
  });

  const {
    mutateAsync: createGQuiz,
    isError: createQuizError,
    isSuccess: quizCreated,
    isLoading: creatingQuiz,
  } = useMutation({
    mutationFn: createGoogleQuizForm,
  });

  const {
    mutateAsync: postStudentUnifiedData,
    isLoading: postingUnifiedData,
    isError: postUnifiedDataError,
    isSuccess: postUnifiedDataSuccess,
  } = useMutation({
    mutationFn: postUnifiedData,
  });

  const {
    mutateAsync: addGoogleQuizLinkToRec,
    isError: addToRecError,
    isSuccess: addedToRec,
    isLoading: addingQuizLinkToRec,
  } = trpc.addGoogleQuizLinkToRec.useMutation();

  const institutesById = useMemo(() => {
    const institutes: Record<string, Institute> = {};

    if (instituteList) {
      instituteList.forEach((institute) => {
        institutes[institute.instituteId] = { ...institute };
      });
    }

    return institutes;
  }, [instituteList]);

  const instituteOptions = useMemo(() => {
    let options: InstituteOptions = [];

    if (instituteList) {
      options = instituteList.map((institute) => ({
        label: institute.instituteName,
        value: "" + institute.instituteId,
      }));
    }
    return options;
  }, [instituteList]);

  const form = useForm<ProctoredTestForm>({
    validate: zodResolver(proctoredTestForm),
    initialValues: {
      courseName: "",
      instituteName: "",
      instructorId: 0,
      quizName: "",
      userEmail: "",
      userFirstName: "",
      userLastName: "",
      quizDuration: 30,
      quizType: "Written AI Exam",
    },
    mode: "controlled",
  });

  const updateQuestionRecord = useCallback(
    (quizLink: string) => {
      const updatedQuestionsList = { ...questions };
      updatedQuestionsList[record.id].googleQuizLink = quizLink;
      setQuestions({ ...updatedQuestionsList });
    },
    [questions, record.id, setQuestions]
  );

  const handleCreateQuiz = useCallback(
    async (email: string): Promise<string> => {
      const { questionType } = record;
      let formattedQuestions: GoogleQuizQuestionsSchema[] = [];
      if (questionType === "open_ended") {
        formattedQuestions = (
          record.questions as OpenendedQuestionSchema[]
        ).map((question) => {
          let qType: (typeof questionTypeMapping)[keyof typeof questionTypeMapping] =
            "MULTIPLE_CHOICE";
          if (
            typeof record.questionType === "string" &&
            record.questionType in questionTypeMapping
          ) {
            qType = questionTypeMapping[record.questionType];
          }
          return {
            answer: question.answer,
            options: [],
            points: 1,
            questionText: question.question,
            questionType: qType,
            required: true,
          };
        });
      } else {
        formattedQuestions = (record.questions as QuestionSchema[]).map(
          (question) => {
            let qType: (typeof questionTypeMapping)[keyof typeof questionTypeMapping] =
              "MULTIPLE_CHOICE";

            if (
              typeof record.questionType === "string" &&
              record.questionType in questionTypeMapping
            ) {
              qType = questionTypeMapping[record.questionType];
            }

            return {
              answer: question.options[question.answer],
              options: Object.values(question.options),
              points: 1,
              questionText: question.question,
              questionType: qType,
              required: true,
            };
          }
        );
      }

      const payload: GoogleQuizPayloadSchema = {
        questions: formattedQuestions,
        formTitle: record.prompt ?? "",
        ownerEmail: userEmail,
        studentEmail: email,
        shareWithInvite: false,
      };
      const quizLink = await createGQuiz(payload);
      return quizLink;
    },
    [createGQuiz, record, userEmail]
  );

  async function handleSubmit(values: ProctoredTestForm) {
    const {
      userEmail,
      instituteName,
      userFirstName,
      userLastName,
      courseName,
      instructorId,
      quizName,
      quizType,
      quizDuration,
    } = values;
    const quizLink = await handleCreateQuiz(userEmail);
    if (!instituteName || !institutesById[instituteName]) return;
    const unifiedPayload: UnifiedSchema = {
      instituteName: institutesById[instituteName].instituteName,
      userEmail: userEmail,
      userFirstName: userFirstName,
      userLastName: userLastName,
      userName: userEmail,
      courseName: courseName,
      quizName: quizName,
      instructorId: "" + instructorId,
      action: "STUDENT_UNIFIED",
      proctorCode: "",
      quizDetails: {
        quizType: quizType,
        quizContentFile: quizLink,
        quizTime: quizDuration,
        quizQuestionCount: (
          record.questions as
            | MCQQuestionSchema[]
            | FillBlankQuestionSchema[]
            | TrueFalseQuestionsScheam[]
            | OpenendedQuestionSchema[]
            | McqSimilarQuestionScheam[]
        ).length,
      },
      assignmentDetails: {
        assignId: "",
        assignName: quizName,
      },
      quizOverrideDetails: {
        prompt1: record.prompt ?? "",
        prompt2: "",
        prompt3: "",
        quizFileName: quizLink,
        extraTime: "30",
      },
      userDetails: {
        userPassword: userEmail,
      },
    };
    await postStudentUnifiedData(unifiedPayload, {
      onSuccess: async (data) => {
        await addGoogleQuizLinkToRec({ recId: record.id, gQuizLink: quizLink });
        updateQuestionRecord(quizLink);
      },
    });
  }

  const getProfileDetails = useDebouncedCallback(
    async (guid: string, id: string) => {
      const response = await getProfileDetailsByGuidUserId(guid, id);

      if (!response) {
        form.setFieldError("instructorId", "Invalid Instructor Id");
        return;
      } else {
        form.setFieldError("instructorId", null);
      }
    },
    1000
  );

  async function handleInstructorIdInput(value: string) {
    const { instituteName } = form.values;

    if (!instituteName) {
      form.setFieldError("instituteName", "Select institure first");
    } else {
      if (institutesById[instituteName]) {
        const { guid } = institutesById[instituteName];
        getProfileDetails(guid, value);
      }
    }
  }

  useEffect(() => {
    if (!instituteList) {
      getInstitues();
    }
  }, [instituteList, getInstitues]);

  if (creatingQuiz || postingUnifiedData || addingQuizLinkToRec) {
    return (
      <Center w={"100%"} h={"100%"} display={"flex"} flex={1}>
        <Loader color="orange" size="lg" type="dots" />
      </Center>
    );
  }

  if (postUnifiedDataError || createQuizError || addToRecError) {
    return (
      <Flex
        w={"100%"}
        h={"100%"}
        direction={"column"}
        justify={"space-between"}
      >
        <Center w={"100%"} h={"100%"}>
          <Text size="md" c={"red"}>
            Something went wrong. Please try again later.
          </Text>
        </Center>
        <Group w={"100%"} justify="end">
          <Button variant="filled" onClick={close}>
            Close
          </Button>
        </Group>
      </Flex>
    );
  }

  if (postUnifiedDataSuccess && quizCreated && addedToRec) {
    return (
      <Flex
        w={"100%"}
        styles={{
          root: {
            flexGrow: 1,
          },
        }}
        direction={"column"}
        justify={"space-between"}
      >
        <Center w={"100%"} h={"100%"} display={"flex"} flex={1}>
          <Text size="md" c={"teal"} fw={"bold"}>
            Google quiz has been created successfully.
          </Text>
        </Center>
        <Group w={"100%"} justify="end">
          <Button variant="filled" onClick={close}>
            Close
          </Button>
        </Group>
      </Flex>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Fieldset legend="User information">
        <Grid>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <TextInput
              label="First name"
              placeholder="Enter first name"
              {...form.getInputProps("userFirstName")}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <TextInput
              label="Last name"
              placeholder="Enter last name"
              {...form.getInputProps("userLastName")}
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              {...form.getInputProps("userEmail")}
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
      <Fieldset legend="Other information" mt={"sm"}>
        <Grid>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <Select
              searchable
              data={[...instituteOptions]}
              clearable
              disabled={fetchingInstitutes}
              leftSection={fetchingInstitutes ? <Loader size={"xs"} /> : null}
              {...form.getInputProps("instituteName")}
              label="Institute"
              placeholder="Select institute"
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <NumberInput
              {...form.getInputProps("instructorId")}
              onChange={(value) => {
                if (typeof value === "string") {
                  handleInstructorIdInput(value);
                } else {
                  handleInstructorIdInput("" + value);
                }
              }}
              label={
                <Flex gap={"xs"} align="center" direction={"row"} w={"auto"}>
                  <Text size="sm">Instructor&apos;s Id</Text>
                  <Tooltip label="If you know your instructor ID please put it here. Support team normally creates the Instructor ID for the Institute and shares that with you. If you do not have this ID please send an email to support@beyondexam.com">
                    <IconInfoCircle size={15} />
                  </Tooltip>
                </Flex>
              }
              placeholder="Enter instructor's Id"
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <TextInput
              {...form.getInputProps("courseName")}
              placeholder="Enter course name"
              label="Course name"
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <Select
              {...form.getInputProps("quizType")}
              placeholder="Select quiz type"
              data={[
                {
                  label: "Written AI Exam",
                  value: "Written AI Exam",
                },
                { label: "Discussion", value: "Discussion" },
                { label: "Interview", value: "Interview" },
              ]}
              label="Quiz Type"
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <TextInput
              {...form.getInputProps("quizName")}
              placeholder="Enter quiz name"
              label="Quiz name"
            />
          </Grid.Col>
          <Grid.Col span={{ xs: 12, md: 4 }}>
            <NumberInput
              {...form.getInputProps("quizDuration")}
              label="Quiz duration (in mins)"
              placeholder="Enter quiz duration"
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
      <Group gap={"sm"} mt={"md"} justify="end" w={"100%"}>
        <Button variant="filled" onClick={close}>
          Close
        </Button>
        <Button variant="filled" type="submit">
          Create
        </Button>
      </Group>
    </form>
  );
}
