"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { defaultStoreState, useAppStore } from "@/store/app-store";
import { getInstitutes } from "@/utllities/apiFunctions";
import { Institute } from "@/utllities/zod-schemas-types";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

function AppOrchestrator() {
  const { isLoaded, isSignedIn, user } = useUser();
  const setInstitutes = useAppStore((state) => state.setInstitues);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const setQuestions = useAppStore((state) => state.setQuestions);
  const setSubscription = useAppStore((state) => state.setSubscription);
  const institutesById = useAppStore((state) => state.institutesById);
  const userProfile = useAppStore((state) => state.userProfile);
  const questions = useAppStore((state) => state.questions);
  const subscription = useAppStore((state) => state.subscription);

  const { mutateAsync: getProfileDetails } =
    trpc.getProfileDetails.useMutation();
  const { mutateAsync: saveUserDetails } = trpc.saveUserDetails.useMutation();
  const { mutateAsync: fetchUserQuestionBank } =
    trpc.getQuestions.useMutation();
  const { mutateAsync: getSubscriptionDetails } =
    trpc.getSubscriptionDetails.useMutation();

  const { mutateAsync: getAllInstitute } = useMutation({
    mutationFn: getInstitutes,
    onSuccess: (data) => {
      const institutes = data.reduce<Record<string, Institute>>(
        (acc, institute) => {
          acc[institute.guid] = { ...institute };
          return acc;
        },
        {}
      );
      if (Object.keys(institutes).length === 0) {
        setInstitutes(null);
      }
      setInstitutes(institutes);
    },
    onError: (err) => {
      console.log(JSON.stringify(err, null, 2));
      setInstitutes({});
    },
  });

  useEffect(() => {
    if (user && isLoaded && isSignedIn && !userProfile && !institutesById) {
      const { id } = user;
      async function fetchUserProfileDetails() {
        const [profileDetials, questions, subscriptionDetails] =
          await Promise.all([
            getProfileDetails({ userId: id }),
            fetchUserQuestionBank({ userId: id }),
            getSubscriptionDetails({ userId: id }),
            getAllInstitute(),
          ]);

        const { code, data } = profileDetials;

        if (code === "SUCCESS" && data) {
          setUserProfile({
            ...data,
            createdAt: new Date(data.createdAt),
          });
        }
        // else if (code === "USER_NOT_FOUND" || !data) {
        //   if (user) {
        //     await saveUserDetails(
        //       {
        //         appTheme: "dark",
        //         email: user.emailAddresses[0].emailAddress,
        //         firstname: user.firstName,
        //         googleid: "",
        //         id: user.id,
        //         lastname: user.lastName,
        //         language: "english",
        //         role: "instructor",
        //       },
        //       {
        //         onSuccess: (data) => {
        //           setUserProfile({
        //             ...data,
        //             createdAt: new Date(data.createdAt),
        //           });
        //         },
        //         onError: (err) => {
        //           console.log(JSON.stringify(err, null, 2));
        //         },
        //       }
        //     );
        //   }
        // }

        if (questions) {
          const formattedQuestions: Record<string, SelectQuestionBank> = {};
          if (questions) {
            questions.forEach((item) => {
              formattedQuestions[item.id] = {
                ...item,
                questions: item.questions,
              };
            });
          }
          setQuestions(formattedQuestions);
        } else {
          setQuestions({});
        }

        if (
          subscriptionDetails.code === "SUCCESS" &&
          subscriptionDetails.data
        ) {
          setSubscription(subscriptionDetails.data);
        }
      }

      fetchUserProfileDetails();
    }

    if (!isSignedIn) {
      useAppStore.setState({ ...defaultStoreState });
    }
  }, [
    user,
    isLoaded,
    isSignedIn,
    getProfileDetails,
    saveUserDetails,
    setUserProfile,
    institutesById,
    userProfile,
    questions,
    subscription,
    fetchUserQuestionBank,
    getAllInstitute,
    getSubscriptionDetails,
    setQuestions,
    setSubscription,
  ]);

  return null;
}

export { AppOrchestrator };
