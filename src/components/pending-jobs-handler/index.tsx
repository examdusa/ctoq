"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { PendingJobDetail, useAppStore } from "@/store/app-store";
import { pollGeneratedResult } from "@/utllities/apiFunctions";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

function PendingJobsHandler() {
  const { mutate: fetchGeneratedQuestions } =
    trpc.fetchGeneratedQuestions.useMutation();
  const { mutateAsync: addQBankRecord } =
    trpc.addQuestionBankRecord.useMutation();
  const updateQuestionsList = useAppStore((state) => state.updateQuestionsList);
  const userProfile = useAppStore((state) => state.userProfile);
  const pendingJobsWithId = useAppStore((state) => state.pendingJobsWithId);
  const deletePendingJob = useAppStore((state) => state.deletePendingJob);
  const ongoingJobPolling = useRef<Set<string>>(new Set());
  const { mutateAsync: deleteQuestionRecord } = trpc.deleteQBank.useMutation();
  const { mutateAsync: pollResult } = useMutation({
    mutationFn: pollGeneratedResult,
    retry: (_, error) => {
      if ((error as any) === "TIMEOUT") {
        return true;
      }
      return false;
    },
    retryDelay: 5000,
  });

  const addToQuestionsList = useCallback(
    (job_id: string, result: SelectQuestionBank) => {
      updateQuestionsList({ [result.id]: result });
      deletePendingJob(job_id);
    },
    [updateQuestionsList, deletePendingJob]
  );

  const pollPendingJobsResult = useCallback(
    async (job: PendingJobDetail) => {
      await pollResult(
        { ...job },
        {
          onSuccess: async (data) => {
            const { code, data: result } = data;
            if (code === "SUCCESS") {
              ongoingJobPolling.current.delete(job.jobId);

              if (result && userProfile) {
                const {
                  difficulty,
                  jobId,
                  keyword,
                  outputType,
                  qCount,
                  questionType,
                  userId,
                  contentType,
                } = job;
                const { instituteName } = userProfile;
                const { code, data } = await addQBankRecord({
                  data: {
                    jobId,
                    keyword,
                    outputType,
                    qCount,
                    questionType,
                    result,
                    userId,
                    difficulty,
                    instituteName,
                    contentType,
                  },
                });
                if (code === "SUCCESS") {
                  if (data) addToQuestionsList(job.jobId, { ...data });
                }
              }
            }
          },
          onError: async (err) => {
            console.error(
              `Error polling job ${job.jobId}:`,
              JSON.stringify(err, null, 2)
            );

            if ((err as any) === "TIMEOUT") {
              await pollResult({ ...job });
            }
          },
        }
      );
    },
    [userProfile, addToQuestionsList, pollResult, addQBankRecord]
  );

  useEffect(() => {
    if (Object.keys(pendingJobsWithId).length > 0) {
      Object.values(pendingJobsWithId).forEach((job) => {
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
