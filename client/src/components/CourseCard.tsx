/**
 * Summary:
 * This file defines the `CourseCard` component, a reusable UI card for displaying course information.
 *
 * Key Features:
 * - Displays a course image, title, description, teacher name, category, and price.
 * - Utilizes reusable UI components (Card, Avatar) for consistent design.
 * - Supports a click handler (`onGoToCourse`) for navigating to the course details page.
 * - Handles missing images gracefully with a placeholder.
 */

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { CourseCardProps } from "@/types";

/**
 * CourseCard Component:
 * - Props:
 *   - `course`: Contains details like title, description, image, teacher name, category, and price.
 *   - `onGoToCourse`: Function to handle click events (e.g., navigate to course details).
 */
const CourseCard = ({ course, onGoToCourse }: CourseCardProps) => {
  return (
    <Card className="course-card group" onClick={() => onGoToCourse(course)}>
      {/* Card Header with Course Image */}
      <CardHeader className="course-card__header">
        <Image
          src={course.image || "/placeholder.png"} // Use a placeholder if no image is provided
          alt={course.title} // Accessible alternative text
          width={400}
          height={350}
          className="course-card__image"
          priority // Prioritize loading the image for better UX
        />
      </CardHeader>

      {/* Card Content with Course Details */}
      <CardContent className="course-card__content">
        {/* Course Title and Description */}
        <CardTitle className="course-card__title">
          {course.title}: {course.description}
        </CardTitle>

        {/* Teacher Information */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage alt={course.teacherName} /> {/* Teacher Image */}
            <AvatarFallback className="bg-secondary-700 text-black">
              {course.teacherName[0]} {/* Fallback with teacher's initial */}
            </AvatarFallback>
          </Avatar>

          {/* Teacher Name */}
          <p className="text-sm text-customgreys-dirtyGrey">
            {course.teacherName}
          </p>
        </div>

        {/* Card Footer with Course Category and Price */}
        <CardFooter className="course-card__footer">
          {/* Course Category */}
          <div className="course-card__category">{course.category}</div>

          {/* Course Price */}
          <span className="course-card__price">
            {formatPrice(course.price)} {/* Formats price using `formatPrice` utility */}
          </span>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default CourseCard;