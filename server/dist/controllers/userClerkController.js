"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = void 0;
const index_1 = require("../index"); // Import the Clerk client for interacting with user data
// Define an asynchronous function to update user metadata
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract the userId parameter from the request URL
    const { userId } = req.params;
    // Extract the user data (e.g., public metadata) from the request body
    const userData = req.body;
    try {
        // Use Clerk's client to update user metadata for the given userId
        const user = yield index_1.clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                // Update the userType and settings fields under public metadata
                userType: userData.publicMetadata.userType,
                settings: userData.publicMetadata.settings,
            },
        });
        // Send a success response with the updated user data
        res.json({ message: "User updated successfully", data: user });
    }
    catch (error) {
        // If an error occurs, send a 500 Internal Server Error response with the error details
        res.status(500).json({ message: "Error updating user", error });
    }
});
exports.updateUser = updateUser;
