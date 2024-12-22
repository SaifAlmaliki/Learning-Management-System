"use strict";
/**
 * Summary:
 * This file defines a DynamoDB model for tracking user course progress using the Dynamoose library.
 * The schema includes user, course, and progress-related details.
 *
 * - `chapterProgressSchema`: Tracks progress of individual chapters.
 * - `sectionProgressSchema`: Tracks progress of sections that include chapters.
 * - `userCourseProgressSchema`: Tracks overall course progress for a user.
 *
 * The model uses `timestamps: true` to automatically handle createdAt and updatedAt fields.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const dynamoose_1 = require("dynamoose"); // Importing Dynamoose for schema and model creation
/**
 * Schema for tracking progress of a single chapter.
 * Fields:
 *   - chapterId: Unique identifier for the chapter (required).
 *   - completed: Indicates if the chapter has been completed (required).
 */
const chapterProgressSchema = new dynamoose_1.Schema({
    chapterId: { type: String, required: true },
    completed: { type: Boolean, required: true },
});
/**
 * Schema for tracking progress of sections.
 * A section contains multiple chapters.
 * Fields:
 *   - sectionId: Unique identifier for the section (required).
 *   - chapters: Array of chapters with their progress.
 */
const sectionProgressSchema = new dynamoose_1.Schema({
    sectionId: {
        type: String,
        required: true,
    },
    chapters: {
        type: Array,
        schema: [chapterProgressSchema], // Array of chapter progress objects
    },
});
/**
 * Schema for tracking overall user course progress.
 * Fields:
 *   - userId: Unique identifier for the user (hash key).
 *   - courseId: Unique identifier for the course (range key).
 *   - enrollmentDate: Date when the user enrolled in the course.
 *   - overallProgress: Numeric value representing overall course progress.
 *   - sections: Array of sections with their progress.
 *   - lastAccessedTimestamp: Timestamp of the last access.
 *
 * Options:
 *   - `timestamps: true` automatically manages createdAt and updatedAt fields.
 */
const userCourseProgressSchema = new dynamoose_1.Schema({
    userId: {
        type: String,
        hashKey: true, // Partition key for DynamoDB
        required: true,
    },
    courseId: {
        type: String,
        rangeKey: true, // Sort key for DynamoDB
        required: true,
    },
    enrollmentDate: {
        type: String,
        required: true,
    },
    overallProgress: {
        type: Number,
        required: true,
    },
    sections: {
        type: Array,
        schema: [sectionProgressSchema], // Array of section progress objects
    },
    lastAccessedTimestamp: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});
/**
 * Dynamoose model for user course progress.
 * Table Name: "UserCourseProgress"
 */
const UserCourseProgress = (0, dynamoose_1.model)("UserCourseProgress", userCourseProgressSchema);
exports.default = UserCourseProgress;
