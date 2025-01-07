import {
  SelectQuestionBank,
  SelectSubscription,
  userProfile,
} from "@/db/schema";
import { UserProfileSchema } from "@/utllities/zod-schemas-types";
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
  pendingJobsWithId: {
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
  }[];
  userProfile: UserProfileSchema | null;
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
}

interface Actions {
  setQuestions: (questions: Record<string, SelectQuestionBank>) => void;
  setSubscription: (subscription: SelectSubscription | undefined) => void;
  addToPendingJobs: (job: PendingJobDetail) => void;
  setUserProfile: (profile: UserProfileSchema) => void;
  updateQuestionsList: (questions: Record<string, SelectQuestionBank>) => void;
}

export type Store = State & Actions;

export const defaultStoreState: State = {
  questions: {},
  subscription: undefined,
  renderQIdx: "",
  generatingQuestions: false,
  pendingJobsWithId: [],
  userProfile: null,
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
            const pendingJobs = [...get().pendingJobsWithId];
            set({ pendingJobsWithId: [...pendingJobs, job] });
          },
          setUserProfile: (profile) => {
            set({ userProfile: profile });
          },
          updateQuestionsList: (questions) => {
            const qList = { ...get().questions };
            set({ questions: { ...qList, ...questions } });
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
