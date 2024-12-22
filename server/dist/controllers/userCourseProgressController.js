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
exports.updateUserCourseProgress = exports.getUserCourseProgress = exports.getUserEnrolledCourses = void 0;
const express_1 = require("@clerk/express");
const userCourseProgressModel_1 = __importDefault(require("../models/userCourseProgressModel"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const utils_1 = require("../utils/utils");
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
const getUserEnrolledCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params; // Extract userId from request parameters
    const auth = (0, express_1.getAuth)(req); // Get authentication info from Clerk
    // Authorization: Verify if the request is made by the same user
    if (!auth || auth.userId !== userId) {
        res.status(403).json({ message: "Access denied" });
        return;
    }
    try {
        // Fetch user course progress data for the given userId
        const enrolledCourses = yield userCourseProgressModel_1.default.query("userId")
            .eq(userId)
            .exec();
        // Extract course IDs from progress records
        const courseIds = enrolledCourses.map((item) => item.courseId);
        // Fetch course details in bulk based on course IDs
        const courses = yield courseModel_1.default.batchGet(courseIds);
        res.json({
            message: "Enrolled courses retrieved successfully",
            data: courses,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error retrieving enrolled courses",
            error,
        });
    }
});
exports.getUserEnrolledCourses = getUserEnrolledCourses;
/**
 * getUserCourseProgress
 *
 * Fetches progress for a specific course for a given user.
 */
const getUserCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, courseId } = req.params; // Extract userId and courseId from request parameters
    try {
        // Fetch progress data for the user-course pair
        const progress = yield userCourseProgressModel_1.default.get({ userId, courseId });
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
    }
    catch (error) {
        res.status(500).json({
            message: "Error retrieving user course progress",
            error,
        });
    }
});
exports.getUserCourseProgress = getUserCourseProgress;
/**
 * updateUserCourseProgress
 *
 * Updates or initializes user progress for a course.
 * Merges new progress with existing data and recalculates overall progress.
 */
const updateUserCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, courseId } = req.params; // Extract userId and courseId
    const progressData = req.body; // Extract progress data from request body
    try {
        // Retrieve existing progress
        let progress = yield userCourseProgressModel_1.default.get({ userId, courseId });
        if (!progress) {
            // If no progress exists, create a new record
            progress = new userCourseProgressModel_1.default({
                userId,
                courseId,
                enrollmentDate: new Date().toISOString(),
                overallProgress: 0,
                sections: progressData.sections || [],
                lastAccessedTimestamp: new Date().toISOString(),
            });
        }
        else {
            // Merge existing progress with new progress data
            progress.sections = (0, utils_1.mergeSections)(progress.sections, progressData.sections || []);
            progress.lastAccessedTimestamp = new Date().toISOString();
            // Recalculate overall progress based on updated sections
            progress.overallProgress = (0, utils_1.calculateOverallProgress)(progress.sections);
        }
        // Save progress to the database
        yield progress.save();
        res.json({
            message: "Course progress updated successfully",
            data: progress,
        });
    }
    catch (error) {
        console.error("Error updating progress:", error);
        res.status(500).json({
            message: "Error updating user course progress",
            error,
        });
    }
});
exports.updateUserCourseProgress = updateUserCourseProgress;
