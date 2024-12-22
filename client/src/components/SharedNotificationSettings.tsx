"use client";
import { NotificationSettingsFormData, notificationSettingsSchema } from "@/lib/schemas"; // Import form schema and types for form validation.
import { zodResolver } from "@hookform/resolvers/zod"; // Integrates Zod for form validation with React Hook Form.
import { useUpdateUserMutation } from "@/state/api";   // Custom hook for updating user data (likely via an API call).
import { useUser } from "@clerk/nextjs"; // Retrieves the current user object using Clerk authentication.
import React from "react";
import { useForm } from "react-hook-form";  // React Hook Form for managing form state and submission.
import Header from "./Header";              // Custom component to render the title and subtitle.
import { Form } from "@/components/ui/form"; // Wrapper component for the form.
import { CustomFormField } from "./CustomFormField"; // Custom form field component to handle different types of inputs.
import { Button } from "@/components/ui/button"; // Custom button component for form submission.
import { SharedNotificationSettingsProps, UserSettings } from "@/types";

// Main component for managing notification settings.
const SharedNotificationSettings = ({
  title = "Notification Settings",                // Default title for the settings form.
  subtitle = "Manage your notification settings", // Default subtitle for additional context.
}: SharedNotificationSettingsProps) => {
  const { user } = useUser();                     // Fetch the currently signed-in user from Clerk.
  const [updateUser] = useUpdateUserMutation();   // Mutation hook for updating user data.

  // Retrieve the user's current settings from public metadata (default to an empty object if undefined).
  const currentSettings =
    (user?.publicMetadata as { settings?: UserSettings })?.settings || {};

  // Initialize the form with validation schema, resolver, and default values.
  const methods = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema), // Validate form fields using Zod schema.
    defaultValues: {
      courseNotifications: currentSettings.courseNotifications || false,  // Default value for course notifications.
      emailAlerts: currentSettings.emailAlerts || false,                  // Default value for email alerts.
      smsAlerts: currentSettings.smsAlerts || false,                      // Default value for SMS alerts.
      notificationFrequency: currentSettings.notificationFrequency || "daily", // Default value for notification frequency.
    },
  });

  // Function to handle form submission.
  const onSubmit = async (data: NotificationSettingsFormData) => {
    if (!user) return; // Exit if the user is not signed in.

    // Prepare the updated user metadata to include the new form data.
    const updatedUser = {
      userId: user.id, // User ID for identifying which user to update.
      publicMetadata: {
        ...user.publicMetadata, // Preserve existing metadata.
        settings: {
          ...currentSettings, // Preserve existing settings.
          ...data, // Update settings with the submitted form data.
        },
      },
    };

    try {
      await updateUser(updatedUser); // Call the mutation to update the user's data.
    } catch (error) {
      console.error("Failed to update user settings: ", error); // Log an error if the update fails.
    }
  };

  // Show a fallback message if no user is signed in.
  if (!user) return <div>Please sign in to manage your settings.</div>;

  // Render the notification settings form.
  return (
    <div className="notification-settings">
      <Header title={title} subtitle={subtitle} />

      {/* Schadcn React Hook Form wrapper */}
      <Form {...methods}>
        {/* Form submission handler */}
        <form
          onSubmit={methods.handleSubmit(onSubmit)} // Handle form submission.
          className="notification-settings__form"
        >
          <div className="notification-settings__fields">
            {/* Custom form fields for each notification setting */}
            <CustomFormField
              name="courseNotifications"    // Field name for React Hook Form.
              label="Course Notifications"  // Label for the field.
              type="switch"                 // Input type as a toggle switch.
            />
            <CustomFormField
              name="emailAlerts"
              label="Email Alerts"
              type="switch"
            />
            <CustomFormField
              name="smsAlerts"
              label="SMS Alerts"
              type="switch"
            />
            <CustomFormField
              name="notificationFrequency"
              label="Notification Frequency"
              type="select" // Input type as a dropdown select.
              options={[    // Options for the select dropdown.
                { value: "immediate", label: "Immediate" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </div>

          {/* Submit button for the form */}
          <Button type="submit" className="notification-settings__submit">Update Settings</Button>
        </form>
      </Form>
    </div>
  );
};

// Export the component for use in other parts of the application.
export default SharedNotificationSettings;
