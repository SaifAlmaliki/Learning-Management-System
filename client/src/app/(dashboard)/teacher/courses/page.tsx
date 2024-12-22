/**
 * Teacher's Courses Page
 *
 * This component displays all the courses created by a teacher.
 * - Teachers can **view, search, and filter** their courses.
 * - Teachers can **create a new course**, **edit existing courses**, or **delete courses**.
 * - The page supports search functionality (by title) and filtering by category.
 * - Uses RTK Query for API interactions (fetching, creating, and deleting courses).
 * - Displays a loading spinner while fetching data and handles errors gracefully.
 */

"use client";

// Import Components
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import TeacherCourseCard from "@/components/TeacherCourseCard";
import Toolbar from "@/components/Toolbar";
import { Button } from "@/components/ui/button";

// Import API hooks and types
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "@/state/api";
import { Course } from "@/types";

// Import hooks
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const Courses = () => {
  // Navigation hook for routing
  const router = useRouter();

  // Get the currently logged-in user
  const { user } = useUser();

  // Fetch all courses with a default category "all"
  const {
    data: courses, // List of courses
    isLoading, // Loading state
    isError,   // Error state
  } = useGetCoursesQuery({ category: "all" });

  // API Mutations for creating and deleting courses
  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  // Local state for search term and category filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  /**
   * Filter courses based on search term and selected category.
   */
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  /**
   * Navigate to the course edit page.
   * @param course - The selected course to edit.
   */
  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.courseId}`, { scroll: false });
  };

  /**
   * Delete a course after confirming with the user.
   * @param course - The course to delete.
   */
  const handleDelete = async (course: Course) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      await deleteCourse(course.courseId).unwrap();
    }
  };

  /**
   * Create a new course and navigate to its edit page.
   */
  const handleCreateCourse = async () => {
    if (!user) return;

    const result = await createCourse({
      teacherId: user.id,
      teacherName: user.fullName || "Unknown Teacher",
    }).unwrap();

    // Navigate to the new course edit page
    router.push(`/teacher/courses/${result.courseId}`, { scroll: false });
  };

  // Display loading spinner while data is being fetched
  if (isLoading) return <Loading />;

  // Show error message if the API call fails
  if (isError || !courses) return <div>Error loading courses.</div>;

  return (
    <div className="teacher-courses">
      {/* Header Section with a 'Create Course' Button */}
      <Header
        title="Courses"
        subtitle="Browse your courses"
        rightElement={
          <Button
            onClick={handleCreateCourse}
            className="teacher-courses__header"
          >
            Create Course
          </Button>
        }
      />

      {/* Toolbar for Search and Category Filtering */}
      <Toolbar
        onSearch={setSearchTerm}             // Update search term state
        onCategoryChange={setSelectedCategory} // Update selected category state
      />

      {/* Display Filtered Course Cards */}
      <div className="teacher-courses__grid">
        {filteredCourses.map((course) => (
          <TeacherCourseCard
            key={course.courseId}            // Unique key for each course
            course={course}                  // Pass course data to the component
            onEdit={handleEdit}              // Edit handler
            onDelete={handleDelete}          // Delete handler
            isOwner={course.teacherId === user?.id} // Check if the user owns the course
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
