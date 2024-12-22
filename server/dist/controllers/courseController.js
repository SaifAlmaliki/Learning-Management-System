"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadVideoUrl = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourse = exports.listCourses = void 0;
const courseModel_1 = __importDefault(require("../models/courseModel"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
const express_1 = require("@clerk/express");
// Initialize the AWS S3 instance
const s3 = new aws_sdk_1.default.S3();
// ======================== List Courses ========================
/**
 * Retrieves a list of courses.
 * - If a category is specified (and not 'all'), it filters courses by category.
 * - Otherwise, it retrieves all courses.
 */
const listCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query; // Get the category query parameter
    try {
        const courses = category && category !== "all"
            ? yield courseModel_1.default.scan("category").eq(category).exec() // Filter by category
            : yield courseModel_1.default.scan().exec(); // Retrieve all courses
        res.json({ message: "Courses retrieved successfully", data: courses });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving courses", error });
    }
});
exports.listCourses = listCourses;
// ======================== Get Single Course ========================
/**
 * Retrieves a single course by its ID.
 * - If the course is not found, it returns a 404 response.
 */
const getCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    try {
        const course = yield courseModel_1.default.get(courseId); // Fetch course by ID
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        res.json({ message: "Course retrieved successfully", data: course });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving course", error });
    }
});
exports.getCourse = getCourse;
// ======================== Create a New Course ========================
/**
 * Creates a new course with default properties.
 * - Requires `teacherId` and `teacherName` in the request body.
 */
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teacherId, teacherName } = req.body;
        if (!teacherId || !teacherName) {
            res.status(400).json({ message: "Teacher Id and name are required" });
            return;
        }
        // Initialize a new course with default values
        const newCourse = new courseModel_1.default({
            courseId: (0, uuid_1.v4)(),
            teacherId,
            teacherName,
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
        yield newCourse.save(); // Save to the database
        res.json({ message: "Course created successfully", data: newCourse });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating course", error });
    }
});
exports.createCourse = createCourse;
// ======================== Update Course ========================
/**
 * Updates an existing course.
 * - Only the course owner (teacher) is allowed to update the course.
 * - Updates include price formatting, sections, and chapters with ID generation.
 */
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const updateData = Object.assign({}, req.body);
    const { userId } = (0, express_1.getAuth)(req); // Get authenticated user ID
    try {
        const course = yield courseModel_1.default.get(courseId);
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
            const sectionsData = typeof updateData.sections === "string"
                ? JSON.parse(updateData.sections)
                : updateData.sections;
            updateData.sections = sectionsData.map((section) => (Object.assign(Object.assign({}, section), { sectionId: section.sectionId || (0, uuid_1.v4)(), chapters: section.chapters.map((chapter) => (Object.assign(Object.assign({}, chapter), { chapterId: chapter.chapterId || (0, uuid_1.v4)() }))) })));
        }
        // Apply updates and save
        Object.assign(course, updateData);
        yield course.save();
        res.json({ message: "Course updated successfully", data: course });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating course", error });
    }
});
exports.updateCourse = updateCourse;
// ======================== Delete Course ========================
/**
 * Deletes a course by its ID.
 * - Only the course owner (teacher) is allowed to delete the course.
 */
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const { userId } = (0, express_1.getAuth)(req);
    try {
        const course = yield courseModel_1.default.get(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        // Check if the user is authorized to delete the course
        if (course.teacherId !== userId) {
            res.status(403).json({ message: "Not authorized to delete this course" });
            return;
        }
        yield courseModel_1.default.delete(courseId); // Delete the course
        res.json({ message: "Course deleted successfully", data: course });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting course", error });
    }
});
exports.deleteCourse = deleteCourse;
// ======================== Generate Upload URL ========================
/**
 * Generates a signed upload URL for AWS S3.
 * - Requires `fileName` and `fileType` in the request body.
 * - The generated URL is valid for 60 seconds.
 */
const getUploadVideoUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
        res.status(400).json({ message: "File name and type are required" });
        return;
    }
    try {
        const uniqueId = (0, uuid_1.v4)();
        const s3Key = `videos/${uniqueId}/${fileName}`;
        const s3Params = {
            Bucket: process.env.S3_BUCKET_NAME || "",
            Key: s3Key,
            Expires: 60,
            ContentType: fileType,
        };
        // Generate signed URL for PUT operation
        const uploadUrl = s3.getSignedUrl("putObject", s3Params);
        const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${fileName}`;
        res.json({
            message: "Upload URL generated successfully",
            data: { uploadUrl, videoUrl },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error generating upload URL", error });
    }
});
exports.getUploadVideoUrl = getUploadVideoUrl;
