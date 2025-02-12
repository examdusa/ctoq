"use client";

import { trpc } from "@/app/_trpc/client";
import { useAppStore } from "@/store/app-store";
import { SharedRecordSchema } from "@/utllities/zod-schemas-types";
import {
  ActionIcon,
  Flex,
  Group,
  Paper,
  Tabs,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronDown,
  IconChevronUp,
  IconFileCheck,
  IconShare3,
  IconUser,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { DataTable } from "mantine-datatable";
import { useMemo, useState } from "react";
import { ShareExam } from "./share-exam";

interface Props {
  records: SharedRecordSchema[];
  userId: string;
}

function RenderSharedExamsList({ records, userId }: Props) {
  const userProfile = useAppStore((state) => state.userProfile);
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  const [
    shareExamModalOpened,
    { close: closeShareExamModal, open: openShareExamModal },
  ] = useDisclosure();
  const [sharedExamsRecords, setSharedExamsRecords] = useState(records);
  const [showBy, setShowBy] = useState<"qbank" | "user">("qbank");
  const [row, setRow] = useState<SharedRecordSchema | null>(null);
  const theme = useMantineTheme();

  const { mutateAsync: fetchSharedExamRecords, isLoading: fetchingRecords } =
    trpc.getSharedExams.useMutation({
      onSettled: (data) => {
        if (data && data.code === "SUCCESS") {
          const updatedData = data.data.map((item) => ({
            ...item,
            shareDate: item.shareDate ? new Date(item.shareDate) : null,
          }));
          setSharedExamsRecords(updatedData);
        }
      },
    });

  const recordsByQBank = useMemo(() => {
    if (showBy !== "qbank") return [];
    const records = sharedExamsRecords.reduce((acc, item) => {
      const { userId, googleFormId, googleQuizLink, shareDate, prompt } = item;
      if (!acc[userId]) {
        acc[userId] = {
          prompt: prompt || "",
          gooleQuizkLink: googleQuizLink || "",
          gooleFormId: googleFormId || "",
          sharedDate: shareDate
            ? dayjs(new Date(shareDate)).format("MM-DD-YYYY hh:mm a")
            : "",
          records: [],
        };
      }

      if (userId in acc) {
        acc[userId].records.push(item as any);
      }
      return acc;
    }, {} as { [key: string]: { prompt: string; gooleQuizkLink: string; gooleFormId: string; sharedDate: string; records: SharedRecordSchema[] } });
    return Object.entries(records).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }, [sharedExamsRecords, showBy]);

  const recordsByUsers = useMemo(() => {
    if (showBy !== "user") return [];
    const records = sharedExamsRecords.reduce((acc, item) => {
      const { userId, firstName, lastName, email, shareDate } = item;
      if (!acc[userId]) {
        acc[userId] = {
          firstName: firstName || "",
          lastName: lastName || "",
          email: email || "",
          sharedDate: shareDate
            ? dayjs(new Date(shareDate)).format("MM-DD-YYYY hh:mm a")
            : "",
          records: [],
        };
      }

      if (userId in acc) {
        acc[userId].records.push(item as any);
      }
      return acc;
    }, {} as { [key: string]: { firstName: string; lastName: string; email: string; sharedDate: string; records: SharedRecordSchema[] } });
    return Object.entries(records).map(([key, value]) => ({
      id: key,
      ...value,
    }));
  }, [sharedExamsRecords, showBy]);

  return (
    <Flex
      direction={"column"}
      w={"100%"}
      h={"100%"}
      flex={1}
      align={"center"}
      gap={"xl"}
    >
      <Tabs
        color="blue"
        variant="pills"
        defaultValue="qbank"
        value={showBy}
        onChange={(value) => {
          if (value) setShowBy(value as "qbank" | "user");
        }}
        p={2}
        styles={{
          root: {
            border: `1px solid ${theme.colors.gray[4]}`,
            borderRadius: theme.radius.md,
          },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="qbank" leftSection={<IconFileCheck />}>
            By Question bank
          </Tabs.Tab>
          <Tabs.Tab value="user" leftSection={<IconUser />}>
            By User
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Paper withBorder radius={"sm"} w={"100%"} maw={"auto"}>
        {showBy === "qbank" && (
          <DataTable
            withTableBorder={true}
            borderRadius={"md"}
            withColumnBorders
            fetching={fetchingRecords ? true : false}
            highlightOnHover
            width={"100%"}
            styles={{
              root: {
                width: "100%",
              },
            }}
            columns={[
              {
                accessor: "",
                title: "",
                noWrap: true,
                render: ({ records }) => {
                  if (expandedRowIds.includes(records[0].questionRecord)) {
                    return (
                      <Group w={"100%"} justify="center">
                        <IconChevronUp />
                      </Group>
                    );
                  }
                  return (
                    <Group w={"100%"} justify="center">
                      <IconChevronDown />
                    </Group>
                  );
                },
              },
              {
                accessor: "prompt",
                title: "Question prompt",
                noWrap: true,
              },
              {
                accessor: "gooleQuizkLink",
                title: "Quiz/ Doc link",
                noWrap: true,
                defaultToggle: false,
                render: ({ gooleQuizkLink }) => {
                  if (!gooleQuizkLink) {
                    return "N/A";
                  }
                  return gooleQuizkLink;
                },
              },
              {
                accessor: "actions",
                title: "Actions",
                noWrap: true,
                toggleable: false,
                render: ({ records }, index) => {
                  const { outputType } = records[index];
                  let tooltip = "Share exam";

                  if (outputType !== "question") {
                    tooltip = "Share doc";
                  }
                  return (
                    <ActionIcon.Group>
                      <Tooltip label={tooltip}>
                        <ActionIcon
                          mr={"sm"}
                          variant="transparent"
                          size="sm"
                          onClick={() => {
                            setRow(records[index]);
                            openShareExamModal();
                          }}
                        >
                          <IconShare3 />
                        </ActionIcon>
                      </Tooltip>
                    </ActionIcon.Group>
                  );
                },
              },
            ]}
            records={recordsByQBank}
            rowExpansion={{
              allowMultiple: false,
              expanded: {
                recordIds: expandedRowIds,
                onRecordIdsChange: setExpandedRowIds,
              },
              content: ({ record: { records } }) => {
                return (
                  <DataTable
                    records={records}
                    withTableBorder={true}
                    borderRadius={"md"}
                    withColumnBorders
                    highlightOnHover
                    columns={[
                      {
                        accessor: "firstName",
                        title: "First name",
                        noWrap: false,
                        render: ({ firstName }) => {
                          if (!firstName) return "N/A";
                          return (
                            <Text fw={500} size="sm">
                              {firstName}
                            </Text>
                          );
                        },
                      },
                      {
                        accessor: "lastName",
                        title: "Last name",
                        noWrap: false,
                        render: ({ lastName }) => {
                          if (!lastName) return "N/A";
                          return (
                            <Text fw={500} size="sm">
                              {lastName}
                            </Text>
                          );
                        },
                      },
                      {
                        accessor: "email",
                        title: "User email",
                        noWrap: false,
                        render: ({ email }) => (
                          <Text fw={500} size="sm">
                            {email ?? "N/A"}
                          </Text>
                        ),
                      },
                      {
                        accessor: "shareDate",
                        title: "Share on",
                        noWrap: false,
                        render: ({ shareDate }) => {
                          if (shareDate) {
                            return dayjs(new Date(shareDate)).format(
                              "MM-DD-YYYY hh:mm a"
                            );
                          }
                          return "N/A";
                        },
                      },
                    ]}
                  />
                );
              },
            }}
          />
        )}
        {showBy === "user" && (
          <DataTable
            withTableBorder={true}
            borderRadius={"md"}
            fetching={fetchingRecords ? true : false}
            withColumnBorders
            highlightOnHover
            width={"100%"}
            styles={{
              root: {
                width: "100%",
              },
            }}
            columns={[
              {
                accessor: "",
                title: "",
                noWrap: true,
                render: ({ id }) => {
                  if (expandedRowIds.includes(id)) {
                    return (
                      <Group w={"100%"} justify="center">
                        <IconChevronUp />
                      </Group>
                    );
                  }
                  return (
                    <Group w={"100%"} justify="center">
                      <IconChevronDown />
                    </Group>
                  );
                },
              },
              {
                accessor: "firstName",
                title: "First name",
                noWrap: true,
              },
              {
                accessor: "lastName",
                title: "Last name",
                noWrap: true,
              },
              {
                accessor: "email",
                title: "Email",
                noWrap: true,
              },
              {
                accessor: "sharedDate",
                title: "Shared on",
                noWrap: true,
              },
            ]}
            records={recordsByUsers}
            rowExpansion={{
              allowMultiple: false,
              expanded: {
                recordIds: expandedRowIds,
                onRecordIdsChange: setExpandedRowIds,
              },
              content: ({ record: { records } }) => {
                return (
                  <DataTable
                    records={records}
                    withTableBorder={true}
                    borderRadius={"md"}
                    withColumnBorders
                    highlightOnHover
                    columns={[
                      {
                        accessor: "prompt",
                        title: "Question prompt",
                        noWrap: false,
                      },
                      {
                        accessor: "gooleQuizkLink",
                        title: "Quiz/ Doc link",
                        noWrap: true,
                        defaultToggle: false,
                        render: ({ googleQuizLink }) => {
                          if (!googleQuizLink) {
                            return "N/A";
                          }
                          return googleQuizLink;
                        },
                      },
                      {
                        accessor: "actions",
                        title: "Actions",
                        noWrap: true,
                        toggleable: false,
                        render: (_, index) => {
                          const { outputType } = records[index];
                          let tooltip = "Share exam";

                          if (outputType !== "question") {
                            tooltip = "Share doc";
                          }
                          return (
                            <ActionIcon.Group>
                              <Tooltip label={tooltip}>
                                <ActionIcon
                                  mr={"sm"}
                                  variant="transparent"
                                  size="sm"
                                  onClick={() => {
                                    setRow(records[index]);
                                    openShareExamModal();
                                  }}
                                >
                                  <IconShare3 />
                                </ActionIcon>
                              </Tooltip>
                            </ActionIcon.Group>
                          );
                        },
                      },
                    ]}
                  />
                );
              },
            }}
          />
        )}
      </Paper>
      {shareExamModalOpened && row && userProfile && (
        <ShareExam
          opened={shareExamModalOpened}
          close={() => {
            setRow(null);
            closeShareExamModal();
          }}
          record={row}
          userProfile={userProfile}
          updateList={async (data: SharedRecordSchema) => {
            await fetchSharedExamRecords(userId);
          }}
        />
      )}
    </Flex>
  );
}

export { RenderSharedExamsList };
