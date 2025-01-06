import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions, Appearance } from "@stripe/stripe-js";
import { useCreateStripePaymentIntentMutation } from "@/state/api";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import Loading from "@/components/Loading";

// Ensure the public Stripe key is defined in environment variables
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set");
}

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

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
  const [clientSecret, setClientSecret] = useState<string | "">("");
  const [createStripePaymentIntent] = useCreateStripePaymentIntentMutation();
  const { course } = useCurrentCourse();

  useEffect(() => {
    // Exit if no course data is available
    if (!course) return;

    // Fetch the payment intent's clientSecret
    const fetchPaymentIntent = async () => {
      try {
        const result = await createStripePaymentIntent({
          amount: course?.price ?? 9999999999999, // Default to high value if price is unavailable
        }).unwrap();

        setClientSecret(result.clientSecret); // Set clientSecret for Stripe Elements
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
      <div> {/* Wrap children in a single parent */}
        {children}
      </div>
    </Elements>
  );
};

export default StripeProvider;