/**
 * This controller file provides CRUD operations for managing courses and generates upload URLs for video uploads.
 * It includes endpoints for listing, retrieving, creating, updating, and deleting courses, as well as generating signed URLs for AWS S3 upload
 */
import { Request, Response } from "express";
import Course from "../models/courseModel";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";

const s3 = new AWS.S3();
console.log("AWS S3 instance initialized");

// ======================== List Courses ========================
/**
 * Retrieves a list of courses.
 * - If a category is specified (and not 'all'), it filters courses by category.
 * - Otherwise, it retrieves all courses.
 */
export const listCourses = async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query; // Get the category query parameter

  try {
    const courses =
      category && category !== "all"
        ? await Course.scan("category").eq(category).exec() // Filter by category
        : await Course.scan().exec(); // Retrieve all courses

    res.json({ message: "Courses retrieved successfully", data: courses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving courses", error });
  }
};

// ======================== Get Single Course ========================
/**
 * Retrieves a single course by its ID.
 * - If the course is not found, it returns a 404 response.
 */
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;

  try {
    const course = await Course.get(courseId); // Fetch course by ID
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    res.json({ message: "Course retrieved successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving course", error });
  }
};

// ======================== Create a New Course ========================
/**
 * Creates a new course with default properties.
 * - Requires `teacherId` and `teacherName` in the request body.
 */
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId, teacherName } = req.body;

    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Teacher Id and name are required" });
      return;
    }

    // Initialize a new course with default values
    const newCourse = new Course({
      courseId: uuidv4(),
      teacherId,
      teacherName,
      teacherTitle: "Course Instructor",
      teacherExperience: "Add your professional experience here",
      title: "Untitled Course",
      description: "",
      category: "Uncategorized",
      image: "",
      price: 0,
      level: "Beginner",
      status: "Draft",
      sections: [],
      enrollments: [],
    });

    await newCourse.save(); // Save to the database

    res.json({ message: "Course created successfully", data: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

// ======================== Update Course ========================
/**
 * Updates an existing course.
 * - Only the course owner (teacher) is allowed to update the course.
 * - Updates include price formatting, sections, and chapters with ID generation.
 */
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const updateData = { ...req.body };
  const { userId } = getAuth(req); // Get authenticated user ID

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Check if the user is authorized to update the course
    if (course.teacherId !== userId) {
      res.status(403).json({ message: "Not authorized to update this course" });
      return;
    }

    // Format price to an integer (in cents)
    if (updateData.price) {
      const price = parseInt(updateData.price);
      if (isNaN(price)) {
        res.status(400).json({
          message: "Invalid price format",
          error: "Price must be a valid number",
        });
        return;
      }
      updateData.price = price * 100;
    }

    // Update sections with unique IDs if missing
    if (updateData.sections) {
      const sectionsData =
        typeof updateData.sections === "string"
          ? JSON.parse(updateData.sections)
          : updateData.sections;

      updateData.sections = sectionsData.map((section: any) => ({
        ...section,
        sectionId: section.sectionId || uuidv4(),
        chapters: section.chapters.map((chapter: any) => ({
          ...chapter,
          chapterId: chapter.chapterId || uuidv4(),
        })),
      }));
    }

    // Apply updates and save
    Object.assign(course, updateData);
    await course.save();

    res.json({ message: "Course updated successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error });
  }
};

// ======================== Delete Course ========================
/**
 * Deletes a course by its ID.
 * - Only the course owner (teacher) is allowed to delete the course.
 */
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Check if the user is authorized to delete the course
    if (course.teacherId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this course" });
      return;
    }

    await Course.delete(courseId); // Delete the course

    res.json({ message: "Course deleted successfully", data: course });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
};

// ======================== Generate Upload URL ========================
/**
 * Generates a signed upload URL for AWS S3.
 * - Requires `fileName` and `fileType` in the request body.
 * - The generated URL is valid for 60 seconds.
 */
export const getUploadVideoUrl = async (req: Request, res: Response): Promise<void> => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    res.status(400).json({ message: "File name and type are required" });
    return;
  }

  try {
    const uniqueId = uuidv4();
    const s3Key = `videos/${uniqueId}/${fileName}`;

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Key,
      Expires: 60,
      ContentType: fileType,
    };

    // Generate signed URL for PUT operation
    const uploadUrl = s3.getSignedUrl("putObject", s3Params);
    const videoUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${fileName}`;

    res.json({
      message: "Upload URL generated successfully",
      data: { uploadUrl, videoUrl },
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating upload URL", error });
  }
};
