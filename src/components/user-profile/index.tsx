"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectUser } from "@/db/schema";
import { useAppStore } from "@/store/app-store";
import { useUser } from "@clerk/nextjs";
import {
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Paper,
  Select,
  Tabs,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { z } from "zod";

interface Props {
  userDetail: SelectUser;
}

const basicDetailForm = z.object({
  language: z.string({ message: "Select a laguage" }),
  role: z.string(),
  instituteName: z.string({ message: "Enter institute name" }),
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
  const {
    mutateAsync: updateDetails,
    isLoading: updatingDetails,
    isError: udpateError,
  } = trpc.updateUserProfileDetails.useMutation();

  const basicForm = useForm<BaseDetailForm>({
    initialValues: {
      instituteName: userDetail.instituteName ?? "Content To Quiz",
      language: userDetail.language ?? "english",
      role: userDetail.role ?? "instructor",
    },
    mode: "controlled",
    validate: {
      instituteName: (value) => (!value ? "Enter institute name" : null),
      language: (value) => (!value ? "Select a language" : null),
      role: (value) => (!value ? "Select a role" : null),
    },
  });

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
      <Container w={"100%"} h={"100%"}>
        <Tabs
          variant="pills"
          orientation="vertical"
          defaultValue="basic"
          h={"100%"}
        >
          <Tabs.List
            styles={{
              list: {
                marginRight: 10,
              },
            }}
          >
            <Tabs.Tab value="basic">Basic settings</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="basic">
            <form
              style={{
                height: "100%",
                width: "100%",
              }}
              onSubmit={basicForm.onSubmit((values) => handleSubmit(values))}
            >
              <Paper withBorder radius={"md"} w={"100%"} h={"100%"} flex={1}>
                <Grid p={"md"}>
                  <Grid.Col span={6}>
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
                  <Grid.Col span={6}>
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
                  <Grid.Col span={6}>
                    <TextInput
                      label="Institute name"
                      placeholder="Enter institute name"
                      key={basicForm.key("instituteName")}
                      {...basicForm.getInputProps("instituteName")}
                    />
                  </Grid.Col>
                </Grid>
                <Button
                  variant="filled"
                  mx={"md"}
                  mt={"md"}
                  type="submit"
                  loading={updatingDetails}
                >
                  Save
                </Button>
              </Paper>
            </form>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Flex>
  );
}

export { UserProfileDetail };
