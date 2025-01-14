import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";
import { api } from "../state/api";
import { toast } from "sonner";
import { CourseFormData } from "./schemas";
import { Chapter, Section } from "@/types";

/**
 * Summary:
 * This file provides utility functions, constants, and helpers for various tasks:
 *
 * - Utility functions:
 *   - `cn`: Combines class names using `clsx` and `tailwind-merge`.
 *   - `formatPrice`, `dollarsToCents`, `centsToDollars`: Convert between dollars and cents.
 * - Data schemas:
 *   - Zod schema for price transformation.
 * - Constants:
 *   - `countries`: List of country names.
 *   - `courseCategories`: Categories for courses.
 *   - `customStyles`, `customDataGridStyles`: Tailwind and DataGrid custom styles.
 * - Functions for managing course data:
 *   - `createCourseFormData`: Prepares form data for course submission.
 *   - `uploadAllVideos` and `uploadVideo`: Handles video uploads for chapters.
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert cents to formatted currency string (e.g., 4999 -> "$49.99")
export function formatPrice(cents: number | undefined): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents || 0) / 100);
}

// Convert dollars to cents (e.g., "49.99" -> 4999)
export function dollarsToCents(dollars: string | number): number {
  const amount = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  return Math.round(amount * 100);
}

// Convert cents to dollars (e.g., 4999 -> "49.99")
export function centsToDollars(cents: number | undefined): string {
  return ((cents || 0) / 100).toString();
}

// Zod schema for price input (converts dollar input to cents)
export const priceSchema = z.string().transform((val) => {
  const dollars = parseFloat(val);
  if (isNaN(dollars)) return "0";
  return dollarsToCents(dollars).toString();
});

export const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor (Timor-Leste)",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar (formerly Burma)",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export const customStyles = "text-gray-300 placeholder:text-gray-500";

export function convertToSubCurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}

export const NAVBAR_HEIGHT = 48;

/**
 * Categories for courses to be used in forms, dropdowns, or filters.
 * Each object contains:
 * - `value`: The internal identifier for the category.
 * - `label`: The user-friendly name displayed in the UI.
 */
export const courseCategories = [
  { value: "technology", label: "Technology" },
  { value: "science", label: "Science" },
  { value: "mathematics", label: "Mathematics" },
  { value: "artificial-intelligence", label: "Artificial Intelligence" },
] as const;

/**
 * Custom styles for the MUI DataGrid component.
 * This overrides the default DataGrid styles to match a dark-themed UI.
 */
export const customDataGridStyles = {
  border: "none", // Removes outer borders
  backgroundColor: "#17181D", // Dark background for the grid
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "#1B1C22", // Background color for column headers
    color: "#6e6e6e", // Light gray text for column headers
    "& [role='row'] > *": {
      backgroundColor: "#1B1C22 !important", // Ensures row headers match color
      border: "none !important", // Removes header borders
    },
  },
  "& .MuiDataGrid-cell": {
    color: "#6e6e6e", // Text color for cells
    border: "none !important", // Removes cell borders
  },
  "& .MuiDataGrid-row": {
    backgroundColor: "#17181D", // Background color for rows
    "&:hover": {
      backgroundColor: "#25262F", // Slightly lighter background on hover
    },
  },
  "& .MuiDataGrid-footerContainer": {
    backgroundColor: "#17181D", // Footer background color
    color: "#6e6e6e", // Footer text color
    border: "none !important", // Removes footer borders
  },
  "& .MuiDataGrid-filler": {
    border: "none !important", // Ensures no borders in filler rows
    backgroundColor: "#17181D !important",
    borderTop: "none !important",
    "& div": {
      borderTop: "none !important",
    },
  },
  "& .MuiTablePagination-root": {
    color: "#6e6e6e", // Pagination text color
  },
  "& .MuiTablePagination-actions .MuiIconButton-root": {
    color: "#6e6e6e", // Pagination button color
  },
};

/**
 * Prepares course form data for submission to an API endpoint.
 * Converts course details and section structure into a FormData object.
 *
 * @param data - The course data including title, description, price, and status.
 * @param sections - An array of sections, each containing chapters and videos.
 * @returns A FormData object ready for submission.
 */
export const createCourseFormData = (
  data: CourseFormData,
  sections: Section[]
): FormData => {
  const formData = new FormData();

  // Append basic course details to the form data
  formData.append("title", data.courseTitle);
  formData.append("description", data.courseDescription);
  formData.append("category", data.courseCategory);
  formData.append("price", data.coursePrice.toString());
  formData.append("status", data.courseStatus ? "Published" : "Draft");
  formData.append("teacherTitle", data.teacherTitle);
  formData.append("teacherExperience", data.teacherExperience);

  /**
   * Create a modified version of the sections array.
   * For each chapter, include its video field for upload handling.
   */
  const sectionsWithVideos = sections.map((section) => ({
    ...section,
    chapters: section.chapters.map((chapter) => ({
      ...chapter,
      video: chapter.video, // Retain video information
    })),
  }));

  // Append the sections as a JSON string to the form data
  formData.append("sections", JSON.stringify(sectionsWithVideos));

  return formData;
};

/**
 * Uploads all video files for the chapters in the provided sections.
 *
 * @param localSections - An array of sections, each containing chapters with potential video files.
 * @param courseId - The ID of the course the videos belong to.
 * @param getUploadVideoUrl - Function to fetch pre-signed URLs for uploading videos.
 * @param onProgress - Optional callback to report upload progress.
 *
 * @returns An array of updated sections with uploaded video URLs.
 */
export const uploadAllVideos = async (
  localSections: Section[],
  courseId: string,
  getUploadVideoUrl: any,
  onProgress?: (progress: number, fileName: string) => void
) => {
  console.log("🎬 Starting batch upload process for all videos...");
  console.log(`📊 Total sections to process: ${localSections.length}`);

  try {
    const updatedSections = await Promise.all(
      localSections.map(async (section) => {
        console.log(`\n📁 Processing section: ${section.sectionTitle}`);
        console.log(`📼 Number of chapters in section: ${section.chapters.length}`);

        const updatedChapters = await Promise.all(
          section.chapters.map(async (chapter) => {
            if (chapter.video instanceof File) {
              console.log(`\n📹 Found video file in chapter: ${chapter.title}`);
              console.log(`📄 Video file name: ${chapter.video.name}`);
              console.log(`📦 Video file size: ${(chapter.video.size / (1024 * 1024)).toFixed(2)} MB`);

              try {
                const updatedChapter = await uploadVideo(
                  chapter,
                  courseId,
                  section.sectionId,
                  getUploadVideoUrl,
                  onProgress
                );
                return updatedChapter;
              } catch (error) {
                console.error(`❌ Error uploading video for chapter: ${chapter.title}`, error);
                throw error;
              }
            }
            return chapter;
          })
        );

        return {
          ...section,
          chapters: updatedChapters,
        };
      })
    );

    console.log("\n✅ Batch upload process completed successfully!");
    return updatedSections;
  } catch (error) {
    console.error("❌ Batch upload process failed:", error);
    throw error;
  }
};

/**
 * Uploads a single video file for a chapter to a pre-signed URL.
 *
 * @param chapter - The chapter object containing video information.
 * @param courseId - The ID of the course the video belongs to.
 * @param sectionId - The ID of the section containing the chapter.
 * @param getUploadVideoUrl - Function to fetch the pre-signed URL for video upload.
 * @param onProgress - Optional callback to report upload progress.
 *
 * @returns The updated chapter object with the uploaded video's URL.
 */
async function uploadVideo(
  chapter: Chapter,
  courseId: string,
  sectionId: string,
  getUploadVideoUrl: any,
  onProgress?: (progress: number, fileName: string) => void
) {
  const file = chapter.video as File;
  console.log(`\n🚀 Starting upload process for video: ${file.name}`);
  console.log(`📊 File details:
    - Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB
    - Type: ${file.type}
    - Chapter: ${chapter.title}
  `);

  try {
    console.log("1️⃣ Requesting presigned URL from server...");
    const { uploadUrl, videoUrl } = await getUploadVideoUrl({
      courseId,
      sectionId,
      chapterId: chapter.chapterId,
      fileName: file.name,
      fileType: file.type,
    }).unwrap();
    console.log("✅ Presigned URL received successfully");

    console.log("2️⃣ Starting file upload to S3...");
    const uploadStartTime = Date.now();

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    // Track upload progress
    const reader = response.body?.getReader();
    const contentLength = file.size;
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader?.read() || { done: true, value: undefined };
      if (done) break;

      receivedLength += value?.length || 0;
      const progress = (receivedLength / contentLength) * 100;
      onProgress?.(progress, file.name);
    }

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const uploadDuration = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
    console.log(`✅ File uploaded successfully
      - Duration: ${uploadDuration} seconds
      - Final URL: ${videoUrl}
    `);

    toast.success(`Video uploaded successfully for chapter ${chapter.title}`);

    return { ...chapter, video: videoUrl };
  } catch (error) {
    console.error("❌ Upload failed:", error);
    toast.error(`Failed to upload video for chapter ${chapter.title}`);
    throw error;
  }
}
