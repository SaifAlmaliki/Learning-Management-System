/**
 * User Courses Page
 *
 * This component displays the list of courses a user is enrolled in.
 * - Allows users to **search courses** by title and filter them by category.
 * - Fetches enrolled courses dynamically using RTK Query.
 * - Provides navigation to the course's first chapter or course overview page.
 * - Displays appropriate UI states for loading, errors, or empty course lists.
 */

"use client";

// Import components
import Toolbar from "@/components/Toolbar";       // Search and filter toolbar
import CourseCard from "@/components/CourseCard"; // Individual course display card
import Header from "@/components/Header";         // Page header
import Loading from "@/components/Loading";       // Loading spinner

// Import hooks
import { useGetUserEnrolledCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import { Course } from "@/types";

const Courses = () => {
  const router = useRouter(); // Router for page navigation

  // Fetch user data using Clerk
  const { user, isLoaded } = useUser();

  // Local state for search term and category filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  /**
   * Fetch the list of courses the user is enrolled in.
   * - Uses RTK Query with the user's ID.
   * - Skips the query if the user is not loaded or not available.
   */
  const {
    data: courses,    // The fetched list of courses
    isLoading,        // Loading state
    isError,          // Error state
  } = useGetUserEnrolledCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user, // Avoid API call until user is loaded
  });

  /**
   * Filters courses based on search term and selected category.
   */
  const filteredCourses = useMemo(() => {
    if (!courses) return []; // Return an empty array if no courses are available

    return courses.filter((course) => {
      // Check if the course title includes the search term (case-insensitive)
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Check if the course matches the selected category
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  /**
   * Handles navigation to the first chapter of a course, if available.
   * If no chapters are available, it navigates to the course overview page.
   * @param course - The course object to navigate to.
   */
  const handleGoToCourse = (course: Course) => {
    if (
      course.sections &&
      course.sections.length > 0 &&
      course.sections[0].chapters.length > 0
    ) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(
        `/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`,
        { scroll: false }
      );
    } else {
      router.push(`/user/courses/${course.courseId}`, { scroll: false });
    }
  };

  // Display a loading spinner while user data or courses are being loaded
  if (!isLoaded || isLoading) return <Loading />;

  // Display message if no user is signed in
  if (!user) return <div>Please sign in to view your courses.</div>;

  // Display message if no courses are available or an error occurs
  if (isError || !courses || courses.length === 0)
    return <div>You are not enrolled in any courses yet.</div>;

  return (
    <div className="user-courses">
      {/* Page Header */}
      <Header title="My Courses" subtitle="View your enrolled courses" />

      {/* Toolbar for Search and Category Filtering */}
      <Toolbar
        onSearch={setSearchTerm}           // Update search term state
        onCategoryChange={setSelectedCategory} // Update selected category state
      />

      {/* Display Filtered Courses */}
      <div className="user-courses__grid">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.courseId}          // Unique key for each course
            course={course}                // Pass course data
            onGoToCourse={handleGoToCourse} // Navigation handler
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
