/**
 * CourseEditor Component
 *
 * This component provides a form-based interface for teachers to edit or update a course.
 * - Allows editing of course details such as title, description, category, price, and status.
 * - Displays a section editor where teachers can manage course sections.
 * - Supports uploading videos and saving course content using RTK Query and utilities.
 * - Provides "Save Draft" and "Publish" functionality for course status management.
 *
 * Features:
 * - Fetches existing course data for editing.
 * - Integrates with custom form fields for handling inputs.
 * - Utilizes drag-and-drop for managing sections.
 * - Displays modals for adding/editing chapters and sections.
 */

"use client";

// Import components
import { CustomFormField } from "@/components/CustomFormField";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import DroppableComponent from "./Droppable";
import ChapterModal from "./ChapterModal";
import SectionModal from "./SectionModal";

// Import utilities and schemas
import { CourseFormData, courseSchema } from "@/lib/schemas";
import {
  centsToDollars,
  createCourseFormData,
  uploadAllVideos,
} from "@/lib/utils";

// Import Redux state management
import { openSectionModal, setSections } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";

// Import API hooks
import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useGetUploadVideoUrlMutation,
} from "@/state/api";

// Import libraries and hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const CourseEditor = () => {
  const router = useRouter(); // Navigation hook
  const params = useParams();
  const id = params.id as string; // Extract course ID from URL params

  // Fetch course data and define mutations
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  const [getUploadVideoUrl] = useGetUploadVideoUrlMutation();

  const dispatch = useAppDispatch(); // Dispatch for Redux actions
  const { sections } = useAppSelector((state) => state.global.courseEditor); // Access sections from state

  // Initialize the form with React Hook Form and Zod schema validation
  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      coursePrice: "0",
      courseStatus: false,
      teacherExperience: "",
      teacherTitle: "",
    },
  });

  // Add state for upload progress
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    progress: 0,
    fileName: "",
    counter: 1,
    startTime: 0,
  });

  // Counter effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (uploadProgress.isUploading) {
      const now = Date.now();
      setUploadProgress(prev => ({ ...prev, startTime: now }));
      
      intervalId = setInterval(() => {
        setUploadProgress(prev => {
          const elapsedTime = Date.now() - prev.startTime;
          
          // If upload takes less than 1 second, close spinner
          if (elapsedTime < 1000 && prev.progress === 100) {
            return { ...prev, isUploading: false };
          }
          
          // Increment counter up to 100
          const newCounter = prev.counter < 100 ? prev.counter + 1 : prev.counter;
          return { ...prev, counter: newCounter };
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [uploadProgress.isUploading]);

  // Effect to populate the form and Redux state with course data when fetched
  useEffect(() => {
    if (course) {
      methods.reset({
        courseTitle: course.title,
        courseDescription: course.description,
        courseCategory: course.category,
        coursePrice: centsToDollars(course.price),
        courseStatus: course.status === "Published",
        teacherExperience: course.teacherExperience || "",
        teacherTitle: course.teacherTitle || "",
      });
      dispatch(setSections(course.sections || [])); // Populate sections in Redux state
    }
  }, [course, methods]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handles form submission: updates course details and uploads videos if necessary.
  const onSubmit = async (data: CourseFormData) => {
    try {
      // Set initial upload state
      setUploadProgress({
        isUploading: true,
        progress: 0,
        fileName: "",
        counter: 1,
        startTime: 0,
      });

      // Upload videos and prepare updated sections
      const updatedSections = await uploadAllVideos(
        sections,
        id,
        getUploadVideoUrl,
        (progress: number, fileName: string) => {
          setUploadProgress((prev) => ({
            ...prev,
            progress,
            fileName,
          }));
        }
      );

      // Reset upload state
      setUploadProgress({
        isUploading: false,
        progress: 0,
        fileName: "",
        counter: 1,
        startTime: 0,
      });

      // Prepare form data for the update
      const formData = createCourseFormData(data, updatedSections);

      // Update course via API mutation
      await updateCourse({
        courseId: id,
        formData,
      }).unwrap();

      toast.success("Course updated successfully!");
      refetch(); // Refresh course data after update
    } catch (error) {
      console.error("Failed to update course:", error);
      toast.error("Failed to update course. Please try again.");
      setUploadProgress({
        isUploading: false,
        progress: 0,
        fileName: "",
        counter: 1,
        startTime: 0,
      });
    }
  };

  return (
    <div>
      {/* Upload Progress Overlay */}
      {uploadProgress.isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-customgreys-darkGrey p-6 rounded-lg max-w-md w-full mx-4">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
              </div>
              <h3 className="text-lg font-semibold text-center text-white">Uploading Video</h3>
              <p className="text-sm text-gray-400 text-center">{uploadProgress.fileName}</p>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-primary-700 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 text-center">
                {uploadProgress.counter}% Complete
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Back to Courses Button */}
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-customgreys-dirtyGrey rounded-lg p-2 gap-2 cursor-pointer hover:bg-customgreys-dirtyGrey hover:text-white-100 text-customgreys-dirtyGrey"
          onClick={() => router.push("/teacher/courses", { scroll: false })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </button>
      </div>

      {/* Course Form */}
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          {/* Header with Course Status Switch and Save Button */}
          <Header
            title="Course Setup"
            subtitle="Complete all fields and save your course"
            rightElement={
              <div className="flex items-center space-x-4">
                {/* Course Status Switch */}
                <CustomFormField
                  name="courseStatus"
                  label={methods.watch("courseStatus") ? "Published" : "Draft"}
                  type="switch"
                  className="flex items-center space-x-2"
                  labelClassName={`text-sm font-medium ${
                    methods.watch("courseStatus")
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                  inputClassName="data-[state=checked]:bg-green-500"
                />
                {/* Save Button */}
                <Button
                  type="submit"
                  className="bg-primary-700 hover:bg-primary-600"
                >
                  {methods.watch("courseStatus")
                    ? "Update Published Course"
                    : "Save Draft"}
                </Button>
              </div>
            }
          />

          {/* Form Fields */}
          <div className="flex justify-between md:flex-row flex-col gap-10 mt-5 font-dm-sans">
            <div className="basis-1/2 space-y-4">
              <CustomFormField
                name="courseTitle"
                label="Course Title"
                type="text"
                placeholder="Write course title here"
              />

              <CustomFormField
                name="courseDescription"
                label="Course Description"
                type="textarea"
                placeholder="Write course description here"
              />

              <CustomFormField
                name="courseCategory"
                label="Course Category"
                type="select"
                placeholder="Select category here"
                options={[
                  { value: "cloud-computing", label: "Cloud Computing" },
                  { value: "science", label: "Science" },
                  { value: "mathematics", label: "Mathematics" },
                  { value: "artificial-intelligence", label: "Artificial Intelligence" },
                ]}
              />

              <CustomFormField
                name="coursePrice"
                label="Course Price"
                type="number"
                placeholder="0"
              />

              <CustomFormField
                name="teacherTitle"
                label="Your Professional Title"
                type="text"
                placeholder="e.g., Senior Software Engineer, Data Scientist, etc."
                className="w-full"
              />

              <CustomFormField
                name="teacherExperience"
                label="Your Professional Experience"
                type="textarea"
                placeholder="Share your professional experience and expertise..."
                className="w-full"
              />
            </div>

            {/* Sections Editor */}
            <div className="bg-customgreys-darkGrey mt-4 md:mt-0 p-4 rounded-lg basis-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-secondary-foreground">
                  Sections
                </h2>

                {/* Add Section Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    dispatch(openSectionModal({ sectionIndex: null }))
                  }
                  className="border-none text-primary-700 group"
                >
                  <Plus className="mr-1 h-4 w-4 text-primary-700 group-hover:white-100" />
                  <span className="text-primary-700 group-hover:white-100">
                    Add Section
                  </span>
                </Button>
              </div>

              {/* Section Content */}
              {isLoading ? (
                <p>Loading course content...</p>
              ) : sections.length > 0 ? (
                <DroppableComponent />
              ) : (
                <p>No sections available</p>
              )}
            </div>
          </div>
        </form>
      </Form>

      {/* Modals */}
      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;
