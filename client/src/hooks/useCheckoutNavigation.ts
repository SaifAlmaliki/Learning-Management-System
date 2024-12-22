/**
 * Summary:
 * This file defines a custom React hook `useCheckoutNavigation` for handling
 * navigation logic during a multi-step checkout process in a Next.js application.
 *
 * Key Features:
 * - Dynamically controls navigation between checkout steps.
 * - Redirects unauthenticated users to step 1 if they attempt to access other steps.
 * - Prevents scrolling when navigating between steps.
 * - Utilizes `useUser` from Clerk for authentication checks.
 */

"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect } from "react";

/**
 * Custom hook to manage checkout step navigation.
 *
 * @returns { checkoutStep, navigateToStep }
 *   - `checkoutStep`: Current step in the checkout process.
 *   - `navigateToStep`: Function to programmatically navigate to a specified step.
 */
export const useCheckoutNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useUser();

  // Retrieve `id` (course ID) and `step` (checkout step) from URL search parameters
  const courseId = searchParams.get("id") ?? ""; // Default to empty string if `id` is not provided
  const checkoutStep = parseInt(searchParams.get("step") ?? "1", 10); // Default to step 1

  /**
   * Navigates to a specific step in the checkout process.
   * - Ensures the step is between 1 and 3.
   * - Includes the `showSignUp` parameter based on user authentication status.
   *
   * @param step - The desired checkout step to navigate to.
   */
  const navigateToStep = useCallback(
    (step: number) => {
      const newStep = Math.min(Math.max(1, step), 3); // Constrain step to range [1, 3]
      const showSignUp = isSignedIn ? "true" : "false"; // Set `showSignUp` flag for unauthenticated users

      router.push(
        `/checkout?step=${newStep}&id=${courseId}&showSignUp=${showSignUp}`,
        { scroll: false } // Prevents scrolling when navigating
      );
    },
    [courseId, isSignedIn, router]
  );

  /**
   * Effect: Redirect unauthenticated users to step 1 if they attempt to access a later step.
   * - Ensures that users who are not signed in cannot proceed beyond the first step.
   */
  useEffect(() => {
    if (isLoaded && !isSignedIn && checkoutStep > 1) {
      navigateToStep(1); // Redirect to step 1
    }
  }, [isLoaded, isSignedIn, checkoutStep, navigateToStep]);

  // Return the current step and the navigation function for external use
  return { checkoutStep, navigateToStep };
};
