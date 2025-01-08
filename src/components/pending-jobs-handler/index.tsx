"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { PendingJobDetail, useAppStore } from "@/store/app-store";
import { useCallback, useEffect, useRef } from "react";

function PendingJobsHandler() {
  const { mutate: fetchGeneratedQuestions } =
    trpc.fetchGeneratedQuestions.useMutation();
  const updateQuestionsList = useAppStore((state) => state.updateQuestionsList);
  const pendingJobsWithId = useAppStore((state) => state.pendingJobsWithId);
  const deletePendingJob = useAppStore((state) => state.deletePendingJob);
  const ongoingJobPolling = useRef<Set<string>>(new Set());
  const { mutateAsync: deleteQuestionRecord } = trpc.deleteQBank.useMutation();

  const addToQuestionsList = useCallback(
    (job_id: string, result: SelectQuestionBank) => {
      updateQuestionsList({ [result.id]: result });
      deletePendingJob(job_id);
    },
    [updateQuestionsList, deletePendingJob]
  );

  const pollPendingJobsResult = useCallback(
    async (job: PendingJobDetail) => {
      const intervalId = setInterval(() => {
        fetchGeneratedQuestions(
          { ...job },
          {
            onSuccess: (data) => {
              if (data !== "pending" && data !== "TIMEOUT_ERROR") {
                clearInterval(intervalId);
                ongoingJobPolling.current.delete(job.jobId);

                if (data.createdAt) {
                  addToQuestionsList(job.jobId, { ...data });
                }
              }
            },
            onError: async (err) => {
              if (err instanceof Error) {
                console.error(
                  `Error polling job ${job.jobId}:`,
                  JSON.stringify(err, null, 2)
                );
                await deleteQuestionRecord({ questionId: job.jobId });

                clearInterval(intervalId);
                ongoingJobPolling.current.delete(job.jobId);
              }
            },
          }
        );
      }, 30000);
      // await fetchGeneratedQuestions(
      //   { ...job },
      //   {
      //     onSuccess: (data) => {
      //       if (typeof data === "string" && data === "pending") {
      //         pollPendingJobsResult(job);
      //       } else {
      //         ongoingJobPolling.current.delete(job.jobId);
      //         if (data.createdAt)
      //           addToQuestionsList(job.jobId, {
      //             ...data,
      //           });
      //       }
      //     },
      //     onError: async (err) => {
      //       if (err instanceof Error) {
      //         console.error(JSON.stringify(err, null, 2));
      //         await deleteQuestionRecord({ questionId: job.jobId });
      //         ongoingJobPolling.current.delete(job.jobId);
      //       }
      //     },
      //   }
      // );
    },
    [fetchGeneratedQuestions, addToQuestionsList, deleteQuestionRecord]
  );

  useEffect(() => {
    if (pendingJobsWithId.length > 0) {
      pendingJobsWithId.forEach((job) => {
        if (!ongoingJobPolling.current.has(job.jobId)) {
          ongoingJobPolling.current.add(job.jobId);
          pollPendingJobsResult(job);
        }
      });
    }
    return () => {
      ongoingJobPolling.current.clear();
    };
  }, [pendingJobsWithId, pollPendingJobsResult]);

  return null;
}

export default PendingJobsHandler;
