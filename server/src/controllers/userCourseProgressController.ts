import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import UserCourseProgress from "../models/userCourseProgressModel";
import Course from "../models/courseModel";
import { calculateOverallProgress, mergeSections } from "../utils/utils";

/**
 * Module: User Course Management API
 *
 * This module handles API routes for managing user course data:
 * 1. Retrieve enrolled courses for a user.
 * 2. Fetch course progress for a specific user.
 * 3. Update or initialize user course progress.
 *
 * Functions:
 * - getUserEnrolledCourses
 * - getUserCourseProgress
 * - updateUserCourseProgress
 */

/**
 * getUserEnrolledCourses
 *
 * Fetches all courses a user is enrolled in based on user ID.
 * Ensures user authentication and authorization.
 */
export const getUserEnrolledCourses = async ( req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;  // Extract userId from request parameters
  const auth = getAuth(req);      // Get authentication info from Clerk

  // Authorization: Verify if the request is made by the same user
  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    // Fetch user course progress data for the given userId
    const enrolledCourses = await UserCourseProgress.query("userId")
      .eq(userId)
      .exec();

    // If user hasn't enrolled in any courses, return empty array
    if (!enrolledCourses || enrolledCourses.length === 0) {
      res.json({
        message: "No enrolled courses found",
        data: [],
      });
      return;
    }

    // Extract course IDs from progress records
    const courseIds = enrolledCourses.map((item: any) => item.courseId);

    // Fetch course details in bulk based on course IDs
    const courses = await Course.batchGet(courseIds);

    res.json({
      message: "Enrolled courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    console.error('Error in getUserEnrolledCourses:', error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * getUserCourseProgress
 *
 * Fetches progress for a specific course for a given user.
 */
export const getUserCourseProgress = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId } = req.params; // Extract userId and courseId from request parameters

  try {
    // Fetch progress data for the user-course pair
    const progress = await UserCourseProgress.get({ userId, courseId });

    // If no progress exists, return 404
    if (!progress) {
      res.status(404).json({
        message: "Course progress not found for this user",
      });
      return;
    }

    res.json({
      message: "Course progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving user course progress",
      error,
    });
  }
};

/**
 * updateUserCourseProgress
 *
 * Updates or initializes user progress for a course.
 * Merges new progress with existing data and recalculates overall progress.
 */
export const updateUserCourseProgress = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId } = req.params; // Extract userId and courseId
  const progressData = req.body; // Extract progress data from request body

  try {
    // Retrieve existing progress
    let progress = await UserCourseProgress.get({ userId, courseId });

    if (!progress) {
      // If no progress exists, create a new record
      progress = new UserCourseProgress({
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        overallProgress: 0,
        sections: progressData.sections || [],
        lastAccessedTimestamp: new Date().toISOString(),
      });
    } else {
      // Merge existing progress with new progress data
      progress.sections = mergeSections(
        progress.sections,
        progressData.sections || []
      );
      progress.lastAccessedTimestamp = new Date().toISOString();

      // Recalculate overall progress based on updated sections
      progress.overallProgress = calculateOverallProgress(progress.sections);
    }

    // Save progress to the database
    await progress.save();

    res.json({
      message: "Course progress updated successfully",
      data: progress,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      message: "Error updating user course progress",
      error,
    });
  }
};