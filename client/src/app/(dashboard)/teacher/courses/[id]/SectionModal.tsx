/**
 * SectionModal Component
 *
 * This component provides a modal for adding or editing a course section.
 * - Supports input fields for section title and description.
 * - Allows creating a new section or editing an existing one based on the selected index.
 * - Uses `react-hook-form` for form handling with schema validation using Zod.
 */

import { CustomFormField } from "@/components/CustomFormField";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// Import schema and Redux actions
import { SectionFormData, sectionSchema } from "@/lib/schemas";
import { addSection, closeSectionModal, editSection } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { Section } from "@/types";

// Import libraries and utilities
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const SectionModal = () => {
  const dispatch = useAppDispatch();

  // Access Redux state for modal visibility and section data
  const { isSectionModalOpen, selectedSectionIndex, sections } = useAppSelector(
    (state) => state.global.courseEditor
  );

  // Retrieve the currently selected section, if editing
  const section =
    selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

  // Initialize the form with schema validation using Zod
  const methods = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema), // Validate form data
    defaultValues: {
      title: "",
      description: "",
    },
  });


  // Effect to reset form fields based on whether a section is being edited.
  useEffect(() => {
    if (section) {
      // Populate form with existing section data
      methods.reset({
        title: section.sectionTitle,
        description: section.sectionDescription,
      });
    } else {
      // Reset form to default values when adding a new section
      methods.reset({
        title: "",
        description: "",
      });
    }
  }, [section, methods]);

  /**
   * Closes the section modal.
   */
  const onClose = () => {
    dispatch(closeSectionModal());
  };

  /**
   * Handles form submission for adding or editing a section.
   * @param data - Form data containing section title and description.
   */
  const onSubmit = (data: SectionFormData) => {
    // Create a new section object
    const newSection: Section = {
      sectionId: section?.sectionId || uuidv4(),  // Use existing ID or generate a new one
      sectionTitle: data.title,                   // Section title from the form
      sectionDescription: data.description,       // Section description from the form
      chapters: section?.chapters || []           // Retain existing chapters if editing
    };

    if (selectedSectionIndex === null) {
      // If no section is selected, add a new section
      dispatch(addSection(newSection));
    } else {
      // If a section is selected, update the existing section
      dispatch(
        editSection({
          index: selectedSectionIndex,
          section: newSection,
        })
      );
    }

    // Display success notification
    toast.success(
      `Section added/updated successfully but you need to save the course to apply the changes`
    );

    // Close the modal
    onClose();
  };

  return (
    <CustomModal isOpen={isSectionModalOpen} onClose={onClose}>
      <div className="section-modal">
        {/* Modal Header */}
        <div className="section-modal__header">
          <h2 className="section-modal__title">Add/Edit Section</h2>
          <button onClick={onClose} className="section-modal__close">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form for Section Input */}
        <Form {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)} // Handle form submission
            className="section-modal__form"
          >
            {/* Section Title Field */}
            <CustomFormField
              name="title"
              label="Section Title"
              placeholder="Write section title here"
            />

            {/* Section Description Field */}
            <CustomFormField
              name="description"
              label="Section Description"
              type="textarea"
              placeholder="Write section description here"
            />

            {/* Modal Actions */}
            <div className="section-modal__actions">
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

export default SectionModal;
