"use client";
/**
 * This React component represents the course purchase completion page.
 * It informs the user that their purchase was successful, provides support contact details,
 * and includes a link to navigate to their purchased courses.
 */
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import React from "react";

/**
 * @component CompletionPage
 * @description A confirmation page displayed after a successful course purchase.
 * It shows a success message, a customer support contact, and a navigation link to view the user's courses.
 */
const CompletionPage = () => {
  return (
    <div className="completion">
      {/* Content section displaying the success icon, title, and congratulatory message */}
      <div className="completion__content">
        {/* Success icon: Displays a large checkmark to visually indicate success */}
        <div className="completion__icon">
          <Check className="w-16 h-16" /> {/* Checkmark icon with custom size */}
        </div>

        {/* Title: Indicates the action is completed */}
        <h1 className="completion__title">COMPLETED</h1>

        {/* Success message: Congratulates the user on their purchase */}
        <p className="completion__message">
          🎉 You have made a course purchase successfully! 🎉
        </p>
      </div>

      {/* Support section: Offers a way to contact customer support */}
      <div className="completion__support">
        <p>
          Need help? Contact our{" "}
          {/* Customer support button styled as a link */}
          <Button variant="link" asChild className="p-0 m-0 text-primary-700">
            <a href="mailto:support@example.com">customer support</a> {/* Email link */}
          </Button>
          .
        </p>
      </div>

      {/* Navigation section: Redirects user to their courses */}
      <div className="completion__action">
        {/* Link to navigate to the user's courses */}
        <Link href="user/courses" scroll={false}>
          Go to Courses
        </Link>
      </div>
    </div>
  );
};

export default CompletionPage;
