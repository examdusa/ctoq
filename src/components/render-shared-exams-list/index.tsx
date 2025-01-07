"use client";
import { SharedExamDetail } from "@/app/shared-exams/[id]/page";
import { Flex, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import clsx from "clsx";
import dayjs from "dayjs";
import { DataTable } from "mantine-datatable";
import { useMemo, useState } from "react";
import classes from "./styles.module.css";

interface Props {
  exams: Record<string, { records: SharedExamDetail[]; propmt: string }>;
}

function RenderSharedExamsList({ exams }: Props) {
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);

  const tableData = Object.entries(exams).map(([key, value]) => ({
    id: key,
    prompt: value.propmt,
  }));

  const sharedWithRecords = useMemo(() => {
    if (expandedRowIds.length === 0) return [];
    return [...exams[expandedRowIds[0]].records];
  }, [expandedRowIds, exams]);

  return (
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
          render: ({ id }) => (
            <Flex direction="row" w={"100%"} gap={"sm"}>
              <IconChevronRight
                className={clsx(classes.icon, classes.expandIcon, {
                  [classes.expandIconRotated]: expandedRowIds.includes(id),
                })}
                cursor={"pointer"}
              />
              <Text fw={500} size="sm">
                {id}
              </Text>
            </Flex>
          ),
        },
        {
          accessor: "prompt",
          title: "Question prompt",
          noWrap: true,
          render: ({ prompt, id }) => (
            <Text fw={500} size="sm">
              {prompt}
            </Text>
          ),
        },
      ]}
      records={tableData}
      rowExpansion={{
        allowMultiple: false,
        expanded: {
          recordIds: expandedRowIds,
          onRecordIdsChange: setExpandedRowIds,
        },
        content: (record) => {
          return (
            <DataTable
              records={sharedWithRecords}
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
  );
}

export { RenderSharedExamsList };
