/**
 * ChapterModal Component
 *
 * This component provides a modal for adding or editing chapters within a section.
 * - Supports input fields for chapter title, content, and video upload.
 * - Allows creating a new chapter or editing an existing one based on the selected indices.
 * - Uses `react-hook-form` for form handling with schema validation using Zod.
 *
 * Features:
 * - Pre-populates fields when editing an existing chapter.
 * - Adds new chapters or updates existing ones using Redux actions.
 * - Provides a toast notification to inform the user about changes.
 */

import { CustomFormField } from "@/components/CustomFormField";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Import schemas, actions, and Redux hooks
import { ChapterFormData, chapterSchema } from "@/lib/schemas";
import { addChapter, closeChapterModal, editChapter } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { Chapter } from "@/types";

// Import utilities and libraries
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const ChapterModal = () => {
  const dispatch = useAppDispatch();

  // Access relevant Redux state
  const {
    isChapterModalOpen,
    selectedSectionIndex,
    selectedChapterIndex,
    sections,
  } = useAppSelector((state) => state.global.courseEditor);

  // Get the chapter being edited, if applicable
  const chapter: Chapter | undefined =
    selectedSectionIndex !== null && selectedChapterIndex !== null
      ? sections[selectedSectionIndex].chapters[selectedChapterIndex]
      : undefined;

  // Initialize the form with Zod validation and default values
  const methods = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: "",
      content: "",
      video: "",
    },
  });

  /**
   * Effect to reset form fields when a chapter is being edited or cleared.
   */
  useEffect(() => {
    if (chapter) {
      // Pre-fill form with existing chapter data
      methods.reset({
        title: chapter.title,
        content: chapter.content,
        video: chapter.video || "",
      });
    } else {
      // Reset to default values when adding a new chapter
      methods.reset({
        title: "",
        content: "",
        video: "",
      });
    }
  }, [chapter, methods]);


  // Closes the chapter modal.
  const onClose = () => {
    dispatch(closeChapterModal());
  };

  /**
   * Handles form submission to add or edit a chapter.
   * @param data - Form data containing chapter title, content, and video.
   */
  const onSubmit = (data: ChapterFormData) => {
    if (selectedSectionIndex === null) return;

    // Create a new chapter object
    const newChapter: Chapter = {
      chapterId: chapter?.chapterId || uuidv4(), // Use existing ID or generate a new one
      title: data.title,
      content: data.content,
      type: data.video ? "Video" : "Text",       // Determine chapter type based on video input
      video: data.video,
    };

    if (selectedChapterIndex === null) {
      // Add a new chapter if no chapter is selected
      dispatch(
        addChapter({
          sectionIndex: selectedSectionIndex,
          chapter: newChapter,
        })
      );
    } else {
      // Edit an existing chapter
      dispatch(
        editChapter({
          sectionIndex: selectedSectionIndex,
          chapterIndex: selectedChapterIndex,
          chapter: newChapter,
        })
      );
    }

    // Display success notification
    toast.success(
      `Chapter added/updated successfully but you need to save the course to apply the changes`
    );

    // Close the modal
    onClose();
  };

  return (
    <CustomModal isOpen={isChapterModalOpen} onClose={onClose}>
      <div className="chapter-modal">
        {/* Modal Header */}
        <div className="chapter-modal__header">
          <h2 className="chapter-modal__title">Add/Edit Chapter</h2>
          <button onClick={onClose} className="chapter-modal__close">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form for Chapter Input */}
        <Form {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="chapter-modal__form"
          >
            {/* Chapter Title Field */}
            <CustomFormField
              name="title"
              label="Chapter Title"
              placeholder="Write chapter title here"
            />

            {/* Chapter Content Field */}
            <CustomFormField
              name="content"
              label="Chapter Content"
              type="textarea"
              placeholder="Write chapter content here"
            />

            {/* Chapter Video Upload */}
            <FormField
              control={methods.control}
              name="video"
              render={({ field: { onChange, value } }) => (
                <FormItem>
                  <FormLabel className="text-customgreys-dirtyGrey text-sm">Chapter Video</FormLabel>
                  <FormControl>
                    <div>
                      {/* File Input */}
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        className="border-none bg-customgreys-darkGrey py-2 cursor-pointer"
                      />

                      {/* Display current or selected video */}
                      {typeof value === "string" && value && (
                        <div className="my-2 text-sm text-gray-600">
                          Current video: {value.split("/").pop()}
                        </div>
                      )}
                      {value instanceof File && (
                        <div className="my-2 text-sm text-gray-600">
                          Selected file: {value.name}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Modal Actions */}
            <div className="chapter-modal__actions">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-700">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </CustomModal>
  );
};

export default ChapterModal;
