"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import {
  Button,
  Group,
  Modal,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { CSSProperties, useMemo } from "react";
import { z } from "zod";

interface Props {
  record: SelectQuestionBank;
  open: boolean;
  close: VoidFunction;
}

const formSchema = z.object({
  heading: z.string().min(1, "Heading cannot be empty"),
});

type FormSchema = z.infer<typeof formSchema>;

export default function EditQuestionLabelModal({ record, open, close }: Props) {
  const theme = useMantineTheme();
  const {
    mutateAsync: updateHeading,
    isLoading,
    isSuccess,
    isError,
  } = trpc.updateQuestionBankHeading.useMutation();
  const questions = useAppStore((state) => state.questions);
  const form = useForm<FormSchema>({
    validate: zodResolver(formSchema),
    initialValues: {
      heading: record.prompt ?? "",
    },
  });

  const modalHeaderProps = useMemo(() => {
    let props: CSSProperties = { background: "white", color: "black" };

    if (isSuccess) {
      props = {
        background: "teal",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    } else if (isError) {
      props = {
        background: "red",
        color: "white",
        animation: "ease-in",
        transition: "linear",
        animationDelay: "2s",
      };
    }
    return props;
  }, [isSuccess, isError]);

  async function handleUpdateHeading() {
    const { heading } = form.values;
    await updateHeading(
      { questionId: record.id, heading: heading },
      {
        onSuccess: (data) => {
          const { code } = data;

          if (code === "HEADING_UPDATED") {
            useAppStore.setState({
              questions: {
                ...questions,
                [record.id]: { ...questions[record.id], prompt: heading },
              },
            });
          }
        },
      }
    );
  }

  return (
    <Modal
      opened={open}
      onClose={close}
      title="Edit heading"
      size={"md"}
      centered
      styles={{
        header: {
          ...modalHeaderProps,
          marginBottom: 10
        },
        title: {
          fontWeight: "bolder",
        },
      }}
    >
      <form
        onSubmit={form.onSubmit(handleUpdateHeading)}
        onReset={() => form.reset()}
      >
        <TextInput
          {...form.getInputProps("heading")}
          label="Question bank heading"
          placeholder="Enter new heading"
          styles={{
            label: {
              fontSize: theme.fontSizes.md,
            },
          }}
        />
        <Group justify="end" w={"100%"} gap={"sm"} mt={"md"}>
          <Button variant="default" type="reset" disabled={isLoading}>
            Reset
          </Button>
          <Button variant="default" type="submit" loading={isLoading}>
            Update
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
