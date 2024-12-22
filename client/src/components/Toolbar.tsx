/**
 * Toolbar Component
 *
 * This component provides a search input and a category filter dropdown.
 * - Allows users to search courses by typing in the input field.
 * - Allows users to filter courses by selecting a category from the dropdown.
 * - The component communicates changes (search term or category) to its parent component using callback props.
 */

import React, { useState } from "react";

// Import Select UI components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import course categories utility
import { courseCategories } from "@/lib/utils";

// Define props for the Toolbar component
interface ToolbarProps {
  onSearch: (value: string) => void;           // Callback for search input changes
  onCategoryChange: (value: string) => void;  // Callback for category selection changes
}

const Toolbar = ({ onSearch, onCategoryChange }: ToolbarProps) => {
  // Local state to manage the search term
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Handles changes to the search input field.
   * Updates the local state and calls the parent callback.
   * @param value - The updated search term entered by the user.
   */
  const handleSearch = (value: string) => {
    setSearchTerm(value); // Update local state
    onSearch(value);      // Notify parent component
  };

  return (
    <div className="toolbar">
      {/* Search Input */}
      <input
        type="text"
        value={searchTerm}                              // Bind input value to local state
        onChange={(e) => handleSearch(e.target.value)}  // Handle changes in input field
        placeholder="Search courses"                    // Placeholder text
        className="toolbar__search"                     // CSS class for styling
      />

      {/* Category Select Dropdown */}
      <Select onValueChange={onCategoryChange}>   {/* Callback on category selection */}
        <SelectTrigger className="toolbar__select"> {/* Dropdown trigger */}
          <SelectValue placeholder="Categories" />  {/* Default placeholder */}
        </SelectTrigger>

        {/* Dropdown Content */}
        <SelectContent className="bg-customgreys-primarybg hover:bg-customgreys-primarybg">
          {/* "All Categories" option */}
          <SelectItem value="all" className="toolbar__select-item">
            All Categories
          </SelectItem>

          {/* Render category options dynamically */}
          {courseCategories.map((category) => (
            <SelectItem
              key={category.value}                    // Unique key for each option
              value={category.value}                  // Value sent on selection
              className="toolbar__select-item"        // CSS class for styling
            >
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Toolbar;
