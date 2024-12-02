import { SelectQuestionBank, SelectSubscription } from "@/db/schema";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface State {
  questions: Record<string, SelectQuestionBank>;
  subscription: SelectSubscription | undefined;
  renderQIdx: string,
  generatingQuestions: boolean
}

interface Actions {
  setQuestions: (questions: Record<string, SelectQuestionBank>) => void;
  setSubscription: (subscription: SelectSubscription | undefined) => void;
}

export type Store = State & Actions;

export const defaultStoreState: State = {
  questions: {},
  subscription: undefined,
  renderQIdx: '',
  generatingQuestions: false
};

export const useAppStore = create<Store>()(
  devtools(
    persist(
      (set) => ({
        ...defaultStoreState,
        setQuestions: (questions) => set({ questions }),
        setSubscription: (subscription) => set({ subscription }),
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
);
