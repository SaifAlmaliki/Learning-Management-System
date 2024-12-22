// File: PaymentPage.tsx
// Purpose: This component handles the payment process using Stripe in a Next.js environment.
// It integrates Stripe Elements for secure payment processing, displays a course preview,
// manages user interactions like submitting payments and switching accounts,
// and communicates with the backend to record transactions.

import React from "react";
import StripeProvider from "./StripeProvider"; // Stripe provider for context setup
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"; // Stripe Elements for payment UI
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation"; // Custom hook for navigation
import { useCurrentCourse } from "@/hooks/useCurrentCourse"; // Custom hook to fetch current course data
import { useClerk, useUser } from "@clerk/nextjs"; // Clerk for user authentication and session management
import { useCreateTransactionMutation } from "@/state/api"; // API hook to save transaction data
import CoursePreview from "@/components/CoursePreview"; // Component to preview course details
import { CreditCard } from "lucide-react"; // Icon for credit card payment
import { Button } from "@/components/ui/button"; // Reusable button component
import { toast } from "sonner"; // Notification library for showing success/error messages
import { Transaction } from "@/types";

// PaymentPageContent Component: Contains the main content and payment logic
const PaymentPageContent = () => {
  // Stripe Elements hooks
  const stripe = useStripe();     // Stripe instance
  const elements = useElements(); // Stripe Elements instance

  // API Mutation hook to create a transaction
  const [createTransaction] = useCreateTransactionMutation();

  // Navigation and course data hooks
  const { navigateToStep } = useCheckoutNavigation(); // Navigation between checkout steps
  const { course, courseId } = useCurrentCourse();    // Course data and ID
  const { user } = useUser();     // Current authenticated user
  const { signOut } = useClerk(); // Clerk's signOut method

  // Handles payment form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure Stripe and Elements are initialized
    if (!stripe || !elements) {
      toast.error("Stripe service is not available");
      return;
    }

    // Base URL setup for redirect after payment
    const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL
      ? `http://${process.env.NEXT_PUBLIC_LOCAL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined;

    // Stripe confirm payment with redirect URL
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${baseUrl}/checkout?step=3&id=${courseId}`, // Redirect URL after payment success
      },
      redirect: "if_required",
    });

    // Handle successful payment intent
    if (result.paymentIntent?.status === "succeeded") {
      const transactionData: Partial<Transaction> = {
        transactionId: result.paymentIntent.id,
        userId: user?.id,
        courseId: courseId,
        paymentProvider: "stripe",
        amount: course?.price || 0,
      };

      // Save transaction data and navigate to next step
      await createTransaction(transactionData);
      navigateToStep(3);
    }
  };

  // Handles user sign-out and navigation back to step 1
  const handleSignOutAndNavigate = async () => {
    await signOut();
    navigateToStep(1);
  };

  // Render nothing if no course data is available
  if (!course) return null;

  return (
    <div className="payment">
      <div className="payment__container">
        {/* Course Preview */}
        <div className="payment__preview">
          <CoursePreview course={course} />
        </div>

        {/* Payment Form */}
        <div className="payment__form-container">
          <form
            id="payment-form"
            onSubmit={handleSubmit}
            className="payment__form"
          >
            <div className="payment__content">
              <h1 className="payment__title">Checkout</h1>
              <p className="payment__subtitle">
                Fill out the payment details below to complete your purchase.
              </p>

              {/* Payment Method Section */}
              <div className="payment__method">
                <h3 className="payment__method-title">Payment Method</h3>
                <div className="payment__card-container">
                  <div className="payment__card-header">
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </div>
                  {/* Stripe Payment Element */}
                  <div className="payment__card-element">
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Actions: Sign Out and Submit Payment */}
      <div className="payment__actions">
        <Button
          className="hover:bg-white-50/10"
          onClick={handleSignOutAndNavigate}
          variant="outline"
          type="button"
        >
          Switch Account
        </Button>

        <Button
          form="payment-form"
          type="submit"
          className="payment__submit"
          disabled={!stripe || !elements}
        >
          Pay with Credit Card
        </Button>
      </div>
    </div>
  );
};

// PaymentPage Component: Wraps content in StripeProvider for Stripe context
const PaymentPage = () => (
  <StripeProvider>
    <PaymentPageContent />
  </StripeProvider>
);

export default PaymentPage;
