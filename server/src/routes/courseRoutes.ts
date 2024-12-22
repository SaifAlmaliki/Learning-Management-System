import express from "express";
import multer from "multer";
import {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  updateCourse,
  getUploadVideoUrl,
} from "../controllers/courseController";
import { requireAuth } from "@clerk/express";

// Initialize the Express router
const router = express.Router();

// Configure multer for file uploads; files are stored in memory as buffers
const upload = multer({ storage: multer.memoryStorage() });

// ======================== Route Definitions ========================

// Retrieves a list of courses.
// Controller: listCourses
router.get("/", listCourses);


// Creates a new course.
// - Requires user authentication.
// - Controller: createCourse
router.post("/", requireAuth(), createCourse);

// GET /:courseId
// Retrieves details of a specific course by its ID.
// Controller: getCourse
router.get("/:courseId", getCourse);

// PUT /:courseId
// Updates a specific course by its ID.
// - Requires user authentication.
// - Supports uploading a single image file via `image` field.
// - Controller: updateCourse
router.put("/:courseId", requireAuth(), upload.single("image"), updateCourse);

// DELETE /:courseId
// Deletes a specific course by its ID.
// - Requires user authentication.
// - Controller: deleteCourse
router.delete("/:courseId", requireAuth(), deleteCourse);

// POST /:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url
// Generates a signed upload URL for video uploads for a specific chapter.
// - Requires user authentication.
// - Controller: getUploadVideoUrl
router.post(
  "/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url",
  requireAuth(),
  getUploadVideoUrl
);

// ======================== Export the Router ========================
// Export the configured router to be used in the main app
export default router;
