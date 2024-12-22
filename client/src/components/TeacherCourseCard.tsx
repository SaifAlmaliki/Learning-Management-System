/**
 * TeacherCourseCard Component
 *
 * This component displays a course card for teachers, showing details such as:
 * - Course title, category, status, and number of enrolled students.
 * - Edit and delete options for course owners (teachers).
 * - A "View Only" message for users who are not the owner.
 *
 * Props:
 * - `course`: The course object containing details like title, category, status, and enrollments.
 * - `onEdit`: Callback function triggered when the edit button is clicked.
 * - `onDelete`: Callback function triggered when the delete button is clicked.
 * - `isOwner`: Boolean indicating whether the logged-in user is the course owner.
 */

import React from "react";

// Import UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

// Import icons
import { Pencil, Trash2 } from "lucide-react";
import { TeacherCourseCardProps } from "@/types";

const TeacherCourseCard = ({
  course,
  onEdit,
  onDelete,
  isOwner,
}: TeacherCourseCardProps) => {
  return (
    <Card className="course-card-teacher group">
      {/* Card Header: Displays course image */}
      <CardHeader className="course-card-teacher__header">
        <Image
          src={course.image || "/placeholder.png"} // Default to placeholder if no image
          alt={course.title}                      // Image alt text
          width={370}
          height={150}
          className="course-card-teacher__image"
          priority
        />
      </CardHeader>

      {/* Card Content: Course Details */}
      <CardContent className="course-card-teacher__content">
        <div className="flex flex-col">
          {/* Course Title */}
          <CardTitle className="course-card-teacher__title">
            {course.title}
          </CardTitle>

          {/* Course Category */}
          <CardDescription className="course-card-teacher__category">
            {course.category}
          </CardDescription>

          {/* Course Status */}
          <p className="text-sm mb-2">
            Status:{" "}
            <span
              className={cn(
                "font-semibold px-2 py-1 rounded",
                course.status === "Published"
                  ? "bg-green-500/20 text-green-400" // Green for "Published"
                  : "bg-red-500/20 text-red-400"   // Red for other statuses
              )}
            >
              {course.status}
            </span>
          </p>

          {/* Enrollments Count */}
          {course.enrollments && (
            <p className="ml-1 mt-1 inline-block text-secondary bg-secondary/10 text-sm font-normal">
              <span className="font-bold text-white-100">
                {course.enrollments.length}
              </span>{" "}
              Student{course.enrollments.length > 1 ? "s" : ""} Enrolled
            </p>
          )}
        </div>

        {/* Action Buttons for Owners */}
        <div className="w-full xl:flex space-y-2 xl:space-y-0 gap-2 mt-3">
          {isOwner ? (
            <>
              {/* Edit Button */}
              <div>
                <Button
                  className="course-card-teacher__edit-button"
                  onClick={() => onEdit(course)} // Trigger edit callback
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              {/* Delete Button */}
              <div>
                <Button
                  className="course-card-teacher__delete-button"
                  onClick={() => onDelete(course)} // Trigger delete callback
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </>
          ) : (
            // View-only message for non-owners
            <p className="text-sm text-gray-500 italic">View Only</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCard;
