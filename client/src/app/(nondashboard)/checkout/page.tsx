"use client";

import Loading from "@/components/Loading";
import WizardStepper from "@/components/WizardStepper";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import CheckoutDetailsPage from "./details";
import PaymentPage from "./payment";
import CompletionPage from "./completion";

const CheckoutWizard = () => {
  const { isLoaded } = useUser();
  const { checkoutStep } = useCheckoutNavigation();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isLoaded) return <Loading />;

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-500 mb-4">Thank you for your purchase.</p>
        <p className="text-gray-500">You will be redirected to your courses page shortly.</p>
      </div>
    );
  }

  const renderStep = () => {
    switch (checkoutStep) {
      case 1:
        return <CheckoutDetailsPage />;
      case 2:
        return <PaymentPage onPaymentSuccess={() => setPaymentSuccess(true)} />;
      case 3:
        return <CompletionPage />;
      default:
        return <CheckoutDetailsPage />;
    }
  };

  return (
    <div className="checkout">
      <WizardStepper currentStep={checkoutStep} />
      <div className="checkout__content">{renderStep()}</div>
    </div>
  );
};

export default CheckoutWizard;
