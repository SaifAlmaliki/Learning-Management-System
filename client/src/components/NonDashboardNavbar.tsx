"use client";
// Indicates this is a Next.js client component, used for rendering dynamic client-side code.

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
// Imports components and hooks from Clerk for authentication and user management.

import { dark } from "@clerk/themes";
// Imports the dark theme preset from Clerk for UI customization.

import { Bell, BookOpen } from "lucide-react";
// Imports specific icons (Bell and BookOpen) from Lucide for use in the UI.

import Link from "next/link";
// Next.js component for client-side navigation with prefetching capabilities.

import React from "react";
// React library import to enable JSX and component functionality.

const NonDashboardNavbar = () => {
  // Defines a functional React component for the non-dashboard navbar.

  const { user } = useUser();
  // Retrieves the current user object using Clerk's useUser hook.

  const userRole = user?.publicMetadata?.userType as "student" | "teacher";
  // Extracts the user role (either "student" or "teacher") from user metadata.

  return (
    <nav className="nondashboard-navbar">
      {/* Main navigation container with a custom class for styling. */}

      <div className="nondashboard-navbar__container">
        {/* Wrapper div for structuring the navbar's content. */}

        <div className="nondashboard-navbar__search">
          {/* Section for the brand and search functionality. */}

          <Link href="/" className="nondashboard-navbar__brand" scroll={false}>
            {/* Logo/brand link with two-line modern styling */}
            <div className="brand-text">
              <div className="brand-text__top">Academy</div>
              <div className="brand-text__bottom">CognitechX</div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Flex container for aligning the search bar and its icon. */}

            <div className="relative group">
              {/* Wrapper for the search input, styled with relative positioning. */}

              <Link
                href="/search"
                className="nondashboard-navbar__search-input"
                scroll={false}>

                {/* Link for navigating to the search page. */}
                <span className="hidden sm:inline">Search Courses</span>
                {/* Full text visible on larger screens. */}

                <span className="sm:hidden">Search</span>
                {/* Shortened text visible on smaller screens. */}
              </Link>

              <BookOpen
                className="nondashboard-navbar__search-icon"
                size={18} />
              {/* Search icon rendered next to the search link. */}
            </div>
          </div>
        </div>

        <div className="nondashboard-navbar__actions">
          {/* Section for action buttons like notifications and user authentication. */}

          <button className="nondashboard-navbar__notification-button">
            {/* Button for notifications. */}

            <span className="nondashboard-navbar__notification-indicator"></span>
            {/* Indicator for unread notifications. */}

            <Bell className="nondashboard-navbar__notification-icon" />
            {/* Notification bell icon. */}
          </button>

          <SignedIn>
            {/* Renders content only if the user is signed in. */}

            <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
                  userButtonBox: "scale-90 sm:scale-100",
                },
              }}
              // Customizes the appearance of the UserButton using the dark theme and specific styles.

              showName={true}
              // Displays the user's name in the UserButton.

              userProfileMode="navigation"
              // Sets the user profile navigation mode.

              userProfileUrl={
                userRole === "teacher" ? "/teacher/profile" : "/user/profile"
              }
              // Dynamically sets the profile URL based on the user's role.
            />
          </SignedIn>

          <SignedOut>
            {/* Renders content only if the user is signed out. */}

            <Link
              href="/signin"
              className="nondashboard-navbar__auth-button--login"
              scroll={false}
            >
              {/* Link to the sign-in page. */}
              Log in
            </Link>

            <Link
              href="/signup"
              className="nondashboard-navbar__auth-button--signup"
              scroll={false}
            >
              {/* Link to the sign-up page. */}
              Sign up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default NonDashboardNavbar;
// Exports the NonDashboardNavbar component as the default export.
