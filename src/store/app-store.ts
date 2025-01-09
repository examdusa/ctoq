import { SelectQuestionBank, SelectSubscription } from "@/db/schema";
import { Institute, UserProfileSchema } from "@/utllities/zod-schemas-types";
import { create } from "zustand";
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";

interface State {
  questions: Record<string, SelectQuestionBank>;
  subscription: SelectSubscription | undefined;
  renderQIdx: string;
  generatingQuestions: boolean;
  pendingJobsWithId: Record<
    string,
    {
      jobId: string;
      userId: string;
      questionType:
        | "mcq"
        | "mcq_similar"
        | "fill_blank"
        | "true_false"
        | "open_ended";
      qCount: number;
      keyword: string;
      difficulty: "easy" | "medium" | "hard";
      outputType: "question" | "summary" | "guidance";
      contentType: string;
    }
  >;
  userProfile: UserProfileSchema | null;
  institutesById: { [key: string]: Institute };
}

interface PendingJobDetail {
  jobId: string;
  userId: string;
  questionType:
    | "mcq"
    | "mcq_similar"
    | "fill_blank"
    | "true_false"
    | "open_ended";
  qCount: number;
  keyword: string;
  difficulty: "easy" | "medium" | "hard";
  outputType: "question" | "summary" | "guidance";
  contentType: string;
}

interface Actions {
  setQuestions: (questions: Record<string, SelectQuestionBank>) => void;
  setSubscription: (subscription: SelectSubscription | undefined) => void;
  addToPendingJobs: (job: PendingJobDetail) => void;
  setUserProfile: (profile: UserProfileSchema) => void;
  updateQuestionsList: (questions: Record<string, SelectQuestionBank>) => void;
  deletePendingJob: (jobId: string) => void;
  setInstitues: (institutes: { [key: string]: Institute }) => void;
}

export type Store = State & Actions;

export const defaultStoreState: State = {
  questions: {},
  subscription: undefined,
  renderQIdx: "",
  generatingQuestions: false,
  pendingJobsWithId: {},
  userProfile: null,
  institutesById: {},
};

export const useAppStore = create<Store>()(
  subscribeWithSelector(
    devtools(
      persist(
        (set, get) => ({
          ...defaultStoreState,
          setQuestions: (questions) => set({ questions }),
          setSubscription: (subscription) => set({ subscription }),
          addToPendingJobs: (job) => {
            const pendingJobs = { ...get().pendingJobsWithId };
            if (!(job.jobId in pendingJobs)) {
              set({
                pendingJobsWithId: { ...pendingJobs, [job.jobId]: { ...job } },
              });
            }
          },
          setUserProfile: (profile) => {
            set({ userProfile: profile });
          },
          updateQuestionsList: (questions) => {
            const qList = { ...get().questions };
            set({ questions: { ...qList, ...questions } });
          },
          deletePendingJob: (jobId) => {
            const pendingJobs = { ...get().pendingJobsWithId };
            const jobs = Object.entries(pendingJobs).reduce<
              Record<string, PendingJobDetail>
            >((acc, [, value]) => {
              if (value.jobId !== jobId) {
                acc[value.jobId] = { ...value };
              }
              return acc;
            }, {});
            set({ pendingJobsWithId: { ...jobs } });
          },
          setInstitues: (institutes) => {
            set({ institutesById: institutes });
          },
        }),
        {
          name: "app-store",
          storage: createJSONStorage(() => localStorage),
          merge: (persistedState, currentState) => ({
            ...currentState,
            ...(persistedState as Store),
          }),
        }
      )
    )
  )
);

export type { PendingJobDetail };
