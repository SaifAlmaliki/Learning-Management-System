/**
 * This file contains a set of utility functions related to managing video information,
 * validating uploaded files, merging sections and chapters, calculating course progress,
 * and handling advanced video uploads for HLS/DASH.
 */

import path from "path";

// Function to update video information for a specific chapter in a section.
// It first locates the section using the provided `sectionId`. If the section is not found,
// it throws an error. Then, it locates the chapter within that section using `chapterId`.
// If the chapter is not found, it throws an error as well.
// Once the chapter is found, it updates the `video` URL and sets the `type` to "Video".
export const updateCourseVideoInfo = (
  course: any,
  sectionId: string,
  chapterId: string,
  videoUrl: string
) => {
  const section = course.sections?.find((s: any) => s.sectionId === sectionId);
  if (!section) {
    throw new Error(`Section not found: ${sectionId}`);
  }

  const chapter = section.chapters?.find((c: any) => c.chapterId === chapterId);
  if (!chapter) {
    throw new Error(`Chapter not found: ${chapterId}`);
  }

  chapter.video = videoUrl;
  chapter.type = "Video";
};

// Function to validate uploaded files based on their extensions.
// It only allows files with specific extensions: .mp4, .m3u8, .mpd, .ts, and .m4s.
// For each file, it checks the extension and throws an error if the extension is unsupported.
export const validateUploadedFiles = (files: any) => {
  const allowedExtensions = [".mp4", ".m3u8", ".mpd", ".ts", ".m4s"];

  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }
};

// Function to return the appropriate content type (MIME type) based on the file extension.
// If the file extension does not match any known types, it defaults to "application/octet-stream".
export const getContentType = (filename: string) => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".mp4":
      return "video/mp4";
    case ".m3u8":
      return "application/vnd.apple.mpegurl";
    case ".mpd":
      return "application/dash+xml";
    case ".ts":
      return "video/MP2T";
    case ".m4s":
      return "video/iso.segment";
    default:
      return "application/octet-stream";
  }
};

// Function to handle advanced video uploads, specifically for HLS (.m3u8) and DASH (.mpd) formats.
// If any of the uploaded files include HLS or DASH manifests, it uploads all the files to S3 using a unique path.
// The function determines the manifest file (either .m3u8 or .mpd), constructs its URL, and identifies the video type.
// If no HLS or DASH files are detected, it returns `null`.
export const handleAdvancedVideoUpload = async (
  s3: any,
  files: any,
  uniqueId: string,
  bucketName: string
) => {
  const isHLSOrDASH = files.some(
    (file: any) =>
      file.originalname.endsWith(".m3u8") || file.originalname.endsWith(".mpd")
  );

  if (isHLSOrDASH) {
    const uploadPromises = files.map((file: any) => {
      const s3Key = `videos/${uniqueId}/${file.originalname}`;
      return s3
        .upload({
          Bucket: bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: getContentType(file.originalname),
        })
        .promise();
    });
    await Promise.all(uploadPromises);

    const manifestFile = files.find(
      (file: any) =>
        file.originalname.endsWith(".m3u8") || file.originalname.endsWith(".mpd")
    );
    const manifestFileName = manifestFile?.originalname || "";
    const videoType = manifestFileName.endsWith(".m3u8") ? "hls" : "dash";

    return {
      videoUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${manifestFileName}`,
      videoType,
    };
  }

  return null;
};

// Function to merge two arrays of sections.
// It merges sections by matching them using their `sectionId`.
// If a section already exists, its chapters are merged; otherwise, the section is added as new.
export const mergeSections = (
  existingSections: any[],
  newSections: any[]
): any[] => {
  const existingSectionsMap = new Map<string, any>();

  for (const existingSection of existingSections) {
    existingSectionsMap.set(existingSection.sectionId, existingSection);
  }

  for (const newSection of newSections) {
    const section = existingSectionsMap.get(newSection.sectionId);
    if (!section) {
      existingSectionsMap.set(newSection.sectionId, newSection);
    } else {
      section.chapters = mergeChapters(section.chapters, newSection.chapters);
      existingSectionsMap.set(newSection.sectionId, section);
    }
  }

  return Array.from(existingSectionsMap.values());
};

// Function to merge two arrays of chapters.
// It merges chapters based on their `chapterId`. If a chapter already exists, its properties are updated.
// If the chapter is new, it is added to the list.
export const mergeChapters = (
  existingChapters: any[],
  newChapters: any[]
): any[] => {
  const existingChaptersMap = new Map<string, any>();

  for (const existingChapter of existingChapters) {
    existingChaptersMap.set(existingChapter.chapterId, existingChapter);
  }

  for (const newChapter of newChapters) {
    existingChaptersMap.set(newChapter.chapterId, {
      ...(existingChaptersMap.get(newChapter.chapterId) || {}),
      ...newChapter,
    });
  }

  return Array.from(existingChaptersMap.values());
};

// Function to calculate the overall progress of a course.
// The progress is determined as the ratio of completed chapters to the total number of chapters.
// If there are no chapters, the function returns 0 to avoid division by zero.
export const calculateOverallProgress = (sections: any[]): number => {
  const totalChapters = sections.reduce(
    (acc: number, section: any) => acc + section.chapters.length,
    0
  );

  const completedChapters = sections.reduce(
    (acc: number, section: any) =>
      acc + section.chapters.filter((chapter: any) => chapter.completed).length,
    0
  );

  return totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
};
