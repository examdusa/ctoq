import { SelectQuestionBank, SelectSubscription } from "@/db/schema";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

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

export type Store = State & Actions;

export const useAppStore = create(
  devtools(
    persist<Store>(
      (set) => ({
        ...initialState,
        setQuestions: (questions) => set({ questions }),
        setSubscription: (subscription) => set({ subscription: subscription }),
      }),
      {
        name: "app-store",
      }
    )
  )
);
