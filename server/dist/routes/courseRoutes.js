"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const courseController_1 = require("../controllers/courseController");
const express_2 = require("@clerk/express");
// Initialize the Express router
const router = express_1.default.Router();
// Configure multer for file uploads; files are stored in memory as buffers
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// ======================== Route Definitions ========================
// Retrieves a list of courses.
// Controller: listCourses
router.get("/", courseController_1.listCourses);
// Creates a new course.
// - Requires user authentication.
// - Controller: createCourse
router.post("/", (0, express_2.requireAuth)(), courseController_1.createCourse);
// GET /:courseId
// Retrieves details of a specific course by its ID.
// Controller: getCourse
router.get("/:courseId", courseController_1.getCourse);
// PUT /:courseId
// Updates a specific course by its ID.
// - Requires user authentication.
// - Supports uploading a single image file via `image` field.
// - Controller: updateCourse
router.put("/:courseId", (0, express_2.requireAuth)(), upload.single("image"), courseController_1.updateCourse);
// DELETE /:courseId
// Deletes a specific course by its ID.
// - Requires user authentication.
// - Controller: deleteCourse
router.delete("/:courseId", (0, express_2.requireAuth)(), courseController_1.deleteCourse);
// POST /:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url
// Generates a signed upload URL for video uploads for a specific chapter.
// - Requires user authentication.
// - Controller: getUploadVideoUrl
router.post("/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url", (0, express_2.requireAuth)(), courseController_1.getUploadVideoUrl);
// ======================== Export the Router ========================
// Export the configured router to be used in the main app
exports.default = router;
