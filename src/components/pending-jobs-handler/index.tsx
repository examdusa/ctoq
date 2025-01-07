"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { PendingJobDetail, useAppStore } from "@/store/app-store";
import { BaseResultSchema } from "@/utllities/zod-schemas-types";
import { Notification, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef } from "react";

function PendingJobsHandler() {
  const { mutateAsync: fetchGeneratedQuestions } =
    trpc.fetchGeneratedQuestions.useMutation();
  const updateQuestionsList = useAppStore((state) => state.updateQuestionsList);
  const userProfile = useAppStore((state) => state.userProfile);
  const completedJobs = useRef<BaseResultSchema[]>([]);
  const [
    showCmpltNoficiation,
    { close: closeNotification, open: openNotificaiton },
  ] = useDisclosure();

  useEffect(() => {
    const unsubscribe = useAppStore.subscribe(
      (state) => state.pendingJobsWithId,
      (jobs) => {
        let timeout: NodeJS.Timeout | null = null;
        const jobsById: { [key: string]: PendingJobDetail } = jobs.reduce<
          Record<string, PendingJobDetail>
        >((acc, job) => {
          acc[job.jobId] = { ...job };
          return acc;
        }, {});
        if (jobs.length > 0) {
          timeout = setInterval(async () => {
            completedJobs.current = [];
            const pendingJobs: PendingJobDetail[] = [];
            const results = await Promise.all(
              jobs.map((job) => fetchGeneratedQuestions({ ...job }))
            );

            results.forEach((result, index) => {
              if (typeof result === "string" && result === "pending") {
                pendingJobs.push(jobs[index]);
              } else {
                completedJobs.current.push({ ...result });
                openNotificaiton();
              }
            });

            if (pendingJobs.length === 0) {
              if (timeout) clearInterval(timeout);
            }

            useAppStore.setState({ pendingJobsWithId: [...pendingJobs] });
          }, 5000);

          if (completedJobs.current.length > 0 && userProfile) {
            const questions = completedJobs.current.reduce<
              Record<string, SelectQuestionBank>
            >((acc, job) => {
              const {
                difficulty,
                jobId,
                keyword,
                outputType,
                qCount,
                questionType,
                userId,
              } = jobsById[job.job_id];
              const { guidance, summary, questions } = job;
              const x: SelectQuestionBank = {
                userId: userId,
                id: jobId,
                createdAt: null,
                jobId: jobId,
                questions,
                summary,
                guidance,
                withAnswer: null,
                questionType: questionType,
                outputType,
                instituteName: userProfile.instituteName,
                difficultyLevel: difficulty,
                questionsCount: qCount,
                prompt: keyword,
                promptUrl: "",
                googleQuizLink: null,
                googleFormId: null,
              };
              acc[job.job_id] = { ...x };
              return acc;
            }, {});
            updateQuestionsList(questions);
          }
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [
    fetchGeneratedQuestions,
    updateQuestionsList,
    userProfile,
    openNotificaiton,
  ]);

  if (showCmpltNoficiation) {
    return completedJobs.current.map((job) => {
      return (
        <Notification title="Result is ready" key={job.job_id}>
          <Text fw={500} size="sm">
            Results are generated for the job: ${job.job_id}
          </Text>
        </Notification>
      );
    });
  }

  return null;
}

export default PendingJobsHandler;
