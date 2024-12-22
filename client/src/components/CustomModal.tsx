/**
 * CustomModal Component
 *
 * This component provides a reusable modal structure with a fixed overlay.
 * - **Props**:
 *   - `isOpen`: Boolean to determine whether the modal is open or closed.
 *   - `onClose`: Function to close the modal, typically triggered when clicking outside the content area.
 *   - `children`: React elements to be rendered inside the modal (content).
 */

import { CustomFixedModalProps } from "@/types"; // Type definition for props
import React from "react";

// CustomModal Component
const CustomModal = ({ isOpen, onClose, children }: CustomFixedModalProps) => {
  // If modal is not open, do not render anything
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="custom-modal__overlay"
        onClick={onClose} // Close modal when overlay is clicked
      />

      {/* Modal Content */}
      <div className="custom-modal__content">
        <div className="custom-modal__inner">
          {children} {/* Render child components (modal content) */}
        </div>
      </div>
    </>
  );
};

export default CustomModal;
