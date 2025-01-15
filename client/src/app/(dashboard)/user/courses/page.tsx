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
import { FaGraduationCap } from "react-icons/fa"; // Icon for empty courses message
import Link from "next/link";                     // Link for course catalog

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
  if (isError || !courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <FaGraduationCap className="text-6xl text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Courses Yet</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          You haven't enrolled in any courses yet. Start your learning journey by exploring our course catalog!
        </p>
        <Link 
          href="/search" 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

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
