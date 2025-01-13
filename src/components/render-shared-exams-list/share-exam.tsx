"use client";

import { trpc } from "@/app/_trpc/client";
import {
  SharedRecordSchema,
  UserProfileSchema,
} from "@/utllities/zod-schemas-types";
import {
  Box,
  Button,
  CSSProperties,
  Grid,
  Modal,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMemo } from "react";
import { z } from "zod";
import { OverlayModal } from "../modals/loader";

interface Props {
  opened: boolean;
  close: VoidFunction;
  record: SharedRecordSchema;
  userProfile: UserProfileSchema;
  updateList: (
    firstName: string | null,
    lastName: string | null,
    email: string,
    shareDate: Date
  ) => void;
}

const formObject = z.object({
  firstName: z.string().optional().default("N/A"),
  lastName: z.string().optional().default("N/A"),
  email: z.string().email({ message: "Email is required" }),
});

type FormSchema = z.infer<typeof formObject>;

function ShareExam({ opened, close, record, userProfile, updateList }: Props) {
  const {
    mutateAsync: addSharedExamRecord,
    isLoading: sharingExam,
    isError: addFailed,
    isSuccess: addSuccess,
  } = trpc.addSharedExamRecord.useMutation();

  const {
    mutateAsync: shareGoogleForm,
    isLoading: sharingForm,
    isError: shareFormError,
    isSuccess: shareFormSuccess,
  } = trpc.shareGoogleForm.useMutation();
  const {
    mutateAsync: shareGoogleDoc,
    isLoading: sharingDoc,
    isError: shareDocError,
    isSuccess: shareDocSuccess,
  } = trpc.shareGoogleDoc.useMutation();

  const modalHeaderProps = useMemo(() => {
    let props: CSSProperties = { background: "white", color: "black" };

    if (addSuccess) {
      props = {
        background: "teal",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    } else if (addFailed) {
      props = {
        background: "red",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    }
    return props;
  }, [addFailed, addSuccess]);

  const form = useForm<FormSchema>({
    mode: "controlled",
    initialValues: { firstName: "", lastName: "", email: "" },
    validate: zodResolver(formObject),
  });

  async function handleSubmit(values: FormSchema) {
    const { email, firstName, lastName } = values;

    const { outputType, googleQuizLink, googleFormId, questionRecord } = record;

    if (outputType === "question" && googleQuizLink) {
      await shareGoogleForm(
        {
          email: email,
          formId: googleQuizLink,
        },
        {
          onSuccess: async ({ code }) => {
            if (code === "SUCCESS") {
              await addSharedExamRecord({
                email,
                firstName,
                lastName,
                formId: googleQuizLink,
                questionRecordId: questionRecord,
                userId: userProfile.id,
              });
              updateList(firstName, lastName, email, new Date());
            }
          },
        }
      );
    } else {
      if (googleFormId) {
        await shareGoogleDoc(
          {
            email,
            formId: googleFormId,
          },
          {
            onSuccess: async (data) => {
              await addSharedExamRecord({
                email,
                firstName,
                lastName,
                formId: googleFormId,
                questionRecordId: questionRecord,
                userId: userProfile.id,
              });
              updateList(firstName, lastName, email, new Date());
            },
          }
        );
      }
    }
  }

  const modalTitle = useMemo(() => {
    let title = "Share exam";
    const { outputType } = record;
    if (outputType) {
      title = "Share doc";
      if (addFailed || shareDocError || shareFormError) {
        if (outputType === "question") {
          title = "Failed to share exam";
        } else {
          title = "Failed to share doc";
        }
      }
      if (addSuccess || shareDocSuccess || shareFormSuccess) {
        if (outputType === "question") {
          title = "Exam is shared";
        } else {
          title = "Doc is shared";
        }
      }
    }
    return title;
  }, [
    addFailed,
    addSuccess,
    record,
    shareDocError,
    shareFormError,
    shareDocSuccess,
    shareFormSuccess,
  ]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={modalTitle}
      w={"60%"}
      closeOnClickOutside={false}
      withCloseButton
      centered
      size={"lg"}
      p={"md"}
      closeOnEscape={false}
      shadow="lg"
      styles={{
        title: {
          fontWeight: "bolder",
        },
        header: {
          ...modalHeaderProps,
        },
      }}
    >
      <OverlayModal opened={sharingExam} message="Sharing exam ..." />
      <Box py={"sm"} w={"100%"} h={"100%"}>
        <form
          onSubmit={form.onSubmit((values) => handleSubmit(values))}
          style={{ width: "100%", height: "100%" }}
        >
          <Grid>
            <Grid.Col span={{ xs: 12, md: 6 }}>
              <TextInput
                placeholder="Enter first name"
                label="First name"
                key={form.key("firstName")}
                {...form.getInputProps("firstName")}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 12, md: 6 }}>
              <TextInput
                placeholder="Enter last name"
                label="Last name"
                key={form.key("lastName")}
                {...form.getInputProps("lastName")}
              />
            </Grid.Col>
            <Grid.Col span={{ xs: 12, md: 6 }}>
              <TextInput
                placeholder="Enter your email"
                label="Email"
                key={form.key("email")}
                {...form.getInputProps("email")}
              />
            </Grid.Col>
          </Grid>
          <Button
            variant="filled"
            type="submit"
            loading={sharingExam || sharingForm || sharingDoc}
            mt={"md"}
          >
            Share
          </Button>
        </form>
      </Box>
    </Modal>
  );
}

export { ShareExam };