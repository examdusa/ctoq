"use client";

import { trpc } from "@/app/_trpc/client";
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

  const { mutateAsync: getProfileDetails, data: userProfileDetails } =
    trpc.getProfileDetails.useMutation();
  const { mutateAsync: saveUserDetails } = trpc.saveUserDetails.useMutation();

  const { mutateAsync: getAllInstitute, data: institutes } = useMutation({
    mutationFn: getInstitutes,
    onSuccess: (data) => {
      const institutes = data.reduce<Record<string, Institute>>(
        (acc, institute) => {
          acc[institute.guid] = { ...institute };
          return acc;
        },
        {}
      );
      setInstitutes(institutes);
    },
    onError: (err) => {
      console.log(JSON.stringify(err, null, 2));
      setInstitutes({});
    },
  });

  useEffect(() => {
    if (!institutes) {
      async function fetchData() {
        await getAllInstitute();
      }
      fetchData();
    }
  }, [institutes, getAllInstitute]);

  useEffect(() => {
    if (user && isLoaded && isSignedIn && !userProfileDetails) {
      const { id } = user;
      async function fetchUserProfileDetails() {
        await getProfileDetails(
          { userId: id },
          {
            onSuccess: (data) => {
              if (data.data)
                setUserProfile({
                  ...data.data,
                  createdAt: new Date(data.data.createdAt),
                });
            },
            onError: async (err) => {
              console.log(JSON.stringify(err, null, 2));
              if (user) {
                await saveUserDetails(
                  {
                    appTheme: "dark",
                    email: user.emailAddresses[0].emailAddress,
                    firstname: user.firstName,
                    googleid: "",
                    id: user.id,
                    lastname: user.lastName,
                    language: "english",
                    role: "instructor",
                  },
                  {
                    onSuccess: (data) => {
                      setUserProfile({
                        ...data,
                        createdAt: new Date(data.createdAt),
                      });
                    },
                    onError: (err) => {
                      console.log(JSON.stringify(err, null, 2));
                    },
                  }
                );
              }
            },
          }
        );
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
    userProfileDetails,
    getProfileDetails,
    saveUserDetails,
    setUserProfile,
  ]);

  return null;
}

export { AppOrchestrator };

