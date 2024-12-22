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
 *
 * @returns An array of updated sections with uploaded video URLs.
 */
export const uploadAllVideos = async (localSections: Section[], courseId: string, getUploadVideoUrl: any) => {
  /**
   * Step 1: Create a deep copy of `localSections` to avoid mutating the original data.
   * Each chapter object is shallowly copied to prepare for potential updates.
   */
  const updatedSections = localSections.map((section) => ({
    ...section,
    chapters: section.chapters.map((chapter) => ({
      ...chapter,
    })),
  }));

  /**
   * Step 2: Iterate through each section and its chapters.
   * For each chapter, check if the video is a valid file and upload it.
   */
  for (let i = 0; i < updatedSections.length; i++) {
    for (let j = 0; j < updatedSections[i].chapters.length; j++) {
      const chapter = updatedSections[i].chapters[j];

      // Check if the chapter contains a video file of type 'video/mp4'
      if (chapter.video instanceof File && chapter.video.type === "video/mp4") {
        try {
          /**
           * Step 3: Upload the video using the `uploadVideo` helper function.
           * Replace the original chapter's video with the uploaded video's URL.
           */
          const updatedChapter = await uploadVideo(
            chapter,
            courseId,
            updatedSections[i].sectionId,
            getUploadVideoUrl
          );
          updatedSections[i].chapters[j] = updatedChapter; // Update the chapter
        } catch (error) {
          /**
           * Step 4: Log an error message if video upload fails for a chapter.
           * The process continues for the remaining videos.
           */
          console.error(
            `Failed to upload video for chapter ${chapter.chapterId}:`,
            error
          );
        }
      }
    }
  }


  // Step 5: Return the updated sections with video URLs replaced.
  return updatedSections;
};


/**
 * Uploads a single video file for a chapter to a pre-signed URL.
 *
 * @param chapter - The chapter object containing video information.
 * @param courseId - The ID of the course the video belongs to.
 * @param sectionId - The ID of the section containing the chapter.
 * @param getUploadVideoUrl - Function to fetch the pre-signed URL for video upload.
 *
 * @returns The updated chapter object with the uploaded video's URL.
 */
async function uploadVideo(chapter: Chapter, courseId: string, sectionId: string, getUploadVideoUrl: any) {
  // Retrieve the video file from the chapter object.
  const file = chapter.video as File;

  try {
    /**
     * Step 1: Fetch the pre-signed upload URL and the resulting video URL.
     * The pre-signed URL allows the video to be uploaded directly to cloud storage.
     */
    const { uploadUrl, videoUrl } = await getUploadVideoUrl({
      courseId,               // ID of the course
      sectionId,              // ID of the section
      chapterId: chapter.chapterId, // ID of the chapter
      fileName: file.name,    // Name of the video file
      fileType: file.type,    // Type of the video file (e.g., video/mp4)
    }).unwrap();

    /**
     * Step 2: Upload the video file to the pre-signed URL using an HTTP PUT request.
     * The file's content type is set in the request headers to ensure proper handling.
     */
    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type, // Set the file's MIME type
      },
      body: file, // Video file content to be uploaded
    });

    // Step 3: Notify the user of a successful upload using a toast notification.
    toast.success(
      `Video uploaded successfully for chapter ${chapter.chapterId}`
    );

    // Step 4: Return the updated chapter object with the uploaded video URL.
    return { ...chapter, video: videoUrl };
  } catch (error) {
    // Step 5: Log an error and rethrow it if the upload fails.
    console.error(
      `Failed to upload video for chapter ${chapter.chapterId}:`,
      error
    );
    throw error; // Propagate the error to the caller
  }
}

