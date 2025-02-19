"use client";

import { trpc } from "@/app/_trpc/client";
import { SelectQuestionBank } from "@/db/schema";
import { defaultStoreState, PlanDetails, useAppStore } from "@/store/app-store";
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
  const setSubscrptionPlans = useAppStore((state) => state.setSubscrptionPlans);
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
  const { refetch: fetchSubscriptionPlans } = trpc.fetchProductPrices.useQuery(
    undefined,
    { enabled: false }
  );
  const { refetch: fetchProducts } = trpc.fetchProducts.useQuery(undefined, {
    enabled: false,
  });

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
      async function initData() {
        const [
          profileDetials,
          questions,
          subscriptionDetails,
        ] = await Promise.all([
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

      initData();
    } else {
      (async() => {
        const [subscriptionPlans,
          products] = await Promise.all([fetchSubscriptionPlans(),
          fetchProducts()])
          if (
            subscriptionPlans.data?.code === "SUCCESS" &&
            products.data?.code === "SUCCESS"
          ) {
            const productsById = { ...products.data.data };
            const plans: PlanDetails[] = [];
            subscriptionPlans.data.data.data.forEach((item) => {
              if (item.product in productsById) {
                plans.push({
                  ...productsById[item.product],
                  amount: item.unit_amount,
                });
              }
            });
  
            setSubscrptionPlans(plans);
          }
      })()
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
    fetchProducts,
    getAllInstitute,
    getSubscriptionDetails,
    setQuestions,
    setSubscription,
    fetchSubscriptionPlans,
    setSubscrptionPlans,
  ]);

  return null;
}

export { AppOrchestrator };
