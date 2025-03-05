"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectUser } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import { useUser } from "@clerk/nextjs";
import {
  Alert,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Paper,
  Select,
  Tabs,
  Text,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { IconInfoCircle } from "@tabler/icons-react";
import Image from "next/image";
import { useMemo } from "react";
import { z } from "zod";

interface Props {
  userDetail: SelectUser;
}

const basicDetailForm = z.object({
  language: z.string().default(""),
  role: z.string().default(""),
  instituteName: z.string().default("Content To Quiz"),
});

const langSchema = z.record(z.string(), z.string());
const roleSchema = z.record(z.string(), z.string());

type LangSchema = z.infer<typeof langSchema>;
type RoleSchema = z.infer<typeof roleSchema>;

type BaseDetailForm = z.infer<typeof basicDetailForm>;

export const languages: LangSchema = {
  english: "English",
  spanish: "Spanish",
  mandarin: "Mandarin",
  hindi: "Hindi",
  arabic: "Arabic",
  french: "French",
  russian: "Russian",
  german: "German",
  portuguese: "Portuguese",
  italian: "Italian",
};

export const roles: RoleSchema = {
  instructor: "Instructor/ Educators",
  tutors: "Private Tutors/ Coaching centers",
  certification: "Certification bodies/ Professional orgs.",
  associations: "Trade associations/ Licensing body",
  hr: "HR of corporate",
  recruiter: "Recruiter",
  prepCompany: "Test prep company",
  freelance: "Freelance content creator",
  culturalEdu: "Cultural education provider",
  parent: "Parent",
  astrologer: "Astrologer",
};

function UserProfileDetail({ userDetail }: Props) {
  const { user } = useUser();
  const userProfile = useAppStore((state) => state.userProfile);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const institutesById = useAppStore((state) => state.institutesById);
  const {
    mutateAsync: updateDetails,
    isLoading: updatingDetails,
    isError: udpateError,
    isSuccess: updateSuccess,
  } = trpc.updateUserProfileDetails.useMutation();

  const basicForm = useForm<BaseDetailForm>({
    initialValues: {
      instituteName: userDetail.instituteName ?? "Content To Quiz",
      language: userDetail.language ?? "english",
      role: userDetail.role ?? "instructor",
    },
    mode: "controlled",
    validate: zodResolver(basicDetailForm),
  });

  const instituteOptions = useMemo(() => {
    if (institutesById) {
      return Object.entries(institutesById).map(([key, value]) => ({
        value: key,
        label: value.instituteName,
      }));
    }
    return [];
  }, [institutesById]);

  async function handleSubmit(values: BaseDetailForm) {
    const { role, language, instituteName } = values;
    const { id } = userDetail;

    try {
      await updateDetails(
        {
          role,
          instituteName,
          language,
          id,
        },
        {
          onSuccess: (data) => {
            const { code } = data;

            if (code === "SUCCESS" && userProfile) {
              setUserProfile({ ...userProfile, role, language, instituteName });
            }
          },
        }
      );
    } catch (err) {
      console.log("Profile update error");
      console.log(JSON.stringify(err, null, 2));
    }
  }

  return (
    <Flex
      direction={"column"}
      flex={1}
      w={"100%"}
      h={"100%"}
      align={"center"}
      py={"md"}
    >
      <Flex
        direction={"column"}
        w={"100%"}
        justify={"center"}
        gap={"md"}
        align={"center"}
      >
        {user && (
          <Image
            src={user.imageUrl}
            height={50}
            width={80}
            alt={`${user.firstName}`}
            style={{
              borderRadius: "90%",
            }}
          />
        )}
        <Text size="xl" fw={"bold"}>
          {userDetail.firstname} {userDetail.lastname}
        </Text>
      </Flex>
      <Divider w={"90%"} my={"lg"} />
      <Container
        w={"100%"}
        h={"100%"}
        styles={{
          root: {
            paddingInline: 0,
          },
        }}
      >
        <Tabs orientation="vertical" defaultValue="basic" h={"100%"}>
          <Tabs.List
            styles={{
              list: {
                marginRight: 10,
              },
            }}
          >
            <Tabs.Tab value="basic">Basic settings</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="basic" px={{ base: 0, lg: "xs" }}>
            <form
              style={{
                height: "100%",
                width: "100%",
              }}
              onSubmit={basicForm.onSubmit((values) => handleSubmit(values))}
            >
              <Paper withBorder radius={"md"} w={"100%"} h={"100%"} flex={1}>
                <Grid p={{ base: 5, lg: "md" }}>
                  <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Select
                      placeholder="Select language"
                      label="Default language"
                      key={basicForm.key("language")}
                      data={[
                        ...Object.entries(languages).map(([key, value]) => ({
                          label: value,
                          value: key,
                        })),
                      ]}
                      {...basicForm.getInputProps("language")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Select
                      label="User role"
                      placeholder="Select a role"
                      key={basicForm.key("role")}
                      data={[
                        ...Object.entries(roles).map(([key, value]) => ({
                          label: value,
                          value: key,
                        })),
                      ]}
                      {...basicForm.getInputProps("role")}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, lg: 6 }}>
                    <Select
                      data={instituteOptions}
                      label="Institute"
                      placeholder="Select an institute"
                      key={basicForm.key("instituteName")}
                      {...basicForm.getInputProps("instituteName")}
                    />
                  </Grid.Col>
                </Grid>
                <Button
                  variant="filled"
                  mx={{ base: 3, lg: "md" }}
                  mt={"md"}
                  type="submit"
                  loading={updatingDetails}
                >
                  Save
                </Button>
                {updateSuccess && !updatingDetails && (
                  <Alert
                    variant="light"
                    color="lime"
                    title="Success"
                    icon={<IconInfoCircle />}
                    mt={"md"}
                    mx={"lg"}
                  >
                    Profile updated successfully
                  </Alert>
                )}
                {udpateError && !updatingDetails && (
                  <Alert
                    variant="light"
                    color="orange"
                    title="Faild"
                    icon={<IconInfoCircle />}
                    mt={"md"}
                    mx={"lg"}
                  >
                    Profile update failed.
                  </Alert>
                )}
              </Paper>
            </form>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Flex>
  );
}

export { UserProfileDetail };
