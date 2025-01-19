// File: CheckoutDetailsPage.tsx
// Purpose: This component renders the checkout details page, allowing users to sign in or sign up before purchasing a course.

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import CoursePreview from "@/components/CoursePreview";
import Loading from "@/components/Loading";
import SignUpComponent from "@/components/SignUp";
import SignInComponent from "@/components/SignIn";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";

/**
 * CheckoutDetailsPage Component
 * - Fetches and displays course details using `useCurrentCourse` custom hook.
 * - Provides options for signing in or signing up before checkout.
 */
const CheckoutDetailsPage = () => {
  // Fetch selected course data and manage loading/error states
  const { course: selectedCourse, isLoading, isError } = useCurrentCourse();

  // Determine whether to show the Sign-Up form based on query parameters
  const searchParams = useSearchParams();
  const showSignUp = searchParams.get("showSignUp") === "true";

  // Conditional rendering for loading, error, and missing course states
  if (isLoading) return <Loading />; // Show loading spinner
  if (isError) return <div>Failed to fetch course data</div>; // Show error message
  if (!selectedCourse) return <div>Course not found</div>; // Show "not found" state

  return (
    <div className="checkout-details">
      <div className="checkout-details__container">
        {/* Course Preview Section */}
        <div className="checkout-details__preview">
          <CoursePreview course={selectedCourse} />
        </div>

        {/* Authentication Options */}
        <div className="checkout-details__options">
          <div className="checkout-details__auth">
            {showSignUp ? <SignUpComponent /> : <SignInComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;
