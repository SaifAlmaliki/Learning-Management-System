import { formatPrice } from "@/lib/utils"; // Utility to format price
import Image from "next/image"; // Next.js Image component for optimized images
import React from "react";
import { SearchCourseCardProps } from "@/types";

/**
 * CourseCardSearch Component
 * - Displays a card with course details (image, title, description, teacher's name, price, and enrollment count).
 * - Supports a selected state for styling.
 * - Triggers an action on card click.
 */
const CourseCardSearch = ({
  course,
  isSelected,
  onClick,
}: SearchCourseCardProps) => {
  return (
    <div
      onClick={onClick} // Handles the click event
      className={`course-card-search group ${
        isSelected
          ? "course-card-search--selected" // Apply selected styling if isSelected is true
          : "course-card-search--unselected" // Default styling if not selected
      }`}
    >
      {/* Course Image Section */}
      <div className="course-card-search__image-container">
        <Image
          src={course.image || "/placeholder.png"} // Use placeholder if no image is provided
          alt={course.title} // Alt text for accessibility
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive sizes for the image
          className="course-card-search__image"
          priority // Prioritize image loading
        />
      </div>

      {/* Course Content Section */}
      <div className="course-card-search__content">
        {/* Course Title and Description */}
        <div>
          <h2 className="course-card-search__title">{course.title}</h2>
          <p className="course-card-search__description">
            {course.description}
          </p>
        </div>

        {/* Course Footer: Teacher Name, Price, and Enrollment Count */}
        <div className="mt-2">
          <p className="course-card-search__teacher">By {course.teacherName}</p>
          <div className="course-card-search__footer">
            <span className="course-card-search__price">
              {formatPrice(course.price)} {/* Display formatted price */}
            </span>
            <span className="course-card-search__enrollment">
              {course.enrollments?.length || 0} Enrolled {/* Display enrollment count */}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSearch;
