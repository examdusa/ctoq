"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { PendingJobDetail, useAppStore } from "@/store/app-store";
import { extractHeadingFromMarkdown } from "@/utllities/helpers";
import { useCallback, useEffect, useRef } from "react";

function PendingJobsHandler() {
  const { mutateAsync: addQBankRecord } =
    trpc.addQuestionBankRecord.useMutation();
  const updateQuestionsList = useAppStore((state) => state.updateQuestionsList);
  const userProfile = useAppStore((state) => state.userProfile);
  const pendingJobsWithId = useAppStore((state) => state.pendingJobsWithId);
  const deletePendingJob = useAppStore((state) => state.deletePendingJob);
  const ongoingJobPolling = useRef<Set<string>>(new Set());

  const { mutateAsync: pollGeneratedResult } =
    trpc.fetchGeneratedQuestions.useMutation({
      retry: (_, error) => {
        if (error.message === "PROCESSING") {
          return true;
        }
        return false;
      },
      retryDelay: 2500,
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
      await pollGeneratedResult(
        { ...job },
        {
          onSuccess: async (data) => {
            if (!data) return;
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

                const { resume_data } = result;

                let kwd = keyword;
                if ("name" in resume_data) {
                  kwd = resume_data.name;
                }

                if (outputType === "guidance") {
                  const heading = extractHeadingFromMarkdown(result.guidance);

                  if (heading) {
                    kwd = heading;
                  }
                }

                if (outputType === "summary") {
                  const heading = extractHeadingFromMarkdown(result.summary);

                  if (heading) {
                    kwd = heading;
                  }
                }

                const { instituteName } = userProfile;
                const { code, data } = await addQBankRecord({
                  data: {
                    jobId,
                    keyword: kwd,
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
        }
      );
    },
    [userProfile, addToQuestionsList, pollGeneratedResult, addQBankRecord]
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
