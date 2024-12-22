/**
 * Course Editor Redux Slice
 *
 * This Redux slice manages the state of the course editor.
 * It provides actions and reducers to handle:
 * - **Sections**: Add, edit, delete, and manage course sections.
 * - **Chapters**: Add, edit, delete, and manage chapters within sections.
 * - **Modals**: Open and close modals for section and chapter management.
 * - **State Tracking**: Tracks the selected section or chapter indices for edits.
 *
 * State Structure:
 * - `courseEditor`:
 *   - `sections`: Array of sections, each containing chapters.
 *   - `isChapterModalOpen`: Boolean indicating if the chapter modal is open.
 *   - `isSectionModalOpen`: Boolean indicating if the section modal is open.
 *   - `selectedSectionIndex`: Index of the currently selected section.
 *   - `selectedChapterIndex`: Index of the currently selected chapter.
 */

import { Chapter, Section } from "@/types"; // Import types for sections and chapters
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of the initial state
interface InitialStateTypes {
  courseEditor: {
    sections: Section[]; // Array of sections
    isChapterModalOpen: boolean; // Chapter modal open state
    isSectionModalOpen: boolean; // Section modal open state
    selectedSectionIndex: number | null; // Selected section index for edits
    selectedChapterIndex: number | null; // Selected chapter index for edits
  };
}

// Initial state of the slice
const initialState: InitialStateTypes = {
  courseEditor: {
    sections: [],
    isChapterModalOpen: false,
    isSectionModalOpen: false,
    selectedSectionIndex: null,
    selectedChapterIndex: null,
  },
};

// Create a Redux slice for course editor
export const globalSlice = createSlice({
  name: "global", // Name of the slice
  initialState,
  reducers: {
    /**
     * Sets the sections in the course editor.
     * @param state - The current state.
     * @param action - The new sections array.
     */
    setSections: (state, action: PayloadAction<Section[]>) => {
      state.courseEditor.sections = action.payload;
    },

    /**
     * Opens the chapter modal and sets the selected section and chapter indices.
     * @param state - The current state.
     * @param action - Payload containing sectionIndex and chapterIndex.
     */
    openChapterModal: (
      state,
      action: PayloadAction<{
        sectionIndex: number | null;
        chapterIndex: number | null;
      }>
    ) => {
      state.courseEditor.isChapterModalOpen = true;
      state.courseEditor.selectedSectionIndex = action.payload.sectionIndex;
      state.courseEditor.selectedChapterIndex = action.payload.chapterIndex;
    },

    /**
     * Closes the chapter modal and resets the selected indices.
     */
    closeChapterModal: (state) => {
      state.courseEditor.isChapterModalOpen = false;
      state.courseEditor.selectedSectionIndex = null;
      state.courseEditor.selectedChapterIndex = null;
    },

    /**
     * Opens the section modal and sets the selected section index.
     * @param state - The current state.
     * @param action - Payload containing sectionIndex.
     */
    openSectionModal: (state, action: PayloadAction<{ sectionIndex: number | null }>) => {
      state.courseEditor.isSectionModalOpen = true;
      state.courseEditor.selectedSectionIndex = action.payload.sectionIndex;
    },

    /**
     * Closes the section modal and resets the selected index.
     */
    closeSectionModal: (state) => {
      state.courseEditor.isSectionModalOpen = false;
      state.courseEditor.selectedSectionIndex = null;
    },

    /**
     * Adds a new section to the sections array.
     * @param state - The current state.
     * @param action - The new section to add.
     */
    addSection: (state, action: PayloadAction<Section>) => {
      state.courseEditor.sections.push(action.payload);
    },

    /**
     * Edits an existing section at a given index.
     * @param state - The current state.
     * @param action - Payload containing index and updated section.
     */
    editSection: (
      state,
      action: PayloadAction<{ index: number; section: Section }>
    ) => {
      state.courseEditor.sections[action.payload.index] =
        action.payload.section;
    },

    /**
     * Deletes a section at the specified index.
     * @param state - The current state.
     * @param action - Payload containing the index of the section to delete.
     */
    deleteSection: (state, action: PayloadAction<number>) => {
      state.courseEditor.sections.splice(action.payload, 1);
    },

    /**
     * Adds a new chapter to a section at a specified index.
     * @param state - The current state.
     * @param action - Payload containing sectionIndex and new chapter.
     */
    addChapter: (state, action: PayloadAction<{ sectionIndex: number; chapter: Chapter }>) => {
      state.courseEditor.sections[action.payload.sectionIndex].chapters.push(
        action.payload.chapter
      );
    },

    /**
     * Edits an existing chapter within a section at specified indices.
     * @param state - The current state.
     * @param action - Payload containing sectionIndex, chapterIndex, and updated chapter.
     */
    editChapter: (
      state,
      action: PayloadAction<{
        sectionIndex: number;
        chapterIndex: number;
        chapter: Chapter;
      }>
    ) => {
      state.courseEditor.sections[action.payload.sectionIndex].chapters[
        action.payload.chapterIndex
      ] = action.payload.chapter;
    },

    /**
     * Deletes a chapter within a section at specified indices.
     * @param state - The current state.
     * @param action - Payload containing sectionIndex and chapterIndex.
     */
    deleteChapter: (
      state,
      action: PayloadAction<{ sectionIndex: number; chapterIndex: number }>
    ) => {
      state.courseEditor.sections[action.payload.sectionIndex].chapters.splice(
        action.payload.chapterIndex,
        1
      );
    },
  },
});

// Export actions for dispatching
export const {
  setSections,
  openChapterModal,
  closeChapterModal,
  openSectionModal,
  closeSectionModal,
  addSection,
  editSection,
  deleteSection,
  addChapter,
  editChapter,
  deleteChapter,
} = globalSlice.actions;

// Export the reducer to include in the store
export default globalSlice.reducer;
