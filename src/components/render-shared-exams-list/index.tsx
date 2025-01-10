"use client";
import { GroupedRecords } from "@/app/shared-exams/[id]/page";
import { useAppStore } from "@/store/app-store";
import { SharedRecordSchema } from "@/utllities/zod-schemas-types";
import { ActionIcon, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconShare3 } from "@tabler/icons-react";
import dayjs from "dayjs";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { ShareExam } from "./share-exam";

interface Props {
  records: GroupedRecords;
}

function RenderSharedExamsList({ records }: Props) {
  const [localRecords, setLocalRecords] = useState<GroupedRecords>(records);
  const userProfile = useAppStore((state) => state.userProfile);
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  const [
    shareExamModalOpened,
    { close: closeShareExamModal, open: openShareExamModal },
  ] = useDisclosure();

  const [row, setRow] = useState<SharedRecordSchema | null>(null);

  function updateLocalRecords(data: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    shareDate: Date;
  }) {
    const { firstName, lastName, email, shareDate } = data;

    const qBank = { ...localRecords };
    if (row && row.questionRecord) {
      const records = [...localRecords[row.questionRecord].records];
      records.push({
        ...records[0],
        firstName,
        lastName,
        email,
        shareDate: shareDate,
      });
      qBank[row.questionRecord].records = [...records];

      setLocalRecords({
        ...qBank,
      });
    }
  }

  const tableData = Object.entries(localRecords).map(([key, value]) => ({
    id: key,
    records: value,
    prompt: value.prompt,
    gooleQuizkLink: value.records[0].googleQuizLink,
    gooleFormId: value.records[0].googleFormId,
    actions: <></>,
  }));

  return (
    <>
      <DataTable
        withTableBorder={true}
        borderRadius={"md"}
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
            accessor: "id",
            title: "Question Id",
            noWrap: true,
            width: 300,
          },
          {
            accessor: "prompt",
            title: "Question prompt",
            noWrap: true,
          },
          {
            accessor: "gooleQuizkLink",
            title: "Quiz link",
            noWrap: true,
            defaultToggle: false,
            render: ({ gooleQuizkLink }) => {
              if (!gooleQuizkLink) {
                return "N/A";
              }
              return (
                <ActionIcon variant="transparent" component="a" target="_blank">
                  <IconShare3 />
                </ActionIcon>
              );
            },
          },
          {
            accessor: "gooleFormId",
            title: "Doc link",
            noWrap: true,
            render: ({ gooleFormId }) => {
              if (!gooleFormId) {
                return "N/A";
              }
              return gooleFormId;
            },
          },
          {
            accessor: "actions",
            title: "Actions",
            noWrap: true,
            toggleable: false,
            render: ({ records }, index) => {
              const { outputType, id } = records.records[index];
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
                        setRow(records.records[index]);
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
        records={tableData}
        rowExpansion={{
          allowMultiple: false,
          expanded: {
            recordIds: expandedRowIds,
            onRecordIdsChange: setExpandedRowIds,
          },
          content: ({ record: { records } }) => {
            return (
              <DataTable
                records={records.records}
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
                    title: "Share date",
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
      {shareExamModalOpened && row && userProfile && (
        <ShareExam
          opened={shareExamModalOpened}
          close={() => {
            setRow(null);
            closeShareExamModal();
          }}
          record={row}
          userProfile={userProfile}
          updateList={(firstName, lastName, email, createDate) => {
            updateLocalRecords({
              firstName,
              lastName,
              email,
              shareDate: createDate,
            });
          }}
        />
      )}
    </>
  );
}

export { RenderSharedExamsList };
