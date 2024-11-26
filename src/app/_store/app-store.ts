import { SelectQuestionBank, SelectSubscription } from "@/db/schema";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface State {
  questions: SelectQuestionBank[];
  subscription: SelectSubscription | undefined;
}

interface Actions {
  setQuestions: (questions: SelectQuestionBank[]) => void;
  setSubscription: (subscription: SelectSubscription) => void;
}

const initialState: State = {
  questions: [],
  subscription: undefined,
};

export const useAppStore = create(
  devtools(persist<State & Actions>(
    (set) => ({
      ...initialState,
      setQuestions: (questions) => set({ questions: [...questions] }),
      setSubscription: (subscription) => set({ subscription: subscription }),
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => localStorage),
    }
  ))
);
