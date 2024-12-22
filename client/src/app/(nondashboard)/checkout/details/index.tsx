// File: CheckoutDetailsPage.tsx
// Purpose: This component renders the checkout details page, allowing users to preview the course, perform guest checkout,
// and optionally sign in or sign up. It fetches course data dynamically and manages the UI state for loading, errors, and form submission.

"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import CoursePreview from "@/components/CoursePreview";
import { CustomFormField } from "@/components/CustomFormField";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import SignUpComponent from "@/components/SignUp";
import SignInComponent from "@/components/SignIn";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { GuestFormData, guestSchema } from "@/lib/schemas";

/**
 * CheckoutDetailsPage Component
 * - Fetches and displays course details using `useCurrentCourse` custom hook.
 * - Provides options for guest checkout and toggling between sign-in and sign-up forms.
 * - Validates email input using Zod and React Hook Form.
 */
const CheckoutDetailsPage = () => {
  // Fetch selected course data and manage loading/error states
  const { course: selectedCourse, isLoading, isError } = useCurrentCourse();

  // Determine whether to show the Sign-Up form based on query parameters
  const searchParams = useSearchParams();
  const showSignUp = searchParams.get("showSignUp") === "true";

  // React Hook Form setup for guest checkout form
  const methods = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema), // Form validation schema
    defaultValues: {
      email: "",
    },
  });

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

        {/* Guest Checkout and Authentication Options */}
        <div className="checkout-details__options">
          {/* Guest Checkout Form */}
          <div className="checkout-details__guest">
            <h2 className="checkout-details__title">Guest Checkout</h2>
            <p className="checkout-details__subtitle">
              Enter email to receive course access details and order confirmation. 
              You can create an account after purchase.
            </p>
            {/* Form Wrapper */}
            <Form {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => {
                  console.log(data); // Handle form submission
                })}
                className="checkout-details__form"
              >
                {/* Email Input Field */}
                <CustomFormField
                  name="email"
                  label="Email address"
                  type="email"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-white-50"
                  inputClassName="py-3"
                />
                {/* Submit Button */}
                <Button type="submit" className="checkout-details__submit">
                  Continue as Guest
                </Button>
              </form>
            </Form>
          </div>

          {/* Divider Section */}
          <div className="checkout-details__divider">
            <hr className="checkout-details__divider-line" />
            <span className="checkout-details__divider-text">Or</span>
            <hr className="checkout-details__divider-line" />
          </div>

          {/* Authentication Options */}
          <div className="checkout-details__auth">
            {showSignUp ? <SignUpComponent /> : <SignInComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;
