import express from "express";
import dotenv from "dotenv"; // dotenv is used to load environment variables from a .env file into process.env.
dotenv.config();

console.log('Environment variables loaded');

import bodyParser from "body-parser"; // Middleware for parsing request bodies.
import cors from "cors"; // Middleware to enable Cross-Origin Resource Sharing.
import helmet from "helmet"; // Middleware to enhance security by setting various HTTP headers.
import morgan from "morgan"; // Middleware for logging HTTP requests.
import * as dynamoose from "dynamoose"; // Library to interact with DynamoDB using an ORM-like approach.
import serverless from "serverless-http"; // Serverless framework for handling AWS Lambda integration.
import seed from "./seed/seedDynamodb"; // Custom module for seeding DynamoDB with initial data.
import { clerkMiddleware, createClerkClient,requireAuth} from "@clerk/express"; // Clerk middleware and utilities for user authentication and management.

// Configure AWS
console.log('Configuring AWS...');
const ddb = new dynamoose.aws.ddb.DynamoDB({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  },
  region: process.env.AWS_REGION
});
dynamoose.aws.ddb.set(ddb);
console.log('AWS configured successfully');

// Importing route modules
import courseRoutes from "./routes/courseRoutes"; // Routes for managing courses.
import userClerkRoutes from "./routes/userClerkRoutes"; // Routes for user-related operations via Clerk.
import transactionRoutes from "./routes/transactionRoutes"; // Routes for handling transactions.
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes"; // Routes for tracking user course progress.

/* CONFIGURATIONS */
// Check if the application is running in a production environment.
const isProduction = process.env.NODE_ENV === "production";

// If not in production, configure DynamoDB to use a local database.
if (!isProduction) {
  dynamoose.aws.ddb.local();
}

// Create a Clerk client using the secret key from the environment variables.
export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Initialize the Express application.
const app = express();

// Middleware setup
app.use(express.json());  // Parse incoming requests with JSON payloads.
app.use(helmet());        // Apply security-related HTTP headers.
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Enable cross-origin policies for embedded content.
app.use(morgan("common"));  // Log HTTP requests in a concise format.
app.use(bodyParser.json()); // Parse JSON request bodies.
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded request bodies.
app.use(cors()); // Enable CORS for all routes.
app.use(clerkMiddleware()); // Use Clerk middleware for authentication and user management.

/* ROUTES */
// Define a default route to verify server functionality.
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Apply Clerk middleware only to routes that require authentication
app.use('/users/clerk', clerkMiddleware(), userClerkRoutes); // Protected routes
app.use('/transactions', clerkMiddleware(), transactionRoutes); // Protected routes
app.use('/users/course-progress', clerkMiddleware(), userCourseProgressRoutes); // Protected routes

// Public routes (no Clerk middleware)
app.use('/courses', courseRoutes); // Public route

/* SERVER */
// Define the server port from the environment variable or default to 3000.
const port = process.env.PORT || 3001;

// Start the Express server if not in AWS Lambda environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  console.log('Starting server...');
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port configured in .env: ${process.env.PORT}`);
  console.log(`Final port being used: ${port}`);

  app.listen(port, () => {
    console.log(`✅ Server is running on http://localhost:${port}`);
  });
}

// AWS production environment setup
// Wrap the Express app in a serverless handler for AWS Lambda.
const serverlessApp = serverless(app);

// Export the Lambda handler function.
export const handler = async (event: any, context: any) => {
  if (event.action === "seed") {
    // If the event action is "seed", seed the DynamoDB with initial data.
    await seed();
    return {
      statusCode: 200, // HTTP success status code.
      body: JSON.stringify({ message: "Data seeded successfully" }), // Response body indicating success.
    };
  } else {
    // For all other events, pass the request to the serverless Express app.
    return serverlessApp(event, context);
  }
};
