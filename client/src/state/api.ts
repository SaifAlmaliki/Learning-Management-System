/**
 * Custom RTK Query API with endpoints for users, courses, transactions, and progress tracking.
 * Handles custom base query logic including:
 * - Authorization with Clerk session tokens.
 * - Success and error toasts.
 * - Response formatting for consistency.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { toast } from "sonner";
import { Clerk } from "@clerk/clerk-js";

// Types
import { User } from "@clerk/nextjs/server";
import { Course, SectionProgress, Transaction, UserCourseProgress } from "@/types";

// ======================== Custom Base Query ========================

/**
 * Custom base query to include:
 * - Authorization headers using Clerk session tokens.
 * - Success toast notifications for mutation requests (non-GET).
 * - Error handling and toast notifications for failed requests.
 * - Consistent response formatting.
 */
const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL, // API Base URL from environment variables
    prepareHeaders: async (headers) => {
      // Fetch Clerk session token for authentication
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  try {
    const result: any = await baseQuery(args, api, extraOptions);

    // Handle API errors and display error toast
    if (result.error) {
      const errorMessage =
        result.error.data?.message || result.error.status.toString() || "An error occurred";
      toast.error(`Error: ${errorMessage}`);
    }

    // Show success toast for mutation requests (non-GET)
    const isMutationRequest =
      (args as FetchArgs).method && (args as FetchArgs).method !== "GET";
    if (isMutationRequest) {
      const successMessage = result.data?.message;
      if (successMessage) toast.success(successMessage);
    }

    // Extract the 'data' field for consistent response handling
    if (result.data) {
      result.data = result.data.data;
    } else if (result.error?.status === 204) {
      // Handle "No Content" responses
      return { data: null };
    }

    return result;
  } catch (error: unknown) {
    // Catch any unexpected errors and return a consistent error object
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { error: { status: "FETCH_ERROR", error: errorMessage } };
  }
};

// ======================== RTK Query API Definition ========================

/**
 * RTK Query API setup with endpoints for:
 * - Users
 * - Courses
 * - Transactions
 * - Course Progress
 */
export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: ["Courses", "Users", "UserCourseProgress"],

  endpoints: (build) => ({
    // ======================== USER ENDPOINTS ========================

    // Update user information
    updateUser: build.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...updatedUser }) => ({
        url: `users/clerk/${userId}`,
        method: "PUT",
        body: updatedUser,
      }),
      invalidatesTags: ["Users"],
    }),

    // ======================== COURSES ENDPOINTS ========================

    // Fetch all courses, optionally filtered by category
    getCourses: build.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: "courses",
        params: { category },
      }),
      providesTags: ["Courses"],
    }),

    // Fetch a specific course by ID
    getCourse: build.query<Course, string>({
      query: (id) => `courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),

    // Create a new course
    createCourse: build.mutation<Course, { teacherId: string; teacherName: string }>({
      query: (body) => ({
        url: "courses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    // Update a course
    updateCourse: build.mutation<Course, { courseId: string; formData: FormData }>({
      query: ({ courseId, formData }) => ({
        url: `courses/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { courseId }) => [{ type: "Courses", id: courseId }],
    }),

    // Delete a course
    deleteCourse: build.mutation<{ message: string }, string>({
      query: (courseId) => ({
        url: `courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),

    // Generate upload URL for chapter videos
    getUploadVideoUrl: build.mutation<
      { uploadUrl: string; videoUrl: string },
      { courseId: string; chapterId: string; sectionId: string; fileName: string; fileType: string }
    >({
      query: ({ courseId, sectionId, chapterId, fileName, fileType }) => ({
        url: `courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-upload-url`,
        method: "POST",
        body: { fileName, fileType },
      }),
    }),

    // ======================== TRANSACTIONS ENDPOINTS ========================

    // Fetch user transactions
    getTransactions: build.query<Transaction[], string>({
      query: (userId) => `transactions?userId=${userId}`,
    }),

    // Create a Stripe payment intent
    createStripePaymentIntent: build.mutation<{ clientSecret: string }, { amount: number }>({
      query: ({ amount }) => ({
        url: "/transactions/stripe/payment-intent",
        method: "POST",
        body: { amount },
      }),
    }),

    // Create a new transaction
    createTransaction: build.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: "transactions",
        method: "POST",
        body: transaction,
      }),
    }),

    // ======================== USER COURSE PROGRESS ========================

    // Fetch courses a user is enrolled in
    getUserEnrolledCourses: build.query<Course[], string>({
      query: (userId) => `users/course-progress/${userId}/enrolled-courses`,
      providesTags: ["Courses", "UserCourseProgress"],
    }),

    // Fetch user course progress
    getUserCourseProgress: build.query<
      UserCourseProgress,
      { userId: string; courseId: string }
    >({
      query: ({ userId, courseId }) =>
        `users/course-progress/${userId}/courses/${courseId}`,
      providesTags: ["UserCourseProgress"],
    }),

    // Update user course progress
    updateUserCourseProgress: build.mutation<
      UserCourseProgress,
      { userId: string; courseId: string; progressData: { sections: SectionProgress[] } }
    >({
      query: ({ userId, courseId, progressData }) => ({
        url: `users/course-progress/${userId}/courses/${courseId}`,
        method: "PUT",
        body: progressData,
      }),
      invalidatesTags: ["UserCourseProgress"],
    }),
  }),
});

// ======================== Generated Hooks ========================
// Export hooks for components to use the API endpoints
export const {
  useUpdateUserMutation,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetUploadVideoUrlMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useCreateStripePaymentIntentMutation,
  useGetUserEnrolledCoursesQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation,
} = api;
