import { Request, Response } from "express";  // Import types for Express Request and Response objects
import { clerkClient } from "../index";       // Import the Clerk client for interacting with user data

// Define an asynchronous function to update user metadata
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  // Extract the userId parameter from the request URL
  const { userId } = req.params;

  // Extract the user data (e.g., public metadata) from the request body
  const userData = req.body;

  try {
    // Use Clerk's client to update user metadata for the given userId
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        // Update the userType and settings fields under public metadata
        userType: userData.publicMetadata.userType,
        settings: userData.publicMetadata.settings,
      },
    });

    // Send a success response with the updated user data
    res.json({ message: "User updated successfully", data: user });
  } catch (error) {
    // If an error occurs, send a 500 Internal Server Error response with the error details
    res.status(500).json({ message: "Error updating user", error });
  }
};
