"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoose_1 = require("dynamoose");
// ======================== Comment Schema ========================
/**
 * Schema for individual comments on chapters.
 * Represents a single comment posted by a user.
 */
const commentSchema = new dynamoose_1.Schema({
    // Unique identifier for the comment
    commentId: { type: String, required: true },
    // ID of the user who made the comment
    userId: { type: String, required: true },
    // Text content of the comment
    text: { type: String, required: true },
    // Timestamp indicating when the comment was made
    timestamp: { type: String, required: true },
});
// ======================== Chapter Schema ========================
/**
 * Schema for chapters within sections.
 * Each chapter can include content, comments, and optional video details.
 */
const chapterSchema = new dynamoose_1.Schema({
    // Unique identifier for the chapter
    chapterId: {
        type: String,
        required: true,
    },
    // Type of the chapter: Text, Quiz, or Video
    type: {
        type: String,
        enum: ["Text", "Quiz", "Video"],
        required: true,
    },
    // Title of the chapter
    title: {
        type: String,
        required: true,
    },
    // Main content of the chapter (e.g., text content)
    content: {
        type: String,
        required: true,
    },
    // Array of comments related to the chapter
    comments: {
        type: Array,
        schema: [commentSchema],
    },
    // URL or identifier for an optional video resource
    video: {
        type: String,
    },
});
// ======================== Section Schema ========================
/**
 * Schema for sections within a course.
 * A section consists of multiple chapters and includes metadata.
 */
const sectionSchema = new dynamoose_1.Schema({
    // Unique identifier for the section
    sectionId: {
        type: String,
        required: true,
    },
    // Title of the section
    sectionTitle: {
        type: String,
        required: true,
    },
    // Optional description for the section
    sectionDescription: {
        type: String,
    },
    // Array of chapters included in this section
    chapters: {
        type: Array,
        schema: [chapterSchema],
    },
});
// ======================== Course Schema ========================
/**
 * Main schema for a course.
 * A course contains metadata, sections, enrollments, and other details.
 */
const courseSchema = new dynamoose_1.Schema({
    // Unique identifier for the course (also acts as the hash key)
    courseId: {
        type: String,
        hashKey: true,
        required: true,
    },
    // Teacher-related details
    teacherId: {
        type: String,
        required: true,
    },
    teacherName: {
        type: String,
        required: true,
    },
    // Title of the course
    title: {
        type: String,
        required: true,
    },
    // Description of the course
    description: {
        type: String,
    },
    // Category under which the course is listed
    category: {
        type: String,
        required: true,
    },
    // Optional image URL for the course
    image: {
        type: String,
    },
    // Price of the course
    price: {
        type: Number,
    },
    // Difficulty level of the course
    level: {
        type: String,
        required: true,
        enum: ["Beginner", "Intermediate", "Advanced"],
    },
    // Status of the course: Draft or Published
    status: {
        type: String,
        required: true,
        enum: ["Draft", "Published"],
    },
    // Array of sections included in the course
    sections: {
        type: Array,
        schema: [sectionSchema],
    },
    // Array of enrollments (each enrollment contains a user ID)
    enrollments: {
        type: Array,
        schema: [
            new dynamoose_1.Schema({
                // ID of the enrolled user
                userId: {
                    type: String,
                    required: true,
                },
            }),
        ],
    },
}, {
    // Adds timestamps for createdAt and updatedAt
    timestamps: true,
});
// ======================== Course Model ========================
/**
 * Model for the 'Course' schema.
 * Represents a collection of courses in DynamoDB.
 */
const Course = (0, dynamoose_1.model)("Course", courseSchema);
// Export the Course model to be used in other parts of the application
exports.default = Course;
