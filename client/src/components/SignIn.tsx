"use client";

import { SignIn, useUser } from "@clerk/nextjs";
// Clerk is an authentication solution for Next.js. `SignIn` is a Clerk component
// that provides a pre-built sign-in UI, and `useUser` gives us information about the
// currently signed-in user (if any).

import React from "react";
import { dark } from "@clerk/themes";
// `dark` is a pre-defined theme from Clerk that can be used for consistent styling.

import { useSearchParams } from "next/navigation";
// `useSearchParams` is a Next.js hook that allows access to the current URL's query parameters
// in a client component.

const SignInComponent = () => {
  // Get the current user object from Clerk. If no user is signed in, `user` is null/undefined.
  const { user } = useUser();

  // Retrieve the search params from the URL using Next.js hook.
  const searchParams = useSearchParams();

  // Check if the URL has the parameter "showSignUp" set.
  // For example: /signin?showSignUp=true
  // `get("showSignUp")` will return the value of "showSignUp" or null if not present.
  const isCheckoutPage = searchParams.get("showSignUp") !== null;

  // Get the "id" parameter from the URL if available.
  const courseId = searchParams.get("id");

  // Determine the URL for sign-up. If the `isCheckoutPage` flag is true (meaning the user
  // accessed the sign-in page potentially through a checkout flow), we want to redirect them
  // to a `/checkout` route with certain query parameters. Otherwise, we just use "/signup".
  const signUpUrl = isCheckoutPage
    ? `/checkout?step=1&id=${courseId}&showSignUp=true`
    : "/signup";

  // Define a function that returns the URL to which the user should be redirected after signing in.
  // If this is part of a checkout flow, we send them to the next step in the checkout process.
  // Otherwise, we check the user’s type (teacher or regular user) and send them to their
  // respective courses page.
  const getRedirectUrl = () => {
    if (isCheckoutPage) {
      // If coming from a checkout-related sign-in, go to step 2 after signing in.
      return `/checkout?step=2&id=${courseId}&showSignUp=true`;
    }

    // If not a checkout flow, determine the user's type from public metadata.
    const userType = user?.publicMetadata?.userType as string;
    if (userType === "teacher") {
      // If the user is a teacher, redirect them to the teacher’s courses page.
      return "/teacher/courses";
    }
    // Otherwise, default to a user’s courses page.
    return "/user/courses";
  };

  return (
    <SignIn
      // `SignIn` is a pre-built Clerk component handling the sign-in process.
      // We customize its appearance and behavior using props.

      appearance={{
        baseTheme: dark, // Apply the dark theme provided by Clerk.
        elements: {
          rootBox: "flex justify-center items-center py-5",
          // rootBox: applies flex layout, centered content, and vertical padding.

          cardBox: "shadow-none",
          // cardBox: adjusts the sign-in card container (no shadow).

          card: "bg-customgreys-secondarybg w-full shadow-none",
          // card: styles the sign-in form container with a custom background, full width, and no shadow.

          footer: {
            background: "#25262F",
            padding: "0rem 2.5rem",
            "& > div > div:nth-child(1)": {
              background: "#25262F",
            },
          },
          // footer: styling for the bottom section of the sign-in form.
          // Using CSS selectors to maintain consistent background and spacing.

          formFieldLabel: "text-white-50 font-normal",
          // formFieldLabel: styling for labels of form fields (lighter text and normal weight).

          formButtonPrimary:
            "bg-primary-700 text-white-100 hover:bg-primary-600 !shadow-none",
          // formButtonPrimary: styling for primary buttons (e.g., "Sign In" button),
          // using a primary color and removing the default shadow.

          formFieldInput: "bg-customgreys-primarybg text-white-50 !shadow-none",
          // formFieldInput: styling for input fields (custom grey background, lighter text, no shadow).

          footerActionLink: "text-primary-750 hover:text-primary-600",
          // footerActionLink: styling for links in the footer area (colored link with hover state).
        },
      }}

      signUpUrl={signUpUrl}
      // `signUpUrl` sets the URL that users can navigate to if they need to sign up
      // instead of signing in.

      forceRedirectUrl={getRedirectUrl()}
      // `forceRedirectUrl` ensures that after a successful sign-in, the user is redirected
      // to the URL returned by the `getRedirectUrl()` function.

      routing="hash"
      // `routing="hash"` indicates how the Clerk component handles routing internally.
      // "hash" uses the hash fragment in the URL for its state, often preferred in certain setups.

      afterSignOutUrl="/"
      // `afterSignOutUrl` sets where the user should be redirected after they sign out.
      // Here, we send them back to the homepage ("/").
    />
  );
};

export default SignInComponent;
