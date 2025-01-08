/**
 * Payment Processing Component for CognitechX Academy Checkout
 *
 * This component handles the payment processing step of the checkout flow using Stripe.
 * It provides a secure payment form using Stripe Elements and manages the complete
 * payment flow including:
 * - Credit card information collection via Stripe Elements
 * - Payment processing with Stripe
 * - Transaction recording in our database
 * - Success/failure handling and user feedback
 * - Post-payment navigation
 *
 * The component is wrapped in a StripeProvider to ensure Stripe is properly initialized
 * and the Elements context is available to child components.
 *
 * Key Features:
 * - Secure credit card processing
 * - Real-time validation
 * - Error handling with user feedback
 * - Transaction recording
 * - Automatic redirect after successful payment
 */

import React from "react";
import StripeProvider from "./StripeProvider";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useClerk, useUser } from "@clerk/nextjs";
import CoursePreview from "@/components/CoursePreview";
import { CreditCard } from "lucide-react";
import { useCreateTransactionMutation } from "@/state/api";
import { toast } from "sonner";
import { Transaction } from "@/types";

interface PaymentPageContentProps {
  onPaymentSuccess: () => void;
}

const PaymentPageContent = ({ onPaymentSuccess }: PaymentPageContentProps) => {
  // Initialize Stripe hooks and state management
  const stripe = useStripe();
  const elements = useElements();
  const [createTransaction] = useCreateTransactionMutation();
  const { course, courseId } = useCurrentCourse();
  const { user } = useUser();
  const { signOut } = useClerk();

  /**
   * Handles the payment form submission
   * Processes the payment through Stripe and creates a transaction record
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Stripe is properly initialized
    if (!stripe || !elements) {
      toast.error("Stripe service is not available");
      return;
    }

    try {
      // Determine the base URL for redirect
      const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL
        ? `http://${process.env.NEXT_PUBLIC_LOCAL_URL}`
        : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : undefined;

      if (!baseUrl) {
        toast.error("Configuration error: No base URL available");
        return;
      }

      // Process payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${baseUrl}/checkout?step=3&id=${courseId}`,
        },
        redirect: "if_required",
      });

      // Handle payment errors
      if (result.error) {
        toast.error(result.error.message || "Payment failed");
        return;
      }

      // Handle successful payment
      if (result.paymentIntent?.status === "succeeded") {
        try {
          // Create transaction record
          const transactionData: Partial<Transaction> = {
            transactionId: result.paymentIntent.id,
            userId: user?.id,
            courseId: courseId,
            paymentProvider: "stripe",
            amount: course?.price || 0,
          };

          // Save transaction and handle success
          await createTransaction(transactionData).unwrap();
          toast.success("Payment successful!");
          onPaymentSuccess();

          // Redirect to user courses page after delay
          setTimeout(() => {
            window.location.href = '/user/courses';
          }, 3000);
        } catch (error) {
          // Handle transaction creation failure
          toast.error("Payment successful but failed to save transaction. Please contact support.");
        }
      }
    } catch (error) {
      // Handle unexpected errors
      toast.error("An error occurred while processing your payment");
    }
  };

  /**
   * Handles user sign out and navigation back to first checkout step
   */
  const handleSignOutAndNavigate = async () => {
    await signOut();
    window.location.href = "/checkout?step=1";
  };

  // Don't render if course data is not available
  if (!course) return null;

  return (
    <div className="payment">
      <div className="payment__container">
        {/* Course Preview Section */}
        <div className="payment__preview">
          <CoursePreview course={course} />
        </div>

        {/* Payment Form Section */}
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
                  <div className="payment__card-element">
                    <PaymentElement />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="payment__actions">
              <button
                type="button"
                onClick={handleSignOutAndNavigate}
                className="hover:bg-white-50/10 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2"
              >
                Switch Account
              </button>

              <button
                type="submit"
                disabled={!stripe || !elements}
                className="payment__submit bg-primary text-primary-foreground shadow hover:bg-primary/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2"
              >
                Pay with Credit Card
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Payment Page Component
 * Wraps the payment content in a Stripe provider to ensure Stripe is properly initialized
 */
const PaymentPage = ({ onPaymentSuccess }: PaymentPageContentProps) => (
  <StripeProvider>
    <PaymentPageContent onPaymentSuccess={onPaymentSuccess} />
  </StripeProvider>
);

export default PaymentPage;
