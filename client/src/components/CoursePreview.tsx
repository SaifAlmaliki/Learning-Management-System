// File: CoursePreview.tsx
// Purpose: This component renders a detailed preview of a course, including its image, title, teacher's name, description,
// course content (using an Accordion), and price details. It is designed for a Next.js application using TypeScript and Tailwind CSS.

import { formatPrice } from "@/lib/utils"; // Utility function to format price
import Image from "next/image"; // Next.js optimized image component
import React from "react";
import AccordionSections from "./AccordionSections"; // Component for displaying expandable course sections
import { CoursePreviewProps } from "@/types";


/**
 * CoursePreview Component
 * Renders a complete course preview card with image, title, description, sections (accordion), and price summary.
 */
const CoursePreview = ({ course }: CoursePreviewProps) => {
  const price = formatPrice(course.price); // Format the course price

  return (
    <div className="course-preview">
      {/* Course Details Section */}
      <div className="course-preview__container">
        {/* Course Image */}
        <div className="course-preview__image-wrapper">
          <Image
            src={course.image || "/placeholder.png"} // Fallback to a placeholder image if none is provided
            alt="Course Preview" // Alt text for accessibility
            width={640}
            height={360}
            className="w-full"
          />
        </div>

        {/* Course Title, Teacher Name, and Description */}
        <div>
          <h2 className="course-preview__title">{course.title}</h2>
          <p className="text-gray-400 text-md mb-4">by {course.teacherName}</p>
          <p className="text-sm text-customgreys-dirtyGrey">
            {course.description}
          </p>
        </div>

        {/* Course Content Accordion */}
        <div>
          <h4 className="text-white-50/90 font-semibold mb-2">
            Course Content
          </h4>
          <AccordionSections sections={course.sections} />
        </div>
      </div>

      {/* Pricing Details Section */}
      <div className="course-preview__container">
        <h3 className="text-xl mb-4">Price Details (1 item)</h3>

        {/* Price Breakdown */}
        <div className="flex justify-between mb-4 text-customgreys-dirtyGrey text-base">
          <span className="font-bold">1x {course.title}</span>
          <span className="font-bold">{price}</span>
        </div>

        {/* Total Amount */}
        <div className="flex justify-between border-t border-customgreys-dirtyGrey pt-4">
          <span className="font-bold text-lg">Total Amount</span>
          <span className="font-bold text-lg">{price}</span>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
