/**
 * DroppableComponent
 *
 * This component provides a drag-and-drop interface for managing course sections and chapters.
 * - Allows reordering of sections and chapters using drag-and-drop.
 * - Enables actions such as adding, editing, and deleting sections and chapters.
 * - Uses @hello-pangea/dnd for drag-and-drop functionality.
 *
 * Components:
 * - **SectionHeader**: Displays section title and actions (edit, delete).
 * - **ChapterItem**: Displays chapter title and actions (edit, delete).
 *
 * Key Features:
 * - Drag-and-drop functionality for sections and chapters.
 * - Redux actions are dispatched to update the state.
 * - UI is dynamically rendered based on sections and chapters from Redux state.
 */

"use client";

// Import drag-and-drop library components
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Import UI components
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus, GripVertical } from "lucide-react";

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setSections, deleteSection, deleteChapter, openSectionModal, openChapterModal } from "@/state";
import { Chapter, Section } from "@/types";

export default function DroppableComponent() {
  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

  /**
   * Handles drag-and-drop events for sections.
   * @param result - Drag result object from @hello-pangea/dnd.
   */
  const handleSectionDragEnd = (result: any) => {
    if (!result.destination) return; // Exit if item is dropped outside valid area

    const startIndex = result.source.index; // Original position
    const endIndex = result.destination.index; // New position

    // Reorder sections array
    const updatedSections = [...sections];
    const [reorderedSection] = updatedSections.splice(startIndex, 1);
    updatedSections.splice(endIndex, 0, reorderedSection);

    dispatch(setSections(updatedSections)); // Update Redux state
  };

  /**
   * Handles drag-and-drop events for chapters within a section.
   * @param result - Drag result object from @hello-pangea/dnd.
   * @param sectionIndex - The index of the section containing the chapters.
   */
  const handleChapterDragEnd = (result: any, sectionIndex: number) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    // Reorder chapters within the section
    const updatedSections = [...sections];
    const updatedChapters = [...updatedSections[sectionIndex].chapters];
    const [reorderedChapter] = updatedChapters.splice(startIndex, 1);
    updatedChapters.splice(endIndex, 0, reorderedChapter);

    updatedSections[sectionIndex].chapters = updatedChapters;
    dispatch(setSections(updatedSections));
  };

  return (
    <DragDropContext onDragEnd={handleSectionDragEnd}>
      {/* Droppable area for sections */}
      <Droppable droppableId="sections">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {sections.map((section: Section, sectionIndex: number) => (
              <Draggable
                key={section.sectionId}
                draggableId={section.sectionId}
                index={sectionIndex}
              >
                {(draggableProvider) => (
                  <div
                    ref={draggableProvider.innerRef}
                    {...draggableProvider.draggableProps}
                    className={`droppable-section ${
                      sectionIndex % 2 === 0
                        ? "droppable-section--even"
                        : "droppable-section--odd"
                    }`}
                  >
                    {/* Section Header */}
                    <SectionHeader
                      section={section}
                      sectionIndex={sectionIndex}
                      dragHandleProps={draggableProvider.dragHandleProps}
                    />

                    {/* Nested droppable area for chapters */}
                    <DragDropContext
                      onDragEnd={(result) =>
                        handleChapterDragEnd(result, sectionIndex)
                      }
                    >
                      <Droppable droppableId={`chapters-${section.sectionId}`}>
                        {(droppableProvider) => (
                          <div
                            ref={droppableProvider.innerRef}
                            {...droppableProvider.droppableProps}
                          >
                            {section.chapters.map(
                              (chapter: Chapter, chapterIndex: number) => (
                                <Draggable
                                  key={chapter.chapterId}
                                  draggableId={chapter.chapterId}
                                  index={chapterIndex}
                                >
                                  {(draggableProvider) => (
                                    <ChapterItem
                                      chapter={chapter}
                                      chapterIndex={chapterIndex}
                                      sectionIndex={sectionIndex}
                                      draggableProvider={draggableProvider}
                                    />
                                  )}
                                </Draggable>
                              )
                            )}
                            {droppableProvider.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    {/* Button to add a new chapter */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        dispatch(
                          openChapterModal({
                            sectionIndex,
                            chapterIndex: null,
                          })
                        )
                      }
                      className="add-chapter-button group"
                    >
                      <Plus className="add-chapter-button__icon" />
                      <span className="add-chapter-button__text">
                        Add Chapter
                      </span>
                    </Button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

/**
 * SectionHeader Component
 *
 * Displays a section title with edit and delete actions.
 */
const SectionHeader = ({
  section,
  sectionIndex,
  dragHandleProps,
}: {
  section: Section;
  sectionIndex: number;
  dragHandleProps: any;
}) => {
  const dispatch = useAppDispatch();

  return (
    <div className="droppable-section__header" {...dragHandleProps}>
      <div className="droppable-section__title-wrapper">
        <div className="droppable-section__title">
          <GripVertical className="h-6 w-6 mb-1" />
          <h3 className="text-lg font-medium">{section.sectionTitle}</h3>
        </div>
        <div className="droppable-chapter__actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => dispatch(openSectionModal({ sectionIndex }))}
          >
            <Edit className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => dispatch(deleteSection(sectionIndex))}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * ChapterItem Component
 *
 * Displays a chapter title with edit and delete actions.
 */
const ChapterItem = ({
  chapter,
  chapterIndex,
  sectionIndex,
  draggableProvider,
}: {
  chapter: Chapter;
  chapterIndex: number;
  sectionIndex: number;
  draggableProvider: any;
}) => {
  const dispatch = useAppDispatch();

  return (
    <div
      ref={draggableProvider.innerRef}
      {...draggableProvider.draggableProps}
      {...draggableProvider.dragHandleProps}
      className={`droppable-chapter ${
        chapterIndex % 2 === 1
          ? "droppable-chapter--odd"
          : "droppable-chapter--even"
      }`}
    >
      <div className="droppable-chapter__title">
        <GripVertical className="h-4 w-4 mb-[2px]" />
        <p className="text-sm">{`${chapterIndex + 1}. ${chapter.title}`}</p>
      </div>
      <div className="droppable-chapter__actions">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            dispatch(
              openChapterModal({
                sectionIndex,
                chapterIndex,
              })
            )
          }
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            dispatch(
              deleteChapter({
                sectionIndex,
                chapterIndex,
              })
            )
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
