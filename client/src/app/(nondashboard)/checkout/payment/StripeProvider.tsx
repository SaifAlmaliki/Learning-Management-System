// File: StripeProvider.tsx
// Purpose: This component sets up the Stripe Elements context for secure payment processing.
// It fetches a `clientSecret` from the backend by creating a payment intent using Stripe's API
// and configures the appearance of Stripe Elements. It ensures the Stripe context is available to child components.

import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js"; // Provides Stripe context
import { loadStripe, StripeElementsOptions, Appearance } from "@stripe/stripe-js"; // Stripe SDK
import { useCreateStripePaymentIntentMutation } from "@/state/api"; // API hook to create a Stripe payment intent
import { useCurrentCourse } from "@/hooks/useCurrentCourse"; // Hook to fetch current course data
import Loading from "@/components/Loading"; // Loading spinner component

// Ensure the public Stripe key is defined in environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEYis not set");
}

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.STRIPE_SECRET_KEY);

// Custom appearance options for Stripe Elements
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#0570de",
    colorBackground: "#18181b",
    colorText: "#d2d2d2",
    colorDanger: "#df1b41",
    colorTextPlaceholder: "#6e6e6e",
    fontFamily: "Inter, system-ui, sans-serif",
    spacingUnit: "3px",
    borderRadius: "10px",
    fontSizeBase: "14px",
  },
};

/**
 * StripeProvider Component
 * - Fetches the clientSecret for Stripe payment intent from the backend.
 * - Configures and provides the Stripe Elements context to its children.
 */
const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientSecret, setClientSecret] = useState<string | "">("");          // Holds the payment intent clientSecret
  const [createStripePaymentIntent] = useCreateStripePaymentIntentMutation(); // API hook to fetch clientSecret
  const { course } = useCurrentCourse(); // Fetch course data (includes price)

  useEffect(() => {
    // Exit if no course data is available
    if (!course) return;

    // Fetch the payment intent's clientSecret
    const fetchPaymentIntent = async () => {
      try {
        const result = await createStripePaymentIntent({
          amount: course?.price ?? 9999999999999, // Default to high value if price is unavailable
        }).unwrap();

        setClientSecret(result.clientSecret);     // Set clientSecret for Stripe Elements
      } catch (error) {
        console.error("Failed to fetch payment intent:", error);
      }
    };

    fetchPaymentIntent();
  }, [createStripePaymentIntent, course?.price, course]);

  // Stripe Elements options
  const options: StripeElementsOptions = {
    clientSecret, // Required to initialize Stripe Elements
    appearance,   // Custom styling for the payment form
  };

  // Display loading spinner until clientSecret is fetched
  if (!clientSecret) return <Loading />;

  // Wrap children with Stripe Elements context
  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
