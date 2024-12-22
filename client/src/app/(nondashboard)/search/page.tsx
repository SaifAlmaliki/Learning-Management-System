/**
 * Summary:
 * This file defines the `Search` page component, which displays a list of available courses
 * and allows users to select and view details of a specific course.
 *
 * Key Features:
 * - Fetches the list of courses using a custom API hook (`useGetCoursesQuery`).
 * - Supports dynamic selection of a course based on the `id` query parameter.
 * - Displays course details for the selected course using the `SelectedCourse` component.
 * - Allows users to navigate to the checkout page for enrollment.
 * - Implements smooth animations using `framer-motion`.
 */

"use client";

import Loading from "@/components/Loading";
import { useGetCoursesQuery } from "@/state/api";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CourseCardSearch from "@/components/CourseCardSearch";
import SelectedCourse from "./SelectedCourse";
import { Course } from "@/types";

/**
 * Search page component for displaying and selecting courses.
 */
const Search = () => {
  const searchParams = useSearchParams(); // Hook to retrieve query parameters
  const id = searchParams.get("id"); // Retrieve the `id` query parameter from the URL
  const { data: courses, isLoading, isError } = useGetCoursesQuery({}); // Fetch courses data
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // State for the currently selected course
  const router = useRouter(); // Next.js router for navigation

  /**
   * Effect: Sets the selected course based on the `id` query parameter.
   * - If `id` matches a course ID, that course is selected.
   * - If no `id` is provided, the first course in the list is selected by default.
   */
  useEffect(() => {
    if (courses) {
      if (id) {
        const course = courses.find((c) => c.courseId === id); // Find course by ID
        setSelectedCourse(course || courses[0]); // Fallback to the first course if not found
      } else {
        setSelectedCourse(courses[0]); // Select the first course by default
      }
    }
  }, [courses, id]);

  // Show a loading spinner if data is still being fetched
  if (isLoading) return <Loading />;

  // Show an error message if the fetch fails or no data is returned
  if (isError || !courses) return <div>Failed to fetch courses</div>;

  /**
   * Handles selecting a course from the list.
   * Updates the state and navigates to the new `id` query parameter.
   */
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    router.push(`/search?id=${course.courseId}`, {
      scroll: false, // Prevents the page from scrolling to the top
    });
  };

  /**
   * Navigates to the checkout page for enrolling in a selected course.
   */
  const handleEnrollNow = (courseId: string) => {
    router.push(`/checkout?step=1&id=${courseId}&showSignUp=false`, {
      scroll: false, // Prevents scrolling
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} // Initial opacity for fade-in effect
      animate={{ opacity: 1 }} // Final opacity
      transition={{ duration: 0.5 }} // Animation duration
      className="search"
    >
      {/* Page Title and Subtitle */}
      <h1 className="search__title">List of available courses</h1>
      <h2 className="search__subtitle">{courses.length} courses available</h2>

      <div className="search__content">
        {/* Animated grid displaying all available courses */}
        <motion.div
          initial={{ y: 40, opacity: 0 }} // Start position for the grid animation
          animate={{ y: 0, opacity: 1 }} // Final position and opacity
          transition={{ duration: 0.5, delay: 0.2 }} // Animation duration and delay
          className="search__courses-grid"
        >
          {courses.map((course) => (
            <CourseCardSearch
              key={course.courseId} // Unique key for each course
              course={course} // Course data passed as props
              isSelected={selectedCourse?.courseId === course.courseId} // Highlight if selected
              onClick={() => handleCourseSelect(course)} // Handle course selection
            />
          ))}
        </motion.div>

        {/* Display details of the selected course */}
        {selectedCourse && (
          <motion.div
            initial={{ y: 40, opacity: 0 }} // Start position for animation
            animate={{ y: 0, opacity: 1 }} // Final position and opacity
            transition={{ duration: 0.5, delay: 0.5 }} // Delay for staggered animation
            className="search__selected-course"
          >
            <SelectedCourse
              course={selectedCourse} // Selected course details
              handleEnrollNow={handleEnrollNow} // Enroll action handler
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Search;
