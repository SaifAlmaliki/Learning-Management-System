"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Bell, BookOpen } from "lucide-react";
import Link from "next/link";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Props definition for the Navbar component
interface NavbarProps {
  isCoursePage: boolean;
}

// Navbar Component
const Navbar = ({ isCoursePage }: NavbarProps) => {
  // Fetch user information using Clerk
  const { user } = useUser();
  const userRole = user?.publicMetadata?.userType as "student" | "teacher";

  return (
    <nav className="dashboard-navbar">
      {/* Navbar Container */}
      <div className="dashboard-navbar__container">
        {/* Left Section: Search Bar and Sidebar Trigger */}
        <div className="dashboard-navbar__search">
          {/* Sidebar Trigger: Only visible on smaller screens */}
          <div className="md:hidden">
            <SidebarTrigger className="dashboard-navbar__sidebar-trigger" />
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              {/* Search Link */}
              <Link
                href="/search"
                className={cn("dashboard-navbar__search-input", {
                  "!bg-customgreys-secondarybg": isCoursePage, // Add background color if on course page
                })}
                scroll={false}
              >
                <span className="hidden sm:inline">Search Courses</span>
                <span className="sm:hidden">Search</span>
              </Link>
              {/* Search Icon */}
              <BookOpen className="dashboard-navbar__search-icon" size={18} />
            </div>
          </div>
        </div>

        {/* Right Section: Notifications and User Button */}
        <div className="dashboard-navbar__actions">
          {/* Notification Button */}
          <button className="nondashboard-navbar__notification-button">
            <span className="nondashboard-navbar__notification-indicator"></span>
            <Bell className="nondashboard-navbar__notification-icon" />
          </button>

          {/* User Profile Button */}
          <UserButton
            appearance={{
              baseTheme: dark, // Use Clerk's dark theme
              elements: {
                userButtonOuterIdentifier: "text-customgreys-dirtyGrey",
                userButtonBox: "scale-90 sm:scale-100",
              },
            }}
            showName={true} // Show user name
            userProfileMode="navigation"
            userProfileUrl={
              userRole === "teacher" ? "/teacher/profile" : "/user/profile"
            } // Navigate to profile based on user role
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
