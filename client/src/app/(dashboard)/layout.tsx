"use client";
import AppSidebar from "@/components/AppSidebar"; // Main application sidebar
import Loading from "@/components/Loading"; // Loading spinner for user state
import Navbar from "@/components/Navbar"; // Top navbar
import { SidebarProvider } from "@/components/ui/sidebar"; // Sidebar context provider
import { cn } from "@/lib/utils"; // Utility for conditional class names
import { useUser } from "@clerk/nextjs"; // Clerk hook for user authentication
import { usePathname } from "next/navigation"; // Hook to get the current path
import { useEffect, useState } from "react";
import ChaptersSidebar from "./user/courses/[courseId]/ChaptersSidebar"; // Chapters sidebar for course pages

export default function DashboardLayout({ children }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();                                 // Get the current page path
  const [courseId, setCourseId] = useState<string | null>(null);  // State to store course ID
  const { user, isLoaded } = useUser();                           // Clerk hook for user and loading state

  // Check if the current page is a course-related page
  const isCoursePage = /^\/user\/courses\/[^\/]+(?:\/chapters\/[^\/]+)?$/.test(
    pathname
  );

  // Effect to extract the course ID from the URL if on a course page.
  useEffect(() => {
    if (isCoursePage) {
      const match = pathname.match(/\/user\/courses\/([^\/]+)/);
      setCourseId(match ? match[1] : null); // Extract and set the courseId
    } else {
      setCourseId(null); // Reset courseId if not on a course page
    }
  }, [isCoursePage, pathname]);

  // Display a loading spinner until the user state is loaded
  if (!isLoaded) return <Loading />;

  // Display a sign-in prompt if no user is authenticated
  if (!user) return <div>Please sign in to access this page.</div>;

  return (
    <SidebarProvider>
      <div className="dashboard">
        {/* Main Sidebar Navigation */}
        <AppSidebar />

        {/* Dashboard Content Section */}
        <div className="dashboard__content">
          {/* Chapters Sidebar: Only rendered on course-related pages */}
          {courseId && <ChaptersSidebar />}

          {/* Main Content Area */}
          <div
            className={cn(
              "dashboard__main",
              isCoursePage && "dashboard__main--not-course" // Adjust styles for course pages
            )}
            style={{ height: "100vh" }} // Ensure full viewport height
          >
            {/* Top Navbar */}
            <Navbar isCoursePage={isCoursePage} />

            {/* Page-Specific Content */}
            <main className="dashboard__body">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
