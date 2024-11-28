import { SelectQuestionBank, SelectSubscription } from "@/db/schema";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface State {
  questions: Record<string, SelectQuestionBank>;
  subscription: SelectSubscription | undefined;
}

interface Actions {
  setQuestions: (questions: Record<string, SelectQuestionBank>) => void;
  setSubscription: (subscription: SelectSubscription) => void;
}

export const initialState: State = {
  questions: {},
  subscription: undefined,
};

export const useAppStore = create(
  devtools(
    persist<State & Actions>(
      (set) => ({
        ...initialState,
        setQuestions: (questions) => set({ questions }),
        setSubscription: (subscription) => set({ subscription: subscription }),
      }),
      {
        name: "app-store",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
