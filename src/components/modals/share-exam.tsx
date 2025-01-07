"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { UserProfileSchema } from "@/utllities/zod-schemas-types";
import {
  Box,
  Button,
  CSSProperties,
  Grid,
  Group,
  Modal,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMemo } from "react";
import { z } from "zod";
import { OverlayModal } from "./loader";

interface Props {
  opened: boolean;
  close: VoidFunction;
  record: SelectQuestionBank;
  userProfile: UserProfileSchema;
}

const formObject = z.object({
  firstName: z.string().optional().default("N/A"),
  lastName: z.string().optional().default("N/A"),
  email: z.string().email({ message: "Email is required" }),
});

type FormSchema = z.infer<typeof formObject>;

function ShareExam({ opened, close, record, userProfile }: Props) {
  const {
    mutateAsync: addSharedExamRecord,
    isLoading: sharingExam,
    isError: shareFailed,
    isSuccess: shareSuccess,
  } = trpc.addSharedExamRecord.useMutation();

  const modalHeaderProps = useMemo(() => {
    let props: CSSProperties = { background: "white", color: "black" };

    if (shareSuccess) {
      props = {
        background: "teal",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    } else if (shareFailed) {
      props = {
        background: "red",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    }
    return props;
  }, [shareFailed, shareSuccess]);

  const form = useForm<FormSchema>({
    mode: "controlled",
    initialValues: { firstName: "", lastName: "", email: "" },
    validate: zodResolver(formObject),
  });

  async function handleSubmit(values: FormSchema) {
    const { email, firstName, lastName } = values;
    const { googleFormId, id: qId, outputType, googleQuizLink } = record;
    const { id } = userProfile;
    if (userProfile) {
      if (outputType === "question") {
        if (googleQuizLink) {
          await addSharedExamRecord({
            email,
            firstName,
            lastName,
            formId: googleQuizLink,
            questionRecordId: qId,
            userId: id,
          });
        }
      } else {
        if (googleFormId) {
          await addSharedExamRecord({
            email,
            firstName,
            lastName,
            formId: googleFormId,
            questionRecordId: qId,
            userId: id,
          });
        }
      }
    }
  }

  const modalTitle = useMemo(() => {
    if (shareFailed) {
      return "Failed to share exam";
    }
    if (shareSuccess) {
      return "Exam is shared";
    }
    return "Share exam";
  }, [shareFailed, shareSuccess]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={modalTitle}
      w={"60%"}
      closeOnClickOutside={false}
      withCloseButton
      centered
      size={"xl"}
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
      <Box p={"sm"}>
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
          <Group justify="self-end" mt={"md"}>
            <Button variant="filled" type="submit" loading={sharingExam}>
              Share
            </Button>
          </Group>
        </form>
      </Box>
    </Modal>
  );
}

export { ShareExam };
