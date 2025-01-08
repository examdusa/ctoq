"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  createGoogleDoc,
  createGoogleQuizForm,
  getProfileDetailsByGuidUserId,
  postUnifiedData,
  UnifiedSchema,
} from "@/utllities/apiFunctions";
import {
  FillBlankQuestionSchema,
  GoogleDocSchema,
  MCQQuestionSchema,
  McqSimilarQuestionScheam,
  OpenendedQuestionSchema,
  TrueFalseQuestionScheam,
} from "@/utllities/zod-schemas-types";
import {
  Alert,
  Button,
  Center,
  Container,
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
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconInfoCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import {
  GoogleQuizPayloadSchema,
  GoogleQuizQuestionsSchema,
} from "./modals/google-quiz-modal";

interface Props {
  record: SelectQuestionBank;
  close: VoidFunction;
  userEmail: string;
}

const questionTypeMap = {
  mcq: "MULTIPLE_CHOICE",
  dropdown: "DROPDOWN",
  true_false: "TRUE_FALSE",
  checkbox: "CHECKBOX",
  open_ended: "OPEN_ENDED",
  fill_blank: "FILL_BLANK",
  fill_blank_hard: "HARD_FILL_BLANK",
  mcq_similar: "MULTIPLE_SIMILAR",
};

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
  const userProfile = useAppStore((state) => state.userProfile);
  const institutesById = useAppStore((state) => state.institutesById);
  const theme = useMantineTheme();
  const {
    mutateAsync: addSharedExamRecord,
    isLoading: addingRecord,
    isError: addRecordFailed,
  } = trpc.addSharedExamRecord.useMutation();

  const {
    mutateAsync: createGQuiz,
    isError: createQuizError,
    isSuccess: quizCreated,
    isLoading: creatingQuiz,
  } = useMutation({
    mutationFn: createGoogleQuizForm,
  });

  const {
    mutateAsync: createDoc,
    isError: createDocError,
    isSuccess: createDocSuccess,
    isLoading: creatingDoc,
  } = useMutation({
    mutationFn: createGoogleDoc,
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

  const showMissingInstituteAlert = useMemo(() => {
    if (userProfile) {
      return userProfile.instituteName ? false : true;
    }
    return false;
  }, [userProfile]);

  const form = useForm<ProctoredTestForm>({
    validate: zodResolver(proctoredTestForm),
    initialValues: {
      courseName: "",
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
      updatedQuestionsList[record.jobId].googleQuizLink = quizLink;
      setQuestions({ ...updatedQuestionsList });
    },
    [questions, record.jobId, setQuestions]
  );

  function formatQuestion(
    questions: unknown,
    questionType: string
  ): GoogleQuizQuestionsSchema[] {
    const formattedQuestions: GoogleQuizQuestionsSchema[] = [];
    if (questionType === "mcq" || questionType === "mcq_similar") {
      (questions as MCQQuestionSchema[]).forEach((question) => {
        formattedQuestions.push({
          answer: question.answer,
          options: [...question.options],
          points: 1,
          questionText: question.question,
          questionType: questionTypeMap[questionType],
          required: true,
        });
      });
    } else if (questionType === "true_false") {
      (questions as TrueFalseQuestionScheam[]).forEach((question) => {
        formattedQuestions.push({
          answer: question.answer,
          options: [],
          points: 1,
          questionText: question.question,
          questionType: questionTypeMap[questionType],
          required: true,
        });
      });
    } else if (questionType === "fill_blank") {
      (questions as FillBlankQuestionSchema[]).forEach((question) => {
        formattedQuestions.push({
          answer: question.answer,
          options: [],
          points: 1,
          questionText: question.question,
          questionType: questionTypeMap[questionType],
          required: true,
        });
      });
    } else if (questionType === "open_ended") {
      (questions as OpenendedQuestionSchema[]).forEach((question) => {
        formattedQuestions.push({
          answer: question.answer,
          options: [],
          points: 1,
          questionText: question.question,
          questionType: questionTypeMap[questionType],
          required: true,
        });
      });
    }
    return formattedQuestions;
  }

  const handleCreateQuiz = useCallback(
    async (
      email: string,
      questionType: string,
      outputType: string
    ): Promise<string> => {
      const { questions } = record;
      if (outputType === "question") {
        let formattedQuestions: GoogleQuizQuestionsSchema[] = [];
        formattedQuestions = formatQuestion(questions, questionType);
        const payload: GoogleQuizPayloadSchema = {
          questions: formattedQuestions,
          formTitle: record.prompt ?? "",
          ownerEmail: userEmail,
          studentEmail: email,
          shareWithInvite: false,
        };
        const quizLink = await createGQuiz(payload);
        return quizLink;
      }
      const formattedQuestions: GoogleDocSchema = {
        title: record.prompt ?? "",
        fromEmail: userEmail,
        toEmails: [email],
        requests: [
          {
            textToInsert: record.guidance ?? record.summary ?? "",
          },
        ],
      };
      return await createDoc({ ...formattedQuestions });
    },
    [createGQuiz, record, userEmail, createDoc]
  );

  async function createOnlyQuiz() {
    const { questionType, outputType, id, userId } = record;
    if (questionType && outputType) {
      const quizLink = await handleCreateQuiz(
        userEmail,
        questionType,
        outputType
      );
      updateQuestionRecord(quizLink);
      addGoogleQuizLinkToRec({
        recId: record.id,
        gQuizLink: quizLink,
        outputType,
      });
    }
  }

  async function handleSubmit(values: ProctoredTestForm) {
    const {
      userEmail,
      userFirstName,
      userLastName,
      courseName,
      instructorId,
      quizName,
      quizType,
      quizDuration,
    } = values;
    const {
      questionType,
      outputType,
      id,
      userId,
      googleQuizLink,
      googleFormId,
    } = record;
    if (questionType && outputType && userProfile) {
      let quizLink = googleQuizLink ?? googleFormId ?? "";
      if (outputType === "question") {
        if (!googleQuizLink) {
          quizLink = await handleCreateQuiz(
            userEmail,
            questionType,
            outputType
          );
        }
      } else {
        if (!googleFormId) {
          quizLink = await handleCreateQuiz(
            userEmail,
            questionType,
            outputType
          );
        }
      }

      const { instituteName } = userProfile;
      const unifiedPayload: UnifiedSchema = {
        instituteName: instituteName,
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
              | TrueFalseQuestionScheam[]
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
          await addSharedExamRecord({
            email: userEmail,
            formId: quizLink,
            questionRecordId: id,
            userId: userId,
            firstName: userFirstName,
            lastName: userLastName,
          });
          if (outputType === "question") {
            if (!googleQuizLink) {
              await addGoogleQuizLinkToRec({
                recId: record.id,
                gQuizLink: quizLink,
                outputType,
              });
              updateQuestionRecord(quizLink);
            }
          } else {
            if (!googleFormId) {
              await addGoogleQuizLinkToRec({
                recId: record.id,
                gQuizLink: quizLink,
                outputType,
              });
              updateQuestionRecord(quizLink);
            }
          }
        },
      });
    }
  }

  const getProfileDetails = useDebouncedCallback(
    async (guid: string, id: string) => {
      const response = await getProfileDetailsByGuidUserId(guid, id);
      console.log(response);

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
    if (!userProfile) return;
    const { instituteName } = userProfile;
    if (!instituteName) {
      form.setFieldError("instituteName", "Select institure first");
    } else {
      if (institutesById[instituteName]) {
        const { guid } = institutesById[instituteName];
        getProfileDetails(guid, value);
      }
    }
  }

  if (creatingQuiz || postingUnifiedData || addingQuizLinkToRec) {
    return (
      <Center w={"100%"} h={"100%"} display={"flex"} flex={1}>
        <Loader color="orange" size="lg" type="dots" />
      </Center>
    );
  }

  if (
    postUnifiedDataError ||
    createQuizError ||
    addToRecError ||
    createDocError
  ) {
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

  if (
    postUnifiedDataSuccess &&
    quizCreated &&
    addedToRec &&
    record.outputType === "question"
  ) {
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

  if (postUnifiedDataSuccess && createDocSuccess && addedToRec) {
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
    <Flex w={"100%"} h={"100%"} direction={"column"} gap={"sm"}>
      <Container
        bg={theme.colors.blue[1]}
        styles={{
          root: {
            height: 50,
            width: "100%",
            borderRadius: theme.radius.sm,
          },
        }}
      >
        <Flex
          w={"100%"}
          h={"100%"}
          align={"center"}
          justify={"center"}
          direction={"row"}
          gap={"md"}
        >
          {createDocSuccess && <Text fw={500}>Google doc created</Text>}
          {quizCreated && <Text fw={500}>Google quiz created</Text>}
          {!createDocSuccess &&
            !quizCreated &&
            !record.googleQuizLink &&
            !record.googleFormId && (
              <>
                <Text fw={500}>Create only google quiz instead ?</Text>
                <Button
                  variant="filled"
                  size="xs"
                  onClick={createOnlyQuiz}
                  loading={creatingDoc || creatingQuiz}
                >
                  Create quiz
                </Button>
              </>
            )}
          {record.googleQuizLink && (
            <>
              <Text fw={500}>Open google quiz ?</Text>
              <Button
                variant="filled"
                size="xs"
                onClick={() => {
                  if (record.googleQuizLink)
                    window.open(record.googleQuizLink, "_blank");
                }}
                loading={creatingDoc || creatingQuiz}
              >
                Open
              </Button>
            </>
          )}
        </Flex>
      </Container>
      {showMissingInstituteAlert ? (
        <Alert
          variant="light"
          color="yellow"
          title="Proctored exam"
          icon={<IconInfoCircle />}
        >
          To do proctored exam, please provide your institute name. Please go to
          Update Profile menu and add your institute name.
        </Alert>
      ) : (
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
                <NumberInput
                  {...form.getInputProps("instructorId")}
                  onChange={(value) => {
                    if (typeof value === "string") {
                      handleInstructorIdInput(value);
                      form.setFieldValue("instructorId", Number(value));
                    } else {
                      handleInstructorIdInput("" + value);
                      form.setFieldValue("instructorId", value);
                    }
                  }}
                  label={
                    <Flex
                      gap={"xs"}
                      align="center"
                      direction={"row"}
                      w={"auto"}
                    >
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
            <Button
              variant="filled"
              type="submit"
              loading={
                addingQuizLinkToRec ||
                addingRecord ||
                creatingDoc ||
                creatingQuiz
              }
            >
              Create
            </Button>
          </Group>
        </form>
      )}
    </Flex>
  );
}
