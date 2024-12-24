"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.clerkClient = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv")); // dotenv is used to load environment variables from a .env file into process.env.
const body_parser_1 = __importDefault(require("body-parser")); // Middleware for parsing request bodies.
const cors_1 = __importDefault(require("cors")); // Middleware to enable Cross-Origin Resource Sharing.
const helmet_1 = __importDefault(require("helmet")); // Middleware to enhance security by setting various HTTP headers.
const morgan_1 = __importDefault(require("morgan")); // Middleware for logging HTTP requests.
const dynamoose = __importStar(require("dynamoose")); // Library to interact with DynamoDB using an ORM-like approach.
const serverless_http_1 = __importDefault(require("serverless-http")); // Serverless framework for handling AWS Lambda integration.
const seedDynamodb_1 = __importDefault(require("./seed/seedDynamodb")); // Custom module for seeding DynamoDB with initial data.
const express_2 = require("@clerk/express"); // Clerk middleware and utilities for user authentication and management.
// Importing route modules
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes")); // Routes for managing courses.
const userClerkRoutes_1 = __importDefault(require("./routes/userClerkRoutes")); // Routes for user-related operations via Clerk.
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes")); // Routes for handling transactions.
const userCourseProgressRoutes_1 = __importDefault(require("./routes/userCourseProgressRoutes")); // Routes for tracking user course progress.
/* CONFIGURATIONS */
// Load environment variables from the .env file into process.env.
dotenv_1.default.config();
// Check if the application is running in a production environment.
const isProduction = process.env.NODE_ENV === "production";
// If not in production, configure DynamoDB to use a local database.
if (!isProduction) {
    dynamoose.aws.ddb.local();
}
// Create a Clerk client using the secret key from the environment variables.
exports.clerkClient = (0, express_2.createClerkClient)({
    secretKey: process.env.CLERK_SECRET_KEY,
});
// Initialize the Express application.
const app = (0, express_1.default)();
// Middleware setup
app.use(express_1.default.json()); // Parse incoming requests with JSON payloads.
app.use((0, helmet_1.default)()); // Apply security-related HTTP headers.
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" })); // Enable cross-origin policies for embedded content.
app.use((0, morgan_1.default)("common")); // Log HTTP requests in a concise format.
app.use(body_parser_1.default.json()); // Parse JSON request bodies.
app.use(body_parser_1.default.urlencoded({ extended: false })); // Parse URL-encoded request bodies.
app.use((0, cors_1.default)()); // Enable CORS for all routes.
app.use((0, express_2.clerkMiddleware)()); // Use Clerk middleware for authentication and user management.
/* ROUTES */
// Define a default route to verify server functionality.
app.get("/", (req, res) => {
    res.send("Hello World");
});
// Register route modules with their respective paths.
app.use("/courses", courseRoutes_1.default); // Routes for course-related operations.
app.use("/users/clerk", (0, express_2.requireAuth)(), userClerkRoutes_1.default); // User-related routes with authentication required.
app.use("/transactions", (0, express_2.requireAuth)(), transactionRoutes_1.default); // Transaction routes with authentication required.
app.use("/users/course-progress", (0, express_2.requireAuth)(), userCourseProgressRoutes_1.default); // Routes for tracking course progress with authentication required.
/* SERVER */
// Define the server port from the environment variable or default to 3000.
const port = process.env.PORT || 3000;
// Start the Express server LOCAL if not in production.
if (!isProduction) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
// AWS production environment setup
// Wrap the Express app in a serverless handler for AWS Lambda.
const serverlessApp = (0, serverless_http_1.default)(app);
// Export the Lambda handler function.
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.action === "seed") {
        // If the event action is "seed", seed the DynamoDB with initial data.
        yield (0, seedDynamodb_1.default)();
        return {
            statusCode: 200, // HTTP success status code.
            body: JSON.stringify({ message: "Data seeded successfully" }), // Response body indicating success.
        };
    }
    else {
        // For all other events, pass the request to the serverless Express app.
        return serverlessApp(event, context);
    }
});
exports.handler = handler;
